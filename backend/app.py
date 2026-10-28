"""
Eagles Eye — Backend API Server
Team: Ugandan Eagles (Pre-DevFest Hackathon Kampala 2026)
Backend Leads: Atulinda Derek Solomon (Derek) & Lyazi Patrick (Lyazi)

This is a starter skeleton providing CORS-enabled Flask routes and stub responses
matching docs/DATA_CONTRACT.md to unblock frontend and dashboard team members.
"""

import os
from pathlib import Path
from datetime import datetime, timezone
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import json
from google import genai
from google.genai import types

# [DEREK] Backend helpers: Firestore storage and district coordinates
from db import list_scans, save_scan, storage_mode
from districts import get_location, normalise_district

# Load environment variables from .env file
load_dotenv(Path(__file__).resolve().parent / ".env")

# Initialize Flask application
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS) for frontend & dashboard clients
CORS(app, resources={r"/*": {"origins": "*"}})

# [DEREK] Flask refuses any request body over 6 MB before our code even runs.
# (The 5 MB image limit below still applies; the extra 1 MB covers form fields.)
app.config["MAX_CONTENT_LENGTH"] = 6 * 1024 * 1024


@app.errorhandler(413)
def request_too_large(error):
    """Return our standard JSON error shape when an upload is too big."""
    return jsonify({
        "status": "error",
        "message": "The image must not exceed 5 MB."
    }), 413

# Configuration
PORT = int(os.environ.get("PORT", 8080))
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

GEMINI_MODEL = "gemini-3.5-flash-lite"

gemini_client = (
    genai.Client(api_key=GEMINI_API_KEY)
    if GEMINI_API_KEY
    else None
)

# ------------------------------------------------------------------------------
# 1. Health Check Endpoint
# ------------------------------------------------------------------------------
@app.route("/", methods=["GET"])
def health_check():
    """
    Health check route for Cloud Run and connectivity testing.
    """
    return jsonify({
        "status": "healthy",
        "service": "Eagles Eye API",
        "version": "1.0.0",
        "storage": storage_mode(),  # [DEREK] "firestore" or "memory"
        "timestamp": datetime.now(timezone.utc).isoformat()
    }), 200


# ------------------------------------------------------------------------------
# 2. Crop Diagnosis Endpoint (POST /diagnose)
# ------------------------------------------------------------------------------

@app.route("/diagnose", methods=["POST"])
def diagnose_crop():
    """Analyze an uploaded crop image using Gemini."""

    # Basic upload checks; Derek can extend these validation rules.
    image_file = request.files.get("image")

    if image_file is None or not image_file.filename:
        return jsonify({
            "status": "error",
            "message": "Please upload a crop image using the 'image' field."
        }), 400

    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    mime_type = (image_file.mimetype or "").lower()

    if mime_type not in allowed_types:
        return jsonify({
            "status": "error",
            "message": "Supported image formats are JPEG, PNG, and WebP."
        }), 400

    image_bytes = image_file.read()

    if not image_bytes:
        return jsonify({
            "status": "error",
            "message": "The uploaded image is empty."
        }), 400

    if len(image_bytes) > 5 * 1024 * 1024:
        return jsonify({
            "status": "error",
            "message": "The image must not exceed 5 MB."
        }), 400

    if gemini_client is None:
        return jsonify({
            "status": "error",
            "message": "The AI service is not configured."
        }), 503

    # [DEREK] Clean the district text (safe characters, short, "Unknown" if empty).
    district = normalise_district(request.form.get("district"))
    crop_hint = (request.form.get("crop_hint") or "").strip()

    # [DEREK] Trusted location: fixed district coordinates from districts.py.
    # The AI never decides the location.
    location = get_location(district)

    prompt = f"""
You are the preliminary crop-health assessment assistant for Eagles Eye,
an application supporting smallholder farmers in Uganda.

Examine the attached image carefully. Identify visible crop symptoms,
possible diseases, pests, or nutrient deficiencies. Do not claim certainty
that the image does not support.

Farmer-provided crop hint: {crop_hint or "Not provided"}
Reported district: {district or "Unknown"}

Return ONLY a valid JSON object with exactly these keys:
- crop: string; use one of "Banana / Matooke", "Cassava", "Coffee",
  "Maize", "Beans", "Tomato", or "Unknown".
- condition: string; name the suspected condition or use "Healthy"
  when there is sufficient visual evidence of no visible damage.
  Use "Unknown" when it cannot be identified.
- confidence: number between 0.0 and 1.0 representing your estimated
  certainty, not a scientifically calibrated probability.
- severity: one of "none", "low", "moderate", "high".
- is_healthy: boolean; true only when there is sufficient evidence
  that the crop appears healthy.
- advice: practical, cautious advice in plain English for a Ugandan
  smallholder farmer.
- advice_luganda: a natural Luganda translation of the advice.
- is_inconclusive: boolean; true if the image is blurry, too distant,
  does not show a crop clearly, or does not support a useful assessment.

For an inconclusive image, use crop "Unknown", condition "Unknown",
confidence at or below 0.40, severity "none", and is_healthy false.
Explain in both advice fields that a clearer crop photo is needed.

Do not invent symptoms that are not visible. If a disease is only suspected,
say so in the advice. Do not recommend unsafe chemical use.
"""

    try:
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                prompt,
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type
                )
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        if not response.text:
            raise ValueError("Gemini returned an empty response.")

        result = json.loads(response.text)

        required_keys = {
            "crop",
            "condition",
            "confidence",
            "severity",
            "is_healthy",
            "advice",
            "advice_luganda",
            "is_inconclusive"
        }

        if not isinstance(result, dict) or not required_keys.issubset(result):
            raise ValueError("Gemini response is missing required fields.")

        if result["crop"] not in {
            "Banana / Matooke", "Cassava", "Coffee",
            "Maize", "Beans", "Tomato", "Unknown"
        }:
            result["crop"] = "Unknown"

        if result["severity"] not in {"none", "low", "moderate", "high"}:
            result["severity"] = "none"

        confidence = float(result["confidence"])

        if not 0.0 <= confidence <= 1.0:
            raise ValueError("Gemini returned an invalid confidence value.")

        if not isinstance(result["is_healthy"], bool):
            raise ValueError("Gemini returned an invalid health flag.")

        if not isinstance(result["is_inconclusive"], bool):
            raise ValueError("Gemini returned an invalid inconclusive flag.")

        for key in ("condition", "advice", "advice_luganda"):
            if not isinstance(result[key], str) or not result[key].strip():
                raise ValueError(f"Gemini returned an invalid {key} field.")

        is_inconclusive = (
            result["is_inconclusive"] or confidence <= 0.40
        )

        diagnosis = {
            "crop": result["crop"],
            "condition": result["condition"],
            "confidence": confidence,
            "severity": result["severity"],
            "is_healthy": result["is_healthy"],
            "advice": result["advice"],
            "advice_luganda": result["advice_luganda"],
            "location": location,
            "timestamp": datetime.now(timezone.utc).strftime(
                "%Y-%m-%dT%H:%M:%SZ"
            )
        }

        # [DEREK] Log the scan for the outbreak map. Blurry / unusable photos
        # are skipped because they say nothing about crop health.
        # save_scan() never raises, so a database problem can't break the response.
        if not is_inconclusive:
            save_scan(diagnosis)

        return jsonify({
            "status": "inconclusive" if is_inconclusive else "success",
            "data": diagnosis
        }), 200

    except (ValueError, TypeError, json.JSONDecodeError) as error:
        app.logger.warning("Invalid Gemini diagnosis response: %s", error)
        return jsonify({
            "status": "error",
            "message": "The AI service returned an invalid diagnosis. Please try again."
        }), 502

    except Exception:
        app.logger.exception("Gemini crop diagnosis failed")
        return jsonify({
            "status": "error",
            "message": "Crop analysis failed. Please try again later."
        }), 502


# ------------------------------------------------------------------------------
# 3. Surveillance Scans Endpoint (GET /scans)
# ------------------------------------------------------------------------------
@app.route("/scans", methods=["GET"])
def get_scans():
    """
    Return logged scans for the outbreak heat map dashboard, newest first.

    Optional query parameters (see docs/DATA_CONTRACT.md, section 3.2):
      ?district=Masaka   only scans from that district
      ?limit=50          how many scans to return (default 50, maximum 200)
    """
    # [DEREK] Read the optional filters. A missing district means "all districts".
    district = request.args.get("district", "").strip()
    district = normalise_district(district) if district else None

    # type=int quietly falls back to the default if the value isn't a number.
    limit = request.args.get("limit", default=50, type=int)

    try:
        scans = list_scans(district=district, limit=limit)
    except Exception:
        app.logger.exception("Could not read scans")
        return jsonify({
            "status": "error",
            "message": "Could not load scans right now. Please try again."
        }), 500

    return jsonify({
        "status": "success",
        "count": len(scans),
        "scans": scans
    }), 200


if __name__ == "__main__":
    print(f"🦅 Eagles Eye API starting on port {PORT}...")
    app.run(host="0.0.0.0", port=PORT, debug=True)
