import abc
import base64
import numpy as np
import cv2
from insightface.app import FaceAnalysis

from app.config.settings import settings

from app.exceptions.handlers import (
    NoFaceDetectedError,
    MultipleFacesDetectedError,
    InvalidImageError,
    MatchFailedError
)

class FaceMatcher(abc.ABC):
    @abc.abstractmethod
    def extract_embedding(self, image_base64: str) -> str:
        """
        Extracts face embedding from base64 image and returns it as a string
        (can be a base64 encoded numpy array or JSON string depending on implementation).
        Raises NoFaceDetectedError, MultipleFacesDetectedError, InvalidImageError.
        """
        pass

    @abc.abstractmethod
    def verify(self, image_base64: str, stored_embedding_str: str, threshold: float) -> float:
        """
        Verifies if the face in image_base64 matches the stored_embedding_str.
        Returns the similarity score.
        Raises MatchFailedError if similarity is below threshold.
        """
        pass

    @abc.abstractmethod
    def liveness_signature(self, image_base64: str) -> np.ndarray:
        """Return a normalized face crop used only for motion checks."""
        pass


class OpenCVFaceMatcher(FaceMatcher):
    """
    Conservative local matcher used when a dedicated ArcFace model is not
    installed. It combines normalized facial gradients and local texture
    instead of comparing raw pixels, which is substantially less permissive
    across lighting and different faces.

    This remains a fallback matcher, not a certified biometric system.
    """
    def __init__(self):
        # Load the pre-trained Haar Cascade classifier for face detection
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)

    def _decode_image(self, image_base64: str) -> np.ndarray:
        try:
            if "," in image_base64:
                image_base64 = image_base64.split(",")[1]
                
            # Fix base64 padding issues
            if len(image_base64) % 4 == 1:
                image_base64 = image_base64[:-1]
            padding = len(image_base64) % 4
            if padding:
                image_base64 += "=" * (4 - padding)
                
            img_data = base64.b64decode(image_base64)
            np_arr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if img is None:
                raise InvalidImageError("Could not decode image")
            return img
        except Exception as e:
            raise InvalidImageError(f"Invalid image encoding: {str(e)}")

    def _get_face_roi(self, img: np.ndarray) -> np.ndarray:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        if len(faces) == 0:
            raise NoFaceDetectedError("No face detected in the image")
        if len(faces) > 1:
            raise MultipleFacesDetectedError("Multiple faces detected in the image")
            
        x, y, w, h = faces[0]
        face_roi = gray[y:y+h, x:x+w]
        # Resize to standard size
        face_roi = cv2.resize(face_roi, (100, 100))
        return face_roi

    def extract_embedding(self, image_base64: str) -> str:
        img = self._decode_image(image_base64)
        face_roi = self._get_face_roi(img)

        embedding = self._build_embedding(face_roi)
        return base64.b64encode(embedding.tobytes()).decode('utf-8')

    def verify(self, image_base64: str, stored_embedding_str: str, threshold: float) -> float:
        img = self._decode_image(image_base64)
        face_roi = self._get_face_roi(img)
        current_embedding = self._build_embedding(face_roi)
        
        # 2. Decode the stored embedding
        try:
            stored_bytes = base64.b64decode(stored_embedding_str)
            stored_embedding = np.frombuffer(stored_bytes, dtype=np.float32)
        except Exception:
            raise MatchFailedError("Could not decode stored embedding")
            
        if stored_embedding.shape != current_embedding.shape:
            # Reject templates produced by the old raw-pixel matcher rather
            # than comparing incompatible representations.
            raise MatchFailedError("Face template is not compatible")

        similarity = float(np.dot(current_embedding, stored_embedding))
        
        if similarity < threshold:
            raise MatchFailedError(f"Similarity {similarity:.4f} below threshold {threshold}")
            
        return float(similarity)

    def liveness_signature(self, image_base64: str) -> np.ndarray:
        return self._get_face_roi(self._decode_image(image_base64)).astype(np.float32) / 255.0

    def _build_embedding(self, face_roi: np.ndarray) -> np.ndarray:
        """Build a normalized gradient/texture descriptor for one face crop."""
        normalized = cv2.resize(face_roi, (128, 128), interpolation=cv2.INTER_AREA)
        normalized = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(normalized)

        hog = cv2.HOGDescriptor(
            (128, 128), (16, 16), (8, 8), (8, 8), 9
        ).compute(normalized).reshape(-1)

        # Uniform local binary pattern histograms retain stable facial texture
        # while avoiding direct dependence on absolute pixel values.
        center = normalized[1:-1, 1:-1]
        lbp = np.zeros_like(center, dtype=np.uint8)
        for bit, (dy, dx) in enumerate(((-1, -1), (-1, 0), (-1, 1), (0, 1),
                                         (1, 1), (1, 0), (1, -1), (0, -1))):
            lbp |= ((normalized[1 + dy:127 + dy, 1 + dx:127 + dx] >= center) << bit).astype(np.uint8)

        texture = []
        for row in np.array_split(lbp, 4, axis=0):
            for cell in np.array_split(row, 4, axis=1):
                histogram, _ = np.histogram(cell, bins=16, range=(0, 256))
                texture.extend(histogram.astype(np.float32) / max(float(cell.size), 1.0))

        shape = cv2.resize(normalized, (32, 32), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
        shape = (shape - float(shape.mean())) / max(float(shape.std()), 1e-6)

        # Keep geometry in the descriptor so mirrored or structurally
        # different faces do not collapse to the same gradient signature.
        embedding = np.concatenate([
            hog.astype(np.float32),
            np.asarray(texture, dtype=np.float32),
            (shape * 0.75).reshape(-1),
        ])
        norm = np.linalg.norm(embedding)
        if norm == 0:
            raise MatchFailedError("Could not create face template")
        return embedding / norm


class ArcFaceMatcher(FaceMatcher):
    """InsightFace SCRFD + ArcFace matcher for production biometric identity."""

    def __init__(self):
        self.analysis = FaceAnalysis(
            name=settings.insightface_model,
            root=settings.insightface_root,
            providers=["CPUExecutionProvider"],
        )
        self.analysis.prepare(ctx_id=-1, det_size=(640, 640))

    def _decode_image(self, image_base64: str) -> np.ndarray:
        try:
            if "," in image_base64:
                image_base64 = image_base64.split(",", 1)[1]
            data = base64.b64decode(image_base64)
            image = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
            if image is None:
                raise InvalidImageError("Could not decode image")
            return image
        except (ValueError, InvalidImageError) as exc:
            raise InvalidImageError("Invalid image encoding") from exc

    def _get_face(self, image: np.ndarray):
        faces = self.analysis.get(image)
        if not faces:
            raise NoFaceDetectedError("No face detected in the image")
        if len(faces) != 1:
            raise MultipleFacesDetectedError("Multiple faces detected in the image")
        return faces[0]

    def extract_embedding(self, image_base64: str) -> str:
        face = self._get_face(self._decode_image(image_base64))
        embedding = np.asarray(face.embedding, dtype=np.float32)
        norm = np.linalg.norm(embedding)
        if norm == 0:
            raise MatchFailedError("Could not create face template")
        return base64.b64encode((embedding / norm).tobytes()).decode("ascii")

    def verify(self, image_base64: str, stored_embedding_str: str, threshold: float) -> float:
        current = base64.b64decode(self.extract_embedding(image_base64))
        current = np.frombuffer(current, dtype=np.float32)
        stored = np.frombuffer(base64.b64decode(stored_embedding_str), dtype=np.float32)
        if current.shape != stored.shape:
            raise MatchFailedError("Face template is not compatible")
        similarity = float(np.dot(current, stored))
        if similarity < threshold:
            raise MatchFailedError("Face similarity is below the verification threshold")
        return similarity

    def liveness_signature(self, image_base64: str) -> np.ndarray:
        image = self._decode_image(image_base64)
        face = self._get_face(image)
        x1, y1, x2, y2 = [max(0, int(value)) for value in face.bbox]
        crop = image[y1:min(image.shape[0], y2), x1:min(image.shape[1], x2)]
        if crop.size == 0:
            raise NoFaceDetectedError("Invalid face crop")
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        return cv2.resize(gray, (100, 100)).astype(np.float32) / 255.0
