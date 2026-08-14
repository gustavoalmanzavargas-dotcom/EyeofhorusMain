import React, { useState, useEffect } from 'react';
import { 
  Clock, Pin, Tag, MessageSquare, Shield, AlertTriangle, 
  Filter, Plus, Download, CheckCircle, Search, Trash2, ArrowRight, UserCheck, Lock
} from 'lucide-react';
import { PageHeader, Card, Modal } from '../UI';
import { api } from '../../services/api';
import { TimelineItem } from '../../types';

export const HorusTimelineView: React.FC = () => {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [filterSource, setFilterSource] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<TimelineItem>>({
    summary: '',
    source: 'endpoint',
    entity: 'win-dc-primary',
    mitreTactic: 'Execution',
    mitreTechnique: 'T1059.001',
    severity: 'HIGH',
    notes: '',
    pinned: true
  });
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      const data = await api.getTimeline();
      setItems(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePin = async (id: string, currentPin: boolean) => {
    try {
      await api.updateTimelineItem(id, { pinned: !currentPin });
      setItems(prev => prev.map(item => item.id === id ? { ...item, pinned: !currentPin } : item));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateItem = async () => {
    if (!newItem.summary) return;
    try {
      await api.addTimelineItem({
        timestamp: new Date().toTimeString().split(' ')[0],
        source: (newItem.source as any) || 'endpoint',
        summary: newItem.summary,
        entity: newItem.entity || 'Host / User',
        mitreTactic: newItem.mitreTactic || 'Execution',
        mitreTechnique: newItem.mitreTechnique || 'T1059',
        severity: (newItem.severity as any) || 'HIGH',
        pinned: newItem.pinned !== false,
        notes: newItem.notes || ''
      });
      setIsAddModalOpen(false);
      setNewItem({
        summary: '',
        source: 'endpoint',
        entity: 'win-dc-primary',
        mitreTactic: 'Execution',
        mitreTechnique: 'T1059.001',
        severity: 'HIGH',
        notes: '',
        pinned: true
      });
      loadTimeline();
      setNotification('Investigation event recorded on timeline.');
      setTimeout(() => setNotification(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredItems = items.filter(item => {
    if (filterSource !== 'all' && item.source !== filterSource) return false;
    if (filterSeverity !== 'all' && item.severity !== filterSeverity) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.summary.toLowerCase().includes(q) ||
        item.entity.toLowerCase().includes(q) ||
        (item.mitreTechnique && item.mitreTechnique.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pinnedItems = filteredItems.filter(i => i.pinned);
  const unpinnedItems = filteredItems.filter(i => !i.pinned);

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="HORUS INVESTIGATION TIMELINE — Unified Chronological Threat Workspace">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus size={14} />
            <span>Add Event / Note</span>
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

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search timeline items, evidence notes, entities..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Telemetry Sources</option>
            <option value="endpoint">Endpoint & FIM</option>
            <option value="auth">Authentication & Identity</option>
            <option value="process">Process Execution</option>
            <option value="network">Network Traffic</option>
            <option value="dns">DNS Resolution</option>
          </select>
        </div>
        <div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Severity Levels</option>
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="LOW">Low Severity</option>
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-6">
        {/* Pinned Evidence Section */}
        {pinnedItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Pin size={14} className="fill-amber-500 text-amber-500" />
              <span>Pinned Primary Evidence ({pinnedItems.length})</span>
            </div>
            <div className="space-y-3">
              {pinnedItems.map((item) => (
                <TimelineCard key={item.id} item={item} onTogglePin={handleTogglePin} />
              ))}
            </div>
          </div>
        )}

        {/* Chronological Stream */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-gray-400">
            <Clock size={14} />
            <span>Telemetry Stream ({unpinnedItems.length})</span>
          </div>
          <div className="space-y-3">
            {unpinnedItems.map((item) => (
              <TimelineCard key={item.id} item={item} onTogglePin={handleTogglePin} />
            ))}
          </div>
        </div>
      </div>

      {/* Add Timeline Item Modal */}
      {isAddModalOpen && (
        <Modal title="Record Forensic Observation to Timeline" onClose={() => setIsAddModalOpen(false)}>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Observation Summary *</label>
              <input
                type="text"
                value={newItem.summary}
                onChange={(e) => setNewItem({ ...newItem, summary: e.target.value })}
                placeholder="e.g., PowerShell spawned with encoded payload downloading from malicious domain"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Target Entity / Host</label>
                <input
                  type="text"
                  value={newItem.entity}
                  onChange={(e) => setNewItem({ ...newItem, entity: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Telemetry Source</label>
                <select
                  value={newItem.source}
                  onChange={(e) => setNewItem({ ...newItem, source: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none font-semibold"
                >
                  <option value="endpoint">Endpoint & FIM</option>
                  <option value="auth">Authentication</option>
                  <option value="process">Process Lineage</option>
                  <option value="network">Network Traffic</option>
                  <option value="dns">DNS Resolution</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">MITRE Tactic</label>
                <input
                  type="text"
                  value={newItem.mitreTactic}
                  onChange={(e) => setNewItem({ ...newItem, mitreTactic: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">MITRE Technique</label>
                <input
                  type="text"
                  value={newItem.mitreTechnique}
                  onChange={(e) => setNewItem({ ...newItem, mitreTechnique: e.target.value })}
                  placeholder="e.g., T1059.001"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Severity</label>
                <select
                  value={newItem.severity}
                  onChange={(e) => setNewItem({ ...newItem, severity: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none font-bold"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Analyst Notes & Findings</label>
              <textarea
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                rows={3}
                placeholder="Include contextual findings, correlation tags, or mitigation steps..."
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
                onClick={handleCreateItem}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Save to Timeline
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const TimelineCard: React.FC<{ item: TimelineItem; onTogglePin: (id: string, current: boolean) => void }> = ({ item, onTogglePin }) => {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      item.pinned 
        ? 'bg-amber-500/5 border-amber-500/30 dark:border-amber-500/40 shadow-sm' 
        : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="text-[11px] font-mono font-bold text-slate-400 dark:text-gray-500 pt-0.5 shrink-0">
            {item.timestamp}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold uppercase">
                {item.source}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                item.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400' :
                item.severity === 'HIGH' ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400' :
                'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400'
              }`}>
                {item.severity}
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-gray-300">
                {item.entity}
              </span>
              {item.mitreTechnique && (
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 font-mono text-[10px]">
                  {item.mitreTactic}: <strong className="text-amber-500">{item.mitreTechnique}</strong>
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white pt-1">
              {item.summary}
            </div>
            {item.notes && (
              <div className="text-xs text-slate-600 dark:text-gray-300 bg-slate-50 dark:bg-gray-950/80 p-2.5 rounded-xl border border-slate-200 dark:border-gray-800/80 mt-2 font-mono text-[11px]">
                <span className="font-bold text-indigo-500">Analyst Note:</span> {item.notes}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onTogglePin(item.id, item.pinned)}
            className={`p-2 rounded-xl border transition-all ${
              item.pinned 
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs' 
                : 'bg-slate-100 dark:bg-gray-800 text-slate-400 border-slate-200 dark:border-gray-700 hover:text-amber-500'
            }`}
            title={item.pinned ? 'Unpin evidence' : 'Pin to primary evidence'}
          >
            <Pin size={13} className={item.pinned ? 'fill-white' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
};
