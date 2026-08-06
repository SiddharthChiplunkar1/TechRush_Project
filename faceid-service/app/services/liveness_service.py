import cv2
import numpy as np
from typing import List, Tuple, Optional, Dict, Any
import logging

from app.config.settings import settings
from app.exceptions.handlers import NoFaceDetectedError

logger = logging.getLogger(__name__)


class LivenessService:
    """
    Liveness detection service.

    Responsibilities:
        - Eye Aspect Ratio (EAR) calculation for blink detection
        - Head movement detection
        - Anti-spoofing preparation

    NOTE: This is a basic implementation. For production:
        - Integrate with dedicated anti-spoofing models
        - Add texture analysis (LBP, Local Binary Patterns)
        - Add depth estimation
        - Add rPPG (remote photoplethysmography) for heartbeat detection
    """

    @staticmethod
    def compute_ear(landmarks: np.ndarray) -> float:
        """
        Compute Eye Aspect Ratio (EAR) from facial landmarks.

        EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)

        Where:
            - p1, p2, p3: Left eye points
            - p4, p5, p6: Right eye points

        Args:
            landmarks: Facial landmarks (68 points)

        Returns:
            EAR value (0.0 to 1.0)
        """
        # Left eye indices: 36-41
        # Right eye indices: 42-47

        def _ear_for_eye(start_idx: int) -> float:
            p1 = landmarks[start_idx]
            p2 = landmarks[start_idx + 1]
            p3 = landmarks[start_idx + 2]
            p4 = landmarks[start_idx + 3]
            p5 = landmarks[start_idx + 4]
            p6 = landmarks[start_idx + 5]

            d1 = np.linalg.norm(p2 - p6)
            d2 = np.linalg.norm(p3 - p5)
            d3 = np.linalg.norm(p1 - p4)

            if d3 == 0:
                return 0.0

            return (d1 + d2) / (2.0 * d3)

        left_ear = _ear_for_eye(36)
        right_ear = _ear_for_eye(42)

        return (left_ear + right_ear) / 2.0

    @staticmethod
    def detect_blink(ear_values: List[float]) -> Tuple[bool, Dict[str, Any]]:
        """
        Detect blink from EAR values across frames.

        A blink is detected when:
            - At least one frame with EAR >= open_threshold
            - At least one frame with EAR < closed_threshold

        Args:
            ear_values: List of EAR values from each frame

        Returns:
            Tuple of (blink_detected: bool, stats: dict)
        """
        if len(ear_values) < 2:
            return False, {"reason": "Need at least 2 frames"}

        has_open = any(e >= settings.ear_open_threshold for e in ear_values)
        has_closed = any(e < settings.ear_closed_threshold for e in ear_values)

        stats = {
            "min_ear": min(ear_values),
            "max_ear": max(ear_values),
            "avg_ear": sum(ear_values) / len(ear_values),
            "frames_analyzed": len(ear_values),
            "has_open_eye": has_open,
            "has_closed_eye": has_closed,
        }

        return has_open and has_closed, stats

    @staticmethod
    def detect_head_movement(
        landmarks_list: List[Optional[np.ndarray]]
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Detect head movement across frames.

        TODO: Implement head movement detection using:
            - Nose tip movement (index 30)
            - Chin movement (index 8)

        Args:
            landmarks_list: List of facial landmarks per frame

        Returns:
            Tuple of (movement_detected: bool, stats: dict)
        """
        # Filter out None values
        valid_landmarks = [lm for lm in landmarks_list if lm is not None]

        if len(valid_landmarks) < 2:
            return False, {"reason": "Need at least 2 frames with valid landmarks"}

        # TODO: Implement head movement detection
        # For now, return True if we have enough frames
        # This is a placeholder - production should use actual movement detection
        return len(valid_landmarks) >= settings.min_live_frames, {
            "frames_analyzed": len(valid_landmarks),
            "status": "movement_detection_pending_implementation",
        }

    @staticmethod
    def analyze_liveness(
        ear_values: List[float],
        landmarks_list: List[Optional[np.ndarray]],
        required_frames: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Comprehensive liveness analysis.

        Args:
            ear_values: List of EAR values from each frame
            landmarks_list: List of facial landmarks from each frame
            required_frames: Minimum frames required (default from settings)

        Returns:
            Dict with liveness results
        """
        if required_frames is None:
            required_frames = settings.min_live_frames

        if len(ear_values) < required_frames:
            return {
                "live": False,
                "reason": f"Insufficient frames. Need at least {required_frames}, got {len(ear_values)}",
                "blink_detected": False,
                "head_movement": False,
                "ear_stats": {"min": None, "max": None, "avg": None},
            }

        # Detect blink
        blink_detected, blink_stats = LivenessService.detect_blink(ear_values)

        # Detect head movement
        movement_detected, movement_stats = LivenessService.detect_head_movement(
            landmarks_list
        )

        # Combine results
        # For now, require blink detection for liveness
        live = blink_detected

        return {
            "live": live,
            "blink_detected": blink_detected,
            "head_movement": movement_detected,
            "ear_stats": blink_stats,
            "movement_stats": movement_stats,
            "reason": (
                "Liveness passed: blink detected"
                if live
                else "Liveness failed: no blink detected"
            ),
        }

    @staticmethod
    def extract_ear_from_face(face_data: Dict[str, Any]) -> Optional[float]:
        """
        Extract EAR from face detection data.

        Args:
            face_data: Face detection result from InsightFace

        Returns:
            EAR value or None if landmarks are missing
        """
        landmarks = face_data.get("landmarks")

        if landmarks is None:
            return None

        # Convert to numpy array if needed
        if not isinstance(landmarks, np.ndarray):
            landmarks = np.array(landmarks)

        # InsightFace provides 5-point landmarks (eyes, nose, mouth corners)
        # We need 68-point landmarks for EAR. For now, return None.
        # TODO: Use 68-point landmark model for accurate EAR

        # For 5-point landmarks (InsightFace default):
        # - Left eye center: indices 0, 1
        # - Right eye center: indices 2, 3
        # We can approximate EAR, but not accurate
        return None