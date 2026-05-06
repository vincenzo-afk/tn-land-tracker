import { IndianRupee, Info } from 'lucide-react';

interface GuidelineValueBadgeProps {
  value?: number | null;
  unit?: string;
  showDisclaimer?: boolean;
}

export default function GuidelineValueBadge({
  value,
  unit = 'per sqft',
  showDisclaimer = true,
}: GuidelineValueBadgeProps) {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <IndianRupee className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="text-xs text-amber-400/70 font-medium uppercase tracking-wider">Government Guideline Value</p>
          {value != null ? (
            <p className="text-2xl font-bold text-amber-400">
              ₹{Number(value).toLocaleString('en-IN')}
              <span className="text-sm font-normal text-amber-400/60 ml-1">{unit}</span>
            </p>
          ) : (
            <p className="text-sm text-slate-400 mt-0.5">Not available</p>
          )}
        </div>
      </div>

      {showDisclaimer && (
        <div className="flex items-start gap-2 text-xs text-amber-400/60 bg-amber-500/5 rounded-lg p-3 border border-amber-500/10">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            <strong>Guideline Value shown is the Government-set rate from TNREGINET.</strong> It is NOT the live market price of the property.
          </span>
        </div>
      )}
    </div>
  );
}
