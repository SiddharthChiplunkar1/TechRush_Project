FROM python:3.11-slim-bookworm

# Install system dependencies (only runtime libs, no build tools)
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ARG INSIGHTFACE_MODEL_URL=https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip
ARG INSIGHTFACE_MODEL_SHA256=80ffe37d8a5940d59a7384c201a2a38d4741f2f3c51eef46ebb28218a7b0ca2f

RUN mkdir -p /models/insightface/models/buffalo_l \
    && curl --fail --location --retry 3 --output /tmp/buffalo_l.zip "$INSIGHTFACE_MODEL_URL" \
    && echo "$INSIGHTFACE_MODEL_SHA256  /tmp/buffalo_l.zip" | sha256sum --check --strict \
    && unzip -q /tmp/buffalo_l.zip -d /models/insightface/models/buffalo_l \
    && rm /tmp/buffalo_l.zip

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
