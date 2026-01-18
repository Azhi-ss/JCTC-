import React from 'react';
import { Microscope, Info } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Microscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">JCTC Scout</h1>
            <p className="text-xs text-slate-500 font-medium">Journal of Chemical Theory and Computation</p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Gemini AI Active
            </div>
            <a href="https://pubs.acs.org/toc/jctcce/0/0" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">
                View Official Site
            </a>
        </div>
      </div>
    </header>
  );
};