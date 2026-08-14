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

// =========================================================================
// 54 & 70. HORUS SECURITY COMMON SCHEMA (HSC) & EVENT EXPLORER
// =========================================================================
export interface HscEvent {
  id: string;
  timestamp: string;
  event: {
    id: string;
    time: string;
    category: 'authentication' | 'process' | 'network' | 'file' | 'dns' | 'cloud' | 'alert' | 'threat_intel';
    action: string;
    outcome: 'success' | 'failure' | 'denied' | 'blocked' | 'unknown';
    dataset: string;
    severity?: number;
  };
  organization: {
    id: string;
    name?: string;
  };
  host?: {
    id: string;
    name: string;
    os: string;
    ip: string;
  };
  user?: {
    id?: string;
    name: string;
    domain?: string;
    role?: string;
    riskScore?: number;
  };
  process?: {
    id?: number;
    name: string;
    command_line?: string;
    parent?: string;
    path?: string;
  };
  file?: {
    name: string;
    path: string;
    hash?: string;
    size?: number;
  };
  source?: {
    ip: string;
    port?: number;
    geo?: string;
  };
  destination?: {
    ip: string;
    port?: number;
    domain?: string;
    geo?: string;
  };
  dns?: {
    question: string;
    answer?: string;
  };
  threat?: {
    indicator?: string;
    technique?: string;
    tactic?: string;
    confidence?: number;
  };
  risk?: {
    score: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  rawJson?: string;
}

// =========================================================================
// 55. HQL (HORUS QUERY LANGUAGE) ENGINE
// =========================================================================
export interface HqlSavedQuery {
  id: string;
  name: string;
  description: string;
  query: string;
  category: string;
  author: string;
  lastRun?: string;
}

export interface HqlQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  totalHits: number;
  executionTimeMs: number;
  aggregations?: {
    field: string;
    buckets: { key: string; count: number }[];
  }[];
}

// =========================================================================
// 57. SECURITY TIMELINE INVESTIGATION WORKSPACE
// =========================================================================
export interface TimelineItem {
  id: string;
  timestamp: string;
  source: 'endpoint' | 'auth' | 'network' | 'process' | 'fim' | 'cloud' | 'dns';
  summary: string;
  entity: string;
  mitreTactic?: string;
  mitreTechnique?: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  pinned: boolean;
  notes?: string;
  hscEvent?: HscEvent;
}

// =========================================================================
// 58. ENTITY ANALYTICS & UEBA
// =========================================================================
export interface EntityRiskProfile {
  id: string;
  entityType: 'User' | 'Host' | 'Service' | 'Cloud Workload';
  name: string;
  identifier: string;
  riskScore: number; // 0 - 100
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  department?: string;
  os?: string;
  lastSeen: string;
  riskContributors: {
    reason: string;
    points: number;
    timestamp: string;
    category: string;
  }[];
  peerComparison: {
    peerAverage: number;
    percentile: number;
    anomalousActivities: string[];
  };
  timelineEvents: number;
}

// =========================================================================
// 59 & 60 & 84. DETECTION RULE LIBRARY & DETECTION-AS-CODE
// =========================================================================
export interface HorusDetectionRule {
  id: string;
  ruleId: string;
  version: string;
  name: string;
  author: string;
  description: string;
  ruleType: 'query' | 'threshold' | 'new_term' | 'sequence' | 'indicator_match' | 'behavioral' | 'ml' | 'correlation' | 'suppression';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  confidence: number;
  status: 'Development' | 'Testing' | 'Staging' | 'Production';
  enabled: boolean;
  mitre: {
    tactic: string;
    technique: string;
  };
  query: string;
  schedule: string;
  lookback: string;
  threshold?: {
    field: string;
    count: number;
    windowMinutes: number;
  };
  investigationGuide: string[];
  responseActions: string[];
  yamlCode?: string;
  lastModified: string;
}

// =========================================================================
// 61, 62 & 63. SUPPRESSION, EXCEPTIONS & EVENT FILTERING
// =========================================================================
export interface SuppressionRule {
  id: string;
  name: string;
  field: 'user' | 'host' | 'process' | 'hash' | 'rule' | 'ip' | 'domain';
  value: string;
  active: boolean;
  suppressedEventsCount: number;
  lastSuppressed: string;
}

export interface SecurityException {
  id: string;
  title: string;
  scope: 'Endpoint' | 'Detection Rule' | 'Trusted App' | 'Trusted Hash' | 'Network Excluded';
  targetValue: string;
  owner: string;
  reason: string;
  createdTime: string;
  expiration: string;
  status: 'Active' | 'Expired' | 'Revoked';
}

export interface EventFilterPolicy {
  id: string;
  name: string;
  dataSource: string;
  condition: string;
  estimatedReductionGbDay: number;
  status: 'Active' | 'Simulating' | 'Disabled';
}

// =========================================================================
// 64. HORUS LIVE QUERY (OSQUERY ENDPOINT INTERROGATION)
// =========================================================================
export interface LiveQueryPack {
  id: string;
  name: string;
  description: string;
  targetCategory: 'Ransomware Triage' | 'Lateral Movement' | 'Incident Forensics' | 'Compliance & Baseline' | 'Custom';
  sqlQuery: string;
  defaultIntervalSeconds: number;
}

export interface LiveQueryResult {
  id: string;
  query: string;
  targetAgents: string[];
  executedAt: string;
  status: 'Completed' | 'Running' | 'Failed';
  rows: Record<string, any>[];
}

// =========================================================================
// 66. HORUS ATTACK DISCOVERY (AI-DRIVEN COALESCED ATTACK STORIES)
// =========================================================================
export interface AttackDiscoveryStory {
  id: string; // e.g. HD-9831
  title: string;
  summary: string;
  confidence: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  riskScore: number;
  startTime: string;
  lastUpdate: string;
  status: 'Active Attack' | 'Investigating' | 'Contained' | 'Closed';
  affectedEntities: {
    users: string[];
    endpoints: string[];
    servers: string[];
    ips: string[];
  };
  stages: {
    stageNumber: number;
    tactic: string;
    technique: string;
    timestamp: string;
    description: string;
    severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    source: string;
  }[];
  mitreCoverage: string[];
  threatActor?: string;
  recommendedActions: string[];
}

// =========================================================================
// 67. MACHINE LEARNING SECURITY ANALYTICS
// =========================================================================
export interface MlAnomalyRecord {
  id: string;
  anomalyType: 'Rare Process' | 'Abnormal Login Time' | 'Data Exfiltration Spike' | 'Beaconing C2' | 'Unusual DNS Query' | 'Impossible Travel';
  entity: string;
  anomalyScore: number; // 0 - 100
  baselineDescription: string;
  observedValue: string;
  whyUnusual: string;
  timestamp: string;
  confidence: number;
}

// =========================================================================
// 73. LOG INGESTION DATA HEALTH & LIFECYCLE
// =========================================================================
export interface LogSourceHealth {
  id: string;
  name: string;
  category: string;
  eventsPerSec: number;
  gbPerDay: number;
  lastEventTime: string;
  status: 'HEALTHY' | 'DELAYED' | 'CRITICAL';
  parserErrors: number;
  queueDepth: string;
}

export interface DataLifecyclePolicy {
  tier: 'HOT' | 'WARM' | 'COLD' | 'ARCHIVE';
  storageMedium: string;
  retentionDays: number;
  currentSizeGb: number;
  searchLatency: string;
  costMonthly: string;
}

// =========================================================================
// 85 & 86. SECURITY CONTENT PACKS & MARKETPLACE
// =========================================================================
export interface SecurityContentPack {
  id: string;
  name: string;
  category: 'Operating Systems' | 'Cloud & SaaS' | 'Threat Defense' | 'Compliance';
  version: string;
  author: string;
  description: string;
  rulesCount: number;
  dashboardsCount: number;
  playbooksCount: number;
  installed: boolean;
  verifiedSigned: boolean;
}


