import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './components/LoginView';
import { LoadingSpinner, ErrorDisplay } from './components/UI';
import DashboardView from './components/views/DashboardView';
import AgentsView from './components/views/AgentsView';
import InventoryView from './components/views/InventoryView';
import { SecurityEventsView, VulnerabilitiesView, FimView, MitreView } from './components/views/SecurityModules';
import { ScaView, HuntressView, WebrootShieldView } from './components/views/XdrIntegrationsView';
import { 
  HorusIncidentGraphView, 
  HorusSocQueueView, 
  HorusAutomateView, 
  HorusOracleView, 
  HorusComplianceView 
} from './components/views/HorusSuiteViews';
import { UsersView, RolesView, PoliciesView } from './components/views/AdminModules';
import { RulesView, DecodersView, CdbListsView } from './components/views/ManagementModules';
import DevToolsView from './components/views/DevToolsView';
import { ConfigurationView, ApiView } from './components/views/SettingsModules';
import IntegrationsView from './components/views/IntegrationsView';
import MyAccountView from './components/views/MyAccountView';
import BrandingView from './components/views/BrandingView';

// Elastic-Class Horus Search & Analytics Suite
import { HorusSearchView } from './components/views/HorusSearchView';
import { HorusTimelineView } from './components/views/HorusTimelineView';
import { HorusAttackDiscoveryView } from './components/views/HorusAttackDiscoveryView';
import { HorusEntityAnalyticsView } from './components/views/HorusEntityAnalyticsView';
import { HorusLiveQueryView } from './components/views/HorusLiveQueryView';
import { HorusDetectionsView } from './components/views/HorusDetectionsView';
import { HorusSuppressionView } from './components/views/HorusSuppressionView';
import { HorusVisualizeView } from './components/views/HorusVisualizeView';
import { HorusDataPlatformView } from './components/views/HorusDataPlatformView';
import { HorusContentPacksView } from './components/views/HorusContentPacksView';

import { api } from './services/api';
import { auth, onAuthStateChanged, signOut } from './services/firebase';
import { DashboardData } from './types';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('eoh_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  const handleToggleSidebar = (newState?: boolean) => {
    setSidebarOpen(prev => {
      const next = typeof newState === 'boolean' ? newState : !prev;
      localStorage.setItem('eoh_sidebar_open', String(next));
      return next;
    });
  };
  
  const [data, setData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'auto'>(() => {
    return (localStorage.getItem('eoh_theme_mode') as 'dark' | 'light' | 'auto') || 'dark';
  });

  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; uid?: string } | null>(() => {
    const saved = localStorage.getItem('eoh_operator_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Sync theme to document element
  useEffect(() => {
    const applyTheme = () => {
      let isDark = true;
      if (themeMode === 'light') {
        isDark = false;
      } else if (themeMode === 'auto') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('eoh_theme_mode', themeMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (themeMode === 'auto') applyTheme();
    };
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [themeMode]);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const u = {
          email: firebaseUser.email || 'operator@eyeofhorus.sec',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Security Operator',
          uid: firebaseUser.uid
        };
        setCurrentUser(u);
        localStorage.setItem('eoh_operator_user', JSON.stringify(u));
      }
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('eoh_operator_user');
    setCurrentUser(null);
  };

  const reloadData = useCallback(async () => {
    try {
      const [
        dashboard,
        securityEvents,
        vulnerabilities,
        fim,
        mitre,
        agents,
        users,
        roles,
        policies,
        rules,
        decoders,
        cdb
      ] = await Promise.all([
        api.getDashboard().catch(() => null),
        api.getSecurityEvents().catch(() => []),
        api.getVulnerabilities().catch(() => []),
        api.getFimEvents().catch(() => []),
        api.getMitre().catch(() => []),
        api.getAgents().catch(() => []),
        api.getUsers().catch(() => []),
        api.getRoles().catch(() => []),
        api.getPolicies().catch(() => []),
        api.getRules().catch(() => []),
        api.getDecoders().catch(() => []),
        api.getCdbLists().catch(() => [])
      ]);

      setData({
        dashboard: dashboard || {
          stats: { totalAlerts: 0, level12Alerts: 0, authFailure: 0 },
          alertsEvolution: [],
          mitreAttck: [],
          topAgents: [],
          topAgentsEvolution: [],
          securityAlerts: securityEvents
        },
        securityEvents,
        vulnerabilities,
        fim,
        mitre,
        agents,
        users,
        roles,
        policies,
        rules,
        decoders,
        cdb
      });
      setErrorMsg(null);
    } catch (err: any) {
      console.error('Error fetching backend data:', err);
      setErrorMsg('Failed to load telemetry data from Eye of Horus server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      reloadData();
    }
  }, [currentUser, reloadData]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginView 
        themeMode={themeMode}
        onThemeChange={setThemeMode}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          localStorage.setItem('eoh_operator_user', JSON.stringify(u));
        }} 
      />
    );
  }

  const handleAgentSelect = (agent: any) => {
    setSelectedAgent(agent);
    setCurrentView('inventory');
  };

  const handleBackToAgents = () => {
    setSelectedAgent(null);
    setCurrentView('agents');
  };

  const renderView = () => {
    if (isLoading && !data.dashboard) {
      return (
        <div className="p-6 h-[calc(100vh-4rem)] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }

    if (errorMsg) {
      return (
        <div className="p-6 h-[calc(100vh-4rem)]">
          <ErrorDisplay message={errorMsg} />
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardView data={data.dashboard as DashboardData} onRefresh={reloadData} />;
      case 'incidentGraph':
        return <HorusIncidentGraphView />;
      case 'socQueue':
        return <HorusSocQueueView />;
      case 'hunt':
        return <SecurityEventsView data={data.securityEvents || []} onRefresh={reloadData} />;
      case 'automate':
        return <HorusAutomateView />;
      case 'oracle':
        return <HorusOracleView />;
      case 'compliance':
        return <HorusComplianceView />;
      case 'intelligence':
        return <WebrootShieldView onRefresh={reloadData} />;

      // ELASTIC-CLASS HORUS SEARCH & ANALYTICS VIEWS
      case 'horusSearch':
        return <HorusSearchView />;
      case 'horusTimeline':
        return <HorusTimelineView />;
      case 'horusAttackDiscovery':
        return <HorusAttackDiscoveryView />;
      case 'horusEntityAnalytics':
        return <HorusEntityAnalyticsView />;
      case 'horusLiveQuery':
        return <HorusLiveQueryView />;
      case 'horusDetections':
        return <HorusDetectionsView />;
      case 'horusSuppression':
        return <HorusSuppressionView />;
      case 'horusVisualize':
        return <HorusVisualizeView />;
      case 'horusDataPlatform':
        return <HorusDataPlatformView />;
      case 'horusContentPacks':
        return <HorusContentPacksView />;
      case 'securityEvents':
        return <SecurityEventsView data={data.securityEvents || []} onRefresh={reloadData} />;
      case 'vulnerabilities':
        return <VulnerabilitiesView data={data.vulnerabilities || []} onRefresh={reloadData} />;
      case 'fim':
        return <FimView data={data.fim || []} onRefresh={reloadData} />;
      case 'mitre':
        return <MitreView data={data.mitre || []} />;
      case 'wazuhSca':
        return <ScaView onRefresh={reloadData} />;
      case 'huntress':
        return <HuntressView onRefresh={reloadData} />;
      case 'webroot':
        return <WebrootShieldView onRefresh={reloadData} />;
      case 'agents':
        return <AgentsView data={data.agents || []} onAgentSelect={handleAgentSelect} onRefresh={reloadData} />;
      case 'inventory':
        return selectedAgent ? (
          <InventoryView agent={selectedAgent} onBack={handleBackToAgents} userId="admin" />
        ) : (
          <AgentsView data={data.agents || []} onAgentSelect={handleAgentSelect} onRefresh={reloadData} />
        );
      case 'users':
        return <UsersView data={data.users || []} roles={data.roles || []} onRefresh={reloadData} />;
      case 'roles':
        return <RolesView data={data.roles || []} policies={data.policies || []} onRefresh={reloadData} />;
      case 'policies':
        return <PoliciesView data={data.policies || []} onRefresh={reloadData} />;
      case 'rules':
        return <RulesView data={data.rules || []} onRefresh={reloadData} />;
      case 'decoders':
        return <DecodersView data={data.decoders || []} onRefresh={reloadData} />;
      case 'cdb':
        return <CdbListsView data={data.cdb || []} onRefresh={reloadData} />;
      case 'devtools':
        return <DevToolsView onThreatSimulated={reloadData} />;
      case 'myAccount':
        return <MyAccountView currentUser={currentUser} />;
      case 'branding':
        return <BrandingView />;
      case 'configuration':
        return <ConfigurationView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'api':
        return <ApiView />;
      default:
        return <DashboardView data={data.dashboard as DashboardData} onRefresh={reloadData} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 font-sans overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={handleToggleSidebar} 
        currentView={currentView} 
        setView={(v) => {
          if (v !== 'inventory') setSelectedAgent(null);
          setCurrentView(v);
        }} 
      />
      <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-20'} h-full`}>
        <Header 
          sidebarOpen={sidebarOpen} 
          onToggleSidebar={() => handleToggleSidebar()}
          onNavigate={(v) => setCurrentView(v)} 
          currentUser={currentUser} 
          onLogout={handleLogout}
          themeMode={themeMode}
          onThemeChange={setThemeMode}
        />
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-gray-950 relative">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
