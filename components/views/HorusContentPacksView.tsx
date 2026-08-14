import React, { useState, useEffect } from 'react';
import { 
  Package, ShieldCheck, Download, CheckCircle, RefreshCw, 
  Layers, Lock, Sparkles, Filter, ExternalLink
} from 'lucide-react';
import { PageHeader, Card } from '../UI';
import { api } from '../../services/api';
import { SecurityContentPack } from '../../types';

export const HorusContentPacksView: React.FC = () => {
  const [packs, setPacks] = useState<SecurityContentPack[]>([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      const data = await api.getContentPacks();
      setPacks(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleInstall = async (pack: SecurityContentPack) => {
    try {
      const newStatus = !pack.installed;
      await api.toggleContentPack(pack.id, newStatus);
      setPacks(prev => prev.map(p => p.id === pack.id ? { ...p, installed: newStatus } : p));
      setNotification(`${pack.name} ${newStatus ? 'installed & synchronized with Detection Engine' : 'uninstalled'}.`);
      setTimeout(() => setNotification(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredPacks = packs.filter(p => filterCategory === 'all' || p.category === filterCategory);

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="CYVERAX SECURITY CONTENT PACKS & MARKETPLACE">
        <div className="flex items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl text-xs font-bold focus:outline-none"
          >
            <option value="all">All Content Categories</option>
            <option value="Operating Systems">Operating Systems & Active Directory</option>
            <option value="Cloud & SaaS">Cloud & SaaS (AWS / M365)</option>
            <option value="Threat Defense">Threat Defense & Ransomware</option>
            <option value="Compliance">Compliance & Audit (HIPAA / PCI)</option>
          </select>
        </div>
      </PageHeader>

      {notification && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 font-bold">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-emerald-500 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-500">Dismiss</button>
        </div>
      )}

      {/* Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPacks.map((pack) => (
          <Card key={pack.id} className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold uppercase">
                  {pack.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                  <ShieldCheck size={14} /> Cyverax Verified (v{pack.version})
                </span>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">{pack.name}</h3>
                <div className="text-[11px] text-slate-400 mt-0.5">Maintained by {pack.author}</div>
              </div>

              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                {pack.description}
              </p>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-gray-950 p-3 rounded-xl border border-slate-200 dark:border-gray-800 text-center font-mono text-xs">
                <div>
                  <div className="font-black text-slate-800 dark:text-white">{pack.rulesCount}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Detections</div>
                </div>
                <div>
                  <div className="font-black text-slate-800 dark:text-white">{pack.dashboardsCount}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Dashboards</div>
                </div>
                <div>
                  <div className="font-black text-slate-800 dark:text-white">{pack.playbooksCount}</div>
                  <div className="text-[9px] text-slate-400 uppercase">SOAR Flows</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between">
              <span className={`text-xs font-bold ${pack.installed ? 'text-emerald-500' : 'text-slate-400'}`}>
                {pack.installed ? 'Installed & Active' : 'Available in Catalog'}
              </span>

              <button
                onClick={() => handleToggleInstall(pack)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                  pack.installed
                    ? 'bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                }`}
              >
                {pack.installed ? 'Uninstall' : 'Install Pack'}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
