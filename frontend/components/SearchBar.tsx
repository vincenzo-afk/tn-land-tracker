'use client';

import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { DISTRICTS, TALUKS, VILLAGES } from '@/lib/constants';
import type { SearchParams } from '@/lib/api';

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  loading?: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [village, setVillage] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const taluks = district ? (TALUKS[district] || []) : [];
  const villages = taluk ? (VILLAGES[taluk] || []) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse the query for survey no / patta no / owner name
    const params: SearchParams = {};
    if (query.trim()) {
      if (/^\d+$/.test(query.trim())) {
        params.survey_number = query.trim();
      } else if (/^P-/i.test(query.trim())) {
        params.patta_number = query.trim();
      } else {
        params.owner_name = query.trim();
      }
    }
    if (district) params.district = district;
    if (taluk)    params.taluk = taluk;
    if (village)  params.village = village;

    onSearch(params);
  };

  const handleDistrictChange = (d: string) => {
    setDistrict(d);
    setTaluk('');
    setVillage('');
  };
  const handleTalukChange = (t: string) => {
    setTaluk(t);
    setVillage('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      {/* Main search input */}
      <div className="relative flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
          <input
            id="main-search"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Survey number, Patta number, or Owner name…"
            className="w-full h-14 pl-12 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-14 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Searching…</>
          ) : (
            'Search'
          )}
        </button>
      </div>

      {/* Filter toggle */}
      <button
        type="button"
        onClick={() => setShowFilters(v => !v)}
        className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors ml-1"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        {showFilters ? 'Hide' : 'Filter by'} District → Taluk → Village
      </button>

      {/* Cascading dropdowns */}
      {showFilters && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SelectField
            id="district-select"
            label="District"
            value={district}
            onChange={handleDistrictChange}
            options={DISTRICTS}
            placeholder="All districts"
          />
          <SelectField
            id="taluk-select"
            label="Taluk"
            value={taluk}
            onChange={handleTalukChange}
            options={taluks}
            placeholder="All taluks"
            disabled={!district}
          />
          <SelectField
            id="village-select"
            label="Village"
            value={village}
            onChange={setVillage}
            options={villages}
            placeholder="All villages"
            disabled={!taluk}
          />
        </div>
      )}
    </form>
  );
}

function SelectField({
  id, label, value, onChange, options, placeholder, disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full h-11 pl-3 pr-8 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white appearance-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
    </div>
  );
}
