from cryptography.fernet import Fernet
import os
import base64
from dotenv import load_dotenv

load_dotenv()

# Get JWT secret key and derive a proper Fernet key from it
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "your-256-bit-secret-key-here")

# Derive a 32-byte Fernet key from the JWT secret
# Use SHA256 hash of JWT secret and take first 32 bytes, then base64 encode
import hashlib
key = JWT_SECRET.encode()
if len(key) >= 32:
    fernet_key = key[:32]
else:
    # If key is shorter, hash it to get 32 bytes
    fernet_key = hashlib.sha256(key).digest()

# Base64 encode for Fernet
fernet_key_b64 = base64.urlsafe_b64encode(fernet_key)
fernet = Fernet(fernet_key_b64)

def encrypt_val(value: str) -> str:
    """Encrypt a string value for secure storage."""
    if not value:
        return value
    return fernet.encrypt(value.encode()).decode()

def decrypt_val(encrypted: str) -> str:
    """Decrypt an encrypted string value."""
    if not encrypted:
        return encrypted
    return fernet.decrypt(encrypted.encode()).decode()

class TokenCrypto:
    """Class to handle token encryption/decryption."""

    @staticmethod
    def encrypt_token(token: str) -> str:
        return encrypt_val(token)

    @staticmethod
    def decrypt_token(encrypted_token: str) -> str:
        return decrypt_val(encrypted_token)
