"""
services/tnreginet.py — Async scraper for TNREGINET portal.
Fetches EC (Encumbrance Certificate) records and guideline value.
"""
from __future__ import annotations
import asyncio
import logging
from decimal import Decimal
from typing import Optional
from uuid import UUID

import httpx
import asyncpg
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

BASE_URL = "https://tnreginet.gov.in"
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


async def fetch_ec_data(
    land_id: UUID,
    district: str,
    survey_number: str,
    patta_number: Optional[str],
    pool: asyncpg.Pool,
) -> list[dict]:
    """
    Fetch Encumbrance Certificate records from TNREGINET.
    Saves results to ownership_history table.
    Returns list of parsed EC entry dicts.
    """
    records: list[dict] = []
    try:
        async with httpx.AsyncClient(
            base_url=BASE_URL,
            headers=HEADERS,
            follow_redirects=True,
            timeout=TIMEOUT,
        ) as client:
            # Step 1: load EC form
            resp = await client.get("/portal/web/guest/e-service/eregistration/EC-view")
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            hidden = _extract_hidden_fields(soup)
            form_data = {
                **hidden,
                "district": district,
                "surveyNo": survey_number,
            }
            if patta_number:
                form_data["pattaNo"] = patta_number

            # Step 2: submit EC form
            post_resp = await client.post(
                "/portal/web/guest/e-service/eregistration/EC-view",
                data=form_data,
            )
            post_resp.raise_for_status()
            records = _parse_ec_table(BeautifulSoup(post_resp.text, "html.parser"))

            # Save to DB
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

    except (httpx.HTTPError, asyncio.TimeoutError) as exc:
        logger.warning("TNREGINET EC fetch failed for land %s: %s", land_id, exc)

    return records


async def fetch_guideline_value(
    land_id: UUID,
    district: str,
    village: str,
    pool: asyncpg.Pool,
) -> Optional[Decimal]:
    """
    Fetch government guideline value from TNREGINET.
    Saves updated value back to land_parcels.
    Returns the decimal value, or None on failure.
    """
    try:
        async with httpx.AsyncClient(
            base_url=BASE_URL,
            headers=HEADERS,
            follow_redirects=True,
            timeout=TIMEOUT,
        ) as client:
            resp = await client.get(
                "/portal/web/guest/e-service/guideline-value",
                params={"district": district, "village": village},
            )
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")
            gv = _parse_guideline_value(soup)

            if gv is not None:
                await pool.execute(
                    "UPDATE land_parcels SET guideline_value = $1 WHERE id = $2",
                    gv, land_id,
                )
            return gv

    except (httpx.HTTPError, asyncio.TimeoutError) as exc:
        logger.warning("TNREGINET guideline value fetch failed for land %s: %s", land_id, exc)

    return None


# ─────────────────────────────────────────────────────────────
# Private helpers
# ─────────────────────────────────────────────────────────────

def _extract_hidden_fields(soup: BeautifulSoup) -> dict:
    return {
        tag["name"]: tag.get("value", "")
        for tag in soup.find_all("input", {"type": "hidden"})
        if tag.get("name")
    }


def _parse_ec_table(soup: BeautifulSoup) -> list[dict]:
    """Parse EC result HTML table into list of record dicts."""
    records: list[dict] = []
    table = soup.find("table")
    if not table:
        return records

    rows = table.find_all("tr")
    headers = [th.get_text(strip=True).lower() for th in rows[0].find_all(["th", "td"])] if rows else []

    for row in rows[1:]:
        cells = [td.get_text(strip=True) for td in row.find_all("td")]
        if not cells:
            continue
        rec: dict = {}
        for i, header in enumerate(headers):
            if i >= len(cells):
                break
            val = cells[i]
            if "seller" in header or "executant" in header:
                rec["seller_name"] = val
            elif "buyer" in header or "claimant" in header:
                rec["buyer_name"] = val
            elif "date" in header and "reg" in header:
                rec["transaction_date"] = _parse_date(val)
            elif "doc" in header and "no" in header:
                rec["document_number"] = val
            elif "sro" in header or "office" in header:
                rec["sro_office"] = val
            elif "amount" in header or "value" in header:
                rec["transaction_amount"] = _parse_decimal(val)
            elif "deed" in header or "nature" in header:
                rec["transaction_type"] = val
                rec["deed_description"] = val
        records.append(rec)

    return records


def _parse_guideline_value(soup: BeautifulSoup) -> Optional[Decimal]:
    """Extract the guideline value number from the TNREGINET response."""
    for tag in soup.find_all(["td", "span", "div", "p"]):
        text = tag.get_text(strip=True).replace(",", "")
        # Look for a number that looks like a rate per sqft
        import re
        match = re.search(r"(\d+(?:\.\d+)?)", text)
        if match:
            parent_text = (tag.parent or tag).get_text(strip=True).lower()
            if any(k in parent_text for k in ("guideline", "value", "rate")):
                try:
                    return Decimal(match.group(1))
                except Exception:  # noqa: BLE001
                    pass
    return None


def _parse_date(val: str):
    """Try to parse a date string into a date object."""
    from datetime import date
    import re
    val = val.strip()
    # Try DD/MM/YYYY or DD-MM-YYYY
    match = re.match(r"(\d{2})[/\-](\d{2})[/\-](\d{4})", val)
    if match:
        try:
            return date(int(match.group(3)), int(match.group(2)), int(match.group(1)))
        except ValueError:
            pass
    return None


def _parse_decimal(val: str) -> Optional[Decimal]:
    import re
    cleaned = re.sub(r"[^\d.]", "", val)
    try:
        return Decimal(cleaned) if cleaned else None
    except Exception:  # noqa: BLE001
        return None
