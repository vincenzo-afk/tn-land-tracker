'use client';

import { useState } from 'react';
import { Download, FileImage, AlertCircle, Info } from 'lucide-react';

interface FMBViewerProps {
  sketchUrl?: string | null;
  loading?: boolean;
}

export default function FMBViewer({ sketchUrl, loading }: FMBViewerProps) {
  const [imgError, setImgError] = useState(false);

  if (loading) {
    return <div className="skeleton h-72 w-full rounded-xl" />;
  }

  const isPDF = sketchUrl?.toLowerCase().includes('.pdf');

  return (
    <div className="space-y-4">
      {/* Viewer */}
      {sketchUrl && !imgError ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
          {isPDF ? (
            <iframe
              src={sketchUrl}
              className="w-full h-96"
              title="FMB Sketch PDF"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sketchUrl}
              alt="FMB Sketch"
              className="w-full max-h-96 object-contain"
              onError={() => setImgError(true)}
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-slate-700 bg-slate-900/50">
          {imgError ? (
            <>
              <AlertCircle className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-sm text-slate-500">Failed to load FMB sketch.</p>
            </>
          ) : (
            <>
              <FileImage className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">FMB sketch not yet available for this parcel.</p>
              <p className="text-xs text-slate-600 mt-1">It will be fetched from TN eServices on demand.</p>
            </>
          )}
        </div>
      )}

      {/* Download button */}
      {sketchUrl && !imgError && (
        <a
          href={sketchUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition-all"
        >
          <Download className="w-4 h-4" />
          Download FMB Sketch
        </a>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
        <span>
          <strong className="text-slate-400">FMB Sketch</strong> is the official Field Measurement Book diagram from TN Revenue Department.{' '}
          <strong>It is NOT a GPS-accurate polygon.</strong> It is displayed as-is from TN eServices.
        </span>
      </div>
    </div>
  );
}
