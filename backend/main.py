from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models, schemas, security, jwt 
from database import engine, SessionLocal
from datetime import datetime, timedelta, timezone

# Initialize database schema
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_db():
    """
    Yields a database session for incoming requests and ensures 
    the connection is safely closed afterward.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Validates the JWT access token and retrieves the current authenticated user.
    Throws 401 Unauthorized if the token is missing, expired, or invalid.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the token using the secret key
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("token_type")

        # Ensure the payload is valid and is explicitly an access token
        if email is None or token_type != "access":
            raise credentials_exception
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Access token expired. Please refresh."
        )
    except jwt.InvalidTokenError:
        raise credentials_exception

    # Retrieve the user from the database
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
        
    return user

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

# --- THE LOGIN ROUTE ---
@app.post("/login")
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authenticates a user and issues both access and refresh tokens.
    """
    # OAuth2 specifies 'username' in the form data, but we use it for the user's email
    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()
    
    if not user or not security.verify_password(user_credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid email or password"
        )

    access_token = security.create_access_token(data={"sub": user.email})
    refresh_token = security.create_refresh_token(data={"sub": user.email})

    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/refresh")
def refresh_access_token(token_request: schemas.TokenRefreshRequest, db: Session = Depends(get_db)):
    """
    Validates a refresh token and issues a new access token.
    """
    try:
        # Decode and validate the refresh token
        payload = jwt.decode(token_request.refresh_token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("token_type")

        # Ensure the payload is valid and is explicitly a refresh token
        if email is None or token_type != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

        # Verify user still exists in the database
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        # Issue a fresh access token
        new_access_token = security.create_access_token(data={"sub": user.email})

        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    """
    Retrieves the currently authenticated user's profile information.
    Protected route: Requires a valid JWT access token.
    """
    return current_user

@app.get("/cards/next", response_model=schemas.FlashcardResponse)
def fetch_next_card(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieves the highest priority flashcard for the authenticated user based on next_review_date.
    """
    now = datetime.now(timezone.utc)
    
    # Query for the user's due cards, ordered by the oldest review date
    due_progress = db.query(models.UserProgress).filter(
        models.UserProgress.user_id == current_user.id,
        models.UserProgress.next_review_date <= now
    ).order_by(models.UserProgress.next_review_date.asc()).first()

    if due_progress:
        return due_progress.flashcard

    # Fallback: If no cards are specifically due, grab a random unseen card
    unseen_card = db.query(models.Flashcard).filter(
        ~models.Flashcard.progress_records.any(models.UserProgress.user_id == current_user.id)
    ).first()

    if not unseen_card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="No cards available to review at this time."
        )
        
    return unseen_card


@app.post("/cards/{card_id}/review")
def submit_card_result(
    card_id: int, 
    review: schemas.CardReviewSubmit, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Processes a user's review submission, updates their confidence score, 
    and calculates the next review date.
    """
    # Verify the flashcard exists
    card = db.query(models.Flashcard).filter(models.Flashcard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flashcard not found")

    # Retrieve or create the user's progress record for this card
    progress = db.query(models.UserProgress).filter(
        models.UserProgress.user_id == current_user.id,
        models.UserProgress.flashcard_id == card_id
    ).first()

    now = datetime.now(timezone.utc)

    if not progress:
        progress = models.UserProgress(
            user_id=current_user.id,
            flashcard_id=card_id,
        )
        db.add(progress)

    # MVP Algorithm: Update confidence and push next review 24 hours out
    # TODO: Implement full Spaced Repetition logic in Phase 3 (Weeks 7-9)
    progress.confidence_score = review.confidence_score
    progress.last_reviewed_at = now
    progress.next_review_date = now + timedelta(days=1)

    db.commit()
    return {"message": "Review recorded successfully"}