import csv
from database import SessionLocal, engine, Base
from models import Flashcard

def import_csv_to_db(filepath):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        print(f"Opening {filepath}...")
        with open(filepath, mode='r', encoding='utf-8-sig') as file:
            csv_reader = csv.DictReader(file)
            cards_to_add = []
            
            for row in csv_reader:
                # Check if word already exists to prevent duplicates
                existing_word = db.query(Flashcard).filter(
                    Flashcard.igbo_word == row['igbo_word']
                ).first()
                
                if not existing_word:
                    new_card = Flashcard(
                        igbo_word=row['igbo_word'],
                        english_translation=row['english_translation'],
                        pronunciation_guide=row.get('pronunciation_guide', '') 
                    )
                    cards_to_add.append(new_card)
            
            if cards_to_add:
                db.add_all(cards_to_add)
                db.commit()
                print(f"Success! Inserted {len(cards_to_add)} new Igbo words into the database.")
            else:
                print("No new words to add. Database is already up to date.")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import_csv_to_db("igbo_vocabulary_full.csv")