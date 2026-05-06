import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LandSummary {
  id: string;
  survey_number: string;
  subdivision_number?: string;
  patta_number?: string;
  district: string;
  taluk: string;
  village: string;
  area_hectares?: number;
  area_acres?: number;
  land_type?: string;
  status?: string;
  is_govt_land: boolean;
  owner_name?: string;
}

export interface Owner {
  id: string;
  full_name: string;
  relation_type?: string;
  relative_name?: string;
  address?: string;
}

export interface LandDetail extends LandSummary {
  land_nature?: string;
  soil_type?: string;
  water_source?: string;
  poramboke_type?: string;
  guideline_value?: number;
  guideline_value_unit: string;
  fmb_sketch_url?: string;
  last_synced_at?: string;
  created_at: string;
  current_owner?: Owner;
}

export interface OwnershipHistory {
  id: string;
  land_id: string;
  transaction_type?: string;
  seller_name?: string;
  buyer_name?: string;
  transaction_date?: string;
  document_number?: string;
  sro_office?: string;
  transaction_amount?: number;
  deed_description?: string;
  ec_period_start?: string;
  ec_period_end?: string;
}

export interface SearchParams {
  district?: string;
  taluk?: string;
  village?: string;
  survey_number?: string;
  patta_number?: string;
  owner_name?: string;
}

export const searchLand = async (params: SearchParams) => {
  const response = await api.get<{ results: LandSummary[]; total: number }>('/land/search', { params });
  return response.data;
};

export const getLandById = async (id: string) => {
  const response = await api.get<LandDetail>(`/land/${id}`);
  return response.data;
};

export const getLandHistory = async (id: string) => {
  const response = await api.get<OwnershipHistory[]>(`/land/${id}/history`);
  return response.data;
};

export const getFMBSketch = async (id: string) => {
  const response = await api.get<{ land_id: string; fmb_sketch_url: string; message: string }>(`/land/${id}/fmb`);
  return response.data;
};

export const getGuidelineValue = async (id: string) => {
  const response = await api.get<{
    land_id: string;
    guideline_value?: number;
    guideline_value_unit: string;
    disclaimer: string;
  }>(`/land/${id}/guideline-value`);
  return response.data;
};

export const getMapGeoJSON = async (district?: string) => {
  const response = await api.get('/land/map/geojson', { params: { district } });
  return response.data;
};

export default api;
