import type { Metadata } from 'next';
import { ExternalLink, ShieldAlert, Info, Database, MapPin, AlertTriangle, FileWarning, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About — TN Land Tracker',
  description: 'About TN Land Tracker: data sources, disclaimers, and how it works.',
};

const DISCLAIMERS = [
  {
    id: 1,
    icon: <Database className="w-4 h-4" />,
    title: 'Data Source',
    text: 'Data sourced from TN eServices (eservices.tn.gov.in) and TNREGINET (tnreginet.gov.in). This platform is for informational purposes only.',
  },
  {
    id: 2,
    icon: <Info className="w-4 h-4" />,
    title: 'Guideline Value',
    text: 'Guideline Value shown is the Government-set rate from TNREGINET. It is NOT the live market price of the property.',
    color: 'amber',
  },
  {
    id: 3,
    icon: <FileWarning className="w-4 h-4" />,
    title: 'FMB Sketch',
    text: 'FMB Sketch is the official Field Measurement Book diagram. It is NOT a GPS-accurate polygon.',
  },
  {
    id: 4,
    icon: <MapPin className="w-4 h-4" />,
    title: 'Map Location',
    text: 'Map location is approximate based on village coordinates. Exact parcel GPS boundary is not available.',
  },
  {
    id: 5,
    icon: <AlertTriangle className="w-4 h-4" />,
    title: 'Ownership History',
    text: 'Ownership history covers registered transactions only, up to 30 years, as available in TNREGINET EC records.',
  },
  {
    id: 6,
    icon: <Scale className="w-4 h-4" />,
    title: 'Not an Official Service',
    text: 'This is not an official government service. Always verify with the relevant revenue or registration office for legal purposes.',
    color: 'red',
  },
];

const SOURCES = [
  { name: 'TN eServices', url: 'https://eservices.tn.gov.in', desc: 'Patta, Chitta, A-Register extracts and FMB sketch downloads.' },
  { name: 'TNREGINET', url: 'https://tnreginet.gov.in', desc: 'Encumbrance Certificate (EC) records and Government Guideline Value.' },
  { name: 'Bhuvan ISRO', url: 'https://bhuvan.nrsc.gov.in', desc: 'Satellite imagery and Land Use / Land Cover (LULC) WMS layers.' },
  { name: 'OpenStreetMap', url: 'https://openstreetmap.org', desc: 'Base map tiles — roads, place names, district labels.' },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
          <ShieldAlert className="w-3.5 h-3.5" /> Read-only · No Login · Tamil Nadu Only
        </span>
        <h1 className="text-3xl font-bold text-white mb-3">About TN Land Tracker</h1>
        <p className="text-slate-400 leading-relaxed">
          TN Land Tracker is a free, read-only web application that lets anyone search and view land ownership details across Tamil Nadu — with no login required.
        </p>
      </div>

      {/* What it does */}
      <Section title="What It Does">
        <p className="text-slate-400 text-sm leading-relaxed mb-4">
          It pulls data from three government sources (TN eServices, TNREGINET, Bhuvan ISRO), caches it in a Supabase PostgreSQL database, and presents it through a clean interface with an interactive Leaflet.js map.
        </p>
        <p className="text-slate-400 text-sm leading-relaxed">
          The system covers: <span className="text-slate-200">patta details, owner info, land type, area, ownership history (EC data up to 30 years), FMB sketch, guideline value, and satellite/land-use map view.</span>
        </p>
        <div className="mt-4 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-400">
          <p className="font-medium text-slate-300 mb-2">This system does <span className="text-red-400">NOT</span> support:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Land registration or transfer</li>
            <li>Document submission of any kind</li>
            <li>User accounts, login, or sessions</li>
            <li>Any data outside Tamil Nadu</li>
            <li>Live market prices</li>
          </ul>
        </div>
      </Section>

      {/* Data Sources */}
      <Section title="Data Sources">
        <div className="space-y-4">
          {SOURCES.map(s => (
            <div key={s.name} className="flex items-start gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1">
                  {s.name} <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Disclaimers */}
      <Section title="Disclaimers">
        <p className="text-xs text-slate-500 mb-4">All 6 disclaimers below apply to every part of this application:</p>
        <div className="space-y-3">
          {DISCLAIMERS.map(d => {
            const colors =
              d.color === 'amber' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' :
              d.color === 'red'   ? 'bg-red-500/5 border-red-500/20 text-red-400' :
                                    'bg-slate-900 border-slate-800 text-slate-400';
            return (
              <div key={d.id} className={`flex items-start gap-3 rounded-xl p-4 border ${colors}`}>
                <div className="shrink-0 mt-0.5">{d.icon}</div>
                <div>
                  <p className="text-xs font-semibold mb-0.5">{d.title}</p>
                  <p className="text-xs leading-relaxed opacity-80">
                    {d.id === 2 ? (
                      <><strong>Guideline Value shown is the Government-set rate from TNREGINET. It is NOT the live market price of the property.</strong></>
                    ) : d.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Cost */}
      <Section title="Infrastructure Cost">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400 mb-1">₹0</p>
          <p className="text-xs text-slate-400">Total monthly infrastructure cost</p>
          <p className="text-xs text-slate-500 mt-2">
            Vercel (frontend) · Render (backend) · Supabase (database) · Cloudflare R2 (storage) — all free tier.
          </p>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-white mb-4 pb-3 border-b border-slate-800">{title}</h2>
      {children}
    </section>
  );
}
