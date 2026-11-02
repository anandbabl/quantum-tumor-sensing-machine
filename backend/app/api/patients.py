import uuid
import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.user import User
from app.models.patient import Patient
from app.models.scan import MRIScan
from app.schemas import PatientCreate, PatientResponse

router = APIRouter(prefix="/patients", tags=["Patient Management"])

ALLOWED_ROLES = ["admin", "administrator", "doctor", "medical_professional", "researcher"]

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: PatientCreate,
    current_user: User = Depends(require_roles(ALLOWED_ROLES)),
    db: Session = Depends(get_db)
):
    code = patient_in.patient_code or f"QT-PAT-{random.randint(1000, 9999)}"
    patient = Patient(
        patient_code=code,
        name=patient_in.name,
        dob=patient_in.dob,
        age=patient_in.age,
        gender=patient_in.gender,
        blood_group=patient_in.blood_group,
        medical_history=patient_in.medical_history,
        notes=patient_in.notes,
        assigned_doctor_id=patient_in.assigned_doctor_id or current_user.id
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    return PatientResponse(
        id=patient.id,
        patient_code=patient.patient_code,
        name=patient.name,
        dob=patient.dob,
        age=patient.age,
        gender=patient.gender,
        blood_group=patient.blood_group,
        medical_history=patient.medical_history,
        notes=patient.notes,
        assigned_doctor_id=patient.assigned_doctor_id,
        created_at=patient.created_at,
        scan_count=0
    )

@router.get("", response_model=List[PatientResponse])
def get_patients(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Patient)
    patients = query.order_by(Patient.created_at.desc()).all()
    results = []
    for p in patients:
        scans_count = db.query(MRIScan).filter(MRIScan.patient_id == p.id).count()
        results.append(
            PatientResponse(
                id=p.id,
                patient_code=p.patient_code,
                name=p.name,
                dob=p.dob,
                age=p.age,
                gender=p.gender,
                blood_group=p.blood_group,
                medical_history=p.medical_history,
                notes=p.notes,
                assigned_doctor_id=p.assigned_doctor_id,
                created_at=p.created_at,
                scan_count=scans_count
            )
        )
    return results

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient record not found")

    scans_count = db.query(MRIScan).filter(MRIScan.patient_id == patient.id).count()
    return PatientResponse(
        id=patient.id,
        patient_code=patient.patient_code,
        name=patient.name,
        dob=patient.dob,
        age=patient.age,
        gender=patient.gender,
        blood_group=patient.blood_group,
        medical_history=patient.medical_history,
        notes=patient.notes,
        assigned_doctor_id=patient.assigned_doctor_id,
        created_at=patient.created_at,
        scan_count=scans_count
    )

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: str,
    patient_in: PatientCreate,
    current_user: User = Depends(require_roles(ALLOWED_ROLES)),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient record not found")

    if patient_in.name:
        patient.name = patient_in.name
    if patient_in.dob is not None:
        patient.dob = patient_in.dob
    if patient_in.age is not None:
        patient.age = patient_in.age
    if patient_in.gender is not None:
        patient.gender = patient_in.gender
    if patient_in.blood_group is not None:
        patient.blood_group = patient_in.blood_group
    if patient_in.medical_history is not None:
        patient.medical_history = patient_in.medical_history
    if patient_in.notes is not None:
        patient.notes = patient_in.notes

    db.commit()
    db.refresh(patient)

    scans_count = db.query(MRIScan).filter(MRIScan.patient_id == patient.id).count()
    return PatientResponse(
        id=patient.id,
        patient_code=patient.patient_code,
        name=patient.name,
        dob=patient.dob,
        age=patient.age,
        gender=patient.gender,
        blood_group=patient.blood_group,
        medical_history=patient.medical_history,
        notes=patient.notes,
        assigned_doctor_id=patient.assigned_doctor_id,
        created_at=patient.created_at,
        scan_count=scans_count
    )

@router.delete("/{patient_id}")
def delete_patient(
    patient_id: str,
    current_user: User = Depends(require_roles(["admin", "administrator"])),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient record not found")

    db.delete(patient)
    db.commit()
    return {"status": "deleted", "patient_id": patient_id}
