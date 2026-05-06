-- TN Land Tracker — Supabase Schema
-- Run this SQL in the Supabase SQL Editor to create all 4 tables.
-- DO NOT modify any column name, data type, or constraint.

-- Table 1: land_parcels
CREATE TABLE land_parcels (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patta_number          TEXT,
  survey_number         TEXT        NOT NULL,
  subdivision_number    TEXT,
  district              TEXT        NOT NULL,
  taluk                 TEXT        NOT NULL,
  village               TEXT        NOT NULL,
  area_hectares         DECIMAL,
  area_acres            DECIMAL,
  land_type             TEXT,
  land_nature           TEXT,
  soil_type             TEXT,
  water_source          TEXT,
  is_govt_land          BOOLEAN     DEFAULT false,
  poramboke_type        TEXT,
  guideline_value       DECIMAL,
  guideline_value_unit  TEXT        DEFAULT 'per sqft',
  fmb_sketch_url        TEXT,
  status                TEXT        DEFAULT 'active',
  last_synced_at        TIMESTAMP   DEFAULT NOW(),
  created_at            TIMESTAMP   DEFAULT NOW()
);

-- Table 2: owners
CREATE TABLE owners (
  id             UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      TEXT      NOT NULL,
  relation_type  TEXT,
  relative_name  TEXT,
  address        TEXT,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- Table 3: land_owner_map
CREATE TABLE land_owner_map (
  id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  land_id       UUID      REFERENCES land_parcels(id),
  owner_id      UUID      REFERENCES owners(id),
  is_current    BOOLEAN   DEFAULT true,
  patta_number  TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Table 4: ownership_history
CREATE TABLE ownership_history (
  id                UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  land_id           UUID      REFERENCES land_parcels(id),
  transaction_type  TEXT,
  seller_name       TEXT,
  buyer_name        TEXT,
  transaction_date  DATE,
  document_number   TEXT,
  sro_office        TEXT,
  transaction_amount DECIMAL,
  deed_description  TEXT,
  ec_period_start   DATE,
  ec_period_end     DATE,
  created_at        TIMESTAMP DEFAULT NOW()
);
