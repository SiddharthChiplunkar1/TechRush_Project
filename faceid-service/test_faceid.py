import base64
import json
import urllib.request

# ── change this to your actual photo path ──
PHOTO_PATH = r"C:\Users\pavan\Downloads\matt.jpg"
USER_ID = "pavan"
URL = "http://localhost:8000"

def to_base64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

def post(endpoint, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{URL}{endpoint}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

# ── 1. Enroll ──
print("\n--- ENROLL ---")
img = to_base64(PHOTO_PATH)
result = post("/faceid/enroll", {"userId": USER_ID, "imageBase64": img})
print(result)

# ── 2. Verify (single frame, no liveness) ──
print("\n--- VERIFY ---")
result = post("/faceid/verify", {"userId": USER_ID, "imageBase64": img})
print(result)

# ── 3. Verify-live (same image 5x — live will be False, that's correct) ──
print("\n--- VERIFY-LIVE (expect live=False with a static photo) ---")
result = post("/faceid/verify-live", {"userId": USER_ID, "frames": [img] * 5})
print(result)