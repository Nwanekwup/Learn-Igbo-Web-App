from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone

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

class Flashcard(Base):
    """
    Represents a single vocabulary item in the Igbo language curriculum.
    """
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    igbo_word = Column(String, nullable=False, index=True)
    english_translation = Column(String, nullable=False)
    
    # Optional field to store phonetic spelling or diacritic-specific notes
    pronunciation_guide = Column(String, nullable=True)

    # Establish relationship with user progress logs
    progress_records = relationship("UserProgress", back_populates="flashcard")


class UserProgress(Base):
    """
    Tracks an individual user's performance and scheduling for a specific flashcard.
    Serves as the data layer for the confidence-based spaced repetition algorithm.
    """
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    flashcard_id = Column(Integer, ForeignKey("flashcards.id"), nullable=False)
    
    # Algorithm tracking fields
    confidence_score = Column(Integer, default=0) # e.g., 1 (Hard) to 5 (Easy)
    next_review_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_reviewed_at = Column(DateTime, nullable=True)

    # Establish ORM relationships
    user = relationship("User")
    flashcard = relationship("Flashcard", back_populates="progress_records")
    
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