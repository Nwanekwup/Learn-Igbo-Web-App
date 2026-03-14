from database import SessionLocal, engine, Base
from models import Flashcard

def seed_database():
    """
    Initializes database tables and populates the flashcards table 
    with core Igbo vocabulary for development testing.
    """
    # Force SQLAlchemy to build any missing tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Prevent duplicate seeding on multiple runs
        if db.query(Flashcard).first():
            print("Database is already seeded with vocabulary.")
            return

        # Core MVP vocabulary set
        initial_cards = [
            Flashcard(igbo_word="Nnọọ", english_translation="Welcome", pronunciation_guide="N-naw"),
            Flashcard(igbo_word="Biko", english_translation="Please", pronunciation_guide="Bee-ko"),
            Flashcard(igbo_word="Daalụ", english_translation="Thank you", pronunciation_guide="Daa-loo"),
            Flashcard(igbo_word="Nwa", english_translation="Child", pronunciation_guide="N-wa"),
            Flashcard(igbo_word="Ezigbo", english_translation="Good", pronunciation_guide="Eh-zee-gbo")
        ]

        db.add_all(initial_cards)
        db.commit()
        print("Successfully seeded the database with initial Igbo flashcards.")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()