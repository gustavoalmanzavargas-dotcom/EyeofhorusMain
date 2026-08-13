import React, { useState, useEffect } from 'react';
import { 
  Shield, CheckCircle, XCircle, AlertTriangle, RefreshCw, FileCode, Download,
  Lock, Zap, ShieldAlert, Globe, Database, Search, PlusCircle, Trash2, Eye, Cpu, Terminal
} from 'lucide-react';
import { PageHeader, Modal, Card } from '../UI';
import { Table } from '../Table';
import { api } from '../../services/api';
import { ScaPolicy, PersistentFoothold, RansomwareCanary, DnsQueryLog, ThreatIntelHash } from '../../types';

// =========================================================================
// 1. WAZUH SCA (SECURITY CONFIGURATION ASSESSMENT) CIS BENCHMARKS VIEW
// =========================================================================
export const ScaView: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const [policies, setPolicies] = useState<ScaPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<any | null>(null);

  const fetchSca = async () => {
    try {
      const res = await api.getScaPolicies();
      setPolicies(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSca();
  }, []);

  const handleRunScaScan = async () => {
    setScanning(true);
    try {
      const res = await api.runScaScan();
      setPolicies(res.scaPolicies);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  const handleExportWazuhXml = () => {
    window.open('/api/wazuh/rules/export', '_blank');
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="Wazuh SCA - CIS Hardening & Security Configuration Assessment">
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportWazuhXml} 
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-xl flex items-center shadow-md text-xs transition-transform hover:scale-105"
          >
            <Download size={16} className="mr-2 text-indigo-400" /> Export Wazuh XML Rules
          </button>

          <button 
            onClick={handleRunScaScan} 
            disabled={scanning}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-xl flex items-center shadow-lg text-xs transition-transform hover:scale-105 disabled:opacity-50"
          >
            <RefreshCw size={16} className={`mr-2 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Running SCA Audit...' : 'Re-Run CIS Benchmark Scan'}
          </button>
        </div>
      </PageHeader>

      {/* SCA Policy Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.map((pol) => (
          <div key={pol.id} className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">{pol.benchmark} • {pol.targetOS}</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{pol.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{pol.scoreRatio}%</span>
                <span className="block text-[10px] text-slate-400 uppercase font-bold">CIS Compliance Ratio</span>
              </div>
            </div>

            {/* Compliance Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-gray-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 dark:border-gray-700 flex">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${pol.scoreRatio}%` }} />
              <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${100 - pol.scoreRatio}%` }} />
            </div>

            <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-100 dark:border-gray-700/60">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center"><CheckCircle size={14} className="mr-1" /> {pol.passCount} Controls Passed</span>
              <span className="text-red-600 dark:text-red-400 flex items-center"><XCircle size={14} className="mr-1" /> {pol.failCount} Hardening Deficiencies</span>
            </div>
          </div>
        ))}
      </div>

      {/* SCA Checks Detail Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-xl p-6 space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">SCA Control Audit Log</h3>
        
        <Table<any>
          headers={['CIS Control ID', 'Security Control Title', 'Target Host', 'Status', 'Remediation Action']}
          data={policies.flatMap(p => p.checks)}
          renderRow={(check) => (
            <tr key={check.id} className="border-b border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => setSelectedCheck(check)}>
              <td className="p-3 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{check.cisControl}</td>
              <td className="p-3 text-xs font-bold text-slate-900 dark:text-gray-200">{check.title}</td>
              <td className="p-3 text-xs font-mono font-bold text-indigo-500">{check.agentName}</td>
              <td className="p-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center w-max ${
                  check.result === 'PASSED' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                }`}>
                  {check.result === 'PASSED' ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                  {check.result}
                </span>
              </td>
              <td className="p-3 text-xs font-mono text-slate-600 dark:text-gray-300 truncate max-w-xs">{check.remediation}</td>
            </tr>
          )}
        />
      </div>

      {/* Control Detail Modal */}
      <Modal isOpen={!!selectedCheck} onClose={() => setSelectedCheck(null)} title="CIS Security Control Audit Details">
        {selectedCheck && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">Control ID: {selectedCheck.cisControl}</span>
                <span className={`px-2.5 py-1 rounded-full font-bold ${selectedCheck.result === 'PASSED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'}`}>
                  {selectedCheck.result}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{selectedCheck.title}</h4>
              <p className="text-slate-600 dark:text-gray-300 pt-1">{selectedCheck.rationale}</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Recommended CIS Remediation Command</label>
              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                {selectedCheck.remediation}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedCheck(null)} className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-md">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// =========================================================================
// 2. HUNTRESS EDR: PERSISTENT FOOTHOLDS & RANSOMWARE CANARY TRAPS VIEW
// =========================================================================
export const HuntressView: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'footholds' | 'canaries'>('footholds');
  const [footholds, setFootholds] = useState<PersistentFoothold[]>([]);
  const [canaries, setCanaries] = useState<RansomwareCanary[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [fh, cn] = await Promise.all([
        api.getPersistentFootholds(),
        api.getRansomwareCanaries()
      ]);
      setFootholds(fh);
      setCanaries(cn);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQuarantineFoothold = async (id: string) => {
    try {
      const res = await api.quarantineFoothold(id);
      setActionMessage(`✅ Foothold ${res.foothold.executablePath} successfully purged and quarantined.`);
      fetchData();
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerCanaryTest = async (id: string) => {
    try {
      const res = await api.triggerCanaryTest(id);
      setActionMessage(`🚨 CANARY TRIGGERED! Endpoint ${res.canary.agentName} network isolated and ransomware process killed.`);
      fetchData();
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="Huntress EDR - Persistent Footholds & Ransomware Canary Traps" />

      {actionMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center space-x-3 text-emerald-900 dark:text-emerald-200 text-xs font-bold shadow-md animate-fade-in">
          <Zap size={18} className="text-amber-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-gray-800 pb-2">
        <button 
          onClick={() => setActiveTab('footholds')} 
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center transition-all ${
            activeTab === 'footholds' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-100'
          }`}
        >
          <Search size={16} className="mr-2" /> Persistent Footholds ({footholds.length})
        </button>
        <button 
          onClick={() => setActiveTab('canaries')} 
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center transition-all ${
            activeTab === 'canaries' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert size={16} className="mr-2" /> Ransomware Canary Traps ({canaries.length})
        </button>
      </div>

      {activeTab === 'footholds' ? (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-gray-300 font-medium">
            Huntress Persistent Foothold Inspector scans Windows Registry Run keys, Scheduled Tasks, Startup Folders, and Linux Cron / Systemd units for hidden malware mechanisms.
          </p>

          <Table<PersistentFoothold>
            headers={['Host Agent', 'Mechanism & Location', 'Target Executable Path', 'Threat Score', 'MITRE Technique', 'Action']}
            data={footholds}
            renderRow={(fh) => (
              <tr key={fh.id} className="border-b border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{fh.agentName}</td>
                <td className="p-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">{fh.mechanism}</span>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-gray-400">{fh.location}</span>
                </td>
                <td className="p-3 font-mono text-xs text-red-600 dark:text-red-400 font-bold">{fh.executablePath}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                    fh.threatScore > 70 ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 animate-pulse' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    Score: {fh.threatScore}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs text-indigo-500 font-bold">{fh.mitreTechnique}</td>
                <td className="p-3">
                  {fh.status !== 'Quarantined' ? (
                    <button 
                      onClick={() => handleQuarantineFoothold(fh.id)} 
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center shadow-xs transition-transform hover:scale-105"
                    >
                      <Trash2 size={14} className="mr-1" /> Quarantine Foothold
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic font-bold">Purged & Secured</span>
                  )}
                </td>
              </tr>
            )}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-gray-300 font-medium">
            Ransomware Canary Traps deploy honeypot files across strategic file directories. If any unauthorized process or ransomware attempts to encrypt or alter canary files, Eye of Horus triggers instant process termination and host network lockdown.
          </p>

          <Table<RansomwareCanary>
            headers={['Host Agent', 'Honeypot Trap File Path', 'Trap Type', 'Status', 'Last Verification', 'Simulation Test']}
            data={canaries}
            renderRow={(cn) => (
              <tr key={cn.id} className="border-b border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{cn.agentName}</td>
                <td className="p-3 font-mono text-xs font-bold text-slate-900 dark:text-white break-all">{cn.filePath}</td>
                <td className="p-3 text-xs text-slate-600 dark:text-gray-300 font-semibold">{cn.fileType}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                    cn.status.includes('Tampered') 
                      ? 'bg-red-600 text-white animate-pulse' 
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {cn.status}
                  </span>
                </td>
                <td className="p-3 text-xs font-mono text-slate-500">{cn.lastChecked}</td>
                <td className="p-3">
                  <button 
                    onClick={() => handleTriggerCanaryTest(cn.id)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center shadow-xs transition-transform hover:scale-105"
                  >
                    <Zap size={14} className="mr-1" /> Simulate Attack
                  </button>
                </td>
              </tr>
            )}
          />
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 3. WEBROOT SHIELD: WEB THREAT SHIELD, DNS FILTER & THREAT INTEL HASH DB VIEW
// =========================================================================
export const WebrootShieldView: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'dns' | 'threatIntel'>('dns');
  const [dnsLogs, setDnsLogs] = useState<DnsQueryLog[]>([]);
  const [threatHashes, setThreatHashes] = useState<ThreatIntelHash[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [queryHash, setQueryHash] = useState('');
  const [hashResult, setHashResult] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      const [dns, hashes] = await Promise.all([
        api.getDnsLogs(),
        api.getThreatIntelHashes()
      ]);
      setDnsLogs(dns);
      setThreatHashes(hashes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBlockDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;
    try {
      await api.blockDnsDomain(newDomain.trim(), 'Malicious C2 Domain');
      setNewDomain('');
      fetchData();
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleHashLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryHash) return;
    try {
      const res = await api.lookupThreatHash(queryHash);
      setHashResult(res.threatData);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="Webroot Shield - Web Threat Shield, DNS Filtering & Threat Intel Hash Database" />

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-gray-800 pb-2">
        <button 
          onClick={() => setActiveTab('dns')} 
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center transition-all ${
            activeTab === 'dns' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-100'
          }`}
        >
          <Globe size={16} className="mr-2" /> Web Threat Shield & DNS Protection ({dnsLogs.length})
        </button>
        <button 
          onClick={() => setActiveTab('threatIntel')} 
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center transition-all ${
            activeTab === 'threatIntel' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-100'
          }`}
        >
          <Database size={16} className="mr-2" /> Threat Intelligence File Hash Database ({threatHashes.length})
        </button>
      </div>

      {activeTab === 'dns' ? (
        <div className="space-y-6">
          {/* Add Domain Form */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-xl space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Block Domain on Webroot Web Threat Shield</h3>
            <form onSubmit={handleBlockDomain} className="flex gap-3">
              <input 
                type="text" 
                placeholder="Enter domain or phishing URL (e.g. evil-phishing-site.com)" 
                value={newDomain} 
                onChange={e => setNewDomain(e.target.value)} 
                className="flex-1 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                required 
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center shadow-md">
                <PlusCircle size={16} className="mr-1.5" /> Block Domain Globally
              </button>
            </form>
          </div>

          <Table<DnsQueryLog>
            headers={['Timestamp', 'Endpoint Host', 'Domain Queried', 'Category', 'Shield Filter Action']}
            data={dnsLogs}
            renderRow={(log) => (
              <tr key={log.id} className="border-b border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-3 text-xs font-mono text-slate-400">{log.timestamp}</td>
                <td className="p-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{log.agentName}</td>
                <td className="p-3 font-mono text-xs font-bold text-slate-900 dark:text-white">{log.domain}</td>
                <td className="p-3 text-xs font-semibold text-slate-600 dark:text-gray-300">{log.category}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                    log.action.includes('BLOCKED') 
                      ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300' 
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {log.action}
                  </span>
                </td>
              </tr>
            )}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Lookup Form */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Real-Time Threat Intelligence File Hash Lookup (MD5 / SHA256)</h3>
            <form onSubmit={handleHashLookup} className="flex gap-3">
              <input 
                type="text" 
                placeholder="Paste file MD5 or SHA256 hash (e.g. e4d909c290d0fb1ca068ffaddf22cbd0)" 
                value={queryHash} 
                onChange={e => setQueryHash(e.target.value)} 
                className="flex-1 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                required 
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center shadow-md">
                <Search size={16} className="mr-1.5" /> Lookup Hash
              </button>
            </form>

            {hashResult && (
              <div className="p-4 bg-slate-50 dark:bg-gray-900/80 rounded-2xl border border-slate-200 dark:border-gray-700 space-y-2 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-gray-800 pb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{hashResult.fileName}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    hashResult.reputationScore > 50 ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    Threat Score: {hashResult.reputationScore} / 100
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600 dark:text-gray-300 pt-1">
                  <div>MD5: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{hashResult.md5}</span></div>
                  <div>SHA256: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{hashResult.sha256}</span></div>
                  <div>Classification: <span className="text-slate-900 dark:text-white font-bold">{hashResult.classification}</span></div>
                  <div>First Seen: <span className="text-slate-900 dark:text-white font-bold">{hashResult.firstSeen}</span></div>
                </div>
              </div>
            )}
          </div>

          <Table<ThreatIntelHash>
            headers={['Filename', 'Classification', 'Reputation Score', 'MD5 Hash', 'SHA256 Hash', 'First Discovered']}
            data={threatHashes}
            renderRow={(th) => (
              <tr key={th.id} className="border-b border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-3 text-xs font-bold text-slate-900 dark:text-white">{th.fileName}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    th.classification.includes('Malicious') || th.classification.includes('Trojan') 
                      ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300' 
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {th.classification}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">{th.reputationScore} / 100</td>
                <td className="p-3 font-mono text-[11px] text-slate-500">{th.md5}</td>
                <td className="p-3 font-mono text-[11px] text-slate-500 truncate max-w-xs">{th.sha256}</td>
                <td className="p-3 text-xs text-slate-400 font-mono">{th.firstSeen}</td>
              </tr>
            )}
          />
        </div>
      )}
    </div>
  );
};
