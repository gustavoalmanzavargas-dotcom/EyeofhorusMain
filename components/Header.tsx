import React, { useState, useEffect, useRef } from 'react';
import { Search, CheckCircle, Bell, ChevronDown, RefreshCw, AlertTriangle, Shield, Server, Bug, X, LogOut, Sun, Moon, Monitor, Globe, Activity, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { api } from '../services/api';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar?: () => void;
  onNavigate?: (view: string) => void;
  currentUser?: { email: string; name: string } | null;
  onLogout?: () => void;
  themeMode?: 'dark' | 'light' | 'auto';
  onThemeChange?: (mode: 'dark' | 'light' | 'auto') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  sidebarOpen, 
  onToggleSidebar,
  onNavigate, 
  currentUser, 
  onLogout,
  themeMode = 'auto',
  onThemeChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ agents: any[]; alerts: any[]; rules: any[]; vulnerabilities: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [alertsList, setAlertsList] = useState<any[]>([]);
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [tenantOpen, setTenantOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState('US-East-1 Prod');

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const tenantRef = useRef<HTMLDivElement>(null);

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'GA';

  const userName = currentUser?.name || 'Gustavo Almanza';
  const userEmail = currentUser?.email || 'gustavo.almanza@cyverax.com';

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setThemeOpen(false);
      }
      if (tenantRef.current && !tenantRef.current.contains(event.target as Node)) {
        setTenantOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.globalSearch(searchQuery);
        setSearchResults(results);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load notifications (level >= 12 alerts)
  const fetchNotifications = async () => {
    try {
      const alerts = await api.getSecurityEvents({ level: 12 });
      setAlertsList(alerts);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSelectResult = (view: string) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    if (onNavigate) onNavigate(view);
  };

  return (
    <header className="bg-slate-100 dark:bg-gray-950 border-b border-slate-200 dark:border-gray-800 text-slate-800 dark:text-gray-100 z-30 transition-all duration-300 ease-in-out select-none">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        
        {/* Left Section: Sidebar Toggle, Tenant Selector & Global Search */}
        <div className="flex items-center space-x-3 md:space-x-4">
          
          {/* Sidebar Toggle Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 text-slate-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500 transition-all shadow-2xs"
            >
              {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
          )}

          {/* Tenant / Environment Dropdown */}
          <div className="relative" ref={tenantRef}>
            <button
              onClick={() => setTenantOpen(!tenantOpen)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 hover:border-indigo-500 transition-all shadow-xs"
            >
              <Globe size={14} className="text-indigo-500 dark:text-indigo-400" />
              <span>{selectedTenant}</span>
              <ChevronDown size={12} className="text-gray-500" />
            </button>

            {tenantOpen && (
              <div className="absolute top-10 left-0 w-52 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl p-2 z-50 text-xs space-y-1">
                <div className="px-2 py-1 text-[10px] uppercase font-mono font-bold text-slate-400 dark:text-gray-500">Active Tenant Cluster</div>
                {['US-East-1 Prod', 'EMEA-West Staging', 'GovCloud Isolated'].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setSelectedTenant(t); setTenantOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                      selectedTenant === t 
                        ? 'bg-indigo-500/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-bold' 
                        : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{t}</span>
                    {selectedTenant === t && <CheckCircle size={12} className="text-indigo-600 dark:text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input with Live Dropdown */}
          <div className="relative" ref={searchRef}>
            <div className="flex items-center bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 rounded-xl px-3.5 py-1.5 hover:border-indigo-500/60 transition-colors w-64 md:w-80 shadow-xs">
              <Search className="text-slate-400 dark:text-gray-400 shrink-0" size={16} />
              <input 
                type="text" 
                placeholder="Search CVEs, rules, IP, agents..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                className="bg-transparent text-slate-900 dark:text-white ml-2.5 focus:outline-none w-full text-xs placeholder-slate-400 dark:placeholder-gray-500 font-medium" 
              />
              {isSearching ? (
                <RefreshCw className="animate-spin text-indigo-500 dark:text-indigo-400 shrink-0" size={14} />
              ) : searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white">
                  <X size={14} />
                </button>
              ) : null}
            </div>

            {/* Search Dropdown Popover */}
            {showSearchDropdown && searchResults && (
              <div className="absolute top-11 left-0 w-96 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl p-3 z-50 max-h-96 overflow-y-auto space-y-3">
                {searchResults.agents.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center">
                      <Server size={12} className="mr-1 text-indigo-500 dark:text-indigo-400" /> Agents
                    </div>
                    <div className="space-y-1">
                      {searchResults.agents.slice(0, 3).map(agent => (
                        <div 
                          key={agent.id} 
                          onClick={() => handleSelectResult('agents')}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors text-xs flex justify-between items-center"
                        >
                          <span className="font-bold text-slate-800 dark:text-white">{agent.name}</span>
                          <span className="text-slate-400 dark:text-gray-400 font-mono text-[10px]">{agent.ip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.rules.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center">
                      <Shield size={12} className="mr-1 text-amber-500 dark:text-amber-400" /> Detection Rules
                    </div>
                    <div className="space-y-1">
                      {searchResults.rules.slice(0, 3).map(rule => (
                        <div 
                          key={rule.id} 
                          onClick={() => handleSelectResult('rules')}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors text-xs flex justify-between items-center"
                        >
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">#{rule.id}</span>
                          <span className="text-slate-700 dark:text-gray-300 truncate max-w-[200px]">{rule.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.vulnerabilities.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center">
                      <Bug size={12} className="mr-1 text-red-500 dark:text-red-400" /> Vulnerabilities
                    </div>
                    <div className="space-y-1">
                      {searchResults.vulnerabilities.slice(0, 3).map(v => (
                        <div 
                          key={v.id} 
                          onClick={() => handleSelectResult('vulnerabilities')}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors text-xs flex justify-between items-center"
                        >
                          <span className="font-bold text-red-600 dark:text-red-400 font-mono">{v.cve}</span>
                          <span className="text-slate-500 dark:text-gray-400">{v.package}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.agents.length === 0 && searchResults.rules.length === 0 && searchResults.vulnerabilities.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400 dark:text-gray-400 italic">
                    No matching items found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Ingestion SLA, Theme Switcher, Notifications, Profile */}
        <div className="flex items-center space-x-3 md:space-x-4">
          
          {/* Real-time Ingestion Stream Metrics */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl text-xs font-mono shadow-xs">
            <Activity size={14} className="text-emerald-500 dark:text-emerald-400 animate-pulse" />
            <span className="text-slate-500 dark:text-gray-400 text-[11px]">EPS: <strong className="text-slate-900 dark:text-white">4.2k</strong></span>
            <span className="text-slate-300 dark:text-gray-700">|</span>
            <span className="text-slate-500 dark:text-gray-400 text-[11px]">Latency: <strong className="text-emerald-600 dark:text-emerald-400">12ms</strong></span>
          </div>

          {/* Theme Switcher Dropdown (Dark, Light, Auto System) */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:border-indigo-500 transition-colors flex items-center gap-1.5 shadow-xs"
              title="Change UI Theme"
            >
              {themeMode === 'dark' && <Moon size={16} className="text-indigo-500 dark:text-indigo-400" />}
              {themeMode === 'light' && <Sun size={16} className="text-amber-500 dark:text-amber-400" />}
              {themeMode === 'auto' && <Monitor size={16} className="text-emerald-500 dark:text-emerald-400" />}
              <ChevronDown size={12} className="text-gray-500" />
            </button>

            {themeOpen && (
              <div className="absolute right-0 top-11 w-44 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-gray-500">Appearance Mode</div>
                {[
                  { id: 'dark', label: 'Dark Mode', icon: <Moon size={14} className="text-indigo-500 dark:text-indigo-400" /> },
                  { id: 'light', label: 'Light Mode', icon: <Sun size={14} className="text-amber-500 dark:text-amber-400" /> },
                  { id: 'auto', label: 'System Auto', icon: <Monitor size={14} className="text-emerald-500 dark:text-emerald-400" /> },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      if (onThemeChange) onThemeChange(mode.id as any);
                      setThemeOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl font-bold transition-all flex items-center justify-between ${
                      themeMode === mode.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {mode.icon}
                      <span>{mode.label}</span>
                    </div>
                    {themeMode === mode.id && <CheckCircle size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => { fetchNotifications(); setNotificationsOpen(!notificationsOpen); }}
              className="relative p-2 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 rounded-xl hover:border-indigo-500 transition-colors shadow-xs"
            >
              <Bell size={18} className="text-slate-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400" />
              {alertsList.length > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-ping"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 top-11 w-80 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center">
                    <AlertTriangle size={14} className="text-red-500 dark:text-red-400 mr-2" /> Critical Alerts ({alertsList.length})
                  </span>
                  <button onClick={() => setAlertsList([])} className="text-[11px] text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white">Clear</button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {alertsList.length > 0 ? (
                    alertsList.slice(0, 5).map(alert => (
                      <div key={alert.id} className="p-2.5 bg-red-50/50 dark:bg-gray-950/80 rounded-xl border border-red-200 dark:border-red-500/20 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-red-600 dark:text-red-400">{alert.rule || 'Security Breach'}</span>
                          <span className="text-slate-400 dark:text-gray-500 font-mono text-[10px]">{alert.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-gray-300 line-clamp-2">{alert.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-400 dark:text-gray-500 italic">No unread critical alerts</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <div 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2.5 cursor-pointer bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-800 p-1.5 px-2.5 rounded-xl transition-all hover:border-indigo-500 shadow-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-xs text-white shadow-md">
                {userInitials}
              </div>
              <span className="hidden md:inline text-xs font-bold text-slate-800 dark:text-gray-200">{userName}</span>
              <ChevronDown size={12} className="text-gray-500" />
            </div>

            {profileOpen && (
              <div className="absolute right-0 top-11 w-56 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-gray-800">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{userName}</p>
                  <p className="text-slate-400 dark:text-gray-400 text-[10px] truncate font-mono">{userEmail}</p>
                  <span className="mt-1 inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">Cyverax Platinum</span>
                </div>
                <button 
                  onClick={() => { setProfileOpen(false); if (onNavigate) onNavigate('myAccount'); }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between"
                >
                  <span>My Account & Memberships</span>
                  <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded font-mono uppercase">Platinum</span>
                </button>
                <button 
                  onClick={() => { setProfileOpen(false); if (onNavigate) onNavigate('branding'); }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
                >
                  Branding & Whitelabel
                </button>
                <button 
                  onClick={() => { setProfileOpen(false); if (onNavigate) onNavigate('integrations'); }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
                >
                  Enterprise Integrations & LDAPS
                </button>
                <button 
                  onClick={() => { setProfileOpen(false); if (onNavigate) onNavigate('configuration'); }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
                >
                  System Settings
                </button>
                <button 
                  onClick={() => { setProfileOpen(false); if (onNavigate) onNavigate('api'); }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
                >
                  API Keys
                </button>
                {onLogout && (
                  <button 
                    onClick={() => { setProfileOpen(false); onLogout(); }}
                    className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors font-bold flex items-center"
                  >
                    <LogOut size={14} className="mr-2" /> Log Out
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
