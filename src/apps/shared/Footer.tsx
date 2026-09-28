import React from 'react';

export const Footer: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-[#1F1F1F] bg-[#0A0A0A] mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737373]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#D4D4D4]">Tech Inject Design Library</span>
          <span>·</span>
          <span>Strict monochrome component system</span>
        </div>

        <div className="flex items-center gap-6 text-[#737373]">
          <button onClick={() => onNavigate('/components')} className="hover:text-[#FFFFFF] transition-colors cursor-pointer">
            Catalogue
          </button>
          <button onClick={() => onNavigate('/docs/getting-started')} className="hover:text-[#FFFFFF] transition-colors cursor-pointer">
            Getting Started
          </button>
          <button onClick={() => onNavigate('/admin')} className="hover:text-[#FFFFFF] transition-colors cursor-pointer">
            Admin Console
          </button>
        </div>
      </div>
    </footer>
  );
};
