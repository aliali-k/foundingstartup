from homestatedata import df_exploded
import pandas as pd


states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
    'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh',
    'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
    'Daman and Diu', 'Dadra and Nagar Haveli'
]

valid_categories = ['EWS', 'EWS (PwD)', 'OBC-NCL', 'OBC-NCL (PwD)', 'OPEN', 'OPEN (PwD)', 'SC', 'SC (PwD)', 'ST', 'ST (PwD)']

eligible_sections = {
    "OPEN"         : ["OPEN"],
    "EWS"          : ["OPEN", "EWS"],
    "OBC-NCL"      : ["OPEN", "OBC-NCL"],
    "SC"           : ["OPEN", "SC"],
    "ST"           : ["OPEN", "ST"],
    "OPEN (PwD)"   : ["OPEN", "OPEN (PwD)"],
    "EWS (PwD)"    : ["OPEN", "EWS", "OPEN (PwD)", "EWS (PwD)"],
    "OBC-NCL (PwD)": ["OPEN", "OBC-NCL", "OPEN (PwD)", "OBC-NCL (PwD)"],
    "SC (PwD)"     : ["OPEN", "SC", "OPEN (PwD)", "SC (PwD)"],
    "ST (PwD)"     : ["OPEN", "ST", "OPEN (PwD)", "ST (PwD)"]
}



class user_input:
    def __init__(self):
        self.__exam_type          = None
        self.__name               = None
        self.__score_type         = None
        self.__score_value        = None
        self.__percentile         = None
        self.__crl_rank           = None
        self.__category           = []
        self.__category_and_rank  = {}
        self.__gender             = None
        self.__state_of_education = None
        self.__year               = None

    # ── GETTERS ────────────────────────────────
    @property
    def user_data(self):
        return {
            "exam_type"         : self.__exam_type,
            "name"              : self.__name,
            "score_type"        : self.__score_type,
            "score_value"       : self.__score_value,
            "percentile"        : self.__percentile,
            "crl_rank"          : self.__crl_rank,
            "category"          : self.__category,
            "category_and_rank" : self.__category_and_rank,
            "gender"            : self.__gender,
            "state"             : self.__state_of_education,
            "year"              : self.__year,
            # PANDAS SHOWCASE: DataFrame directly pass ho raha hai
            # college_data.py mein is DataFrame se HS colleges match honge
            "state_college_map" : df_exploded
        }

    @property
    def exam_type(self):
        return self.__exam_type

    # ── SETTERS ────────────────────────────────
    @exam_type.setter
    def exam_type(self, value):
        name = value.strip().lower()
        if name not in ["jee main", "jee advanced"]:
            raise ValueError("INVALID EXAM TYPE")
        self.__exam_type = name

    # ── COLLECT ────────────────────────────────
    def collect(self):

        # ── EXAM TYPE ──────────────────────────
        print("*****SELECT EXAM TYPE*****")
        print("1. JEE MAIN    (NITs, IIITs, GFTIs)")
        print("2. JEE ADVANCED (IITs)")
        while True:
            choice = input("ENTER 1 OR 2: ").strip()
            if choice == "1":
                self.exam_type = "jee main"
                break
            elif choice == "2":
                self.exam_type = "jee advanced"
                break
            else:
                print("INVALID CHOICE, TRY AGAIN")
        print("EXAM TYPE SELECTED SUCCESSFULLY\n")

        # ── NAME ───────────────────────────────
        while True:
            name = input("ENTER YOUR NAME: ").strip()
            if name == "":
                print("NAME CANNOT BE EMPTY, TRY AGAIN")
            else:
                self.__name = name
                break
        print("NAME ENTERED SUCCESSFULLY\n")

        # ── YEAR ───────────────────────────────
        # WHY: college_data.py mein us saal ka JOSAA data scrape hoga
        print("*****ENTER CURRENT YEAR FOR JOSAA DATA*****")
        while True:
            year = input("ENTER YOUR CURRENT YEAR : ").strip()
            if year.isdigit() and 2017 <= int(year) <= 2026:
                self.__year = int(year)-1
                break
            else:
                print("INVALID YEAR, ENTER BETWEEN 2016-2026")
        print("YEAR SET SUCCESSFULLY\n")

        # ── SCORE TYPE ─────────────────────────
        if self.__exam_type == "jee main":
            print("*****SELECT SCORE TYPE*****")
            while True:
                score_type = input(
                    "ENTER SCORE TYPE (PERCENTILE / MARKS): "
                ).strip().lower()
                if score_type not in ["percentile", "marks"]:
                    print("INVALID, ENTER 'percentile' OR 'marks'")
                else:
                    self.__score_type = score_type
                    break
        else:
            self.__score_type = "marks"
            print("JEE ADVANCED → SCORE TYPE AUTO SET TO: MARKS\n")

        # ── SCORE VALUE ────────────────────────
        while True:
            try:
                score_value = float(input("ENTER YOUR SCORE VALUE: ").strip())
                if self.__score_type == "percentile":
                    if 0 <= score_value <= 100:
                        self.__score_value = score_value
                        break
                    else:
                        print("PERCENTILE MUST BE 0-100, TRY AGAIN")
                elif self.__exam_type == "jee main":
                    if 0 <= score_value <= 300:
                        self.__score_value = score_value
                        break
                    else:
                        print("JEE MAIN MARKS MUST BE 0-300, TRY AGAIN")
                else:
                    if 0 <= score_value <= 360:
                        self.__score_value = score_value
                        break
                    else:
                        print("JEE ADVANCED MARKS MUST BE 0-360, TRY AGAIN")
            except ValueError:
                print("INVALID INPUT, ENTER A VALID NUMBER")
        print("SCORE ENTERED SUCCESSFULLY\n")

        # ── PERCENTILE (only mains + marks) ────
        if self.__exam_type == "jee main" and self.__score_type == "marks":
            print("IF YOU KNOW YOUR PERCENTILE ENTER IT, ELSE ENTER -1")
            while True:
                try:
                    percentile = float(
                        input("ENTER PERCENTILE (-1 if unknown): ").strip()
                    )
                    if percentile == -1:
                        self.__percentile = None
                        break
                    elif 0 <= percentile <= 100:
                        self.__percentile = percentile
                        break
                    else:
                        print("PERCENTILE MUST BE 0-100, TRY AGAIN")
                except ValueError:
                    print("INVALID INPUT, ENTER A VALID NUMBER")
        else:
            self.__percentile = None
        print("PERCENTILE SET SUCCESSFULLY\n")

        # ── CATEGORY AND RANK ──────────────────
        print("IS YOUR JEE RESULT OUT? (YES / NO)")
        result = input("ENTER: ").strip().upper()
        print("VALID CATEGORIES:", ", ".join(valid_categories))

        if result == "YES":
            # Result out → actual ranks enter karo
            # FORMAT: "OBC-NCL:500"
            print("ENTER CATEGORY:RANK PAIRS ONE BY ONE")
            print("FORMAT → OBC-NCL:500")
            print("TYPE 'STOP' WHEN DONE")

            while True:
                entry = input("ENTER (or STOP): ").strip()

                if entry == "STOP":
                    break

                if ":" not in entry:
                    print("INVALID FORMAT, USE category:rank")
                    continue

                parts    = entry.split(":")
                category = parts[0].strip()
                rank_str = parts[1].strip()

                if category not in valid_categories:
                    print(f"INVALID CATEGORY")
                    continue

                if not rank_str.isdigit():
                    print("RANK MUST BE A NUMBER")
                    continue

                self.__category_and_rank[category] = int(rank_str)
                for sec in eligible_sections.get(category, [category]): # to prevent duplicates bro 
                    if sec not in self.__category:
                        self.__category.append(sec)

                print(f" {category} : {rank_str} ADDED SUCCESSFULLY ")

        else:
            # Result nahi aaya → category se eligible sections lo
            print("SELECT CATEGORY AS PER REGISTRATION FORM AND MAINTAIN SAME FORMAT AS IN VALID CATEGORIES")
            while True:
                category = input("ENTER YOUR CATEGORY: ").strip()
                if category not in valid_categories:
                    print("INVALID CATEGORY, TRY AGAIN")
                else:
                    self.__category = eligible_sections.get(category,[category])
                    break
        print("CATEGORY SET SUCCESSFULLY\n")

        # ── GENDER ─────────────────────────────
        print("*****SELECT YOUR GENDER*****")
        while True:
            gender = input("ENTER GENDER (MALE / FEMALE): ").strip().upper()
            if gender not in ["MALE", "FEMALE"]:
                print("INVALID, ENTER 'MALE' OR 'FEMALE'")
            else:
                self.__gender = gender
                break
        print("GENDER SET SUCCESSFULLY\n")

        # ── STATE (only JEE Mains) ─────────────
        # WHY: Advanced mein sirf AI quota hota hai, state irrelevant
        # WHY state: college_data.py automatically HS/OS decide karega
        # User ko quota nahi pata hona chahiye — state kaafi hai
        if self.__exam_type == "jee main":
            print("ENTER YOUR SCHOOL STATE/UT (CLASS 12 BOARD)")
            print("OPTIONS:", ", ".join(states))
            while True:
                state_input = input("ENTER STATE: ").strip().title()
                if state_input not in states:
                    print("INVALID STATE, TRY AGAIN")
                else:
                    self.__state_of_education = state_input
                    break
            print("STATE SET SUCCESSFULLY\n")

        print("=" * 50)
        print("ALL DATA COLLECTED SUCCESSFULLY!")
        print("=" * 50)


if __name__ == "__main__":
    print("This file is not meant to run directly")














#     good issue or it was just a very common issue?5:55 PMClaude responded: Bhai ye genuinely good issue detect kiya tune!Bhai ye genuinely good issue detect kiya tune! 🔥
# Real-world edge case hai — JOSAA counseling mein bohot students confuse hote hain HS/OS ke baare mein. Tune automatically solve kiya user experience ke liye — "Auto-detects Home State vs Other State quota based on college location" — yeh resume pe strong point hai, shows product thinking! 💪
