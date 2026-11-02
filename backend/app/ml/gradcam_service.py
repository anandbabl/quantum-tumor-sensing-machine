import os
import cv2
import numpy as np
import tensorflow as tf
from PIL import Image
from app.config import settings
from app.ml.model_service import model_service

class GradCAMService:
    """
    Computes True Gradient-weighted Class Activation Mapping (Grad-CAM)
    on the EfficientNetB3 backbone top_activation layer.
    Extracts genuine mathematical activation gradients with respect to target class logits.
    """

    _conv_submodel = None

    @classmethod
    def _get_conv_submodel(cls):
        if cls._conv_submodel is None and model_service.is_loaded and model_service.model is not None:
            try:
                eff = model_service.model.get_layer("efficientnetb3")
                cls._conv_submodel = tf.keras.models.Model(
                    inputs=eff.inputs,
                    outputs=eff.get_layer("top_activation").output
                )
            except Exception as e:
                print(f"⚠️ [Grad-CAM] Could not build conv submodel: {e}")
                cls._conv_submodel = None
        return cls._conv_submodel

    @classmethod
    def generate_gradcam(cls, pil_img: Image.Image, predicted_class: str, base_filename: str) -> tuple[str, str]:
        """
        Generates validated Grad-CAM heatmaps:
        1. Pure colorized heatmap (/outputs/pure_heatmap_xyz.jpg)
        2. Alpha-blended scan overlay (/outputs/overlay_xyz.jpg)

        Returns: (overlay_url_path, pure_heatmap_url_path)
        """
        img_rgb = pil_img.convert("RGB")
        orig_w, orig_h = img_rgb.size
        img_np = np.array(img_rgb)
        img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

        # Preprocess input tensor for EfficientNetB3 (300, 300, 3)
        resized = img_rgb.resize((settings.INPUT_SHAPE[0], settings.INPUT_SHAPE[1]))
        x = np.expand_dims(np.array(resized, dtype=np.float32), axis=0)

        top_class_idx = settings.CLASS_NAMES.index(predicted_class) if predicted_class in settings.CLASS_NAMES else 0

        conv_model = cls._get_conv_submodel()
        if conv_model is None or model_service.model is None:
            raise RuntimeError("EfficientNetB3 conv submodel unavailable for Grad-CAM.")

        with tf.GradientTape() as tape:
            conv_out = conv_model(x)
            tape.watch(conv_out)

            # Pass through the classification head layers
            h = model_service.model.get_layer("global_average_pooling2d")(conv_out)
            h = model_service.model.get_layer("batch_normalization")(h)
            h = model_service.model.get_layer("dense")(h)
            h = model_service.model.get_layer("dropout")(h)
            h = model_service.model.get_layer("dense_1")(h)
            h = model_service.model.get_layer("dropout_1")(h)
            preds = model_service.model.get_layer("dense_2")(h)
            loss = preds[:, top_class_idx]

        grads = tape.gradient(loss, conv_out)
        if grads is None:
            raise RuntimeError("Gradient computation returned None on top_activation layer.")

        # Global average pool the gradients over spatial dimensions
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_val = conv_out[0].numpy()

        # Weight the activation maps by their corresponding pooled gradients
        raw_heatmap = np.zeros(conv_val.shape[:2], dtype=np.float32)
        for i in range(pooled_grads.shape[-1]):
            raw_heatmap += pooled_grads[i].numpy() * conv_val[:, :, i]

        # Apply ReLU to retain only positive influence features
        raw_heatmap = np.maximum(raw_heatmap, 0)
        max_val = np.max(raw_heatmap)
        if max_val > 0:
            raw_heatmap = raw_heatmap / max_val

        # Resize heatmap back to original MRI slice dimensions
        heatmap_resized = cv2.resize(raw_heatmap, (orig_w, orig_h))
        heatmap_uint8 = np.uint8(255 * heatmap_resized)
        colored_heatmap = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

        # Alpha blend: 52% original scan + 48% explainability heatmap
        alpha = 0.48
        blended = cv2.addWeighted(img_bgr, 1.0 - alpha, colored_heatmap, alpha, 0)

        overlay_name = f"overlay_{base_filename}"
        pure_name = f"pure_{base_filename}"

        overlay_disk_path = os.path.join(settings.OUTPUTS_DIR, overlay_name)
        pure_disk_path = os.path.join(settings.OUTPUTS_DIR, pure_name)

        cv2.imwrite(overlay_disk_path, blended)
        cv2.imwrite(pure_disk_path, colored_heatmap)

        return f"/outputs/{overlay_name}", f"/outputs/{pure_name}"

gradcam_service = GradCAMService()
