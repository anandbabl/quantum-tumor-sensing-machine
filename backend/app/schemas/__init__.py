from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# --- User & Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    phone_number: Optional[str] = None
    role: Optional[str] = "medical_professional"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenRefresh(BaseModel):
    refresh_token: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    phone_number: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Patient Schemas ---
class PatientCreate(BaseModel):
    patient_code: Optional[str] = None
    name: str
    dob: Optional[str] = None
    age: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    medical_history: Optional[str] = None
    notes: Optional[str] = None
    assigned_doctor_id: Optional[str] = None

class PatientResponse(BaseModel):
    id: str
    patient_code: str
    name: str
    dob: Optional[str] = None
    age: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    medical_history: Optional[str] = None
    notes: Optional[str] = None
    assigned_doctor_id: Optional[str] = None
    created_at: datetime
    scan_count: Optional[int] = 0

    class Config:
        from_attributes = True

# --- MRI Scan Schemas ---
class ScanResponse(BaseModel):
    id: str
    original_filename: str
    file_path: str
    file_size: int
    mime_type: str
    uploaded_at: datetime
    patient_id: Optional[str] = None
    has_prediction: bool = False

    class Config:
        from_attributes = True

# --- Prediction & Grad-CAM Schemas ---
class ClassProbability(BaseModel):
    class_name: str
    probability: float
    percentage: float

class PredictionResponse(BaseModel):
    id: str
    scan_id: str
    predicted_class: str
    confidence: float
    confidence_percentage: float
    probabilities: List[ClassProbability]
    inference_time_ms: float
    heatmap_path: Optional[str] = None
    pure_heatmap_path: Optional[str] = None
    model_version: str
    created_at: datetime
    scan_url: Optional[str] = None

    class Config:
        from_attributes = True

# --- Chatbot Schemas ---
class MessageCreate(BaseModel):
    content: str
    scan_id: Optional[str] = None
    groq_api_key: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    sender_role: str
    content: str
    model_used: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: str
    title: str
    scan_id: Optional[str]
    created_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

# --- Report Schemas ---
class ReportResponse(BaseModel):
    id: str
    prediction_id: str
    report_code: str
    pdf_path: str
    download_url: str
    generated_at: datetime
    predicted_class: Optional[str] = None
    confidence: Optional[float] = None

    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Analytics Schemas ---
class ClassDistributionItem(BaseModel):
    name: str
    count: int
    percentage: float

class DailyTrendItem(BaseModel):
    date: str
    scans: int
    glioma: int
    meningioma: int
    pituitary: int

class AnalyticsOverviewResponse(BaseModel):
    total_scans: int
    total_predictions: int
    average_confidence: float
    average_inference_time_ms: float
    class_distribution: List[ClassDistributionItem]
    daily_trends: List[DailyTrendItem]
    recent_activity_count: int

# --- Admin Schemas ---
class SystemHealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: str
    model_backbone: str
    num_classes: int
    accuracy_rating: float
    total_users: int
    total_scans: int
    groq_api_status: str
    storage_used_mb: float
