import base64
import json
import logging
import os
from typing import List, Optional, Tuple

import cv2
import face_recognition
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("faceid-service")

# ---------------------------------------------------------------------------
# Storage — prototype-scale flat JSON file, keyed by userId.
# NOTE: this is fine for a hackathon/demo. For real scale, replace with a
# vector DB (pgvector, Milvus, Redis) — a single JSON file has no concurrency
# safety and will not survive multiple service replicas.
# ---------------------------------------------------------------------------
STORE_PATH = os.environ.get("FACE_STORE_PATH", "/app/data/face_store.json")
MATCH_THRESHOLD = 0.6      # face_recognition's own default distance threshold
EAR_THRESHOLD = 0.21       # below this, eye is considered "closed"
MIN_LIVE_FRAMES = 3        # verify-live requires at least this many usable frames


def _load_store() -> dict:
    if not os.path.exists(STORE_PATH):
        return {}
    try:
        with open(STORE_PATH, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        logger.error(f"Failed to read face store, treating as empty: {e}")
        return {}


def _save_store(store: dict) -> None:
    os.makedirs(os.path.dirname(STORE_PATH), exist_ok=True)
    with open(STORE_PATH, "w") as f:
        json.dump(store, f)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class FaceEnrollRequest(BaseModel):
    userId: str
    imageBase64: str


class FaceVerifyRequest(BaseModel):
    userId: str
    imageBase64: str


class FaceVerifyLiveRequest(BaseModel):
    userId: str
    frames: List[str]  # base64 images — a short burst captured by the client, e.g. 5-10 frames


class FaceEnrollResult(BaseModel):
    success: bool
    message: str


class FaceVerifyResult(BaseModel):
    success: bool
    match: bool
    confidence: float
    message: Optional[str] = None


class FaceVerifyLiveResult(BaseModel):
    success: bool
    match: bool
    live: bool
    confidence: float
    message: Optional[str] = None


# ---------------------------------------------------------------------------
# Errors
# ---------------------------------------------------------------------------
class DecodeError(Exception):
    """Raised when an image (or one frame of a burst) can't be decoded or has no usable face."""


# ---------------------------------------------------------------------------
# Core face logic
# ---------------------------------------------------------------------------
def decode_image(image_base64: str) -> np.ndarray:
    """Decodes a base64 (optionally data-URL-prefixed) string into an OpenCV BGR image."""
    try:
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        img_data = base64.b64decode(image_base64, validate=True)
        np_arr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            raise DecodeError("Could not decode image data")
        return img
    except DecodeError:
        raise
    except Exception as e:
        raise DecodeError(f"Invalid base64 image data: {e}")


def extract_face(image: np.ndarray) -> Tuple[np.ndarray, dict]:
    """Returns (128-d embedding, landmarks dict) for the single face in the image.
    Rejects images with zero or more than one detected face."""
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    locations = face_recognition.face_locations(rgb)
    if not locations:
        raise DecodeError("No face detected in the image")
    if len(locations) > 1:
        raise DecodeError("Multiple faces detected — provide an image with only one face")

    encodings = face_recognition.face_encodings(rgb, locations)
    landmarks_list = face_recognition.face_landmarks(rgb, locations)
    if not encodings or not landmarks_list:
        raise DecodeError("Could not extract face encoding")

    return encodings[0], landmarks_list[0]


def _eye_aspect_ratio(eye_points: List[Tuple[int, int]]) -> float:
    """
    Standard EAR formula (Soukupová & Čech, 2016):
        EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
    eye_points is the 6-point eye contour face_recognition returns: [p1..p6].
    A steep drop in EAR indicates a blink; a roughly constant EAR across frames
    indicates a static image (photo/screen replay).
    """
    pts = np.array(eye_points, dtype=np.float64)
    vertical_1 = np.linalg.norm(pts[1] - pts[5])
    vertical_2 = np.linalg.norm(pts[2] - pts[4])
    horizontal = np.linalg.norm(pts[0] - pts[3])
    if horizontal == 0:
        return 0.0
    return (vertical_1 + vertical_2) / (2.0 * horizontal)


def average_ear(landmarks: dict) -> Optional[float]:
    left_eye = landmarks.get("left_eye")
    right_eye = landmarks.get("right_eye")
    if not left_eye or not right_eye or len(left_eye) < 6 or len(right_eye) < 6:
        return None
    return (_eye_aspect_ratio(left_eye) + _eye_aspect_ratio(right_eye)) / 2.0


def compare_embeddings(known: np.ndarray, unknown: np.ndarray) -> Tuple[bool, float]:
    distance = face_recognition.face_distance([np.array(known)], unknown)[0]
    confidence = max(0.0, 1.0 - float(distance))
    return distance < MATCH_THRESHOLD, confidence


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="TechRush FaceID Service",
    description="Microservice for passwordless face recognition authentication",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok"}


@app.post("/faceid/enroll", response_model=FaceEnrollResult, tags=["Face Authentication"])
def enroll(request: FaceEnrollRequest):
    """Stores a face embedding for a user. Rejects images with 0 or >1 faces detected."""
    try:
        image = decode_image(request.imageBase64)
        embedding, _ = extract_face(image)
    except DecodeError as e:
        return FaceEnrollResult(success=False, message=str(e))

    store = _load_store()
    store[request.userId] = embedding.tolist()
    _save_store(store)
    logger.info(f"Enrolled face for user {request.userId}")
    return FaceEnrollResult(success=True, message="Face enrolled successfully")


@app.post("/faceid/verify", response_model=FaceVerifyResult, tags=["Face Authentication"])
def verify(request: FaceVerifyRequest):
    """Single-frame match, no liveness check. Testing only — not the real login path."""
    store = _load_store()
    if request.userId not in store:
        return FaceVerifyResult(success=False, match=False, confidence=0.0,
                                 message=f"User {request.userId} is not enrolled for Face ID")
    try:
        image = decode_image(request.imageBase64)
        embedding, _ = extract_face(image)
    except DecodeError as e:
        return FaceVerifyResult(success=False, match=False, confidence=0.0, message=str(e))

    known = np.array(store[request.userId])
    is_match, confidence = compare_embeddings(known, embedding)
    return FaceVerifyResult(success=True, match=is_match, confidence=confidence)


@app.post("/faceid/verify-live", response_model=FaceVerifyLiveResult, tags=["Face Authentication"])
def verify_live(request: FaceVerifyLiveRequest):
    """
    The real login path: needs >=3 frames, and both match AND live must pass.

    - match: majority of usable frames must match the enrolled embedding
    - live: the EAR sequence across frames must show a genuine open->closed
      transition (a blink), not just a constant value — which is what a
      printed photo or a phone/screen replay would produce.

    Frames that fail to decode or contain no usable face are skipped rather
    than failing the whole request over one bad frame.
    """
    if len(request.frames) < MIN_LIVE_FRAMES:
        return FaceVerifyLiveResult(success=False, match=False, live=False, confidence=0.0,
                                     message=f"Need at least {MIN_LIVE_FRAMES} frames, got {len(request.frames)}")

    store = _load_store()
    if request.userId not in store:
        return FaceVerifyLiveResult(success=False, match=False, live=False, confidence=0.0,
                                     message=f"User {request.userId} is not enrolled for Face ID")
    known = np.array(store[request.userId])

    ears: List[float] = []
    match_votes: List[bool] = []
    confidences: List[float] = []
    usable_frames = 0

    for i, frame_b64 in enumerate(request.frames):
        try:
            image = decode_image(frame_b64)
            embedding, landmarks = extract_face(image)
        except DecodeError as e:
            logger.warning(f"Skipping unusable frame {i} for user {request.userId}: {e}")
            continue

        usable_frames += 1
        is_match, confidence = compare_embeddings(known, embedding)
        match_votes.append(is_match)
        confidences.append(confidence)

        ear = average_ear(landmarks)
        if ear is not None:
            ears.append(ear)

    if usable_frames < MIN_LIVE_FRAMES:
        return FaceVerifyLiveResult(
            success=False, match=False, live=False, confidence=0.0,
            message=f"Only {usable_frames}/{len(request.frames)} frames were usable; need at least {MIN_LIVE_FRAMES}",
        )

    has_open = any(e >= EAR_THRESHOLD for e in ears)
    has_closed = any(e < EAR_THRESHOLD for e in ears)
    is_live = has_open and has_closed

    is_match = sum(match_votes) > len(match_votes) / 2
    avg_confidence = sum(confidences) / len(confidences)

    message = None
    if not is_live:
        message = "No blink detected across frame burst — possible photo/screen spoof"
    elif not is_match:
        message = "Face did not match enrolled user"

    return FaceVerifyLiveResult(success=True, match=is_match, live=is_live,
                                 confidence=avg_confidence, message=message)
