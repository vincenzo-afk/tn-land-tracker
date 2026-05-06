-- TN Land Tracker — Seed Data
-- 12 sample Tamil Nadu land records for local dev/testing.
-- Insert owners first, then land_parcels, then the mapping table, then history.

-- ============================================================
-- OWNERS
-- ============================================================
INSERT INTO owners (id, full_name, relation_type, relative_name, address) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Rajan Murugesan',      'Son of',      'Murugesan Pillai',    'No 5, Anna Nagar, Chennai - 600040'),
  ('11111111-0000-0000-0000-000000000002', 'Kavitha Selvam',       'Wife of',     'Selvam Krishnan',     'No 12, Kamarajar Road, Coimbatore - 641001'),
  ('11111111-0000-0000-0000-000000000003', 'Muthusamy Gopal',      'Son of',      'Gopal Naicker',       'Kamalapuram Village, Namakkal - 637001'),
  ('11111111-0000-0000-0000-000000000004', 'Lakshmi Narayanan',    'Daughter of', 'Narayanan Iyer',      'No 8, Perumal Koil Street, Madurai - 625001'),
  ('11111111-0000-0000-0000-000000000005', 'Palaniswamy Arumugam', 'Son of',      'Arumugam Thevar',     'Palayamkottai, Tirunelveli - 627002'),
  ('11111111-0000-0000-0000-000000000006', 'Selvi Balasubramanian','Wife of',     'Balasubramanian Raj', 'No 3, Bharathi Nagar, Salem - 636007'),
  ('11111111-0000-0000-0000-000000000007', 'Vijayakumar Sundaram', 'Son of',      'Sundaram Pillai',     'Srirangam, Tiruchirappalli - 620006'),
  ('11111111-0000-0000-0000-000000000008', 'Devi Ramasamy',        'Daughter of', 'Ramasamy Gounder',    'Erode West, Erode - 638001'),
  ('11111111-0000-0000-0000-000000000009', 'Subramanian Velu',     'Son of',      'Velu Panneerselvam',  'Vellore Fort, Vellore - 632001'),
  ('11111111-0000-0000-0000-000000000010', 'Annamalai Chidambaram','Son of',      'Chidambaram Pillai',  'Chidambaram Town, Cuddalore - 608001'),
  ('11111111-0000-0000-0000-000000000011', 'Meenakshi Ganesh',     'Wife of',     'Ganesh Kumar',        'Thanjavur Main Road, Thanjavur - 613001'),
  ('11111111-0000-0000-0000-000000000012', 'Karthikeyan Nair',     'Son of',      'Nair Suresh',         'Nagercoil Town, Kanyakumari - 629001');

-- ============================================================
-- LAND PARCELS
-- ============================================================
INSERT INTO land_parcels (
  id, patta_number, survey_number, subdivision_number,
  district, taluk, village,
  area_hectares, area_acres,
  land_type, land_nature, soil_type, water_source,
  is_govt_land, poramboke_type,
  guideline_value, guideline_value_unit,
  fmb_sketch_url, status
) VALUES
  (
    '22222222-0000-0000-0000-000000000001',
    'P-1042', '123', '1',
    'Chennai', 'Egmore', 'Vepery',
    0.05, 0.12,
    'Punjai', 'Dry Land', 'Sandy Loam', NULL,
    false, NULL,
    85000, 'per sqft',
    NULL, 'active'
  ),
  (
    '22222222-0000-0000-0000-000000000002',
    'P-2187', '45', '3',
    'Coimbatore', 'Coimbatore North', 'Saravanampatti',
    0.24, 0.59,
    'Nanjai', 'Wet Land', 'Black Cotton', 'Canal',
    false, NULL,
    4200, 'per sqft',
    NULL, 'active'
  ),
  (
    '22222222-0000-0000-0000-000000000003',
    'P-0891', '78', '2',
    'Namakkal', 'Namakkal', 'Kamalapuram',
    1.20, 2.97,
    'Nanjai', 'Wet Land', 'Red Soil', 'Well',
    false, NULL,
    1200, 'per sqft',
    NULL, 'active'
  ),
  (
    '22222222-0000-0000-0000-000000000004',
    'P-3345', '201', '5',
    'Madurai', 'Madurai North', 'Koodal Nagar',
    0.08, 0.20,
    'Punjai', 'Dry Land', 'Alluvial', NULL,
    false, NULL,
    12000, 'per sqft',
    NULL, 'active'
  ),
  (
    '22222222-0000-0000-0000-000000000005',
    NULL, '334', '1',
    'Tirunelveli', 'Palayamkottai', 'Melapalayam',
    0.40, 0.99,
    'Punjai', 'Dry Land', 'Sandy', NULL,
    true, 'Poramboke',
    800, 'per sqft',
    NULL, 'active'
  ),
  (
    '22222222-0000-0000-0000-000000000006',
    'P-5512', '67', '4',
    'Salem', 'Salem', 'Shevapet',
    0.15, 0.37,
    'Punjai', 'Dry Land', 'Red Laterite', NULL,
    false, NULL,
    6500, 'per sqft',
    NULL, 'active'
  ),
  (
    '22222222-0000-0000-0000-000000000007',
    'P-0765', '12', '1',
    'Tiruchirappalli', 'Srirangam', 'Srirangam',
    0.32, 0.79,
    'Nanjai', 'Wet Land', 'Alluvial', 'River',
    false, NULL,
    3800, 'per sqft',
    NULL, 'active'
  ),
  (
    '22222222-0000-0000-0000-000000000008',
    'P-4421', '190', '2',
    'Erode', 'Erode', 'Erode West',
    0.60, 1.48,
    'Nanjai', 'Wet Land', 'Clay', 'Tank',
    false, NULL,
    2900, 'per sqft',
    NULL, 'active'
  ),
  (
    '22222222-0000-0000-0000-000000000009',
    'P-2209', '55', '3',
    'Vellore', 'Vellore', 'Vellore Fort',
    0.18, 0.44,
    'Punjai', 'Dry Land', 'Sandy Loam', NULL,
    false, NULL,
    5100, 'per sqft',
    NULL, 'active'
  ),
  (
    '22222222-0000-0000-0000-000000000010',
    'P-7788', '302', '1',
    'Cuddalore', 'Chidambaram', 'Chidambaram Town',
    0.90, 2.22,
    'Nanjai', 'Wet Land', 'Black Clay', 'Canal',
    false, NULL,
    1800, 'per sqft',
    NULL, 'active'
  ),
  (
    '22222222-0000-0000-0000-000000000011',
    'P-1133', '88', '2',
    'Thanjavur', 'Thanjavur', 'Thanjavur West',
    2.10, 5.19,
    'Nanjai', 'Wet Land', 'Alluvial', 'River',
    false, NULL,
    2100, 'per sqft',
    NULL, 'active'
  ),
  (
    '22222222-0000-0000-0000-000000000012',
    'P-9900', '415', '1',
    'Kanyakumari', 'Nagercoil', 'Nagercoil Town',
    0.07, 0.17,
    'Punjai', 'Dry Land', 'Sandy', NULL,
    false, NULL,
    9800, 'per sqft',
    NULL, 'active'
  );

-- ============================================================
-- LAND_OWNER_MAP
-- ============================================================
INSERT INTO land_owner_map (land_id, owner_id, is_current, patta_number) VALUES
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', true,  'P-1042'),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', true,  'P-2187'),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000003', true,  'P-0891'),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000004', true,  'P-3345'),
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000005', false, NULL),
  ('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000006', true,  'P-5512'),
  ('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000007', true,  'P-0765'),
  ('22222222-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000008', true,  'P-4421'),
  ('22222222-0000-0000-0000-000000000009', '11111111-0000-0000-0000-000000000009', true,  'P-2209'),
  ('22222222-0000-0000-0000-000000000010', '11111111-0000-0000-0000-000000000010', true,  'P-7788'),
  ('22222222-0000-0000-0000-000000000011', '11111111-0000-0000-0000-000000000011', true,  'P-1133'),
  ('22222222-0000-0000-0000-000000000012', '11111111-0000-0000-0000-000000000012', true,  'P-9900');

-- ============================================================
-- OWNERSHIP HISTORY (EC data)
-- ============================================================
INSERT INTO ownership_history (
  land_id, transaction_type, seller_name, buyer_name,
  transaction_date, document_number, sro_office,
  transaction_amount, deed_description,
  ec_period_start, ec_period_end
) VALUES
  (
    '22222222-0000-0000-0000-000000000001',
    'Sale', 'Kumar Pillai', 'Rajan Murugesan',
    '2018-03-15', 'DOC-2018-00345', 'Egmore SRO',
    4500000, 'Sale deed — residential plot',
    '1995-01-01', '2024-12-31'
  ),
  (
    '22222222-0000-0000-0000-000000000001',
    'Mortgage', 'Rajan Murugesan', 'State Bank of India',
    '2019-06-20', 'DOC-2019-00891', 'Egmore SRO',
    2000000, 'Mortgage deed for home loan',
    '1995-01-01', '2024-12-31'
  ),
  (
    '22222222-0000-0000-0000-000000000002',
    'Sale', 'Ramesh Gounder', 'Kavitha Selvam',
    '2015-08-10', 'DOC-2015-01120', 'Coimbatore North SRO',
    1800000, 'Sale deed — agricultural land',
    '1994-01-01', '2024-12-31'
  ),
  (
    '22222222-0000-0000-0000-000000000003',
    'Gift Deed', 'Gopal Naicker', 'Muthusamy Gopal',
    '2010-01-05', 'DOC-2010-00212', 'Namakkal SRO',
    0, 'Gift deed — father to son',
    '1994-01-01', '2024-12-31'
  ),
  (
    '22222222-0000-0000-0000-000000000007',
    'Sale', 'Sundarajan Iyer', 'Vijayakumar Sundaram',
    '2012-11-22', 'DOC-2012-00567', 'Srirangam SRO',
    2200000, 'Sale deed — river-front land',
    '1993-01-01', '2024-12-31'
  ),
  (
    '22222222-0000-0000-0000-000000000011',
    'Sale', 'Ramu Pillai', 'Meenakshi Ganesh',
    '2020-04-01', 'DOC-2020-00999', 'Thanjavur SRO',
    6500000, 'Sale deed — paddy field',
    '1994-01-01', '2024-12-31'
  );
