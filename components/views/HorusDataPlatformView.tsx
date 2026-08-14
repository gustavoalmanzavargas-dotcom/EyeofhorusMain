import React, { useState, useEffect } from 'react';
import { 
  Database, Activity, HardDrive, Layers, Sparkles, CheckCircle, 
  AlertTriangle, RefreshCw, Server, ArrowRight, Code, Download, Shield
} from 'lucide-react';
import { PageHeader, Card, Modal } from '../UI';
import { api } from '../../services/api';
import { LogSourceHealth, DataLifecyclePolicy } from '../../types';

export const HorusDataPlatformView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'health' | 'lifecycle' | 'schema' | 'migration'>('health');
  const [logSources, setLogSources] = useState<LogSourceHealth[]>([]);
  const [lifecycles, setLifecycles] = useState<DataLifecyclePolicy[]>([]);
  const [healthSummary, setHealthSummary] = useState<any>(null);

  // AI Parser state
  const [rawLogInput, setRawLogInput] = useState<string>(
    'Aug 14 14:16:12 win-dc-primary Microsoft-Windows-Security-Auditing[4625]: An account failed to log on. Subject: Security ID: S-1-0-0 Account Name: - Account Domain: - Logon ID: 0x0 Logon Type: 10 Account For Which Logon Failed: Security ID: S-1-0-0 Account Name: admin.root Account Domain: CYVERAX Failure Information: Failure Reason: Unknown user name or bad password. Status: 0xC000006D Sub Status: 0xC000006A Network Information: Workstation Name: WORKSTATION-01 Source Network Address: 185.220.101.45 Source Port: 51240'
  );
  const [isParsing, setIsParsing] = useState(false);
  const [parsedHscJson, setParsedHscJson] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [healthData, lifecycleData] = await Promise.all([
        api.getDataHealth(),
        api.getDataLifecycles()
      ]);
      setLogSources(healthData.sources);
      setHealthSummary(healthData.summary);
      setLifecycles(lifecycleData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleParseRawLog = async () => {
    setIsParsing(true);
    setParsedHscJson(null);
    try {
      const res = await api.parseLogWithAi(rawLogInput);
      setParsedHscJson(res.parsedHsc);
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="DATA MANAGEMENT, INGESTION HEALTH & RETENTION LIFECYCLE">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-gray-900 p-1 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('health')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'health' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-400'
              }`}
            >
              Ingestion Health ({logSources.length} Connectors)
            </button>
            <button
              onClick={() => setActiveTab('lifecycle')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'lifecycle' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-400'
              }`}
            >
              Storage Tiers & Lifecycle
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'schema' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-400'
              }`}
            >
              HSC Schema & AI Log Parser
            </button>
            <button
              onClick={() => setActiveTab('migration')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'migration' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-400'
              }`}
            >
              SIEM Migration & Federated Search
            </button>
          </div>
        </div>
      </PageHeader>

      {activeTab === 'health' ? (
        <div className="space-y-6">
          {healthSummary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Ingestion Rate</div>
                <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {healthSummary.totalEventsPerSec.toLocaleString()} EPS
                </div>
                <div className="text-[11px] text-emerald-500 font-bold">{healthSummary.totalGbPerDay} GB / Day volume</div>
              </Card>
              <Card className="p-4 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Active Ingestion Pipelines</div>
                <div className="text-2xl font-black font-mono text-emerald-500">
                  {healthSummary.activeConnectors} Operational
                </div>
                <div className="text-[11px] text-slate-400">0 dropped buffers</div>
              </Card>
              <Card className="p-4 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Connector Health Status</div>
                <div className="text-2xl font-black font-mono text-red-500">
                  {healthSummary.failingConnectors} Offline
                </div>
                <div className="text-[11px] text-red-400">Legacy Juniper VPN requires reconnection</div>
              </Card>
              <Card className="p-4 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Average Parsing Latency</div>
                <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {healthSummary.avgPipelineLatencyMs} ms
                </div>
                <div className="text-[11px] text-emerald-500 font-bold">Near-Zero Index Lag</div>
              </Card>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-gray-950 border-b border-slate-200 dark:border-gray-800 text-[11px] uppercase tracking-wider font-mono font-bold text-slate-600 dark:text-gray-400">
                <tr>
                  <th className="py-3 px-4">Log Source / Connector</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Rate</th>
                  <th className="py-3 px-4">Daily Volume</th>
                  <th className="py-3 px-4">Queue Depth</th>
                  <th className="py-3 px-4">Parser Errors</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800 font-medium">
                {logSources.map((src) => (
                  <tr key={src.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{src.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">Last received: {src.lastEventTime}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-gray-400">{src.category}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{src.eventsPerSec} EPS</td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-gray-300">{src.gbPerDay} GB/d</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{src.queueDepth}</td>
                    <td className="py-3 px-4 font-mono">
                      {src.parserErrors > 0 ? (
                        <span className="text-red-500 font-bold">{src.parserErrors} errs</span>
                      ) : (
                        <span className="text-emerald-500">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        src.status === 'HEALTHY' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-red-100 dark:bg-red-950 text-red-600'
                      }`}>
                        {src.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'lifecycle' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {lifecycles.map((tier) => (
              <Card key={tier.tier} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full font-black text-xs font-mono ${
                    tier.tier === 'HOT' ? 'bg-red-100 dark:bg-red-950 text-red-600' :
                    tier.tier === 'WARM' ? 'bg-amber-100 dark:bg-amber-950 text-amber-600' :
                    tier.tier === 'COLD' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600' :
                    'bg-purple-100 dark:bg-purple-950 text-purple-600'
                  }`}>
                    {tier.tier} TIER
                  </span>
                  <span className="text-xs font-mono text-slate-400">{tier.retentionDays} Days</span>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{tier.storageMedium}</div>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                    {(tier.currentSizeGb / 1000).toFixed(1)} TB
                  </div>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-gray-800 text-xs font-mono">
                  <div className="flex justify-between text-slate-500">
                    <span>Search Latency:</span>
                    <strong className="text-slate-700 dark:text-gray-300">{tier.searchLatency}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Monthly Tier Cost:</span>
                    <strong className="text-emerald-500">{tier.costMonthly}</strong>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : activeTab === 'schema' ? (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-800">
              <div>
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-500" /> Horus AI-Assisted Log Parser & HSC Normalizer
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  Paste any custom, legacy, or vendor raw log line to automatically extract and map to Horus Security Common Schema (HSC).
                </p>
              </div>
              <button
                onClick={handleParseRawLog}
                disabled={isParsing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all"
              >
                {isParsing ? <RefreshCw className="animate-spin" size={13} /> : <Sparkles size={13} />}
                <span>Parse & Map to HSC</span>
              </button>
            </div>

            <textarea
              value={rawLogInput}
              onChange={(e) => setRawLogInput(e.target.value)}
              rows={3}
              className="w-full p-3 bg-gray-950 text-slate-200 font-mono text-xs rounded-xl border border-gray-800 focus:outline-none focus:border-indigo-500"
              placeholder="Paste raw syslog, CEF, JSON, or text log..."
            />

            {parsedHscJson && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                  <CheckCircle size={14} /> Normalized HSC Output Record (Ready for Ingest)
                </div>
                <pre className="p-4 bg-gray-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto border border-gray-800 max-h-72">
                  {JSON.stringify(parsedHscJson, null, 2)}
                </pre>
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* SIEM MIGRATION & FEDERATED SEARCH TAB */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <RefreshCw size={14} className="text-indigo-500" /> SIEM Query & Detection Rule Transpiler
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                Migrate smoothly from legacy SIEM platforms. Paste your Elasticsearch EQL/KQL, Splunk SPL, or Microsoft Sentinel KQL query to convert it directly into equivalent HQL.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-gray-950 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-mono space-y-2">
                <div className="text-slate-400 text-[10px]">Sample Splunk SPL Conversion:</div>
                <div className="text-slate-700 dark:text-gray-300">index=windows EventCode=4688 Image="*powershell.exe" | stats count by host</div>
                <div className="text-indigo-500 font-bold">↳ Converted to HQL:</div>
                <div className="text-emerald-400">FROM endpoint.events | WHERE process.name == "powershell.exe" | GROUP BY host.name</div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Server size={14} className="text-emerald-500" /> Multi-Tenant & Federated Search Routing
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                Execute cross-cluster queries across hybrid cloud, on-premises datacenters, MSSP client tenants, and remote agent caches with complete data sovereignty.
              </p>
              <div className="space-y-2 text-xs font-mono">
                {['Primary AWS US-East Region (Cluster-01)', 'Azure EU-West GDPR Tenant (Cluster-02)', 'On-Premises High-Security Datacenter (Cluster-03)'].map((cl, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 dark:bg-gray-950 rounded-lg border border-slate-200 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-slate-700 dark:text-gray-300">{cl}</span>
                    <span className="text-emerald-500 font-bold">Connected</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
