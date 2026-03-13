from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

# --- USERS TABLE ---
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False)

    # creates a relationship to the progress table
    progress = relationship("Progress", back_populates="user")

# --- WORDS TABLE ---
class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True)
    igbo_word = Column(String, nullable=False)
    english_meaning = Column(String, nullable=False)
    category = Column(String, nullable=False)

    # creates a relationship to the progress table
    progress = relationship("Progress", back_populates="word")

# --- PROGRESS TABLE (Spaced Repetition) ---
class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    word_id = Column(Integer, ForeignKey("words.id"))
    confidence_score = Column(String, default="didn't know")
    next_review_date = Column(DateTime, default=datetime.utcnow)

    # links back to the specific user and word
    user = relationship("User", back_populates="progress")
    word = relationship("Word", back_populates="progress")