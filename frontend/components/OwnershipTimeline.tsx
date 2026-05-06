import { ArrowRight, FileText, Calendar, Building, Hash, DollarSign, Info } from 'lucide-react';
import type { OwnershipHistory } from '@/lib/api';

interface OwnershipTimelineProps {
  records: OwnershipHistory[];
}

export default function OwnershipTimeline({ records }: OwnershipTimelineProps) {
  if (!records.length) {
    return (
      <div className="text-center py-8">
        <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
        <p className="text-sm text-slate-500">No EC records found for this parcel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {records.map((rec, idx) => (
        <TimelineEntry key={rec.id} record={rec} isLast={idx === records.length - 1} />
      ))}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 mt-4">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
        <span>
          Ownership history covers registered transactions only, up to 30 years, as available in TNREGINET EC records.
        </span>
      </div>
    </div>
  );
}

function TimelineEntry({ record, isLast }: { record: OwnershipHistory; isLast: boolean }) {
  const txColor = getTxColor(record.transaction_type);

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-gradient-to-b from-slate-700 to-transparent" />
      )}

      {/* Dot */}
      <div className={`shrink-0 w-10 h-10 rounded-full border-2 ${txColor.border} ${txColor.bg} flex items-center justify-center z-10`}>
        <FileText className={`w-4 h-4 ${txColor.icon}`} />
      </div>

      {/* Content */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${txColor.badge}`}>
            {record.transaction_type || 'Transaction'}
          </span>
          {record.transaction_date && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(record.transaction_date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </span>
          )}
        </div>

        {/* Seller → Buyer */}
        {(record.seller_name || record.buyer_name) && (
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {record.seller_name && (
              <span className="text-sm text-slate-300 font-medium">{record.seller_name}</span>
            )}
            {record.seller_name && record.buyer_name && (
              <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
            )}
            {record.buyer_name && (
              <span className="text-sm text-emerald-400 font-medium">{record.buyer_name}</span>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-2">
          {record.sro_office && (
            <MetaTag icon={<Building className="w-3 h-3" />} value={record.sro_office} />
          )}
          {record.document_number && (
            <MetaTag icon={<Hash className="w-3 h-3" />} value={`Doc: ${record.document_number}`} />
          )}
          {record.transaction_amount != null && Number(record.transaction_amount) > 0 && (
            <MetaTag
              icon={<DollarSign className="w-3 h-3" />}
              value={`₹${Number(record.transaction_amount).toLocaleString('en-IN')}`}
            />
          )}
        </div>

        {record.deed_description && (
          <p className="mt-2 text-xs text-slate-500 italic">{record.deed_description}</p>
        )}
      </div>
    </div>
  );
}

function MetaTag({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      <span className="text-slate-600">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

function getTxColor(type?: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('sale'))     return { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', icon: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  if (t.includes('mortgage')) return { border: 'border-orange-500/40', bg: 'bg-orange-500/10', icon: 'text-orange-400', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30' };
  if (t.includes('gift'))     return { border: 'border-purple-500/40', bg: 'bg-purple-500/10', icon: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
  return { border: 'border-slate-600', bg: 'bg-slate-800', icon: 'text-slate-400', badge: 'bg-slate-700 text-slate-300 border-slate-600' };
}
