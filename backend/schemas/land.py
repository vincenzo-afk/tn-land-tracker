"""
schemas/land.py — Pydantic request/response schemas for all 6 endpoints.
"""
from __future__ import annotations
from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


# ─────────────────────────── Owner ───────────────────────────

class OwnerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:            UUID
    full_name:     str
    relation_type: Optional[str] = None
    relative_name: Optional[str] = None
    address:       Optional[str] = None


# ─────────────────────── Land Parcel ─────────────────────────

class LandSummary(BaseModel):
    """Lightweight response used in search results and map pins."""
    model_config = ConfigDict(from_attributes=True)

    id:                 UUID
    survey_number:      str
    subdivision_number: Optional[str]  = None
    patta_number:       Optional[str]  = None
    district:           str
    taluk:              str
    village:            str
    area_hectares:      Optional[Decimal] = None
    area_acres:         Optional[Decimal] = None
    land_type:          Optional[str]  = None
    status:             Optional[str]  = None
    is_govt_land:       bool           = False
    owner_name:         Optional[str]  = None   # resolved from land_owner_map


class LandDetail(BaseModel):
    """Full land parcel response for /land/:id."""
    model_config = ConfigDict(from_attributes=True)

    id:                   UUID
    survey_number:        str
    subdivision_number:   Optional[str]     = None
    patta_number:         Optional[str]     = None
    district:             str
    taluk:                str
    village:              str
    area_hectares:        Optional[Decimal] = None
    area_acres:           Optional[Decimal] = None
    land_type:            Optional[str]     = None
    land_nature:          Optional[str]     = None
    soil_type:            Optional[str]     = None
    water_source:         Optional[str]     = None
    is_govt_land:         bool              = False
    poramboke_type:       Optional[str]     = None
    guideline_value:      Optional[Decimal] = None
    guideline_value_unit: str               = "per sqft"
    fmb_sketch_url:       Optional[str]     = None
    status:               Optional[str]     = None
    last_synced_at:       Optional[datetime]= None
    created_at:           Optional[datetime]= None
    current_owner:        Optional[OwnerOut]= None


# ────────────────────── Ownership History ────────────────────

class OwnershipHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:                 UUID
    land_id:            UUID
    transaction_type:   Optional[str]     = None
    seller_name:        Optional[str]     = None
    buyer_name:         Optional[str]     = None
    transaction_date:   Optional[date]    = None
    document_number:    Optional[str]     = None
    sro_office:         Optional[str]     = None
    transaction_amount: Optional[Decimal] = None
    deed_description:   Optional[str]     = None
    ec_period_start:    Optional[date]    = None
    ec_period_end:      Optional[date]    = None
    created_at:         Optional[datetime]= None


# ──────────────────────── FMB Sketch ─────────────────────────

class FMBResponse(BaseModel):
    land_id:       UUID
    fmb_sketch_url: str
    message:       str = "FMB sketch URL retrieved successfully."


# ─────────────────────── Guideline Value ─────────────────────

class GuidelineValueResponse(BaseModel):
    land_id:              UUID
    guideline_value:      Optional[Decimal]
    guideline_value_unit: str = "per sqft"
    disclaimer:           str = (
        "This is the Government Guideline Value set by TNREGINET. "
        "This is NOT the live market price of the property."
    )


# ───────────────────── Map GeoJSON Pin ───────────────────────

class MapPin(BaseModel):
    id:           UUID
    survey_number: str
    patta_number:  Optional[str] = None
    owner_name:    Optional[str] = None
    village:       str
    district:      str
    area_hectares: Optional[Decimal] = None
    land_type:     Optional[str]     = None
    lat:           Optional[float]   = None
    lon:           Optional[float]   = None


class MapGeoJSONResponse(BaseModel):
    type:     str = "FeatureCollection"
    features: list[MapPin]
    note:     str = (
        "Map location is approximate based on village coordinates. "
        "Exact parcel GPS boundary is not available."
    )


# ───────────────────── Search Response ───────────────────────

class SearchResponse(BaseModel):
    results: list[LandSummary]
    total:   int
