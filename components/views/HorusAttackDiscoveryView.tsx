import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, GitCommit, ChevronRight, AlertTriangle, CheckCircle, 
  BrainCircuit, Activity, Lock, Users, Monitor, Globe, ArrowRight, 
  Sparkles, RefreshCw, Zap, Shield, Play
} from 'lucide-react';
import { PageHeader, Card, Modal } from '../UI';
import { api } from '../../services/api';
import { AttackDiscoveryStory, MlAnomalyRecord } from '../../types';

export const HorusAttackDiscoveryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stories' | 'ml'>('stories');
  const [stories, setStories] = useState<AttackDiscoveryStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<AttackDiscoveryStory | null>(null);
  const [mlAnomalies, setMlAnomalies] = useState<MlAnomalyRecord[]>([]);
  const [containmentResult, setContainmentResult] = useState<string | null>(null);
  const [isGeneratingAiAnalysis, setIsGeneratingAiAnalysis] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storyData, mlData] = await Promise.all([
        api.getAttackDiscoveryStories(),
        api.getMlAnomalies()
      ]);
      setStories(storyData);
      if (storyData.length > 0) setSelectedStory(storyData[0]);
      setMlAnomalies(mlData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleContainAttack = async (id: string) => {
    try {
      await api.containAttackStory(id);
      setContainmentResult(`Emergency Active Containment triggered for Attack Story ${id}: Isolated hosts win-dc-primary, ubuntu-web-prod; Revoked active Okta & Kerberos tickets for compromised accounts.`);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateAiAnalysis = async (story: AttackDiscoveryStory) => {
    setIsGeneratingAiAnalysis(true);
    setAiReport(null);
    try {
      const res = await api.askOracle(`Analyze this Attack Discovery Story:
Title: ${story.title}
Threat Actor: ${story.threatActor}
Stages: ${story.stages.map(s => `Stage ${s.stageNumber}: ${s.tactic} - ${s.description}`).join('; ')}
Provide an executive breach briefing and concrete 4-step remediation plan.`);
      setAiReport(res.reply);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAiAnalysis(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="HORUS ATTACK DISCOVERY & ML SECURITY ANALYTICS">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'stories' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert size={14} />
            <span>Attack Discovery Stories ({stories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ml')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ml' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-50'
            }`}
          >
            <BrainCircuit size={14} />
            <span>ML Anomaly Detections ({mlAnomalies.length})</span>
          </button>
        </div>
      </PageHeader>

      {containmentResult && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-2xl flex items-center justify-between text-xs text-emerald-200 font-bold">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-emerald-400 shrink-0" />
            <span>{containmentResult}</span>
          </div>
          <button onClick={() => setContainmentResult(null)} className="text-emerald-400 hover:text-white">Dismiss</button>
        </div>
      )}

      {activeTab === 'stories' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stories List */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-gray-400">
              Coalesced Attack Stories
            </h3>
            <div className="space-y-3">
              {stories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedStory?.id === story.id
                      ? 'bg-indigo-600/10 border-indigo-500 shadow-md'
                      : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                    <span className="font-bold text-red-500 bg-red-100 dark:bg-red-950/80 px-2 py-0.5 rounded-full">
                      {story.id} • {story.confidence}
                    </span>
                    <span className="text-slate-400">{story.lastUpdate}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                    {story.title}
                  </h4>
                  <div className="flex items-center justify-between mt-3 text-[11px]">
                    <span className="text-slate-500 dark:text-gray-400 font-mono">{story.stages.length} Killchain Stages</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      story.status === 'Active Attack' ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white'
                    }`}>
                      {story.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Story View */}
          {selectedStory && (
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-gray-800">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono mb-1">
                      <span className="font-black text-red-500">STORY ID: {selectedStory.id}</span>
                      <span>•</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">Threat Actor: {selectedStory.threatActor}</span>
                    </div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedStory.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGenerateAiAnalysis(selectedStory)}
                      disabled={isGeneratingAiAnalysis}
                      className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      {isGeneratingAiAnalysis ? <RefreshCw className="animate-spin" size={13} /> : <Sparkles size={13} />}
                      <span>Oracle Briefing</span>
                    </button>
                    <button
                      onClick={() => handleContainAttack(selectedStory.id)}
                      disabled={selectedStory.status === 'Contained'}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                        selectedStory.status === 'Contained'
                          ? 'bg-emerald-600 text-white cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                      }`}
                    >
                      <Zap size={14} />
                      <span>{selectedStory.status === 'Contained' ? 'Threat Contained' : '1-Click Contain Fleet'}</span>
                    </button>
                  </div>
                </div>

                {/* AI Briefing Box */}
                {aiReport && (
                  <div className="p-4 bg-indigo-950/60 border border-indigo-500/40 rounded-2xl space-y-2 text-xs text-indigo-100">
                    <div className="flex items-center justify-between font-bold text-indigo-300">
                      <span className="flex items-center gap-1.5"><Sparkles size={14} /> Horus Oracle AI Executive Briefing</span>
                      <button onClick={() => setAiReport(null)} className="text-indigo-400 hover:text-white">Dismiss</button>
                    </div>
                    <div className="whitespace-pre-line text-[11px] leading-relaxed font-mono">
                      {aiReport}
                    </div>
                  </div>
                )}

                {/* Summary & Entities */}
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                    {selectedStory.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 dark:bg-gray-950 p-4 rounded-xl border border-slate-200 dark:border-gray-800 text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Users size={12} /> Impacted Users
                      </div>
                      <div className="font-mono font-bold text-slate-800 dark:text-gray-200 mt-1">
                        {selectedStory.affectedEntities.users.join(', ')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Monitor size={12} /> Impacted Endpoints
                      </div>
                      <div className="font-mono font-bold text-slate-800 dark:text-gray-200 mt-1">
                        {selectedStory.affectedEntities.endpoints.join(', ')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Globe size={12} /> Malicious C2 IPs
                      </div>
                      <div className="font-mono font-bold text-red-500 mt-1">
                        {selectedStory.affectedEntities.ips.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Killchain Progression Flow */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Activity size={14} className="text-indigo-500" /> Killchain Stage Progression ({selectedStory.stages.length} Stages)
                  </h4>

                  <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-500/30">
                    {selectedStory.stages.map((stage) => (
                      <div key={stage.stageNumber} className="relative space-y-1">
                        <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                          {stage.stageNumber}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {stage.tactic}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold">
                            {stage.technique}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {stage.timestamp} • Source: {stage.source}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-gray-300 bg-slate-50 dark:bg-gray-950 p-3 rounded-xl border border-slate-200 dark:border-gray-800/80">
                          {stage.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Remediation Actions */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-gray-800">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Shield size={14} className="text-emerald-500" /> Prescribed Containment Actions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {selectedStory.recommendedActions.map((action, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-gray-950 rounded-xl border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 font-medium">
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      ) : (
        /* MACHINE LEARNING ANOMALIES TAB */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mlAnomalies.map((anom) => (
              <Card key={anom.id} className="p-4 space-y-3 border-amber-500/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold text-[10px]">
                    {anom.anomalyType}
                  </span>
                  <span className="font-mono text-slate-400 text-[10px]">{anom.timestamp}</span>
                </div>

                <div>
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
                    {anom.entity}
                  </div>
                  <div className="text-[11px] font-bold text-amber-500 mt-1">
                    Risk Score: {anom.anomalyScore}/100 (Confidence: {anom.confidence}%)
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] bg-slate-50 dark:bg-gray-950 p-2.5 rounded-xl border border-slate-200 dark:border-gray-800">
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Baseline Profile:</span>
                    <span className="text-slate-600 dark:text-gray-400">{anom.baselineDescription}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Observed Anomaly:</span>
                    <span className="font-mono text-red-500 font-bold">{anom.observedValue}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">
                  <strong>Why unusual:</strong> {anom.whyUnusual}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
