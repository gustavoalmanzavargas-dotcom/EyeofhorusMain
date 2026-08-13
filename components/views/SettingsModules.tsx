import React, { useState, useEffect } from 'react';
import { Save, Key, Plus, Trash2, Copy, Check, FileText, Download, Server, Bell, Shield, Terminal } from 'lucide-react';
import { PageHeader, Card, Modal } from '../UI';
import { Table } from '../Table';
import { api } from '../../services/api';
import { ApiKey, SystemConfig } from '../../types';

export const ConfigurationView: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    serverName: 'EyeOfHorus-Primary-01',
    alertThresholdLevel: 7,
    autoAcknowledgeLowLevel: false,
    logRetentionDays: 90,
    syslogPort: 514,
    webhookUrl: 'https://hooks.slack.com/services/T00/B00/X000000',
    webhookEnabled: true,
    emailNotifications: true,
    adminEmail: 'security-alerts@company.com'
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    api.getConfig().then(data => {
      if (data) setConfig(data);
    }).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);
    try {
      await api.updateConfig(config);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      <PageHeader title="System Configuration" />

      {successMsg && (
        <div className="p-4 bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium">
          Configuration settings successfully updated and saved!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Core Server Config */}
        <Card className="space-y-6 border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-gray-700 pb-3">
            <Server className="text-indigo-600 dark:text-indigo-400" size={20} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">General Server Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Server Identifier Name</label>
              <input 
                type="text" 
                value={config.serverName || ''} 
                onChange={e => setConfig({...config, serverName: e.target.value})}
                className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Syslog UDP Ingestion Port</label>
              <input 
                type="number" 
                value={config.syslogPort || 514} 
                onChange={e => setConfig({...config, syslogPort: Number(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Alert Display Threshold Level (1-15)</label>
              <input 
                type="number" 
                min="1" max="15"
                value={config.alertThresholdLevel || 7} 
                onChange={e => setConfig({...config, alertThresholdLevel: Number(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Log Data Retention (Days)</label>
              <input 
                type="number" 
                value={config.logRetentionDays || 90} 
                onChange={e => setConfig({...config, logRetentionDays: Number(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>
          </div>
        </Card>

        {/* Notifications & Integrations */}
        <Card className="space-y-6 border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-gray-700 pb-3">
            <Bell className="text-indigo-600 dark:text-indigo-400" size={20} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Alert Notifications & Webhooks</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Alert Incident Webhook URL (Slack/Teams/Discord)</label>
              <input 
                type="url" 
                value={config.webhookUrl || ''} 
                onChange={e => setConfig({...config, webhookUrl: e.target.value})}
                className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Security Incident Admin Email</label>
              <input 
                type="email" 
                value={config.adminEmail || ''} 
                onChange={e => setConfig({...config, adminEmail: e.target.value})}
                className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full flex items-center shadow-lg transition-transform hover:scale-105"
          >
            <Save size={18} className="mr-2" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const ApiView: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadKeys = () => {
    api.getApiKeys().then(setKeys).catch(console.error);
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.createApiKey(keyName);
    setCreatedToken(res.token);
    setKeyName('');
    loadKeys();
  };

  const handleDelete = async (id: string) => {
    await api.deleteApiKey(id);
    loadKeys();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 space-y-8">
      <PageHeader title="API Credentials & Documentation">
        <button onClick={() => { setCreatedToken(null); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-full flex items-center shadow-lg transition-transform hover:scale-105">
          <Plus size={18} className="mr-2" />Generate New API Key
        </button>
      </PageHeader>

      {/* Active Keys List */}
      <Card className="space-y-4 border border-slate-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Active Ingestion API Tokens</h3>
        <Table 
          headers={['Key Name', 'Token Prefix', 'Created Date', 'Last Active', 'Status', 'Actions']}
          data={keys}
          renderRow={(key: ApiKey) => (
            <tr key={key.id} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
              <td className="p-3 font-semibold text-slate-900 dark:text-white">{key.name}</td>
              <td className="p-3 font-mono text-indigo-600 dark:text-indigo-300 text-xs">{key.prefix}</td>
              <td className="p-3 text-xs text-slate-500 dark:text-gray-400">{key.created}</td>
              <td className="p-3 text-xs text-slate-700 dark:text-gray-300">{key.lastUsed}</td>
              <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded text-xs font-bold">{key.status}</span></td>
              <td className="p-3">
                <button onClick={() => handleDelete(key.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Revoke Key">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          )}
        />
      </Card>

      {/* Endpoint Code Snippets */}
      <Card className="space-y-4 border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-950/60">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-gray-800 pb-3">
          <Terminal size={18} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Transmitting Log Events via REST API</h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-gray-400">Send custom security events directly into the Eye of Horus pipeline using standard cURL requests:</p>

        <div className="bg-slate-900 p-4 rounded-xl font-mono text-xs text-emerald-400 border border-slate-800 overflow-x-auto shadow-inner">
          {`curl -X POST "${window.location.origin}/api/security-events" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentName": "production-k8s-node-01",
    "ruleId": "1005",
    "rule": "Web shell detected",
    "description": "Suspicious PHP script executed",
    "level": 14,
    "technique": "T1190",
    "tactic": "Initial Access"
  }'`}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Ingestion Key">
        {createdToken ? (
          <div className="space-y-4">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Copy your API token now. It will not be shown again!</p>
            <div className="bg-slate-50 dark:bg-gray-900 p-3 rounded-xl border border-slate-200 dark:border-gray-700 flex items-center justify-between font-mono text-xs text-indigo-600 dark:text-indigo-300">
              <span className="truncate mr-2 font-bold">{createdToken}</span>
              <button onClick={() => copyToClipboard(createdToken)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg shrink-0">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-white px-5 py-2 rounded-xl font-bold text-sm">Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateKey} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Key Description Name</label>
              <input type="text" placeholder="e.g. Docker Agent Ingestion" value={keyName} onChange={e => setKeyName(e.target.value)} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-2.5 text-slate-900 dark:text-white text-sm" required />
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md">Generate</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
