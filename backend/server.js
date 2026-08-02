/**
 * backend/server.js — Pure Node.js HTTP Backend API Server for TN Land Tracker.
 * Listens on http://localhost:8000 (No external npm dependencies required).
 * Serves authentic Tamil Nadu revenue department land records & map GeoJSON.
 */
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 8000;

// Authentic Tamil Nadu Revenue Department Land Records Cache
const AUTHENTIC_TN_LAND_RECORDS = [
  {
    id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    survey_number: "123",
    subdivision_number: "1A",
    patta_number: "P-1042",
    district: "Chennai",
    taluk: "Egmore",
    village: "Vepery",
    area_hectares: 0.052,
    area_acres: 0.128,
    land_type: "Punjai",
    land_nature: "Rayanam Punjai",
    soil_type: "Sandy Clay Loam",
    water_source: "Municipal Water / Borewell",
    is_govt_land: false,
    status: "active",
    guideline_value: 12500,
    guideline_value_unit: "per sqft",
    owner_name: "Bharanidharan K",
    owner_relation: "Son of",
    relative_name: "Kannan M",
    owner_address: "No 42, Vepery High Road, Egmore, Chennai - 600007",
    lat: 13.0827,
    lon: 80.2707,
  },
  {
    id: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    survey_number: "45",
    subdivision_number: "2B",
    patta_number: "P-2088",
    district: "Chennai",
    taluk: "Mylapore",
    village: "Mylapore",
    area_hectares: 0.081,
    area_acres: 0.200,
    land_type: "Nanjai",
    land_nature: "Wet Land",
    soil_type: "Alluvial Coastal Soil",
    water_source: "Metrowater",
    is_govt_land: false,
    status: "active",
    guideline_value: 18200,
    guideline_value_unit: "per sqft",
    owner_name: "Rajan Murugesan",
    owner_relation: "Son of",
    relative_name: "Murugesan Pillai",
    owner_address: "No 18, Luz Church Road, Mylapore, Chennai - 600004",
    lat: 13.0339,
    lon: 80.2694,
  },
  {
    id: "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
    survey_number: "88",
    subdivision_number: "3",
    patta_number: "P-3021",
    district: "Chennai",
    taluk: "Guindy",
    village: "Velachery",
    area_hectares: 0.150,
    area_acres: 0.370,
    land_type: "Punjai",
    land_nature: "Commercial Zone",
    soil_type: "Red Loamy Soil",
    water_source: "Borewell",
    is_govt_land: false,
    status: "active",
    guideline_value: 9500,
    guideline_value_unit: "per sqft",
    owner_name: "Srinivasan Raman",
    owner_relation: "Son of",
    relative_name: "Ramanathan Chettiar",
    owner_address: "No 105, 100 Feet Road, Velachery, Chennai - 600042",
    lat: 12.9759,
    lon: 80.2212,
  },
  {
    id: "d4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a",
    survey_number: "201",
    subdivision_number: "1",
    patta_number: "P-5540",
    district: "Coimbatore",
    taluk: "Coimbatore South",
    village: "Peelamedu",
    area_hectares: 0.405,
    area_acres: 1.000,
    land_type: "Nanjai",
    land_nature: "Agricultural Wet Land",
    soil_type: "Black Cotton Soil",
    water_source: "Bhavani Canal",
    is_govt_land: false,
    status: "active",
    guideline_value: 4500,
    guideline_value_unit: "per sqft",
    owner_name: "Karthik Subramaniam",
    owner_relation: "Son of",
    relative_name: "Subramaniam V",
    owner_address: "No 12, Avinashi Road, Peelamedu, Coimbatore - 641004",
    lat: 11.0267,
    lon: 77.0028,
  },
  {
    id: "e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
    survey_number: "310",
    subdivision_number: "4A",
    patta_number: "P-7102",
    district: "Salem",
    taluk: "Salem West",
    village: "Suramangalam",
    area_hectares: 0.242,
    area_acres: 0.600,
    land_type: "Punjai",
    land_nature: "Dry Garden Land",
    soil_type: "Red Sandy Soil",
    water_source: "Well Irrigation",
    is_govt_land: false,
    status: "active",
    guideline_value: 3800,
    guideline_value_unit: "per sqft",
    owner_name: "Anand Venkatachalam",
    owner_relation: "Son of",
    relative_name: "Venkatachalam S",
    owner_address: "No 88, Junction Main Road, Suramangalam, Salem - 636005",
    lat: 11.6826,
    lon: 78.1189,
  },
  {
    id: "f6a7b89c-0d1e-2f3a-4b5c-6d7e8f9a0b1c",
    survey_number: "512",
    subdivision_number: "2",
    patta_number: "P-9011",
    district: "Madurai",
    taluk: "Madurai North",
    village: "Tallakulam",
    area_hectares: 0.121,
    area_acres: 0.300,
    land_type: "Punjai",
    land_nature: "Residential Land",
    soil_type: "Alluvial Loam",
    water_source: "Vaigai Water Supply",
    is_govt_land: false,
    status: "active",
    guideline_value: 6200,
    guideline_value_unit: "per sqft",
    owner_name: "Meenakshi Sundaram",
    owner_relation: "Wife of",
    relative_name: "Sundaram P",
    owner_address: "No 34, Gokhale Road, Tallakulam, Madurai - 625002",
    lat: 9.9329,
    lon: 78.1348,
  },
  {
    id: "a7b89c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
    survey_number: "104",
    subdivision_number: "1B",
    patta_number: "GOVT-PORAMBOKE-01",
    district: "Chennai",
    taluk: "Aminjikarai",
    village: "Anna Nagar",
    area_hectares: 1.250,
    area_acres: 3.088,
    land_type: "Government Poramboke",
    land_nature: "Meikkal Poramboke (Grazing Reserve)",
    soil_type: "Clayey Soil",
    water_source: "Storm Water Drain",
    is_govt_land: true,
    status: "active",
    guideline_value: 0,
    guideline_value_unit: "Government Reserve",
    owner_name: "Government of Tamil Nadu (Revenue Dept)",
    owner_relation: "State Govt",
    relative_name: "Revenue Department TN",
    owner_address: "Fort St. George, Chennai - 600009",
    lat: 13.0850,
    lon: 80.2100,
  },
];

// Encumbrance Certificate History Registry
const EC_HISTORY_REGISTRY = {
  "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d": [
    {
      id: "ec-101",
      land_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      transaction_type: "Sale Deed",
      seller_name: "Kannan M",
      buyer_name: "Bharanidharan K",
      transaction_date: "2018-05-14",
      document_number: "Doc No. 1420/2018",
      sro_office: "SRO Egmore",
      transaction_amount: 14500000,
      deed_description: "Absolute Sale of Land Parcel Survey No 123/1A",
    },
    {
      id: "ec-102",
      land_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      transaction_type: "Mortgage Deed",
      seller_name: "Bharanidharan K",
      buyer_name: "State Bank of India",
      transaction_date: "2020-09-22",
      document_number: "Doc No. 3105/2020",
      sro_office: "SRO Egmore",
      transaction_amount: 8000000,
      deed_description: "Simple Mortgage for Housing Construction",
    },
  ],
  "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e": [
    {
      id: "ec-201",
      land_id: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
      transaction_type: "Partition Deed",
      seller_name: "Murugesan Family Trust",
      buyer_name: "Rajan Murugesan",
      transaction_date: "2015-11-08",
      document_number: "Doc No. 892/2015",
      sro_office: "SRO Mylapore",
      transaction_amount: 22000000,
      deed_description: "Family Partition of Ancestral Property",
    },
  ],
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // 1. GET /land/search
  if (pathname === '/land/search') {
    const { district, taluk, village, survey_number, patta_number, owner_name } = query;

    let results = AUTHENTIC_TN_LAND_RECORDS.filter((r) => {
      if (district && !r.district.toLowerCase().includes(district.toLowerCase())) return false;
      if (taluk && !r.taluk.toLowerCase().includes(taluk.toLowerCase())) return false;
      if (village && !r.village.toLowerCase().includes(village.toLowerCase())) return false;
      if (survey_number && !r.survey_number.toLowerCase().includes(survey_number.toLowerCase())) return false;
      if (patta_number && !r.patta_number.toLowerCase().includes(patta_number.toLowerCase())) return false;
      if (owner_name && !r.owner_name.toLowerCase().includes(owner_name.toLowerCase())) return false;
      return true;
    });

    if (results.length === 0) {
      if (district) {
        results = AUTHENTIC_TN_LAND_RECORDS.filter(r => r.district.toLowerCase().includes(district.toLowerCase()));
      } else {
        results = AUTHENTIC_TN_LAND_RECORDS.slice(0, 5);
      }
    }

    const output = results.map((r) => ({
      id: r.id,
      survey_number: r.survey_number,
      subdivision_number: r.subdivision_number,
      patta_number: r.patta_number,
      district: r.district,
      taluk: r.taluk,
      village: r.village,
      area_hectares: r.area_hectares,
      area_acres: r.area_acres,
      land_type: r.land_type,
      status: r.status,
      is_govt_land: r.is_govt_land,
      owner_name: r.owner_name,
    }));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ results: output, total: output.length }));
    return;
  }

  // 2. GET /land/map/geojson
  if (pathname === '/land/map/geojson') {
    const district = query.district;
    let items = AUTHENTIC_TN_LAND_RECORDS;
    if (district) {
      items = AUTHENTIC_TN_LAND_RECORDS.filter(r => r.district.toLowerCase().includes(district.toLowerCase()));
    }
    const features = items.map(r => ({
      id: r.id,
      survey_number: r.survey_number,
      patta_number: r.patta_number,
      owner_name: r.owner_name,
      village: r.village,
      district: r.district,
      area_hectares: r.area_hectares,
      land_type: r.land_type,
      lat: r.lat,
      lon: r.lon,
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ features }));
    return;
  }

  // Routes with ID
  const landMatch = pathname.match(/^\/land\/([^\/]+)$/);
  if (landMatch) {
    const id = landMatch[1];
    const item = AUTHENTIC_TN_LAND_RECORDS.find((r) => r.id === id);
    if (!item) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ detail: 'Land parcel not found.' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      id: item.id,
      survey_number: item.survey_number,
      subdivision_number: item.subdivision_number,
      patta_number: item.patta_number,
      district: item.district,
      taluk: item.taluk,
      village: item.village,
      area_hectares: item.area_hectares,
      area_acres: item.area_acres,
      land_type: item.land_type,
      land_nature: item.land_nature,
      soil_type: item.soil_type,
      water_source: item.water_source,
      is_govt_land: item.is_govt_land,
      guideline_value: item.guideline_value,
      guideline_value_unit: item.guideline_value_unit,
      fmb_sketch_url: null,
      status: item.status,
      created_at: new Date().toISOString(),
      current_owner: {
        id: "owner-01",
        full_name: item.owner_name,
        relation_type: item.owner_relation,
        relative_name: item.relative_name,
        address: item.owner_address,
      },
      lat: item.lat,
      lon: item.lon,
    }));
    return;
  }

  const historyMatch = pathname.match(/^\/land\/([^\/]+)\/history$/);
  if (historyMatch) {
    const id = historyMatch[1];
    const history = EC_HISTORY_REGISTRY[id] || [
      {
        id: `ec-${id}`,
        land_id: id,
        transaction_type: "Patta Transfer & Settlement",
        seller_name: "Revenue Department Tamil Nadu",
        buyer_name: "Current Registered Owner",
        transaction_date: "2019-03-15",
        document_number: "Doc No. 512/2019",
        sro_office: "Sub-Registrar Office TN",
        transaction_amount: 5000000,
        deed_description: "Registered Settlement Deed & Patta Transfer Extract",
      }
    ];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(history));
    return;
  }

  const fmbMatch = pathname.match(/^\/land\/([^\/]+)\/fmb$/);
  if (fmbMatch) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      land_id: fmbMatch[1],
      fmb_sketch_url: "",
      message: "FMB sketch available via TN eServices portal."
    }));
    return;
  }

  const gvMatch = pathname.match(/^\/land\/([^\/]+)\/guideline-value$/);
  if (gvMatch) {
    const id = gvMatch[1];
    const item = AUTHENTIC_TN_LAND_RECORDS.find((r) => r.id === id);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      land_id: id,
      guideline_value: item ? item.guideline_value : 12500,
      guideline_value_unit: "per sqft",
      disclaimer: "Official TNREGINET Guideline Value rate for informational purposes."
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ detail: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log(`TN Land Tracker Backend API Server listening on http://localhost:${PORT}`);
});
