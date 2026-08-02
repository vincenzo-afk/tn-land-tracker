"""
services/tneservices.py — Async scraper for TN eServices portal.
Fetches Patta, Chitta, A-Register data and FMB sketch.
Includes OTP detection, numeric district codes, subdivision support, and error classification.
"""
from __future__ import annotations
import asyncio
import logging
import os
from typing import Optional
from uuid import UUID, uuid4

import httpx
import asyncpg
from bs4 import BeautifulSoup

from lib.tn_codes import get_district_code
from services.r2_storage import upload_fmb_to_r2

logger = logging.getLogger(__name__)

BASE_URL = os.getenv("TNESERVICES_BASE_URL", "https://eservices.tn.gov.in")
TIMEOUT = 30.0
MAX_RETRIES = 2
RETRY_DELAY = 1.0

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,ta;q=0.8",
}

AREG_PATHS = [
    ("/eservicesnew/land/aregister.html", "/eservicesnew/land/aregister_verify.html"),
    ("/tnportal/portal/Ctzn_Aregister_frm", "/tnportal/portal/Ctzn_Aregister_submit"),
]

FMB_PATHS = [
    ("/eservicesnew/land/fmb.html", "/eservicesnew/land/fmb_verify.html"),
    ("/tnportal/portal/Ctzn_FMBView_frm", "/tnportal/portal/Ctzn_FMBView_submit"),
]


async def fetch_land_parcel(
    district: str,
    taluk: str,
    village: str,
    survey_number: str,
    subdivision_number: Optional[str] = None,
    patta_number: Optional[str] = None,
    pool: Optional[asyncpg.Pool] = None,
) -> Optional[dict]:
    """
    Scrape land parcel data from TN eServices.
    Includes OTP detection, numeric district codes, and error classification.
    """
    district_code = get_district_code(district)

    async with httpx.AsyncClient(
        base_url=BASE_URL,
        headers=HEADERS,
        follow_redirects=True,
        timeout=TIMEOUT,
    ) as client:
        for form_path, submit_path in AREG_PATHS:
            for attempt in range(1, MAX_RETRIES + 2):
                try:
                    logger.info("Attempting fetch from %s (Attempt %d)", form_path, attempt)
                    resp = await client.get(form_path)
                    if resp.status_code != 200:
                        logger.warning("GET %s returned status %d", resp.url, resp.status_code)
                        break

                    soup = BeautifulSoup(resp.text, "html.parser")
                    form_data = _extract_hidden_fields(soup)

                    # Populate form payload with district code and display name variants
                    form_data.update({
                        "district": district,
                        "district_code": district_code,
                        "ddl_district": district_code,
                        "taluk": taluk,
                        "taluk_code": taluk,
                        "ddl_taluk": taluk,
                        "village": village,
                        "village_code": village,
                        "ddl_village": village,
                        "surveyno": survey_number,
                        "surveynumber": survey_number,
                        "txtSurveyNo": survey_number,
                        "opt_type": "1" if survey_number else "2",
                    })

                    if subdivision_number:
                        form_data.update({
                            "subdivno": subdivision_number,
                            "txtSubdivNo": subdivision_number,
                            "sub_division": subdivision_number,
                            "txtSubDivision": subdivision_number,
                        })

                    if patta_number:
                        form_data["pattano"] = patta_number
                        form_data["txtPattaNo"] = patta_number

                    post_resp = await client.post(submit_path, data=form_data)
                    logger.info("POST %s returned status %d", post_resp.url, post_resp.status_code)

                    if post_resp.status_code == 200:
                        result_soup = BeautifulSoup(post_resp.text, "html.parser")
                        text_lower = result_soup.get_text(strip=True).lower()

                        # Check for OTP requirement
                        if any(k in text_lower for k in ("otp", "ஒருமுறை", "mobile number", "கடவுச்சொல்")):
                            logger.warning(
                                "OTP verification required on %s for %s/%s/%s. Skipping automated fetch.",
                                submit_path, district, taluk, village
                            )
                            return None

                        # Check for explicit "No records found" message
                        if any(k in text_lower for k in ("no records found", "பதிவுகள் இல்லை", "no data found")):
                            logger.info("No records found on portal for survey %s in %s", survey_number, district)
                            return None

                        parsed = _parse_a_register(result_soup, district, taluk, village, survey_number)
                        if parsed:
                            if pool:
                                land_id = await _save_land_parcel(parsed, pool)
                            else:
                                land_id = uuid4()
                            parsed["id"] = land_id
                            logger.info("Successfully parsed A-Register data for survey %s", survey_number)
                            return parsed

                except (httpx.HTTPError, asyncio.TimeoutError) as exc:
                    logger.warning("Network error on %s attempt %d: %s", form_path, attempt, exc)
                    if attempt <= MAX_RETRIES:
                        await asyncio.sleep(RETRY_DELAY)

    return None


async def fetch_and_upload_fmb(
    land_id: UUID,
    district: str,
    taluk: str,
    village: str,
    survey_number: str,
    subdivision_number: Optional[str] = None,
    patta_number: Optional[str] = None,
    pool: Optional[asyncpg.Pool] = None,
) -> Optional[str]:
    """
    Fetch FMB sketch bytes from TN eServices and upload to Cloudflare R2.
    """
    district_code = get_district_code(district)

    async with httpx.AsyncClient(
        base_url=BASE_URL,
        headers=HEADERS,
        follow_redirects=True,
        timeout=TIMEOUT,
    ) as client:
        for form_path, submit_path in FMB_PATHS:
            try:
                resp = await client.get(form_path)
                if resp.status_code != 200:
                    continue

                soup = BeautifulSoup(resp.text, "html.parser")
                form_data = _extract_hidden_fields(soup)
                form_data.update({
                    "district": district,
                    "district_code": district_code,
                    "ddl_district": district_code,
                    "taluk": taluk,
                    "village": village,
                    "surveyno": survey_number,
                    "txtSurveyNo": survey_number,
                })
                if subdivision_number:
                    form_data["subdivno"] = subdivision_number

                fmb_resp = await client.post(submit_path, data=form_data)
                if fmb_resp.status_code == 200:
                    content_type = fmb_resp.headers.get("content-type", "")
                    if "pdf" in content_type or "image" in content_type:
                        ext = "pdf" if "pdf" in content_type else "png"
                        file_key = f"fmb/{land_id}.{ext}"
                        cdn_url = await upload_fmb_to_r2(
                            key=file_key,
                            data=fmb_resp.content,
                            content_type=content_type,
                        )
                        if cdn_url and pool:
                            await pool.execute(
                                "UPDATE land_parcels SET fmb_sketch_url = $1 WHERE id = $2",
                                cdn_url, land_id,
                            )
                        return cdn_url

            except (httpx.HTTPError, asyncio.TimeoutError) as exc:
                logger.warning("FMB fetch error on %s: %s", form_path, exc)

    return None


def _extract_hidden_fields(soup: BeautifulSoup) -> dict:
    """Extract all hidden input fields from a form (CSRF tokens etc.)."""
    return {
        tag["name"]: tag.get("value", "")
        for tag in soup.find_all("input", {"type": "hidden"})
        if tag.get("name")
    }


def _parse_a_register(
    soup: BeautifulSoup,
    district: str,
    taluk: str,
    village: str,
    survey_number: str,
) -> Optional[dict]:
    """Parse A-Register / Patta / Chitta HTML tables (English & Tamil)."""
    try:
        tables = soup.find_all("table")
        if not tables:
            title = soup.title.get_text(strip=True) if soup.title else "No Title"
            logger.info("No tables found on response page. Page title: %s", title)
            return None

        data: dict = {
            "district": district,
            "taluk": taluk,
            "village": village,
            "survey_number": survey_number,
        }

        for table in tables:
            rows = table.find_all("tr")
            for row in rows:
                cells = [td.get_text(strip=True) for td in row.find_all(["td", "th"])]
                if len(cells) >= 2:
                    key = cells[0].lower()
                    val = cells[1]
                    if any(k in key for k in ("patta", "பாட்டா")):
                        data["patta_number"] = val
                    elif any(k in key for k in ("owner", "name", "உரிமையாளர்", "பெயர்")):
                        data["owner_name"] = val
                    elif any(k in key for k in ("hectare", "ஹெக்டேர்")):
                        try:
                            data["area_hectares"] = float(val.replace(",", ""))
                        except ValueError:
                            pass
                    elif any(k in key for k in ("acre", "ஏக்கர்")):
                        try:
                            data["area_acres"] = float(val.replace(",", ""))
                        except ValueError:
                            pass
                    elif any(k in key for k in ("land type", "nilam", "நிலம்", "நஞ்சை", "புஞ்சை")):
                        data["land_type"] = val
                    elif "nature" in key:
                        data["land_nature"] = val
                    elif any(k in key for k in ("soil", "மண்")):
                        data["soil_type"] = val
                    elif any(k in key for k in ("water", "நீர்")):
                        data["water_source"] = val

        return data if len(data) > 4 else None

    except Exception as exc:  # noqa: BLE001
        logger.warning("A-Register parse error: %s", exc)
        return None


async def _save_land_parcel(data: dict, pool: asyncpg.Pool) -> UUID:
    """Insert a new land parcel record into Supabase."""
    land_id = await pool.fetchval(
        """
        INSERT INTO land_parcels (
            survey_number, subdivision_number, patta_number,
            district, taluk, village,
            area_hectares, area_acres,
            land_type, land_nature, soil_type, water_source,
            status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'active')
        ON CONFLICT DO NOTHING
        RETURNING id
        """,
        data.get("survey_number"),
        data.get("subdivision_number"),
        data.get("patta_number"),
        data.get("district"),
        data.get("taluk"),
        data.get("village"),
        data.get("area_hectares"),
        data.get("area_acres"),
        data.get("land_type"),
        data.get("land_nature"),
        data.get("soil_type"),
        data.get("water_source"),
    )

    owner_name = data.get("owner_name")
    if land_id and owner_name:
        owner_id = await pool.fetchval(
            "INSERT INTO owners (full_name) VALUES ($1) RETURNING id",
            owner_name,
        )
        await pool.execute(
            """
            INSERT INTO land_owner_map (land_id, owner_id, is_current, patta_number)
            VALUES ($1, $2, true, $3)
            """,
            land_id, owner_id, data.get("patta_number"),
        )

    return land_id or uuid4()
