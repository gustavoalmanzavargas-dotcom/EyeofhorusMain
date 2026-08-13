import React, { useState } from 'react';
import { Code, Play, ShieldAlert, Terminal, Cpu, CheckCircle2, RefreshCw } from 'lucide-react';
import { PageHeader, Card } from '../UI';
import { api } from '../../services/api';

export const DevToolsView: React.FC<{ onThreatSimulated?: () => void }> = ({ onThreatSimulated }) => {
  const [logInput, setLogInput] = useState('Oct 27 10:42:15 ubuntu-web-prod sshd[4012]: Failed password for invalid user root from 198.51.100.22 port 49210 ssh2');
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simNotification, setSimNotification] = useState<string | null>(null);

  const handleTestLog = async () => {
    setIsLoading(true);
    try {
      const res = await api.testLog(logInput);
      setTestResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateThreat = async () => {
    setSimulating(true);
    setSimNotification(null);
    try {
      const res = await api.simulateThreat();
      setSimNotification(`Threat Event Triggered! Rule "${res.alert?.rule}" on Agent "${res.alert?.agentName}". Dashboard updated.`);
      if (onThreatSimulated) onThreatSimulated();
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <PageHeader title="Developer & Security Testing Suite" />

      {/* Threat Simulator Section */}
      <Card className="border border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="text-red-400" size={24} />
              <h3 className="text-xl font-bold text-white">Live Threat Simulation Engine</h3>
            </div>
            <p className="text-sm text-indigo-100 max-w-2xl">
              Transmit a real-time simulated security breach (SSH brute force, ransomware pattern, or web shell upload) directly into the Eye of Horus backend and Firestore data feeds.
            </p>
          </div>
          <button 
            onClick={handleSimulateThreat}
            disabled={simulating}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center shadow-lg hover:shadow-red-500/20 transition-all shrink-0 disabled:opacity-50"
          >
            <Play size={18} className="mr-2 fill-current" />
            {simulating ? 'Simulating Threat...' : 'Inject Threat Alert'}
          </button>
        </div>

        {simNotification && (
          <div className="mt-4 p-3 bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 rounded-xl text-sm flex items-center font-medium">
            <CheckCircle2 size={18} className="mr-2 shrink-0 text-emerald-400" />
            <span>{simNotification}</span>
          </div>
        )}
      </Card>

      {/* Log Evaluation Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="space-y-4 border border-slate-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="text-indigo-600 dark:text-indigo-400" size={20} />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rule & Log Evaluation Sandbox</h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Paste raw Syslog, Apache, Windows EventLog or JSON string to test decoder fields extraction and rule matching logic.
          </p>

          <textarea 
            rows={6}
            value={logInput}
            onChange={(e) => setLogInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
            placeholder="Paste raw log here..."
          />

          <button 
            onClick={handleTestLog}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center transition-colors shadow-md"
          >
            {isLoading ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Code size={16} className="mr-2" />}
            {isLoading ? 'Evaluating Log...' : 'Run Rules Evaluation'}
          </button>
        </Card>

        {/* Test Results Output */}
        <Card className="space-y-4 border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-950/60">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Evaluation Output</h3>
            {testResult && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-bold">
                Rule Matched
              </span>
            )}
          </div>

          {testResult ? (
            <div className="space-y-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 dark:text-gray-400 block mb-1 font-sans font-bold">DECODER MATCHED:</span>
                <span className="text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800/50">
                  {testResult.decoderMatched}
                </span>
              </div>

              <div>
                <span className="text-slate-500 dark:text-gray-400 block mb-1 font-sans font-bold">PARSED FIELDS:</span>
                <pre className="bg-slate-900 p-3 rounded-xl text-emerald-400 overflow-x-auto border border-slate-800">
                  {JSON.stringify(testResult.extractedFields, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-slate-500 dark:text-gray-400 block mb-1 font-sans font-bold">TRIGGERED RULE:</span>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div><span className="text-slate-400">ID:</span> <span className="text-indigo-400 font-bold">{testResult.ruleMatched?.id}</span></div>
                  <div><span className="text-slate-400">Level:</span> <span className="text-red-400 font-bold">Level {testResult.ruleMatched?.level}</span></div>
                  <div><span className="text-slate-400">Description:</span> <span className="text-slate-200">{testResult.ruleMatched?.description}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-gray-500 text-xs italic">
              Click "Run Rules Evaluation" to view decoded output and matched rules.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DevToolsView;
