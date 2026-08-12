# FaceID Service

Passwordless face-recognition authentication microservice.

## Recognition model

Production uses InsightFace `buffalo_l` by default: SCRFD face detection and
ArcFace `w600k_r50` embeddings. The Docker image downloads the pinned model
archive and verifies its SHA-256 checksum during build. If model loading fails,
the service fails startup instead of downgrading to the OpenCV test matcher.

The pretrained InsightFace weights are licensed for non-commercial research by
their upstream project. Obtain a commercially licensed model before deploying
this service commercially.

## Endpoints

| Endpoint | Purpose | Key rule |
|---|---|---|
| `POST /faceid/enroll` | Store a face embedding for a user | Rejects if 0 or >1 faces detected |
| `POST /faceid/verify` | Single-frame match, no liveness | Testing only — not the real login path |
| `POST /faceid/verify-live` | Match + liveness (blink detection) | Needs ≥3 frames; both match AND live must pass |
| `GET /health` | Container healthcheck | Returns `{"status": "ok"}` |

## Algorithm

- **Identity**: 128-d embedding via `face_recognition`, Euclidean distance < 0.6 = match
- **Liveness**: Eye Aspect Ratio (EAR) across a frame burst — requires a real open→closed
  transition (EAR ≥ 0.21 in one frame, < 0.21 in another), not just an average. This is
  what distinguishes a live blink from a printed photo or a screen replay.
- **Storage**: flat JSON file (`face_store.json`) keyed by `userId` — fine for a
  prototype/demo, but has no concurrency safety. Replace with a real DB (pgvector,
  Milvus, Redis) before scaling past a single instance.

## Run standalone

```bash
python3 -m venv venv && source venv/bin/activate
# cmake is required to build dlib — install it first, it's the slow step
brew install cmake   # or: apt install cmake
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Run with Docker

```bash
docker build -t faceid-service .
docker run -p 8000:8000 -v faceid-data:/app/data faceid-service
```

## Sanity checks

```bash
curl localhost:8000/health
# -> {"status":"ok"}

curl -X POST localhost:8000/faceid/enroll \
  -H "Content-Type: application/json" \
  -d '{"userId": "123", "imageBase64": "<base64-jpeg>"}'

curl -X POST localhost:8000/faceid/verify-live \
  -H "Content-Type: application/json" \
  -d '{"userId": "123", "frames": ["<base64-jpeg-1>", "<base64-jpeg-2>", "<base64-jpeg-3>"]}'
```

`verify-live` frames should be a short burst (5–10 frames is plenty) captured over
roughly half a second to a second — enough to catch a natural blink.
