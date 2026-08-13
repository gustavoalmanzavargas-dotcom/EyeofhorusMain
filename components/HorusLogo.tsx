import React from 'react';

interface HorusLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  variant?: 'corporate' | 'gold' | 'minimal';
}

export const HorusLogo: React.FC<HorusLogoProps> = ({ 
  size = 36, 
  showText = false, 
  className = '',
  variant = 'corporate'
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`} id="brand-logo-container">
      {/* Precision Corporate Security Mark */}
      <div 
        className="relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-700/60 shadow-lg p-1.5 transition-all duration-200 hover:border-slate-500 hover:shadow-indigo-500/10"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Corporate Metallic & Security Gradients */}
            <linearGradient id="shieldGrad" x1="50" y1="4" x2="50" y2="96" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id="goldBevel" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            <linearGradient id="cyanPrecision" x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="indigoCore" x1="50" y1="35" x2="50" y2="65" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>

            <linearGradient id="lensReflect" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Outer Monolithic Security Shield Geometry */}
          <path 
            d="M50 8 L84 22 C84 56 68 78 50 92 C32 78 16 56 16 22 Z" 
            fill="url(#shieldGrad)" 
            stroke="#334155" 
            strokeWidth="2.5" 
            strokeLinejoin="round" 
          />

          {/* Precision Inset Shield Border */}
          <path 
            d="M50 14 L78 26 C78 52 64 71 50 83 C36 71 22 52 22 26 Z" 
            stroke="#475569" 
            strokeWidth="1.2" 
            strokeOpacity="0.7"
            fill="none" 
          />

          {/* Horus Brow / Crown - Corporate Precision Architecture */}
          <path 
            d="M 30 33 L 50 26 L 70 33" 
            stroke="url(#goldBevel)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Horus Upper Eye Contour - Clean Aerodynamic Geometry */}
          <path 
            d="M 27 45 C 36 37, 64 37, 73 45" 
            stroke="#e2e8f0" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />

          {/* Horus Lower Eye Contour */}
          <path 
            d="M 27 45 C 36 53, 64 53, 73 45" 
            stroke="#94a3b8" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />

          {/* Central Security Aperture & Optical Sensor (The Horus Core) */}
          <circle cx="50" cy="45" r="9" fill="#090d16" stroke="url(#cyanPrecision)" strokeWidth="2.2" />
          <circle cx="50" cy="45" r="4.5" fill="url(#goldBevel)" />
          <circle cx="51.5" cy="43.5" r="1.5" fill="#ffffff" />

          {/* Stylized Horus Tail & Symmetrical Security Anchor */}
          <path 
            d="M 66 47 C 66 58, 59 66, 50 67 C 45 67.5, 43 64, 45 61 C 47 58, 54 60, 54 52" 
            stroke="url(#goldBevel)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Precision Vertical Telemetry Marker */}
          <line 
            x1="39" y1="48" x2="39" y2="63" 
            stroke="#38bdf8" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />

          {/* Subtly illuminated apex node */}
          <circle cx="50" cy="26" r="2" fill="#fbbf24" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[13px] tracking-[0.16em] text-slate-900 dark:text-white uppercase font-sans leading-tight">
              EYE OF HORUS
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] font-mono font-bold tracking-[0.18em] text-slate-500 dark:text-slate-400 uppercase">
              CYVERAX
            </span>
            <span className="text-[9px] text-amber-500 font-mono font-bold">•</span>
            <span className="text-[9px] font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              XDR ENTERPRISE
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorusLogo;
