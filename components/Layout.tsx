import React from 'react';
import { ShieldAlert, FileText, Scale } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-lg text-white">
                <Scale size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Forensic Ballistics Lab
                </h1>
                <p className="text-xs text-slate-500 font-mono">
                  UNIT AREA ENERGY ANALYZER v1.0
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                <FileText size={14} />
                <span>ISO 17025 COMPLIANT MODE</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">
            CONFIDENTIAL: FOR FORENSIC USE ONLY. 
          </p>
          <p className="text-xs mt-2 font-mono">
            Standard: &gt; 20 J/cm² = LETHAL
          </p>
        </div>
      </footer>
    </div>
  );
};