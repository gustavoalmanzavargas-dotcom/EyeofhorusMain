import React from 'react';

interface HorusLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  variant?: 'default' | 'badge' | 'minimal';
}

export const HorusLogo: React.FC<HorusLogoProps> = ({ 
  size = 40, 
  showText = false, 
  className = '',
  variant = 'default'
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`} id="brand-logo-container">
      {/* Dynamic Theme-Adaptive B2B Cyber Emblem */}
      <div 
        className="relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:border-blue-400 dark:hover:border-cyan-500/50"
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      >
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full p-1.5 overflow-visible"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Light Mode Gradients */}
            <linearGradient id="shieldLightGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>

            {/* Dark Mode Gradients */}
            <linearGradient id="shieldDarkGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0B0F19" />
            </linearGradient>

            {/* Cyan/Blue High-Trust Accent */}
            <linearGradient id="brandAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>

            <linearGradient id="brandDarkAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>

          {/* Theme-Adaptive Security Shield Base */}
          {/* Light mode shield */}
          <path 
            d="M 50 8 L 84 21 C 84 56 68 78 50 92 C 32 78 16 56 16 21 Z" 
            className="dark:hidden fill-[url(#shieldLightGrad)] stroke-slate-300" 
            strokeWidth="2.5" 
            strokeLinejoin="round" 
          />
          {/* Dark mode shield */}
          <path 
            d="M 50 8 L 84 21 C 84 56 68 78 50 92 C 32 78 16 56 16 21 Z" 
            className="hidden dark:block fill-[url(#shieldDarkGrad)] stroke-slate-700" 
            strokeWidth="2.5" 
            strokeLinejoin="round" 
          />

          {/* Top Dynamic Horus Blade / Protective Eyebrow */}
          <path 
            d="M 28 35 Q 50 24 72 35" 
            className="stroke-blue-600 dark:stroke-cyan-400" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />

          {/* Upper Eye Geometry - Dark Slate in Light Mode, Crisp White in Dark Mode */}
          <path 
            d="M 25 48 C 34 36, 66 36, 75 48" 
            className="stroke-slate-800 dark:stroke-slate-100" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />

          {/* Lower Eye Geometry */}
          <path 
            d="M 25 48 C 34 60, 66 60, 75 48" 
            className="stroke-slate-400 dark:stroke-slate-500" 
            strokeWidth="2.8" 
            strokeLinecap="round" 
          />

          {/* Central AI / Sentinel Core Optical Sensor */}
          <circle 
            cx="50" 
            cy="48" 
            r="8.5" 
            className="fill-slate-900 dark:fill-slate-950 stroke-blue-600 dark:stroke-cyan-400" 
            strokeWidth="2.5" 
          />
          <circle 
            cx="50" 
            cy="48" 
            r="4" 
            className="fill-blue-500 dark:fill-cyan-300" 
          />
          <circle 
            cx="51.5" 
            cy="46.5" 
            r="1.2" 
            className="fill-white" 
          />

          {/* Modern Geometric Horus Tail (Clean Tech Style) */}
          <path 
            d="M 68 51 C 68 62, 59 67, 50 67 C 46 67, 44 64, 46 61 C 48 58, 54 60, 54 53" 
            className="stroke-blue-600 dark:stroke-cyan-400" 
            strokeWidth="2.8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Vertical Precision Coordinate Marker */}
          <line 
            x1="38" 
            y1="52" 
            x2="38" 
            y2="66" 
            className="stroke-blue-500 dark:stroke-cyan-500" 
            strokeWidth="2.8" 
            strokeLinecap="round" 
          />

          {/* Apex Coordinate Node */}
          <circle cx="50" cy="20" r="2" className="fill-blue-600 dark:fill-cyan-400" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[15px] tracking-[0.12em] text-slate-900 dark:text-slate-100 uppercase font-sans">
              EYE OF HORUS
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold font-mono tracking-[0.16em] text-blue-600 dark:text-cyan-400 uppercase">
              CYVERAX
            </span>
            <span className="text-[10px] text-slate-300 dark:text-slate-600 font-bold">•</span>
            <span className="text-[10px] font-medium tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              CYBER DEFENSE
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorusLogo;
