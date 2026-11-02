import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.user import User
from app.models.scan import MRIScan
from app.models.notification import Notification
from app.models.audit import AuditLog
from app.ml.model_service import model_service
from app.services.groq_service import groq_service
from app.schemas import SystemHealthResponse, UserResponse, NotificationResponse
from app.config import settings

router = APIRouter(tags=["Admin & Notifications"])

@router.get("/admin/system-health", response_model=SystemHealthResponse)
def get_system_health(
    current_user: User = Depends(require_roles(["admin", "doctor"])),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_scans = db.query(MRIScan).count()

    # Calculate storage size
    storage_mb = 0.0
    for d in [settings.UPLOADS_DIR, settings.OUTPUTS_DIR, settings.REPORTS_DIR]:
        if os.path.exists(d):
            for f in os.listdir(d):
                fp = os.path.join(d, f)
                if os.path.isfile(fp):
                    storage_mb += os.path.getsize(fp) / (1024 * 1024)

    groq_status = groq_service.check_health()

    return SystemHealthResponse(
        status="Operational" if model_service.is_loaded else "Degraded",
        model_loaded=model_service.is_loaded,
        model_name="QUANTUM TUMOR SENSING MACHINE Classifier",
        model_backbone=settings.MODEL_BACKBONE,
        num_classes=len(settings.CLASS_NAMES),
        accuracy_rating=settings.ACCURACY_RATING,
        total_users=total_users,
        total_scans=total_scans,
        groq_api_status=groq_status,
        storage_used_mb=round(storage_mb, 2)
    )

@router.get("/admin/users", response_model=List[UserResponse])
def get_all_users(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [UserResponse.model_validate(u) for u in users]

@router.get("/admin/audit-logs")
def get_audit_logs(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "resource": l.resource,
            "details": l.details,
            "timestamp": l.created_at.isoformat()
        }
        for l in logs
    ]

@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(30)
        .all()
    )
    return [NotificationResponse.model_validate(n) for n in notifs]

@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif and notif.user_id == current_user.id:
        notif.is_read = True
        db.commit()
    return {"status": "success"}
