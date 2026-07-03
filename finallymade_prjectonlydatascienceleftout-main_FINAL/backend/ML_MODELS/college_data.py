"""
college_data.py
===============
CSV se JoSAA opening/closing ranks padhta hai.
HS/OS quota homestatedata.py se properly match karta hai.

MATHEMATICS:
  Exponentially Weighted Least Squares Regression + Normal CDF Probability

QUOTA LOGIC:
  AI -> All India, sabke liye
  HS -> Home State, sirf us state ke eligible colleges
  OS -> Other State, baaki sabke colleges
  LA/AP -> Special, include always
  JEE Advanced -> sirf AI quota, no HS/OS
"""

import math
import re
import numpy as np
import pandas as pd
from pathlib import Path

try:
    from scipy.stats import norm as _norm  # type: ignore
    def _cdf(z: float) -> float:
        return float(_norm.cdf(z))  # type: ignore[attr-defined]
except Exception:
    def _cdf(z: float) -> float:
        return (1.0 + math.erf(z / math.sqrt(2.0))) / 2.0


# ─────────────────────────────────────────────────────────────
#  CHANCE LABEL CLEANER
# ─────────────────────────────────────────────────────────────

def clean_chance_label(label: str) -> str:
    """
    Chance label string ko final, clean format mein convert karta hai.

    Fix karta hai:
      - "Higher Chance (100.0% safe, )"  -> "Higher Chance (100.0% safe)"
      - "73.5% Chance, "                  -> "73.5% Chance"
      - "( , )" ya khaali brackets        -> hata diya jaata hai
      - double space, trailing comma/space -> single clean string

    Ye function HAMESHA last step pe call hota hai, taaki chahe label
    kahin se bhi (kisi bhi function/path se) bana ho, final output
    always ek jaisa, saaf format mein PDF/table mein jaaye.
    """
    if not isinstance(label, str):
        return str(label)

    text = label

    # 1. Empty/dangling parts jaise ", )" ya ",)" ya "( )" hata do
    text = re.sub(r",\s*\)", ")", text)          # ", )" -> ")"
    text = re.sub(r"\(\s*,", "(", text)           # "( ," -> "("
    text = re.sub(r"\(\s*\)", "", text)           # "()" khaali -> hata do

    # 2. Multiple commas ek saath (", ,") -> single comma
    text = re.sub(r",\s*,", ",", text)

    # 3. Trailing comma/space pehle closing bracket se pehle
    text = re.sub(r",\s+\)", ")", text)

    # 4. Double/extra spaces ek space mein
    text = re.sub(r"\s{2,}", " ", text)

    # 5. Opening bracket ke baad agar space reh gaya ho ( "( 99%" -> "(99%" )
    text = re.sub(r"\(\s+", "(", text)

    # 6. Closing bracket se pehle agar space reh gaya ho
    text = re.sub(r"\s+\)", ")", text)

    # 7. Trailing comma ya space poore string ke aakhir mein
    text = text.strip().rstrip(",").strip()

    return text


# homestatedata se df_exploded import karo
try:
    from homestatedata import df_exploded as _hs_df
    _HS_LOADED = True
except Exception:
    _hs_df     = None
    _HS_LOADED = False
    print("WARNING: homestatedata.py not found — HS quota will be skipped")

# ─────────────────────────────────────────────────────────────
#  CONFIG
# ─────────────────────────────────────────────────────────────

CSV_PATH = Path(__file__).parent / "JoSAA_Wide_Clean.csv"

MAINS_INSTITUTE_TYPES    = ["NIT", "IIIT", "GFTI"]
ADVANCED_INSTITUTE_TYPES = ["IIT"]

ALL_YEARS  = list(range(2016, 2026))
LAMBDA     = 0.3
BASE_YEAR  = 2016
MIN_SIGMA  = 500


# ─────────────────────────────────────────────────────────────
#  NAME NORMALIZATION  (naya helper — matching ke liye zaroori)
# ─────────────────────────────────────────────────────────────

def _normalize_name(name: str) -> str:
    """
    College name ko ek consistent, comparable form mein convert karta hai.
    - lowercase
    - sab punctuation (comma, period, ampersand, hyphen) hata do
    - extra spaces single space mein convert
    Isse "Punjab Engineering College, Chandigarh" aur
    "punjab engineering college chandigarh" dono same ban jaate hain.
    """
    if not isinstance(name, str):
        return ""
    text = name.lower()
    text = text.replace("&", "and")
    text = re.sub(r"[,.\-()]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ─────────────────────────────────────────────────────────────
#  HOME STATE COLLEGE LOOKUP
# ─────────────────────────────────────────────────────────────

def get_hs_colleges(user_state: str) -> list:
    """
    df_exploded se user ke state ke eligible HS colleges nikalo.
    Returns list of NORMALIZED college name strings (set-like, deduped).
    """
    if not _HS_LOADED or _hs_df is None:
        return []

    # State match bhi normalize karke karo, taaki "Jammu and Kashmir" vs
    # "Jammu And Kashmir" jaisa case-mismatch kabhi fail na ho.
    user_state_norm = _normalize_name(user_state)

    state_col_norm = _hs_df["State_Code_Of_Eligibility"].apply(_normalize_name)
    filtered = _hs_df[state_col_norm == user_state_norm]

    colleges_raw = filtered["Eligible_Colleges"].dropna().tolist()
    colleges_norm = [_normalize_name(c) for c in colleges_raw]
    return colleges_norm


def is_hs_college(college_name: str, hs_colleges: list) -> bool:
    """
    College name ko HS list se match karo — EXACT normalized match.
    """
    college_norm = _normalize_name(college_name)
    return college_norm in hs_colleges


# ─────────────────────────────────────────────────────────────
#  EXPONENTIAL WEIGHT
# ─────────────────────────────────────────────────────────────

def get_exp_weight(year: int) -> float:
    return float(np.exp(LAMBDA * (year - BASE_YEAR)))


# ─────────────────────────────────────────────────────────────
#  CORE: WLS + NORMAL CDF
# ─────────────────────────────────────────────────────────────

def calculate_trend_probability(user_rank: int, row: pd.Series):
    years_data = []
    open_data  = []
    close_data = []
    weights    = []

    for year in ALL_YEARS:
        o = row.get(f"open_{year}")
        c = row.get(f"close_{year}")
        try:
            o_int = int(float(str(o)))
            c_int = int(float(str(c)))
        except (ValueError, TypeError, Exception):
            continue
        if pd.isna(o) or pd.isna(c):
            continue
        if o_int <= 0 or c_int <= 0:
            continue
        years_data.append(year)
        open_data.append(o_int)
        close_data.append(c_int)
        weights.append(get_exp_weight(year))

    if len(years_data) < 2:
        if len(years_data) == 1:
            o = open_data[0]
            c = close_data[0]
            if user_rank <= o:
                return "Higher Chance (100.0% safe)", 100.0
            elif user_rank <= c:
                pos = (user_rank - o) / max(c - o, 1)
                pct = round((1 - pos) * 79 + 21, 1)
                if pct >= 85:
                    return f"Higher Chance ({pct}% safe)", pct
                return f"{pct}% Chance", pct
        return "Data Unavailable", 0

    years_arr = np.array(years_data, dtype=float)
    close_arr = np.array(close_data, dtype=float)
    w_arr     = np.array(weights,    dtype=float)

    X   = np.column_stack([years_arr, np.ones(len(years_arr))])
    W   = np.diag(w_arr)
    XtW = X.T @ W

    try:
        beta = np.linalg.lstsq(XtW @ X, XtW @ close_arr, rcond=None)[0]
    except np.linalg.LinAlgError:
        return "Data Unavailable", 0

    m, c            = beta
    predicted_close = float(m * 2026 + c)
    fitted          = m * years_arr + c
    residuals       = close_arr - fitted
    weighted_var    = float(np.average(residuals ** 2, weights=w_arr))
    sigma           = max(float(np.sqrt(weighted_var)), MIN_SIGMA)

    z_score     = (predicted_close - user_rank) / sigma
    probability = round(_cdf(z_score) * 100, 1)

    if probability >= 85:
        return f"Higher Chance ({probability}% safe)", probability
    elif probability >= 20:
        return f"{probability}% Chance", probability
    else:
        return "Data Unavailable", 0


# ─────────────────────────────────────────────────────────────
#  MAIN FILTER
# ─────────────────────────────────────────────────────────────

def filter_csv_data(user_data: dict) -> pd.DataFrame:

    if not Path(CSV_PATH).exists():
        print(f"ERROR: CSV not found at {CSV_PATH}")
        return pd.DataFrame()

    df = pd.read_csv(CSV_PATH)

    exam_type         = str(user_data.get("exam_type", "jee main")).lower()
    gender            = str(user_data.get("gender", "MALE")).upper()
    category_and_rank = user_data.get("category_and_rank", {})
    user_state        = str(user_data.get("state") or "").strip()

    if not category_and_rank:
        print("No ranks provided.")
        return pd.DataFrame()

    # Institute type filter
    allowed_types = (
        ADVANCED_INSTITUTE_TYPES
        if exam_type == "jee advanced"
        else MAINS_INSTITUTE_TYPES
    )
    df = df[df["institute_type"].isin(allowed_types)].copy()

    # Gender filter
    if gender == "FEMALE":
        df = df[df["gender"].isin([
            "Gender-Neutral",
            "Female-only (including Supernumerary)"
        ])].copy()
    else:
        df = df[df["gender"] == "Gender-Neutral"].copy()

    # JEE Advanced mein sirf AI quota (HS/OS concept hi nahi hai Advanced mein)
    if exam_type == "jee advanced":
        df = df[df["quota"] == "AI"].copy()

    # Home state colleges list (only for JEE Main)
    hs_colleges = []
    if exam_type == "jee main" and user_state:
        hs_colleges = get_hs_colleges(user_state)
        print(f"  HS colleges for {user_state}: {len(hs_colleges)} found")

    all_results = []

    for category, user_rank in category_and_rank.items():

        if user_rank is None:
            continue

        cat_df = df[df["seat_type"] == category].copy()
        if cat_df.empty:
            continue

        for _, row in cat_df.iterrows():
            quota       = str(row["quota"]).strip().upper()
            college     = str(row["institute"])
            quota_label = quota  # PDF mein dikhega

            # ── QUOTA LOGIC (JEE Main only) ───────────────────
            if exam_type == "jee main":
                if quota == "AI":
                    quota_label = "AI"

                elif quota == "HS":
                    if not is_hs_college(college, hs_colleges):
                        continue
                    quota_label = "HS"

                elif quota == "OS":
                    if is_hs_college(college, hs_colleges):
                        continue
                    quota_label = "OS"

                else:
                    quota_label = quota

            # ── CHANCE CALCULATE ──────────────────────────────
            chance_label, chance_value = calculate_trend_probability(
                user_rank, row
            )
            chance_label = clean_chance_label(chance_label)

            if chance_value < 20:
                continue

            # Latest year ke actual ranks for display
            display_open  = None
            display_close = None
            for year in range(2025, 2015, -1):
                o = row.get(f"open_{year}")
                c = row.get(f"close_{year}")
                try:
                    if not pd.isna(o) and not pd.isna(c):
                        display_open  = int(o)
                        display_close = int(c)
                        break
                except (ValueError, TypeError):
                    continue

            all_results.append({
                "Institute"      : college,
                "Program"        : str(row["branch"]),
                "Institute Type" : str(row["institute_type"]),
                "Quota"          : quota_label,
                "Category"       : category,
                "Gender Pool"    : str(row["gender"]),
                "Your Rank"      : user_rank,
                "Opening Rank"   : display_open  if display_open  else 0,
                "Closing Rank"   : display_close if display_close else 0,
                "Chance"         : chance_label,
                "Chance Value"   : chance_value,
            })

    if not all_results:
        print("No results found above 20% threshold.")
        return pd.DataFrame()

    result_df = pd.DataFrame(all_results)

    # ── HS PRIORITY ──
    if exam_type == "jee main" and not result_df.empty:
        has_hs = (
            result_df[result_df["Quota"] == "HS"]
            .groupby(["Institute", "Program", "Category"])
            .size()
        )
        hs_keys = set(has_hs.index.tolist())

        def _drop_redundant_os(r):
            if r["Quota"] == "OS" and (r["Institute"], r["Program"], r["Category"]) in hs_keys:
                return False
            return True

        result_df = result_df[result_df.apply(_drop_redundant_os, axis=1)].reset_index(drop=True)

    result_df = result_df.sort_values(
        by=["Chance Value", "Closing Rank"],
        ascending=[False, True]
    ).reset_index(drop=True)
    result_df = result_df.drop(columns=["Chance Value"])

    print(f"Total programs found: {len(result_df)}")
    return result_df


# ─────────────────────────────────────────────────────────────
#  DISPLAY
# ─────────────────────────────────────────────────────────────

def display_results(df: pd.DataFrame, user_name: str) -> None:
    if df.empty:
        print("No results to display.")
        return

    print("\n" + "=" * 80)
    print(f"  JEE PREDICTION RESULTS FOR: {user_name.upper()}")
    print("=" * 80)

    for inst_type in df["Institute Type"].unique():
        print(f"\n{'=' * 80}")
        print(f"  INSTITUTE TYPE: {inst_type}")
        print(f"{'=' * 80}")
        inst_df = df[df["Institute Type"] == inst_type]
        for category in inst_df["Category"].unique():
            print(f"\n  CATEGORY: {category}")
            print(f"  {'─' * 70}")
            cat_df     = inst_df[inst_df["Category"] == category].copy()
            display_df = cat_df[[
                "Institute", "Program", "Quota", "Gender Pool",
                "Your Rank", "Opening Rank", "Closing Rank", "Chance"
            ]]
            print(display_df.to_string(index=False))

    print(f"\n{'=' * 80}")
    print(f"  Total Programs Found: {len(df)}")
    print("=" * 80)


# ─────────────────────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────────────────────

def run_college_prediction(user_data: dict) -> pd.DataFrame:
    user_name  = str(user_data.get("name", "Student"))
    results_df = filter_csv_data(user_data)
    display_results(results_df, user_name)
    return results_df


if __name__ == "__main__":
    print("This file is not meant to run directly.")
    print("Call run_college_prediction(user_data) from main.py")







































































































































































































































































































































# """
# college_data.py
# ===============
# CSV se JoSAA opening/closing ranks padhta hai.
# HS/OS quota homestatedata.py se properly match karta hai.

# MATHEMATICS:
#   Exponentially Weighted Least Squares Regression + Normal CDF Probability

# QUOTA LOGIC:
#   AI -> All India, sabke liye
#   HS -> Home State, sirf us state ke eligible colleges
#   OS -> Other State, baaki sabke colleges
#   LA/AP -> Special, include always
#   JEE Advanced -> sirf AI quota, no HS/OS
# """

# import math
# import re
# import numpy as np
# import pandas as pd
# from pathlib import Path

# try:
#     from scipy.stats import norm as _norm  # type: ignore
#     def _cdf(z: float) -> float:
#         return float(_norm.cdf(z))  # type: ignore[attr-defined]
# except Exception:
#     def _cdf(z: float) -> float:
#         return (1.0 + math.erf(z / math.sqrt(2.0))) / 2.0


# # ─────────────────────────────────────────────────────────────
# #  CHANCE LABEL CLEANER
# # ─────────────────────────────────────────────────────────────

# def clean_chance_label(label: str) -> str:
#     """
#     Chance label string ko final, clean format mein convert karta hai.

#     Fix karta hai:
#       - "Higher Chance (100.0% safe, )"  -> "Higher Chance (100.0% safe)"
#       - "73.5% Chance, "                  -> "73.5% Chance"
#       - "( , )" ya khaali brackets        -> hata diya jaata hai
#       - double space, trailing comma/space -> single clean string

#     Ye function HAMESHA last step pe call hota hai, taaki chahe label
#     kahin se bhi (kisi bhi function/path se) bana ho, final output
#     always ek jaisa, saaf format mein PDF/table mein jaaye.
#     """
#     if not isinstance(label, str):
#         return str(label)

#     text = label

#     # 1. Empty/dangling parts jaise ", )" ya ",)" ya "( )" hata do
#     text = re.sub(r",\s*\)", ")", text)          # ", )" -> ")"
#     text = re.sub(r"\(\s*,", "(", text)           # "( ," -> "("
#     text = re.sub(r"\(\s*\)", "", text)           # "()" khaali -> hata do

#     # 2. Multiple commas ek saath (", ,") -> single comma
#     text = re.sub(r",\s*,", ",", text)

#     # 3. Trailing comma/space pehle closing bracket se pehle
#     text = re.sub(r",\s+\)", ")", text)

#     # 4. Double/extra spaces ek space mein
#     text = re.sub(r"\s{2,}", " ", text)

#     # 5. Opening bracket ke baad agar space reh gaya ho ( "( 99%" -> "(99%" )
#     text = re.sub(r"\(\s+", "(", text)

#     # 6. Closing bracket se pehle agar space reh gaya ho
#     text = re.sub(r"\s+\)", ")", text)

#     # 7. Trailing comma ya space poore string ke aakhir mein
#     text = text.strip().rstrip(",").strip()

#     return text


# # homestatedata se df_exploded import karo
# try:
#     from homestatedata import df_exploded as _hs_df
#     _HS_LOADED = True
# except Exception:
#     _hs_df     = None
#     _HS_LOADED = False
#     print("WARNING: homestatedata.py not found — HS quota will be skipped")

# # ─────────────────────────────────────────────────────────────
# #  CONFIG
# # ─────────────────────────────────────────────────────────────

# CSV_PATH = Path(__file__).parent / "JoSAA_Wide_Clean.csv"

# MAINS_INSTITUTE_TYPES    = ["NIT", "IIIT", "GFTI"]
# ADVANCED_INSTITUTE_TYPES = ["IIT"]

# ALL_YEARS  = list(range(2016, 2026))
# LAMBDA     = 0.3
# BASE_YEAR  = 2016
# MIN_SIGMA  = 500


# # ─────────────────────────────────────────────────────────────
# #  NAME NORMALIZATION  (naya helper — matching ke liye zaroori)
# # ─────────────────────────────────────────────────────────────

# def _normalize_name(name: str) -> str:
#     """
#     College name ko ek consistent, comparable form mein convert karta hai.
#     - lowercase
#     - sab punctuation (comma, period, ampersand, hyphen) hata do
#     - extra spaces single space mein convert
#     Isse "Punjab Engineering College, Chandigarh" aur
#     "punjab engineering college chandigarh" dono same ban jaate hain.
#     """
#     if not isinstance(name, str):
#         return ""
#     text = name.lower()
#     text = text.replace("&", "and")
#     text = re.sub(r"[,.\-()]", " ", text)
#     text = re.sub(r"\s+", " ", text).strip()
#     return text


# # ─────────────────────────────────────────────────────────────
# #  HOME STATE COLLEGE LOOKUP
# # ─────────────────────────────────────────────────────────────

# def get_hs_colleges(user_state: str) -> list:
#     """
#     df_exploded se user ke state ke eligible HS colleges nikalo.
#     Returns list of NORMALIZED college name strings (set-like, deduped).
#     """
#     if not _HS_LOADED or _hs_df is None:
#         return []

#     # State match bhi normalize karke karo, taaki "Jammu and Kashmir" vs
#     # "Jammu And Kashmir" jaisa case-mismatch kabhi fail na ho.
#     user_state_norm = _normalize_name(user_state)

#     state_col_norm = _hs_df["State_Code_Of_Eligibility"].apply(_normalize_name)
#     filtered = _hs_df[state_col_norm == user_state_norm]

#     colleges_raw = filtered["Eligible_Colleges"].dropna().tolist()
#     colleges_norm = [_normalize_name(c) for c in colleges_raw]
#     return colleges_norm


# def is_hs_college(college_name: str, hs_colleges: list) -> bool:
#     """
#     College name ko HS list se match karo — EXACT normalized match.

#     PEHLE wala bug: hs[:20] in college_lower (first-20-char partial match)
#     galat tha kyunki har NIT ka naam "National Institute of Technology..."
#     se start hota hai — isliye koi bhi NIT kisi bhi state se match ho
#     jaata tha, jo bilkul galat result deta tha.

#     AB: poora naam normalize karke EXACT compare hota hai, taaki sirf
#     sahi college match ho, doosra koi nahi.
#     """
#     college_norm = _normalize_name(college_name)
#     return college_norm in hs_colleges


# # ─────────────────────────────────────────────────────────────
# #  EXPONENTIAL WEIGHT
# # ─────────────────────────────────────────────────────────────

# def get_exp_weight(year: int) -> float:
#     return float(np.exp(LAMBDA * (year - BASE_YEAR)))


# # ─────────────────────────────────────────────────────────────
# #  CORE: WLS + NORMAL CDF
# # ─────────────────────────────────────────────────────────────

# def calculate_trend_probability(user_rank: int, row: pd.Series):
#     years_data = []
#     open_data  = []
#     close_data = []
#     weights    = []

#     for year in ALL_YEARS:
#         o = row.get(f"open_{year}")
#         c = row.get(f"close_{year}")
#         try:
#             o_int = int(float(str(o)))
#             c_int = int(float(str(c)))
#         except (ValueError, TypeError, Exception):
#             continue
#         if pd.isna(o) or pd.isna(c):
#             continue
#         if o_int <= 0 or c_int <= 0:
#             continue
#         years_data.append(year)
#         open_data.append(o_int)
#         close_data.append(c_int)
#         weights.append(get_exp_weight(year))

#     if len(years_data) < 2:
#         if len(years_data) == 1:
#             o = open_data[0]
#             c = close_data[0]
#             if user_rank <= o:
#                 # Opening rank se better ya equal -> seat lagbhag confirm,
#                 # isliye full 100% (sirf "Limited Data" tag laga rahe hain
#                 # taaki pata chale prediction sirf 1 saal ke data pe based hai)
#                 return "Higher Chance (100.0% safe, Limited Data)", 100.0
#             elif user_rank <= c:
#                 # Opening aur Closing ke beech -> proportional percentage
#                 pos = (user_rank - o) / max(c - o, 1)
#                 pct = round((1 - pos) * 79 + 21, 1)
#                 return f"{pct}% Chance (Limited Data)", pct
#             elif user_rank <= c + MIN_SIGMA:
#                 return "Borderline (0.5% Chance)", 0.5
#         return "Data Unavailable", 0

#     years_arr = np.array(years_data, dtype=float)
#     close_arr = np.array(close_data, dtype=float)
#     w_arr     = np.array(weights,    dtype=float)

#     X   = np.column_stack([years_arr, np.ones(len(years_arr))])
#     W   = np.diag(w_arr)
#     XtW = X.T @ W

#     try:
#         beta = np.linalg.lstsq(XtW @ X, XtW @ close_arr, rcond=None)[0]
#     except np.linalg.LinAlgError:
#         return "Data Unavailable", 0

#     m, c            = beta
#     predicted_close = float(m * 2026 + c)
#     fitted          = m * years_arr + c
#     residuals       = close_arr - fitted
#     weighted_var    = float(np.average(residuals ** 2, weights=w_arr))
#     sigma           = max(float(np.sqrt(weighted_var)), MIN_SIGMA)

#     z_score     = (predicted_close - user_rank) / sigma
#     probability = round(_cdf(z_score) * 100, 1)

#     if probability >= 85:
#         return f"Higher Chance ({probability}% safe)", probability
#     elif probability >= 20:
#         return f"{probability}% Chance", probability
#     elif probability >= 5:
#         return "Borderline (0.5% Chance)", 0.5
#     else:
#         return "Not Sure - Better Luck!", 0


# # ─────────────────────────────────────────────────────────────
# #  MAIN FILTER
# # ─────────────────────────────────────────────────────────────

# def filter_csv_data(user_data: dict) -> pd.DataFrame:

#     if not Path(CSV_PATH).exists():
#         print(f"ERROR: CSV not found at {CSV_PATH}")
#         return pd.DataFrame()

#     df = pd.read_csv(CSV_PATH)

#     exam_type         = str(user_data.get("exam_type", "jee main")).lower()
#     gender            = str(user_data.get("gender", "MALE")).upper()
#     category_and_rank = user_data.get("category_and_rank", {})
#     user_state        = str(user_data.get("state") or "").strip()

#     if not category_and_rank:
#         print("No ranks provided.")
#         return pd.DataFrame()

#     # Institute type filter
#     allowed_types = (
#         ADVANCED_INSTITUTE_TYPES
#         if exam_type == "jee advanced"
#         else MAINS_INSTITUTE_TYPES
#     )
#     df = df[df["institute_type"].isin(allowed_types)].copy()

#     # Gender filter
#     if gender == "FEMALE":
#         df = df[df["gender"].isin([
#             "Gender-Neutral",
#             "Female-only (including Supernumerary)"
#         ])].copy()
#     else:
#         df = df[df["gender"] == "Gender-Neutral"].copy()

#     # JEE Advanced mein sirf AI quota (HS/OS concept hi nahi hai Advanced mein)
#     if exam_type == "jee advanced":
#         df = df[df["quota"] == "AI"].copy()

#     # Home state colleges list (only for JEE Main)
#     hs_colleges: list = []
#     if exam_type == "jee main" and user_state:
#         hs_colleges = get_hs_colleges(user_state)
#         print(f"  HS colleges for {user_state}: {len(hs_colleges)} found")

#     all_results = []

#     for category, user_rank in category_and_rank.items():

#         if user_rank is None:
#             continue

#         cat_df = df[df["seat_type"] == category].copy()
#         if cat_df.empty:
#             continue

#         for _, row in cat_df.iterrows():
#             quota       = str(row["quota"]).strip().upper()
#             college     = str(row["institute"])
#             quota_label = quota  # PDF mein dikhega

#             # ── QUOTA LOGIC (JEE Main only) ───────────────────
#             if exam_type == "jee main":
#                 if quota == "AI":
#                     # All India — always include, state se koi farak nahi
#                     quota_label = "AI"

#                 elif quota == "HS":
#                     # Home State — sirf tab include karo jab
#                     # college user ke state ke HS list mein ho (EXACT match ab)
#                     if not is_hs_college(college, hs_colleges):
#                         continue
#                     quota_label = "HS"

#                 elif quota == "OS":
#                     # Other State — sirf tab include karo jab
#                     # college user ke state ki HS list mein NA ho
#                     if is_hs_college(college, hs_colleges):
#                         continue
#                     quota_label = "OS"

#                 else:
#                     # LA, AP etc — include always
#                     quota_label = quota

#             # ── CHANCE CALCULATE ──────────────────────────────
#             chance_label, chance_value = calculate_trend_probability(
#                 user_rank, row
#             )
#             chance_label = clean_chance_label(chance_label)

#             if chance_value < 20 and chance_value != 0.5:
#                 continue

#             # Latest year ke actual ranks for display
#             display_open  = None
#             display_close = None
#             for year in range(2025, 2015, -1):
#                 o = row.get(f"open_{year}")
#                 c = row.get(f"close_{year}")
#                 try:
#                     if not pd.isna(o) and not pd.isna(c):
#                         display_open  = int(o)
#                         display_close = int(c)
#                         break
#                 except (ValueError, TypeError):
#                     continue

#             all_results.append({
#                 "Institute"      : college,
#                 "Program"        : str(row["branch"]),
#                 "Institute Type" : str(row["institute_type"]),
#                 "Quota"          : quota_label,
#                 "Category"       : category,
#                 "Gender Pool"    : str(row["gender"]),
#                 "Your Rank"      : user_rank,
#                 "Opening Rank"   : display_open  if display_open  else 0,
#                 "Closing Rank"   : display_close if display_close else 0,
#                 "Chance"         : chance_label,
#                 "Chance Value"   : chance_value,
#             })

#     if not all_results:
#         print("No results found above 20% threshold.")
#         return pd.DataFrame()

#     result_df = pd.DataFrame(all_results)

#     # ── HS PRIORITY: agar ek college mein HS row available hai, OS row
#     #    usi college-branch-category ke liye drop kar do. Real JOSAA mein
#     #    home-state student ko OS seat allot hi nahi hoti jab HS available ho. ──
#     if exam_type == "jee main" and not result_df.empty:
#         has_hs = (
#             result_df[result_df["Quota"] == "HS"]
#             .groupby(["Institute", "Program", "Category"])
#             .size()
#         )
#         hs_keys = set(has_hs.index.tolist())

#         def _drop_redundant_os(r):
#             if r["Quota"] == "OS" and (r["Institute"], r["Program"], r["Category"]) in hs_keys:
#                 return False
#             return True

#         result_df = result_df[result_df.apply(_drop_redundant_os, axis=1)].reset_index(drop=True)

#     result_df = result_df.sort_values(
#         by=["Chance Value", "Closing Rank"],
#         ascending=[False, True]
#     ).reset_index(drop=True)
#     result_df = result_df.drop(columns=["Chance Value"])

#     print(f"Total programs found: {len(result_df)}")
#     return result_df


# # ─────────────────────────────────────────────────────────────
# #  DISPLAY
# # ─────────────────────────────────────────────────────────────

# def display_results(df: pd.DataFrame, user_name: str) -> None:
#     if df.empty:
#         print("No results to display.")
#         return

#     print("\n" + "=" * 80)
#     print(f"  JEE PREDICTION RESULTS FOR: {user_name.upper()}")
#     print("=" * 80)

#     for inst_type in df["Institute Type"].unique():
#         print(f"\n{'=' * 80}")
#         print(f"  INSTITUTE TYPE: {inst_type}")
#         print(f"{'=' * 80}")
#         inst_df = df[df["Institute Type"] == inst_type]
#         for category in inst_df["Category"].unique():
#             print(f"\n  CATEGORY: {category}")
#             print(f"  {'─' * 70}")
#             cat_df     = inst_df[inst_df["Category"] == category].copy()
#             display_df = cat_df[[
#                 "Institute", "Program", "Quota", "Gender Pool",
#                 "Your Rank", "Opening Rank", "Closing Rank", "Chance"
#             ]]
#             print(display_df.to_string(index=False))

#     print(f"\n{'=' * 80}")
#     print(f"  Total Programs Found: {len(df)}")
#     print("=" * 80)


# # ─────────────────────────────────────────────────────────────
# #  ENTRY POINT
# # ─────────────────────────────────────────────────────────────

# def run_college_prediction(user_data: dict) -> pd.DataFrame:
#     user_name  = str(user_data.get("name", "Student"))
#     results_df = filter_csv_data(user_data)
#     display_results(results_df, user_name)
#     return results_df


# if __name__ == "__main__":
#     print("This file is not meant to run directly.")
#     print("Call run_college_prediction(user_data) from main.py")
