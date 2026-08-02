'use client';

import { useState, useCallback } from 'react';
import { Search, Map, Layers, TrendingUp, AlertTriangle } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import LandCard from '@/components/LandCard';
import { searchLand, type LandSummary, type SearchParams } from '@/lib/api';

function SkeletonCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div className="skeleton h-5 w-28 rounded" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-4 w-40 rounded" />
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-4 w-24 rounded" />
      </div>
      <div className="skeleton h-4 w-20 rounded mt-2" />
    </div>
  );
}

export default function HomePage() {
  const [results, setResults] = useState<LandSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const data = await searchLand(params);
      setResults(data.results);
      setTotal(data.total);
    } catch {
      setError('Could not reach the backend. Please try again later.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-slate-950 border-b border-slate-800/60">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Free · No Login · Tamil Nadu Only
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
            Tamil Nadu Land<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Records Search
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Search patta details, ownership history, FMB sketches and guideline values — all from public government sources.
          </p>

          {/* Search bar */}
          <SearchBar onSearch={handleSearch} loading={loading} />

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {['Patta & Chitta', 'EC History (30 yrs)', 'FMB Sketch', 'Guideline Value', 'Satellite Map'].map(f => (
              <span key={f} className="text-xs px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-8 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Results */}
        {!loading && searched && (
          <>
            {results.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-slate-400">
                    Found <span className="text-white font-semibold">{total}</span> parcel{total !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map(land => <LandCard key={land.id} land={land} />)}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <Search className="w-14 h-14 text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">No records found</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Try a different survey number, patta number, owner name, or district combination.
                </p>
              </div>
            )}
          </>
        )}

        {/* Initial state — feature cards */}
        {!searched && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
            <FeatureCard icon={<Search className="w-6 h-6" />} title="Parcel Search" desc="Search by survey number, patta number, owner name, or district + village combination." />
            <FeatureCard icon={<Layers className="w-6 h-6" />} title="Complete Records" desc="Patta, Chitta, A-Register, EC history up to 30 years, FMB sketch, and guideline value." />
            <FeatureCard icon={<Map className="w-6 h-6" />} title="Map Explorer" desc="View all parcels on an interactive Leaflet map with Bhuvan satellite and LULC layers." />
          </div>
        )}

        {/* Disclaimer footer */}
        <div className="mt-16 flex items-start gap-2 text-xs text-slate-600 border-t border-slate-800/40 pt-8">
          <TrendingUp className="w-4 h-4 mt-0.5 shrink-0" />
          <p>Data sourced from TN eServices (eservices.tn.gov.in) and TNREGINET (tnreginet.gov.in). This platform is for informational purposes only.</p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
