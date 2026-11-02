import os
from pathlib import Path
from pydantic_settings import BaseSettings

APP_DIR = Path(__file__).resolve().parent.parent

# Set isolated paths and minimal memory limits before Keras / Matplotlib load
os.environ["KERAS_HOME"] = str(APP_DIR / ".keras_home")
os.environ["MPLCONFIGDIR"] = str(APP_DIR / ".matplotlib_home")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_NUM_INTRAOP_THREADS"] = "1"
os.environ["TF_NUM_INTEROP_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.makedirs(os.environ["KERAS_HOME"], exist_ok=True)
os.makedirs(os.environ["MPLCONFIGDIR"], exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "QUANTUM TUMOR SENSING MACHINE"
    TAGLINE: str = "Intelligent Brain MRI Analysis & Tumor Classification Platform"
    VERSION: str = "2.0.0-PROD"
    API_PREFIX: str = "/api"
    BASE_DIR: str = str(APP_DIR)

    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "quantum-tumor-sensing-super-secure-production-secret-key-32-bytes")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database (PostgreSQL with zero-setup SQLite fallback)
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{APP_DIR}/quantum_tumor.db")

    # ML Model Configuration
    MODEL_PATH: str = str(APP_DIR / "models" / "brain_tumor_model.keras")
    INPUT_SHAPE: tuple[int, int, int] = (300, 300, 3)
    CLASS_NAMES: list[str] = ["Glioma Tumor", "Meningioma Tumor", "Pituitary Tumor"]
    ACCURACY_RATING: float = 0.9624
    MODEL_BACKBONE: str = "EfficientNetB3 (Transfer Learning)"

    # Storage Paths
    UPLOADS_DIR: str = str(APP_DIR / "uploads")
    OUTPUTS_DIR: str = str(APP_DIR / "outputs")
    REPORTS_DIR: str = str(APP_DIR / "reports")
    SAMPLES_DIR: str = str(APP_DIR / "sample_scans")

    # Groq API Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    GROQ_FALLBACK_MODEL: str = "llama-3.1-8b-instant"

    # Server & CORS
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,https://*.vercel.app,*"
        ).split(",")
        if origin.strip()
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
os.makedirs(settings.OUTPUTS_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)
os.makedirs(settings.SAMPLES_DIR, exist_ok=True)
