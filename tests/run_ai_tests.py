import csv
import json
import time
from datetime import datetime
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
IMAGE_DIR = ROOT / "tests" / "crop_images"
LABELS_FILE = ROOT / "tests" / "labels.csv"
REPORT_DIR = ROOT / "tests" / "reports"
REPORT_FILE = REPORT_DIR / "gemini_test_report.txt"
API_URL = "http://127.0.0.1:8080/diagnose"


def normalize(text):
    return " ".join(str(text or "").lower().replace("_", " ").split())


def evaluate(expected_disease, expected_healthy, actual_condition, actual_healthy):
    expected = normalize(expected_disease)
    actual = normalize(actual_condition)

    if actual_healthy is not None and bool(actual_healthy) != expected_healthy:
        return "HEALTH STATUS MISMATCH"

    if expected_healthy:
        if actual_healthy is True or "healthy" in actual:
            return "HEALTH STATUS MATCH"
        return "MANUAL REVIEW"

    if expected and (expected in actual or actual in expected):
        return "POSSIBLE DISEASE MATCH"

    # Disease names can differ while describing the same symptoms.
    return "MANUAL REVIEW"


def main():
    if not LABELS_FILE.exists():
        print(f"Labels file not found: {LABELS_FILE}")
        return

    with LABELS_FILE.open("r", encoding="utf-8-sig", newline="") as f:
        labels = list(csv.DictReader(f))

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    results = []

    print(f"Testing {len(labels)} images against {API_URL}")
    print("This may take several minutes.\n")

    for index, item in enumerate(labels, start=1):
        filename = item["image_filename"]
        image_path = IMAGE_DIR / filename
        print(f"[{index}/{len(labels)}] {filename} ... ", end="", flush=True)

        result = {
            "image": filename,
            "expected_crop": item["host"],
            "expected_disease": item["disease"],
            "expected_healthy": item["is_healthy"],
            "http_status": None,
            "actual_crop": "",
            "actual_condition": "",
            "confidence": "",
            "severity": "",
            "actual_healthy": None,
            "advice": "",
            "advice_luganda": "",
            "status": "",
            "error": "",
        }

        if not image_path.exists():
            result["status"] = "IMAGE MISSING"
            result["error"] = f"File not found: {image_path}"
            results.append(result)
            print("IMAGE MISSING")
            continue

        try:
            with image_path.open("rb") as image_file:
                response = requests.post(
                    API_URL,
                    files={
                        "image": (
                            filename,
                            image_file,
                            "image/jpeg"
                            if image_path.suffix.lower() in (".jpg", ".jpeg")
                            else "image/" + image_path.suffix.lower().lstrip("."),
                        )
                    },
                    data={"crop_hint": item["crop_hint"]},
                    timeout=120,
                )

            result["http_status"] = response.status_code

            try:
                data = response.json()
            except ValueError:
                data = {"error": response.text[:500]}

            payload = data.get("data", data)
            if response.ok and data.get("status") == "success" and isinstance(payload, dict):
                result["actual_crop"] = payload.get("crop", "")
                result["actual_condition"] = payload.get("condition", "")
                result["confidence"] = payload.get("confidence", "")
                result["severity"] = payload.get("severity", "")
                result["actual_healthy"] = payload.get("is_healthy")
                result["advice"] = payload.get("advice", "")
                result["advice_luganda"] = payload.get("advice_luganda", "")

                result["status"] = evaluate(
                    item["disease"],
                    item["is_healthy"].strip().lower() == "true",
                    result["actual_condition"],
                    result["actual_healthy"],
                )
                print(result["status"])
            else:
                result["status"] = "REQUEST FAILED"
                result["error"] = json.dumps(data, ensure_ascii=False)
                print(f"REQUEST FAILED (HTTP {response.status_code})")

        except requests.RequestException as exc:
            result["status"] = "CONNECTION ERROR"
            result["error"] = str(exc)
            print("CONNECTION ERROR")

        results.append(result)
        time.sleep(0.3)

    expected_total = len(results)
    successful = sum(1 for r in results if r["http_status"] == 200 and r["actual_condition"])
    failed = expected_total - successful
    review = sum(1 for r in results if r["status"] == "MANUAL REVIEW")
    mismatches = sum(1 for r in results if r["status"] == "HEALTH STATUS MISMATCH")

    with REPORT_FILE.open("w", encoding="utf-8") as report:
        report.write("EAGLES EYE — GEMINI CROP DIAGNOSIS TEST REPORT\n")
        report.write("=" * 58 + "\n")
        report.write(f"Run time: {datetime.now().astimezone().isoformat(timespec='seconds')}\n")
        report.write(f"Endpoint: {API_URL}\n")
        report.write(f"Images tested: {expected_total}\n")
        report.write(f"Successful responses: {successful}\n")
        report.write(f"Failed requests: {failed}\n")
        report.write(f"Manual review required: {review}\n")
        report.write(f"Health-status mismatches: {mismatches}\n")
        report.write("\nNOTE: Dataset labels are reference labels, not guaranteed ground truth.\n")
        report.write("Disease-name matches are preliminary; review predictions manually.\n")
        report.write("Confidence values are model-reported, not independently calibrated.\n\n")

        for number, r in enumerate(results, start=1):
            report.write("-" * 58 + "\n")
            report.write(f"TEST {number}: {r['image']}\n")
            report.write(f"HTTP status: {r['http_status']}\n")
            report.write(f"Result: {r['status']}\n")
            report.write(f"Expected crop: {r['expected_crop']}\n")
            report.write(f"Expected disease: {r['expected_disease']}\n")
            report.write(f"Expected healthy: {r['expected_healthy']}\n")
            report.write(f"Gemini crop: {r['actual_crop']}\n")
            report.write(f"Gemini condition: {r['actual_condition']}\n")
            report.write(f"Gemini confidence: {r['confidence']}\n")
            report.write(f"Gemini severity: {r['severity']}\n")
            report.write(f"Gemini is_healthy: {r['actual_healthy']}\n")
            report.write(f"Advice: {r['advice']}\n")
            report.write(f"Luganda advice: {r['advice_luganda']}\n")
            if r["error"]:
                report.write(f"Error: {r['error']}\n")
            report.write("\n")

    print("\nTest run finished.")
    print(f"Report saved to: {REPORT_FILE}")
    print(f"Successful responses: {successful}/{expected_total}")
    print(f"Failed requests: {failed}/{expected_total}")
    print("Remember: the disease comparison is preliminary, not a scientific accuracy score.")


if __name__ == "__main__":
    main()
