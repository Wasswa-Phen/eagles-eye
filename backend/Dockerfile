# Eagles Eye backend - container image for Google Cloud Run.
FROM python:3.12-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1

# Install dependencies first so Docker can cache this layer.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the app code (.dockerignore keeps .env and venv out of the image).
COPY . .

# Cloud Run provides the PORT variable (8080). gunicorn is the production
# server; the long timeout leaves room for slow Gemini responses.
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 120 app:app
