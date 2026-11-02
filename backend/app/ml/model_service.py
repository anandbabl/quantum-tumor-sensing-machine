import os
import time
import numpy as np
from PIL import Image
from app.config import settings
import keras
from app.schemas import ClassProbability

class ModelService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelService, cls).__new__(cls)
            cls._instance.model = None
            cls._instance.is_loaded = False
            cls._instance.load_error = None
        return cls._instance

    def load_model(self):
        """Loads the trained 96% EfficientNetB3 Keras model into memory once."""
        if self.is_loaded:
            return

        model_path = settings.MODEL_PATH
        print(f"🔄 [Quantum Tumor ML] Loading trained model from: {model_path}...")

        if not os.path.exists(model_path):
            self.load_error = f"Model file not found at: {model_path}"
            print(f"❌ [Quantum Tumor ML] {self.load_error}")
            return

        try:
            self.model = keras.models.load_model(model_path)
            self.is_loaded = True
            self.load_error = None
            print(f"✅ [Quantum Tumor ML] Model successfully loaded into memory!")
            print(f"   Backbone: {settings.MODEL_BACKBONE}")
            print(f"   Input Shape: {self.model.input_shape}")
            print(f"   Output Shape: {self.model.output_shape}")
            print(f"   Classes: {settings.CLASS_NAMES}")
        except Exception as e:
            self.load_error = str(e)
            print(f"❌ [Quantum Tumor ML] Failed to load model: {e}")

    def predict(self, pil_image: Image.Image) -> tuple[str, float, list[ClassProbability], float]:
        """
        Preprocesses MRI image to (1, 300, 300, 3) and performs model inference.
        Returns: (predicted_class, confidence, all_probabilities, inference_time_ms)
        """
        if not self.is_loaded or self.model is None:
            self.load_model()
            if not self.is_loaded:
                raise RuntimeError(f"ML Model is unavailable: {self.load_error}")

        start_time = time.time()

        # Preprocessing: convert to RGB, resize to (300, 300), convert to float32
        target_size = (settings.INPUT_SHAPE[0], settings.INPUT_SHAPE[1])
        resized_img = pil_image.convert("RGB").resize(target_size)
        img_arr = np.array(resized_img, dtype=np.float32)

        # Shape: (1, 300, 300, 3)
        input_tensor = np.expand_dims(img_arr, axis=0)

        # Inference execution
        raw_preds = self.model.predict(input_tensor, verbose=0)
        inference_time_ms = round((time.time() - start_time) * 1000, 2)

        # Softmax probabilities
        probs = raw_preds[0].astype(float)
        sum_p = np.sum(probs)
        if sum_p > 0:
            probs = probs / sum_p

        top_idx = int(np.argmax(probs))
        predicted_class = settings.CLASS_NAMES[top_idx]
        confidence = float(probs[top_idx])

        all_probs: list[ClassProbability] = []
        for idx, c_name in enumerate(settings.CLASS_NAMES):
            p = float(probs[idx])
            all_probs.append(
                ClassProbability(
                    class_name=c_name,
                    probability=round(p, 4),
                    percentage=round(p * 100, 2)
                )
            )

        return predicted_class, confidence, all_probs, inference_time_ms

    def get_info(self) -> dict:
        return {
            "model_name": settings.PROJECT_NAME,
            "tagline": settings.TAGLINE,
            "backbone": settings.MODEL_BACKBONE,
            "input_shape": list(settings.INPUT_SHAPE),
            "num_classes": len(settings.CLASS_NAMES),
            "classes": settings.CLASS_NAMES,
            "accuracy": settings.ACCURACY_RATING,
            "is_loaded": self.is_loaded,
            "load_error": self.load_error
        }

model_service = ModelService()
