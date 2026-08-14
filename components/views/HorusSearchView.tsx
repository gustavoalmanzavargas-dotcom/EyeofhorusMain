import React, { useState, useEffect } from 'react';
import { 
  Search, Terminal, Play, Bookmark, Clock, Filter, Download, 
  ChevronRight, ChevronDown, CheckCircle, AlertTriangle, Eye, 
  Plus, Sparkles, RefreshCw, Layers, Shield, FileText, ArrowRight, Share2, Code, Database, X
} from 'lucide-react';
import { PageHeader, Card, Modal } from '../UI';
import { Table } from '../Table';
import { api } from '../../services/api';
import { HscEvent, HqlSavedQuery, HqlQueryResult } from '../../types';

interface HorusSearchViewProps {
  onPivotToTimeline?: (event: any) => void;
  onPivotToCase?: (event: any) => void;
}

export const HorusSearchView: React.FC<HorusSearchViewProps> = ({ onPivotToTimeline, onPivotToCase }) => {
  const [activeTab, setActiveTab] = useState<'hql' | 'discover'>('hql');
  const [queryInput, setQueryInput] = useState<string>(
    'FROM endpoint.events\n| WHERE process.name == "powershell.exe"\n| WHERE process.command_line CONTAINS "-enc"\n| GROUP BY host.name, user.name\n| SORT timestamp DESC'
  );
  const [hqlResult, setHqlResult] = useState<HqlQueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [savedQueries, setSavedQueries] = useState<HqlSavedQuery[]>([]);
  const [eventsList, setEventsList] = useState<HscEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<HscEvent | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Discover state
  const [discoverFilter, setDiscoverFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'timestamp', 'event.action', 'host.name', 'user.name', 'process.name', 'risk.severity', 'threat.technique'
  ]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSavedQueries();
    executeHql();
    loadDiscoverEvents();
  }, []);

  const loadSavedQueries = async () => {
    try {
      const q = await api.getSavedQueries();
      setSavedQueries(q);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDiscoverEvents = async () => {
    try {
      const evts = await api.getHscEvents({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        severity: selectedSeverity === 'all' ? undefined : selectedSeverity,
        search: discoverFilter || undefined
      });
      setEventsList(evts);
    } catch (e) {
      console.error(e);
    }
  };

  const executeHql = async (customQ?: string) => {
    const qToRun = customQ || queryInput;
    setIsExecuting(true);
    try {
      const res = await api.executeHqlQuery(qToRun);
      setHqlResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleAiGenerateHql = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    setAiMessage(null);
    try {
      const res = await api.askOracle(`Generate a valid HQL (Horus Query Language) query for this request: "${aiPrompt}". Return the HQL block.`);
      if (res.reply) {
        // Extract query lines
        const lines = res.reply.split('\n').filter(l => l.startsWith('FROM') || l.startsWith('|'));
        if (lines.length > 0) {
          const generated = lines.join('\n');
          setQueryInput(generated);
          setAiMessage('AI successfully synthesized HQL query.');
          executeHql(generated);
        } else {
          setQueryInput(`FROM endpoint.events\n| WHERE threat.indicator CONTAINS "${aiPrompt.replace(/"/g, '')}"\n| SORT timestamp DESC`);
          setAiMessage('Synthesized targeted HQL query.');
          executeHql();
        }
      }
    } catch (e) {
      setAiMessage('Generated default heuristic query.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(hqlResult?.rows || eventsList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `horus_search_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleAddToTimeline = async (evt: HscEvent) => {
    try {
      await api.addTimelineItem({
        timestamp: evt.event.time || '14:00:00',
        source: evt.event.category || 'endpoint',
        summary: `HSC Observation: ${evt.event.action} on ${evt.host?.name || 'Endpoint'} by ${evt.user?.name || 'User'}`,
        entity: evt.host?.name || evt.user?.name || 'Endpoint',
        mitreTactic: evt.threat?.tactic || 'Execution',
        mitreTechnique: evt.threat?.technique || 'T1059',
        severity: evt.risk?.severity || 'HIGH',
        pinned: true,
        notes: `Extracted from Horus Search: ${evt.process?.command_line || evt.dns?.question || 'Security record'}`
      });
      setActionSuccess(`Event ${evt.event.id} successfully added to Security Timeline workspace.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="HORUS SEARCH & ANALYTICS — Enterprise Distributed Security Query Engine">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('hql')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'hql' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-50'
            }`}
          >
            <Terminal size={14} />
            <span>HQL Query Editor</span>
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'discover' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-50'
            }`}
          >
            <Layers size={14} />
            <span>Horus Discover</span>
          </button>
          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-indigo-600 flex items-center gap-1.5 shadow-xs"
          >
            <Download size={13} />
            <span>Export JSON</span>
          </button>
        </div>
      </PageHeader>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 font-bold">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-emerald-500 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-500 hover:text-emerald-800 dark:hover:text-white">Dismiss</button>
        </div>
      )}

      {activeTab === 'hql' ? (
        <div className="space-y-6">
          {/* AI Query Assistant Bar */}
          <div className="bg-linear-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/40 border border-indigo-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                <Sparkles size={18} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Horus Oracle AI — Natural Language HQL Generator</div>
                <div className="text-[11px] text-slate-500 dark:text-gray-400">Type what you want to hunt (e.g., "Find all encoded PowerShell commands from svc accounts")</div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-1/2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiGenerateHql()}
                placeholder="Ask Oracle to write an HQL search..."
                className="flex-1 px-3.5 py-2 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl text-xs text-slate-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAiGenerateHql}
                disabled={isAiGenerating}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-md shadow-indigo-600/30 disabled:opacity-50"
              >
                {isAiGenerating ? <RefreshCw className="animate-spin" size={13} /> : <Sparkles size={13} />}
                <span>Generate</span>
              </button>
            </div>
          </div>
          {aiMessage && (
            <div className="text-[11px] font-mono text-indigo-500 dark:text-indigo-400 pl-2">{aiMessage}</div>
          )}

          {/* HQL Code Editor Box */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-gray-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900/80 border-b border-gray-800 text-xs font-mono text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span className="ml-2 font-bold text-gray-200 uppercase tracking-widest text-[10px]">HQL Execution Console</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-500">Schema: HSC v2.4</span>
                    <button
                      onClick={() => executeHql()}
                      disabled={isExecuting}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 disabled:opacity-50 transition-all"
                    >
                      {isExecuting ? <RefreshCw className="animate-spin" size={13} /> : <Play size={13} />}
                      <span>Run Query (Ctrl+Enter)</span>
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <textarea
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    rows={6}
                    className="w-full bg-transparent font-mono text-xs text-emerald-400 leading-relaxed focus:outline-none resize-none"
                    spellCheck={false}
                  />
                </div>

                {/* HQL Syntax Cheat Sheet Bar */}
                <div className="px-4 py-2 bg-gray-900/40 border-t border-gray-800/80 flex flex-wrap items-center gap-2 text-[10px] font-mono text-gray-400">
                  <span className="text-gray-500 font-bold uppercase">Tokens:</span>
                  {['FROM', '| WHERE', '| GROUP BY', '| SORT', '| LIMIT', '| STATS COUNT()', '| CORRELATE'].map((token) => (
                    <button
                      key={token}
                      onClick={() => setQueryInput(prev => prev + `\n${token} `)}
                      className="px-2 py-0.5 bg-gray-800/80 hover:bg-indigo-600 hover:text-white rounded border border-gray-700 text-gray-300 transition-colors"
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>

              {/* Execution Summary Bar */}
              {hqlResult && (
                <div className="flex items-center justify-between text-xs font-mono px-3 text-slate-500 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{hqlResult.totalHits} Matches Found</span>
                    <span>Execution Latency: {hqlResult.executionTimeMs} ms</span>
                  </div>
                  <span>Dataset: Normalized HSC Cluster</span>
                </div>
              )}

              {/* HQL Results Table */}
              <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-gray-950 border-b border-slate-200 dark:border-gray-800 text-[11px] uppercase tracking-wider font-mono font-bold text-slate-600 dark:text-gray-400">
                      <tr>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Host</th>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Process / Threat</th>
                        <th className="py-3 px-4">Severity</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-gray-800 font-medium">
                      {hqlResult?.rows && hqlResult.rows.length > 0 ? (
                        hqlResult.rows.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-gray-400">{r.timestamp ? r.timestamp.substring(11, 19) : '14:22:00'}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold uppercase">
                                {r.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{r.action}</td>
                            <td className="py-3 px-4 font-mono text-slate-700 dark:text-gray-300">{r.host}</td>
                            <td className="py-3 px-4 text-slate-700 dark:text-gray-300">{r.user}</td>
                            <td className="py-3 px-4 font-mono text-[11px] text-amber-600 dark:text-amber-400 truncate max-w-xs">{r.threat !== 'Clean' ? r.threat : r.process}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400' :
                                r.severity === 'HIGH' ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400' :
                                'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400'
                              }`}>
                                {r.severity} ({r.riskScore})
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setSelectedEvent(r.raw)}
                                className="px-2.5 py-1 bg-slate-100 dark:bg-gray-800 hover:bg-indigo-600 hover:text-white rounded-lg text-[11px] font-bold transition-colors"
                              >
                                View HSC JSON
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400 font-mono text-xs">
                            No matching events found for this HQL query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Saved Queries & Templates Sidebar */}
            <div className="space-y-4">
              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-gray-800">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Bookmark size={14} className="text-indigo-500" /> Saved HQL Queries
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">{savedQueries.length}</span>
                </div>

                <div className="space-y-2">
                  {savedQueries.map((sq) => (
                    <div
                      key={sq.id}
                      onClick={() => {
                        setQueryInput(sq.query);
                        executeHql(sq.query);
                      }}
                      className="p-3 bg-slate-50 dark:bg-gray-950 hover:bg-indigo-50 dark:hover:bg-gray-800/80 border border-slate-200 dark:border-gray-800 rounded-xl cursor-pointer transition-all group"
                    >
                      <div className="font-bold text-xs text-slate-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {sq.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-gray-400 line-clamp-1 mt-0.5">{sq.description}</div>
                      <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-slate-400">
                        <span>{sq.category}</span>
                        <span>{sq.lastRun}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Database size={14} className="text-emerald-500" /> Supported HSC Datasets
                </h4>
                <div className="space-y-1.5 text-xs font-mono">
                  {['endpoint.events', 'identity.auth', 'network.dns', 'network.traffic', 'endpoint.fim', 'cloud.aws.cloudtrail', 'threat.intel'].map(ds => (
                    <button
                      key={ds}
                      onClick={() => {
                        const q = `FROM ${ds}\n| LIMIT 50`;
                        setQueryInput(q);
                        executeHql(q);
                      }}
                      className="w-full text-left px-2.5 py-1.5 bg-slate-50 dark:bg-gray-950 rounded-lg hover:text-indigo-500 border border-slate-200 dark:border-gray-800 transition-colors flex items-center justify-between"
                    >
                      <span>{ds}</span>
                      <ChevronRight size={12} className="text-slate-400" />
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* HORUS DISCOVER (RAW & NORMALIZED EVENT EXPLORER) */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                value={discoverFilter}
                onChange={(e) => setDiscoverFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadDiscoverEvents()}
                placeholder="Search raw logs, IPs, users, hosts, process names, or techniques..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Event Categories</option>
                <option value="process">Process Execution</option>
                <option value="authentication">Authentication & Identity</option>
                <option value="dns">DNS Queries</option>
                <option value="network">Network & SMB</option>
                <option value="file">File Integrity (FIM)</option>
                <option value="cloud">Cloud Audit</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedSeverity}
                onChange={(e) => { setSelectedSeverity(e.target.value); }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Severity Levels</option>
                <option value="CRITICAL">Critical Severity</option>
                <option value="HIGH">High Severity</option>
                <option value="MEDIUM">Medium Severity</option>
                <option value="LOW">Low Severity</option>
              </select>
              <button
                onClick={loadDiscoverEvents}
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shrink-0"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-gray-950 border-b border-slate-200 dark:border-gray-800 text-[11px] uppercase tracking-wider font-mono font-bold text-slate-600 dark:text-gray-400">
                  <tr>
                    <th className="py-3 px-4">Event ID / Time</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Action & Outcome</th>
                    <th className="py-3 px-4">Host / Workload</th>
                    <th className="py-3 px-4">User / Account</th>
                    <th className="py-3 px-4">Target Process / Detail</th>
                    <th className="py-3 px-4">MITRE Technique</th>
                    <th className="py-3 px-4 text-right">Investigation Pivots</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800 font-medium">
                  {eventsList.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="font-bold text-slate-900 dark:text-white">{evt.event.id}</div>
                        <div className="text-slate-400 text-[10px]">{evt.event.time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold uppercase">
                          {evt.event.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 dark:text-gray-200">{evt.event.action}</div>
                        <span className={`text-[10px] font-mono uppercase font-bold ${evt.event.outcome === 'failure' || evt.event.outcome === 'blocked' ? 'text-red-500' : 'text-emerald-500'}`}>
                          {evt.event.outcome}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-gray-300">
                        {evt.host?.name || 'Cloud Workload'}
                        <div className="text-[10px] text-slate-400">{evt.host?.ip || ''}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-gray-300">
                        {evt.user?.name || 'SYSTEM'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-gray-300 max-w-xs truncate">
                        {evt.process?.name || evt.dns?.question || evt.file?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {evt.threat?.technique ? (
                          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded font-mono text-[10px] font-bold">
                            {evt.threat.technique}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedEvent(evt)}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-gray-800 hover:bg-indigo-600 hover:text-white rounded-lg text-[11px] font-bold transition-colors"
                          >
                            HSC Detail
                          </button>
                          <button
                            onClick={() => handleAddToTimeline(evt)}
                            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg text-[11px] font-bold transition-colors"
                          >
                            + Timeline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* HSC Event Details Modal (Normalized Fields & Raw JSON) */}
      {selectedEvent && (
        <Modal title={`HSC Event Record — ${selectedEvent.event.id}`} onClose={() => setSelectedEvent(null)}>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-gray-950 p-4 rounded-xl border border-slate-200 dark:border-gray-800 font-mono">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Category</div>
                <div className="font-bold text-indigo-600 dark:text-indigo-400">{selectedEvent.event.category}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Action</div>
                <div className="font-bold text-slate-800 dark:text-white">{selectedEvent.event.action}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Outcome</div>
                <div className="font-bold text-slate-800 dark:text-white uppercase">{selectedEvent.event.outcome}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Severity</div>
                <div className="font-bold text-red-500">{selectedEvent.risk?.severity || 'HIGH'} ({selectedEvent.risk?.score || 80})</div>
              </div>
            </div>

            {/* Normalized Entity Pivot Links */}
            <div className="bg-slate-100 dark:bg-gray-900 p-4 rounded-xl space-y-2 border border-slate-200 dark:border-gray-800">
              <div className="text-[11px] font-black uppercase text-slate-700 dark:text-gray-300">Entity Associations (HSC Normalized)</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                <div><span className="text-slate-400">host.name:</span> <strong className="text-slate-800 dark:text-white">{selectedEvent.host?.name || 'N/A'}</strong></div>
                <div><span className="text-slate-400">host.ip:</span> <strong className="text-slate-800 dark:text-white">{selectedEvent.host?.ip || 'N/A'}</strong></div>
                <div><span className="text-slate-400">user.name:</span> <strong className="text-slate-800 dark:text-white">{selectedEvent.user?.name || 'N/A'}</strong></div>
                <div><span className="text-slate-400">threat.technique:</span> <strong className="text-amber-500">{selectedEvent.threat?.technique || 'N/A'}</strong></div>
                {selectedEvent.process?.command_line && (
                  <div className="md:col-span-2"><span className="text-slate-400">process.command_line:</span> <strong className="text-emerald-500 break-all">{selectedEvent.process.command_line}</strong></div>
                )}
              </div>
            </div>

            {/* Raw JSON Record */}
            <div className="space-y-1">
              <div className="text-[11px] font-black uppercase text-slate-700 dark:text-gray-300">Raw Document JSON</div>
              <pre className="p-4 bg-gray-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto border border-gray-800 max-h-56">
                {selectedEvent.rawJson || JSON.stringify(selectedEvent, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-gray-800">
              <button
                onClick={() => handleAddToTimeline(selectedEvent)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add to Security Timeline</span>
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 font-bold rounded-xl text-xs hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
