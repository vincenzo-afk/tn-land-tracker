'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Layers, List } from 'lucide-react';
import { DISTRICTS } from '@/lib/constants';
import { getMapGeoJSON } from '@/lib/api';

interface MapPin {
  id: string;
  survey_number: string;
  patta_number?: string;
  owner_name?: string;
  village: string;
  district: string;
  area_hectares?: number;
  land_type?: string;
  lat?: number;
  lon?: number;
}

export default function MapExplorerPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [pins, setPins] = useState<MapPin[]>([]);
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPins = async (d?: string) => {
    setLoading(true);
    try {
      const data = await getMapGeoJSON(d);
      setPins(data.features || []);
    } catch {
      setPins([]);
    } finally {
      setLoading(false);
    }
  };

  // Init map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!).setView([11.1271, 78.6569], 7);
      mapInstanceRef.current = map;

      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      });
      const bhuvanSat = L.tileLayer.wms('https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms', {
        layers: 'india_hd', format: 'image/jpeg', transparent: false, attribution: '© ISRO Bhuvan',
      });
      const bhuvanLULC = L.tileLayer.wms('https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms', {
        layers: 'lulc:TN_LULC50K_1112', format: 'image/png', transparent: true, opacity: 0.6, attribution: '© ISRO Bhuvan LULC',
      } as Parameters<typeof L.tileLayer.wms>[1]);

      osm.addTo(map);
      L.control.layers(
        { 'OpenStreetMap': osm, 'Bhuvan Satellite': bhuvanSat },
        { 'Land Use (LULC)': bhuvanLULC }
      ).addTo(map);
    });

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render pins whenever they change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      const map = mapInstanceRef.current as ReturnType<typeof L.map>;

      // Remove existing markers (simple approach)
      map.eachLayer((layer: unknown) => {
        if ((layer as { options?: { pane?: string } })?.options?.pane === 'markerPane') {
          map.removeLayer(layer as Parameters<typeof map.removeLayer>[0]);
        }
      });

      pins.forEach((pin) => {
        if (!pin.lat || !pin.lon) return;
        const marker = L.marker([pin.lat, pin.lon]).addTo(map);
        marker.bindPopup(
          `<div style="font-family:sans-serif;font-size:12px;min-width:180px">
            <strong style="font-size:13px">Survey #${pin.survey_number}</strong><br/>
            ${pin.owner_name ? `<span style="color:#64748b">Owner: ${pin.owner_name}</span><br/>` : ''}
            ${pin.area_hectares ? `<span style="color:#64748b">Area: ${Number(pin.area_hectares).toFixed(2)} ha</span><br/>` : ''}
            ${pin.land_type ? `<span style="color:#64748b">Type: ${pin.land_type}</span><br/>` : ''}
            <span style="color:#64748b">${pin.village}, ${pin.district}</span><br/>
            <a href="/land/${pin.id}" style="color:#10b981;font-weight:600;text-decoration:none;display:block;margin-top:6px">View Full Details →</a>
          </div>`
        );
      });
    });
  }, [pins]);

  const handleDistrictChange = (d: string) => {
    setDistrict(d);
    fetchPins(d || undefined);
  };

  useEffect(() => { fetchPins(); }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />

      {/* Sidebar */}
      <aside className="w-72 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-base font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Map Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-1">Tamil Nadu land parcels</p>
        </div>

        {/* District filter */}
        <div className="p-4 border-b border-slate-800">
          <label className="text-xs font-medium text-slate-400 mb-2 block">Filter by District</label>
          <div className="relative">
            <select
              value={district}
              onChange={e => handleDistrictChange(e.target.value)}
              className="w-full h-9 pl-3 pr-8 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white appearance-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            >
              <option value="">All Districts</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Pin list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 flex items-center gap-1"><List className="w-3.5 h-3.5" /> {pins.length} parcel{pins.length !== 1 ? 's' : ''}</span>
            {loading && <span className="text-xs text-emerald-400 animate-pulse">Loading…</span>}
          </div>

          <div className="space-y-2">
            {pins.slice(0, 50).map(pin => (
              <Link
                key={pin.id}
                href={`/land/${pin.id}`}
                className="block bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-lg p-3 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-emerald-400">#{pin.survey_number}</p>
                    <p className="text-xs text-slate-300 font-medium truncate mt-0.5">{pin.village}</p>
                    {pin.owner_name && <p className="text-xs text-slate-500 truncate">{pin.owner_name}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">→</span>
                </div>
              </Link>
            ))}
            {pins.length === 0 && !loading && (
              <p className="text-xs text-slate-600 text-center py-8">No parcels found.</p>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-600 leading-relaxed">
            Map location is approximate. Exact parcel GPS boundary is not available.
          </p>
        </div>
      </aside>

      {/* Map */}
      <div ref={mapRef} className="flex-1 z-0" />
    </div>
  );
}
