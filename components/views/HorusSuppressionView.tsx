import React, { useState, useEffect } from 'react';
import { 
  Sliders, ShieldCheck, Filter, Plus, CheckCircle, Trash2, 
  Clock, AlertTriangle, Database, Zap, FileText, ArrowRight
} from 'lucide-react';
import { PageHeader, Card, Modal } from '../UI';
import { api } from '../../services/api';
import { SuppressionRule, SecurityException, EventFilterPolicy } from '../../types';

export const HorusSuppressionView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'suppression' | 'exceptions' | 'filters'>('suppression');
  const [suppressions, setSuppressions] = useState<SuppressionRule[]>([]);
  const [exceptions, setExceptions] = useState<SecurityException[]>([]);
  const [filters, setFilters] = useState<EventFilterPolicy[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSup, setNewSup] = useState({ name: '', field: 'process', value: '' });
  const [newExc, setNewExc] = useState({ title: '', scope: 'Trusted Hash', targetValue: '', reason: '', expiration: '2026-12-31' });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [sData, eData, fData] = await Promise.all([
        api.getSuppressionRules(),
        api.getSecurityExceptions(),
        api.getEventFilters()
      ]);
      setSuppressions(sData);
      setExceptions(eData);
      setFilters(fData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSuppression = async () => {
    if (!newSup.name || !newSup.value) return;
    try {
      await api.createSuppressionRule(newSup);
      setIsAddModalOpen(false);
      setNewSup({ name: '', field: 'process', value: '' });
      setNotification('Suppression rule applied to ingestion pipeline.');
      loadAll();
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddException = async () => {
    if (!newExc.title || !newExc.targetValue) return;
    try {
      await api.createSecurityException({
        ...newExc,
        owner: 'SecOps Officer'
      });
      setIsAddModalOpen(false);
      setNewExc({ title: '', scope: 'Trusted Hash', targetValue: '', reason: '', expiration: '2026-12-31' });
      setNotification('Security exception cataloged with strict expiration policy.');
      loadAll();
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const totalReductionGb = filters.reduce((acc, f) => acc + f.estimatedReductionGbDay, 0);

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="ALERT SUPPRESSION, SECURITY EXCEPTIONS & INGESTION FILTERING">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-gray-900 p-1 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('suppression')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'suppression' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-400'
              }`}
            >
              Alert Suppression & Deduplication ({suppressions.length})
            </button>
            <button
              onClick={() => setActiveTab('exceptions')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'exceptions' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-400'
              }`}
            >
              Security Exceptions ({exceptions.length})
            </button>
            <button
              onClick={() => setActiveTab('filters')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'filters' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-400'
              }`}
            >
              Storage Reduction Filters ({filters.length})
            </button>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus size={14} />
            <span>Add Rule / Exception</span>
          </button>
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

      {activeTab === 'suppression' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppressions.map((s) => (
              <Card key={s.id} className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold uppercase">
                    Field: {s.field}
                  </span>
                  <span className="text-emerald-500 font-bold text-[10px] flex items-center gap-1">
                    <CheckCircle size={12} /> Active
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</h4>
                  <div className="font-mono text-xs text-slate-600 dark:text-gray-300 bg-slate-50 dark:bg-gray-950 p-2 rounded-lg border border-slate-200 dark:border-gray-800 mt-2 truncate">
                    match: <strong className="text-indigo-500">{s.value}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-gray-800 text-[11px] text-slate-500 font-mono">
                  <span>{s.suppressedEventsCount.toLocaleString()} Noisy Alerts Silenced</span>
                  <span>{s.lastSuppressed}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : activeTab === 'exceptions' ? (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-gray-950 border-b border-slate-200 dark:border-gray-800 text-[11px] uppercase tracking-wider font-mono font-bold text-slate-600 dark:text-gray-400">
                <tr>
                  <th className="py-3 px-4">Exception Title</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4">Target Fingerprint / Hash</th>
                  <th className="py-3 px-4">Approved Owner</th>
                  <th className="py-3 px-4">Expiration</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800 font-medium">
                {exceptions.map((exc) => (
                  <tr key={exc.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{exc.title}</div>
                      <div className="text-[11px] text-slate-400">{exc.reason}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-indigo-500 font-bold">{exc.scope}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-gray-300 max-w-xs truncate">{exc.targetValue}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-gray-300">{exc.owner}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-amber-500">{exc.expiration}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                        {exc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* STORAGE REDUCTION FILTERS TAB */
        <div className="space-y-6">
          <div className="p-4 bg-linear-to-r from-emerald-900/40 via-teal-900/30 to-slate-900/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Database size={20} />
              </div>
              <div>
                <div className="text-sm font-black text-white">Ingestion Pre-Filtering Savings Engine</div>
                <div className="text-xs text-emerald-300">Eliminating redundant benign log churn at the ingestion tier.</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black font-mono text-emerald-400">-{totalReductionGb} GB / Day</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Estimated Storage Cost Savings: ~$3,200/mo</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filters.map((f) => (
              <Card key={f.id} className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500 font-mono text-[10px] uppercase">{f.dataSource}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full font-bold text-[10px]">
                    -{f.estimatedReductionGbDay} GB/day
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{f.name}</h4>
                <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800 font-mono text-[10px] text-emerald-400 break-all">
                  {f.condition}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <Modal 
          title={activeTab === 'suppression' ? 'Create Alert Suppression Rule' : 'Authorize Security Exception'} 
          onClose={() => setIsAddModalOpen(false)}
        >
          {activeTab === 'suppression' ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Rule Name *</label>
                <input
                  type="text"
                  value={newSup.name}
                  onChange={(e) => setNewSup({ ...newSup, name: e.target.value })}
                  placeholder="e.g., Suppress Backup Agent FIM Noise"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Match Field</label>
                  <select
                    value={newSup.field}
                    onChange={(e) => setNewSup({ ...newSup, field: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none font-semibold"
                  >
                    <option value="process">process.name</option>
                    <option value="ip">source.ip</option>
                    <option value="user">user.name</option>
                    <option value="ruleId">rule.id</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Match Target Value</label>
                  <input
                    type="text"
                    value={newSup.value}
                    onChange={(e) => setNewSup({ ...newSup, value: e.target.value })}
                    placeholder="e.g., VeeamAgent.exe"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-gray-800">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSuppression}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Save Suppression Rule
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Exception Title *</label>
                <input
                  type="text"
                  value={newExc.title}
                  onChange={(e) => setNewExc({ ...newExc, title: e.target.value })}
                  placeholder="e.g., Approved Vulnerability Scanner IP"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Scope</label>
                  <select
                    value={newExc.scope}
                    onChange={(e) => setNewExc({ ...newExc, scope: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none font-semibold"
                  >
                    <option value="Trusted Hash">Trusted Hash (SHA256)</option>
                    <option value="Network Excluded">Network Excluded (Subnet/IP)</option>
                    <option value="Path Excluded">Path Excluded</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={newExc.expiration}
                    onChange={(e) => setNewExc({ ...newExc, expiration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Target Fingerprint / Hash / IP</label>
                <input
                  type="text"
                  value={newExc.targetValue}
                  onChange={(e) => setNewExc({ ...newExc, targetValue: e.target.value })}
                  placeholder="e.g., 10.0.100.50 or SHA256 string"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Business Justification</label>
                <textarea
                  value={newExc.reason}
                  onChange={(e) => setNewExc({ ...newExc, reason: e.target.value })}
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-gray-800">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddException}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Authorize Exception
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
