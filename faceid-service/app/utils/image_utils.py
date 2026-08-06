import base64
from typing import Tuple

import cv2
import numpy as np

from app.exceptions.handlers import InvalidImageError


def decode_base64_image(image_base64: str) -> np.ndarray:
    """
    Decode a base64 image into an OpenCV BGR image.

    Supports:
    - Raw base64 strings
    - Data URLs (data:image/jpeg;base64,...)

    Returns:
        OpenCV image (BGR)
    """

    try:
        # Remove data URL prefix if present
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]

        image_bytes = base64.b64decode(image_base64)

        np_arr = np.frombuffer(image_bytes, np.uint8)

        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image is None:
            raise InvalidImageError("Unable to decode image")

        return image

    except Exception as e:
        raise InvalidImageError(f"Invalid image: {str(e)}")


def validate_image_quality(image: np.ndarray) -> Tuple[bool, float]:
    """
    Check image sharpness using Laplacian variance.

    Returns:
        (is_good, score)
    """

    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    score = cv2.Laplacian(gray, cv2.CV_64F).var()

    return score > 50.0, float(score)


def resize_to_target(
    image: np.ndarray,
    target_size: Tuple[int, int]
) -> np.ndarray:
    """
    Resize while maintaining aspect ratio.

    Returns:
        Resized image.
    """

    h, w = image.shape[:2]

    target_w, target_h = target_size

    scale = min(target_w / w, target_h / h)

    new_w = int(w * scale)
    new_h = int(h * scale)

    resized = cv2.resize(image, (new_w, new_h))

    return resized


def crop_face(
    image: np.ndarray,
    box: Tuple[int, int, int, int]
) -> np.ndarray:
    """
    Crop face from bounding box.

    Args:
        image: Original image
        box: (x, y, w, h)

    Returns:
        Cropped face image
    """

    x, y, w, h = box

    return image[y:y + h, x:x + w]


def normalize_image(image: np.ndarray) -> np.ndarray:
    """
    Convert image into an ONNX-ready tensor.

    Steps:
    - Resize to 112x112
    - Convert BGR -> RGB
    - Normalize to [-1,1]
    - HWC -> CHW
    - Add batch dimension

    Returns:
        Tensor of shape (1,3,112,112)
    """

    image = cv2.resize(image, (112, 112))

    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    image = image.astype(np.float32)

    image = (image - 127.5) / 128.0

    image = np.transpose(image, (2, 0, 1))

    image = np.expand_dims(image, axis=0)

    return image


def image_to_tensor(image: np.ndarray) -> np.ndarray:
    """
    Alias for normalize_image().

    Used before inference.
    """

    return normalize_image(image)


def compute_image_hash(image: np.ndarray) -> str:
    """
    Compute SHA-256 hash of an image.

    Useful for duplicate enrollment detection.
    """

    import hashlib

    success, encoded = cv2.imencode(".jpg", image)

    if not success:
        return ""

    return hashlib.sha256(encoded.tobytes()).hexdigest()