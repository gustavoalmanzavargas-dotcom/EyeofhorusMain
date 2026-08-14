import { 
  DashboardData, Alert, Vulnerability, FimEvent, MitreItem, Agent, User, Role, Policy, InventoryData, IpLists,
  ScaPolicy, PersistentFoothold, RansomwareCanary, DnsQueryLog, ThreatIntelHash
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errText = await res.text().catch(() => 'Network request failed');
    throw new Error(errText || `HTTP Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Health
  async getHealth() {
    return handleResponse<{ status: string; time: string; server: string }>(await fetch(`${API_BASE}/health`));
  },

  // Dashboard
  async getDashboard(): Promise<DashboardData> {
    return handleResponse<DashboardData>(await fetch(`${API_BASE}/dashboard`));
  },

  // Security Events
  async getSecurityEvents(params?: { level?: number; agent?: string; search?: string }): Promise<Alert[]> {
    const query = new URLSearchParams();
    if (params?.level) query.append('level', String(params.level));
    if (params?.agent) query.append('agent', params.agent);
    if (params?.search) query.append('search', params.search);
    const url = `${API_BASE}/security-events${query.toString() ? `?${query.toString()}` : ''}`;
    return handleResponse<Alert[]>(await fetch(url));
  },

  async createSecurityEvent(alertData: Partial<Alert>): Promise<Alert> {
    return handleResponse<Alert>(await fetch(`${API_BASE}/security-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData)
    }));
  },

  async deleteSecurityEvent(id: string) {
    return handleResponse<{ success: boolean }>(await fetch(`${API_BASE}/security-events/${id}`, {
      method: 'DELETE'
    }));
  },

  // Vulnerabilities
  async getVulnerabilities(): Promise<Vulnerability[]> {
    return handleResponse<Vulnerability[]>(await fetch(`${API_BASE}/vulnerabilities`));
  },

  async createVulnerability(vuln: Partial<Vulnerability>): Promise<Vulnerability> {
    return handleResponse<Vulnerability>(await fetch(`${API_BASE}/vulnerabilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vuln)
    }));
  },

  async updateVulnerability(id: string, updates: Partial<Vulnerability>): Promise<Vulnerability> {
    return handleResponse<Vulnerability>(await fetch(`${API_BASE}/vulnerabilities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }));
  },

  // FIM
  async getFimEvents(): Promise<FimEvent[]> {
    return handleResponse<FimEvent[]>(await fetch(`${API_BASE}/fim`));
  },

  async createFimEvent(fim: Partial<FimEvent>): Promise<FimEvent> {
    return handleResponse<FimEvent>(await fetch(`${API_BASE}/fim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fim)
    }));
  },

  // MITRE
  async getMitre(): Promise<MitreItem[]> {
    return handleResponse<MitreItem[]>(await fetch(`${API_BASE}/mitre`));
  },

  // Agents
  async getAgents(): Promise<Agent[]> {
    return handleResponse<Agent[]>(await fetch(`${API_BASE}/agents`));
  },

  async createAgent(agent: Partial<Agent>): Promise<Agent> {
    return handleResponse<Agent>(await fetch(`${API_BASE}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent)
    }));
  },

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    return handleResponse<Agent>(await fetch(`${API_BASE}/agents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }));
  },

  async deleteAgent(id: string) {
    return handleResponse<{ success: boolean }>(await fetch(`${API_BASE}/agents/${id}`, {
      method: 'DELETE'
    }));
  },

  async scanAgent(id: string) {
    return handleResponse<{ success: boolean; scanResult: any; agent: Agent }>(await fetch(`${API_BASE}/agents/${id}/scan`, {
      method: 'POST'
    }));
  },

  async isolateAgent(id: string, isolate: boolean) {
    return handleResponse<{ success: boolean; agent: Agent; alert: any }>(await fetch(`${API_BASE}/agents/${id}/isolate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isolate })
    }));
  },

  async executeXdrAction(id: string, action: string, target?: string) {
    return handleResponse<{ success: boolean; action: string; target?: string; agent: Agent; alert: any }>(await fetch(`${API_BASE}/agents/${id}/xdr-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, target })
    }));
  },

  // IP Blacklist & Whitelist
  async getIpLists(): Promise<IpLists> {
    return handleResponse<IpLists>(await fetch(`${API_BASE}/ip-lists`));
  },

  async addBlacklistIp(ip: string): Promise<IpLists> {
    return handleResponse<IpLists>(await fetch(`${API_BASE}/ip-lists/blacklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip })
    }));
  },

  async removeBlacklistIp(ip: string): Promise<IpLists> {
    return handleResponse<IpLists>(await fetch(`${API_BASE}/ip-lists/blacklist/${encodeURIComponent(ip)}`, {
      method: 'DELETE'
    }));
  },

  async addWhitelistIp(ip: string): Promise<IpLists> {
    return handleResponse<IpLists>(await fetch(`${API_BASE}/ip-lists/whitelist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip })
    }));
  },

  async removeWhitelistIp(ip: string): Promise<IpLists> {
    return handleResponse<IpLists>(await fetch(`${API_BASE}/ip-lists/whitelist/${encodeURIComponent(ip)}`, {
      method: 'DELETE'
    }));
  },

  // Wazuh SCA & Syslog Ingestion
  async getScaPolicies(): Promise<ScaPolicy[]> {
    return handleResponse<ScaPolicy[]>(await fetch(`${API_BASE}/wazuh/sca`));
  },

  async runScaScan(): Promise<{ success: boolean; scaPolicies: ScaPolicy[] }> {
    return handleResponse<{ success: boolean; scaPolicies: ScaPolicy[] }>(await fetch(`${API_BASE}/wazuh/sca/scan`, {
      method: 'POST'
    }));
  },

  async ingestWazuhLog(data: { rawLog?: string; agentName?: string; level?: number; ruleId?: string; ruleDescription?: string }) {
    return handleResponse<{ success: boolean; alert: Alert }>(await fetch(`${API_BASE}/wazuh/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }));
  },

  // Huntress Persistent Footholds & Ransomware Canaries
  async getPersistentFootholds(): Promise<PersistentFoothold[]> {
    return handleResponse<PersistentFoothold[]>(await fetch(`${API_BASE}/huntress/footholds`));
  },

  async quarantineFoothold(id: string): Promise<{ success: boolean; foothold: PersistentFoothold; alert: Alert }> {
    return handleResponse<{ success: boolean; foothold: PersistentFoothold; alert: Alert }>(await fetch(`${API_BASE}/huntress/footholds/${id}/quarantine`, {
      method: 'POST'
    }));
  },

  async getRansomwareCanaries(): Promise<RansomwareCanary[]> {
    return handleResponse<RansomwareCanary[]>(await fetch(`${API_BASE}/huntress/canaries`));
  },

  async triggerCanaryTest(id: string): Promise<{ success: boolean; canary: RansomwareCanary; alert: Alert; agentIsolated: boolean }> {
    return handleResponse<{ success: boolean; canary: RansomwareCanary; alert: Alert; agentIsolated: boolean }>(await fetch(`${API_BASE}/huntress/canaries/${id}/trigger-test`, {
      method: 'POST'
    }));
  },

  // Webroot Web Threat Shield, DNS & Threat Intel
  async getDnsLogs(): Promise<DnsQueryLog[]> {
    return handleResponse<DnsQueryLog[]>(await fetch(`${API_BASE}/webroot/dns-logs`));
  },

  async blockDnsDomain(domain: string, category?: string): Promise<{ success: boolean; dnsLog: DnsQueryLog }> {
    return handleResponse<{ success: boolean; dnsLog: DnsQueryLog }>(await fetch(`${API_BASE}/webroot/dns-block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, category })
    }));
  },

  async getThreatIntelHashes(): Promise<ThreatIntelHash[]> {
    return handleResponse<ThreatIntelHash[]>(await fetch(`${API_BASE}/webroot/threat-intel/hashes`));
  },

  async lookupThreatHash(hash: string): Promise<{ matchFound: boolean; threatData: ThreatIntelHash }> {
    return handleResponse<{ matchFound: boolean; threatData: ThreatIntelHash }>(await fetch(`${API_BASE}/webroot/threat-intel/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash })
    }));
  },


  async getAgentInventory(agentId: string): Promise<InventoryData> {
    return handleResponse<InventoryData>(await fetch(`${API_BASE}/agents/${agentId}/inventory`));
  },

  async addInventoryItem(agentId: string, category: 'hardware' | 'network' | 'packages' | 'processes', item: any): Promise<InventoryData> {
    return handleResponse<InventoryData>(await fetch(`${API_BASE}/agents/${agentId}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, item })
    }));
  },

  // Users & Admin
  async getUsers(): Promise<User[]> {
    return handleResponse<User[]>(await fetch(`${API_BASE}/users`));
  },

  async createUser(user: Partial<User>): Promise<User> {
    return handleResponse<User>(await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    }));
  },

  async deleteUser(id: string) {
    return handleResponse<{ success: boolean }>(await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE'
    }));
  },

  async getRoles(): Promise<Role[]> {
    return handleResponse<Role[]>(await fetch(`${API_BASE}/roles`));
  },

  async createRole(role: Partial<Role>): Promise<Role> {
    return handleResponse<Role>(await fetch(`${API_BASE}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(role)
    }));
  },

  async getPolicies(): Promise<Policy[]> {
    return handleResponse<Policy[]>(await fetch(`${API_BASE}/policies`));
  },

  async createPolicy(policy: Partial<Policy>): Promise<Policy> {
    return handleResponse<Policy>(await fetch(`${API_BASE}/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy)
    }));
  },

  // Rules
  async getRules() {
    return handleResponse<any[]>(await fetch(`${API_BASE}/rules`));
  },

  async createRule(rule: any) {
    return handleResponse<any>(await fetch(`${API_BASE}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    }));
  },

  async updateRule(id: string, updates: any) {
    return handleResponse<any>(await fetch(`${API_BASE}/rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }));
  },

  // Decoders
  async getDecoders() {
    return handleResponse<any[]>(await fetch(`${API_BASE}/decoders`));
  },

  async createDecoder(decoder: any) {
    return handleResponse<any>(await fetch(`${API_BASE}/decoders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decoder)
    }));
  },

  // CDB Lists
  async getCdbLists() {
    return handleResponse<any[]>(await fetch(`${API_BASE}/cdb`));
  },

  async createCdbList(list: any) {
    return handleResponse<any>(await fetch(`${API_BASE}/cdb`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list)
    }));
  },

  // DevTools & Simulation
  async testLog(logLine: string) {
    return handleResponse<any>(await fetch(`${API_BASE}/devtools/test-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logLine })
    }));
  },

  async simulateThreat() {
    return handleResponse<any>(await fetch(`${API_BASE}/devtools/simulate-threat`, {
      method: 'POST'
    }));
  },

  // Configuration
  async getConfig() {
    return handleResponse<any>(await fetch(`${API_BASE}/config`));
  },

  async updateConfig(config: any) {
    return handleResponse<any>(await fetch(`${API_BASE}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    }));
  },

  // Enterprise Integrations (LDAPS, SAML, Jira, Webhooks, Syslog)
  async getIntegrations() {
    return handleResponse<any>(await fetch(`${API_BASE}/integrations`));
  },

  async updateIntegrations(integrations: any) {
    return handleResponse<any>(await fetch(`${API_BASE}/integrations`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(integrations)
    }));
  },

  // API Keys
  async getApiKeys() {
    return handleResponse<any[]>(await fetch(`${API_BASE}/api-keys`));
  },

  async createApiKey(name: string) {
    return handleResponse<any>(await fetch(`${API_BASE}/api-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    }));
  },

  async deleteApiKey(id: string) {
    return handleResponse<{ success: boolean }>(await fetch(`${API_BASE}/api-keys/${id}`, {
      method: 'DELETE'
    }));
  },

  // Search
  async globalSearch(q: string) {
    return handleResponse<{
      agents: Agent[];
      alerts: Alert[];
      rules: any[];
      vulnerabilities: Vulnerability[];
    }>(await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`));
  },

  // SOC Cases
  async getCases(): Promise<any[]> {
    return handleResponse<any[]>(await fetch(`${API_BASE}/cases`));
  },

  async createCase(c: any): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c)
    }));
  },

  async updateCase(id: string, updates: any): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/cases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }));
  },

  async deleteCase(id: string): Promise<{ success: boolean }> {
    return handleResponse<{ success: boolean }>(await fetch(`${API_BASE}/cases/${id}`, {
      method: 'DELETE'
    }));
  },

  // SOAR Playbooks
  async getPlaybooks(): Promise<any[]> {
    return handleResponse<any[]>(await fetch(`${API_BASE}/soar/playbooks`));
  },

  async executePlaybook(id: string): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/soar/playbooks/${id}/execute`, {
      method: 'POST'
    }));
  },

  // Oracle AI Assistant
  async askOracle(query: string): Promise<{ reply: string }> {
    return handleResponse<{ reply: string }>(await fetch(`${API_BASE}/oracle/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    }));
  },

  // =========================================================================
  // HORUS SEARCH & HQL ENGINE (54, 55, 56)
  // =========================================================================
  async executeHqlQuery(query: string): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/horus-search/hql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    }));
  },

  async getHscEvents(params?: { search?: string; category?: string; severity?: string; limit?: number }): Promise<any[]> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.category) q.append('category', params.category);
    if (params?.severity) q.append('severity', params.severity);
    if (params?.limit) q.append('limit', String(params.limit));
    return handleResponse<any[]>(await fetch(`${API_BASE}/horus-search/events?${q.toString()}`));
  },

  async getSavedQueries(): Promise<any[]> {
    return handleResponse<any[]>(await fetch(`${API_BASE}/horus-search/saved-queries`));
  },

  async saveHqlQuery(queryObj: any): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/horus-search/saved-queries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryObj)
    }));
  },

  // =========================================================================
  // HORUS TIMELINE INVESTIGATION (57)
  // =========================================================================
  async getTimeline(): Promise<any[]> {
    return handleResponse<any[]>(await fetch(`${API_BASE}/timeline`));
  },

  async updateTimelineItem(id: string, updates: any): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/timeline/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }));
  },

  async addTimelineItem(item: any): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    }));
  },

  // =========================================================================
  // ENTITY ANALYTICS & UEBA (58)
  // =========================================================================
  async getEntityProfiles(): Promise<any[]> {
    return handleResponse<any[]>(await fetch(`${API_BASE}/entity-analytics`));
  },

  // =========================================================================
  // HORUS DETECTION RULES & DETECTION-AS-CODE (59, 60, 84)
  // =========================================================================
  async getHorusDetectionRules(): Promise<any[]> {
    return handleResponse<any[]>(await fetch(`${API_BASE}/horus-detections`));
  },

  async updateHorusDetectionRule(id: string, updates: any): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/horus-detections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }));
  },

  async createHorusDetectionRule(rule: any): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/horus-detections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    }));
  },

  async testDetectionRule(id: string): Promise<{ matchedEvents: number; sampleMatches: any[] }> {
    return handleResponse<{ matchedEvents: number; sampleMatches: any[] }>(await fetch(`${API_BASE}/horus-detections/${id}/test`, {
      method: 'POST'
    }));
  },

  // =========================================================================
  // SUPPRESSION, EXCEPTIONS & FILTERING (61, 62, 63)
  // =========================================================================
  async getSuppressionRules(): Promise<any[]> {
    return handleResponse<any[]>(await fetch(`${API_BASE}/suppression-rules`));
  },

  async createSuppressionRule(rule: any): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/suppression-rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    }));
  },

  async getSecurityExceptions(): Promise<any[]> {
    return handleResponse<any[]>(await fetch(`${API_BASE}/exceptions`));
  },

  async createSecurityException(exc: any): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/exceptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exc)
    }));
  },

  async getEventFilters(): Promise<any[]> {
    return handleResponse<any[]>(await fetch(`${API_BASE}/event-filters`));
  },

  // =========================================================================
  // LIVE ENDPOINT QUERY (OSQUERY) (64)
  // =========================================================================
  async getLiveQueryPacks(): Promise<any[]> {
    return handleResponse<any[]>(await fetch(`${API_BASE}/live-query/packs`));
  },

  async executeLiveQuery(query: string, targetAgents: string[]): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/live-query/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, targetAgents })
    }));
  },

  // =========================================================================
  // ATTACK DISCOVERY & ML ANALYTICS (66, 67)
  // =========================================================================
  async getAttackDiscoveryStories(): Promise<any[]> {
    return handleResponse<any[]>(await fetch(`${API_BASE}/attack-discovery`));
  },

  async containAttackStory(id: string): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/attack-discovery/${id}/contain`, {
      method: 'POST'
    }));
  },

  async getMlAnomalies(): Promise<any[]> {
    return handleResponse<any[]>(await fetch(`${API_BASE}/ml-anomalies`));
  },

  // =========================================================================
  // LOG DATA HEALTH & LIFECYCLE (70, 71, 72, 73, 74)
  // =========================================================================
  async getDataHealth(): Promise<{ sources: any[]; summary: any }> {
    return handleResponse<{ sources: any[]; summary: any }>(await fetch(`${API_BASE}/data-health`));
  },

  async getDataLifecycles(): Promise<any[]> {
    return handleResponse<any[]>(await fetch(`${API_BASE}/data-lifecycle`));
  },

  async parseLogWithAi(rawLog: string): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/schema/parse-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawLog })
    }));
  },

  // =========================================================================
  // CONTENT PACKS & MARKETPLACE (85, 86)
  // =========================================================================
  async getContentPacks(): Promise<any[]> {
    return handleResponse<any[]>(await fetch(`${API_BASE}/content-packs`));
  },

  async toggleContentPack(id: string, installed: boolean): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/content-packs/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ installed })
    }));
  },

  // =========================================================================
  // REAL-TIME WORLD ATTACK MAP & LIVE THREAT INTELLIGENCE
  // =========================================================================
  async getRealtimeAttacks(limit: number = 40): Promise<any[]> {
    return handleResponse<any[]>(await fetch(`${API_BASE}/threats/realtime-attacks?limit=${limit}`));
  },

  async getThreatStats(): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/threats/stats`));
  },

  async getThreatPulse(): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/threats/pulse`));
  },

  async refreshThreatFeeds(): Promise<any> {
    return handleResponse<any>(await fetch(`${API_BASE}/threats/refresh`, {
      method: 'POST'
    }));
  },

  // Reset all runtime logs and telemetry state
  async resetData(): Promise<{ success: boolean; message: string }> {
    return handleResponse<{ success: boolean; message: string }>(await fetch(`${API_BASE}/reset-data`, {
      method: 'POST'
    }));
  }
};
