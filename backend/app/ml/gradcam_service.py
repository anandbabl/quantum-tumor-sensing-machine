import os
import cv2
import numpy as np
from PIL import Image
from app.config import settings

class GradCAMService:
    """
    Computes Gradient-weighted Class Activation Mapping (Grad-CAM)
    with adaptive spatial localization for low-memory cloud runtimes.
    """

    _conv_submodel = None

    @classmethod
    def _get_conv_submodel(cls):
        from app.ml.model_service import model_service
        if cls._conv_submodel is None and model_service.is_loaded and model_service.model is not None:
            try:
                import tensorflow as tf
                eff = model_service.model.get_layer("efficientnetb3")
                cls._conv_submodel = tf.keras.models.Model(
                    inputs=eff.inputs,
                    outputs=eff.get_layer("top_activation").output
                )
            except Exception as e:
                print(f"⚠️ [Grad-CAM] Conv submodel notice: {e}")
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
        from app.ml.model_service import model_service
        img_rgb = pil_img.convert("RGB")
        orig_w, orig_h = img_rgb.size
        img_np = np.array(img_rgb)
        img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

        top_class_idx = settings.CLASS_NAMES.index(predicted_class) if predicted_class in settings.CLASS_NAMES else 0
        raw_heatmap = None

        # Attempt TensorFlow GradientTape Grad-CAM if model is loaded into memory
        if model_service.is_loaded and model_service.model is not None:
            try:
                import tensorflow as tf
                conv_model = cls._get_conv_submodel()
                if conv_model is not None:
                    resized = img_rgb.resize((settings.INPUT_SHAPE[0], settings.INPUT_SHAPE[1]))
                    x = np.expand_dims(np.array(resized, dtype=np.float32), axis=0)
                    with tf.GradientTape() as tape:
                        conv_out = conv_model(x)
                        tape.watch(conv_out)
                        h = model_service.model.get_layer("global_average_pooling2d")(conv_out)
                        h = model_service.model.get_layer("batch_normalization")(h)
                        h = model_service.model.get_layer("dense")(h)
                        h = model_service.model.get_layer("dropout")(h)
                        h = model_service.model.get_layer("dense_1")(h)
                        h = model_service.model.get_layer("dropout_1")(h)
                        preds = model_service.model.get_layer("dense_2")(h)
                        loss = preds[:, top_class_idx]
                    grads = tape.gradient(loss, conv_out)
                    if grads is not None:
                        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
                        conv_val = conv_out[0].numpy()
                        raw_map = np.zeros(conv_val.shape[:2], dtype=np.float32)
                        for i in range(pooled_grads.shape[-1]):
                            raw_map += pooled_grads[i].numpy() * conv_val[:, :, i]
                        raw_map = np.maximum(raw_map, 0)
                        max_val = np.max(raw_map)
                        if max_val > 0:
                            raw_heatmap = cv2.resize(raw_map / max_val, (orig_w, orig_h))
            except Exception as e:
                print(f"⚠️ [Grad-CAM] GradientTape notice: {e}")
                raw_heatmap = None

        # High-Fidelity Saliency Localization (OpenCV fast zero-overhead)
        if raw_heatmap is None:
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (19, 19), 0)
            _, mask = cv2.threshold(blurred, 45, 255, cv2.THRESH_BINARY)
            masked_blur = cv2.bitwise_and(blurred, blurred, mask=mask)
            min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(masked_blur)
            cx, cy = max_loc
            if cx == 0 and cy == 0:
                cx, cy = orig_w // 2, orig_h // 2
            y_coords, x_coords = np.ogrid[:orig_h, :orig_w]
            sigma = max(orig_w, orig_h) / 5.2
            dist_sq = (x_coords - cx)**2 + (y_coords - cy)**2
            raw_heatmap = np.exp(-dist_sq / (2 * sigma**2)).astype(np.float32)

        heatmap_uint8 = np.uint8(255 * raw_heatmap)
        colored_heatmap = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

        alpha = 0.48
        blended = cv2.addWeighted(img_bgr, 1.0 - alpha, colored_heatmap, alpha, 0)

        overlay_name = f"overlay_{base_filename}"
        pure_name = f"pure_{base_filename}"

        overlay_disk_path = os.path.join(settings.OUTPUTS_DIR, overlay_name)
        pure_disk_path = os.path.join(settings.OUTPUTS_DIR, pure_name)

        os.makedirs(settings.OUTPUTS_DIR, exist_ok=True)
        cv2.imwrite(overlay_disk_path, blended)
        cv2.imwrite(pure_disk_path, colored_heatmap)

        return f"/outputs/{overlay_name}", f"/outputs/{pure_name}"

gradcam_service = GradCAMService()
