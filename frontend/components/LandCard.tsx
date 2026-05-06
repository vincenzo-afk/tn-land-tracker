import Link from 'next/link';
import { MapPin, User, Ruler, Tag, AlertTriangle, Building2 } from 'lucide-react';
import type { LandSummary } from '@/lib/api';

interface LandCardProps {
  land: LandSummary;
}

export default function LandCard({ land }: LandCardProps) {
  const statusConfig = getStatusConfig(land.status, land.is_govt_land);

  return (
    <Link
      href={`/land/${land.id}`}
      className="group block bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-0.5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Survey #{land.survey_number}
            </span>
            {land.subdivision_number && (
              <span className="text-xs text-slate-500">Sub-div {land.subdivision_number}</span>
            )}
          </div>
          {land.patta_number && (
            <p className="text-xs text-slate-500 mt-0.5">Patta: <span className="text-slate-300">{land.patta_number}</span></p>
          )}
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${statusConfig.className}`}>
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        {land.owner_name && (
          <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Owner" value={land.owner_name} />
        )}
        <InfoRow
          icon={<MapPin className="w-3.5 h-3.5" />}
          label="Location"
          value={`${land.village}, ${land.taluk}`}
        />
        {(land.area_hectares || land.area_acres) && (
          <InfoRow
            icon={<Ruler className="w-3.5 h-3.5" />}
            label="Area"
            value={formatArea(land.area_hectares, land.area_acres)}
          />
        )}
        {land.land_type && (
          <InfoRow icon={<Tag className="w-3.5 h-3.5" />} label="Type" value={land.land_type} />
        )}
      </div>

      {/* District tag */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-600">{land.district} District</span>
        <span className="text-xs text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">View details →</span>
      </div>
    </Link>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-slate-500 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xs font-medium text-slate-200 truncate">{value}</p>
      </div>
    </div>
  );
}

function getStatusConfig(status?: string, isGovt?: boolean) {
  if (isGovt) return { label: 'Govt/Poramboke', icon: <Building2 className="w-3 h-3" />, className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
  switch (status) {
    case 'disputed': return { label: 'Disputed', icon: <AlertTriangle className="w-3 h-3" />, className: 'bg-red-500/10 text-red-400 border-red-500/30' };
    default:         return { label: 'Active', icon: <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  }
}

function formatArea(ha?: number, acres?: number): string {
  const parts: string[] = [];
  if (ha !== undefined && ha !== null) parts.push(`${Number(ha).toFixed(2)} ha`);
  if (acres !== undefined && acres !== null) parts.push(`${Number(acres).toFixed(2)} ac`);
  return parts.join(' / ') || '—';
}
