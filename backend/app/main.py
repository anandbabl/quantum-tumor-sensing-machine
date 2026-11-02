from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.ml.model_service import model_service

from app.api.auth import router as auth_router
from app.api.mri import router as mri_router
from app.api.predictions import router as predictions_router
from app.api.chat import router as chat_router
from app.api.analytics import router as analytics_router
from app.api.patients import router as patients_router
from app.api.reports import router as reports_router
from app.api.admin import router as admin_router
from app.api.performance import router as performance_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize Database Tables
    print("📦 [Quantum Tumor Sensing Engine] Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    # 2. Seed Default Accounts if DB is empty
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == "admin@quantumtumor.ai").first()
        if not admin_user:
            print("🌱 [Quantum Engine] Seeding default administrator account...")
            admin = User(
                email="admin@quantumtumor.ai",
                hashed_password=get_password_hash("AdminPass123!"),
                full_name="Dr. Alex Rivera (Lead Neuropathologist & Admin)",
                role="administrator",
                is_active=True
            )
            db.add(admin)

        researcher_user = db.query(User).filter(User.email == "researcher@quantumtumor.ai").first()
        if not researcher_user:
            print("🌱 [Quantum Engine] Seeding default quantum researcher account...")
            researcher = User(
                email="researcher@quantumtumor.ai",
                hashed_password=get_password_hash("ResearchPass123!"),
                full_name="Dr. Elena Rostova, PhD (Quantum ML Lead)",
                role="researcher",
                is_active=True
            )
            db.add(researcher)

        doctor_user = db.query(User).filter(User.email == "doctor@quantumtumor.ai").first()
        if not doctor_user:
            print("🌱 [Quantum Engine] Seeding default medical professional account...")
            doctor = User(
                email="doctor@quantumtumor.ai",
                hashed_password=get_password_hash("DoctorPass123!"),
                full_name="Dr. Sarah Chen, MD (Chief Neuro-Oncology)",
                role="medical_professional",
                is_active=True
            )
            db.add(doctor)

        db.commit()
    except Exception as e:
        print(f"⚠️ [Quantum Engine] Seeding notice: {e}")
        db.rollback()
    finally:
        db.close()

    # 3. Load Trained Keras Model into RAM
    print("🧠 [Quantum Tumor Sensing Engine] Loading trained 96% Keras model into memory...")
    model_service.load_model()

    print("🚀 [Quantum Tumor Sensing Engine] System ready to receive MRI requests.")
    yield
    print("🛑 [Quantum Tumor Sensing Engine] Shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Advanced AI-powered brain tumor detection and clinical decision support system.",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for images, heatmaps, reports
app.mount("/uploads", StaticFiles(directory=settings.UPLOADS_DIR), name="uploads")
app.mount("/outputs", StaticFiles(directory=settings.OUTPUTS_DIR), name="outputs")
app.mount("/reports", StaticFiles(directory=settings.REPORTS_DIR), name="reports")
app.mount("/sample_scans", StaticFiles(directory=settings.SAMPLES_DIR), name="sample_scans")

# Include Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(mri_router, prefix=settings.API_PREFIX)
app.include_router(predictions_router, prefix=settings.API_PREFIX)
app.include_router(chat_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(patients_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(admin_router, prefix=settings.API_PREFIX)
app.include_router(performance_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/api/health"
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "model_loaded": model_service.is_loaded,
        "model_backbone": settings.MODEL_BACKBONE,
        "classes": settings.CLASS_NAMES
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
