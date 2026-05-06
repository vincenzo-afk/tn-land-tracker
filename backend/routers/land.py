"""
routers/land.py — All 6 read-only GET endpoints.
"""
from __future__ import annotations
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
import asyncpg

from database import get_pool
from schemas.land import (
    SearchResponse,
    LandSummary,
    LandDetail,
    OwnerOut,
    OwnershipHistoryOut,
    FMBResponse,
    GuidelineValueResponse,
    MapGeoJSONResponse,
    MapPin,
)
from services import tneservices, tnreginet, r2_storage

# Village center coordinates for map pins (lat, lon)
from lib.village_coords import VILLAGE_COORDS

router = APIRouter()


# ─────────────────────────────────────────────────────────────
# Helper: asyncpg pool dependency
# ─────────────────────────────────────────────────────────────
async def db() -> asyncpg.Pool:
    return await get_pool()


# ─────────────────────────────────────────────────────────────
# 1. GET /land/search
# ─────────────────────────────────────────────────────────────
@router.get("/search", response_model=SearchResponse)
async def search_land(
    district:      Optional[str] = Query(None),
    taluk:         Optional[str] = Query(None),
    village:       Optional[str] = Query(None),
    survey_number: Optional[str] = Query(None),
    patta_number:  Optional[str] = Query(None),
    owner_name:    Optional[str] = Query(None),
    pool: asyncpg.Pool = Depends(db),
):
    """
    Search land parcels. All parameters optional.
    Returns matching records from Supabase cache.
    On cache-miss (no survey+district combo found), triggers scrape from TN eServices.
    """
    # Build dynamic WHERE clause
    conditions: list[str] = []
    params: list = []
    p = 1

    if district:
        conditions.append(f"lp.district ILIKE ${p}")
        params.append(f"%{district}%"); p += 1
    if taluk:
        conditions.append(f"lp.taluk ILIKE ${p}")
        params.append(f"%{taluk}%"); p += 1
    if village:
        conditions.append(f"lp.village ILIKE ${p}")
        params.append(f"%{village}%"); p += 1
    if survey_number:
        conditions.append(f"lp.survey_number ILIKE ${p}")
        params.append(f"%{survey_number}%"); p += 1
    if patta_number:
        conditions.append(f"lp.patta_number ILIKE ${p}")
        params.append(f"%{patta_number}%"); p += 1

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    # Owner name filter joins owner table
    owner_join = ""
    if owner_name:
        owner_join = (
            "JOIN land_owner_map lom ON lom.land_id = lp.id "
            "JOIN owners o ON o.id = lom.owner_id AND lom.is_current = true"
        )
        conditions.append(f"o.full_name ILIKE ${p}")
        params.append(f"%{owner_name}%"); p += 1
        where = "WHERE " + " AND ".join(conditions)

    query = f"""
        SELECT
            lp.id, lp.survey_number, lp.subdivision_number, lp.patta_number,
            lp.district, lp.taluk, lp.village,
            lp.area_hectares, lp.area_acres,
            lp.land_type, lp.status, lp.is_govt_land,
            o2.full_name AS owner_name
        FROM land_parcels lp
        {owner_join}
        LEFT JOIN land_owner_map lom2 ON lom2.land_id = lp.id AND lom2.is_current = true
        LEFT JOIN owners o2 ON o2.id = lom2.owner_id
        {where}
        ORDER BY lp.created_at DESC
        LIMIT 50
    """

    rows = await pool.fetch(query, *params)

    # Cache miss: try scraping from TN eServices when a specific survey+district given
    if not rows and survey_number and district:
        scraped = await tneservices.fetch_land_parcel(
            district=district,
            taluk=taluk or "",
            village=village or "",
            survey_number=survey_number,
            patta_number=patta_number,
            pool=pool,
        )
        if scraped:
            rows = await pool.fetch(query, *params)

    results = [LandSummary(**dict(row)) for row in rows]
    return SearchResponse(results=results, total=len(results))


# ─────────────────────────────────────────────────────────────
# 2. GET /land/{id}
# ─────────────────────────────────────────────────────────────
@router.get("/{land_id}", response_model=LandDetail)
async def get_land_detail(
    land_id: UUID,
    pool: asyncpg.Pool = Depends(db),
):
    """Full land parcel details including current owner."""
    row = await pool.fetchrow(
        """
        SELECT
            lp.*,
            o.id       AS o_id,
            o.full_name, o.relation_type, o.relative_name, o.address
        FROM land_parcels lp
        LEFT JOIN land_owner_map lom ON lom.land_id = lp.id AND lom.is_current = true
        LEFT JOIN owners o ON o.id = lom.owner_id
        WHERE lp.id = $1
        """,
        land_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Land parcel not found.")

    data = dict(row)
    owner = None
    if data.get("o_id"):
        owner = OwnerOut(
            id=data["o_id"],
            full_name=data["full_name"],
            relation_type=data.get("relation_type"),
            relative_name=data.get("relative_name"),
            address=data.get("address"),
        )

    return LandDetail(
        id=data["id"],
        survey_number=data["survey_number"],
        subdivision_number=data.get("subdivision_number"),
        patta_number=data.get("patta_number"),
        district=data["district"],
        taluk=data["taluk"],
        village=data["village"],
        area_hectares=data.get("area_hectares"),
        area_acres=data.get("area_acres"),
        land_type=data.get("land_type"),
        land_nature=data.get("land_nature"),
        soil_type=data.get("soil_type"),
        water_source=data.get("water_source"),
        is_govt_land=data.get("is_govt_land", False),
        poramboke_type=data.get("poramboke_type"),
        guideline_value=data.get("guideline_value"),
        guideline_value_unit=data.get("guideline_value_unit", "per sqft"),
        fmb_sketch_url=data.get("fmb_sketch_url"),
        status=data.get("status"),
        last_synced_at=data.get("last_synced_at"),
        created_at=data.get("created_at"),
        current_owner=owner,
    )


# ─────────────────────────────────────────────────────────────
# 3. GET /land/{id}/history
# ─────────────────────────────────────────────────────────────
@router.get("/{land_id}/history", response_model=list[OwnershipHistoryOut])
async def get_ownership_history(
    land_id: UUID,
    pool: asyncpg.Pool = Depends(db),
):
    """
    Returns ownership history (EC records) for a land parcel.
    Cache miss triggers fetch from TNREGINET.
    """
    rows = await pool.fetch(
        """
        SELECT * FROM ownership_history
        WHERE land_id = $1
        ORDER BY transaction_date ASC NULLS LAST
        """,
        land_id,
    )

    if not rows:
        # Fetch land parcel to get location details for scraping
        land_row = await pool.fetchrow(
            "SELECT district, taluk, village, survey_number, patta_number FROM land_parcels WHERE id = $1",
            land_id,
        )
        if not land_row:
            raise HTTPException(status_code=404, detail="Land parcel not found.")

        await tnreginet.fetch_ec_data(
            land_id=land_id,
            district=land_row["district"],
            survey_number=land_row["survey_number"],
            patta_number=land_row.get("patta_number"),
            pool=pool,
        )
        rows = await pool.fetch(
            "SELECT * FROM ownership_history WHERE land_id = $1 ORDER BY transaction_date ASC NULLS LAST",
            land_id,
        )

    return [OwnershipHistoryOut(**dict(r)) for r in rows]


# ─────────────────────────────────────────────────────────────
# 4. GET /land/{id}/fmb
# ─────────────────────────────────────────────────────────────
@router.get("/{land_id}/fmb", response_model=FMBResponse)
async def get_fmb_sketch(
    land_id: UUID,
    pool: asyncpg.Pool = Depends(db),
):
    """
    Returns FMB sketch URL from Cloudflare R2.
    Cache miss triggers fetch from TN eServices → upload to R2.
    """
    row = await pool.fetchrow(
        "SELECT fmb_sketch_url, district, taluk, village, survey_number, patta_number FROM land_parcels WHERE id = $1",
        land_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Land parcel not found.")

    url = row["fmb_sketch_url"]
    if url:
        return FMBResponse(land_id=land_id, fmb_sketch_url=url)

    # Cache miss — fetch and upload
    url = await tneservices.fetch_and_upload_fmb(
        land_id=land_id,
        district=row["district"],
        taluk=row["taluk"],
        village=row["village"],
        survey_number=row["survey_number"],
        patta_number=row.get("patta_number"),
        pool=pool,
    )
    if not url:
        raise HTTPException(
            status_code=503,
            detail="FMB sketch unavailable from TN eServices at this time. Please try again later.",
        )
    return FMBResponse(land_id=land_id, fmb_sketch_url=url)


# ─────────────────────────────────────────────────────────────
# 5. GET /land/{id}/guideline-value
# ─────────────────────────────────────────────────────────────
@router.get("/{land_id}/guideline-value", response_model=GuidelineValueResponse)
async def get_guideline_value(
    land_id: UUID,
    pool: asyncpg.Pool = Depends(db),
):
    """Returns the government guideline value with mandatory disclaimer."""
    row = await pool.fetchrow(
        "SELECT guideline_value, guideline_value_unit FROM land_parcels WHERE id = $1",
        land_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Land parcel not found.")

    gv = row["guideline_value"]
    if gv is None:
        # Try fetching from TNREGINET
        land_row = await pool.fetchrow(
            "SELECT district, taluk, village, survey_number FROM land_parcels WHERE id = $1",
            land_id,
        )
        if land_row:
            gv = await tnreginet.fetch_guideline_value(
                land_id=land_id,
                district=land_row["district"],
                village=land_row["village"],
                pool=pool,
            )

    return GuidelineValueResponse(
        land_id=land_id,
        guideline_value=gv,
        guideline_value_unit=row["guideline_value_unit"] or "per sqft",
    )


# ─────────────────────────────────────────────────────────────
# 6. GET /land/map/geojson
# ─────────────────────────────────────────────────────────────
@router.get("/map/geojson", response_model=MapGeoJSONResponse)
async def get_map_geojson(
    district: Optional[str] = Query(None),
    pool: asyncpg.Pool = Depends(db),
):
    """
    Returns village-center pins for all land parcels.
    No polygon data. Location is approximate.
    """
    if district:
        rows = await pool.fetch(
            """
            SELECT lp.id, lp.survey_number, lp.patta_number, lp.village, lp.district,
                   lp.area_hectares, lp.land_type,
                   o.full_name AS owner_name
            FROM land_parcels lp
            LEFT JOIN land_owner_map lom ON lom.land_id = lp.id AND lom.is_current = true
            LEFT JOIN owners o ON o.id = lom.owner_id
            WHERE lp.district ILIKE $1
            LIMIT 500
            """,
            f"%{district}%",
        )
    else:
        rows = await pool.fetch(
            """
            SELECT lp.id, lp.survey_number, lp.patta_number, lp.village, lp.district,
                   lp.area_hectares, lp.land_type,
                   o.full_name AS owner_name
            FROM land_parcels lp
            LEFT JOIN land_owner_map lom ON lom.land_id = lp.id AND lom.is_current = true
            LEFT JOIN owners o ON o.id = lom.owner_id
            LIMIT 500
            """
        )

    pins: list[MapPin] = []
    for row in rows:
        coords = VILLAGE_COORDS.get(row["village"].lower(), {})
        pins.append(
            MapPin(
                id=row["id"],
                survey_number=row["survey_number"],
                patta_number=row.get("patta_number"),
                owner_name=row.get("owner_name"),
                village=row["village"],
                district=row["district"],
                area_hectares=row.get("area_hectares"),
                land_type=row.get("land_type"),
                lat=coords.get("lat"),
                lon=coords.get("lon"),
            )
        )

    return MapGeoJSONResponse(features=pins)
