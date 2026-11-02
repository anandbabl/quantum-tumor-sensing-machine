from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session
from app.config import settings
from app.core.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode("utf-8")[:72]
    hash_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hash_bytes)

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Returns the active user without requiring authentication.
    If a valid JWT token is provided, uses that user; otherwise defaults
    to the Lead Clinical Operator account.
    """
    from app.models.user import User

    if token:
        try:
            payload = decode_token(token)
            email: str = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email).first()
                if user and user.is_active:
                    return user
        except Exception:
            pass

    # No token or invalid token provided: return or create default clinical operator
    default_email = "operator@quantumtumor.ai"
    user = db.query(User).filter(User.email == default_email).first()
    if not user:
        # Check if doctor account exists from seeding
        doctor_user = db.query(User).filter(User.email == "doctor@quantumtumor.ai").first()
        if doctor_user:
            return doctor_user

        # Create system operator
        user = User(
            id="system-operator-001",
            email=default_email,
            hashed_password="not-used",
            full_name="Dr. Alex Rivera (Lead Clinical Operator)",
            role="medical_professional",
            is_active=True
        )
        db.add(user)
        try:
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            user = db.query(User).first()

    return user

def require_roles(allowed_roles: list[str]):
    """Authentication removed: all roles permitted without restrictions."""
    def role_checker(current_user = Depends(get_current_user)):
        return current_user
    return role_checker
