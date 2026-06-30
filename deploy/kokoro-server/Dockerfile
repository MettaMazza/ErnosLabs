# Kokoro TTS server — deploy to a HuggingFace Space (SDK: docker).
# HF routes external HTTPS traffic to port 7860.
FROM python:3.11-slim

# espeak-ng is required by Kokoro for phonemisation.
RUN apt-get update && apt-get install -y --no-install-recommends espeak-ng git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Cache dir must be writable on HF Spaces.
ENV HF_HOME=/tmp/hf
COPY app.py .

EXPOSE 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
