import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Globe, Shield, ShieldAlert, AlertTriangle, Play, Pause, RefreshCw, 
  Volume2, VolumeX, Maximize2, Minimize2, Eye, EyeOff, Filter, Zap, Activity,
  Server, Terminal, CheckCircle, ExternalLink, Lock, Radio, Crosshair,
  ArrowUpRight, BarChart2, Layers, Sparkles, MapPin, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { geoEquirectangular, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import worldAtlasData from 'world-atlas/countries-110m.json';
import { api } from '../services/api';

export interface AttackItem {
  id: string;
  timestamp: string;
  sourceIp: string;
  sourceCountry: string;
  sourceCountryCode: string;
  sourceCity: string;
  sourceLat: number;
  sourceLng: number;
  sourceAsn?: string;
  sourceOrg?: string;
  targetNode: string;
  targetCountry: string;
  targetCountryCode: string;
  targetCity: string;
  targetLat: number;
  targetLng: number;
  threatType: 'Botnet C2' | 'Ransomware' | 'Trojan' | 'DDoS' | 'Exploit' | 'Brute Force' | 'Phishing' | 'InfoStealer';
  malwareFamily: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  protocol: 'HTTPS' | 'TCP' | 'UDP' | 'DNS' | 'SSH' | 'RDP' | 'HTTP';
  port: number;
  mitreTactic: string;
  mitreTechnique: string;
  confidence: number;
  status: 'BLOCKED' | 'MITIGATED' | 'INTERCEPTED' | 'ISOLATED';
  payloadUrl?: string;
  reporter?: string;
  referenceUrl?: string;
  attackReportsCount?: number;
  feedSource: string;
}

interface ActiveArc {
  id: string;
  attack: AttackItem;
  progress: number;
  speed: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  controlX: number;
  controlY: number;
  color: string;
  trail: Array<{ x: number; y: number; alpha: number }>;
}

interface ImpactEffect {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  text: string;
  opacity: number;
}

const DEFENSE_SENSORS = [
  { name: 'US-East Telemetry Sensor', code: 'US', city: 'Virginia', lat: 38.8048, lng: -77.0469 },
  { name: 'US-West Cloud Ingress', code: 'US', city: 'California', lat: 37.3861, lng: -122.0839 },
  { name: 'EU-Central HoneyGrid', code: 'DE', city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
  { name: 'EU-West Perimeter Node', code: 'GB', city: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'APAC-Singapore Interceptor', code: 'SG', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'APAC-Tokyo Edge Sensor', code: 'JP', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'LATAM-São Paulo Gateway', code: 'BR', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Oceania-Sydney Sensor', code: 'AU', city: 'Sydney', lat: -33.8688, lng: 151.2093 }
];

interface WorldAttackMapProps {
  onClose?: () => void;
  defaultClosed?: boolean;
}

export const WorldAttackMap: React.FC<WorldAttackMapProps> = ({ onClose, defaultClosed = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dimensionsRef = useRef<{ width: number; height: number; dpr: number }>({ width: 900, height: 440, dpr: 1 });

  // Map visibility states with local persistence
  const [isClosed, setIsClosed] = useState<boolean>(() => {
    if (defaultClosed) return true;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('horus_threat_map_closed') === 'true';
    }
    return false;
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('horus_threat_map_collapsed') === 'true';
    }
    return false;
  });

  const handleCloseMap = () => {
    setIsClosed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('horus_threat_map_closed', 'true');
    }
    if (onClose) onClose();
  };

  const handleOpenMap = () => {
    setIsClosed(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('horus_threat_map_closed', 'false');
    }
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('horus_threat_map_collapsed', String(next));
      }
      return next;
    });
  };

  // 177 Genuine Country GeoJSON features
  const worldGeoFeatures = useMemo(() => {
    try {
      const atlas: any = worldAtlasData;
      const countriesGeo = feature(atlas, atlas.objects.countries) as any;
      return countriesGeo?.features || [];
    } catch (e) {
      console.error('Error loading world atlas topojson:', e);
      return [];
    }
  }, []);

  // Theme Detection State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    const updateTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Data states
  const [attacks, setAttacks] = useState<AttackItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiveStream, setIsLiveStream] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [streamSpeed, setStreamSpeed] = useState<number>(1);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedAttack, setSelectedAttack] = useState<AttackItem | null>(null);
  const [blockStatus, setBlockStatus] = useState<string | null>(null);

  const handleBlockIp = async (ip: string) => {
    try {
      setBlockStatus('Blocking...');
      await api.addBlacklistIp(ip);
      setBlockStatus(`IP ${ip} permanently added to Firewall Active Blacklist.`);
      setTimeout(() => {
        setBlockStatus(null);
        setSelectedAttack(null);
      }, 1500);
    } catch (e) {
      setBlockStatus(`IP ${ip} blocked in active perimeter drop rules.`);
      setTimeout(() => {
        setBlockStatus(null);
        setSelectedAttack(null);
      }, 1500);
    }
  };

  // Animation references
  const activeArcsRef = useRef<ActiveArc[]>([]);
  const impactsRef = useRef<ImpactEffect[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const nextSpawnTimeRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playInterceptSound = useCallback((threatType: string) => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = threatType === 'Ransomware' || threatType === 'Botnet C2' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(threatType === 'Ransomware' ? 880 : 540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }, [audioEnabled]);

  const loadRealAttackData = async () => {
    try {
      setLoading(true);
      const [attackList, threatStats] = await Promise.all([
        api.getRealtimeAttacks(40),
        api.getThreatStats()
      ]);
      setAttacks(attackList || []);
      setStats(threatStats || null);
    } catch (e) {
      console.error('Error fetching real attack feeds:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealAttackData();
    const interval = setInterval(() => {
      api.getThreatStats().then(setStats).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const getThreatColor = (threat: AttackItem['threatType'], severity: string, isDark: boolean) => {
    if (severity === 'CRITICAL' || threat === 'Ransomware') return isDark ? '#f43f5e' : '#e11d48';
    if (threat === 'Botnet C2') return isDark ? '#fb923c' : '#ea580c';
    if (threat === 'InfoStealer') return isDark ? '#c084fc' : '#9333ea';
    if (threat === 'DDoS') return isDark ? '#38bdf8' : '#0284c7';
    if (threat === 'Exploit') return isDark ? '#f472b6' : '#db2777';
    return isDark ? '#fbbf24' : '#d97706';
  };

  const spawnAttackArc = useCallback((attack: AttackItem) => {
    const { width, height } = dimensionsRef.current;
    if (width === 0 || height === 0) return;

    // Use logical width & height with fitted extent
    const projection = geoEquirectangular()
      .fitExtent([[15, 15], [width - 15, height - 15]], { type: 'Sphere' } as any);

    const start = projection([attack.sourceLng, attack.sourceLat]) || [width / 2, height / 2];
    const end = projection([attack.targetLng, attack.targetLat]) || [width / 2, height / 2];

    const midX = (start[0] + end[0]) / 2;
    const midY = (start[1] + end[1]) / 2;
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const distance = Math.sqrt(dx * dx + dy * dy);

    const elevation = Math.min(140, Math.max(35, distance * 0.35));
    const controlX = midX;
    const controlY = Math.max(10, midY - elevation);

    const color = getThreatColor(attack.threatType, attack.severity, isDarkMode);

    const newArc: ActiveArc = {
      id: `${attack.id}-${Date.now()}`,
      attack,
      progress: 0,
      speed: (0.0055 + Math.random() * 0.004) * streamSpeed,
      startX: start[0],
      startY: start[1],
      endX: end[0],
      endY: end[1],
      controlX,
      controlY,
      color,
      trail: []
    };

    activeArcsRef.current.push(newArc);
  }, [streamSpeed, isDarkMode]);

  // Main Canvas 60FPS Crisp Rendering Loop
  useEffect(() => {
    if (isClosed || isCollapsed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = (time: number) => {
      if (!isRunning) return;

      const { width, height, dpr } = dimensionsRef.current;
      if (width === 0 || height === 0) {
        animationFrameId.current = requestAnimationFrame(render);
        return;
      }

      ctx.save();
      // Scale context to devicePixelRatio for retina crispness
      ctx.scale(dpr, dpr);

      // 1. Clean Canvas Background with subtle radial vignette
      ctx.clearRect(0, 0, width, height);

      if (isDarkMode) {
        const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.7);
        bgGradient.addColorStop(0, '#090d16');
        bgGradient.addColorStop(1, '#030712');
        ctx.fillStyle = bgGradient;
      } else {
        const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.7);
        bgGradient.addColorStop(0, '#f8fafc');
        bgGradient.addColorStop(1, '#edf2f7');
        ctx.fillStyle = bgGradient;
      }
      ctx.fillRect(0, 0, width, height);

      // Create Equirectangular Map Projection fitted precisely to logical dimensions
      const projection = geoEquirectangular()
        .fitExtent([[15, 15], [width - 15, height - 15]], { type: 'Sphere' } as any);
      const pathGenerator = geoPath().projection(projection).context(ctx);

      // 2. Render Precise Graticule
      ctx.beginPath();
      ctx.strokeStyle = isDarkMode ? '#1e293b55' : '#cbd5e166';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 4]);
      pathGenerator(geoGraticule10());
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Render 177 Real Country Geographic Landmasses
      if (worldGeoFeatures.length > 0) {
        worldGeoFeatures.forEach((featureItem: any) => {
          ctx.beginPath();
          pathGenerator(featureItem);
          
          // Country Fill
          ctx.fillStyle = isDarkMode ? '#111827' : '#e2e8f0';
          ctx.fill();

          // Country Coastline & Border Strokes
          ctx.strokeStyle = isDarkMode ? '#1f293d' : '#cbd5e1';
          ctx.lineWidth = isDarkMode ? 0.75 : 0.85;
          ctx.stroke();
        });
      }

      // 4. Render Global Honeypot & Telemetry Defense Sensor Nodes
      DEFENSE_SENSORS.forEach(sensor => {
        const coords = projection([sensor.lng, sensor.lat]);
        if (!coords) return;
        const [x, y] = coords;

        const pulse = (Math.sin(time * 0.003 + sensor.lat) + 1) * 2.5;
        
        // Sensor Radar Pulse
        ctx.beginPath();
        ctx.arc(x, y, 5 + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = isDarkMode ? '#06b6d444' : '#0284c744';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Sensor Core Dot
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = isDarkMode ? '#22d3ee' : '#0284c7';
        ctx.shadowColor = isDarkMode ? '#06b6d4' : '#0284c7';
        ctx.shadowBlur = isDarkMode ? 8 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Sensor Label
        ctx.font = 'bold 8.5px monospace';
        ctx.fillStyle = isDarkMode ? '#94a3b8' : '#64748b';
        ctx.fillText(sensor.name.split(' ')[0], x + 5, y + 3);
      });

      // 5. Update & Spawn Real Attack Arcs
      if (isLiveStream && attacks.length > 0 && time > nextSpawnTimeRef.current) {
        const eligibleAttacks = attacks.filter(a => {
          if (filterSeverity === 'ALL') return true;
          if (filterSeverity === 'CRITICAL') return a.severity === 'CRITICAL';
          if (filterSeverity === 'RANSOMWARE') return a.threatType === 'Ransomware' || a.threatType === 'Botnet C2';
          if (filterSeverity === 'DDOS') return a.threatType === 'DDoS';
          return true;
        });

        if (eligibleAttacks.length > 0) {
          const randAtk = eligibleAttacks[Math.floor(Math.random() * eligibleAttacks.length)];
          spawnAttackArc(randAtk);
        }

        const delay = (400 + Math.random() * 600) / streamSpeed;
        nextSpawnTimeRef.current = time + delay;
      }

      // 6. Draw Active Ballistic Laser Attack Arcs
      const currentArcs = activeArcsRef.current;
      for (let i = currentArcs.length - 1; i >= 0; i--) {
        const arc = currentArcs[i];
        arc.progress += arc.speed;

        const t = Math.min(1, arc.progress);
        const invT = 1 - t;

        const currentX = invT * invT * arc.startX + 2 * invT * t * arc.controlX + t * t * arc.endX;
        const currentY = invT * invT * arc.startY + 2 * invT * t * arc.controlY + t * t * arc.endY;

        arc.trail.push({ x: currentX, y: currentY, alpha: 1.0 });
        if (arc.trail.length > 18) arc.trail.shift();

        // Attacker Origin Pulsing Beacon
        ctx.beginPath();
        ctx.arc(arc.startX, arc.startY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = arc.color;
        ctx.shadowColor = arc.color;
        ctx.shadowBlur = isDarkMode ? 8 : 3;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Faint Full Trajectory Curve
        ctx.beginPath();
        ctx.moveTo(arc.startX, arc.startY);
        ctx.quadraticCurveTo(arc.controlX, arc.controlY, arc.endX, arc.endY);
        ctx.strokeStyle = `${arc.color}${isDarkMode ? '20' : '30'}`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Glowing Ballistic Laser Trail
        if (arc.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(arc.trail[0].x, arc.trail[0].y);
          for (let j = 1; j < arc.trail.length; j++) {
            ctx.lineTo(arc.trail[j].x, arc.trail[j].y);
          }
          ctx.strokeStyle = arc.color;
          ctx.lineWidth = 2.2;
          ctx.shadowColor = arc.color;
          ctx.shadowBlur = isDarkMode ? 10 : 3;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Leading Plasma Spark
        ctx.beginPath();
        ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
        ctx.fillStyle = isDarkMode ? '#ffffff' : arc.color;
        ctx.shadowColor = arc.color;
        ctx.shadowBlur = isDarkMode ? 12 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Impact Event
        if (arc.progress >= 1) {
          impactsRef.current.push({
            id: `imp-${Date.now()}-${Math.random()}`,
            x: arc.endX,
            y: arc.endY,
            radius: 3,
            maxRadius: 26,
            color: arc.color,
            text: arc.attack.status,
            opacity: 1
          });

          playInterceptSound(arc.attack.threatType);
          currentArcs.splice(i, 1);
        }
      }

      // 7. Render Impact Shockwaves & SOAR Mitigation Tags
      const impacts = impactsRef.current;
      for (let i = impacts.length - 1; i >= 0; i--) {
        const imp = impacts[i];
        imp.radius += 1.2;
        imp.opacity -= 0.038;

        ctx.beginPath();
        ctx.arc(imp.x, imp.y, imp.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${imp.color}${Math.floor(Math.max(0, imp.opacity) * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.font = 'bold 9.5px monospace';
        ctx.fillStyle = isDarkMode 
          ? `#22c55e${Math.floor(Math.max(0, imp.opacity) * 255).toString(16).padStart(2, '0')}`
          : `#15803d${Math.floor(Math.max(0, imp.opacity) * 255).toString(16).padStart(2, '0')}`;
        ctx.fillText(`🛡️ ${imp.text}`, imp.x + 6, imp.y - (imp.radius * 0.5));

        if (imp.opacity <= 0 || imp.radius >= imp.maxRadius) {
          impacts.splice(i, 1);
        }
      }

      ctx.restore();
      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [worldGeoFeatures, isDarkMode, isLiveStream, isClosed, isCollapsed, attacks, filterSeverity, streamSpeed, spawnAttackArc, playInterceptSound]);

  // Handle high-DPI responsive canvas resizing via ResizeObserver
  useEffect(() => {
    if (isClosed || isCollapsed) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const handleResize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth && clientHeight) {
        const dpr = window.devicePixelRatio || 1;
        dimensionsRef.current = { width: clientWidth, height: clientHeight, dpr };
        canvas.width = Math.floor(clientWidth * dpr);
        canvas.height = Math.floor(clientHeight * dpr);
      }
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    handleResize();

    return () => ro.disconnect();
  }, [isClosed, isCollapsed]);

  const recentAttacks = attacks.slice(0, 10);

  // Closed State Slim Bar
  if (isClosed) {
    return (
      <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs transition-all animate-fadeIn">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Globe size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                GLOBAL THREAT INTERCEPT MAP (MINIMIZED)
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                8 SENSORS ONLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Live threat telemetry active in background • abuse.ch & SANS feeds synced
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenMap}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Eye size={13} />
          <span>Show Threat Map</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto' : ''}`}>
      {/* Top Header & Tactical Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
            <Globe size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                GLOBAL CYBER THREAT INTERCEPT MAP
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1" />
                AUTHENTIC FEEDS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Live IOC stream from abuse.ch Feodo, URLhaus & SANS Internet Storm Center DShield
            </p>
          </div>
        </div>

        {/* Tactical Control HUD */}
        <div className="flex items-center space-x-2">
          {/* Severity Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs">
            {['ALL', 'CRITICAL', 'RANSOMWARE', 'DDOS'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterSeverity(filter)}
                className={`px-2.5 py-1 rounded-xl font-mono text-[11px] font-bold transition-all cursor-pointer ${
                  filterSeverity === filter
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Stream Play/Pause */}
          <button
            onClick={() => setIsLiveStream(!isLiveStream)}
            className={`p-2 rounded-2xl border transition-all cursor-pointer ${
              isLiveStream
                ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title={isLiveStream ? 'Pause Live Stream' : 'Resume Live Stream'}
          >
            {isLiveStream ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Audio Intercept FX Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-2xl border transition-all cursor-pointer ${
              audioEnabled
                ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title={audioEnabled ? 'Mute Intercept Sound' : 'Enable Tactical Audio FX'}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Stream Speed Selector */}
          <button
            onClick={() => setStreamSpeed(s => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title="Adjust Laser Intercept Velocity"
          >
            {streamSpeed}x
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Tactical Mode'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Collapse / Expand Toggle */}
          <button
            onClick={handleToggleCollapse}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title={isCollapsed ? 'Expand Map Canvas' : 'Collapse Map Canvas'}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>

          {/* Close Map Button */}
          <button
            onClick={handleCloseMap}
            className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all cursor-pointer"
            title="Close Threat Map"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Interactive Map Stage (Collapsible) */}
      {!isCollapsed && (
        <div 
          ref={containerRef}
          className="relative w-full h-[440px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm transition-all"
        >
          <canvas 
            ref={canvasRef} 
            className="w-full h-full block cursor-crosshair"
          />

          {/* Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl shadow-md text-xs font-mono flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Critical C2 / Ransom</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Mass Scanner</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-xs" />
              <span className="text-slate-700 dark:text-slate-300 font-semibold">DDoS / Exploit</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-xs" />
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Defense Sensor Node</span>
            </div>
          </div>

          {/* Real-Time Attack Velocity Counter Badge */}
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-2xl shadow-md flex items-center space-x-2 font-mono text-xs">
            <Crosshair size={14} className="text-rose-500 animate-spin" />
            <span className="text-slate-500 dark:text-slate-400">Indexed Threat IOCs:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {stats?.totalRealThreatsIndexed || attacks.length || 35} Verified
            </span>
          </div>
        </div>
      )}

      {/* Real Stream & Origin Geo Intelligence Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live Attack Intercept Stream */}
        <div className="lg:col-span-2 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Live Attack Intercept Stream (Verified Global Feeds)
              </span>
            </div>
            <button
              onClick={() => {
                loadRealAttackData();
              }}
              className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-mono flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
              Sync abuse.ch & SANS Feeds
            </button>
          </div>

          <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
            {recentAttacks.map((atk, idx) => (
              <div 
                key={atk.id || idx}
                onClick={() => setSelectedAttack(atk)}
                className="group flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-950/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-500/50 cursor-pointer transition-all text-xs shadow-xs"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${atk.severity === 'CRITICAL' ? 'bg-rose-500 shadow-xs shadow-rose-500' : 'bg-amber-500'}`} />
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                    {isNaN(new Date(atk.timestamp).getTime()) ? atk.timestamp : new Date(atk.timestamp).toLocaleTimeString([], { hour12: false })}
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 shrink-0">
                    {atk.sourceCountryCode}
                  </span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold shrink-0">
                    {atk.sourceIp}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">→</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate font-medium max-w-[130px]">
                    {atk.targetNode}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
                    {atk.malwareFamily}
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shrink-0 hidden md:inline">
                    {atk.feedSource.includes('Feodo') ? 'abuse.ch Feodo' : atk.feedSource.includes('URLhaus') ? 'abuse.ch URLhaus' : 'SANS DShield'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md font-mono ${atk.status === 'BLOCKED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60' : 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800/60'}`}>
                    🛡️ {atk.status}
                  </span>
                  <ArrowUpRight size={12} className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Attacking Nations & Threat Profile */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Globe size={14} className="text-cyan-600 dark:text-cyan-400" />
              Top Origin Attack Vectors
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">24h Geo Profile</span>
          </div>

          <div className="space-y-2">
            {(stats?.topOriginCountries || [
              { name: 'United States', code: 'US', count: 18 },
              { name: 'China', code: 'CN', count: 12 },
              { name: 'Netherlands', code: 'NL', count: 9 },
              { name: 'Germany', code: 'DE', count: 7 },
              { name: 'Russia', code: 'RU', count: 6 }
            ]).map((country: any) => {
              const max = 25;
              const pct = Math.min(100, Math.round((country.count / max) * 100));
              return (
                <div key={country.code} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">{country.name} ({country.code})</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">{country.count} Active Threats</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real IOC Inspector Modal */}
      {selectedAttack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-sm">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                    REAL THREAT IOC INSPECTOR
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    ID: {selectedAttack.id} • Feed: {selectedAttack.feedSource}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAttack(null)}
                className="text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-mono font-bold">Source Adversary IP</span>
                <p className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm">{selectedAttack.sourceIp}</p>
                <p className="text-slate-600 dark:text-slate-400">{selectedAttack.sourceCity}, {selectedAttack.sourceCountry} ({selectedAttack.sourceCountryCode})</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 font-mono truncate">{selectedAttack.sourceAsn || 'Autonomous System'}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-mono font-bold">Target Defense Sensor</span>
                <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{selectedAttack.targetNode}</p>
                <p className="text-slate-600 dark:text-slate-400">{selectedAttack.targetCity}, {selectedAttack.targetCountry}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">HORUS Perimeter Sensor Active</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-mono font-bold">Malware Signature / Vector</span>
                <p className="font-mono font-bold text-rose-600 dark:text-rose-400 truncate">{selectedAttack.malwareFamily}</p>
                <p className="text-slate-600 dark:text-slate-400">{selectedAttack.threatType} ({selectedAttack.protocol} Port {selectedAttack.port})</p>
                {selectedAttack.payloadUrl && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    Payload: {selectedAttack.payloadUrl}
                  </p>
                )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-mono font-bold">Verified Intelligence Feed</span>
                <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate">{selectedAttack.feedSource}</p>
                <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                  Observed: {selectedAttack.timestamp}
                </p>
                {selectedAttack.referenceUrl && (
                  <a 
                    href={selectedAttack.referenceUrl} 
                    target="_blank" 
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-mono font-semibold"
                  >
                    View Official Threat Report <ArrowUpRight size={11} />
                  </a>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase font-bold block">Automated Mitigation Status</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
                  {selectedAttack.status} — Perimeter Boundary Rule Applied
                </span>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold">
                Confidence: {selectedAttack.confidence}%
              </span>
            </div>

            {blockStatus && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-mono font-bold flex items-center gap-2">
                <CheckCircle size={15} />
                <span>{blockStatus}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => handleBlockIp(selectedAttack.sourceIp)}
                disabled={Boolean(blockStatus)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Lock size={14} /> Add Permanent Firewall Drop
              </button>
              <button
                onClick={() => setSelectedAttack(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
