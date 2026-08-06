import abc
import base64
import numpy as np
import cv2

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


class OpenCVFaceMatcher(FaceMatcher):
    """
    Mock FaceMatcher using OpenCV Haar Cascades for face detection.
    Extracts a basic mock embedding (flattened pixels of the face or histogram) 
    since no deep learning models are available locally.
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
        
        # Simple mock embedding using flattened pixel values (normalized)
        embedding = face_roi.flatten().astype(np.float32) / 255.0
        
        # Return as base64 encoded numpy array
        return base64.b64encode(embedding.tobytes()).decode('utf-8')

    def verify(self, image_base64: str, stored_embedding_str: str, threshold: float) -> float:
        # 1. Get embedding for the new image
        img = self._decode_image(image_base64)
        face_roi = self._get_face_roi(img)
        current_embedding = face_roi.flatten().astype(np.float32) / 255.0
        
        # 2. Decode the stored embedding
        try:
            stored_bytes = base64.b64decode(stored_embedding_str)
            stored_embedding = np.frombuffer(stored_bytes, dtype=np.float32)
        except Exception:
            raise MatchFailedError("Could not decode stored embedding")
            
        # 3. Compare them (Euclidean distance converted to similarity score)
        # Using a simple MSE based similarity for this mock
        mse = np.mean((current_embedding - stored_embedding) ** 2)
        
        # mse is small when faces are similar. Max MSE is 1.0 (since normalized 0-1)
        # Similarity score: 1.0 - mse
        similarity = 1.0 - mse
        
        if similarity < threshold:
            raise MatchFailedError(f"Similarity {similarity:.4f} below threshold {threshold}")
            
        return float(similarity)
