import React, { useState } from 'react';
import { 
  Shield, BarChart2, Bug, FileCheck, Target, HardDrive, 
  Server, Users, ShieldCheck, Key, AlertTriangle, BookOpen, 
  List, Code, FileText, Download, Home, ChevronDown, ChevronRight, Settings, Wrench, Cpu, Network, Award,
  CheckSquare, Zap, Globe, Play, Search, Bot, Layers, CheckCircle
} from 'lucide-react';
import { HorusLogo } from './HorusLogo';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentView: string;
  setView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, currentView, setView }) => {
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({ 
    commandSuite: true,
    modules: true, 
    agents: true, 
    userManagement: false,
    settings: false
  });

  const toggleModule = (module: string) => setOpenModules(prev => ({ ...prev, [module]: !prev[module] }));

  const NavGroup = ({ title, icon, moduleKey, children }: { title: string, icon: React.ReactNode, moduleKey: string, children: React.ReactNode }) => (
    <div className="mb-2">
        <div onClick={() => toggleModule(moduleKey)} className="flex items-center justify-between py-2 px-3.5 rounded-xl cursor-pointer text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800/80 hover:text-slate-900 dark:hover:text-white transition-colors">
            <div className="flex items-center gap-2.5">
              {icon} 
              {isOpen && <span className="font-extrabold text-[11px] uppercase tracking-wider">{title}</span>}
            </div>
            {isOpen && (openModules[moduleKey] ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </div>
        {isOpen && openModules[moduleKey] && (
            <div className="mt-1 ml-3.5 pl-2.5 border-l border-slate-200 dark:border-gray-800 space-y-0.5">
                {children}
            </div>
        )}
    </div>
  );

  const NavItem = ({ icon, text, viewId }: { icon: React.ReactNode, text: string, viewId: string }) => (
    <div 
      onClick={() => setView(viewId)} 
      className={`flex items-center py-1.5 px-3 rounded-xl cursor-pointer transition-all duration-200 group ${currentView === viewId ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800/60 hover:text-slate-900 dark:hover:text-white'}`}
    >
      <span className={currentView === viewId ? 'text-white' : 'text-slate-400 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white'}>{icon}</span> 
      {isOpen && <span className="ml-2.5 text-xs tracking-tight truncate">{text}</span>}
    </div>
  );

  return (
    <div className={`bg-white dark:bg-gray-950 text-slate-900 dark:text-white border-r border-slate-200 dark:border-gray-800/80 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'} h-screen flex flex-col fixed top-0 left-0 z-40 shadow-xl dark:shadow-2xl select-none`}>
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-3.5 border-b border-slate-200 dark:border-gray-800/80 shrink-0">
        <div className={`flex items-center ${!isOpen && 'justify-center w-full'}`}>
          <HorusLogo size={40} showText={isOpen} />
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">
          {isOpen ? <ChevronRight className="transform -rotate-180" size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
        <NavItem icon={<Home size={16} />} text="HORUS COMMAND" viewId="dashboard" />
        
        {/* HORUS XDR SUITE GROUP */}
        <NavGroup title="HORUS SUITE" icon={<Shield size={16} className="text-amber-400" />} moduleKey="commandSuite">
            <NavItem icon={<Network size={15} className="text-indigo-400" />} text="HORUS INCIDENT GRAPH" viewId="incidentGraph" />
            <NavItem icon={<Shield size={15} className="text-red-400" />} text="HORUS SOC" viewId="socQueue" />
            <NavItem icon={<Search size={15} className="text-cyan-400" />} text="HORUS HUNT" viewId="hunt" />
            <NavItem icon={<Play size={15} className="text-emerald-400" />} text="HORUS AUTOMATE (SOAR)" viewId="automate" />
            <NavItem icon={<Bug size={15} className="text-amber-400" />} text="HORUS EXPOSURE" viewId="vulnerabilities" />
            <NavItem icon={<HardDrive size={15} className="text-purple-400" />} text="HORUS ASSETS" viewId="inventory" />
            <NavItem icon={<Globe size={15} className="text-blue-400" />} text="HORUS INTELLIGENCE" viewId="intelligence" />
            <NavItem icon={<CheckCircle size={15} className="text-emerald-400" />} text="HORUS COMPLIANCE" viewId="compliance" />
            <NavItem icon={<Bot size={15} className="text-indigo-400" />} text="HORUS ORACLE AI" viewId="oracle" />
        </NavGroup>

        <NavGroup title="SECURITY MODULES" icon={<Layers size={16} />} moduleKey="modules">
            <NavItem icon={<BarChart2 size={15} />} text="Security Events" viewId="securityEvents" />
            <NavItem icon={<FileCheck size={15} />} text="File Integrity (FIM)" viewId="fim" />
            <NavItem icon={<Target size={15} />} text="MITRE ATT&CK Matrix" viewId="mitre" />
            <NavItem icon={<CheckSquare size={15} />} text="SCA CIS Hardening (Wazuh)" viewId="wazuhSca" />
            <NavItem icon={<Zap size={15} />} text="Footholds & Canaries (Huntress)" viewId="huntress" />
            <NavItem icon={<Globe size={15} />} text="Web & DNS Shield (Webroot)" viewId="webroot" />
        </NavGroup>

        <NavGroup title="AGENTS & FLEET" icon={<Server size={16} />} moduleKey="agents">
            <NavItem icon={<HardDrive size={15} />} text="All Endpoints & Agents" viewId="agents" />
        </NavGroup>
        
        <NavGroup title="IDENTITY & ACCESS" icon={<Users size={16} />} moduleKey="userManagement">
            <NavItem icon={<Users size={15} />} text="Users & Identities" viewId="users" />
            <NavItem icon={<ShieldCheck size={15} />} text="Roles & RBAC" viewId="roles" />
            <NavItem icon={<Key size={15} />} text="Access Policies" viewId="policies" />
        </NavGroup>

        <NavGroup title="DETECTION ENGINE" icon={<Wrench size={16} />} moduleKey="management">
            <NavItem icon={<AlertTriangle size={15} />} text="Detection Rules" viewId="rules" />
            <NavItem icon={<BookOpen size={15} />} text="Log Decoders" viewId="decoders" />
            <NavItem icon={<List size={15} />} text="CDB Lookup Lists" viewId="cdb" />
        </NavGroup>

        <NavGroup title="TOOLS & DEV" icon={<Cpu size={16} />} moduleKey="tools">
            <NavItem icon={<Code size={15} />} text="Dev & Rule Tester" viewId="devtools" />
        </NavGroup>

        <NavGroup title="ADMIN & SETTINGS" icon={<Settings size={16} />} moduleKey="settings">
            <NavItem icon={<Award size={15} className="text-amber-400" />} text="My Account & Memberships" viewId="myAccount" />
            <NavItem icon={<Shield size={15} className="text-indigo-400" />} text="Branding & Whitelabel" viewId="branding" />
            <NavItem icon={<Network size={15} />} text="Integrations & LDAPS" viewId="integrations" />
            <NavItem icon={<FileText size={15} />} text="System Config" viewId="configuration" />
            <NavItem icon={<Download size={15} />} text="API Keys" viewId="api" />
        </NavGroup>
      </nav>
    </div>
  );
};

export default Sidebar;
