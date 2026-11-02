import pytest
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token
)

def test_password_hashing():
    raw_pwd = "SuperSecretPassword123!"
    hashed = get_password_hash(raw_pwd)
    assert hashed != raw_pwd
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_jwt_lifecycle():
    data = {"sub": "doctor@neuroscan.ai", "role": "doctor"}
    access_tok = create_access_token(data)
    assert isinstance(access_tok, str)
    decoded = decode_token(access_tok)
    assert decoded["sub"] == "doctor@neuroscan.ai"
    assert decoded["role"] == "doctor"
    assert decoded["type"] == "access"

    refresh_tok = create_refresh_token(data)
    decoded_refresh = decode_token(refresh_tok)
    assert decoded_refresh["type"] == "refresh"
