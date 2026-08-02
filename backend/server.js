/**
 * backend/server.js — Zero-dependency Node.js API server for TN Land Tracker.
 * Runs on port 8000 and serves all 6 read-only endpoints using seeded data.
 */
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 8000;

// Seeded sample land parcels
const SEED_PARCELS = [
  {
    id: "22222222-0000-0000-0000-000000000001",
    survey_number: "123",
    subdivision_number: "1",
    patta_number: "P-1042",
    district: "Chennai",
    taluk: "Egmore",
    village: "Vepery",
    area_hectares: 0.05,
    area_acres: 0.12,
    land_type: "Punjai",
    land_nature: "Dry Land",
    soil_type: "Sandy Loam",
    water_source: null,
    is_govt_land: false,
    poramboke_type: null,
    guideline_value: 85000,
    guideline_value_unit: "per sqft",
    fmb_sketch_url: null,
    status: "active",
    last_synced_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    owner_name: "Rajan Murugesan",
    lat: 13.0827,
    lon: 80.2707,
    current_owner: {
      id: "11111111-0000-0000-0000-000000000001",
      full_name: "Rajan Murugesan",
      relation_type: "Son of",
      relative_name: "Murugesan Pillai",
      address: "No 5, Anna Nagar, Chennai - 600040"
    }
  },
  {
    id: "22222222-0000-0000-0000-000000000002",
    survey_number: "45",
    subdivision_number: "3",
    patta_number: "P-2187",
    district: "Coimbatore",
    taluk: "Coimbatore North",
    village: "Saravanampatti",
    area_hectares: 0.24,
    area_acres: 0.59,
    land_type: "Nanjai",
    land_nature: "Wet Land",
    soil_type: "Black Cotton",
    water_source: "Canal",
    is_govt_land: false,
    poramboke_type: null,
    guideline_value: 4200,
    guideline_value_unit: "per sqft",
    fmb_sketch_url: null,
    status: "active",
    last_synced_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    owner_name: "Kavitha Selvam",
    lat: 11.0737,
    lon: 77.0073,
    current_owner: {
      id: "11111111-0000-0000-0000-000000000002",
      full_name: "Kavitha Selvam",
      relation_type: "Wife of",
      relative_name: "Selvam Krishnan",
      address: "No 12, Kamarajar Road, Coimbatore - 641001"
    }
  },
  {
    id: "22222222-0000-0000-0000-000000000003",
    survey_number: "78",
    subdivision_number: "2",
    patta_number: "P-0891",
    district: "Namakkal",
    taluk: "Namakkal",
    village: "Kamalapuram",
    area_hectares: 1.20,
    area_acres: 2.97,
    land_type: "Nanjai",
    land_nature: "Wet Land",
    soil_type: "Red Soil",
    water_source: "Well",
    is_govt_land: false,
    poramboke_type: null,
    guideline_value: 1200,
    guideline_value_unit: "per sqft",
    fmb_sketch_url: null,
    status: "active",
    last_synced_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    owner_name: "Muthusamy Gopal",
    lat: 11.2188,
    lon: 78.1669,
    current_owner: {
      id: "11111111-0000-0000-0000-000000000003",
      full_name: "Muthusamy Gopal",
      relation_type: "Son of",
      relative_name: "Gopal Naicker",
      address: "Kamalapuram Village, Namakkal - 637001"
    }
  },
  {
    id: "22222222-0000-0000-0000-000000000004",
    survey_number: "201",
    subdivision_number: "5",
    patta_number: "P-3345",
    district: "Madurai",
    taluk: "Madurai North",
    village: "Koodal Nagar",
    area_hectares: 0.08,
    area_acres: 0.20,
    land_type: "Punjai",
    land_nature: "Dry Land",
    soil_type: "Alluvial",
    water_source: null,
    is_govt_land: false,
    poramboke_type: null,
    guideline_value: 12000,
    guideline_value_unit: "per sqft",
    fmb_sketch_url: null,
    status: "active",
    last_synced_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    owner_name: "Lakshmi Narayanan",
    lat: 9.9252,
    lon: 78.1198,
    current_owner: {
      id: "11111111-0000-0000-0000-000000000004",
      full_name: "Lakshmi Narayanan",
      relation_type: "Daughter of",
      relative_name: "Narayanan Iyer",
      address: "No 8, Perumal Koil Street, Madurai - 625001"
    }
  },
  {
    id: "22222222-0000-0000-0000-000000000005",
    survey_number: "334",
    subdivision_number: "1",
    patta_number: null,
    district: "Tirunelveli",
    taluk: "Palayamkottai",
    village: "Melapalayam",
    area_hectares: 0.40,
    area_acres: 0.99,
    land_type: "Punjai",
    land_nature: "Dry Land",
    soil_type: "Sandy",
    water_source: null,
    is_govt_land: true,
    poramboke_type: "Poramboke",
    guideline_value: 800,
    guideline_value_unit: "per sqft",
    fmb_sketch_url: null,
    status: "active",
    last_synced_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    owner_name: "Palaniswamy Arumugam",
    lat: 8.7139,
    lon: 77.7567,
    current_owner: {
      id: "11111111-0000-0000-0000-000000000005",
      full_name: "Palaniswamy Arumugam",
      relation_type: "Son of",
      relative_name: "Arumugam Thevar",
      address: "Palayamkottai, Tirunelveli - 627002"
    }
  }
];

const SEED_HISTORY = {
  "22222222-0000-0000-0000-000000000001": [
    {
      id: "33333333-0000-0000-0000-000000000001",
      land_id: "22222222-0000-0000-0000-000000000001",
      transaction_type: "Sale",
      seller_name: "Kumar Pillai",
      buyer_name: "Rajan Murugesan",
      transaction_date: "2018-03-15",
      document_number: "DOC-2018-00345",
      sro_office: "Egmore SRO",
      transaction_amount: 4500000,
      deed_description: "Sale deed — residential plot",
      ec_period_start: "1995-01-01",
      ec_period_end: "2024-12-31"
    },
    {
      id: "33333333-0000-0000-0000-000000000002",
      land_id: "22222222-0000-0000-0000-000000000001",
      transaction_type: "Mortgage",
      seller_name: "Rajan Murugesan",
      buyer_name: "State Bank of India",
      transaction_date: "2019-06-20",
      document_number: "DOC-2019-00891",
      sro_office: "Egmore SRO",
      transaction_amount: 2000000,
      deed_description: "Mortgage deed for home loan",
      ec_period_start: "1995-01-01",
      ec_period_end: "2024-12-31"
    }
  ]
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Root health check
  if (pathname === '/' || pathname === '/land') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', service: 'TN Land Tracker API', version: '1.0.0' }));
    return;
  }

  // 1. GET /land/search
  if (pathname === '/land/search') {
    let results = [...SEED_PARCELS];

    if (query.district) {
      const d = query.district.toLowerCase();
      results = results.filter(p => p.district.toLowerCase().includes(d));
    }
    if (query.taluk) {
      const t = query.taluk.toLowerCase();
      results = results.filter(p => p.taluk.toLowerCase().includes(t));
    }
    if (query.village) {
      const v = query.village.toLowerCase();
      results = results.filter(p => p.village.toLowerCase().includes(v));
    }
    if (query.survey_number) {
      const sn = query.survey_number.toLowerCase();
      results = results.filter(p => p.survey_number.toLowerCase().includes(sn));
    }
    if (query.patta_number) {
      const pn = query.patta_number.toLowerCase();
      results = results.filter(p => (p.patta_number || '').toLowerCase().includes(pn));
    }
    if (query.owner_name) {
      const on = query.owner_name.toLowerCase();
      results = results.filter(p => (p.owner_name || '').toLowerCase().includes(on));
    }

    res.writeHead(200);
    res.end(JSON.stringify({ results, total: results.length }));
    return;
  }

  // 6. GET /land/map/geojson
  if (pathname === '/land/map/geojson') {
    let pins = SEED_PARCELS.map(p => ({
      id: p.id,
      survey_number: p.survey_number,
      patta_number: p.patta_number,
      owner_name: p.owner_name,
      village: p.village,
      district: p.district,
      area_hectares: p.area_hectares,
      land_type: p.land_type,
      lat: p.lat,
      lon: p.lon,
    }));

    if (query.district) {
      const d = query.district.toLowerCase();
      pins = pins.filter(p => p.district.toLowerCase().includes(d));
    }

    res.writeHead(200);
    res.end(JSON.stringify({
      type: "FeatureCollection",
      features: pins,
      note: "Map location is approximate based on village coordinates. Exact parcel GPS boundary is not available."
    }));
    return;
  }

  // Dynamic routes: /land/:id and sub-routes
  const landMatch = pathname.match(/^\/land\/([^\/]+)(?:\/(history|fmb|guideline-value))?$/);
  if (landMatch) {
    const id = landMatch[1];
    const subRoute = landMatch[2];
    const parcel = SEED_PARCELS.find(p => p.id === id) || SEED_PARCELS[0];

    if (subRoute === 'history') {
      const history = SEED_HISTORY[id] || SEED_HISTORY["22222222-0000-0000-0000-000000000001"];
      res.writeHead(200);
      res.end(JSON.stringify(history));
      return;
    }

    if (subRoute === 'fmb') {
      res.writeHead(200);
      res.end(JSON.stringify({
        land_id: id,
        fmb_sketch_url: parcel.fmb_sketch_url || null,
        message: "FMB sketch URL retrieved successfully."
      }));
      return;
    }

    if (subRoute === 'guideline-value') {
      res.writeHead(200);
      res.end(JSON.stringify({
        land_id: id,
        guideline_value: parcel.guideline_value,
        guideline_value_unit: parcel.guideline_value_unit,
        disclaimer: "This is the Government Guideline Value set by TNREGINET. This is NOT the live market price of the property."
      }));
      return;
    }

    // Default: GET /land/:id
    res.writeHead(200);
    res.end(JSON.stringify(parcel));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ detail: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`TN Land Tracker API server listening on http://localhost:${PORT}`);
});
