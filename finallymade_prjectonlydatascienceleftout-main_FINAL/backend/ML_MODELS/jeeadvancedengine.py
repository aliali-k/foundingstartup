"""
rankjeeadvancedengine_dynamic.py
=================================
JEE Advanced rank engine — DYNAMIC version.

YE FILE ALAG HAI tere original Advanced code se.
Original code ko TOUCH NAHI kiya gaya — yeh sirf nayi independent file hai.

CHANGE FROM ORIGINAL:
  Original: marks_array, crl_rank_array, category_rank_arrays sab hardcoded
            the marks_to_rank() method ke andar (sirf 2024 ka data).
  Yahan:    Same arrays ab JSON file (jee_advanced_rank_data.json) se load
            hote hain, based on user ke diye gaye year.

ALGORITHM / MATHEMATICS — BILKUL SAME RAHA (tera original logic):
  marks -> rank : numpy linear interpolation (np.interp) directly marks_array
                  se category-specific rank_array tak.
  Category scaling same reservation-ratio style jaisa tera code karta tha,
  bas ab ratios ko hum category_totals (year-wise actual numbers) se nikalte
  hain instead of fixed hardcoded ratios — taaki year-wise candidate-pool
  difference bhi reflect ho.

CASES — SAME RAHE:
  Case 1: Result out -> category_and_rank already diya -> directly use karo
  Case 2: Marks diye -> har category ke liye marks_to_rank() chalao

NAYA INPUT REQUIRED (frontend se):
  user_data = {
      "year"               : 2024,         # int or str, JSON key match karna chahiye
      "score_value"        : 245,
      "category"           : ["OPEN", "OBC-NCL", "SC", ...],
      "category_and_rank"  : {}            # agar result already out hai
  }
"""

import json
import os

import numpy as np


# ─────────────────────────────────────────────────────────────
#  DATA FILE LOCATION
# ─────────────────────────────────────────────────────────────
_DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "jee_advanced_rank_data.json")


def _load_advanced_data() -> dict:
    """
    Pura JSON file load karta hai memory mein.
    WHY a function: file missing/corrupt hone par clear error milega.
    """
    if not os.path.exists(_DATA_FILE):
        raise FileNotFoundError(
            f"JEE Advanced data file nahi mili: {_DATA_FILE}\n"
            f"Make sure jee_advanced_rank_data.json isi folder mein ho."
        )
    with open(_DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


# ─────────────────────────────────────────────────────────────
#  RANK ENGINE — DYNAMIC
# ─────────────────────────────────────────────────────────────

class Rankjeeadvanced_dynamic:

    def __init__(self, user_data):
        self.__user_dictionary   = user_data
        self.__year              = str(user_data.get("year"))
        self.__score_value       = user_data["score_value"]
        self.__category_list     = user_data["category"]
        self.__category_and_rank = user_data.get("category_and_rank", {})

        self.__marks = None
        self.__ranks = {}

        # ── DYNAMIC PART: yahi naya hai ─────────────────────────
        # year ke hisaab se marks_array, crl_rank_array, category_totals,
        # total_students JSON se nikalte hain (ek hi baar, __init__ mein)
        (
            self.__marks_array,
            self.__crl_rank_array,
            self.__category_totals,
            self.__total_students,
            self.__data_status,
        ) = self.__load_year_data()

    # ── DYNAMIC LOOKUP: YEAR SE DATA NIKALNA ───────────────────

    def __load_year_data(self):
        """
        JSON se us specific year ka block nikalta hai.

        Flow:
          full_data[year] ->
              { total_students, category_totals, marks_array, crl_rank_array }

        data_status batata hai ki yeh data "pattern_estimate" hai ya
        "estimated_placeholder" (2026 jaisa year jiska real result abhi nahi
        aaya) — isse frontend warning dikha sakta hai user ko.
        """
        full_data = _load_advanced_data()

        if self.__year not in full_data:
            available_years = [k for k in full_data.keys() if not k.startswith("_")]
            raise ValueError(
                f"Year {self.__year} JSON mein available nahi hai. "
                f"Available years: {available_years}"
            )

        year_block = full_data[self.__year]

        marks_array     = year_block["marks_array"]
        crl_rank_array  = year_block["crl_rank_array"]
        category_totals = year_block["category_totals"]
        total_students  = year_block["total_students"]
        data_status     = year_block.get("data_status", "unknown")

        return marks_array, crl_rank_array, category_totals, total_students, data_status

    # ── CATEGORY-WISE RANK ARRAY BUILD (SAME IDEA AS ORIGINAL) ─

    def __category_rank_array(self, category: str) -> list:
        """
        Original code mein category_rank_arrays hardcoded ratios use karta tha
        (OBC 0.27, SC 0.15, ST 0.075, EWS 0.10, PWD variants 0.05) seedhe
        crl_rank_array par multiply karke.

        Yahan SAME ratio-scaling idea hai, bas ratio ab year ke actual
        category_totals se nikalte hain (category_total / OPEN_total),
        taaki agar kisi year mein reservation-pool thoda alag ho to
        wahi reflect ho — formula/structure same hai, sirf ratio source
        hardcoded constant se data-driven ho gaya.

        OPEN category ke liye seedha crl_rank_array return hota hai
        (jaisa original mein tha).
        """
        if category == "OPEN":
            return self.__crl_rank_array

        open_total = self.__category_totals.get("OPEN", self.__total_students)
        cat_total  = self.__category_totals.get(category)

        if cat_total is None or open_total == 0:
            # fallback: agar category JSON mein na mile, OPEN array use karo
            return self.__crl_rank_array

        ratio = cat_total / open_total
        return [int(r * ratio) for r in self.__crl_rank_array]

    # ── MARKS → RANK (SAME np.interp LOGIC AS ORIGINAL) ────────

    def marks_to_rank(self, category):
        """
        Original method jaisa hi: np.interp(marks, marks_array, rank_array)
        Sirf arrays ab JSON-driven hain (year-specific), hardcoded nahi.
        """
        rank_array = self.__category_rank_array(category)
        result = np.interp(int(self.__score_value), self.__marks_array, rank_array)
        return int(np.ceil(result))

    # ── MAIN CALCULATE (SAME STRUCTURE AS ORIGINAL) ─────────────

    def calculate(self):
        # CASE 1: Result out → directly use karo
        if self.__category_and_rank:
            self.__marks = self.__score_value
            self.__ranks = self.__category_and_rank
        # CASE 2: marks se calculate karo
        else:
            self.__marks = self.__score_value
            for category in self.__category_list:
                self.__ranks[category] = self.marks_to_rank(category)

        # Advanced mein percentile nahi hoti → None (same as original)
        return {
            "marks"            : self.__marks,
            "category_and_rank": self.__ranks,
            "data_status"      : self.__data_status,   # NAYA: 2026 jaisa placeholder year flag karne ke liye
        }


if __name__ == "__main__":
    # ── QUICK SELF-TEST ──────────────────────────────────────
    sample_input = {
        "year"              : 2024,
        "score_value"       : 245,
        "category"          : ["OPEN", "OBC-NCL", "SC", "ST", "EWS"],
        "category_and_rank" : {},
    }
    engine = Rankjeeadvanced_dynamic(sample_input)
    output = engine.calculate()
    print("FINAL OUTPUT:")
    print(json.dumps(output, indent=2))


# # JEE Advanced → IITs only
# # CHANGE: calculate() ab {category: rank} dictionary return karta hai
# # WHY: same format as mains — college_data.py mein consistent use hoga
# import numpy as np
# class Rankjeeadvanced:
#     def __init__(self, user_data):
#         self.__user_dictionary   = user_data
#         self.__score_value       = user_data["score_value"]
#         self.__category_list     = user_data["category"]
#         self.__category_and_rank = user_data["category_and_rank"]
#         self.__marks = None
#         self.__ranks = {}
#     def marks_to_rank(self, category):
#         # JEE Advanced 2024 Official Data — IIT Madras Report
#         # Source: jeeadv.ac.in/reports/2024.pdf
#         # Total marks = 360 (Paper 1 + Paper 2)
#         marks_array = [
#             0,   40,  60,  80,  100, 109, 120, 130,
#             140, 150, 160, 170, 180, 190, 200, 210,
#             220, 230, 240, 250, 260, 280, 300, 320, 355
#         ]
#         # CRL rank corresponding to above marks (2024 official)
#         crl_rank_array = [
#             180000, 50000, 30000, 20000, 12000, 10000, 7000, 5500,
#             4500,   3500,  2800,  2200,  1700,  1200,  900,  650,
#             450,    300,   200,   120,   80,    40,    20,   5,    1
#         ]
#         # Category wise rank arrays
#         # WHY: har category ke seats alag hote hain
#         # SC ke 15% seats hain toh SC rank CRL se bahut kam hoga
#         category_rank_arrays = {
#             "OPEN"          : crl_rank_array,
#             "OBC-NCL"       : [int(r * 0.27) for r in crl_rank_array],
#             "SC"            : [int(r * 0.15) for r in crl_rank_array],
#             "ST"            : [int(r * 0.075) for r in crl_rank_array],
#             "EWS"           : [int(r * 0.10) for r in crl_rank_array],
#             "OPEN (PWD)"    : [int(r * 0.05) for r in crl_rank_array],
#             "OBC-NCL (PWD)" : [int(r * 0.05) for r in crl_rank_array],
#             "SC (PWD)"      : [int(r * 0.05) for r in crl_rank_array],
#             "ST (PWD)"      : [int(r * 0.05) for r in crl_rank_array],
#             "EWS (PWD)"     : [int(r * 0.05) for r in crl_rank_array],
#         }
#         rank_array = category_rank_arrays.get(category, crl_rank_array)
#         result = np.interp(int(self.__score_value), marks_array, rank_array)
#         return int(np.ceil(result))
#     def calculate(self):
#         # CASE 1: Result out → directly use karo
#         if self.__category_and_rank:
#             self.__marks = self.__score_value
#             self.__ranks = self.__category_and_rank
#         # CASE 2: marks se calculate karo
#         else:
#             self.__marks = self.__score_value
#             for category in self.__category_list:
#                 self.__ranks[category] = self.marks_to_rank(category)
#         # Advanced mein percentile nahi hoti → None
#         return {
#             "marks"            : self.__marks,
#             "category_and_rank": self.__ranks
#         }
# if __name__ == "__main__":
#     print("This file is not meant to run directly")