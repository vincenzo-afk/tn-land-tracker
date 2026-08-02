"""
services/tnreginet.py — Async scraper for TNREGINET portal.
Fetches EC (Encumbrance Certificate) records and guideline value.
"""
from __future__ import annotations
import asyncio
import logging
import os
import re
from datetime import date
from decimal import Decimal
from typing import Optional
from uuid import UUID

import httpx
import asyncpg
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

BASE_URL = os.getenv("TNREGINET_BASE_URL", "https://tnreginet.gov.in")
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

EC_PATHS = [
    "/portal/web/guest/e-service/eregistration/EC-view",
    "/portal/web/guest/ec-view",
    "/portal/web/guest/e-services/search-ec",
]

GV_PATHS = [
    "/portal/web/guest/guideline-value",
    "/portal/web/guest/e-service/guideline-value",
]


async def fetch_ec_data(
    land_id: UUID,
    district: str,
    survey_number: str,
    patta_number: Optional[str] = None,
    pool: Optional[asyncpg.Pool] = None,
) -> list[dict]:
    """
    Fetch Encumbrance Certificate records from TNREGINET.
    Saves results to ownership_history table if pool available.
    """
    records: list[dict] = []
    async with httpx.AsyncClient(
        base_url=BASE_URL,
        headers=HEADERS,
        follow_redirects=True,
        timeout=TIMEOUT,
    ) as client:
        for path in EC_PATHS:
            for attempt in range(1, MAX_RETRIES + 2):
                try:
                    logger.info("Attempting EC fetch from %s (Attempt %d)", path, attempt)
                    resp = await client.get(path)
                    if resp.status_code != 200:
                        logger.warning("GET %s returned status %d", resp.url, resp.status_code)
                        break

                    soup = BeautifulSoup(resp.text, "html.parser")
                    hidden = _extract_hidden_fields(soup)
                    form_data = {
                        **hidden,
                        "district": district,
                        "district_code": district,
                        "surveyNo": survey_number,
                        "surveyno": survey_number,
                    }
                    if patta_number:
                        form_data["pattaNo"] = patta_number
                        form_data["pattano"] = patta_number

                    post_resp = await client.post(path, data=form_data)
                    logger.info("POST %s returned status %d", post_resp.url, post_resp.status_code)

                    if post_resp.status_code == 200:
                        records = _parse_ec_table(BeautifulSoup(post_resp.text, "html.parser"))
                        if records:
                            if pool:
                                for rec in records:
                                    await pool.execute(
                                        """
                                        INSERT INTO ownership_history (
                                            land_id, transaction_type, seller_name, buyer_name,
                                            transaction_date, document_number, sro_office,
                                            transaction_amount, deed_description
                                        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
                                        ON CONFLICT DO NOTHING
                                        """,
                                        land_id,
                                        rec.get("transaction_type"),
                                        rec.get("seller_name"),
                                        rec.get("buyer_name"),
                                        rec.get("transaction_date"),
                                        rec.get("document_number"),
                                        rec.get("sro_office"),
                                        rec.get("transaction_amount"),
                                        rec.get("deed_description"),
                                    )
                            return records

                except (httpx.HTTPError, asyncio.TimeoutError) as exc:
                    logger.warning("Network error fetching EC on %s (Attempt %d): %s", path, attempt, exc)
                    if attempt <= MAX_RETRIES:
                        await asyncio.sleep(RETRY_DELAY)

    return records


async def fetch_guideline_value(
    land_id: UUID,
    district: str,
    village: str,
    pool: Optional[asyncpg.Pool] = None,
) -> Optional[Decimal]:
    """
    Fetch government guideline value from TNREGINET.
    Saves updated value back to land_parcels if pool available.
    """
    async with httpx.AsyncClient(
        base_url=BASE_URL,
        headers=HEADERS,
        follow_redirects=True,
        timeout=TIMEOUT,
    ) as client:
        for path in GV_PATHS:
            try:
                logger.info("Attempting Guideline Value fetch from %s", path)
                resp = await client.get(
                    path,
                    params={"district": district, "village": village},
                )
                logger.info("GET %s returned status %d", resp.url, resp.status_code)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    gv = _parse_guideline_value(soup)
                    if gv is not None:
                        if pool:
                            await pool.execute(
                                "UPDATE land_parcels SET guideline_value = $1 WHERE id = $2",
                                gv, land_id,
                            )
                        return gv
            except (httpx.HTTPError, asyncio.TimeoutError) as exc:
                logger.warning("Network error fetching guideline value on %s: %s", path, exc)

    return None


def _extract_hidden_fields(soup: BeautifulSoup) -> dict:
    return {
        tag["name"]: tag.get("value", "")
        for tag in soup.find_all("input", {"type": "hidden"})
        if tag.get("name")
    }


def _parse_ec_table(soup: BeautifulSoup) -> list[dict]:
    """Parse EC result HTML table into list of record dicts."""
    records: list[dict] = []
    tables = soup.find_all("table")
    if not tables:
        title = soup.title.get_text(strip=True) if soup.title else "No Title"
        logger.info("No EC tables found on page. Title: %s", title)
        return records

    for table in tables:
        rows = table.find_all("tr")
        if not rows:
            continue
        headers = [th.get_text(strip=True).lower() for th in rows[0].find_all(["th", "td"])]

        for row in rows[1:]:
            cells = [td.get_text(strip=True) for td in row.find_all("td")]
            if not cells or len(cells) < 2:
                continue
            rec: dict = {}
            for i, header in enumerate(headers):
                if i >= len(cells):
                    break
                val = cells[i]
                if any(k in header for k in ("seller", "executant", "விற்பனையாளர்")):
                    rec["seller_name"] = val
                elif any(k in header for k in ("buyer", "claimant", "வாங்குபவர்")):
                    rec["buyer_name"] = val
                elif any(k in header for k in ("date", "reg", "தேதி")):
                    rec["transaction_date"] = _parse_date(val)
                elif any(k in header for k in ("doc", "no", "எண்")):
                    rec["document_number"] = val
                elif any(k in header for k in ("sro", "office", "அலுவலகம்")):
                    rec["sro_office"] = val
                elif any(k in header for k in ("amount", "value", "தொகை")):
                    rec["transaction_amount"] = _parse_decimal(val)
                elif any(k in header for k in ("deed", "nature", "தன்மை")):
                    rec["transaction_type"] = val
                    rec["deed_description"] = val
            if rec:
                records.append(rec)

    return records


def _parse_guideline_value(soup: BeautifulSoup) -> Optional[Decimal]:
    """Extract the guideline value rate from the response."""
    for tag in soup.find_all(["td", "span", "div", "p"]):
        text = tag.get_text(strip=True).replace(",", "")
        match = re.search(r"(\d+(?:\.\d+)?)", text)
        if match:
            parent_text = (tag.parent or tag).get_text(strip=True).lower()
            if any(k in parent_text for k in ("guideline", "value", "rate", "சந்தைக் மதிப்பு", "வழிகாட்டி")):
                try:
                    return Decimal(match.group(1))
                except Exception:  # noqa: BLE001
                    pass
    return None


def _parse_date(val: str) -> Optional[date]:
    """Try to parse a date string into a date object."""
    val = val.strip()
    match = re.match(r"(\d{2})[/\-](\d{2})[/\-](\d{4})", val)
    if match:
        try:
            return date(int(match.group(3)), int(match.group(2)), int(match.group(1)))
        except ValueError:
            pass
    return None


def _parse_decimal(val: str) -> Optional[Decimal]:
    cleaned = re.sub(r"[^\d.]", "", val)
    try:
        return Decimal(cleaned) if cleaned else None
    except Exception:  # noqa: BLE001
        return None
