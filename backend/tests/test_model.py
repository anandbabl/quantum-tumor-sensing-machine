import os
import pytest
from PIL import Image
from app.config import settings
from app.ml.model_service import model_service
from app.ml.gradcam_service import gradcam_service

def test_model_loading():
    model_service.load_model()
    assert model_service.is_loaded is True
    assert model_service.model is not None
    info = model_service.get_info()
    assert info["num_classes"] == 3
    assert "Glioma Tumor" in info["classes"]

def test_model_prediction_pipeline():
    model_service.load_model()
    sample_path = os.path.join(settings.SAMPLES_DIR, "sample_scan_tumor.jpeg")
    assert os.path.exists(sample_path), f"Sample scan missing at {sample_path}"

    img = Image.open(sample_path)
    predicted_class, confidence, all_probs, latency_ms = model_service.predict(img)

    assert predicted_class in settings.CLASS_NAMES
    assert 0.0 <= confidence <= 1.0
    assert len(all_probs) == 3
    assert latency_ms > 0
    # Sum of probabilities should be approximately 1
    total_p = sum(p.probability for p in all_probs)
    assert abs(total_p - 1.0) < 0.01

def test_gradcam_generation():
    model_service.load_model()
    sample_path = os.path.join(settings.SAMPLES_DIR, "sample_scan_tumor.jpeg")
    img = Image.open(sample_path)
    output_filename = "test_test_heatmap.jpg"

    overlay_url, pure_url = gradcam_service.generate_gradcam(img, "Glioma Tumor", output_filename)
    overlay_path = os.path.join(settings.OUTPUTS_DIR, f"overlay_{output_filename}")
    pure_path = os.path.join(settings.OUTPUTS_DIR, f"pure_{output_filename}")
    
    assert os.path.exists(overlay_path), f"Overlay missing at {overlay_path}"
    assert os.path.exists(pure_path), f"Pure heatmap missing at {pure_path}"
    assert overlay_url == f"/outputs/overlay_{output_filename}"
    assert pure_url == f"/outputs/pure_{output_filename}"
