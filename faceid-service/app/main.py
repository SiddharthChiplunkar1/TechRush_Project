from fastapi import FastAPI

app = FastAPI(title="faceid-service")


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": "faceid-service", "status": "up"}
