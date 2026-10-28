"""
Eagles Eye - Storage layer (Google Cloud Firestore).

Everything that talks to the database lives here, so app.py stays easy to read.

Collection layout
-----------------
Firestore collection: "scans"
Each document is one anonymous diagnosis, using the fields from
docs/DATA_CONTRACT.md (crop, condition, confidence, severity, is_healthy,
advice, advice_luganda, location, timestamp).

PRIVACY: we never store the photo, the farmer's name, phone number or IP address.

Local-testing fallback
----------------------
If Firestore cannot start (for example you have no Google credentials on your
laptop yet), we keep scans in a Python list instead, and print a warning.
That lets you test the API immediately. Data in the list is lost on restart,
so GET / reports which mode is active ("firestore" or "memory").
"""

import logging
import os

log = logging.getLogger(__name__)

SCANS_COLLECTION = "scans"
MAX_LIMIT = 200            # most scans one request may ask for
DISTRICT_QUERY_CAP = 500   # most documents we read when filtering by district

_client = None             # Firestore client, created on first use
_client_failed = False     # True once we gave up on Firestore
_memory_scans = []         # fallback storage (lost on restart)


def _get_client():
    """Create the Firestore client once and reuse it. Returns None if unavailable."""
    global _client, _client_failed

    if _client is not None or _client_failed:
        return _client

    try:
        from google.cloud import firestore
        # Reads GOOGLE_CLOUD_PROJECT from .env; credentials come from
        # GOOGLE_APPLICATION_CREDENTIALS locally, or Cloud Run's service account.
        _client = firestore.Client(project=os.environ.get("GOOGLE_CLOUD_PROJECT") or None)
    except Exception as error:
        _client_failed = True
        log.warning("Firestore is NOT available (%s). Using in-memory storage - "
                    "scans will be lost when the server restarts.", error)

    return _client


def storage_mode():
    """Tell the health check which storage is active."""
    return "firestore" if _get_client() is not None else "memory"


def save_scan(diagnosis, scan_id=None, seeded=False):
    """
    Save one diagnosis. Returns the new scan id, or None if saving failed.

    This function NEVER raises: a database hiccup must not stop the farmer
    from seeing their diagnosis. Failures are written to the server log instead.

    scan_id : optional fixed id (used by the seed script so re-running it
              updates the same documents instead of creating duplicates).
    seeded  : True for demo/seed data, so it can be found and deleted later.
    """
    record = dict(diagnosis)       # copy, so the caller's dict is untouched
    record["seeded"] = seeded

    try:
        client = _get_client()

        # Fallback: keep it in memory
        if client is None:
            record["id"] = scan_id or f"mem_{len(_memory_scans) + 1:04d}"
            _memory_scans.append(record)
            return record["id"]

        # Normal path: write to Firestore
        collection = client.collection(SCANS_COLLECTION)
        if scan_id:
            collection.document(scan_id).set(record)
            return scan_id

        _, doc_ref = collection.add(record)     # Firestore creates the id
        return doc_ref.id

    except Exception:
        log.exception("Could not save scan")
        return None


def list_scans(district=None, limit=50):
    """
    Return recent scans, newest first, in the shape the dashboard expects.

    district : optional exact district name, e.g. "Masaka"
    limit    : how many scans to return (1 to MAX_LIMIT)

    Raises an exception if the database cannot be read; the route handles it.
    """
    limit = max(1, min(limit, MAX_LIMIT))
    client = _get_client()

    if client is None:
        # Fallback: filter the in-memory list
        records = [s for s in _memory_scans
                   if not district or s["location"]["district"] == district]
    else:
        from google.cloud import firestore
        from google.cloud.firestore_v1.base_query import FieldFilter

        query = client.collection(SCANS_COLLECTION)

        if district:
            # Filtering AND sorting in Firestore would need a custom index, so
            # we only filter here and sort in Python below (fine at MVP size).
            query = query.where(filter=FieldFilter("location.district", "==", district))
            query = query.limit(DISTRICT_QUERY_CAP)
        else:
            query = query.order_by("timestamp", direction=firestore.Query.DESCENDING)
            query = query.limit(limit)

        records = []
        for doc in query.stream():
            record = doc.to_dict()
            record["id"] = doc.id
            records.append(record)

    # Newest first. ISO-8601 timestamps sort correctly as plain text.
    records.sort(key=lambda r: r.get("timestamp", ""), reverse=True)
    return [_to_public_scan(r) for r in records[:limit]]


def _to_public_scan(record):
    """
    Keep only the fields promised in docs/DATA_CONTRACT.md, so internal
    fields (like "seeded") and any extra data never leak to the dashboard.
    """
    location = record.get("location", {})
    return {
        "id": record.get("id"),
        "crop": record.get("crop"),
        "condition": record.get("condition"),
        "confidence": record.get("confidence"),
        "severity": record.get("severity"),
        "is_healthy": record.get("is_healthy"),
        "advice": record.get("advice"),
        "advice_luganda": record.get("advice_luganda"),
        "location": {
            "district": location.get("district"),
            "latitude": location.get("latitude"),
            "longitude": location.get("longitude"),
        },
        "timestamp": record.get("timestamp"),
    }


def delete_seeded_scans():
    """
    Delete every scan that was added by the seed script (seeded == True).
    Real farmer scans are never touched. Returns how many were deleted.
    Used by: python seed_firestore.py --clear
    """
    client = _get_client()
    if client is None:
        return 0

    from google.cloud.firestore_v1.base_query import FieldFilter

    deleted = 0
    query = client.collection(SCANS_COLLECTION).where(filter=FieldFilter("seeded", "==", True))
    for doc in query.stream():
        doc.reference.delete()
        deleted += 1
    return deleted
