import base64
import cv2
import numpy as np
import face_recognition
import os
import pickle
import logging

logger = logging.getLogger(__name__)

# Temporary in-memory store for embeddings.
# In a real microservice, this should be a vector database like pgvector, Milvus, or Redis.
EMBEDDINGS_DIR = "/app/data/embeddings"

class FaceService:
    def __init__(self):
        # Create persistent storage dir if it doesn't exist
        os.makedirs(EMBEDDINGS_DIR, exist_ok=True)
    
    def decode_image(self, image_base64: str) -> np.ndarray:
        """Decodes base64 image string to OpenCV format."""
        try:
            # Handle possible data URL scheme like 'data:image/jpeg;base64,...'
            if "," in image_base64:
                image_base64 = image_base64.split(",")[1]
                
            img_data = base64.b64decode(image_base64)
            np_arr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            if img is None:
                raise ValueError("Could not decode image from Base64")
            return img
        except Exception as e:
            logger.error(f"Error decoding image: {str(e)}")
            raise ValueError(f"Invalid Base64 image data: {str(e)}")

    def extract_embedding(self, image: np.ndarray) -> np.ndarray:
        """Extracts 128D face embedding using face_recognition."""
        # Convert BGR (OpenCV) to RGB (face_recognition)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Detect faces
        face_locations = face_recognition.face_locations(rgb_image)
        if not face_locations:
            raise ValueError("No face detected in the image")
        if len(face_locations) > 1:
            raise ValueError("Multiple faces detected. Please provide an image with only one face.")
            
        # Extract embedding
        face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
        if not face_encodings:
            raise ValueError("Could not extract face encoding")
            
        return face_encodings[0]

    def _get_embedding_path(self, user_id: str) -> str:
        return os.path.join(EMBEDDINGS_DIR, f"{user_id}.pkl")

    def enroll_user(self, user_id: str, image_base64: str):
        """Enrolls a new user by storing their face embedding."""
        try:
            image = self.decode_image(image_base64)
            embedding = self.extract_embedding(image)
            
            # Save embedding to disk
            path = self._get_embedding_path(user_id)
            with open(path, "wb") as f:
                pickle.dump(embedding, f)
                
            logger.info(f"Successfully enrolled face for user {user_id}")
        except Exception as e:
            logger.error(f"Failed to enroll user {user_id}: {str(e)}")
            raise

    def check_liveness(self, image: np.ndarray) -> bool:
        """
        Basic liveness check stub.
        In a real production app, this would use active liveness (e.g., blink detection, 
        challenge-response) or passive liveness (e.g., 3D depth check, texture analysis)
        to prevent print attacks or screen replays.
        """
        # STUB: Assume live for now unless image is artificially small
        if image.shape[0] < 100 or image.shape[1] < 100:
            return False
        return True

    def verify_user(self, user_id: str, image_base64: str) -> tuple[bool, float, bool]:
        """
        Verifies if the provided image matches the enrolled face for the user.
        Returns: (is_match, confidence, is_live)
        """
        try:
            # Check if user is enrolled
            path = self._get_embedding_path(user_id)
            if not os.path.exists(path):
                raise ValueError(f"User {user_id} is not enrolled for Face ID")
                
            # Load stored embedding
            with open(path, "rb") as f:
                known_embedding = pickle.load(f)
                
            # Extract new embedding
            image = self.decode_image(image_base64)
            unknown_embedding = self.extract_embedding(image)
            
            # Compare faces
            # The lower the distance, the more similar the faces are. 0.6 is typical strict threshold.
            distance = face_recognition.face_distance([known_embedding], unknown_embedding)[0]
            
            # Convert distance to a confidence score (0.0 to 1.0)
            # Distance of 0 = 1.0 confidence. Distance of 1 = 0.0 confidence.
            confidence = 1.0 - distance
            
            # strict matching (confidence >= 0.85 approx distance <= 0.15) for banking apps
            # but default face_recognition uses distance < 0.6. Let's use distance < 0.45 for safety.
            match_threshold = 0.45
            is_match = distance < match_threshold
            
            # Check liveness
            is_live = self.check_liveness(image)
            
            return is_match, float(confidence), is_live
            
        except Exception as e:
            logger.error(f"Failed to verify user {user_id}: {str(e)}")
            raise
