import React, { useState, useEffect } from 'react';
import { PlusCircle, AlertTriangle, BookOpen, List, CheckCircle, XCircle, Search, Terminal, Code, Ban, ShieldCheck, Trash2, ShieldAlert } from 'lucide-react';
import { PageHeader, Modal, Card } from '../UI';
import { Table } from '../Table';
import { api } from '../../services/api';
import { Rule, Decoder, CdbList, IpLists } from '../../types';

export const RulesView: React.FC<{ data: Rule[]; onRefresh: () => void }> = ({ data, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({ id: '', level: '8', description: '', group: 'syslog,custom', category: 'General Security' });

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createRule(newRule);
    setIsModalOpen(false);
    setNewRule({ id: '', level: '8', description: '', group: 'syslog,custom', category: 'General Security' });
    onRefresh();
  };

  const handleToggleStatus = async (rule: Rule) => {
    const nextStatus = rule.status === 'Enabled' ? 'Disabled' : 'Enabled';
    await api.updateRule(rule.id, { status: nextStatus });
    onRefresh();
  };

  const filteredRules = data.filter(r => 
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="Rules Management">
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-full flex items-center shadow-lg transition-transform hover:scale-105">
          <PlusCircle size={18} className="mr-2" />Add Custom Rule
        </button>
      </PageHeader>

      <div className="flex items-center bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white max-w-md shadow-xs">
        <Search size={18} className="text-slate-400 dark:text-gray-400 mr-2 shrink-0" />
        <input 
          type="text" 
          placeholder="Filter rules by ID, description, category..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent focus:outline-none w-full text-xs font-medium placeholder-slate-400 dark:placeholder-gray-500"
        />
      </div>

      <Table 
        headers={['Rule ID', 'Level', 'Description', 'Group / Tags', 'Category', 'Status', 'Actions']}
        data={filteredRules}
        renderRow={(rule: Rule) => (
          <tr key={rule.id} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
            <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{rule.id}</td>
            <td className="p-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${rule.level >= 12 ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' : rule.level >= 8 ? 'bg-orange-500/20 text-amber-700 dark:text-orange-400 border border-orange-500/30' : 'bg-green-500/20 text-emerald-700 dark:text-green-400'}`}>
                Level {rule.level}
              </span>
            </td>
            <td className="p-3 font-semibold text-slate-800 dark:text-gray-200">{rule.description}</td>
            <td className="p-3 text-xs font-mono text-slate-500 dark:text-gray-400">{rule.group}</td>
            <td className="p-3 text-sm text-slate-700 dark:text-gray-300">{rule.category}</td>
            <td className="p-3">
              <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded ${rule.status === 'Enabled' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300' : 'bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-gray-400'}`}>
                {rule.status === 'Enabled' ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                {rule.status}
              </span>
            </td>
            <td className="p-3">
              <button 
                onClick={() => handleToggleStatus(rule)}
                className="text-xs bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-800 dark:text-gray-200 px-3 py-1 rounded transition-colors font-bold"
              >
                {rule.status === 'Enabled' ? 'Disable' : 'Enable'}
              </button>
            </td>
          </tr>
        )}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Detection Rule">
        <form onSubmit={handleCreateRule} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Rule ID (Optional)</label>
            <input type="text" placeholder="e.g. 10002" value={newRule.id} onChange={e => setNewRule({...newRule, id: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Alert Severity Level (1 - 15)</label>
            <input type="number" min="1" max="15" value={newRule.level} onChange={e => setNewRule({...newRule, level: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Description</label>
            <input type="text" placeholder="e.g. Unauthorized access to sensitive endpoint" value={newRule.description} onChange={e => setNewRule({...newRule, description: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Category</label>
            <select value={newRule.category} onChange={e => setNewRule({...newRule, category: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm font-medium">
              <option>Authentication</option>
              <option>Malware</option>
              <option>Reconnaissance</option>
              <option>Privilege Escalation</option>
              <option>Initial Access</option>
              <option>Web Activity</option>
              <option>General Security</option>
            </select>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md">Save Rule</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const DecodersView: React.FC<{ data: Decoder[]; onRefresh: () => void }> = ({ data, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDecoder, setNewDecoder] = useState({ name: '', type: 'syslog', parent: 'root', description: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createDecoder(newDecoder);
    setIsModalOpen(false);
    setNewDecoder({ name: '', type: 'syslog', parent: 'root', description: '' });
    onRefresh();
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="Log Decoders">
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-full flex items-center shadow-lg transition-transform hover:scale-105">
          <PlusCircle size={18} className="mr-2" />Add Decoder
        </button>
      </PageHeader>

      <Table 
        headers={['Decoder Name', 'Type', 'Parent', 'Description', 'Status']}
        data={data}
        renderRow={(dec: Decoder) => (
          <tr key={dec.id} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
            <td className="p-3 font-mono text-indigo-600 dark:text-indigo-300 font-bold">{dec.name}</td>
            <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-700 text-xs text-slate-700 dark:text-gray-300 font-semibold">{dec.type}</span></td>
            <td className="p-3 text-xs text-slate-500 dark:text-gray-400 font-mono">{dec.parent}</td>
            <td className="p-3 text-slate-800 dark:text-gray-300 text-sm">{dec.description}</td>
            <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded text-xs font-bold">{dec.status}</span></td>
          </tr>
        )}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Log Decoder">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Decoder Name</label>
            <input type="text" placeholder="e.g. nginx-error-decoder" value={newDecoder.name} onChange={e => setNewDecoder({...newDecoder, name: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Type</label>
            <select value={newDecoder.type} onChange={e => setNewDecoder({...newDecoder, type: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm font-medium">
              <option value="syslog">syslog</option>
              <option value="web">web</option>
              <option value="windows">windows</option>
              <option value="json">json</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Description</label>
            <textarea placeholder="Describes extracted log fields" value={newDecoder.description} onChange={e => setNewDecoder({...newDecoder, description: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm" />
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md">Save Decoder</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const CdbListsView: React.FC<{ data: CdbList[]; onRefresh: () => void }> = ({ data, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newList, setNewList] = useState({ name: '', description: '', entriesText: '' });
  const [ipLists, setIpLists] = useState<IpLists>({ blacklist: [], whitelist: [] });
  const [newBlacklistIp, setNewBlacklistIp] = useState('');
  const [newWhitelistIp, setNewWhitelistIp] = useState('');

  const fetchIpLists = async () => {
    try {
      const lists = await api.getIpLists();
      setIpLists(lists);
    } catch (err) {
      console.error("Failed to load IP lists:", err);
    }
  };

  useEffect(() => {
    fetchIpLists();
  }, []);

  const handleAddBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlacklistIp) return;
    const updated = await api.addBlacklistIp(newBlacklistIp.trim());
    setIpLists(updated);
    setNewBlacklistIp('');
    onRefresh();
  };

  const handleRemoveBlacklist = async (ip: string) => {
    const updated = await api.removeBlacklistIp(ip);
    setIpLists(updated);
    onRefresh();
  };

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhitelistIp) return;
    const updated = await api.addWhitelistIp(newWhitelistIp.trim());
    setIpLists(updated);
    setNewWhitelistIp('');
    onRefresh();
  };

  const handleRemoveWhitelist = async (ip: string) => {
    const updated = await api.removeWhitelistIp(ip);
    setIpLists(updated);
    onRefresh();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const entries = newList.entriesText.split('\n').map(s => s.trim()).filter(Boolean);
    await api.createCdbList({ name: newList.name, description: newList.description, entries });
    setIsModalOpen(false);
    setNewList({ name: '', description: '', entriesText: '' });
    onRefresh();
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="CDB Lists & IP Blacklist / Whitelist Firewall Management">
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-full flex items-center shadow-lg transition-transform hover:scale-105">
          <PlusCircle size={18} className="mr-2" />Add Custom CDB List
        </button>
      </PageHeader>

      {/* Dedicated IP Blacklist & Whitelist Management Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Response IP Blacklist Card */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-red-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-700 pb-3">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 font-black text-lg">
              <Ban size={22} />
              <span>Active Response IP Blacklist</span>
            </div>
            <span className="px-3 py-1 bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-black rounded-full border border-red-500/30">
              {ipLists.blacklist.length} Blocked IPs
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-gray-300 font-medium">
            IP addresses listed here trigger instant level-12 SIEM alerts and active firewall drops across all deployed agents.
          </p>

          <form onSubmit={handleAddBlacklist} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Add IP address (e.g. 198.51.100.99)" 
              value={newBlacklistIp} 
              onChange={e => setNewBlacklistIp(e.target.value)} 
              className="flex-1 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-red-500" 
              required 
            />
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center transition-transform hover:scale-105">
              <PlusCircle size={14} className="mr-1" /> Add Blacklist
            </button>
          </form>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {ipLists.blacklist.map((ip, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-gray-900/60 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-mono">
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 font-bold">
                  <span>⛔</span>
                  <span>{ip}</span>
                </div>
                <button onClick={() => handleRemoveBlacklist(ip)} className="text-slate-400 hover:text-red-600 transition-colors p-1" title="Unblock IP">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trusted Network IP Whitelist Card */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-emerald-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-700 pb-3">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-black text-lg">
              <ShieldCheck size={22} />
              <span>Trusted Network IP Whitelist</span>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-full border border-emerald-500/30">
              {ipLists.whitelist.length} Allowed IPs
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-gray-300 font-medium">
            Whitelisted IPs are exempted from automated active response drops and noise alerts (internal subnets, admin jump boxes).
          </p>

          <form onSubmit={handleAddWhitelist} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Add IP address (e.g. 10.0.0.10)" 
              value={newWhitelistIp} 
              onChange={e => setNewWhitelistIp(e.target.value)} 
              className="flex-1 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" 
              required 
            />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center transition-transform hover:scale-105">
              <PlusCircle size={14} className="mr-1" /> Add Whitelist
            </button>
          </form>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {ipLists.whitelist.map((ip, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-gray-900/60 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-mono">
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>✓</span>
                  <span>{ip}</span>
                </div>
                <button onClick={() => handleRemoveWhitelist(ip)} className="text-slate-400 hover:text-red-600 transition-colors p-1" title="Remove from Whitelist">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((list) => (
          <Card key={list.id} className="space-y-4 border border-slate-200 dark:border-gray-700">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-300">{list.name}</h3>
              <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs rounded-full font-bold">
                {list.entriesCount || list.entries?.length || 0} Entries
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-gray-400">{list.description}</p>
            <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs max-h-32 overflow-y-auto space-y-1 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-sans font-bold mb-1">Sample items:</div>
              {list.entries?.map((item: string, idx: number) => (
                <div key={idx} className="truncate">• {item}</div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create CDB List">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">List Name</label>
            <input type="text" placeholder="e.g. malicious-hashes" value={newList.name} onChange={e => setNewList({...newList, name: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Description</label>
            <input type="text" placeholder="Purpose of list" value={newList.description} onChange={e => setNewList({...newList, description: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Entries (One per line)</label>
            <textarea rows={5} placeholder="192.0.2.1&#10;198.51.100.4" value={newList.entriesText} onChange={e => setNewList({...newList, entriesText: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono text-xs" required />
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md">Save List</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
