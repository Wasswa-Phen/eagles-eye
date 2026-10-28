"""
Eagles Eye - Demo data seeder.

Fills Firestore with DEMO outbreak records so the heat map has something
realistic to show before real farmers use the app.

IMPORTANT - be honest in the pitch: this is seeded demo data. Every record is
tagged seeded=True so it can be removed with --clear and never mixes with real scans.

Usage (run from the backend/ folder, with your .env and Google credentials set):
    python seed_firestore.py            # add demo data (safe to run again)
    python seed_firestore.py --clear    # delete ONLY the demo data

How it works:
  1. The 3 hand-written records in dashboard/seed_data.json are loaded as-is.
  2. A few dozen extra records are generated, reusing the advice text from
     those 3 records (so we don't invent any new Luganda translations).
"""

import json
import random
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from dotenv import load_dotenv

# Load .env first, so db.py can find GOOGLE_CLOUD_PROJECT.
load_dotenv(Path(__file__).resolve().parent / ".env")

from db import delete_seeded_scans, save_scan, storage_mode  # noqa: E402
from districts import get_location  # noqa: E402

# The dashboard folder moved from dashboard/ to clients/dashboard/ during the
# repo restructure, so we check both places and use whichever exists.
REPO_ROOT = Path(__file__).resolve().parent.parent
SEED_FILE = next(
    (path for path in (REPO_ROOT / "clients" / "dashboard" / "seed_data.json",
                       REPO_ROOT / "dashboard" / "seed_data.json")
     if path.exists()),
    REPO_ROOT / "clients" / "dashboard" / "seed_data.json",  # shown in the error if missing
)

# Districts where each crop is realistically grown (used to place extra records).
CROP_DISTRICTS = {
    "Banana / Matooke": ["Masaka", "Rakai", "Mbarara", "Bushenyi", "Ntungamo",
                         "Mukono", "Wakiso", "Kyotera", "Lwengo"],
    "Cassava": ["Mukono", "Masaka", "Gulu", "Lira", "Soroti",
                "Hoima", "Kamuli", "Iganga", "Busia"],
    "Coffee": ["Mbale", "Kasese", "Mubende", "Kapchorwa", "Bushenyi", "Masaka"],
}

EXTRA_RECORDS = 36   # how many generated records to add
RANDOM_SEED = 2026   # same seed = same demo data every time


def load_templates():
    """Read the hand-written records, keyed by crop, to reuse their text."""
    records = json.loads(SEED_FILE.read_text(encoding="utf-8"))
    return records, {r["crop"]: r for r in records}


def make_extra_records(templates):
    """Generate extra demo scans spread over the last 14 days."""
    rng = random.Random(RANDOM_SEED)
    now = datetime.now(timezone.utc)
    extras = []

    for number in range(1, EXTRA_RECORDS + 1):
        crop = rng.choice(list(CROP_DISTRICTS))
        template = templates[crop]
        when = now - timedelta(hours=rng.randint(1, 14 * 24))

        extras.append({
            "id": f"demo_{number:03d}",
            "crop": crop,
            "condition": template["condition"],
            "confidence": round(rng.uniform(0.70, 0.97), 2),
            "severity": rng.choices(["low", "moderate", "high"], weights=[2, 4, 3])[0],
            "is_healthy": False,
            "advice": template["advice"],
            "advice_luganda": template["advice_luganda"],
            "location": get_location(rng.choice(CROP_DISTRICTS[crop])),
            "timestamp": when.strftime("%Y-%m-%dT%H:%M:%SZ"),
        })
    return extras


def main():
    # Seeding the in-memory fallback would be pointless (lost immediately).
    if storage_mode() != "firestore":
        print("Firestore is not available - check GOOGLE_CLOUD_PROJECT and your credentials.")
        sys.exit(1)

    if "--clear" in sys.argv:
        print(f"Deleted {delete_seeded_scans()} demo scans.")
        return

    hand_written, templates = load_templates()
    saved = 0

    for record in hand_written + make_extra_records(templates):
        scan_id = record.pop("id")
        # Re-build the location so it only holds the contract fields
        # (drops "subcounty" and uses our trusted district coordinates).
        record["location"] = get_location(record["location"]["district"])
        if save_scan(record, scan_id=scan_id, seeded=True):
            saved += 1

    print(f"Saved {saved} demo scans to Firestore (tagged seeded=True).")


if __name__ == "__main__":
    main()
