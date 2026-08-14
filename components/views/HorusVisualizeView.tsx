import React, { useState } from 'react';
import { 
  BarChart3, PieChart, Activity, TrendingUp, Shield, 
  Users, Globe, AlertTriangle, CheckCircle, RefreshCw, LayoutDashboard, Layers
} from 'lucide-react';
import { PageHeader, Card } from '../UI';

export const HorusVisualizeView: React.FC = () => {
  const [activeDashboard, setActiveDashboard] = useState<'soc' | 'identity' | 'network' | 'executive'>('soc');

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="HORUS VISUALIZE & SOC DASHBOARD SUITE">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-gray-900 p-1 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold">
            <button
              onClick={() => setActiveDashboard('soc')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeDashboard === 'soc' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-400'
              }`}
            >
              SOC Operations
            </button>
            <button
              onClick={() => setActiveDashboard('identity')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeDashboard === 'identity' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-400'
              }`}
            >
              Identity & Zero Trust
            </button>
            <button
              onClick={() => setActiveDashboard('network')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeDashboard === 'network' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-400'
              }`}
            >
              Network & C2 Traffic
            </button>
            <button
              onClick={() => setActiveDashboard('executive')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeDashboard === 'executive' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-400'
              }`}
            >
              Executive & Compliance
            </button>
          </div>
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Analyzed Events (24h)</div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">4,892,104</div>
          <div className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
            <TrendingUp size={12} /> +12.4% vs yesterday
          </div>
        </Card>
        <Card className="p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Mean Time to Detect (MTTD)</div>
          <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">1.8 mins</div>
          <div className="text-[11px] text-emerald-500 font-bold">Sub-2m Automated SLA</div>
        </Card>
        <Card className="p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Mean Time to Respond (MTTR)</div>
          <div className="text-2xl font-black font-mono text-emerald-500">4.2 mins</div>
          <div className="text-[11px] text-emerald-500 font-bold">SOAR Auto-Isolation</div>
        </Card>
        <Card className="p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">High/Critical Killchain Threats</div>
          <div className="text-2xl font-black font-mono text-red-500">1 Contained</div>
          <div className="text-[11px] text-slate-400">0 Active Lateral Spread</div>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Telemetry Velocity Chart */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={14} className="text-indigo-500" /> Event Ingestion Velocity & Threat Density
            </h3>
            <span className="text-[10px] font-mono text-slate-400">5-min Buckets</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-2 pt-8 px-2">
            {[35, 42, 60, 48, 85, 98, 72, 64, 52, 90, 100, 78, 65, 45, 58, 80].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div 
                  className={`w-full rounded-t-lg transition-all ${
                    h > 80 ? 'bg-red-500 group-hover:bg-red-400' : 'bg-indigo-600/80 group-hover:bg-indigo-500'
                  }`}
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {h * 10}k
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100 dark:border-gray-800">
            <span>08:00</span>
            <span>10:00</span>
            <span>12:00</span>
            <span>14:00 (Attack Spike)</span>
          </div>
        </Card>

        {/* MITRE ATT&CK Tactic Distribution */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Shield size={14} className="text-amber-500" /> MITRE ATT&CK Tactic Breakdown
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Past 7 Days</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { tactic: 'Execution (T1059)', count: 482, pct: 38, color: 'bg-red-500' },
              { tactic: 'Credential Access (T1003, T1110)', count: 320, pct: 26, color: 'bg-amber-500' },
              { tactic: 'Persistence (T1098, T1547)', count: 215, pct: 18, color: 'bg-indigo-500' },
              { tactic: 'Command & Control (T1071)', count: 140, pct: 11, color: 'bg-purple-500' },
              { tactic: 'Lateral Movement (T1021)', count: 85, pct: 7, color: 'bg-emerald-500' }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-700 dark:text-gray-300 font-bold">{item.tactic}</span>
                  <span className="text-slate-500">{item.count} detections ({item.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
