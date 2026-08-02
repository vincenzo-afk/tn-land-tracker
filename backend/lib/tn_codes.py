"""
lib/tn_codes.py — Official district code mappings for TN eServices & TNREGINET portals.
"""
from __future__ import annotations

# Official Tamil Nadu 38 District Numeric Codes
DISTRICT_CODES: dict[str, str] = {
    "Ariyalur": "01",
    "Chengalpattu": "02",
    "Chennai": "03",
    "Coimbatore": "04",
    "Cuddalore": "05",
    "Dharmapuri": "06",
    "Dindigul": "07",
    "Erode": "08",
    "Kanchipuram": "09",
    "Kanyakumari": "10",
    "Karur": "11",
    "Krishnagiri": "12",
    "Madurai": "13",
    "Mayiladuthurai": "14",
    "Nagapattinam": "15",
    "Namakkal": "16",
    "Nilgiris": "17",
    "Perambalur": "18",
    "Pudukkottai": "19",
    "Ramanathapuram": "20",
    "Ranipet": "21",
    "Salem": "22",
    "Sivaganga": "23",
    "Tenkasi": "24",
    "Thanjavur": "25",
    "Theni": "26",
    "Thoothukudi": "27",
    "Tiruchirappalli": "28",
    "Tirunelveli": "29",
    "Tirupathur": "30",
    "Tiruppur": "31",
    "Tiruvallur": "32",
    "Tiruvannamalai": "33",
    "Tiruvarur": "34",
    "Vellore": "35",
    "Viluppuram": "36",
    "Virudhunagar": "37",
}


def get_district_code(district_name: str) -> str:
    """Return numeric code for given district name, or fallback to the original string."""
    if not district_name:
        return ""
    name_clean = district_name.strip().title()
    return DISTRICT_CODES.get(name_clean, district_name)
