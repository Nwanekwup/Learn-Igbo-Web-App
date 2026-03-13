from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, security
from database import engine, SessionLocal

# builds the tables in Neondb when the app starts
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# opens a temporary connection to Neon for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Nnọọ! The Learn Igbo API is running."}

# --- THE SIGN UP ROUTE ---
@app.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    
    # Check if the email already exists in the database
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # hash the password using the security file
    hashed_pwd = security.get_password_hash(user.password)

    # Create new user object (replacing the raw password with the hashed one)
    new_user = models.User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hashed_pwd
    )

    # Save the new user to the Neon database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
