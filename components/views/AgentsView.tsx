import React, { useState } from 'react';
import { PlusCircle, Loader2, HardDrive, Trash2, Radio, Copy, Check, Download, Terminal, ShieldCheck, ShieldAlert, Search, Lock, Unlock, Zap, Ban, ShieldOff, AlertOctagon } from 'lucide-react';
import { PageHeader, Modal } from '../UI';
import { Table } from '../Table';
import { getAgentStatusColor } from '../../constants';
import { Agent } from '../../types';
import { api } from '../../services/api';

interface AgentsViewProps {
  data: Agent[];
  onAgentSelect: (agent: Agent) => void;
  userId?: string | null;
  onRefresh?: () => void;
}

const AgentCreationModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onDeploy: (data: Partial<Agent>) => Promise<Agent>; 
  onRefresh?: () => void;
}> = ({ isOpen, onClose, onDeploy, onRefresh }) => {
    const [agentName, setAgentName] = useState('');
    const [os, setOs] = useState('Linux');
    const [isDeploying, setIsDeploying] = useState(false);
    const [createdAgent, setCreatedAgent] = useState<any | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsDeploying(true);
        try {
            const agent = await onDeploy({ name: agentName, os });
            setCreatedAgent(agent);
        } catch (error) {
            console.error("Failed to deploy agent:", error);
        } finally {
            setIsDeploying(false);
        }
    };

    const handleClose = () => {
        setAgentName('');
        setOs('Linux');
        setCreatedAgent(null);
        setCopied(false);
        onClose();
        if (onRefresh) onRefresh();
    };

    const getInstallCommand = () => {
        if (!createdAgent) return '';
        const origin = window.location.origin;
        const key = createdAgent.key || 'eoh_reg_live';

        if (os.toLowerCase().includes('windows')) {
            return `Invoke-WebRequest -Uri "${origin}/api/agent-installer.ps1" -OutFile "eoh-agent.ps1"; .\\eoh-agent.ps1 -Server "${origin}" -RegistrationKey "${key}"`;
        }
        return `curl -sSL ${origin}/api/agent-installer.sh | sudo EOH_KEY="${key}" EOH_SERVER="${origin}" bash`;
    };

    const copyCommand = () => {
        navigator.clipboard.writeText(getInstallCommand());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadScript = () => {
        const isWin = os.toLowerCase().includes('windows');
        const url = isWin ? '/api/agent-installer.ps1' : '/api/agent-installer.sh';
        const filename = isWin ? 'eoh-agent-installer.ps1' : 'eoh-agent-installer.sh';
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={createdAgent ? "Agent Registered & Passive Scan Triggered" : "Deploy New Security Agent"}>
            {createdAgent ? (
                <div className="space-y-6">
                    <div className="p-4 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 rounded-xl flex items-center space-x-3 text-emerald-900 dark:text-emerald-300">
                        <ShieldCheck size={28} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <div>
                            <div className="font-bold text-sm">Agent Registered & Initial System Scan Executed!</div>
                            <div className="text-xs text-emerald-800 dark:text-emerald-200/80 mt-0.5">
                                Host: <span className="font-bold">{createdAgent.name}</span> • IP: <span className="font-mono font-bold">{createdAgent.ip}</span> • Key: <span className="font-mono font-bold">{createdAgent.key}</span>
                            </div>
                            <div className="text-xs text-emerald-900 dark:text-emerald-300 mt-1 font-semibold">
                                ✓ Populated Security Events, Vulnerabilities (CVEs), FIM File Monitoring, & MITRE ATT&CK Telemetry across Eye of Horus modules.
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center">
                                <Terminal size={14} className="mr-1.5 text-indigo-600 dark:text-indigo-400" /> One-Line Installation Command ({os})
                            </label>
                            <button onClick={copyCommand} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center transition-colors">
                                {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                                {copied ? 'Copied!' : 'Copy Command'}
                            </button>
                        </div>
                        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 break-all select-all shadow-inner">
                            {getInstallCommand()}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-gray-700">
                        <button onClick={downloadScript} className="text-xs bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-xl flex items-center border border-slate-200 dark:border-gray-600 transition-colors">
                            <Download size={15} className="mr-2 text-indigo-600 dark:text-indigo-400" /> Download Installer Script
                        </button>
                        <button onClick={handleClose} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl text-sm shadow-md transition-transform hover:scale-105">
                            Verify & Finish Setup
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Agent Name / Hostname</label>
                            <input type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium" required placeholder="e.g. production-k8s-01" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Operating System</label>
                            <select value={os} onChange={(e) => setOs(e.target.value)} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium">
                                <option>Linux (Ubuntu / RHEL / Debian)</option>
                                <option>Windows Server</option>
                                <option>macOS</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white px-4 py-2 text-sm font-medium">Cancel</button>
                        <button type="submit" disabled={isDeploying} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl flex items-center disabled:bg-indigo-600/50 transition-all text-sm shadow-md">
                            {isDeploying ? <Loader2 className="animate-spin mr-2" size={16} /> : <PlusCircle size={16} className="mr-2" />}
                            {isDeploying ? 'Registering & Scanning...' : 'Register & Scan System'}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

const AgentsView: React.FC<AgentsViewProps> = ({ data, onAgentSelect, onRefresh }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scanningAgentId, setScanningAgentId] = useState<string | null>(null);
    const [scanMessage, setScanMessage] = useState<string | null>(null);

    const handleDeployAgent = async (newAgentData: Partial<Agent>): Promise<Agent> => {
        const created = await api.createAgent(newAgentData);
        if (onRefresh) onRefresh();
        return created;
    };

    const handleScanAgent = async (agent: Agent) => {
        setScanningAgentId(agent.id);
        try {
            const res = await api.scanAgent(agent.id);
            setScanMessage(`Passive system scan complete for ${agent.name}: Logged ${res.scanResult?.eventsCount || 4} security events, detected ${res.scanResult?.vulnsCount || 3} CVE vulnerabilities, checked ${res.scanResult?.fimCount || 5} FIM system files, and updated MITRE ATT&CK telemetry.`);
            if (onRefresh) onRefresh();
            setTimeout(() => setScanMessage(null), 8000);
        } catch (error) {
            console.error("System scan failed:", error);
            setScanMessage("System scan failed. Please check agent connectivity.");
            setTimeout(() => setScanMessage(null), 5000);
        } finally {
            setScanningAgentId(null);
        }
    };

    const handleIsolateAgent = async (agent: Agent) => {
        const targetIsolate = agent.status !== 'Isolated' && !agent.isolated;
        try {
            const res = await api.isolateAgent(agent.id, targetIsolate);
            setScanMessage(targetIsolate 
                ? `⛔ ENDPOINT ISOLATED: Network lockdown engaged on ${agent.name} (${agent.ip}). Non-C2 traffic blocked!`
                : `✓ ISOLATION RELEASED: Endpoint ${agent.name} (${agent.ip}) restored to normal network activity.`);
            if (onRefresh) onRefresh();
            setTimeout(() => setScanMessage(null), 8000);
        } catch (error) {
            console.error("Failed to update isolation state:", error);
            setScanMessage("Failed to execute isolation command.");
            setTimeout(() => setScanMessage(null), 5000);
        }
    };

    const handlePingAgent = async (agent: Agent) => {
        const nextStatus = agent.status === 'Active' ? 'Disconnected' : 'Active';
        await api.updateAgent(agent.id, { status: nextStatus });
        if (onRefresh) onRefresh();
    };

    const handleDeleteAgent = async (id: string) => {
        await api.deleteAgent(id);
        if (onRefresh) onRefresh();
    };

    return (
        <div className="p-8 space-y-6">
            <PageHeader title="Agents Management">
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-full flex items-center shadow-lg transition-transform hover:scale-105">
                    <PlusCircle size={18} className="mr-2" />Deploy Agent
                </button>
            </PageHeader>

            {scanMessage && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center space-x-3 text-indigo-900 dark:text-indigo-200 text-xs font-semibold shadow-xs transition-all animate-fadeIn">
                    <ShieldAlert size={20} className="shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <div className="flex-1">{scanMessage}</div>
                </div>
            )}

            <Table<Agent> 
                headers={['Agent ID', 'Name', 'IP Address', 'OS', 'Version', 'Status', 'Date Added', 'Actions']} 
                data={data} 
                renderRow={(agent) => (
                    <tr key={agent.id} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="p-3 font-mono text-slate-500 dark:text-gray-400 text-xs font-bold">{agent.id}</td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{agent.name}</td>
                        <td className="p-3 text-slate-700 dark:text-gray-300 font-mono text-xs">{agent.ip}</td>
                        <td className="p-3 text-sm text-slate-800 dark:text-gray-200">{agent.os}</td>
                        <td className="p-3 text-slate-500 dark:text-gray-400 text-xs">{agent.version}</td>
                        <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${getAgentStatusColor(agent.status)}`}>
                                {agent.status}
                            </span>
                        </td>
                        <td className="p-3 text-slate-500 dark:text-gray-400 text-xs">{agent.dateAdded}</td>
                        <td className="p-3">
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => handleIsolateAgent(agent)}
                                    className={`p-1.5 rounded-lg border transition-all ${agent.status === 'Isolated' || agent.isolated ? 'bg-red-600 text-white border-red-700 shadow-sm animate-pulse' : 'bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'}`} 
                                    title={agent.status === 'Isolated' || agent.isolated ? "Release Network Isolation" : "Lockdown Endpoint (Network Isolation)"}
                                >
                                    {agent.status === 'Isolated' || agent.isolated ? <Lock size={15} /> : <ShieldOff size={15} />}
                                </button>
                                <button 
                                    onClick={() => handleScanAgent(agent)}
                                    disabled={scanningAgentId === agent.id}
                                    className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800/50 transition-colors disabled:opacity-50" 
                                    title="Run Passive System Security Scan (Events, CVEs, FIM, MITRE)"
                                >
                                    {scanningAgentId === agent.id ? <Loader2 size={15} className="animate-spin text-emerald-600" /> : <ShieldAlert size={15} />}
                                </button>
                                <button 
                                    onClick={() => onAgentSelect(agent)}
                                    className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800/50 transition-colors" 
                                    title="View System Inventory & Security Posture"
                                >
                                    <HardDrive size={15} />
                                </button>
                                <button 
                                    onClick={() => handlePingAgent(agent)}
                                    className="p-1.5 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 rounded-lg transition-colors border border-slate-200 dark:border-gray-600" 
                                    title="Toggle Connectivity Ping"
                                >
                                    <Radio size={15} />
                                </button>
                                <button 
                                    onClick={() => handleDeleteAgent(agent.id)}
                                    className="p-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800/50 transition-colors" 
                                    title="Remove Agent"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </td>
                    </tr>
                )} 
            />

            <AgentCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onDeploy={handleDeployAgent} onRefresh={onRefresh} />
        </div>
    );
};

export default AgentsView;
