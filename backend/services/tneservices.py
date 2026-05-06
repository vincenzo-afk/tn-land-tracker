"""
services/tneservices.py — Async scraper for TN eServices portal.
Fetches Patta, Chitta, A-Register data and FMB sketch.
"""
from __future__ import annotations
import asyncio
import logging
from typing import Optional
from uuid import UUID

import httpx
import asyncpg
from bs4 import BeautifulSoup

from services.r2_storage import upload_fmb_to_r2

logger = logging.getLogger(__name__)

BASE_URL = "https://eservices.tn.gov.in"
TIMEOUT = 30.0

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


async def fetch_land_parcel(
    district: str,
    taluk: str,
    village: str,
    survey_number: str,
    patta_number: Optional[str],
    pool: asyncpg.Pool,
) -> Optional[dict]:
    """
    Scrape land parcel data from TN eServices.
    Saves results to Supabase and returns the parsed record dict.
    Returns None if the portal is unavailable or data not found.
    """
    try:
        async with httpx.AsyncClient(
            base_url=BASE_URL,
            headers=HEADERS,
            follow_redirects=True,
            timeout=TIMEOUT,
        ) as client:
            # Step 1: fetch the A-Register extract form page
            resp = await client.get("/tnportal/portal/Ctzn_Aregister_frm")
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            # Extract CSRF / hidden tokens if present
            form_data = _extract_hidden_fields(soup)
            form_data.update({
                "district": district,
                "taluk": taluk,
                "village": village,
                "surveyno": survey_number,
            })
            if patta_number:
                form_data["pattano"] = patta_number

            # Step 2: POST form
            post_resp = await client.post(
                "/tnportal/portal/Ctzn_Aregister_submit",
                data=form_data,
            )
            post_resp.raise_for_status()
            result_soup = BeautifulSoup(post_resp.text, "html.parser")
            parsed = _parse_a_register(result_soup, district, taluk, village, survey_number)

            if parsed:
                land_id = await _save_land_parcel(parsed, pool)
                parsed["id"] = land_id
                return parsed

    except (httpx.HTTPError, asyncio.TimeoutError) as exc:
        logger.warning("TN eServices fetch failed for survey %s: %s", survey_number, exc)

    return None


async def fetch_and_upload_fmb(
    land_id: UUID,
    district: str,
    taluk: str,
    village: str,
    survey_number: str,
    patta_number: Optional[str],
    pool: asyncpg.Pool,
) -> Optional[str]:
    """
    Fetch FMB sketch bytes from TN eServices and upload to Cloudflare R2.
    Saves the R2 URL back to land_parcels.fmb_sketch_url.
    Returns the public CDN URL, or None on failure.
    """
    try:
        async with httpx.AsyncClient(
            base_url=BASE_URL,
            headers=HEADERS,
            follow_redirects=True,
            timeout=TIMEOUT,
        ) as client:
            # Fetch FMB form page
            resp = await client.get("/tnportal/portal/Ctzn_FMBView_frm")
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")
            form_data = _extract_hidden_fields(soup)
            form_data.update({
                "district": district,
                "taluk": taluk,
                "village": village,
                "surveyno": survey_number,
            })

            fmb_resp = await client.post(
                "/tnportal/portal/Ctzn_FMBView_submit",
                data=form_data,
            )
            fmb_resp.raise_for_status()

            content_type = fmb_resp.headers.get("content-type", "")
            if "pdf" in content_type or "image" in content_type:
                # Upload to R2
                ext = "pdf" if "pdf" in content_type else "png"
                file_key = f"fmb/{land_id}.{ext}"
                cdn_url = await upload_fmb_to_r2(
                    key=file_key,
                    data=fmb_resp.content,
                    content_type=content_type,
                )
                if cdn_url:
                    await pool.execute(
                        "UPDATE land_parcels SET fmb_sketch_url = $1 WHERE id = $2",
                        cdn_url, land_id,
                    )
                    return cdn_url

    except (httpx.HTTPError, asyncio.TimeoutError) as exc:
        logger.warning("FMB fetch failed for land %s: %s", land_id, exc)

    return None


# ─────────────────────────────────────────────────────────────
# Private helpers
# ─────────────────────────────────────────────────────────────

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
    """Parse the A-Register HTML response into a structured dict."""
    try:
        tables = soup.find_all("table")
        if not tables:
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
                    if "patta" in key:
                        data["patta_number"] = val
                    elif "owner" in key or "name" in key:
                        data["owner_name"] = val
                    elif "area" in key and "hectare" in key:
                        try:
                            data["area_hectares"] = float(val.replace(",", ""))
                        except ValueError:
                            pass
                    elif "area" in key and "acre" in key:
                        try:
                            data["area_acres"] = float(val.replace(",", ""))
                        except ValueError:
                            pass
                    elif "land type" in key or "nilam" in key:
                        data["land_type"] = val
                    elif "land nature" in key:
                        data["land_nature"] = val
                    elif "soil" in key:
                        data["soil_type"] = val
                    elif "water" in key:
                        data["water_source"] = val

        return data if "survey_number" in data else None

    except Exception as exc:  # noqa: BLE001
        logger.warning("A-Register parse error: %s", exc)
        return None


async def _save_land_parcel(data: dict, pool: asyncpg.Pool) -> UUID:
    """Insert a new land parcel record (and owner if present) into Supabase."""
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

    return land_id
