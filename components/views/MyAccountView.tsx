import React from 'react';
import { Award, User, Mail, Shield, CheckCircle, Server, Zap, Lock, Key, Layers, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { PageHeader, Card } from '../UI';

interface MyAccountViewProps {
  currentUser?: { email: string; name: string; uid?: string } | null;
}

export const MyAccountView: React.FC<MyAccountViewProps> = ({ currentUser }) => {
  const name = currentUser?.name || 'Gustavo Almanza';
  const email = currentUser?.email || 'gustavo.almanza@cyverax.com';

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <PageHeader title="My Account & Memberships">
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-amber-600 dark:text-amber-400 font-extrabold text-xs">
          <Award size={16} />
          <span>CYVERAX PLATINUM MEMBER</span>
        </div>
      </PageHeader>

      {/* Profile Overview Card */}
      <Card className="border border-slate-200 dark:border-gray-800 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-gray-800">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-xl">
              {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{name}</h2>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">MFA Active</span>
              </div>
              <p className="text-sm font-mono text-slate-500 dark:text-gray-400 mt-0.5">{email}</p>
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-gray-400 mt-2 font-medium">
                <span className="flex items-center"><Shield size={14} className="mr-1 text-indigo-500" /> Lead Security Operator</span>
                <span>•</span>
                <span className="flex items-center"><Key size={14} className="mr-1 text-amber-500" /> System Superadmin</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-slate-100 dark:bg-gray-800/80 p-3 rounded-2xl border border-slate-200 dark:border-gray-700 text-center min-w-[120px]">
              <div className="text-[10px] uppercase font-mono font-bold text-slate-400 dark:text-gray-400">Security Clearance</div>
              <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">LEVEL 5 TOP SECRET</div>
            </div>
            <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/30 text-center min-w-[120px]">
              <div className="text-[10px] uppercase font-mono font-bold text-amber-600 dark:text-amber-400">Membership Tier</div>
              <div className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5">PLATINUM</div>
            </div>
          </div>
        </div>

        {/* Account Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-800">
            <div className="text-slate-400 dark:text-gray-500 font-mono font-bold uppercase text-[10px] mb-1">Organization</div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">Cyverax Solutions LLC</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-800">
            <div className="text-slate-400 dark:text-gray-500 font-mono font-bold uppercase text-[10px] mb-1">SSO Authentication</div>
            <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-500" /> Google Workspace OAuth
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-800">
            <div className="text-slate-400 dark:text-gray-500 font-mono font-bold uppercase text-[10px] mb-1">Primary Region</div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">US-East-1 (Primary Cluster)</div>
          </div>
        </div>
      </Card>

      {/* Membership & Subscription Details Banner */}
      <Card className="border border-amber-500/40 bg-gradient-to-br from-amber-500/5 via-slate-50 to-indigo-500/5 dark:from-amber-500/10 dark:via-gray-900 dark:to-indigo-950/40 p-6 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-lg">
              <Award size={22} className="shrink-0" />
              <span>CYVERAX PLATINUM MEMBERSHIP</span>
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full ml-2">Active Plan</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-300 font-medium mt-1">
              Enterprise XDR Protection • 10,000 Agents Capacity • Dedicated Security Operations
            </p>
          </div>

          <div className="text-right">
            <div className="text-[11px] font-mono text-slate-500 dark:text-gray-400">Subscription ID: <strong className="text-slate-800 dark:text-slate-200">CYV-PLAT-904812</strong></div>
            <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Renews: August 2027 (Auto-Renewed)</div>
          </div>
        </div>

        {/* Progress Usage Bar */}
        <div className="space-y-2 p-4 bg-white/80 dark:bg-gray-950/80 rounded-2xl border border-slate-200 dark:border-gray-800 backdrop-blur-md">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
              <Server size={14} className="text-indigo-500" />
              Endpoint Agent Fleet Capacity
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-mono">1,800 / 10,000 Agents Used (18%)</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-300 dark:border-gray-700">
            <div className="bg-gradient-to-r from-amber-400 via-indigo-500 to-cyan-400 h-full rounded-full w-[18%] shadow-sm transition-all duration-500" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 dark:text-gray-400 font-mono">
            <span>8,200 Available Licenses</span>
            <span>Unrestricted Scale License</span>
          </div>
        </div>

        {/* Included Platinum Features */}
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-3">Included Membership Privileges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { title: '10,000 Agent Fleet Capacity', desc: 'Unrestricted endpoint protection across Linux, Windows, & macOS.' },
              { title: 'Correlated Attack Graph', desc: 'Cross-domain incident graph with automated killchain trajectory.' },
              { title: 'SOAR Visual Playbooks', desc: 'Automated response workflows with real-time webhooks & containment.' },
              { title: 'Tri-Shield Detection Engine', desc: 'Wazuh SCA, Huntress Ransomware Canary, and Webroot DNS Shield.' },
              { title: 'Horus Oracle Gemini AI', desc: 'Uncapped Gemini AI security analysis & SOC command assistance.' },
              { title: 'Custom Whitelabel Branding', desc: 'Custom logos, brand primary colors, and whitelabeling unlocked.' }
            ].map((feat, idx) => (
              <div key={idx} className="p-3 bg-white/70 dark:bg-gray-950/60 rounded-xl border border-slate-200 dark:border-gray-800/80 flex items-start space-x-2.5">
                <CheckCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{feat.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5 leading-snug">{feat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MyAccountView;
