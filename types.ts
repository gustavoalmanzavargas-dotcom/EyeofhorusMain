export interface Agent {
  id: string;
  name: string;
  ip: string;
  os: string;
  version: string;
  status: 'Active' | 'Disconnected' | 'Never connected' | 'Isolated';
  dateAdded: string;
  key?: string;
  isolated?: boolean;
  scanResult?: any;
}

export interface Alert {
  id: string;
  time: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  technique: string;
  tactic: string;
  description: string;
  level: number;
  ruleId: string;
  rule?: string; // Some views use 'rule' instead of 'ruleId'
  agent?: string; // Some views use 'agent' instead of 'agentName'
  Mitre?: string;
}

export interface Vulnerability {
  id: string;
  cve: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  package: string;
  affected_agents: number;
  status: string;
}

export interface FimEvent {
  id: string;
  timestamp: string;
  agent: string;
  type: string;
  path: string;
}

export interface MitreItem {
  id: string;
  tactic: string;
  technique: string;
  alerts: number;
}

export interface DashboardStats {
  totalAlerts: number;
  level12Alerts: number;
  authFailure: number;
}

export interface DashboardData {
  stats: DashboardStats;
  alertsEvolution: { name: string; count: number }[];
  mitreAttck: { name: string; value: number }[];
  topAgents: { name: string; value: number }[];
  topAgentsEvolution: any[];
  securityAlerts: Alert[];
}

export interface Rule {
  id: string;
  level: number;
  description: string;
  group: string;
  status: 'Enabled' | 'Disabled';
  category: string;
}

export interface Decoder {
  id: string;
  name: string;
  type: string;
  parent: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface CdbList {
  id: string;
  name: string;
  entriesCount: number;
  description: string;
  entries: string[];
}

export interface SystemConfig {
  serverName: string;
  alertThresholdLevel: number;
  autoAcknowledgeLowLevel: boolean;
  logRetentionDays: number;
  syslogPort: number;
  webhookUrl: string;
  webhookEnabled: boolean;
  emailNotifications: boolean;
  adminEmail: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
  status: 'Active' | 'Revoked';
  token?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  policyIds: string[];
}

export interface Policy {
  id: string;
  resource: string;
  description: string;
}

export interface InventoryData {
  hardware?: any[];
  network?: any[];
  packages?: any[];
  processes?: any[];
  registry?: any[];
  securityPosture?: {
    lastScanTime: string;
    status: string;
    cisScore: string;
    openPorts: string[];
    activeDefenses: string[];
    eventsCount?: number;
    vulnsCount?: number;
    fimCount?: number;
    summary?: string;
  };
}

export interface IpLists {
  blacklist: string[];
  whitelist: string[];
}

// Wazuh Interoperability: Security Configuration Assessment (SCA)
export interface ScaCheck {
  id: string;
  policyId: string;
  title: string;
  cisControl: string;
  result: 'PASSED' | 'FAILED';
  rationale: string;
  remediation: string;
  agentName: string;
}

export interface ScaPolicy {
  id: string;
  name: string;
  benchmark: string;
  targetOS: string;
  passCount: number;
  failCount: number;
  scoreRatio: number; // e.g. 92%
  checks: ScaCheck[];
}

// Huntress Interoperability: Persistent Footholds & Ransomware Canaries
export interface PersistentFoothold {
  id: string;
  agentName: string;
  location: string; // e.g. HKLM\Run, /etc/systemd/system, Scheduled Task
  mechanism: string;
  executablePath: string;
  status: 'Audited' | 'Suspicious' | 'Quarantined';
  threatScore: number;
  mitreTechnique: string;
}

export interface RansomwareCanary {
  id: string;
  agentName: string;
  filePath: string;
  fileType: string;
  status: 'Armed Trap' | 'Tampered / Ransomware Triggered' | 'Disarmed';
  lastChecked: string;
  processResponsible?: string;
}

// Webroot Interoperability: Web Threat Shield, DNS Filtering & Threat Intelligence Hashes
export interface DnsQueryLog {
  id: string;
  timestamp: string;
  agentName: string;
  domain: string;
  category: string; // e.g. Phishing, Malware C2, Clean
  action: 'ALLOWED' | 'BLOCKED BY WEBROOT SHIELD';
  clientIp: string;
}

export interface ThreatIntelHash {
  id: string;
  md5: string;
  sha256: string;
  fileName: string;
  classification: 'Malicious Ransomware' | 'Trojan Dropper' | 'Adware / PUA' | 'Clean Certified';
  reputationScore: number; // 0 (Clean) to 100 (Deadly)
  firstSeen: string;
}

