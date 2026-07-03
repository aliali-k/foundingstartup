from fastapi import FastAPI, Path, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, model_validator, field_validator
from typing import Dict, Optional, Literal
import json, os, uuid, sys, traceback
import pandas as pd
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "ML_MODELS"))
from report_generator import generate_report


sys.path.insert(0, os.path.join(os.path.dirname(__file__), "ML_MODELS"))

app = FastAPI(title="JEE Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-PDF-ID"],
)

# ── In-memory PDF store (id -> file path) for cross-app handoff ──
pdf_store: Dict[str, str] = {}

@app.get("/test")
def test_connection():
    return {"message": "Bhai Backend Connect Ho Gaya!"}


DATA_FILE = "students.json"

def load_data():
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


def map_session(session: str) -> str:
    return session

def map_shift(shift: str) -> str:
    mapping = {
        "Morning": "Shift 1",
        "Evening": "Shift 2",
        "Shift 1 — Morning": "Shift 1",
        "Shift 2 — Evening": "Shift 2",
        "Morning Shift": "Shift 1",
        "Evening Shift": "Shift 2",
        "Shift1": "Shift 1",
        "Shift2": "Shift 2",
    }
    return mapping.get(shift, shift)

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

def build_category_list(category: str, category_and_rank: dict) -> list:
    if category_and_rank:
        return list(category_and_rank.keys())
    return eligible_sections.get(category, [category])


@app.post("/predict")
def predict(student: dict):
    try:
        print("DEBUG student data:", student)

        from college_data import run_college_prediction

        exam_type         = student.get("exam_type", "")
        year              = student.get("year", 2026)
        percentile        = student.get("percentile")
        score_value = student.get("score_value") or student.get("marks")
        crl_rank          = student.get("crl_rank")
        category          = student.get("category") or student.get("category_only")
        category_and_rank = student.get("category_and_rank") or {}
        gender            = student.get("gender", "Gender Neutral")
        state             = student.get("state_of_education") or student.get("state") or ""
        name              = student.get("name", "Student")

        exam_shift = student.get("exam_shift") or {}
        session    = exam_shift.get("session") or student.get("session")
        shift      = exam_shift.get("shift")   or student.get("shift")
        shift_date = exam_shift.get("date")    or student.get("shift_date", "")

        if "main" in str(exam_type).lower():
            from rankjeemainengine import rankenginejeemain_dynamic

            if percentile is not None:
                score_type  = "percentile"
                score_input = percentile
            elif score_value is not None:
                score_type  = "marks"
                score_input = score_value
            else:
                score_type  = "percentile"
                score_input = 0

            engine_data = {
                "year"              : year,
                "session"           : map_session(session) if session else "Session 1",
                "shift"             : map_shift(shift) if shift else "Shift 1",
                "score_type"        : score_type,
                "score_value"       : score_input,
                "category"          : build_category_list(category, category_and_rank),
                "category_and_rank" : category_and_rank,
                "shift_date"        : shift_date,
            }

            engine = rankenginejeemain_dynamic(engine_data)

        else:
            from jeeadvancedengine import Rankjeeadvanced_dynamic

            engine_data = {
                "year"              : year,
                "score_value"       : score_value or 0,
                "category"          : build_category_list(category, category_and_rank),
                "category_and_rank" : category_and_rank,
            }

            engine = Rankjeeadvanced_dynamic(engine_data)

        ranks = engine.calculate()
        print("DEBUG ranks:", ranks)

        college_input = {
            "exam_type"         : str(exam_type).lower(),
            "name"              : name,
            "gender"            : "FEMALE" if str(gender).lower() == "female" else "MALE",
            "state"             : state,
            "year"              : year,
            "category_and_rank" : ranks["category_and_rank"],
        }

        results_df = run_college_prediction(college_input)

        if results_df is None or results_df.empty:
            results_df = pd.DataFrame(columns=[
                "Institute", "Program", "Institute Type", "Quota",
                "Category", "Gender Pool", "Your Rank",
                "Opening Rank", "Closing Rank", "Chance"
            ])

        os.makedirs("DATA", exist_ok=True)

        pdf_filename = f"{name.replace(' ', '_')}_{year}_Report.pdf"
        pdf_path = os.path.join("DATA", pdf_filename)

        user_data_for_report = {
            "name"      : name,
            "gender"    : gender,
            "state"     : state,
            "exam_type" : exam_type,
            "year"      : year,
            "percentile": ranks.get("percentile"),
            "marks"     : ranks.get("marks")
        }

        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            generate_report(
                user_data=user_data_for_report,
                rank_result=ranks,
                df_results=results_df,
                output_path=pdf_path
            )

        # ── Store this PDF under a short-lived ID for cross-app handoff ──
        pdf_id = str(uuid.uuid4())
        pdf_store[pdf_id] = pdf_path

        return FileResponse(
            path=pdf_path,
            filename=pdf_filename,
            media_type="application/pdf",
            headers={"X-PDF-ID": pdf_id}
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/get-pdf/{pdf_id}")
def get_pdf(pdf_id: str):
    pdf_path = pdf_store.get(pdf_id)
    if not pdf_path or not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF not found or expired")
    return FileResponse(
        path=pdf_path,
        filename=os.path.basename(pdf_path),
        media_type="application/pdf"
    )


@app.post("/student", status_code=201)
def add_student(student: dict):
    data = load_data()
    student_id = "JEENUS" + str(uuid.uuid4())[:6].upper()
    student["student_id"] = student_id
    data[student_id] = student
    save_data(data)
    return {"message": "Student added successfully", "student_id": student_id}


@app.get("/student/{student_id}")
def get_student(student_id: str = Path(..., examples=["JEENUS4A1B2C"])):
    data = load_data()
    if student_id not in data:
        raise HTTPException(status_code=404, detail="Student not found")
    return data[student_id]


@app.get("/students")
def get_all_students():
    return load_data()


@app.get("/students/sort")
def sort_students(
    sort_by: str = Query(..., description="percentile | score_value | crl_rank | year"),
    order  : str = Query("asc", description="asc | desc")
):
    valid_fields = ["percentile", "score_value", "crl_rank", "year"]
    if sort_by not in valid_fields:
        raise HTTPException(400, detail=f"sort_by must be one of {valid_fields}")
    data    = load_data()
    reverse = order == "desc"
    sorted_data = sorted(data.values(), key=lambda x: x.get(sort_by) or 0, reverse=reverse)
    return sorted_data


@app.patch("/student/{student_id}")
def update_student(student_id: str, updates: dict):
    data = load_data()
    if student_id not in data:
        raise HTTPException(404, detail="Student not found")
    allowed_fields = ["score_value", "percentile", "crl_rank", "exam_conducted",
                      "category", "category_and_rank", "gender", "state_of_education", "name"]
    invalid = [k for k in updates if k not in allowed_fields]
    if invalid:
        raise HTTPException(400, detail=f"Cannot update these fields: {invalid}")
    data[student_id].update(updates)
    save_data(data)
    return {"message": "Student updated successfully", "student_id": student_id, "updated_fields": list(updates.keys())}


@app.delete("/student/{student_id}")
def delete_student(student_id: str):
    data = load_data()
    if student_id not in data:
        raise HTTPException(404, detail="Student not found")
    del data[student_id]
    save_data(data)
    return {"message": "Student deleted successfully"}

# from fastapi import FastAPI, Path, HTTPException, Query
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import FileResponse
# from pydantic import BaseModel, model_validator, field_validator
# from typing import Dict, Optional, Literal
# import json, os, uuid, sys, traceback
# import pandas as pd
# sys.path.insert(0, os.path.join(os.path.dirname(__file__), "ML_MODELS"))
# from report_generator import generate_report


# sys.path.insert(0, os.path.join(os.path.dirname(__file__), "ML_MODELS"))

# app = FastAPI(title="JEE Prediction API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/test")
# def test_connection():
#     return {"message": "Bhai Backend Connect Ho Gaya!"}


# DATA_FILE = "students.json"

# def load_data():
#     if not os.path.exists(DATA_FILE):
#         return {}
#     with open(DATA_FILE, "r") as f:
#         return json.load(f)

# def save_data(data):
#     with open(DATA_FILE, "w") as f:
#         json.dump(data, f, indent=2)


# def map_session(session: str) -> str:
#     return session

# def map_shift(shift: str) -> str:
#     mapping = {
#         "Morning": "Shift 1",
#         "Evening": "Shift 2",
#         "Shift 1 — Morning": "Shift 1",
#         "Shift 2 — Evening": "Shift 2",
#         "Morning Shift": "Shift 1",
#         "Evening Shift": "Shift 2",
#         "Shift1": "Shift 1",
#         "Shift2": "Shift 2",
#     }
#     return mapping.get(shift, shift)

# eligible_sections = {
#     "OPEN"         : ["OPEN"],
#     "EWS"          : ["OPEN", "EWS"],
#     "OBC-NCL"      : ["OPEN", "OBC-NCL"],
#     "SC"           : ["OPEN", "SC"],
#     "ST"           : ["OPEN", "ST"],
#     "OPEN (PwD)"   : ["OPEN", "OPEN (PwD)"],
#     "EWS (PwD)"    : ["OPEN", "EWS", "OPEN (PwD)", "EWS (PwD)"],
#     "OBC-NCL (PwD)": ["OPEN", "OBC-NCL", "OPEN (PwD)", "OBC-NCL (PwD)"],
#     "SC (PwD)"     : ["OPEN", "SC", "OPEN (PwD)", "SC (PwD)"],
#     "ST (PwD)"     : ["OPEN", "ST", "OPEN (PwD)", "ST (PwD)"]
# }

# def build_category_list(category: str, category_and_rank: dict) -> list:
#     if category_and_rank:
#         return list(category_and_rank.keys())
#     return eligible_sections.get(category, [category])


# @app.post("/predict")
# def predict(student: dict):
#     try:
#         print("DEBUG student data:", student)

#         from college_data import run_college_prediction

#         exam_type         = student.get("exam_type", "")
#         year              = student.get("year", 2026)
#         percentile        = student.get("percentile")
#         score_value = student.get("score_value") or student.get("marks")
#         crl_rank          = student.get("crl_rank")
#         category          = student.get("category") or student.get("category_only")
#         category_and_rank = student.get("category_and_rank") or {}
#         gender            = student.get("gender", "Gender Neutral")
#         state             = student.get("state_of_education") or student.get("state") or ""
#         name              = student.get("name", "Student")

#         exam_shift = student.get("exam_shift") or {}
#         session    = exam_shift.get("session") or student.get("session")
#         shift      = exam_shift.get("shift")   or student.get("shift")
#         shift_date = exam_shift.get("date")    or student.get("shift_date", "")

#         if "main" in str(exam_type).lower():
#             from rankjeemainengine import rankenginejeemain_dynamic

#             if percentile is not None:
#                 score_type  = "percentile"
#                 score_input = percentile
#             elif score_value is not None:
#                 score_type  = "marks"
#                 score_input = score_value
#             else:
#                 score_type  = "percentile"
#                 score_input = 0

#             engine_data = {
#                 "year"              : year,
#                 "session"           : map_session(session) if session else "Session 1",
#                 "shift"             : map_shift(shift) if shift else "Shift 1",
#                 "score_type"        : score_type,
#                 "score_value"       : score_input,
#                 "category"          : build_category_list(category, category_and_rank),
#                 "category_and_rank" : category_and_rank,
#                 "shift_date"        : shift_date,
#             }

#             engine = rankenginejeemain_dynamic(engine_data)

#         else:
#             from jeeadvancedengine import Rankjeeadvanced_dynamic

#             engine_data = {
#                 "year"              : year,
#                 "score_value"       : score_value or 0,
#                 "category"          : build_category_list(category, category_and_rank),
#                 "category_and_rank" : category_and_rank,
#             }

#             engine = Rankjeeadvanced_dynamic(engine_data)

#         ranks = engine.calculate()
#         print("DEBUG ranks:", ranks)

#         college_input = {
#             "exam_type"         : str(exam_type).lower(),
#             "name"              : name,
#             "gender"            : "FEMALE" if str(gender).lower() == "female" else "MALE",
#             "state"             : state,
#             "year"              : year,
#             "category_and_rank" : ranks["category_and_rank"],
#         }

#         results_df = run_college_prediction(college_input)

#         if results_df is None or results_df.empty:
#             results_df = pd.DataFrame(columns=[
#                 "Institute", "Program", "Institute Type", "Quota",
#                 "Category", "Gender Pool", "Your Rank",
#                 "Opening Rank", "Closing Rank", "Chance"
#             ])

#         os.makedirs("DATA", exist_ok=True)

#         pdf_filename = f"{name.replace(' ', '_')}_{year}_Report.pdf"
#         pdf_path = os.path.join("DATA", pdf_filename)

#         user_data_for_report = {
#             "name"      : name,
#             "gender"    : gender,
#             "state"     : state,
#             "exam_type" : exam_type,
#             "year"      : year,
#             "percentile": ranks.get("percentile"),
#             "marks"     : ranks.get("marks")
#         }

#         import warnings
#         with warnings.catch_warnings():
#             warnings.simplefilter("ignore")
#             generate_report(
#                 user_data=user_data_for_report,
#                 rank_result=ranks,
#                 df_results=results_df,
#                 output_path=pdf_path
#             )

#         return FileResponse(
#             path=pdf_path,
#             filename=pdf_filename,
#             media_type="application/pdf"
#         )

#     except Exception as e:
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))


# @app.post("/student", status_code=201)
# def add_student(student: dict):
#     data = load_data()
#     student_id = "JEENUS" + str(uuid.uuid4())[:6].upper()
#     student["student_id"] = student_id
#     data[student_id] = student
#     save_data(data)
#     return {"message": "Student added successfully", "student_id": student_id}


# @app.get("/student/{student_id}")
# def get_student(student_id: str = Path(..., examples=["JEENUS4A1B2C"])):
#     data = load_data()
#     if student_id not in data:
#         raise HTTPException(status_code=404, detail="Student not found")
#     return data[student_id]


# @app.get("/students")
# def get_all_students():
#     return load_data()


# @app.get("/students/sort")
# def sort_students(
#     sort_by: str = Query(..., description="percentile | score_value | crl_rank | year"),
#     order  : str = Query("asc", description="asc | desc")
# ):
#     valid_fields = ["percentile", "score_value", "crl_rank", "year"]
#     if sort_by not in valid_fields:
#         raise HTTPException(400, detail=f"sort_by must be one of {valid_fields}")
#     data    = load_data()
#     reverse = order == "desc"
#     sorted_data = sorted(data.values(), key=lambda x: x.get(sort_by) or 0, reverse=reverse)
#     return sorted_data


# @app.patch("/student/{student_id}")
# def update_student(student_id: str, updates: dict):
#     data = load_data()
#     if student_id not in data:
#         raise HTTPException(404, detail="Student not found")
#     allowed_fields = ["score_value", "percentile", "crl_rank", "exam_conducted",
#                       "category", "category_and_rank", "gender", "state_of_education", "name"]
#     invalid = [k for k in updates if k not in allowed_fields]
#     if invalid:
#         raise HTTPException(400, detail=f"Cannot update these fields: {invalid}")
#     data[student_id].update(updates)
#     save_data(data)
#     return {"message": "Student updated successfully", "student_id": student_id, "updated_fields": list(updates.keys())}


# @app.delete("/student/{student_id}")
# def delete_student(student_id: str):
#     data = load_data()
#     if student_id not in data:
#         raise HTTPException(404, detail="Student not found")
#     del data[student_id]
#     save_data(data)
#     return {"message": "Student deleted successfully"}



# # from fastapi import FastAPI, Path, HTTPException, Query
# # from fastapi.middleware.cors import CORSMiddleware
# # from pydantic import BaseModel, model_validator, field_validator
# # from typing import Dict, Optional, Literal
# # import json, os, uuid
# # from fastapi.middleware.cors import CORSMiddleware

# # app = FastAPI()

# # # CORS CODE (Frontend ko permission dene ke liye)


# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["*"],
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )


# # # TEST ROUTE
# # @app.get("/test")
# # def test_connection():
# #     return {"message": "Bhai Backend Connect Ho Gaya!"}


# # # ── App initialize ────────────────────────────────
# # app = FastAPI(title="JEE Prediction API")

# # # ── CORS Middleware ───────────────────────────────
# # # Frontend (React/HTML) se API call karne ke liye zaroori
# # # allow_origins=["*"] matlab koi bhi domain call kar sakta hai
# # # Production mein apna frontend domain dena instead of "*"
# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["*"],
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # # ── Data File ─────────────────────────────────────
# # DATA_FILE = "students.json"

# # def load_data():
# #     if not os.path.exists(DATA_FILE):
# #         return {}
# #     with open(DATA_FILE, "r") as f:
# #         return json.load(f)

# # def save_data(data):
# #     with open(DATA_FILE, "w") as f:
# #         json.dump(data, f, indent=2)


# # # ── SESSION / SHIFT MAPPERS ───────────────────────
# # # Frontend "Session 1" -> Engine "January"
# # # Frontend "Session 2" -> Engine "April"
# # def map_session(session: str) -> str:
# #     mapping = {
# #         "Session 1": "January",
# #         "Session 2": "April"
# #     }
# #     return mapping.get(session, session)

# # # Frontend "Morning" -> Engine "Shift1"
# # # Frontend "Evening" -> Engine "Shift2"
# # def map_shift(shift: str) -> str:
# #     mapping = {
# #         "Morning": "Shift1",
# #         "Evening": "Shift2",
# #         "Shift 1 — Morning": "Shift1",
# #         "Shift 2 — Evening": "Shift2",
# #     }
# #     return mapping.get(shift, shift)

# # # eligible_sections: category se saare eligible sub-categories
# # # e.g. OBC-NCL student OPEN aur OBC-NCL dono seats ke liye eligible hai
# # eligible_sections = {
# #     "OPEN"         : ["OPEN"],
# #     "EWS"          : ["OPEN", "EWS"],
# #     "OBC-NCL"      : ["OPEN", "OBC-NCL"],
# #     "SC"           : ["OPEN", "SC"],
# #     "ST"           : ["OPEN", "ST"],
# #     "OPEN (PwD)"   : ["OPEN", "OPEN (PwD)"],
# #     "EWS (PwD)"    : ["OPEN", "EWS", "OPEN (PwD)", "EWS (PwD)"],
# #     "OBC-NCL (PwD)": ["OPEN", "OBC-NCL", "OPEN (PwD)", "OBC-NCL (PwD)"],
# #     "SC (PwD)"     : ["OPEN", "SC", "OPEN (PwD)", "SC (PwD)"],
# #     "ST (PwD)"     : ["OPEN", "ST", "OPEN (PwD)", "ST (PwD)"]
# # }

# # def build_category_list(category: str, category_and_rank: dict) -> list:
# #     # Agar result out hai (category_and_rank filled) -> use those keys directly
# #     if category_and_rank:
# #         return list(category_and_rank.keys())
# #     # Agar result nahi aaya -> eligible_sections se expand karo
# #     return eligible_sections.get(category, [category])


# # # ═══════════════════════════════════════════════════
# # #  PREDICT — Main prediction endpoint
# # #  POST /predict
# # #  Frontend: PREDICT NOW button pe yahi call hoga
# # #
# # #  Flow:
# # #    1. Frontend form data aata hai as JSON
# # #    2. Rank engine calculate karta hai ranks
# # #    3. college_data.py filter karta hai colleges
# # #    4. Response mein ranks + college list return hoti hai
# # # ═══════════════════════════════════════════════════
# # @app.post("/predict")
# # def predict(student: dict):
# #     try:
# #         # ── Import engines here to avoid circular import issues ──
# #         from college_data import run_college_prediction

# #         exam_type       = student.get("exam_type", "")        # "JEE Main" or "JEE Advanced"
# #         year            = student.get("year", 2026)            # int
# #         session         = student.get("session")               # "Session 1" / "Session 2"
# #         shift           = student.get("shift")                 # "Morning" / "Evening"
# #         percentile      = student.get("percentile")            # float or None
# #         score_value     = student.get("score_value")           # int or None (marks)
# #         crl_rank        = student.get("crl_rank")              # int or None
# #         exam_conducted  = student.get("exam_conducted", False) # bool
# #         category        = student.get("category")              # single category string
# #         category_and_rank = student.get("category_and_rank", {}) # dict if result out
# #         gender          = student.get("gender", "Gender Neutral")
# #         state           = student.get("state_of_education", "")
# #         name            = student.get("name", "Student")

# #         # ── JEE MAIN ─────────────────────────────────────────────
# #         if exam_type == "JEE Main":
# #             from rankjeemainengine_dynamic import rankenginejeemain_dynamic

# #             # score_type decide karo: agar percentile diya hai to "percentile"
# #             # agar sirf marks diye hain to "marks"
# #             if percentile is not None:
# #                 score_type  = "percentile"
# #                 score_input = percentile
# #             elif score_value is not None:
# #                 score_type  = "marks"
# #                 score_input = score_value
# #             else:
# #                 # Agar sirf CRL rank diya hai aur result out hai
# #                 score_type  = "percentile"
# #                 score_input = 0

# #             engine_data = {
# #                 "year"              : year,
# #                 "session"           : map_session(session) if session else "January",
# #                 "shift"             : map_shift(shift) if shift else "Shift1",
# #                 "score_type"        : score_type,
# #                 "score_value"       : score_input,
# #                 "category"          : build_category_list(category, category_and_rank),
# #                 "category_and_rank" : category_and_rank or {},
# #             }

# #             engine = rankenginejeemain_dynamic(engine_data)

# #         # ── JEE ADVANCED ─────────────────────────────────────────
# #         else:
# #             from jeeadvancedengine import Rankjeeadvanced_dynamic

# #             engine_data = {
# #                 "year"              : year,
# #                 "score_value"       : score_value or 0,
# #                 "category"          : build_category_list(category, category_and_rank),
# #                 "category_and_rank" : category_and_rank or {},
# #             }

# #             engine = Rankjeeadvanced_dynamic(engine_data)

# #         # ── CALCULATE RANKS ───────────────────────────────────────
# #         ranks = engine.calculate()

# #         # ── COLLEGE FILTER DATA ───────────────────────────────────
# #         # college_data.py ko yeh format chahiye
# #         college_input = {
# #             "exam_type"         : exam_type.lower(),          # "jee main" / "jee advanced"
# #             "name"              : name,
# #             "gender"            : "FEMALE" if gender == "Female" else "MALE",
# #             "state"             : state,
# #             "year"              : year,
# #             "category_and_rank" : ranks["category_and_rank"], # calculated ranks
# #         }

# #         results_df = run_college_prediction(college_input)

# #         # ── RESPONSE ──────────────────────────────────────────────
# #         return {
# #             "success"  : True,
# #             "name"     : name,
# #             "ranks"    : ranks,                                          # calculated ranks per category
# #             "colleges" : results_df.to_dict(orient="records") if not results_df.empty else [],
# #             "total"    : len(results_df) if not results_df.empty else 0,
# #         }

# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=str(e))


# # # ═══════════════════════════════════════════════════
# # #  CREATE — Naya student store karo (optional, for saving data)
# # #  POST /student
# # # ═══════════════════════════════════════════════════
# # @app.post("/student", status_code=201)
# # def add_student(student: dict):
# #     data = load_data()

# #     # Auto-generate student ID
# #     student_id = "JEENUS" + str(uuid.uuid4())[:6].upper()
# #     student["student_id"] = student_id

# #     data[student_id] = student
# #     save_data(data)

# #     return {
# #         "message"   : "Student added successfully",
# #         "student_id": student_id
# #     }


# # # ═══════════════════════════════════════════════════
# # #  READ ONE — Ek student ka data
# # #  GET /student/{student_id}
# # # ═══════════════════════════════════════════════════
# # @app.get("/student/{student_id}")
# # def get_student(student_id: str = Path(..., example="JEENUS4A1B2C")):
# #     data = load_data()
# #     if student_id not in data:
# #         raise HTTPException(status_code=404, detail="Student not found")
# #     return data[student_id]


# # # ═══════════════════════════════════════════════════
# # #  READ ALL — Saare students
# # #  GET /students
# # # ═══════════════════════════════════════════════════
# # @app.get("/students")
# # def get_all_students():
# #     return load_data()


# # # ═══════════════════════════════════════════════════
# # #  SORT — Sort by field
# # #  GET /students/sort?sort_by=percentile&order=desc
# # # ═══════════════════════════════════════════════════
# # @app.get("/students/sort")
# # def sort_students(
# #     sort_by: str = Query(..., description="percentile | score_value | crl_rank | year"),
# #     order  : str = Query("asc", description="asc | desc")
# # ):
# #     valid_fields = ["percentile", "score_value", "crl_rank", "year"]
# #     if sort_by not in valid_fields:
# #         raise HTTPException(400, detail=f"sort_by must be one of {valid_fields}")

# #     data    = load_data()
# #     reverse = order == "desc"
# #     sorted_data = sorted(
# #         data.values(),
# #         key=lambda x: x.get(sort_by) or 0,
# #         reverse=reverse
# #     )
# #     return sorted_data


# # # ═══════════════════════════════════════════════════
# # #  UPDATE — Partial update
# # #  PATCH /student/{student_id}
# # # ═══════════════════════════════════════════════════
# # @app.patch("/student/{student_id}")
# # def update_student(student_id: str, updates: dict):
# #     data = load_data()
# #     if student_id not in data:
# #         raise HTTPException(404, detail="Student not found")

# #     allowed_fields = [
# #         "score_value", "percentile", "crl_rank",
# #         "exam_conducted", "category", "category_and_rank",
# #         "gender", "state_of_education", "name"
# #     ]
# #     invalid = [k for k in updates if k not in allowed_fields]
# #     if invalid:
# #         raise HTTPException(400, detail=f"Cannot update these fields: {invalid}")

# #     data[student_id].update(updates)
# #     save_data(data)
# #     return {
# #         "message"       : "Student updated successfully",
# #         "student_id"    : student_id,
# #         "updated_fields": list(updates.keys())
# #     }


# # # ═══════════════════════════════════════════════════
# # #  DELETE — Student delete karo
# # #  DELETE /student/{student_id}
# # # ═══════════════════════════════════════════════════
# # @app.delete("/student/{student_id}")
# # def delete_student(student_id: str):
# #     data = load_data()
# #     if student_id not in data:
# #         raise HTTPException(404, detail="Student not found")
# #     del data[student_id]
# #     save_data(data)
# #     return {"message": "Student deleted successfully"}


