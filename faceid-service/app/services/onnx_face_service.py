import cv2
import numpy as np
import onnxruntime as ort
from typing import Tuple, List, Optional, Dict, Any
import logging
import os

from app.exceptions.handlers import NoFaceDetectedError, MultipleFacesDetectedError
from app.config.settings import settings

logger = logging.getLogger(__name__)


class RecognitionService:
    """
    Face recognition using ONNX models directly.
    No InsightFace dependency.
    """

    def __init__(self):
        self.detector = None
        self.recognizer = None
        self._load_models()

    def _load_models(self):
        """Load ONNX models for detection and recognition."""
        try:
            # Check if model files exist
            detector_path = os.path.join(settings.model_dir, settings.detector_model)
            recognizer_path = os.path.join(settings.model_dir, settings.recognition_model)

            if not os.path.exists(detector_path):
                logger.warning(f"Detector model not found at {detector_path}. Using fallback.")
                # Try alternative path
                detector_path = "app/models/scrfd_10g_bnkps.onnx"

            if not os.path.exists(recognizer_path):
                logger.warning(f"Recognizer model not found at {recognizer_path}. Using fallback.")
                recognizer_path = "app/models/w600k_r50.onnx"

            # Face detection model (SCRFD)
            self.detector = ort.InferenceSession(
                detector_path,
                providers=[settings.execution_provider]
            )

            # Face recognition model (ArcFace)
            self.recognizer = ort.InferenceSession(
                recognizer_path,
                providers=[settings.execution_provider]
            )

            logger.info(f"✅ ONNX models loaded: {settings.detector_model}, {settings.recognition_model}")

        except Exception as e:
            logger.error(f"Failed to load ONNX models: {str(e)}")
            raise RuntimeError(f"ONNX model loading failed: {str(e)}")

    def _preprocess_detection(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for detection model."""
        # Resize to detection size
        h, w = image.shape[:2]
        target_w, target_h = settings.detection_size

        # Pad to maintain aspect ratio
        scale = min(target_w / w, target_h / h)
        new_w = int(w * scale)
        new_h = int(h * scale)

        resized = cv2.resize(image, (new_w, new_h))

        # Pad to target size
        pad_w = (target_w - new_w) // 2
        pad_h = (target_h - new_h) // 2

        padded = cv2.copyMakeBorder(
            resized, pad_h, target_h - new_h - pad_h,
            pad_w, target_w - new_w - pad_w,
            cv2.BORDER_CONSTANT, value=(127.5, 127.5, 127.5)
        )

        # Normalize and convert to blob
        normalized = (padded - 127.5) / 127.5
        blob = np.transpose(normalized, (2, 0, 1))
        blob = np.expand_dims(blob, axis=0).astype(np.float32)

        return blob, (scale, pad_w, pad_h, w, h)

    def _postprocess_detection(self, outputs, scale_info) -> List[Dict[str, Any]]:
        """Parse detection outputs."""
        # SCRFD outputs: scores, bboxes, landmarks
        # This is a simplified parser - actual implementation depends on model output format
        scores = outputs[0][0]  # shape: [num_dets]
        bboxes = outputs[1][0]  # shape: [num_dets, 4]

        _, pad_w, pad_h, orig_w, orig_h = scale_info

        faces = []
        for i, score in enumerate(scores):
            if score < 0.5:
                continue

            # Adjust bbox to original image coordinates
            x1, y1, x2, y2 = bboxes[i]
            x1 = (x1 - pad_w) * (orig_w / (settings.detection_size[0] - pad_w * 2))
            y1 = (y1 - pad_h) * (orig_h / (settings.detection_size[1] - pad_h * 2))
            x2 = (x2 - pad_w) * (orig_w / (settings.detection_size[0] - pad_w * 2))
            y2 = (y2 - pad_h) * (orig_h / (settings.detection_size[1] - pad_h * 2))

            faces.append({
                "bbox": [float(x1), float(y1), float(x2), float(y2)],
                "det_score": float(score),
                "landmarks": None,  # Could extract if needed
            })

        return faces

    def detect_single_face(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Detect exactly one face in the image.

        Returns:
            Dict with: bbox, det_score, embedding

        Raises:
            NoFaceDetectedError: If no faces found
            MultipleFacesDetectedError: If more than one face found
        """
        # Preprocess
        blob, scale_info = self._preprocess_detection(image)

        # Run detection
        outputs = self.detector.run(None, {"input": blob})

        # Parse results
        faces = self._postprocess_detection(outputs, scale_info)

        if len(faces) == 0:
            raise NoFaceDetectedError("No face detected in the image")

        if len(faces) > 1:
            raise MultipleFacesDetectedError(
                f"Multiple faces detected ({len(faces)}). Please provide exactly one face."
            )

        face = faces[0]
        bbox = face["bbox"]

        # Crop face
        x1, y1, x2, y2 = [int(v) for v in bbox]
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(image.shape[1], x2), min(image.shape[0], y2)

        if x2 <= x1 or y2 <= y1:
            raise NoFaceDetectedError("Invalid face bounding box")

        face_crop = image[y1:y2, x1:x2]

        # Generate embedding
        embedding = self.generate_embedding(face_crop)

        face["embedding"] = embedding
        face["embedding_list"] = embedding.tolist()

        return face

    def generate_embedding(self, face_crop: np.ndarray) -> np.ndarray:
        """Generate face embedding from cropped face."""
        # Preprocess for recognition
        face_resized = cv2.resize(face_crop, (112, 112))

        # Normalize to [-1, 1]
        face_normalized = (face_resized - 127.5) / 127.5
        blob = np.transpose(face_normalized, (2, 0, 1))
        blob = np.expand_dims(blob, axis=0).astype(np.float32)

        # Run inference
        outputs = self.recognizer.run(None, {"input": blob})
        embedding = outputs[0][0]

        # Normalize
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm

        return embedding

    def compare_embeddings(
        self,
        embedding1: np.ndarray,
        embedding2: np.ndarray,
        threshold: Optional[float] = None
    ) -> Tuple[bool, float]:
        """Compare two embeddings using cosine similarity."""
        if threshold is None:
            threshold = settings.similarity_threshold

        similarity = float(np.dot(embedding1, embedding2))
        match = similarity >= threshold

        return match, similarity