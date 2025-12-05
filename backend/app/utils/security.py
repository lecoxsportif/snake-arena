from passlib.context import CryptContext

# Configure the password hashing scheme
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a plain password.
    
    Args:
        password: The plain text password.
    Returns:
        A bcrypt hashed password string.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash.
    
    Args:
        plain_password: The password provided by the user.
        hashed_password: The stored bcrypt hash.
    Returns:
        True if the password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)
