import io
import csv
from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.prediction import Prediction
from app.services.analytics_service import analytics_service
from app.schemas import AnalyticsOverviewResponse

router = APIRouter(prefix="/analytics", tags=["Analytics & KPIs"])

@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_analytics_overview(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return analytics_service.get_overview(db=db, days=days)

@router.get("/export/csv")
def export_predictions_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Prediction)
    if current_user.role == "patient":
        query = query.filter(Prediction.user_id == current_user.id)

    preds = query.order_by(Prediction.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Prediction ID", "Scan ID", "Filename", "Predicted Class",
        "Confidence (%)", "Inference Time (ms)", "Model Backbone", "Timestamp"
    ])

    for p in preds:
        filename = p.scan.original_filename if p.scan else "N/A"
        writer.writerow([
            p.id,
            p.scan_id,
            filename,
            p.predicted_class,
            round(p.confidence * 100, 2),
            round(p.inference_time_ms, 1),
            p.model_version,
            p.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=quantum_tumor_analytics_export.csv"}
    )
