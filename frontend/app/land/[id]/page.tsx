'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Ruler, User, Tag, BarChart2,
  Clock, FileImage, Map, Hash, Building2, Droplets, Leaf,
} from 'lucide-react';
import {
  getLandById, getLandHistory, getFMBSketch,
  type LandDetail, type OwnershipHistory,
} from '@/lib/api';
import LandDetailSection from '@/components/LandDetailSection';
import GuidelineValueBadge from '@/components/GuidelineValueBadge';
import OwnershipTimeline from '@/components/OwnershipTimeline';
import FMBViewer from '@/components/FMBViewer';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

function SkeletonBlock({ h = 'h-6', w = 'w-full' }: { h?: string; w?: string }) {
  return <div className={`skeleton ${h} ${w} rounded-lg`} />;
}

export default function LandDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [land, setLand] = useState<LandDetail | null>(null);
  const [history, setHistory] = useState<OwnershipHistory[]>([]);
  const [fmbUrl, setFmbUrl] = useState<string | null>(null);
  const [loadingLand, setLoadingLand] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingFmb, setLoadingFmb] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    // Fetch land detail
    getLandById(id)
      .then(setLand)
      .catch(() => setNotFoundFlag(true))
      .finally(() => setLoadingLand(false));

    // Fetch history
    getLandHistory(id)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));

    // Fetch FMB
    getFMBSketch(id)
      .then(data => setFmbUrl(data.fmb_sketch_url))
      .catch(() => setFmbUrl(null))
      .finally(() => setLoadingFmb(false));
  }, [id]);

  if (notFoundFlag) notFound();

  const statusBadge = getStatusBadge(land?.status, land?.is_govt_land);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Search
      </Link>

      {/* Header */}
      <div className="mb-8">
        {loadingLand ? (
          <div className="space-y-3">
            <SkeletonBlock h="h-8" w="w-48" />
            <SkeletonBlock h="h-5" w="w-72" />
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Survey No. {land?.survey_number}
                {land?.subdivision_number && <span className="text-slate-400 text-lg ml-2">/ {land.subdivision_number}</span>}
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                {land?.village}, {land?.taluk}, {land?.district} District
              </p>
            </div>
            {statusBadge && (
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${statusBadge.className}`}>
                {statusBadge.icon}
                {statusBadge.label}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Section A — Land Identity */}
        <LandDetailSection title="Land Identity" icon={<Hash className="w-4 h-4" />}>
          {loadingLand ? <div className="space-y-3">{Array.from({length:4}).map((_,i)=><SkeletonBlock key={i} h="h-5" />)}</div> : (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DataItem label="Survey Number" value={land?.survey_number} />
              <DataItem label="Subdivision Number" value={land?.subdivision_number || '—'} />
              <DataItem label="Patta Number" value={land?.patta_number || '—'} />
              <DataItem label="District" value={land?.district} />
              <DataItem label="Taluk" value={land?.taluk} />
              <DataItem label="Village" value={land?.village} />
            </dl>
          )}
        </LandDetailSection>

        {/* Section B — Land Measurements */}
        <LandDetailSection title="Land Measurements" icon={<Ruler className="w-4 h-4" />}>
          {loadingLand ? <SkeletonBlock h="h-24" /> : (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DataItem label="Area (Hectares)" value={land?.area_hectares != null ? `${Number(land.area_hectares).toFixed(4)} ha` : '—'} />
              <DataItem label="Area (Acres)" value={land?.area_acres != null ? `${Number(land.area_acres).toFixed(4)} ac` : '—'} />
              <DataItem label="Land Type" value={land?.land_type || '—'} highlight />
              <DataItem label="Land Nature" value={land?.land_nature || '—'} />
              <DataItem label="Soil Type" value={land?.soil_type || '—'} />
              <DataItem label="Water Source" value={land?.water_source || '—'} />
            </dl>
          )}
        </LandDetailSection>

        {/* Section C — Current Owner */}
        <LandDetailSection title="Current Owner" icon={<User className="w-4 h-4" />}>
          {loadingLand ? <SkeletonBlock h="h-16" /> : land?.current_owner ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DataItem label="Owner Name" value={land.current_owner.full_name} highlight />
              {land.current_owner.relation_type && land.current_owner.relative_name && (
                <DataItem
                  label="Relation"
                  value={`${land.current_owner.relation_type} ${land.current_owner.relative_name}`}
                />
              )}
              {land.current_owner.address && (
                <div className="sm:col-span-2">
                  <DataItem label="Address" value={land.current_owner.address} />
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-slate-500">No owner information available.</p>
          )}
        </LandDetailSection>

        {/* Section D — Guideline Value */}
        <LandDetailSection title="Guideline Value" icon={<BarChart2 className="w-4 h-4" />}>
          {loadingLand ? <SkeletonBlock h="h-24" /> : (
            <GuidelineValueBadge
              value={land?.guideline_value ?? null}
              unit={land?.guideline_value_unit || 'per sqft'}
            />
          )}
        </LandDetailSection>

        {/* Section E — Ownership History */}
        <LandDetailSection
          title="Ownership History"
          subtitle="EC data from TNREGINET — up to 30 years of registered transactions"
          icon={<Clock className="w-4 h-4" />}
        >
          {loadingHistory ? (
            <div className="space-y-4">
              {Array.from({length:2}).map((_,i)=><SkeletonBlock key={i} h="h-28" />)}
            </div>
          ) : (
            <OwnershipTimeline records={history} />
          )}
        </LandDetailSection>

        {/* Section F — FMB Sketch */}
        <LandDetailSection title="FMB Sketch" icon={<FileImage className="w-4 h-4" />}>
          <FMBViewer sketchUrl={fmbUrl} loading={loadingFmb} />
        </LandDetailSection>

        {/* Section G — Map */}
        <LandDetailSection
          title="Map View"
          subtitle="Village-level approximate location only"
          icon={<Map className="w-4 h-4" />}
        >
          {loadingLand ? <SkeletonBlock h="h-80" /> : <MapView lat={null} lon={null} village={land?.village} label={`Survey No. ${land?.survey_number}`} />}
        </LandDetailSection>
      </div>

      {/* Govt land notice */}
      {land?.is_govt_land && (
        <div className="mt-8 flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <Building2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-300">Government / Poramboke Land</p>
            <p className="text-xs text-blue-400/70 mt-0.5">This parcel is recorded as government or poramboke land. It is not available for private sale.</p>
          </div>
        </div>
      )}

      {/* Synced date */}
      {land?.last_synced_at && (
        <p className="mt-6 text-xs text-slate-600 text-center">
          Last synced: {new Date(land.last_synced_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}
    </div>
  );
}

function DataItem({ label, value, highlight }: { label: string; value?: string; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-slate-500 mb-1">{label}</dt>
      <dd className={`text-sm font-medium ${highlight ? 'text-emerald-400' : 'text-slate-200'}`}>{value || '—'}</dd>
    </div>
  );
}

function getStatusBadge(status?: string, isGovt?: boolean) {
  if (isGovt) return { label: 'Govt/Poramboke', icon: <Building2 className="w-3 h-3" />, className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
  switch (status) {
    case 'disputed': return { label: 'Disputed', icon: <Tag className="w-3 h-3" />, className: 'bg-red-500/10 text-red-400 border-red-500/30' };
    default:         return { label: 'Active', icon: <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  }
}
