import { notFound } from 'next/navigation';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
        <span className="text-3xl">🗺️</span>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Land Record Not Found</h1>
      <p className="text-slate-400 text-sm mb-8 max-w-sm">
        This land parcel does not exist in our database. It may not have been searched yet.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20"
      >
        ← Back to Search
      </a>
    </div>
  );
}
