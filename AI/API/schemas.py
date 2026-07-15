from pydantic import BaseModel, field_validator
from typing import List, Optional

class ChatRequest(BaseModel):
    question: str
    session_id: str

    @field_validator('question')
    @classmethod
    def validate_question(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Question cannot be empty')
        if len(v) > 2000:
            raise ValueError('Question must be 2000 characters or fewer')
        return v

    @field_validator('session_id')
    @classmethod
    def validate_session_id(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 100:
            raise ValueError('Invalid session_id')
        return v

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]

class TranscribeResponse(BaseModel):
    transcript: str
    duration: float

class SummarizeRequest(BaseModel):
    transcript: str
    doctor_name: str
    patient_name: str

class SummarizeResponse(BaseModel):
    summary: str