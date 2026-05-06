"""
models/land.py — SQLAlchemy ORM models for all 4 tables.
(Used for reference; async DB queries use asyncpg raw SQL.)
"""
import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Column, String, Boolean, Numeric, DateTime, Date,
    ForeignKey, Text, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class LandParcel(Base):
    __tablename__ = "land_parcels"

    id                   = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patta_number         = Column(Text, nullable=True)
    survey_number        = Column(Text, nullable=False)
    subdivision_number   = Column(Text, nullable=True)
    district             = Column(Text, nullable=False)
    taluk                = Column(Text, nullable=False)
    village              = Column(Text, nullable=False)
    area_hectares        = Column(Numeric, nullable=True)
    area_acres           = Column(Numeric, nullable=True)
    land_type            = Column(Text, nullable=True)
    land_nature          = Column(Text, nullable=True)
    soil_type            = Column(Text, nullable=True)
    water_source         = Column(Text, nullable=True)
    is_govt_land         = Column(Boolean, default=False)
    poramboke_type       = Column(Text, nullable=True)
    guideline_value      = Column(Numeric, nullable=True)
    guideline_value_unit = Column(Text, default="per sqft")
    fmb_sketch_url       = Column(Text, nullable=True)
    status               = Column(Text, default="active")
    last_synced_at       = Column(DateTime, server_default=func.now())
    created_at           = Column(DateTime, server_default=func.now())

    owner_maps = relationship("LandOwnerMap", back_populates="land")
    history    = relationship("OwnershipHistory", back_populates="land")


class Owner(Base):
    __tablename__ = "owners"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name     = Column(Text, nullable=False)
    relation_type = Column(Text, nullable=True)
    relative_name = Column(Text, nullable=True)
    address       = Column(Text, nullable=True)
    created_at    = Column(DateTime, server_default=func.now())

    land_maps = relationship("LandOwnerMap", back_populates="owner")


class LandOwnerMap(Base):
    __tablename__ = "land_owner_map"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    land_id      = Column(UUID(as_uuid=True), ForeignKey("land_parcels.id"))
    owner_id     = Column(UUID(as_uuid=True), ForeignKey("owners.id"))
    is_current   = Column(Boolean, default=True)
    patta_number = Column(Text, nullable=True)
    created_at   = Column(DateTime, server_default=func.now())

    land  = relationship("LandParcel", back_populates="owner_maps")
    owner = relationship("Owner", back_populates="land_maps")


class OwnershipHistory(Base):
    __tablename__ = "ownership_history"

    id                 = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    land_id            = Column(UUID(as_uuid=True), ForeignKey("land_parcels.id"))
    transaction_type   = Column(Text, nullable=True)
    seller_name        = Column(Text, nullable=True)
    buyer_name         = Column(Text, nullable=True)
    transaction_date   = Column(Date, nullable=True)
    document_number    = Column(Text, nullable=True)
    sro_office         = Column(Text, nullable=True)
    transaction_amount = Column(Numeric, nullable=True)
    deed_description   = Column(Text, nullable=True)
    ec_period_start    = Column(Date, nullable=True)
    ec_period_end      = Column(Date, nullable=True)
    created_at         = Column(DateTime, server_default=func.now())

    land = relationship("LandParcel", back_populates="history")
