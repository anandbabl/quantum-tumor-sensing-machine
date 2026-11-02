import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.core.database import Base, engine

# Ensure tables are created for tests
Base.metadata.create_all(bind=engine)

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Glioma Tumor" in data["classes"]

def test_sample_scans_endpoint(client):
    response = client.get("/api/mri/samples")
    assert response.status_code == 200
    samples = response.json()
    assert len(samples) > 0

def test_auth_and_prediction_workflow(client):
    # 1. Register a test researcher
    reg_payload = {
        "email": "researcher_test@neuroscan.ai",
        "password": "Password123!",
        "full_name": "Dr. Marie Curie",
        "role": "researcher"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    if reg_res.status_code == 400:  # If already registered from previous run
        login_res = client.post("/api/auth/login", json={"email": reg_payload["email"], "password": reg_payload["password"]})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
    else:
        assert reg_res.status_code == 201
        token = reg_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Verify current user profile
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "researcher_test@neuroscan.ai"

    # 3. Use a sample scan
    sample_res = client.post("/api/mri/sample/sample_scan_tumor.jpeg/use", headers=headers)
    assert sample_res.status_code == 200
    scan = sample_res.json()
    scan_id = scan["id"]

    # 4. Run model inference & Grad-CAM
    pred_res = client.post(f"/api/predictions/analyze/{scan_id}", headers=headers)
    assert pred_res.status_code == 200
    pred = pred_res.json()
    assert pred["predicted_class"] in settings.CLASS_NAMES
    assert pred["confidence"] > 0
    assert pred["heatmap_path"] is not None

    # 5. Generate PDF report
    rep_res = client.post(f"/api/reports/generate/{pred['id']}", headers=headers)
    assert rep_res.status_code == 201
    rep = rep_res.json()
    assert rep["report_code"].startswith("QT-REP-")
    assert os.path.exists(rep["pdf_path"])

    # 6. Test Chatbot conversation turn
    conv_res = client.post("/api/chat/conversations", json={"scan_id": scan_id}, headers=headers)
    assert conv_res.status_code == 200
    conv_id = conv_res.json()["id"]

    msg_res = client.post(
        f"/api/chat/conversations/{conv_id}/messages",
        json={"content": "What does my MRI prediction mean?"},
        headers=headers
    )
    assert msg_res.status_code == 200
    assert len(msg_res.json()["content"]) > 20

    # 7. Check Analytics overview
    analytics_res = client.get("/api/analytics/overview", headers=headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert analytics_data["total_scans"] >= 1
    assert analytics_data["total_predictions"] >= 1


def test_performance_and_quantum_endpoints(client):
    response = client.get("/api/performance/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "evaluation_benchmark" in data
    assert data["evaluation_benchmark"]["test_accuracy"] > 0.95
    assert "quantum_research" in data
    assert data["quantum_research"]["circuits"][0]["qubits"] == 4
    assert data["quantum_research"]["circuits"][1]["qubits"] == 8
    assert data["quantum_research"]["circuits"][2]["qubits"] == 16


def test_patient_crud_and_quick_chat(client):
    # Login as doctor
    login_res = client.post("/api/auth/login", json={"email": "doctor@quantumtumor.ai", "password": "DoctorPass123!"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create patient
    create_res = client.post(
        "/api/patients",
        json={
            "name": "Test Subject 01",
            "gender": "male",
            "age": "45",
            "medical_history": "Mild headache",
            "notes": "Referred from neurology"
        },
        headers=headers
    )
    assert create_res.status_code == 201
    patient = create_res.json()
    patient_id = patient["id"]
    assert patient["name"] == "Test Subject 01"
    assert patient["age"] == "45"

    # Get patient
    get_res = client.get(f"/api/patients/{patient_id}", headers=headers)
    assert get_res.status_code == 200

    # Quick chat
    chat_res = client.post(
        "/api/chat",
        json={
            "message": "Explain the significance of Glioma grade II vs grade IV",
            "context": {"predicted_class": "Glioma Tumor", "confidence": 0.96}
        },
        headers=headers
    )
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "reply" in chat_data
    assert len(chat_data["reply"]) > 30
