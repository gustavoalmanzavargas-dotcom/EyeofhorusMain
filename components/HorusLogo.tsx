import React from 'react';

interface HorusLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const HorusLogo: React.FC<HorusLogoProps> = ({ size = 36, showText = false, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className="relative flex items-center justify-center shrink-0 rounded-xl bg-slate-900 border border-slate-700/80 shadow-md p-2 group hover:border-indigo-500/80 transition-colors"
        style={{ width: size, height: size }}
      >
        {/* Modern Modernist Precision Eye of Horus SVG */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full text-indigo-400 group-hover:text-indigo-300 transition-colors"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Protective Hexagonal Shield Frame */}
          <path 
            d="M50 10 L86 26 L86 64 L50 90 L14 64 L14 26 Z" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinejoin="round" 
            className="opacity-90"
          />

          {/* Precision Eyebrow Arc */}
          <path 
            d="M 30 35 C 42 27, 58 27, 70 35" 
            stroke="#6366f1" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />

          {/* Wedjat Eye Upper Curve */}
          <path 
            d="M 28 47 C 38 34, 62 34, 72 47" 
            stroke="#38bdf8" 
            strokeWidth="4" 
            strokeLinecap="round" 
          />

          {/* Wedjat Eye Lower Curve */}
          <path 
            d="M 28 47 C 38 58, 62 58, 72 47" 
            stroke="#38bdf8" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />

          {/* Central Iris & Aperture Core */}
          <circle cx="50" cy="47" r="8" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="2.5" />
          <circle cx="50" cy="47" r="3" fill="#ffffff" />

          {/* Iconic Wedjat Teardrop Spiral */}
          <path 
            d="M 68 48 C 68 60, 62 70, 54 73 C 48 76, 44 71, 47 67 C 50 63, 58 66, 58 58" 
            stroke="#6366f1" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Iconic Wedjat Vertical Drop Mark */}
          <path 
            d="M 40 50 L 40 70" 
            stroke="#38bdf8" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm tracking-wider text-slate-900 dark:text-white uppercase font-sans">
              EYE OF HORUS
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-indigo-400 font-bold uppercase tracking-widest">
            CYVERAX SOLUTIONS
          </span>
        </div>
      )}
    </div>
  );
};

export default HorusLogo;
