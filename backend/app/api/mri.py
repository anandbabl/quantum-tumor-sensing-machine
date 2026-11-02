import os
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from PIL import Image
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.scan import MRIScan
from app.models.patient import Patient
from app.models.prediction import Prediction
from app.models.audit import AuditLog
from app.schemas import ScanResponse
from app.config import settings

router = APIRouter(prefix="/mri", tags=["MRI Scans"])

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/jpg"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

@router.post("/upload", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
async def upload_scan(
    file: UploadFile = File(...),
    patient_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format: {file.content_type}. Please upload JPG, JPEG, or PNG."
        )

    # Read content to validate size and image decoding
    contents = await file.read()
    file_size = len(contents)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowable size of 25 MB."
        )

    # Validate PIL decoding
    try:
        import io
        pil_img = Image.open(io.BytesIO(contents))
        pil_img.verify()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted image file: {str(e)}"
        )

    # Reset position and save file safely
    file_ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    unique_filename = f"{uuid.uuid4().hex[:12]}_{file.filename}"
    saved_rel_path = f"/uploads/{unique_filename}"
    saved_abs_path = os.path.join(settings.UPLOADS_DIR, unique_filename)

    with open(saved_abs_path, "wb") as f:
        f.write(contents)

    # Create scan record
    scan = MRIScan(
        user_id=current_user.id,
        patient_id=patient_id,
        original_filename=file.filename,
        file_path=saved_rel_path,
        file_size=file_size,
        mime_type=file.content_type
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    audit = AuditLog(
        user_id=current_user.id,
        action="SCAN_UPLOAD",
        resource="mri_scans",
        details=f"Uploaded {file.filename} ({file_size} bytes)"
    )
    db.add(audit)
    db.commit()

    return ScanResponse(
        id=scan.id,
        original_filename=scan.original_filename,
        file_path=scan.file_path,
        file_size=scan.file_size,
        mime_type=scan.mime_type,
        uploaded_at=scan.uploaded_at,
        patient_id=scan.patient_id,
        has_prediction=False
    )

@router.get("/scans", response_model=List[ScanResponse])
def get_scans(
    patient_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(MRIScan)
    # Role-based filtering: Patients see only their scans
    if current_user.role == "patient":
        query = query.filter(MRIScan.user_id == current_user.id)
    elif patient_id:
        query = query.filter(MRIScan.patient_id == patient_id)

    scans = query.order_by(MRIScan.uploaded_at.desc()).all()
    results = []
    for s in scans:
        has_pred = db.query(Prediction).filter(Prediction.scan_id == s.id).first() is not None
        results.append(
            ScanResponse(
                id=s.id,
                original_filename=s.original_filename,
                file_path=s.file_path,
                file_size=s.file_size,
                mime_type=s.mime_type,
                uploaded_at=s.uploaded_at,
                patient_id=s.patient_id,
                has_prediction=has_pred
            )
        )
    return results

@router.get("/scans/{scan_id}", response_model=ScanResponse)
def get_scan(scan_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scan = db.query(MRIScan).filter(MRIScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MRI Scan not found")
    if current_user.role == "patient" and scan.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    has_pred = db.query(Prediction).filter(Prediction.scan_id == scan.id).first() is not None
    return ScanResponse(
        id=scan.id,
        original_filename=scan.original_filename,
        file_path=scan.file_path,
        file_size=scan.file_size,
        mime_type=scan.mime_type,
        uploaded_at=scan.uploaded_at,
        patient_id=scan.patient_id,
        has_prediction=has_pred
    )

@router.delete("/scans/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scan(scan_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scan = db.query(MRIScan).filter(MRIScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    if current_user.role == "patient" and scan.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Remove physical file if exists
    abs_path = os.path.join(settings.BASE_DIR, scan.file_path.lstrip("/"))
    if os.path.exists(abs_path):
        try:
            os.remove(abs_path)
        except Exception:
            pass

    db.delete(scan)
    db.commit()
    return None

@router.get("/samples")
def get_sample_scans():
    """Returns pre-loaded sample MRI scans for instant testing."""
    samples = []
    if os.path.exists(settings.SAMPLES_DIR):
        for f in sorted(os.listdir(settings.SAMPLES_DIR)):
            if f.endswith((".png", ".jpg", ".jpeg")):
                label = "Sample MRI"
                if "glioma" in f.lower():
                    label = "Glioma Verified Sample"
                elif "meningioma" in f.lower():
                    label = "Meningioma Verified Sample"
                elif "pituitary" in f.lower():
                    label = "Pituitary Verified Sample"
                elif "tumor" in f.lower():
                    label = "Brain Tumor MRI Sample"
                samples.append({
                    "filename": f,
                    "label": label,
                    "url": f"/sample_scans/{f}"
                })
    return samples

@router.post("/sample/{sample_filename}/use", response_model=ScanResponse)
def use_sample_scan(
    sample_filename: str,
    patient_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Loads a pre-loaded sample scan directly into user's scan repository."""
    src_path = os.path.join(settings.SAMPLES_DIR, sample_filename)
    if not os.path.exists(src_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sample scan not found")

    unique_filename = f"{uuid.uuid4().hex[:12]}_{sample_filename}"
    dst_abs_path = os.path.join(settings.UPLOADS_DIR, unique_filename)
    shutil.copyfile(src_path, dst_abs_path)

    file_size = os.path.getsize(dst_abs_path)
    mime_type = "image/png" if sample_filename.endswith(".png") else "image/jpeg"

    scan = MRIScan(
        user_id=current_user.id,
        patient_id=patient_id,
        original_filename=sample_filename,
        file_path=f"/uploads/{unique_filename}",
        file_size=file_size,
        mime_type=mime_type
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    return ScanResponse(
        id=scan.id,
        original_filename=scan.original_filename,
        file_path=scan.file_path,
        file_size=scan.file_size,
        mime_type=scan.mime_type,
        uploaded_at=scan.uploaded_at,
        patient_id=scan.patient_id,
        has_prediction=False
    )
