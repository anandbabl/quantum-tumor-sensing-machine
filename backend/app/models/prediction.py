import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("mri_scans.id"), unique=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    predicted_class = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    probabilities_json = Column(Text, nullable=False)  # JSON string of all class probabilities
    inference_time_ms = Column(Float, nullable=False)
    heatmap_path = Column(String(500), nullable=True)  # True Grad-CAM overlay image path
    pure_heatmap_path = Column(String(500), nullable=True)  # True Grad-CAM pure heatmap path
    model_version = Column(String(50), default="EfficientNetB3-v1.0", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    scan = relationship("MRIScan", back_populates="prediction")
    report = relationship("Report", back_populates="prediction", uselist=False, cascade="all, delete-orphan")
