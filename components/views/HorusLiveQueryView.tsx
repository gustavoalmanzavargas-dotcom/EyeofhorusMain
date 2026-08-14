import React, { useState, useEffect } from 'react';
import { 
  Terminal, Play, Server, Shield, CheckCircle, RefreshCw, 
  Layers, Download, Filter, Code, Cpu, Database, Zap
} from 'lucide-react';
import { PageHeader, Card } from '../UI';
import { api } from '../../services/api';
import { LiveQueryPack, LiveQueryResult } from '../../types';

export const HorusLiveQueryView: React.FC = () => {
  const [queryPacks, setQueryPacks] = useState<LiveQueryPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<LiveQueryPack | null>(null);
  const [sqlInput, setSqlInput] = useState<string>(
    'SELECT pid, name, path, cmdline, uid FROM processes WHERE name IN ("powershell.exe", "cmd.exe", "vssadmin.exe", "rundll32.exe");'
  );
  const [targetHosts, setTargetHosts] = useState<string[]>(['win-dc-primary', 'ubuntu-web-prod']);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<LiveQueryResult | null>(null);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      const packs = await api.getLiveQueryPacks();
      setQueryPacks(packs);
      if (packs.length > 0) {
        setSelectedPack(packs[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectPack = (pack: LiveQueryPack) => {
    setSelectedPack(pack);
    setSqlInput(pack.sqlQuery);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const res = await api.executeLiveQuery(sqlInput, targetHosts);
      setQueryResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  const toggleHost = (host: string) => {
    if (targetHosts.includes(host)) {
      if (targetHosts.length > 1) {
        setTargetHosts(targetHosts.filter(h => h !== host));
      }
    } else {
      setTargetHosts([...targetHosts, host]);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="HORUS LIVE QUERY — Real-Time Fleet Osquery Interrogation Engine">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 disabled:opacity-50 transition-all"
          >
            {isExecuting ? <RefreshCw className="animate-spin" size={13} /> : <Play size={13} />}
            <span>Execute Across Fleet ({targetHosts.length} Hosts)</span>
          </button>
        </div>
      </PageHeader>

      {/* Query Packs Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {queryPacks.map((pack) => (
          <div
            key={pack.id}
            onClick={() => handleSelectPack(pack)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedPack?.id === pack.id
                ? 'bg-indigo-600/10 border-indigo-500 shadow-md'
                : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-indigo-500 mb-1">
              <span className="font-bold">{pack.targetCategory}</span>
              <span>Every {pack.defaultIntervalSeconds}s</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pack.name}</h4>
            <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 line-clamp-2">{pack.description}</p>
          </div>
        ))}
      </div>

      {/* Target Scope & SQL Console */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-gray-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900/80 border-b border-gray-800 text-xs font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-emerald-400" />
                <span className="font-bold text-gray-200 uppercase tracking-widest text-[10px]">Osquery SQL Interrogation Terminal</span>
              </div>
              <div className="text-[11px] text-gray-500">Engine: Osquery v5.11 / eBPF Live</div>
            </div>

            <div className="p-4">
              <textarea
                value={sqlInput}
                onChange={(e) => setSqlInput(e.target.value)}
                rows={5}
                className="w-full bg-transparent font-mono text-xs text-emerald-400 leading-relaxed focus:outline-none resize-none"
                spellCheck={false}
              />
            </div>

            <div className="px-4 py-2 bg-gray-900/40 border-t border-gray-800/80 flex flex-wrap items-center gap-2 text-[10px] font-mono text-gray-400">
              <span className="text-gray-500 font-bold uppercase">Target Tables:</span>
              {['processes', 'process_open_sockets', 'listening_ports', 'users', 'startup_items', 'scheduled_tasks', 'shadow_copies'].map((tbl) => (
                <button
                  key={tbl}
                  onClick={() => setSqlInput(prev => prev + `\nSELECT * FROM ${tbl} LIMIT 20;`)}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-emerald-600 hover:text-white rounded border border-gray-700 text-gray-300 transition-colors"
                >
                  {tbl}
                </button>
              ))}
            </div>
          </div>

          {/* Results Table */}
          {queryResult && (
            <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl space-y-2">
              <div className="px-4 py-3 bg-slate-100 dark:bg-gray-950 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {queryResult.rows.length} Fleet Rows Returned ({queryResult.status})
                </span>
                <span className="text-slate-400">Queried at {queryResult.executedAt}</span>
              </div>

              <div className="overflow-x-auto p-2">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 dark:bg-gray-900 text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">
                    <tr>
                      {Object.keys(queryResult.rows[0] || {}).map((col) => (
                        <th key={col} className="py-2 px-3">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                    {queryResult.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-gray-800/40">
                        {Object.values(row).map((val: any, vIdx) => (
                          <td key={vIdx} className="py-2 px-3 text-slate-700 dark:text-gray-300">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Target Fleet Selection */}
        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Server size={14} className="text-indigo-500" /> Target Endpoint Scope
            </h4>

            <div className="space-y-2">
              {[
                { name: 'win-dc-primary', ip: '10.0.1.10', os: 'Windows Server 2022' },
                { name: 'ubuntu-web-prod', ip: '10.0.2.15', os: 'Ubuntu 24.04 LTS' },
                { name: 'k8s-worker-04', ip: '10.0.3.50', os: 'Debian 12' },
                { name: 'macbook-ciso-01', ip: '10.0.4.12', os: 'macOS Sequoia' }
              ].map((h) => (
                <div
                  key={h.name}
                  onClick={() => toggleHost(h.name)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                    targetHosts.includes(h.name)
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-900 dark:text-emerald-200'
                      : 'bg-slate-50 dark:bg-gray-950 border-slate-200 dark:border-gray-800 text-slate-500 opacity-60'
                  }`}
                >
                  <div>
                    <div className="font-bold">{h.name}</div>
                    <div className="text-[10px] font-mono opacity-80">{h.ip} • {h.os}</div>
                  </div>
                  <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                    targetHosts.includes(h.name) ? 'bg-emerald-600 text-white' : 'border border-slate-400'
                  }`}>
                    {targetHosts.includes(h.name) && '✓'}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
