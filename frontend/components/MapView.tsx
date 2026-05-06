'use client';

import { useEffect, useRef } from 'react';
import { Info } from 'lucide-react';

interface MapViewProps {
  lat?: number | null;
  lon?: number | null;
  village?: string;
  label?: string;
  zoom?: number;
  height?: string;
}

export default function MapView({
  lat,
  lon,
  village = '',
  label = 'Land parcel location (approximate)',
  zoom = 13,
  height = 'h-80',
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  // Default to Tamil Nadu center if no coords
  const centerLat = lat ?? 11.1271;
  const centerLon = lon ?? 78.6569;
  const effectiveZoom = lat ? zoom : 7;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return; // already initialised

    // Dynamic import to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default marker icons in webpack/Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapRef.current) return;

      const map = L.map(mapRef.current).setView([centerLat, centerLon], effectiveZoom);
      mapInstanceRef.current = map;

      // OSM base layer
      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 19,
      });

      // Bhuvan satellite (WMS)
      const bhuvanSatellite = L.tileLayer.wms('https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms', {
        layers: 'india_hd',
        format: 'image/jpeg',
        transparent: false,
        attribution: '© ISRO Bhuvan',
      });

      // Bhuvan LULC land-use layer (WMS)
      const bhuvanLULC = L.tileLayer.wms('https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms', {
        layers: 'lulc:TN_LULC50K_1112',
        format: 'image/png',
        transparent: true,
        opacity: 0.6,
        attribution: '© ISRO Bhuvan LULC',
      } as Parameters<typeof L.tileLayer.wms>[1]);

      osm.addTo(map);

      // Layer toggle control
      L.control.layers(
        { 'OpenStreetMap': osm, 'Bhuvan Satellite': bhuvanSatellite },
        { 'Land Use Layer (LULC)': bhuvanLULC }
      ).addTo(map);

      // Pin at village center (if coordinates given)
      if (lat && lon) {
        const marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup(
          `<div style="font-family:sans-serif;font-size:13px">
            <strong>${label}</strong><br/>
            <small style="color:#888">${village}</small><br/>
            <small style="color:#f59e0b">📍 Approximate village center</small>
          </div>`
        ).openPopup();
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      {/* Map container */}
      <div ref={mapRef} className={`w-full ${height} rounded-xl overflow-hidden border border-slate-700 z-0`} />

      {/* Disclaimer */}
      <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
        <span>
          Map location is approximate based on village coordinates. Exact parcel GPS boundary is not available.
        </span>
      </div>
    </div>
  );
}
