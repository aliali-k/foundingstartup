from pydantic import BaseModel, model_validator, field_validator
from typing import Dict, Optional, Literal
import uuid

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

valid_categories = [
    'EWS', 'EWS (PwD)', 'OBC-NCL', 'OBC-NCL (PwD)',
    'OPEN', 'OPEN (PwD)', 'SC', 'SC (PwD)', 'ST', 'ST (PwD)'
]

class StudentData(BaseModel):
    student_id         : str = ""
    year               : Literal[2020, 2021, 2022, 2023, 2024, 2025, 2026]
    name               : str
    exam_type          : Literal["JEE Main", "JEE Advanced"]

    # Mains only — frontend controls visibility
    session            : Optional[Literal["Session 1", "Session 2"]] = None
    date               : Optional[str] = None
    shift              : Optional[Literal["Morning", "Evening"]] = None

    # Scores — atleast one mandatory for Mains
    percentile         : Optional[float] = None   # Mains
    score_value        : Optional[int]   = None   # Mains = marks, Advanced = marks
    crl_rank           : Optional[int]   = None   # both

    exam_conducted     : bool  # YES/NO button

    # Category
    category           : Optional[str]            = None  # exam nahi hua
    category_and_rank  : Optional[Dict[str, int]] = None  # exam hua

    gender             : Literal["Gender Neutral", "Female"] = "Gender Neutral"
    state_of_education : str

    # ── Auto ID ──────────────────────────────────
    def model_post_init(self, __context):
        if not self.student_id:
            self.student_id = "JEENUS" + str(uuid.uuid4())[:6].upper()

    # ── State validate ───────────────────────────
    @field_validator("state_of_education")
    @classmethod
    def validate_state(cls, v):
        if v not in states:
            raise ValueError(f"Invalid state '{v}'")
        return v

    # ── Category validate ────────────────────────
    @field_validator("category")
    @classmethod
    def validate_category(cls, v):
        if v is not None and v not in valid_categories:
            raise ValueError(f"Invalid category '{v}'")
        return v

    @field_validator("category_and_rank")
    @classmethod
    def validate_category_and_rank(cls, v):
        if v is not None:
            for cat in v.keys():
                if cat not in valid_categories:
                    raise ValueError(f"Invalid category in rank dict: '{cat}'")
        return v

    # ── Main Logic Validator ─────────────────────
    @model_validator(mode="after")
    def validate_logic(self):

        # Mains mandatory fields
        if self.exam_type == "JEE Main":
            if not self.session:
                raise ValueError("Session mandatory for JEE Main")
            if not self.date:
                raise ValueError("Date mandatory for JEE Main")
            if not self.shift:
                raise ValueError("Shift mandatory for JEE Main")
            # atleast one score
            if all(v is None for v in [self.score_value, self.percentile, self.crl_rank]):
                raise ValueError("Atleast one of percentile, marks, crl_rank mandatory for JEE Main")

        # Advanced mandatory fields
        if self.exam_type == "JEE Advanced":
            if all(v is None for v in [self.score_value, self.crl_rank]):
                raise ValueError("Marks or CRL rank mandatory for JEE Advanced")

        # exam conducted logic
        if self.exam_conducted:
            if not self.category_and_rank:
                raise ValueError("category_and_rank mandatory when result is out")
        else:
            if not self.category:
                raise ValueError("category mandatory when result is not yet out")

        return self

    
