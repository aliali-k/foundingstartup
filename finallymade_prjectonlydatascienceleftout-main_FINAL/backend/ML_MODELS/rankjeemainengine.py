"""
rankjeemainengine_dynamic.py
============================
JEE Main rank engine — DYNAMIC version.
"""

import json
import math
import os
from datetime import datetime

import numpy as np


_DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "jee_mains_rank_data.json")


def _load_mains_data() -> dict:
    if not os.path.exists(_DATA_FILE):
        raise FileNotFoundError(
            f"JEE Main data file nahi mili: {_DATA_FILE}\n"
            f"Make sure jee_mains_rank_data.json isi folder mein ho."
        )
    with open(_DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _convert_date(date_str: str) -> str:
    """
    Kisi bhi common date format ko DD-MM-YYYY mein convert karo.
    e.g. "Apr 06, 2024" -> "06-04-2024"
         "06-04-2024"   -> "06-04-2024"  (already correct)
         "2024-04-06"   -> "06-04-2024"
    """
    if not date_str:
        return ""
    date_str = str(date_str).strip()

    formats_to_try = [
        "%b %d, %Y",   # Apr 06, 2024
        "%B %d, %Y",   # April 06, 2024
        "%d-%m-%Y",    # 06-04-2024  (already correct, try first)
        "%Y-%m-%d",    # 2024-04-06
        "%d/%m/%Y",    # 06/04/2024
        "%m/%d/%Y",    # 04/06/2024
        "%d %b %Y",    # 06 Apr 2024
        "%d %B %Y",    # 06 April 2024
    ]

    for fmt in formats_to_try:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime("%d-%m-%Y")
        except ValueError:
            continue

    # Agar koi format match nahi hua toh as-is return karo
    print(f"WARNING: Date format pehchana nahi gaya: '{date_str}' — as-is use karunga")
    return date_str


class rankenginejeemain_dynamic:

    def __init__(self, user_data: dict) -> None:
        self.__user_data         = user_data
        self.__year              = str(user_data.get("year"))
        self.__session           = user_data.get("session")
        self.__shift             = user_data.get("shift")
        self.__score_type        = str(user_data.get("score_type", "percentile")).lower()
        self.__score_value       = user_data.get("score_value")
        self.__category_list     = user_data.get("category", [])
        self.__category_and_rank = user_data.get("category_and_rank", {})

        self.__marks      = None
        self.__percentile = None
        self.__ranks: dict = {}

        self.__marks_array, self.__percentile_array, self.__category_totals, self.__data_status = (
            self.__load_shift_data()
        )

    def __load_shift_data(self):
        full_data = _load_mains_data()

        if "jee_main_shift_wise_data" in full_data:
            full_data = full_data["jee_main_shift_wise_data"]

        if self.__year not in full_data:
            available_years = [k for k in full_data.keys() if not k.startswith("_")]
            raise ValueError(f"Year {self.__year} JSON mein available nahi hai. Available: {available_years}")

        year_block = full_data[self.__year]

        if self.__session not in year_block:
            raise ValueError(f"Session '{self.__session}' year {self.__year} ke liye available nahi hai.")

        session_block = year_block[self.__session]

        # ── DATE FORMAT FIX ───────────────────────────────────────
        raw_date = self.__user_data.get("shift_date", "")
        date_str = _convert_date(raw_date)
        print(f"  Date conversion: '{raw_date}' -> '{date_str}'")

        if date_str and date_str in session_block:
            shift_block_container = session_block[date_str]
            print(f"  Date match mila: {date_str}")
        else:
            first_date = list(session_block.keys())[0]
            shift_block_container = session_block[first_date]
            print(f"  Date '{date_str}' nahi mila, fallback to first date: {first_date}")
        # ─────────────────────────────────────────────────────────

        if self.__shift not in shift_block_container:
            available_shifts = list(shift_block_container.keys())
            raise ValueError(f"Shift '{self.__shift}' available nahi hai. Available: {available_shifts}")

        shift_block = shift_block_container[self.__shift]

        marks_array      = shift_block["marks_array"]
        percentile_array = shift_block["percentile_array"]
        category_totals  = shift_block["category_totals"]
        data_status      = year_block.get("data_status", "unknown")

        return marks_array, percentile_array, category_totals, data_status

    def __marks_to_percentile(self) -> None:
        if self.__score_value is None:
            return
        result = np.interp(
            float(self.__score_value),
            self.__marks_array,
            self.__percentile_array
        )
        self.__percentile = round(float(result), 4)
        print(f"  [{self.__year}/{self.__session}/{self.__shift}] Marks {self.__score_value} -> Percentile: {self.__percentile}")

    def __percentile_to_rank(self, category: str) -> int:
        if self.__percentile is None:
            return 0
        total = self.__category_totals.get(category, list(self.__category_totals.values())[0])
        rank  = math.ceil((100.0 - self.__percentile) / 100.0 * total)
        return max(rank, 1)

    def calculate(self) -> dict:
        has_real_ranks = (
            bool(self.__category_and_rank)
            and any(v is not None for v in self.__category_and_rank.values())
        )

        if has_real_ranks:
            self.__ranks = {
                cat: rank
                for cat, rank in self.__category_and_rank.items()
                if rank is not None and rank > 0
            }
            print(f"  Using actual ranks: {self.__ranks}")
            return {
                "marks"            : None,
                "percentile"       : None,
                "category_and_rank": self.__ranks,
                "data_status"      : self.__data_status,
            }

        if self.__score_type == "percentile":
            self.__percentile = round(float(self.__score_value or 0), 4)
            print(f"  Using percentile: {self.__percentile}")

        elif self.__score_type == "marks":
            self.__marks = self.__score_value
            self.__marks_to_percentile()

        if self.__percentile is None or self.__percentile <= 0:
            print("ERROR: Could not determine percentile.")
            return {
                "marks"            : self.__marks,
                "percentile"       : self.__percentile,
                "category_and_rank": {},
                "data_status"      : self.__data_status,
            }

        for category in self.__category_list:
            rank = self.__percentile_to_rank(category)
            self.__ranks[category] = rank
            print(f"  {category} rank: {rank}")

        return {
            "marks"            : self.__marks,
            "percentile"       : self.__percentile,
            "category_and_rank": self.__ranks,
            "data_status"      : self.__data_status,
        }


if __name__ == "__main__":
    sample_input = {
        "year"        : 2024,
        "session"     : "Session 2",
        "shift"       : "Shift1",
        "score_type"  : "percentile",
        "score_value" : 99.7,
        "category"    : ["OPEN", "OBC-NCL", "SC", "ST", "EWS"],
        "category_and_rank": {},
        "shift_date"  : "Apr 06, 2024",
    }
    engine = rankenginejeemain_dynamic(sample_input)
    output = engine.calculate()
    print("\nFINAL OUTPUT:")
    print(json.dumps(output, indent=2))

    
    
# """
# rankjeemainengine.py
# ====================
# JEE Main ke liye rank calculate karta hai.

# 3 CASES:
#   Case 1: Result out     -> user ne actual ranks enter kiye -> directly use karo
#   Case 2: Percentile     -> percentile -> rank calculate karo
#   Case 3: Marks          -> marks -> percentile -> rank calculate karo

# MATHEMATICS:
#   marks -> percentile  : numpy linear interpolation
#   percentile -> rank   : rank = ceil((100 - percentile) / 100 * total_candidates)
# """

# import math
# import numpy as np


# # ─────────────────────────────────────────────────────────────
# #  CONSTANTS
# # ─────────────────────────────────────────────────────────────

# CATEGORY_TOTALS: dict = {
#     "OPEN"          : 412500,
#     "OBC-NCL"       : 330000,
#     "SC"            : 165000,
#     "ST"            : 82500,
#     "EWS"           : 110000,
#     "OPEN (PwD)"    : 11000,
#     "OBC-NCL (PwD)" : 11000,
#     "SC (PwD)"      : 11000,
#     "ST (PwD)"      : 11000,
#     "EWS (PwD)"     : 11000,
# }

# # Marks -> Percentile interpolation table (JEE Main pattern)
# MARKS_ARRAY: list = [
#       0,   20,   40,   60,   75,   87,  100,  110,
#     120,  132,  140,  150,  160,  170,  180,  195,
#     210,  220,  230,  240,  250,  260,  270,  280,  300
# ]

# PERCENTILE_ARRAY: list = [
#       0,    5,   15,   35,   50,   70,   75,   80,
#      85,   90,   92,   94,   95,   96,   97,   98,
#      98.5, 99,  99.2, 99.4, 99.6, 99.7, 99.8, 99.9, 100
# ]


# # ─────────────────────────────────────────────────────────────
# #  RANK ENGINE
# # ─────────────────────────────────────────────────────────────

# class rankenginejeemain:

#     def __init__(self, user_data: dict) -> None:
#         self.__user_data         = user_data
#         self.__score_type        = str(user_data.get("score_type", "percentile")).lower()
#         self.__score_value       = user_data.get("score_value")
#         self.__category_list     = user_data.get("category", [])
#         self.__category_and_rank = user_data.get("category_and_rank", {})

#         self.__marks      = None
#         self.__percentile = None
#         self.__ranks: dict = {}

#     # ── STEP 1: MARKS → PERCENTILE ────────────────────────────

#     def __marks_to_percentile(self) -> None:
#         """
#         numpy.interp se marks ko percentile mein convert karo.

#         Example:
#           marks = 150 -> interp between (140, 92) and (150, 94) -> ~94.0
#           marks = 220 -> interp between (220, 99) -> 99.0
#         """
#         if self.__score_value is None:
#             return
#         result = np.interp(
#             float(self.__score_value),
#             MARKS_ARRAY,
#             PERCENTILE_ARRAY
#         )
#         self.__percentile = round(float(result), 4)
#         print(f"  Marks {self.__score_value} -> Percentile: {self.__percentile}")

#     # ── STEP 2: PERCENTILE → RANK ──────────────────────────────

#     def __percentile_to_rank(self, category: str) -> int:
#         """
#         rank = ceil( (100 - percentile) / 100 * total_candidates )

#         Logic:
#           percentile 97.6 means 97.6% scored BELOW you
#           (100 - 97.6)% = 2.4% scored ABOVE you
#           rank = ceil(0.024 * 412500) = 9900

#           percentile 99.5 -> rank = ceil(0.005 * 412500) = 2063
#           percentile 50.0 -> rank = ceil(0.500 * 412500) = 206250
#         """
#         if self.__percentile is None:
#             return 0
#         total = CATEGORY_TOTALS.get(category, 412500)
#         rank  = math.ceil((100.0 - self.__percentile) / 100.0 * total)
#         return max(rank, 1)

#     # ── MAIN CALCULATE ─────────────────────────────────────────

#     def calculate(self) -> dict:
#         """
#         Returns:
#           {
#             marks            : float or None,
#             percentile       : float or None,
#             category_and_rank: {category: rank, ...}
#           }
#         """

#         # ── CASE 1: Result out → actual ranks use karo ─────────
#         # Real ranks = category_and_rank mein koi bhi value None nahi
#         has_real_ranks = (
#             bool(self.__category_and_rank)
#             and any(v is not None for v in self.__category_and_rank.values())
#         )

#         if has_real_ranks:
#             self.__ranks = {
#                 cat: rank
#                 for cat, rank in self.__category_and_rank.items()
#                 if rank is not None and rank > 0
#             }
#             print(f"  Using actual ranks: {self.__ranks}")
#             return {
#                 "marks"            : None,
#                 "percentile"       : None,
#                 "category_and_rank": self.__ranks,
#             }

#         # ── CASE 2: Percentile directly given ──────────────────
#         if self.__score_type == "percentile":
#             self.__percentile = round(float(self.__score_value or 0), 4)
#             print(f"  Using percentile: {self.__percentile}")

#         # ── CASE 3: Marks given → convert to percentile ────────
#         elif self.__score_type == "marks":
#             self.__marks = self.__score_value
#             self.__marks_to_percentile()

#         # Percentile sanity check
#         if self.__percentile is None or self.__percentile <= 0:
#             print("ERROR: Could not determine percentile.")
#             return {
#                 "marks"            : self.__marks,
#                 "percentile"       : self.__percentile,
#                 "category_and_rank": {},
#             }

#         # ── PERCENTILE → RANK for each eligible category ───────
#         for category in self.__category_list:
#             rank = self.__percentile_to_rank(category)
#             self.__ranks[category] = rank
#             print(f"  {category} rank: {rank}")

#         return {
#             "marks"            : self.__marks,
#             "percentile"       : self.__percentile,
#             "category_and_rank": self.__ranks,
#         }


# if __name__ == "__main__":
#     print("This file is not meant to run directly.")
#     print("Import rankenginejeemain and call .calculate()")
