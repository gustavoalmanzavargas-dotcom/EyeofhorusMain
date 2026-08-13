import React, { useState } from 'react';
import { PageHeader, Modal, Card } from '../UI';
import { Table } from '../Table';
import { getAlertLevelColor, getSeverityColor } from '../../constants';
import { Alert, Vulnerability, FimEvent, MitreItem } from '../../types';
import { api } from '../../services/api';
import { Plus, Check, ShieldAlert, FileText, Bug, Search, Filter } from 'lucide-react';

export const SecurityEventsView: React.FC<{ data: Alert[]; onRefresh?: () => void }> = ({ data, onRefresh }) => {
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [filterLevel, setFilterLevel] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        description: '',
        rule: 'Custom Security Incident',
        level: 10,
        technique: 'T1059',
        tactic: 'Execution',
        agentName: 'ubuntu-web-prod'
    });

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        await api.createSecurityEvent(newEvent);
        setIsCreateModalOpen(false);
        setNewEvent({ description: '', rule: 'Custom Security Incident', level: 10, technique: 'T1059', tactic: 'Execution', agentName: 'ubuntu-web-prod' });
        if (onRefresh) onRefresh();
    };

    const handleAcknowledge = async (id: string) => {
        await api.deleteSecurityEvent(id);
        setSelectedAlert(null);
        if (onRefresh) onRefresh();
    };

    const filteredData = data.filter(item => {
        const matchesLevel = item.level >= filterLevel;
        const matchesSearch = !searchQuery || 
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.rule?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.agent?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLevel && matchesSearch;
    });

    return (
        <div className="p-8 space-y-6">
            <PageHeader title="Security Events Log">
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-full flex items-center shadow-lg transition-transform hover:scale-105"
                >
                    <Plus size={18} className="mr-2" /> Log Custom Event
                </button>
            </PageHeader>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800/80 p-4 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-xs">
                <div className="flex items-center bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl px-3 py-1.5 w-full sm:w-80 text-sm">
                    <Search size={16} className="text-slate-400 dark:text-gray-400 mr-2 shrink-0" />
                    <input 
                        type="text" 
                        placeholder="Search event description, agent, rule..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent focus:outline-none w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs font-medium"
                    />
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <Filter size={16} className="text-slate-400 dark:text-gray-400" />
                    <span className="text-xs text-slate-500 dark:text-gray-400 font-bold">Min Severity Level:</span>
                    <select 
                        value={filterLevel} 
                        onChange={(e) => setFilterLevel(Number(e.target.value))}
                        className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                    >
                        <option value={0}>All Levels (0+)</option>
                        <option value={5}>Medium (5+)</option>
                        <option value={8}>High (8+)</option>
                        <option value={12}>Critical (12+)</option>
                    </select>
                </div>
            </div>

            <Table<Alert> 
                headers={['Timestamp', 'Level', 'Rule Description', 'Agent', 'MITRE ATT&CK', 'Action']} 
                data={filteredData} 
                renderRow={(item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => setSelectedAlert(item)}>
                        <td className="p-3 text-slate-500 dark:text-gray-400 whitespace-nowrap text-xs">{item.timestamp || item.time}</td>
                        <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getAlertLevelColor(item.level)}`}>
                                Lvl {item.level}
                            </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-gray-200">{item.rule || item.description}</td>
                        <td className="p-3 text-indigo-600 dark:text-indigo-300 font-bold text-xs">{item.agent || item.agentName}</td>
                        <td className="p-3 font-mono text-xs text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md inline-block font-bold">{item.Mitre || item.technique}</td>
                        <td className="p-3">
                            <button onClick={(e) => { e.stopPropagation(); setSelectedAlert(item); }} className="text-xs bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-800 dark:text-gray-200 px-3 py-1 rounded-lg font-bold">
                                Inspect
                            </button>
                        </td>
                    </tr>
                )} 
            />

            {/* Inspect Event Modal */}
            <Modal isOpen={!!selectedAlert} onClose={() => setSelectedAlert(null)} title="Security Event Details">
                {selectedAlert && (
                    <div className="space-y-4 text-xs font-sans">
                        <div className="bg-slate-50 dark:bg-gray-900 p-4 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-2">
                            <div className="flex justify-between items-center border-b border-slate-200 dark:border-gray-800 pb-2">
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedAlert.rule || 'Security Incident'}</span>
                                <span className={`px-2 py-0.5 rounded-full font-bold ${getAlertLevelColor(selectedAlert.level)}`}>
                                    Level {selectedAlert.level}
                                </span>
                            </div>
                            <p className="text-slate-700 dark:text-gray-300">{selectedAlert.description}</p>
                            <div className="grid grid-cols-2 gap-2 text-slate-500 dark:text-gray-400 text-[11px] pt-2">
                                <div>Agent: <span className="text-indigo-600 dark:text-indigo-300 font-bold">{selectedAlert.agent || selectedAlert.agentName}</span></div>
                                <div>Rule ID: <span className="text-indigo-600 dark:text-indigo-300 font-mono font-bold">{selectedAlert.ruleId}</span></div>
                                <div>Technique: <span className="text-indigo-600 dark:text-indigo-300 font-mono font-bold">{selectedAlert.technique || selectedAlert.Mitre}</span></div>
                                <div>Tactic: <span className="text-indigo-600 dark:text-indigo-300 font-bold">{selectedAlert.tactic}</span></div>
                            </div>
                        </div>

                        <div>
                            <span className="text-slate-400 dark:text-gray-400 text-[10px] uppercase font-bold block mb-1">Raw Syslog Payload</span>
                            <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800">
                                {JSON.stringify(selectedAlert, null, 2)}
                            </pre>
                        </div>

                        <div className="flex justify-end space-x-3 pt-2">
                            <button onClick={() => setSelectedAlert(null)} className="px-4 py-2 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-xl font-bold">Close</button>
                            <button onClick={() => handleAcknowledge(selectedAlert.id)} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md">
                                Acknowledge & Resolve
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Create Event Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Log Security Incident">
                <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Event Description</label>
                        <input type="text" placeholder="e.g. Unauthorized file download" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Rule Name</label>
                        <input type="text" placeholder="e.g. Data Exfiltration Alert" value={newEvent.rule} onChange={e => setNewEvent({...newEvent, rule: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Level Severity (1-15)</label>
                        <input type="number" min="1" max="15" value={newEvent.level} onChange={e => setNewEvent({...newEvent, level: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm" required />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md">Transmit Event</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export const VulnerabilitiesView: React.FC<{ data: Vulnerability[]; onRefresh?: () => void }> = ({ data, onRefresh }) => {
    const handlePatch = async (vuln: Vulnerability) => {
        await api.updateVulnerability(vuln.id, { status: 'Patched' });
        if (onRefresh) onRefresh();
    };

    return (
        <div className="p-8 space-y-6">
            <PageHeader title="Vulnerability Management & CVEs" />
            <Table<Vulnerability> 
                headers={['CVE ID', 'Severity', 'Package', 'Affected Agents', 'Status', 'Remediation']} 
                data={data} 
                renderRow={(item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400 font-mono text-xs">{item.cve}</td>
                        <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getSeverityColor(item.severity)}`}>
                                {item.severity}
                            </span>
                        </td>
                        <td className="p-3 text-slate-800 dark:text-gray-300 font-medium">{item.package}</td>
                        <td className="p-3 font-mono text-center text-slate-700 dark:text-gray-300 text-xs font-bold">{item.affected_agents}</td>
                        <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${item.status === 'Patched' || item.status === 'Fixed' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300'}`}>
                                {item.status}
                            </span>
                        </td>
                        <td className="p-3">
                            {item.status !== 'Patched' && item.status !== 'Fixed' ? (
                                <button 
                                    onClick={() => handlePatch(item)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                                >
                                    Apply Patch
                                </button>
                            ) : (
                                <span className="text-xs text-slate-400 dark:text-gray-500 italic">Resolved</span>
                            )}
                        </td>
                    </tr>
                )} 
            />
        </div>
    );
};

export const FimView: React.FC<{ data: FimEvent[]; onRefresh?: () => void }> = ({ data, onRefresh }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ agent: 'ubuntu-web-prod', type: 'Modified', path: '/etc/nginx/nginx.conf' });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await api.createFimEvent(newEvent);
        setIsModalOpen(false);
        if (onRefresh) onRefresh();
    };

    return (
        <div className="p-8 space-y-6">
            <PageHeader title="File Integrity Monitoring (FIM)">
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-full flex items-center shadow-lg transition-transform hover:scale-105">
                    <Plus size={18} className="mr-2" /> Log File Change
                </button>
            </PageHeader>

            <Table<FimEvent> 
                headers={['Timestamp', 'Agent', 'Event Type', 'File Path']} 
                data={data} 
                renderRow={(item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="p-3 text-slate-500 dark:text-gray-400 whitespace-nowrap text-xs">{item.timestamp}</td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{item.agent}</td>
                        <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${item.type === 'Deleted' ? 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400' : item.type === 'Added' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400'}`}>
                                {item.type}
                            </span>
                        </td>
                        <td className="p-3 font-mono text-xs text-indigo-600 dark:text-indigo-300 break-all font-medium">{item.path}</td>
                    </tr>
                )} 
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add FIM File Event">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Agent Name</label>
                        <input type="text" value={newEvent.agent} onChange={e => setNewEvent({...newEvent, agent: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm font-medium" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Event Type</label>
                        <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm font-medium">
                            <option>Modified</option>
                            <option>Added</option>
                            <option>Deleted</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Path</label>
                        <input type="text" value={newEvent.path} onChange={e => setNewEvent({...newEvent, path: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono text-xs" required />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md">Log Event</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export const MitreView: React.FC<{ data: MitreItem[] }> = ({ data }) => (
    <div className="p-8 space-y-6">
        <PageHeader title="MITRE ATT&CK Framework Analysis" />
        <Table<MitreItem> 
            headers={['Tactic', 'Technique', 'Alert Volume']} 
            data={data} 
            renderRow={(item) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-3 font-semibold text-indigo-600 dark:text-indigo-300">{item.tactic}</td>
                    <td className="p-3 font-mono text-sm text-slate-700 dark:text-gray-300">{item.technique}</td>
                    <td className="p-3">
                        <div className="flex items-center">
                            <span className="w-16 text-right mr-3 font-bold text-slate-900 dark:text-white text-xs">{item.alerts}</span>
                            <div className="h-2 bg-slate-100 dark:bg-gray-700 rounded-full flex-grow max-w-[150px]">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${Math.min((item.alerts / 250) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                    </td>
                </tr>
            )} 
        />
    </div>
);
