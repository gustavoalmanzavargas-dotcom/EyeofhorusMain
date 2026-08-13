import React from 'react';

interface HorusLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  variant?: 'corporate' | 'sovereign' | 'minimal';
}

export const HorusLogo: React.FC<HorusLogoProps> = ({ 
  size = 36, 
  showText = false, 
  className = '',
  variant = 'corporate'
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`} id="brand-logo-container">
      {/* Precision Corporate Security Mark */}
      <div 
        className="relative flex items-center justify-center shrink-0 rounded-lg bg-slate-900 border border-slate-700/80 shadow-sm"
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      >
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full p-1.5"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="corpBlue" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <linearGradient id="shieldEdge" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="goldAccent" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Clean Corporate Shield Perimeter */}
          <path 
            d="M 50 10 L 85 24 C 85 62 67 82 50 90 C 33 82 15 62 15 24 Z" 
            fill="#0B1120"
            stroke="url(#shieldEdge)" 
            strokeWidth="3.5" 
            strokeLinejoin="round" 
          />

          {/* Inner Precision Geometric Inset */}
          <path 
            d="M 50 18 L 78 29 C 78 58 63 74 50 81 C 37 74 22 58 22 29 Z" 
            stroke="#1E293B" 
            strokeWidth="1.5" 
            fill="none" 
          />

          {/* Horus Brow / Crown Line */}
          <path 
            d="M 28 38 L 50 30 L 72 38" 
            stroke="url(#goldAccent)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Horus Upper Contour */}
          <path 
            d="M 26 49 C 34 40, 66 40, 74 49" 
            stroke="#E2E8F0" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />

          {/* Horus Lower Contour */}
          <path 
            d="M 26 49 C 34 57, 66 57, 74 49" 
            stroke="#64748B" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />

          {/* All-Seeing Telemetry Aperture / Iris */}
          <circle cx="50" cy="49" r="8" fill="#0F172A" stroke="url(#corpBlue)" strokeWidth="2.5" />
          <circle cx="50" cy="49" r="3.5" fill="url(#goldAccent)" />
          <circle cx="51.5" cy="47.5" r="1.2" fill="#FFFFFF" />

          {/* Precision Tail Anchor */}
          <path 
            d="M 68 51 C 68 62, 60 67, 52 68 C 47 68.5, 45 65, 47 62 C 49 59, 56 61, 56 54" 
            stroke="url(#goldAccent)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Vertical Sensor Plumb */}
          <line 
            x1="38" y1="52" x2="38" y2="65" 
            stroke="#38BDF8" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[13px] tracking-[0.16em] text-slate-900 dark:text-slate-100 uppercase font-sans">
              EYE OF HORUS
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] font-bold font-mono tracking-[0.2em] text-blue-600 dark:text-blue-400 uppercase">
              CYVERAX
            </span>
            <span className="text-[9px] text-amber-500 font-bold">•</span>
            <span className="text-[9px] font-mono tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              SECURITY PLATFORM
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorusLogo;
