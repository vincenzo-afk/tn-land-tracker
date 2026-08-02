import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { MapPin, FileText, Map, Info } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TN Land Tracker — Tamil Nadu Land Parcel Search",
  description:
    "Search and view land ownership details, patta records, EC history, FMB sketches and guideline values across Tamil Nadu. Free, no login required.",
  keywords: ["Tamil Nadu land records", "patta search", "EC certificate", "FMB sketch", "TNREGINET", "TN eServices"],
  openGraph: {
    title: "TN Land Tracker",
    description: "Free, read-only Tamil Nadu land parcel information",
    type: "website",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 flex flex-col`}>
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white tracking-tight">TN Land</span>
                  <span className="font-bold text-emerald-400 tracking-tight"> Tracker</span>
                </div>
              </Link>

              {/* Nav Links */}
              <div className="hidden md:flex items-center gap-1">
                <NavLink href="/" icon={<FileText className="w-4 h-4" />} label="Search" />
                <NavLink href="/map" icon={<Map className="w-4 h-4" />} label="Map Explorer" />
                <NavLink href="/about" icon={<Info className="w-4 h-4" />} label="About" />
              </div>

              {/* Mobile nav */}
              <div className="flex md:hidden items-center gap-2">
                <Link href="/map" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><Map className="w-5 h-5" /></Link>
                <Link href="/about" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><Info className="w-5 h-5" /></Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-800/60 bg-slate-950 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-semibold text-white">TN Land Tracker</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Free, read-only Tamil Nadu land parcel information. No login required.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Data Sources</h4>
                <ul className="space-y-1.5 text-xs text-slate-500">
                  <li><a href="https://eservices.tn.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">TN eServices</a></li>
                  <li><a href="https://tnreginet.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">TNREGINET</a></li>
                  <li><a href="https://bhuvan.nrsc.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">Bhuvan ISRO</a></li>
                  <li><a href="https://openstreetmap.org" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">OpenStreetMap</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Disclaimer</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This is not an official government service. Always verify with the relevant revenue or registration office for legal purposes.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800/40 text-center text-xs text-slate-600">
              Data from TN eServices & TNREGINET · For informational purposes only · Total monthly cost ₹0
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
    >
      {icon}
      {label}
    </Link>
  );
}
