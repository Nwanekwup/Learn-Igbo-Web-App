from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    """Takes a raw password and returns the scrambled hash."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    """Checks if the password the user just typed matches the scrambled one in the database."""
    return pwd_context.verify(plain_password, hashed_password)