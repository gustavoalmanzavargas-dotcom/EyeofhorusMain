import React, { useState, useEffect } from 'react';
import { 
  Shield, Code, Play, Plus, CheckCircle, AlertTriangle, 
  RefreshCw, Filter, FileText, ArrowRight, Eye, Edit, Layers, Sliders
} from 'lucide-react';
import { PageHeader, Card, Modal } from '../UI';
import { api } from '../../services/api';
import { HorusDetectionRule } from '../../types';

export const HorusDetectionsView: React.FC = () => {
  const [rules, setRules] = useState<HorusDetectionRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<HorusDetectionRule | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'yaml' | 'test'>('rules');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<{ matchedEvents: number; sampleMatches: any[] } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRule, setNewRule] = useState<Partial<HorusDetectionRule>>({
    name: '',
    description: '',
    severity: 'HIGH',
    ruleType: 'query',
    status: 'Development',
    query: 'FROM endpoint.events\n| WHERE process.name == "powershell.exe"\n| WHERE process.command_line CONTAINS "-enc"',
    schedule: 'Every 5 minutes',
    lookback: '15m'
  });
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const data = await api.getHorusDetectionRules();
      setRules(data);
      if (data.length > 0) setSelectedRule(data[0]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestRule = async (ruleId: string) => {
    setIsTestRunning(true);
    setTestResult(null);
    try {
      const res = await api.testDetectionRule(ruleId);
      setTestResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTestRunning(false);
    }
  };

  const handleCreateRule = async () => {
    if (!newRule.name) return;
    try {
      await api.createHorusDetectionRule({
        name: newRule.name,
        description: newRule.description || '',
        severity: (newRule.severity as any) || 'HIGH',
        ruleType: (newRule.ruleType as any) || 'query',
        status: (newRule.status as any) || 'Development',
        query: newRule.query || 'FROM endpoint.events | LIMIT 50',
        schedule: newRule.schedule || 'Every 5 minutes',
        lookback: newRule.lookback || '15m',
        yamlCode: `id: HORUS-CUST-${Date.now()}\nname: ${newRule.name}\nseverity: ${newRule.severity}\nquery: |\n  ${newRule.query?.replace(/\n/g, '\n  ')}`
      });
      setIsCreateModalOpen(false);
      setNotification('Detection rule successfully created and staged in Development lifecycle.');
      loadRules();
      setTimeout(() => setNotification(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleRuleStatus = async (rule: HorusDetectionRule, newStatus: any) => {
    try {
      await api.updateHorusDetectionRule(rule.id, { status: newStatus });
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, status: newStatus } : r));
      if (selectedRule?.id === rule.id) {
        setSelectedRule({ ...selectedRule, status: newStatus });
      }
      setNotification(`Rule ${rule.ruleId} promoted to ${newStatus}.`);
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="HORUS DETECTION ENGINE & DETECTION-AS-CODE (DAC)">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus size={14} />
            <span>Create Detection Rule</span>
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

      {/* Rules Grid & Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500 dark:text-gray-400">
            <span>Detection Rules ({rules.length})</span>
          </div>

          <div className="space-y-2">
            {rules.map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  setSelectedRule(r);
                  setTestResult(null);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedRule?.id === r.id
                    ? 'bg-indigo-600/10 border-indigo-500 shadow-md'
                    : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{r.ruleId} (v{r.version})</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                    r.status === 'Production' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                    r.status === 'Staging' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600' :
                    'bg-amber-100 dark:bg-amber-950 text-amber-600'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">{r.name}</h4>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-gray-800 text-[10px] font-mono text-slate-400">
                  <span>{r.mitre?.technique || 'T1059'}</span>
                  <span className={`font-bold ${
                    r.severity === 'CRITICAL' ? 'text-red-500' : r.severity === 'HIGH' ? 'text-amber-500' : 'text-slate-500'
                  }`}>
                    {r.severity} ({r.riskScore})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Rule Inspector */}
        {selectedRule && (
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-gray-800">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-indigo-500 font-bold mb-1">
                    <span>{selectedRule.ruleId}</span>
                    <span>•</span>
                    <span>Version {selectedRule.version}</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedRule.name}
                  </h2>
                  <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">{selectedRule.description}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestRule(selectedRule.id)}
                    disabled={isTestRunning}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 disabled:opacity-50 transition-all"
                  >
                    {isTestRunning ? <RefreshCw className="animate-spin" size={13} /> : <Play size={13} />}
                    <span>Test Against Telemetry</span>
                  </button>
                </div>
              </div>

              {/* Lifecycle Stage Switcher */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-950 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-mono">
                <span className="font-bold text-slate-500">Lifecycle Stage:</span>
                <div className="flex items-center gap-1.5">
                  {(['Development', 'Testing', 'Staging', 'Production'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => handleToggleRuleStatus(selectedRule, st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        selectedRule.status === st 
                          ? 'bg-indigo-600 text-white shadow-xs' 
                          : 'bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Results Output */}
              {testResult && (
                <div className="p-4 bg-gray-950 border border-emerald-500/40 rounded-2xl space-y-2 text-xs font-mono text-emerald-400">
                  <div className="flex items-center justify-between font-bold text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle size={14} /> Rule Simulation Finished: {testResult.matchedEvents} Historical Events Matched
                    </span>
                    <button onClick={() => setTestResult(null)} className="text-emerald-500 hover:text-white">Dismiss</button>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Simulation evaluated HQL logic against the last 24 hours of HSC normalized telemetry.
                  </div>
                </div>
              )}

              {/* HQL Query Logic */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Code size={14} className="text-indigo-500" /> Detection Logic (HQL)
                </h4>
                <pre className="p-4 bg-gray-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto border border-gray-800">
                  {selectedRule.query}
                </pre>
              </div>

              {/* Investigation Guide Checklist */}
              {selectedRule.investigationGuide && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText size={14} className="text-amber-500" /> Triage & Investigation Runbook
                  </h4>
                  <div className="space-y-1.5 text-xs bg-slate-50 dark:bg-gray-950 p-4 rounded-xl border border-slate-200 dark:border-gray-800 font-mono">
                    {selectedRule.investigationGuide.map((step, idx) => (
                      <div key={idx} className="text-slate-700 dark:text-gray-300 flex items-start gap-2">
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detection as Code (YAML) */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers size={14} className="text-indigo-500" /> Detection-as-Code Spec (YAML)
                </h4>
                <pre className="p-4 bg-gray-950 text-slate-300 font-mono text-[11px] rounded-xl overflow-x-auto border border-gray-800 leading-relaxed">
                  {selectedRule.yamlCode || `id: ${selectedRule.ruleId}\nname: ${selectedRule.name}\nseverity: ${selectedRule.severity}\nquery: ${selectedRule.query}`}
                </pre>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <Modal title="Create New Detection Rule" onClose={() => setIsCreateModalOpen(false)}>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Rule Name *</label>
              <input
                type="text"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="e.g., Active Directory DCSync Attack"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Severity</label>
                <select
                  value={newRule.severity}
                  onChange={(e) => setNewRule({ ...newRule, severity: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none font-bold"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">Initial Stage</label>
                <select
                  value={newRule.status}
                  onChange={(e) => setNewRule({ ...newRule, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none font-semibold"
                >
                  <option value="Development">Development</option>
                  <option value="Testing">Testing</option>
                  <option value="Staging">Staging</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-gray-300 mb-1">HQL Query Logic *</label>
              <textarea
                value={newRule.query}
                onChange={(e) => setNewRule({ ...newRule, query: e.target.value })}
                rows={4}
                className="w-full px-3.5 py-2 bg-gray-950 font-mono text-emerald-400 border border-slate-800 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-gray-800">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRule}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Deploy Rule
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
