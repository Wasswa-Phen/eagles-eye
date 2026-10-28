"""
Eagles Eye - District helpers.

Why this file exists
--------------------
The heat map needs a coordinate for every scan, but we deliberately do NOT
use the farmer's exact GPS position (privacy: see docs/ai-contract.md, section 8).
Instead the backend looks up ONE fixed point per district. The AI never
decides the location - it always comes from this table.

The coordinates below are APPROXIMATE town centres, good enough for a
district-level heat map. Add more districts by adding a line to the table.
"""

import re

# Used whenever the district is missing or not in our table.
# (Same Kampala point the original stub used, so the contract example still holds.)
UNKNOWN_DISTRICT = "Unknown"
DEFAULT_COORDINATES = (0.3476, 32.5825)

# Lower-case district name -> (latitude, longitude)
DISTRICT_CENTRES = {
    # Central region
    "kampala": (0.3476, 32.5825),
    "wakiso": (0.4044, 32.4594),
    "mukono": (0.3549, 32.7523),
    "buikwe": (0.3167, 33.0167),
    "mpigi": (0.2260, 32.3140),
    "mityana": (0.4167, 32.0333),
    "mubende": (0.5833, 31.3667),
    "luwero": (0.8490, 32.4730),
    "nakasongola": (1.3167, 32.4667),
    "nakaseke": (0.7333, 32.4167),
    "kayunga": (0.7020, 32.8890),
    "kiboga": (0.9167, 31.7667),
    "masaka": (-0.3411, 31.7361),
    "rakai": (-0.7167, 31.4167),
    "kyotera": (-0.6333, 31.5167),
    "lwengo": (-0.4167, 31.4000),
    "bukomansimbi": (-0.1500, 31.6000),
    "ssembabule": (-0.0750, 31.4600),
    "lyantonde": (-0.4017, 31.1583),
    # Western region
    "mbarara": (-0.6072, 30.6545),
    "ntungamo": (-0.8794, 30.2639),
    "bushenyi": (-0.5410, 30.1840),
    "ibanda": (-0.1300, 30.5000),
    "kabale": (-1.2490, 29.9900),
    "kisoro": (-1.2850, 29.6850),
    "rukungiri": (-0.8417, 29.9417),
    "kasese": (0.1830, 30.0880),
    "kabarole": (0.6710, 30.2750),      # Fort Portal
    "kyenjojo": (0.6290, 30.6410),
    "bundibugyo": (0.7130, 30.0640),
    "hoima": (1.4350, 31.3524),
    "masindi": (1.6744, 31.7150),
    # Eastern region
    "jinja": (0.4244, 33.2042),
    "mayuge": (0.4590, 33.4800),
    "iganga": (0.6090, 33.4680),
    "kamuli": (0.9470, 33.1200),
    "bugiri": (0.5710, 33.7490),
    "busia": (0.4710, 34.0910),
    "tororo": (0.6928, 34.1810),
    "mbale": (1.0784, 34.1754),
    "bududa": (1.0000, 34.3333),
    "sironko": (1.2300, 34.2500),
    "kapchorwa": (1.4000, 34.4500),
    "pallisa": (1.1450, 33.7090),
    "kumi": (1.4600, 33.9360),
    "soroti": (1.7150, 33.6110),
    # Northern region
    "lira": (2.2499, 32.8998),
    "apac": (1.9760, 32.5390),
    "gulu": (2.7746, 32.2990),
    "kitgum": (3.2780, 32.8870),
    "arua": (3.0200, 30.9110),
    "nebbi": (2.4780, 31.0890),
    "adjumani": (3.3760, 31.7900),
    "moroto": (2.5340, 34.6660),
}


def normalise_district(raw_value):
    """
    Turn whatever the app sent into a safe, tidy district name.

    "  masaka DISTRICT " -> "Masaka"
    None / "" / "<script>" -> "Unknown"

    The result is also short and contains only letters, spaces, hyphens and
    apostrophes, so it is safe to store and to place inside the AI prompt.
    """
    text = " ".join((raw_value or "").split())             # trim + collapse spaces
    text = re.sub(r"[^A-Za-z '\-]", "", text)              # keep only simple characters
    text = text.strip()[:40]                               # cap the length
    text = re.sub(r"(?i)\s+district$", "", text)           # "Masaka District" -> "Masaka"

    if not text:
        return UNKNOWN_DISTRICT
    return text.title()


def get_location(district):
    """
    Build the `location` object required by docs/DATA_CONTRACT.md.

    Districts we recognise get their fixed coordinates. Anything else is
    reported as "Unknown" with the default coordinates, so we never show a
    wrong place name on the map.
    """
    coordinates = DISTRICT_CENTRES.get(district.lower())

    if coordinates is None:
        return {
            "district": UNKNOWN_DISTRICT,
            "latitude": DEFAULT_COORDINATES[0],
            "longitude": DEFAULT_COORDINATES[1],
        }

    return {
        "district": district,
        "latitude": coordinates[0],
        "longitude": coordinates[1],
    }
