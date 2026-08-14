import React, { useState, useEffect } from 'react';
import { 
  Users, Monitor, Shield, AlertTriangle, ChevronRight, Activity, 
  TrendingUp, CheckCircle, Search, Filter, Lock, ArrowRight, UserCheck
} from 'lucide-react';
import { PageHeader, Card, Modal } from '../UI';
import { api } from '../../services/api';
import { EntityRiskProfile } from '../../types';

export const HorusEntityAnalyticsView: React.FC = () => {
  const [profiles, setProfiles] = useState<EntityRiskProfile[]>([]);
  const [entityTypeFilter, setEntityTypeFilter] = useState<'All' | 'User' | 'Host'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<EntityRiskProfile | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await api.getEntityProfiles();
      setProfiles(data);
      if (data.length > 0) setSelectedEntity(data[0]);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    if (entityTypeFilter !== 'All' && p.entityType !== entityTypeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.identifier.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="HORUS ENTITY ANALYTICS & UEBA — Behavioral Risk Scoring & Peer Group Baselines">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-gray-900 p-1 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold">
            {(['All', 'User', 'Host'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setEntityTypeFilter(tab)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  entityTypeFilter === tab 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'All' ? 'All Entities' : tab === 'User' ? 'Users & Identities' : 'Hosts & Workloads'}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm relative">
        <Search className="absolute left-7.5 top-6 text-slate-400" size={14} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter entities by username, domain, hostname, IP address..."
          className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entities Column */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-gray-400">
            Entities Ranked by Risk Score
          </h3>
          {filteredProfiles.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedEntity(p)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedEntity?.id === p.id 
                  ? 'bg-indigo-600/10 border-indigo-500 shadow-md' 
                  : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    p.entityType === 'User' ? 'bg-purple-100 dark:bg-purple-950 text-purple-600' : 'bg-blue-100 dark:bg-blue-950 text-blue-600'
                  }`}>
                    {p.entityType === 'User' ? <Users size={16} /> : <Monitor size={16} />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{p.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{p.identifier}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black font-mono ${
                    p.riskTier === 'CRITICAL' ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400' :
                    p.riskTier === 'HIGH' ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400' :
                    'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400'
                  }`}>
                    {p.riskScore}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{p.riskTier}</div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-gray-800/80 text-[11px] text-slate-500 dark:text-gray-400">
                <span>{p.department || p.os}</span>
                <span>{p.riskContributors.length} Risk Factors</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Entity Deep-Dive */}
        {selectedEntity && (
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-6">
              {/* Header Profile */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    selectedEntity.entityType === 'User' ? 'bg-purple-100 dark:bg-purple-950 text-purple-600' : 'bg-blue-100 dark:bg-blue-950 text-blue-600'
                  }`}>
                    {selectedEntity.entityType === 'User' ? <Users size={24} /> : <Monitor size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">
                        {selectedEntity.name}
                      </h2>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-gray-800 font-mono text-[10px] font-bold text-slate-600 dark:text-gray-400">
                        {selectedEntity.entityType}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-400">{selectedEntity.identifier} • {selectedEntity.department || selectedEntity.os}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 rounded-xl text-center">
                    <div className="text-2xl font-black font-mono text-red-600 dark:text-red-400">{selectedEntity.riskScore}</div>
                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Calculated Risk Score</div>
                  </div>
                </div>
              </div>

              {/* Explainable Risk Contributors (Points Breakdown) */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-red-500" /> Explainable Risk Contributors ({selectedEntity.riskContributors.length} Signals)
                </h4>

                <div className="space-y-2">
                  {selectedEntity.riskContributors.map((rc, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-gray-950 rounded-xl border border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-gray-200">{rc.reason}</div>
                        <div className="text-[10px] font-mono text-slate-400">{rc.category} • Detected at {rc.timestamp}</div>
                      </div>
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-mono font-black rounded-lg text-xs shrink-0">
                        +{rc.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Peer Group Baseline Comparison */}
              {selectedEntity.peerComparison && (
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-gray-800">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-indigo-500" /> Peer Group Baseline Deviation
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-gray-950 rounded-xl border border-slate-200 dark:border-gray-800 space-y-2 text-xs">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Department / Role Average</div>
                      <div className="text-xl font-bold font-mono text-slate-700 dark:text-gray-300">
                        {selectedEntity.peerComparison.peerAverage} pts (Entity is in {selectedEntity.peerComparison.percentile}th percentile)
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-red-500 h-full rounded-full" 
                          style={{ width: `${selectedEntity.peerComparison.percentile}%` }} 
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-gray-950 rounded-xl border border-slate-200 dark:border-gray-800 space-y-2 text-xs">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Anomalous Deviations vs Peers</div>
                      <ul className="space-y-1 text-slate-700 dark:text-gray-300 list-disc pl-4 text-[11px]">
                        {selectedEntity.peerComparison.anomalousActivities.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
