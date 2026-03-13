from pydantic import BaseModel, field_validator, EmailStr
from datetime import datetime
import re

# --- USERS ---
# sign up requirements
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

    # security verification
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, value):
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise ValueError("Password must contain at least one symbol")
        return value

class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    is_verified: bool

    class Config:
        from_attributes = True

# --- WORDS ---

class WordBase(BaseModel):
    igbo_word: str
    english_meaning: str
    category: str 

# sent to the frontend when loading a flashcard
class WordResponse(WordBase):
    id: int

    class Config:
        from_attributes = True

# --- PROGRESS (The Spaced Repetition Engine) ---
# What backend receives when a user clicks "Easy", "I guessed", or "Didn't know"
class ProgressUpdate(BaseModel):
    confidence_score: str 

# What is stored to calculate the next session
class ProgressResponse(BaseModel):
    id: int
    user_id: int
    word_id: int
    confidence_score: str
    next_review_date: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str