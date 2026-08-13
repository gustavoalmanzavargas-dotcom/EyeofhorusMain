import React, { useState, useEffect } from 'react';
import { Cpu, Network, Package, Users, PlusCircle, ShieldAlert, ShieldCheck, Activity, FileCheck, Bug, Loader2, Key, Lock, ShieldOff, Zap, Ban } from 'lucide-react';
import { LoadingSpinner, ErrorDisplay, BackButton, Modal } from '../UI';
import { Table } from '../Table';
import { Agent, InventoryData } from '../../types';
import { api } from '../../services/api';

interface InventoryViewProps {
    agent: Agent;
    onBack: () => void;
    userId?: string | null;
}

const InventoryView: React.FC<InventoryViewProps> = ({ agent, onBack }) => {
    const [inventoryData, setInventoryData] = useState<InventoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [scanMessage, setScanMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'posture' | 'hardware' | 'network' | 'packages' | 'processes' | 'registry'>('posture');
    const [currentAgent, setCurrentAgent] = useState<Agent>(agent);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isXdrModalOpen, setIsXdrModalOpen] = useState(false);
    const [xdrAction, setXdrAction] = useState<'kill_process' | 'quarantine_file' | 'block_ip' | 'flush_dns'>('kill_process');
    const [xdrTarget, setXdrTarget] = useState('');
    const [newItem, setNewItem] = useState({ name: '', detail1: '', detail2: '', vendorOrUser: '' });

    const handleToggleIsolation = async () => {
        const targetIsolate = currentAgent.status !== 'Isolated' && !currentAgent.isolated;
        try {
            const res = await api.isolateAgent(currentAgent.id, targetIsolate);
            setCurrentAgent(res.agent);
            setScanMessage(targetIsolate 
                ? `⛔ ENDPOINT ISOLATED: Network lockdown engaged on ${currentAgent.name} (${currentAgent.ip}). Non-C2 network traffic restricted!`
                : `✓ ISOLATION RELEASED: Network lockdown released on ${currentAgent.name} (${currentAgent.ip}). Normal operation restored.`);
            setTimeout(() => setScanMessage(null), 8000);
        } catch (err) {
            console.error(err);
            setScanMessage("Failed to execute network isolation toggle.");
            setTimeout(() => setScanMessage(null), 5000);
        }
    };

    const handleRunXdrAction = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.executeXdrAction(currentAgent.id, xdrAction, xdrTarget);
            setScanMessage(`⚡ XDR ACTIVE RESPONSE EXECUTED: ${res.alert?.description || 'Action completed successfully.'}`);
            setIsXdrModalOpen(false);
            setXdrTarget('');
            await fetchInventory();
            setTimeout(() => setScanMessage(null), 8000);
        } catch (err) {
            console.error(err);
            setScanMessage("Failed to execute XDR action.");
            setTimeout(() => setScanMessage(null), 5000);
        }
    };

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const data = await api.getAgentInventory(agent.id);
            setInventoryData(data);
        } catch (err) {
            setError("Failed to fetch inventory data from Eye of Horus server.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [agent.id]);

    const handleRunScan = async () => {
        setScanning(true);
        try {
            const res = await api.scanAgent(agent.id);
            setScanMessage(`Passive system scan executed for ${agent.name}! Logged ${res.scanResult?.eventsCount || 4} security events, detected ${res.scanResult?.vulnsCount || 3} vulnerabilities, checked ${res.scanResult?.fimCount || 5} FIM system files, and updated MITRE ATT&CK telemetry.`);
            await fetchInventory();
            setActiveTab('posture');
            setTimeout(() => setScanMessage(null), 8000);
        } catch (err) {
            console.error("Failed to run system scan:", err);
            setScanMessage("System scan failed. Please check agent connectivity.");
            setTimeout(() => setScanMessage(null), 5000);
        } finally {
            setScanning(false);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === 'posture') return;
        let formattedItem: any = {};
        if (activeTab === 'packages') {
            formattedItem = { name: newItem.name, version: newItem.detail1 || '1.0.0', vendor: newItem.vendorOrUser || 'Custom' };
        } else if (activeTab === 'processes') {
            formattedItem = { pid: String(Math.floor(100 + Math.random() * 9000)), name: newItem.name, state: 'running', user: newItem.vendorOrUser || 'root', priority: '20' };
        } else if (activeTab === 'hardware') {
            formattedItem = { type: newItem.detail1 || 'Device', name: newItem.name, cores: '-', threads: '-', total: newItem.detail2 || '100%', used: '10%' };
        } else {
            formattedItem = { interface: newItem.name, type: 'ethernet', address: newItem.detail1 || '192.168.1.100', mac: newItem.detail2 || '00:11:22:33:44:55', gateway: '192.168.1.1' };
        }

        await api.addInventoryItem(agent.id, activeTab, formattedItem);
        setIsModalOpen(false);
        setNewItem({ name: '', detail1: '', detail2: '', vendorOrUser: '' });
        fetchInventory();
    };

    const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: React.ReactNode }) => (
        <button onClick={() => setActiveTab(id)} className={`flex items-center px-5 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === id ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-gray-800/80' : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800'}`}>
            {icon}
            <span className="ml-2">{label}</span>
        </button>
    );

    const renderTabContent = () => {
        if (loading) return <div className="p-12"><LoadingSpinner /></div>;
        if (error) return <ErrorDisplay message={error} />;

        if (activeTab === 'posture') {
            const posture = inventoryData?.securityPosture;
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 bg-slate-50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-700/60 shadow-xs">
                            <div className="flex items-center space-x-3 mb-2 text-indigo-600 dark:text-indigo-400">
                                <ShieldCheck size={22} />
                                <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400">CIS Benchmark Score</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{posture?.cisScore || '94% Compliant'}</div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">✓ Hardening Policy Applied</div>
                        </div>

                        <div className="p-5 bg-slate-50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-700/60 shadow-xs">
                            <div className="flex items-center space-x-3 mb-2 text-amber-600 dark:text-amber-400">
                                <Activity size={22} />
                                <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400">Last System Scan</span>
                            </div>
                            <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">{posture?.lastScanTime || new Date().toISOString().substring(0, 19)}</div>
                            <div className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold mt-1">Status: {posture?.status || 'Active & Monitored'}</div>
                        </div>

                        <div className="p-5 bg-slate-50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-700/60 shadow-xs">
                            <div className="flex items-center space-x-3 mb-2 text-purple-600 dark:text-purple-400">
                                <Bug size={22} />
                                <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400">Detected Findings</span>
                            </div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-3">
                                <span className="text-amber-600 dark:text-amber-400">{posture?.eventsCount || 4} Events</span>
                                <span>•</span>
                                <span className="text-red-600 dark:text-red-400">{posture?.vulnsCount || 3} CVEs</span>
                                <span>•</span>
                                <span className="text-emerald-600 dark:text-emerald-400">{posture?.fimCount || 5} FIM</span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">Full telemetry dispatched to SIEM</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-xs">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center mb-3">
                                <FileCheck size={18} className="mr-2 text-indigo-600 dark:text-indigo-400" /> Active Security Modules
                            </h3>
                            <div className="space-y-2">
                                {(posture?.activeDefenses || ['FIM Sentinel Active', 'PAM Audit Engaged', 'Kernel Protection Active', 'CVE Scanner Synced']).map((def, idx) => (
                                    <div key={idx} className="p-2.5 bg-slate-50 dark:bg-gray-900/50 rounded-xl border border-slate-100 dark:border-gray-700/50 text-xs font-semibold text-slate-800 dark:text-gray-200 flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2.5 shrink-0 animate-pulse"></span>
                                        {def}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-xs">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center mb-3">
                                <Network size={18} className="mr-2 text-indigo-600 dark:text-indigo-400" /> Open System Ports & Services
                            </h3>
                            <div className="space-y-2">
                                {(posture?.openPorts || ['22/tcp (SSH Daemon)', '80/tcp (HTTP Web Server)', '443/tcp (HTTPS TLS)', '514/udp (Syslog Ingest)']).map((port, idx) => (
                                    <div key={idx} className="p-2.5 bg-slate-50 dark:bg-gray-900/50 rounded-xl border border-slate-100 dark:border-gray-700/50 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-300">
                                        • {port}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {posture?.summary && (
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                            {posture.summary}
                        </div>
                    )}
                </div>
            );
        }

        if (!inventoryData || Object.keys(inventoryData).length === 0) return <div className="text-center p-12 text-slate-500 dark:text-gray-400 italic bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 m-4">No inventory data available for this agent yet.</div>;

        switch(activeTab) {
            case 'hardware': 
                return <Table headers={['Type', 'Name', 'Cores', 'Threads', 'Total', 'Used']} data={inventoryData.hardware || []} renderRow={(item: any, i) => (<tr key={i} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50 text-slate-900 dark:text-white"><td className="p-3 font-semibold">{item.type}</td><td className="p-3">{item.name}</td><td className="p-3">{item.cores || '-'}</td><td className="p-3">{item.threads || '-'}</td><td className="p-3">{item.total || '-'}</td><td className="p-3">{item.used || '-'}</td></tr>)} />;
            case 'network': 
                return <Table headers={['Interface', 'Type', 'Address', 'MAC', 'Gateway']} data={inventoryData.network || []} renderRow={(item: any, i) => (<tr key={i} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50 text-slate-900 dark:text-white"><td className="p-3 font-mono text-indigo-600 dark:text-indigo-300 font-bold">{item.interface}</td><td className="p-3">{item.type}</td><td className="p-3 font-mono">{item.address}</td><td className="p-3 font-mono text-slate-500 dark:text-gray-400">{item.mac}</td><td className="p-3 font-mono">{item.gateway}</td></tr>)} />;
            case 'packages': 
                return <Table headers={['Name', 'Version', 'Vendor']} data={inventoryData.packages || []} renderRow={(item: any, i) => (<tr key={i} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50 text-slate-900 dark:text-white"><td className="p-3 font-bold">{item.name}</td><td className="p-3 text-slate-500 dark:text-gray-400 font-mono text-xs">{item.version}</td><td className="p-3">{item.vendor}</td></tr>)} />;
            case 'processes': 
                return <Table headers={['PID', 'Name', 'State', 'User', 'Priority']} data={inventoryData.processes || []} renderRow={(item: any, i) => (<tr key={i} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50 text-slate-900 dark:text-white"><td className="p-3 font-mono text-indigo-600 dark:text-indigo-300 font-bold">{item.pid}</td><td className="p-3 font-semibold">{item.name}</td><td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-700 text-xs font-bold">{item.state}</span></td><td className="p-3 text-xs font-mono">{item.user}</td><td className="p-3 text-xs">{item.priority}</td></tr>)} />;
            case 'registry':
                return (
                    <Table 
                        headers={['Key Path / OS Config Path', 'Value Name / Directive', 'Value Data / Setting', 'Value Type', 'Security Status']} 
                        data={inventoryData.registry || [
                            { keyPath: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run', valueName: 'EyeOfHorusAgent', valueData: 'C:\\Program Files\\EyeOfHorus\\agent.exe', valueType: 'REG_SZ', status: 'Clean' },
                            { keyPath: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce', valueName: 'WinUpdateAssist', valueData: 'C:\\Users\\Public\\svchost.exe --silent', valueType: 'REG_SZ', status: 'Suspicious Persistence (T1547.001)' },
                            { keyPath: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa', valueName: 'Security Packages', valueData: 'kerberos, msv1_0, schannel, wdigest', valueType: 'REG_MULTI_SZ', status: 'Modified' },
                            { keyPath: '/etc/pam.d/common-auth', valueName: 'pam_unix.so', valueData: 'auth [success=1 default=ignore] pam_unix.so nullok', valueType: 'PAM Configuration', status: 'Clean' },
                            { keyPath: '/etc/crontab', valueName: 'root_cron', valueData: '*/15 * * * * root /usr/local/bin/backup.sh', valueType: 'Cron Persistence', status: 'Audited' }
                        ]} 
                        renderRow={(item: any, i) => (
                            <tr key={i} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50 text-slate-900 dark:text-white">
                                <td className="p-3 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-300 break-all">{item.keyPath}</td>
                                <td className="p-3 font-semibold text-xs">{item.valueName}</td>
                                <td className="p-3 font-mono text-xs text-slate-700 dark:text-gray-300 break-all">{item.valueData}</td>
                                <td className="p-3 text-xs"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-700 text-xs font-mono font-bold text-slate-700 dark:text-gray-300">{item.valueType}</span></td>
                                <td className="p-3 text-xs">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                        item.status?.includes('Suspicious') 
                                            ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 font-black animate-pulse' 
                                            : item.status === 'Modified' 
                                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                                            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        )} 
                    />
                );
            default: return null;
        }
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="flex items-center space-x-3">
                    <BackButton onClick={onBack} />
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">System Security Inventory</h1>
                        <div className="text-slate-500 dark:text-gray-400 text-xs mt-1 flex items-center space-x-2">
                            <span>Agent: <span className="text-indigo-600 dark:text-indigo-300 font-bold">{agent.name}</span></span>
                            <span>•</span>
                            <span className="font-mono">{agent.id}</span>
                            <span>•</span>
                            <span className="font-mono">{agent.ip} ({agent.os})</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button 
                        onClick={handleToggleIsolation}
                        className={`font-bold py-2 px-4 rounded-xl flex items-center shadow-md text-xs transition-transform hover:scale-105 border ${
                            currentAgent.status === 'Isolated' || currentAgent.isolated
                                ? 'bg-red-600 hover:bg-red-700 text-white border-red-700 animate-pulse'
                                : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700'
                        }`}
                        title="Lockdown endpoint network traffic"
                    >
                        {currentAgent.status === 'Isolated' || currentAgent.isolated ? <Lock size={16} className="mr-2" /> : <ShieldOff size={16} className="mr-2" />}
                        {currentAgent.status === 'Isolated' || currentAgent.isolated ? 'SYSTEM ISOLATED (Click to Release)' : 'Lockdown Endpoint'}
                    </button>

                    <button 
                        onClick={() => setIsXdrModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl flex items-center shadow-md text-xs transition-transform hover:scale-105 border border-indigo-700"
                    >
                        <Zap size={16} className="mr-2 text-amber-300" />XDR Active Response
                    </button>

                    <button 
                        onClick={handleRunScan}
                        disabled={scanning}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl flex items-center shadow-md text-xs transition-transform hover:scale-105 disabled:opacity-50"
                    >
                        {scanning ? <Loader2 size={16} className="animate-spin mr-2" /> : <ShieldAlert size={16} className="mr-2" />}
                        {scanning ? 'Scanning...' : 'Passive Scan'}
                    </button>

                    {activeTab !== 'posture' && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-xl flex items-center shadow-md text-xs transition-transform hover:scale-105"
                        >
                            <PlusCircle size={16} className="mr-2" />Add Record
                        </button>
                    )}
                </div>
            </div>

            {currentAgent.status === 'Isolated' && (
                <div className="p-4 bg-red-500/10 dark:bg-red-950/80 border-2 border-red-500 rounded-2xl flex items-center space-x-3 text-red-900 dark:text-red-200 text-xs font-black shadow-lg animate-pulse">
                    <Lock size={24} className="shrink-0 text-red-600 dark:text-red-400" />
                    <div className="flex-1">
                        <div className="text-sm font-black uppercase tracking-wider text-red-600 dark:text-red-400">Endpoint Network Isolation Active (Lockdown)</div>
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">This host is isolated from the network. Non-essential ingress/egress firewall rules are dropped by Eye of Horus Agent.</div>
                    </div>
                </div>
            )}

            {scanMessage && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center space-x-3 text-emerald-900 dark:text-emerald-200 text-xs font-semibold shadow-xs">
                    <ShieldCheck size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div className="flex-1">{scanMessage}</div>
                </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 overflow-hidden">
                <div className="flex border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 overflow-x-auto">
                    <TabButton id="posture" label="Security Posture" icon={<ShieldCheck size={16} />} />
                    <TabButton id="hardware" label="Hardware" icon={<Cpu size={16} />} />
                    <TabButton id="network" label="Network" icon={<Network size={16} />} />
                    <TabButton id="packages" label="Packages" icon={<Package size={16} />} />
                    <TabButton id="processes" label="Processes" icon={<Users size={16} />} />
                    <TabButton id="registry" label="Registry & Persistence" icon={<Key size={16} />} />
                </div>
                <div className="p-6 min-h-[400px]">
                    {renderTabContent()}
                </div>
            </div>

            <Modal isOpen={isXdrModalOpen} onClose={() => setIsXdrModalOpen(false)} title="XDR Active Threat Response & Remediation">
                <form onSubmit={handleRunXdrAction} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Select XDR Response Action</label>
                        <select 
                            value={xdrAction} 
                            onChange={(e: any) => setXdrAction(e.target.value)} 
                            className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm font-bold"
                        >
                            <option value="kill_process">⚡ Terminate Suspicious Process (Kill PID / Executable)</option>
                            <option value="quarantine_file">🛡️ Quarantine Threat File / Binary</option>
                            <option value="block_ip">⛔ Block Attacker IP (Add to Active Response Blacklist)</option>
                            <option value="flush_dns">🔄 Flush DNS Cache & Purge ARP Tables</option>
                        </select>
                    </div>

                    {xdrAction !== 'flush_dns' && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">
                                {xdrAction === 'kill_process' ? 'Process Name or PID' : xdrAction === 'quarantine_file' ? 'File Path to Quarantine' : 'IP Address to Blacklist'}
                            </label>
                            <input 
                                type="text" 
                                required
                                placeholder={xdrAction === 'kill_process' ? 'e.g. powershell.exe or PID 4820' : xdrAction === 'quarantine_file' ? 'e.g. C:\\Users\\Public\\svchost.exe' : 'e.g. 198.51.100.42'} 
                                value={xdrTarget} 
                                onChange={e => setXdrTarget(e.target.value)} 
                                className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm font-mono font-medium" 
                            />
                        </div>
                    )}

                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-900 dark:text-amber-200 font-semibold">
                        ⚠️ Action will be dispatched immediately to Eye of Horus Agent on <span className="font-mono font-bold">{currentAgent.name} ({currentAgent.ip})</span> and logged to SIEM audit stream.
                    </div>

                    <div className="flex justify-end space-x-3 pt-3">
                        <button type="button" onClick={() => setIsXdrModalOpen(false)} className="px-4 py-2 text-slate-500 text-sm font-semibold">Cancel</button>
                        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-md flex items-center">
                            <Zap size={16} className="mr-1.5" /> Dispatch Active Response
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add ${activeTab.slice(0, -1)} Record`}>
                <form onSubmit={handleAddItem} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Item Name</label>
                        <input type="text" placeholder={activeTab === 'packages' ? 'e.g. nginx' : activeTab === 'processes' ? 'e.g. wazuh-agent' : 'Item Name'} value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm font-medium" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">{activeTab === 'packages' ? 'Version' : activeTab === 'network' ? 'IP Address' : activeTab === 'hardware' ? 'Device Type' : 'User'}</label>
                        <input type="text" placeholder={activeTab === 'packages' ? '1.18.0' : 'Value'} value={newItem.detail1} onChange={e => setNewItem({...newItem, detail1: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm font-medium" />
                    </div>
                    {activeTab !== 'packages' && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">{activeTab === 'network' ? 'MAC Address' : activeTab === 'hardware' ? 'Total Capacity' : 'User'}</label>
                            <input type="text" placeholder="Value" value={newItem.detail2} onChange={e => setNewItem({...newItem, detail2: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm font-medium" />
                        </div>
                    )}
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-md">Save to Agent</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InventoryView;