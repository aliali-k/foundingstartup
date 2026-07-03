"""
link_fetcher.py
===============
College links ko college_links.csv se directly lookup karta hai.
DuckDuckGo live search hata diya — ab sab kuch CSV se aata hai.

FIX (this version):
    Pehle wala code 'if college_name in df.index' use karta tha, jo
    case-sensitive AND whitespace-sensitive hota hai. Agar JoSAA wale
    naam mein ek bhi extra space, different capitalization, ya comma
    ka farak ho (jaise "Kashmir" vs "Kashmir " vs "kashmir"), to lookup
    silently fail ho jata tha aur "Not found automatically" aata tha —
    chahe CSV mein woh row maujood ho.

    Ab dono taraf (CSV ke naam + incoming college_name) ko normalize
    karte hain pehle (lowercase + strip + collapse multiple spaces +
    remove commas) phir compare karte hain. Isse case/space/comma ka
    farak match ko nahi todega.
"""

import re
import pandas as pd
from pathlib import Path

CSV_PATH = Path(__file__).parent / "college_links.csv"

# In-memory cache — same college dobara CSV nahi padhega
COLLEGE_LINK_CACHE = {}

# CSV ek baar load karo at module import time
_links_df = None
_normalized_lookup = None  # normalized_name -> original_name mapping


def _normalize(name):
    """
    Naam ko consistent form mein laata hai taaki comparison
    case / space / comma ke farak se na toote.

    Example:
        "Islamic University of Science and Technology Kashmir"
        "islamic university of science and technology kashmir"
        "Islamic University of Science and Technology, Kashmir "
    teeno isi normalized string mein convert ho jayenge.
    """
    if name is None:
        return ""
    text = str(name).lower().strip()
    text = text.replace(",", " ")          # commas hata do
    text = re.sub(r"\s+", " ", text)       # multiple/extra spaces -> single space
    text = re.sub(r"[^\w\s&]", "", text)   # stray punctuation hata do (& rakho, jaise "M&Management")
    return text.strip()


def _load_csv():
    global _links_df, _normalized_lookup
    if _links_df is None:
        if not CSV_PATH.exists():
            print(f"WARNING: college_links.csv not found at {CSV_PATH}")
            _links_df = pd.DataFrame(columns=["college_name", "official_url", "support_url"])
            _normalized_lookup = {}
        else:
            _links_df = pd.read_csv(CSV_PATH)
            # Column name bhi normalize kar lo (case mismatch jaise 'College_Name')
            _links_df.columns = [c.strip().lower() for c in _links_df.columns]
            if "college_name" not in _links_df.columns:
                print("WARNING: 'college_name' column not found in college_links.csv")
                _links_df = pd.DataFrame(columns=["college_name", "official_url", "support_url"])
                _normalized_lookup = {}
            else:
                _links_df = _links_df.set_index("college_name")
                # normalized_name -> exact original index name
                _normalized_lookup = {
                    _normalize(name): name for name in _links_df.index
                }
    return _links_df


def _row_to_links(row):
    return {
        "official": row.get("official_url") if pd.notna(row.get("official_url")) else None,
        "support": row.get("support_url") if pd.notna(row.get("support_url")) else None,
    }


def fetch_college_reference_links(college_name, timeout=5):
    """
    College ka official aur support link return karta hai.
    CSV se lookup — no internet needed.

    Lookup order:
        1. Normalized exact match (handles case/space/comma differences)
        2. Substring match (dono directions) on normalized strings
        3. None if kuch nahi milta

    Parameters:
        college_name -> string, exact name from JoSAA_Wide_Clean.csv
        timeout      -> ignored (kept for API compatibility with old code)

    Returns:
        dict with keys 'official' and 'support'
    """
    cache_key = _normalize(college_name)

    if cache_key in COLLEGE_LINK_CACHE:
        return COLLEGE_LINK_CACHE[cache_key]

    df = _load_csv()

    links = {"official": None, "support": None}

    # 1. Normalized exact match
    if cache_key in _normalized_lookup:
        original_name = _normalized_lookup[cache_key]
        links = _row_to_links(df.loc[original_name])

    else:
        # 2. Substring match on normalized strings (dono directions)
        matched_original = None
        for normalized_csv_name, original_name in _normalized_lookup.items():
            if cache_key in normalized_csv_name or normalized_csv_name in cache_key:
                matched_original = original_name
                break

        if matched_original:
            links = _row_to_links(df.loc[matched_original])

    COLLEGE_LINK_CACHE[cache_key] = links
    return links

