import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    dob = Column(String(50), nullable=True)
    age = Column(String(20), nullable=True)
    gender = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    medical_history = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    assigned_doctor_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)  # Linked user account if patient self-registered
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    scans = relationship("MRIScan", back_populates="patient", cascade="all, delete-orphan")
