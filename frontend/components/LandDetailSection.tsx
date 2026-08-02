import type { ReactNode } from 'react';

interface LandDetailSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  disclaimer?: string;
}

export default function LandDetailSection({
  id,
  title,
  subtitle,
  icon,
  children,
  disclaimer,
}: LandDetailSectionProps) {
  return (
    <section id={id} className="fade-in">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        {children}
      </div>

      {/* Inline disclaimer */}
      {disclaimer && (
        <p className="mt-2 text-xs text-slate-500 italic pl-1">{disclaimer}</p>
      )}
    </section>
  );
}
