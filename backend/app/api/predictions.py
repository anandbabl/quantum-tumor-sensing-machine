import os
import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from PIL import Image
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.scan import MRIScan
from app.models.prediction import Prediction
from app.models.notification import Notification
from app.models.audit import AuditLog
from app.ml.model_service import model_service
from app.ml.gradcam_service import gradcam_service
from app.schemas import PredictionResponse, ClassProbability
from app.config import settings

router = APIRouter(prefix="/predictions", tags=["Predictions & Inference"])

@router.post("/analyze/{scan_id}", response_model=PredictionResponse)
def analyze_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(MRIScan).filter(MRIScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MRI Scan not found")

    if current_user.role == "patient" and scan.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Locate image file
    abs_img_path = os.path.join(settings.BASE_DIR, scan.file_path.lstrip("/"))
    if not os.path.exists(abs_img_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan image file missing from disk")

    try:
        pil_img = Image.open(abs_img_path)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to decode image: {e}")

    # 1. Execute actual trained Keras model inference
    try:
        predicted_class, confidence, all_probs, latency_ms = model_service.predict(pil_img)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"ML Inference failed: {e}")

    # 2. Compute True Grad-CAM heatmap
    base_fn = f"{scan.id[:10]}_{uuid.uuid4().hex[:6]}.jpg"
    try:
        overlay_url, pure_url = gradcam_service.generate_gradcam(pil_img, predicted_class, base_fn)
    except Exception as e:
        print(f"⚠️ Heatmap generation notice: {e}")
        overlay_url = None
        pure_url = None

    # 3. Store or update Prediction in Database
    existing_pred = db.query(Prediction).filter(Prediction.scan_id == scan.id).first()
    probs_serialized = json.dumps([p.model_dump() for p in all_probs])

    if existing_pred:
        existing_pred.predicted_class = predicted_class
        existing_pred.confidence = confidence
        existing_pred.probabilities_json = probs_serialized
        existing_pred.inference_time_ms = latency_ms
        existing_pred.heatmap_path = overlay_url
        existing_pred.pure_heatmap_path = pure_url
        existing_pred.model_version = settings.MODEL_BACKBONE
        pred = existing_pred
    else:
        pred = Prediction(
            scan_id=scan.id,
            user_id=current_user.id,
            predicted_class=predicted_class,
            confidence=confidence,
            probabilities_json=probs_serialized,
            inference_time_ms=latency_ms,
            heatmap_path=overlay_url,
            pure_heatmap_path=pure_url,
            model_version=settings.MODEL_BACKBONE
        )
        db.add(pred)

    # 4. Generate in-app Notification
    notif = Notification(
        user_id=current_user.id,
        title="MRI Analysis Complete",
        message=f"Scan '{scan.original_filename}' classified as {predicted_class} ({confidence * 100:.1f}% confidence).",
        notification_type="success"
    )
    db.add(notif)

    # 5. Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        action="PREDICTION_EXECUTE",
        resource="predictions",
        details=f"Inference on {scan.original_filename}: {predicted_class} ({confidence*100:.2f}%) in {latency_ms}ms"
    )
    db.add(audit)
    db.commit()
    db.refresh(pred)

    return PredictionResponse(
        id=pred.id,
        scan_id=pred.scan_id,
        predicted_class=pred.predicted_class,
        confidence=pred.confidence,
        confidence_percentage=round(pred.confidence * 100, 2),
        probabilities=all_probs,
        inference_time_ms=pred.inference_time_ms,
        heatmap_path=pred.heatmap_path,
        pure_heatmap_path=pred.pure_heatmap_path,
        model_version=pred.model_version,
        created_at=pred.created_at,
        scan_url=scan.file_path
    )

@router.get("/history", response_model=List[PredictionResponse])
def get_prediction_history(
    tumor_class: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Prediction).join(MRIScan)
    if current_user.role == "patient":
        query = query.filter(Prediction.user_id == current_user.id)
    if tumor_class:
        query = query.filter(Prediction.predicted_class == tumor_class)

    preds = query.order_by(Prediction.created_at.desc()).all()
    results = []
    for p in preds:
        probs = [ClassProbability(**item) for item in json.loads(p.probabilities_json)]
        results.append(
            PredictionResponse(
                id=p.id,
                scan_id=p.scan_id,
                predicted_class=p.predicted_class,
                confidence=p.confidence,
                confidence_percentage=round(p.confidence * 100, 2),
                probabilities=probs,
                inference_time_ms=p.inference_time_ms,
                heatmap_path=p.heatmap_path,
                pure_heatmap_path=p.pure_heatmap_path,
                model_version=p.model_version,
                created_at=p.created_at,
                scan_url=p.scan.file_path if p.scan else None
            )
        )
    return results

@router.get("/{prediction_id}", response_model=PredictionResponse)
def get_prediction(prediction_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
    if current_user.role == "patient" and p.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    probs = [ClassProbability(**item) for item in json.loads(p.probabilities_json)]
    return PredictionResponse(
        id=p.id,
        scan_id=p.scan_id,
        predicted_class=p.predicted_class,
        confidence=p.confidence,
        confidence_percentage=round(p.confidence * 100, 2),
        probabilities=probs,
        inference_time_ms=p.inference_time_ms,
        heatmap_path=p.heatmap_path,
        pure_heatmap_path=p.pure_heatmap_path,
        model_version=p.model_version,
        created_at=p.created_at,
        scan_url=p.scan.file_path if p.scan else None
    )

@router.get("/scan/{scan_id}", response_model=Optional[PredictionResponse])
def get_prediction_by_scan(scan_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = db.query(Prediction).filter(Prediction.scan_id == scan_id).first()
    if not p:
        return None
    if current_user.role == "patient" and p.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    probs = [ClassProbability(**item) for item in json.loads(p.probabilities_json)]
    return PredictionResponse(
        id=p.id,
        scan_id=p.scan_id,
        predicted_class=p.predicted_class,
        confidence=p.confidence,
        confidence_percentage=round(p.confidence * 100, 2),
        probabilities=probs,
        inference_time_ms=p.inference_time_ms,
        heatmap_path=p.heatmap_path,
        pure_heatmap_path=p.pure_heatmap_path,
        model_version=p.model_version,
        created_at=p.created_at,
        scan_url=p.scan.file_path if p.scan else None
    )
