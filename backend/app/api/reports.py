import os
import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.prediction import Prediction
from app.models.report import Report
from app.models.notification import Notification
from app.models.audit import AuditLog
from app.services.report_service import report_service
from app.schemas import ReportResponse
from app.config import settings

router = APIRouter(prefix="/reports", tags=["Reports & PDFs"])

@router.post("/generate/{prediction_id}", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def generate_report(
    prediction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
    if current_user.role == "patient" and pred.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Check if report already generated
    existing = db.query(Report).filter(Report.prediction_id == pred.id).first()
    if existing and os.path.exists(existing.pdf_path):
        return ReportResponse(
            id=existing.id,
            prediction_id=existing.prediction_id,
            report_code=existing.report_code,
            pdf_path=existing.pdf_path,
            download_url=f"/api/reports/{existing.id}/download",
            generated_at=existing.generated_at,
            predicted_class=pred.predicted_class,
            confidence=round(pred.confidence * 100, 2)
        )

    # Generate ReportLab PDF
    report_code = f"QT-REP-{random.randint(10000, 99999)}"
    filename = f"{report_code}_{pred.id[:8]}.pdf"
    patient = pred.scan.patient if pred.scan else None

    try:
        pdf_path = report_service.generate_pdf_report(
            prediction=pred,
            scan=pred.scan,
            patient=patient,
            output_filename=filename
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"PDF Generation failed: {e}")

    report = Report(
        prediction_id=pred.id,
        user_id=current_user.id,
        report_code=report_code,
        pdf_path=pdf_path
    )
    db.add(report)

    notif = Notification(
        user_id=current_user.id,
        title="PDF Report Ready",
        message=f"Clinical decision report {report_code} generated for {pred.predicted_class}.",
        notification_type="info"
    )
    db.add(notif)

    audit = AuditLog(
        user_id=current_user.id,
        action="REPORT_GENERATE",
        resource="reports",
        details=f"Generated report {report_code} for prediction {pred.id}"
    )
    db.add(audit)
    db.commit()
    db.refresh(report)

    return ReportResponse(
        id=report.id,
        prediction_id=report.prediction_id,
        report_code=report.report_code,
        pdf_path=report.pdf_path,
        download_url=f"/api/reports/{report.id}/download",
        generated_at=report.generated_at,
        predicted_class=pred.predicted_class,
        confidence=round(pred.confidence * 100, 2)
    )

@router.get("", response_model=List[ReportResponse])
def get_reports(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Report).join(Prediction)
    if current_user.role == "patient":
        query = query.filter(Report.user_id == current_user.id)

    reports = query.order_by(Report.generated_at.desc()).all()
    results = []
    for r in reports:
        pred = r.prediction
        results.append(
            ReportResponse(
                id=r.id,
                prediction_id=r.prediction_id,
                report_code=r.report_code,
                pdf_path=r.pdf_path,
                download_url=f"/api/reports/{r.id}/download",
                generated_at=r.generated_at,
                predicted_class=pred.predicted_class if pred else "Unknown",
                confidence=round(pred.confidence * 100, 2) if pred else 0.0
            )
        )
    return results

@router.get("/{report_id}/download")
def download_report(report_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    if current_user.role == "patient" and report.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if not os.path.exists(report.pdf_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF file missing on disk")

    return FileResponse(
        report.pdf_path,
        media_type="application/pdf",
        filename=os.path.basename(report.pdf_path)
    )
