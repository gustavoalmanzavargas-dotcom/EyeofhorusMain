import { 
  HscEvent, 
  HqlSavedQuery, 
  HqlQueryResult, 
  TimelineItem, 
  EntityRiskProfile, 
  HorusDetectionRule,
  SuppressionRule,
  SecurityException,
  EventFilterPolicy,
  LiveQueryPack,
  LiveQueryResult,
  AttackDiscoveryStory,
  MlAnomalyRecord,
  LogSourceHealth,
  DataLifecyclePolicy,
  SecurityContentPack
} from '../types';

// =========================================================================
// 70. HORUS SECURITY COMMON SCHEMA (HSC) DATASET
// =========================================================================
export let hscEvents: HscEvent[] = [
  {
    id: 'hsc-evt-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    event: {
      id: 'EVT-9921',
      time: '14:22:04',
      category: 'process',
      action: 'process_started',
      outcome: 'success',
      dataset: 'endpoint.events',
      severity: 8
    },
    organization: { id: 'org-cyverax-corp', name: 'Cyverax Enterprise' },
    host: { id: '002', name: 'win-dc-primary', os: 'Windows Server 2022', ip: '10.0.1.10' },
    user: { id: 'u-102', name: 'svc-backup', domain: 'CYVERAX', role: 'Service Account', riskScore: 88 },
    process: {
      id: 4892,
      name: 'powershell.exe',
      command_line: 'powershell.exe -NonI -W Hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAA...',
      parent: 'explorer.exe',
      path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
    },
    file: { name: 'payload.ps1', path: 'C:\\Users\\svc-backup\\AppData\\Local\\Temp\\payload.ps1', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', size: 14320 },
    threat: { indicator: 'powershell_encoded_payload', technique: 'T1059.001', tactic: 'Execution', confidence: 95 },
    risk: { score: 92, severity: 'CRITICAL' },
    rawJson: JSON.stringify({ EventID: 4688, ProcessName: 'powershell.exe', CommandLine: '-enc SQBFAFg...', SubjectUserName: 'svc-backup' }, null, 2)
  },
  {
    id: 'hsc-evt-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    event: {
      id: 'EVT-9920',
      time: '14:16:12',
      category: 'authentication',
      action: 'user_login',
      outcome: 'failure',
      dataset: 'identity.auth',
      severity: 6
    },
    organization: { id: 'org-cyverax-corp', name: 'Cyverax Enterprise' },
    host: { id: '002', name: 'win-dc-primary', os: 'Windows Server 2022', ip: '10.0.1.10' },
    user: { id: 'u-104', name: 'admin.root', domain: 'CYVERAX', role: 'Domain Admin', riskScore: 94 },
    source: { ip: '185.220.101.45', port: 51240, geo: 'Frankfurt, DE' },
    destination: { ip: '10.0.1.10', port: 3389, domain: 'win-dc-primary.cyverax.local' },
    threat: { indicator: 'brute_force_rdp', technique: 'T1110.001', tactic: 'Credential Access', confidence: 88 },
    risk: { score: 85, severity: 'HIGH' },
    rawJson: JSON.stringify({ EventID: 4625, LogonType: 10, TargetUserName: 'admin.root', IpAddress: '185.220.101.45', Status: '0xC000006D' }, null, 2)
  },
  {
    id: 'hsc-evt-103',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    event: {
      id: 'EVT-9919',
      time: '14:09:40',
      category: 'dns',
      action: 'dns_query',
      outcome: 'blocked',
      dataset: 'network.dns',
      severity: 9
    },
    organization: { id: 'org-cyverax-corp', name: 'Cyverax Enterprise' },
    host: { id: '001', name: 'ubuntu-web-prod', os: 'Ubuntu 24.04 LTS', ip: '10.0.2.15' },
    user: { id: 'u-101', name: 'www-data', role: 'System Daemon', riskScore: 78 },
    dns: { question: 'c2-sync-update.malicious-botnet.ru', answer: '0.0.0.0 (Sinkholed by Horus Webroot Shield)' },
    source: { ip: '10.0.2.15', port: 54122 },
    destination: { ip: '198.51.100.89', port: 53, domain: 'c2-sync-update.malicious-botnet.ru', geo: 'St. Petersburg, RU' },
    threat: { indicator: 'malicious_c2_dns', technique: 'T1071.004', tactic: 'Command and Control', confidence: 98 },
    risk: { score: 95, severity: 'CRITICAL' },
    rawJson: JSON.stringify({ QueryDomain: 'c2-sync-update.malicious-botnet.ru', QueryType: 'A', Action: 'BLOCK', ThreatFeed: 'Cyverax Webroot Intel' }, null, 2)
  },
  {
    id: 'hsc-evt-104',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    event: {
      id: 'EVT-9918',
      time: '13:59:15',
      category: 'network',
      action: 'smb_connection',
      outcome: 'success',
      dataset: 'network.traffic',
      severity: 7
    },
    organization: { id: 'org-cyverax-corp', name: 'Cyverax Enterprise' },
    host: { id: '003', name: 'k8s-worker-04', os: 'Debian 12', ip: '10.0.3.50' },
    user: { id: 'u-105', name: 'john.smith', domain: 'CYVERAX', role: 'DevOps Engineer', riskScore: 65 },
    source: { ip: '10.0.3.50', port: 49152 },
    destination: { ip: '10.0.1.10', port: 445, domain: 'win-dc-primary' },
    threat: { indicator: 'lateral_movement_smb', technique: 'T1021.002', tactic: 'Lateral Movement', confidence: 82 },
    risk: { score: 75, severity: 'HIGH' },
    rawJson: JSON.stringify({ Protocol: 'SMB2', ShareName: '\\\\win-dc-primary\\C$', ClientIP: '10.0.3.50', AccessMask: '0x12019F' }, null, 2)
  },
  {
    id: 'hsc-evt-105',
    timestamp: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
    event: {
      id: 'EVT-9917',
      time: '13:46:02',
      category: 'file',
      action: 'file_modified',
      outcome: 'success',
      dataset: 'endpoint.fim',
      severity: 9
    },
    organization: { id: 'org-cyverax-corp', name: 'Cyverax Enterprise' },
    host: { id: '001', name: 'ubuntu-web-prod', os: 'Ubuntu 24.04 LTS', ip: '10.0.2.15' },
    user: { id: 'u-101', name: 'root', role: 'Superuser', riskScore: 82 },
    file: { name: 'authorized_keys', path: '/root/.ssh/authorized_keys', hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0', size: 1048 },
    process: { id: 3102, name: 'sshd', command_line: 'sshd: root@pts/2' },
    threat: { indicator: 'ssh_backdoor_injection', technique: 'T1098.004', tactic: 'Persistence', confidence: 92 },
    risk: { score: 90, severity: 'CRITICAL' },
    rawJson: JSON.stringify({ FimAction: 'MODIFY', TargetPath: '/root/.ssh/authorized_keys', ChecksumBefore: '88ab29c...', ChecksumAfter: 'a1b2c3d...' }, null, 2)
  },
  {
    id: 'hsc-evt-106',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    event: {
      id: 'EVT-9916',
      time: '13:34:20',
      category: 'cloud',
      action: 'iam_policy_changed',
      outcome: 'success',
      dataset: 'cloud.aws.cloudtrail',
      severity: 8
    },
    organization: { id: 'org-cyverax-corp', name: 'Cyverax Enterprise' },
    user: { id: 'u-108', name: 'cloud-deployer-role', role: 'AWS IAM Role', riskScore: 84 },
    source: { ip: '198.51.100.22', geo: 'Amsterdam, NL' },
    threat: { indicator: 'iam_privilege_escalation', technique: 'T1078.004', tactic: 'Privilege Escalation', confidence: 90 },
    risk: { score: 86, severity: 'HIGH' },
    rawJson: JSON.stringify({ EventSource: 'iam.amazonaws.com', EventName: 'AttachRolePolicy', PolicyArn: 'arn:aws:iam::aws:policy/AdministratorAccess', UserIdentity: { type: 'AssumedRole', principalId: 'AROAV89219' } }, null, 2)
  },
  {
    id: 'hsc-evt-107',
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    event: {
      id: 'EVT-9915',
      time: '13:19:10',
      category: 'authentication',
      action: 'mfa_fatigue_push',
      outcome: 'success',
      dataset: 'identity.okta',
      severity: 8
    },
    organization: { id: 'org-cyverax-corp', name: 'Cyverax Enterprise' },
    user: { id: 'u-105', name: 'john.smith', domain: 'CYVERAX', role: 'DevOps Engineer', riskScore: 65 },
    source: { ip: '93.184.216.34', geo: 'Zurich, CH' },
    threat: { indicator: 'mfa_prompt_bombing', technique: 'T1621', tactic: 'Credential Access', confidence: 86 },
    risk: { score: 82, severity: 'HIGH' },
    rawJson: JSON.stringify({ EventType: 'user.mfa.okta_verify.push', FactorType: 'Push', PushAttemptsCount: 14, Outcome: 'SUCCESS_AFTER_14_ATTEMPTS' }, null, 2)
  },
  {
    id: 'hsc-evt-108',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    event: {
      id: 'EVT-9914',
      time: '13:04:45',
      category: 'process',
      action: 'lsass_memory_dump',
      outcome: 'success',
      dataset: 'endpoint.events',
      severity: 10
    },
    organization: { id: 'org-cyverax-corp', name: 'Cyverax Enterprise' },
    host: { id: '002', name: 'win-dc-primary', os: 'Windows Server 2022', ip: '10.0.1.10' },
    user: { id: 'u-104', name: 'SYSTEM', domain: 'NT AUTHORITY', role: 'Local System', riskScore: 90 },
    process: {
      id: 6112,
      name: 'rundll32.exe',
      command_line: 'rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump 720 C:\\Windows\\Temp\\lsass.dmp full',
      parent: 'cmd.exe',
      path: 'C:\\Windows\\System32\\rundll32.exe'
    },
    threat: { indicator: 'comsvcs_lsass_dump', technique: 'T1003.001', tactic: 'Credential Access', confidence: 99 },
    risk: { score: 98, severity: 'CRITICAL' },
    rawJson: JSON.stringify({ EventID: 10, TargetImage: 'C:\\Windows\\System32\\lsass.exe', GrantedAccess: '0x1FFFFF', CallTrace: 'C:\\Windows\\SYSTEM32\\ntdll.dll+9d8f4' }, null, 2)
  }
];

// =========================================================================
// 55. HQL (HORUS QUERY LANGUAGE) SAVED QUERIES & SAMPLES
// =========================================================================
export let hqlSavedQueries: HqlSavedQuery[] = [
  {
    id: 'hql-q1',
    name: 'Suspicious Encoded PowerShell Execution',
    description: 'Finds powershell commands containing base64 -enc parameters',
    query: 'FROM endpoint.events\n| WHERE process.name == "powershell.exe"\n| WHERE process.command_line CONTAINS "-enc"\n| GROUP BY host.name, user.name\n| SORT timestamp DESC',
    category: 'Threat Hunting',
    author: 'Cyverax SOC',
    lastRun: '10 mins ago'
  },
  {
    id: 'hql-q2',
    name: 'Failed RDP & SSH Logins by User Count >= 5',
    description: 'Surfaces brute force attempts across Domain Controllers and Linux servers',
    query: 'FROM identity.auth\n| WHERE event.outcome == "failure"\n| STATS COUNT(*) AS failures BY user.name, source.ip\n| WHERE failures >= 5\n| SORT failures DESC',
    category: 'Identity Security',
    author: 'Gustavo Almanza',
    lastRun: '22 mins ago'
  },
  {
    id: 'hql-q3',
    name: 'Malicious C2 & High-Entropy DNS Queries',
    description: 'Queries filtered or blocked DNS lookups against known threat intel lists',
    query: 'FROM network.dns\n| WHERE event.outcome == "blocked" OR threat.confidence >= 80\n| GROUP BY dns.question, destination.ip\n| LIMIT 50',
    category: 'Network & C2',
    author: 'Horus Threat Intel',
    lastRun: '1 hour ago'
  },
  {
    id: 'hql-q4',
    name: 'LSASS Memory Dumping & Credential Extraction',
    description: 'Detects processes accessing lsass.exe process memory space',
    query: 'FROM endpoint.events\n| WHERE threat.technique == "T1003.001"\n| STATS COUNT() BY host.name, process.name\n| SORT timestamp DESC',
    category: 'Credential Access',
    author: 'Cyverax Detection Lab',
    lastRun: '2 hours ago'
  }
];

// =========================================================================
// HQL QUERY EVALUATOR (Original Cyverax Query Parser & Execution Engine)
// =========================================================================
export function evaluateHqlQuery(queryString: string): HqlQueryResult {
  const startTime = Date.now();
  let results = [...hscEvents];

  const lines = queryString
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));

  let limit = 100;
  let sortField = 'timestamp';
  let sortDir = 'DESC';
  let groupByFields: string[] = [];

  for (const line of lines) {
    const cleanLine = line.startsWith('|') ? line.substring(1).trim() : line;

    if (cleanLine.toUpperCase().startsWith('FROM')) {
      const dataset = cleanLine.substring(4).trim().toLowerCase();
      if (dataset !== '*' && dataset !== 'all') {
        results = results.filter(e => e.event.dataset.toLowerCase().includes(dataset) || dataset.includes(e.event.dataset.toLowerCase()));
      }
    } else if (cleanLine.toUpperCase().startsWith('WHERE')) {
      const condition = cleanLine.substring(5).trim();
      
      // Simple condition parsers
      if (condition.includes('==')) {
        const [left, right] = condition.split('==').map(s => s.trim().replace(/^["']|["']$/g, ''));
        results = results.filter(e => {
          const val = getNestedValue(e, left);
          return String(val).toLowerCase() === right.toLowerCase();
        });
      } else if (condition.toUpperCase().includes('CONTAINS')) {
        const parts = condition.split(/CONTAINS/i).map(s => s.trim().replace(/^["']|["']$/g, ''));
        const [left, right] = parts;
        results = results.filter(e => {
          const val = getNestedValue(e, left);
          return String(val || '').toLowerCase().includes(right.toLowerCase());
        });
      } else if (condition.includes('>=')) {
        const [left, right] = condition.split('>=').map(s => s.trim());
        const num = parseFloat(right);
        results = results.filter(e => {
          const val = getNestedValue(e, left);
          return typeof val === 'number' && val >= num;
        });
      } else if (condition.includes('>')) {
        const [left, right] = condition.split('>').map(s => s.trim());
        const num = parseFloat(right);
        results = results.filter(e => {
          const val = getNestedValue(e, left);
          return typeof val === 'number' && val > num;
        });
      }
    } else if (cleanLine.toUpperCase().startsWith('GROUP BY')) {
      const fields = cleanLine.substring(8).trim().split(',').map(s => s.trim());
      groupByFields = fields;
    } else if (cleanLine.toUpperCase().startsWith('SORT')) {
      const parts = cleanLine.substring(4).trim().split(' ');
      sortField = parts[0] || 'timestamp';
      sortDir = (parts[1] || 'DESC').toUpperCase();
    } else if (cleanLine.toUpperCase().startsWith('LIMIT')) {
      const lim = parseInt(cleanLine.substring(5).trim(), 10);
      if (!isNaN(lim)) limit = lim;
    }
  }

  // Sort
  results.sort((a, b) => {
    const valA = getNestedValue(a, sortField);
    const valB = getNestedValue(b, sortField);
    if (valA === valB) return 0;
    if (sortDir === 'ASC') {
      return valA > valB ? 1 : -1;
    }
    return valA < valB ? 1 : -1;
  });

  const totalHits = results.length;
  const sliced = results.slice(0, limit);

  // Flatten for table display
  const rows = sliced.map(e => ({
    timestamp: e.timestamp,
    category: e.event.category,
    action: e.event.action,
    outcome: e.event.outcome,
    host: e.host?.name || 'N/A',
    user: e.user?.name || 'N/A',
    process: e.process?.name || 'N/A',
    threat: e.threat?.indicator || 'Clean',
    technique: e.threat?.technique || 'N/A',
    riskScore: e.risk?.score || 0,
    severity: e.risk?.severity || 'LOW',
    raw: e
  }));

  const columns = ['timestamp', 'category', 'action', 'outcome', 'host', 'user', 'process', 'threat', 'technique', 'riskScore', 'severity'];
  const executionTimeMs = Math.max(8, Date.now() - startTime + Math.floor(Math.random() * 15));

  return {
    columns,
    rows,
    totalHits,
    executionTimeMs
  };
}

function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const p of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[p];
  }
  return current;
}

// =========================================================================
// 57. HORUS TIMELINE INVESTIGATION WORKSPACE
// =========================================================================
export let timelineItems: TimelineItem[] = [
  {
    id: 'tl-1',
    timestamp: '09:42:01',
    source: 'auth',
    summary: 'User login from external IP 185.220.101.45 (Frankfurt, DE)',
    entity: 'svc-backup',
    mitreTactic: 'Initial Access',
    mitreTechnique: 'T1078.002',
    severity: 'MEDIUM',
    pinned: true,
    notes: 'Impossible travel anomaly detected: User was logged into Dallas, TX 10 minutes prior.'
  },
  {
    id: 'tl-2',
    timestamp: '09:42:07',
    source: 'auth',
    summary: 'MFA prompt spamming accepted after 14 push denials',
    entity: 'svc-backup',
    mitreTactic: 'Credential Access',
    mitreTechnique: 'T1621',
    severity: 'HIGH',
    pinned: true,
    notes: 'MFA Fatigue attack vector confirmed in Okta event stream.'
  },
  {
    id: 'tl-3',
    timestamp: '09:44:12',
    source: 'endpoint',
    summary: 'Outlook client launched macro-enabled attachment "Invoice_9021.docm"',
    entity: 'win-dc-primary',
    mitreTactic: 'Execution',
    mitreTechnique: 'T1204.002',
    severity: 'HIGH',
    pinned: false,
    notes: 'FIM hash matched known Trojan Dropper signature.'
  },
  {
    id: 'tl-4',
    timestamp: '09:44:15',
    source: 'process',
    summary: 'WINWORD.EXE spawned obfuscated powershell.exe (-enc SQBFAFgA...)',
    entity: 'win-dc-primary',
    mitreTactic: 'Execution',
    mitreTechnique: 'T1059.001',
    severity: 'CRITICAL',
    pinned: true,
    notes: 'Payload initiated in-memory reflection loading.'
  },
  {
    id: 'tl-5',
    timestamp: '09:44:20',
    source: 'network',
    summary: 'PowerShell downloaded second-stage binary from 198.51.100.89:8080',
    entity: 'win-dc-primary',
    mitreTactic: 'Command and Control',
    mitreTechnique: 'T1105',
    severity: 'CRITICAL',
    pinned: true
  },
  {
    id: 'tl-6',
    timestamp: '09:44:34',
    source: 'process',
    summary: 'rundll32.exe invoked comsvcs.dll MiniDump against lsass.exe process ID 720',
    entity: 'win-dc-primary',
    mitreTactic: 'Credential Access',
    mitreTechnique: 'T1003.001',
    severity: 'CRITICAL',
    pinned: true,
    notes: 'Active Response triggered: Automatic host network isolation applied.'
  },
  {
    id: 'tl-7',
    timestamp: '09:45:01',
    source: 'dns',
    summary: 'Outbound DNS lookup to c2-sync-update.malicious-botnet.ru blocked by Webroot Shield',
    entity: 'win-dc-primary',
    mitreTactic: 'Command and Control',
    mitreTechnique: 'T1071.004',
    severity: 'HIGH',
    pinned: false
  },
  {
    id: 'tl-8',
    timestamp: '09:47:55',
    source: 'network',
    summary: 'Lateral movement attempt via SMB to ubuntu-web-prod (10.0.2.15:445)',
    entity: 'win-dc-primary',
    mitreTactic: 'Lateral Movement',
    mitreTechnique: 'T1021.002',
    severity: 'CRITICAL',
    pinned: true,
    notes: 'Blocked by Eye of Horus zero-trust endpoint firewall policy.'
  }
];

// =========================================================================
// 58. ENTITY ANALYTICS & UEBA (USER & HOST RISK PROFILES)
// =========================================================================
export let entityProfiles: EntityRiskProfile[] = [
  {
    id: 'ent-usr-1',
    entityType: 'User',
    name: 'svc-backup',
    identifier: 'CYVERAX\\svc-backup',
    riskScore: 92,
    riskTier: 'CRITICAL',
    department: 'Infrastructure IT',
    lastSeen: '4 mins ago',
    timelineEvents: 142,
    riskContributors: [
      { reason: 'Impossible travel: Login from Germany & Texas in 10 mins', points: 25, timestamp: '14:22', category: 'Authentication' },
      { reason: 'New administrative privileges assigned via token manipulation', points: 20, timestamp: '14:20', category: 'Privilege' },
      { reason: 'Malware-associated endpoint interaction (win-dc-primary)', points: 15, timestamp: '14:18', category: 'Endpoint' },
      { reason: 'Unusual encoded PowerShell script execution', points: 12, timestamp: '14:15', category: 'Execution' },
      { reason: 'Accessed sensitive LSASS memory object', points: 10, timestamp: '14:10', category: 'Credential Access' },
      { reason: 'Threat intelligence match on source IP 185.220.101.45', points: 10, timestamp: '14:05', category: 'Threat Intel' }
    ],
    peerComparison: {
      peerAverage: 18,
      percentile: 99.4,
      anomalousActivities: ['Runs PowerShell interactively', 'After-hours remote desktop logins', 'Outbound SMB connections']
    }
  },
  {
    id: 'ent-usr-2',
    entityType: 'User',
    name: 'john.smith',
    identifier: 'CYVERAX\\john.smith',
    riskScore: 68,
    riskTier: 'HIGH',
    department: 'DevOps Engineering',
    lastSeen: '12 mins ago',
    timelineEvents: 89,
    riskContributors: [
      { reason: 'MFA Push Bombing (14 notifications in 2 minutes)', points: 30, timestamp: '13:19', category: 'Authentication' },
      { reason: 'Anomalous AWS CloudTrail IAM role assumption', points: 20, timestamp: '13:00', category: 'Cloud Security' },
      { reason: 'First-time SSH connection from unusual IP', points: 18, timestamp: '12:45', category: 'Network' }
    ],
    peerComparison: {
      peerAverage: 24,
      percentile: 88.2,
      anomalousActivities: ['Unusual cloud API volume', 'Cross-region deployments']
    }
  },
  {
    id: 'ent-hst-1',
    entityType: 'Host',
    name: 'win-dc-primary',
    identifier: '10.0.1.10',
    riskScore: 96,
    riskTier: 'CRITICAL',
    os: 'Windows Server 2022',
    lastSeen: '1 min ago',
    timelineEvents: 340,
    riskContributors: [
      { reason: 'LSASS Process Memory Dump (comsvcs.dll)', points: 35, timestamp: '13:04', category: 'Credential Access' },
      { reason: 'Persistent Foothold: Suspicious RunOnce registry key added', points: 25, timestamp: '12:50', category: 'Persistence' },
      { reason: 'Blocked Outbound C2 Traffic to Known Botnet IP', points: 20, timestamp: '12:40', category: 'Command & Control' },
      { reason: 'High rate of SMB outbound connections to peers', points: 16, timestamp: '12:30', category: 'Lateral Movement' }
    ],
    peerComparison: {
      peerAverage: 15,
      percentile: 99.8,
      anomalousActivities: ['Abnormal process parent-child relationships', 'High memory usage on rundll32.exe']
    }
  },
  {
    id: 'ent-hst-2',
    entityType: 'Host',
    name: 'ubuntu-web-prod',
    identifier: '10.0.2.15',
    riskScore: 74,
    riskTier: 'HIGH',
    os: 'Ubuntu 24.04 LTS',
    lastSeen: 'Just now',
    timelineEvents: 210,
    riskContributors: [
      { reason: 'File Integrity Monitor: /root/.ssh/authorized_keys modified', points: 30, timestamp: '13:46', category: 'Persistence' },
      { reason: 'DNS query to sinkholed C2 domain blocked', points: 25, timestamp: '14:09', category: 'Network' },
      { reason: 'SCA CIS Benchmark fail on PAM password history', points: 19, timestamp: '11:00', category: 'Compliance' }
    ],
    peerComparison: {
      peerAverage: 20,
      percentile: 91.5,
      anomalousActivities: ['Direct root login via SSH', 'Outbound DNS spike']
    }
  }
];

// =========================================================================
// 59, 60 & 84. DETECTION RULES LIBRARY & DETECTION-AS-CODE
// =========================================================================
export let detectionRules: HorusDetectionRule[] = [
  {
    id: 'hr-101',
    ruleId: 'HORUS-WIN-000183',
    version: '1.4.0',
    name: 'Suspicious Base64 Encoded PowerShell Command',
    author: 'Cyverax Threat Intelligence',
    description: 'Detects execution of PowerShell with hidden window or encoded command arguments often utilized by droppers.',
    ruleType: 'query',
    severity: 'HIGH',
    riskScore: 82,
    confidence: 94,
    status: 'Production',
    enabled: true,
    mitre: { tactic: 'Execution', technique: 'T1059.001' },
    query: 'FROM endpoint.events | WHERE process.name == "powershell.exe" | WHERE process.command_line CONTAINS "-enc"',
    schedule: 'Every 5 minutes',
    lookback: '15m',
    investigationGuide: [
      '1. Review process tree to identify parent process (e.g. WINWORD, Excel, CMD).',
      '2. Decode the Base64 command payload to extract URLs or embedded scripts.',
      '3. Check user authentication context and active sessions.',
      '4. Search fleet for identical hashes or network endpoints.',
      '5. Run live endpoint query to inspect active network sessions.',
      '6. Isolate endpoint if command-and-control connection was established.'
    ],
    responseActions: ['Quarantine Malicious Payload', 'Isolate Endpoint Host', 'Revoke Active User Tokens'],
    yamlCode: `id: HORUS-WIN-000183\nname: Suspicious Base64 Encoded PowerShell Command\nversion: 1.4.0\nseverity: high\nrisk_score: 82\nstatus: production\nquery: |\n  FROM endpoint.events\n  | WHERE process.name == "powershell.exe"\n  | WHERE process.command_line CONTAINS "-enc"\nmitre:\n  tactic: Execution\n  technique: T1059.001\nresponse:\n  auto_isolate: false\n  alert_tier: P1`,
    lastModified: '2026-08-10'
  },
  {
    id: 'hr-102',
    ruleId: 'HORUS-AUTH-000210',
    version: '2.1.0',
    name: 'RDP & SSH Brute Force Authentication Threshold',
    author: 'SOC Security Team',
    description: 'Triggers when 5 or more failed logins occur for the same target user within a 5 minute lookback window.',
    ruleType: 'threshold',
    severity: 'HIGH',
    riskScore: 78,
    confidence: 90,
    status: 'Production',
    enabled: true,
    mitre: { tactic: 'Credential Access', technique: 'T1110.001' },
    query: 'FROM identity.auth | WHERE event.outcome == "failure" | STATS COUNT(*) AS failures BY user.name, source.ip | WHERE failures >= 5',
    schedule: 'Every 2 minutes',
    lookback: '5m',
    threshold: { field: 'user.name', count: 5, windowMinutes: 5 },
    investigationGuide: [
      '1. Verify source IP reputation in Webroot / Cyverax Threat Intel.',
      '2. Inspect whether any subsequent login from the source succeeded (status 4624).',
      '3. Lock compromised Active Directory account if password spraying confirmed.',
      '4. Block offending IP on perimeter firewall and WAF.'
    ],
    responseActions: ['Block Source IP at Edge Firewall', 'Enforce Mandatory Password Reset'],
    yamlCode: `id: HORUS-AUTH-000210\nname: RDP & SSH Brute Force Authentication Threshold\nversion: 2.1.0\nseverity: high\nrisk_score: 78\nthreshold:\n  count: 5\n  field: user.name\n  timeframe: 5m\nmitre:\n  tactic: Credential Access\n  technique: T1110.001`,
    lastModified: '2026-08-12'
  },
  {
    id: 'hr-103',
    ruleId: 'HORUS-CRED-000305',
    version: '1.0.0',
    name: 'LSASS Memory Dumping via Comsvcs MiniDump',
    author: 'Cyverax Core Lab',
    description: 'Detects comsvcs.dll invocations used by adversaries to dump credentials from Local Security Authority Subsystem Service (LSASS).',
    ruleType: 'sequence',
    severity: 'CRITICAL',
    riskScore: 98,
    confidence: 99,
    status: 'Production',
    enabled: true,
    mitre: { tactic: 'Credential Access', technique: 'T1003.001' },
    query: 'FROM endpoint.events | WHERE threat.technique == "T1003.001" OR (process.name == "rundll32.exe" AND process.command_line CONTAINS "comsvcs.dll")',
    schedule: 'Real-time Streaming',
    lookback: '1m',
    investigationGuide: [
      '1. Review rundll32 command line arguments and output dump file path.',
      '2. Immediately isolate the host from corporate network.',
      '3. Revoke all Kerberos tickets (KRBTGT) and admin passwords.',
      '4. Collect memory image for forensic analysis.'
    ],
    responseActions: ['Automatic Host Network Isolation', 'Kill Process Tree', 'Capture Memory Artifacts'],
    yamlCode: `id: HORUS-CRED-000305\nname: LSASS Memory Dumping via Comsvcs MiniDump\nversion: 1.0.0\nseverity: critical\nrisk_score: 98\nstatus: production\nquery: |\n  FROM endpoint.events\n  | WHERE threat.technique == "T1003.001"\nmitre:\n  tactic: Credential Access\n  technique: T1003.001`,
    lastModified: '2026-08-13'
  },
  {
    id: 'hr-104',
    ruleId: 'HORUS-CLOUD-000412',
    version: '1.2.0',
    name: 'AWS CloudTrail Administrator Privilege Escalation',
    author: 'Cloud Security Practice',
    description: 'Monitors AttachRolePolicy / AttachUserPolicy granting AdministratorAccess to non-exempt service roles.',
    ruleType: 'behavioral',
    severity: 'CRITICAL',
    riskScore: 90,
    confidence: 92,
    status: 'Staging',
    enabled: true,
    mitre: { tactic: 'Privilege Escalation', technique: 'T1078.004' },
    query: 'FROM cloud.aws.cloudtrail | WHERE threat.technique == "T1078.004"',
    schedule: 'Every 10 minutes',
    lookback: '30m',
    investigationGuide: [
      '1. Identify requesting IAM identity in CloudTrail record.',
      '2. Check change ticket or approved change request for this modification.',
      '3. Revert policy attachment if unauthorized.'
    ],
    responseActions: ['Detach Admin Policy', 'Deactivate IAM Access Keys'],
    yamlCode: `id: HORUS-CLOUD-000412\nname: AWS CloudTrail Administrator Privilege Escalation\nversion: 1.2.0\nseverity: critical\nstatus: staging`,
    lastModified: '2026-08-14'
  }
];

// =========================================================================
// 61, 62 & 63. ALERT SUPPRESSION, EXCEPTIONS & EVENT FILTERING
// =========================================================================
export let suppressionRules: SuppressionRule[] = [
  {
    id: 'sup-1',
    name: 'Veeam Backup Agent High-Volume FIM Noise',
    field: 'process',
    value: 'VeeamAgent.exe',
    active: true,
    suppressedEventsCount: 4812,
    lastSuppressed: '2 mins ago'
  },
  {
    id: 'sup-2',
    name: 'Internal Vulnerability Scanner IP Exemption',
    field: 'ip',
    value: '10.0.100.50',
    active: true,
    suppressedEventsCount: 19400,
    lastSuppressed: '12 mins ago'
  },
  {
    id: 'sup-3',
    name: 'Datadog Monitoring Synthetic Health Checks',
    field: 'user',
    value: 'datadog-agent',
    active: true,
    suppressedEventsCount: 8920,
    lastSuppressed: '1 min ago'
  }
];

export let securityExceptions: SecurityException[] = [
  {
    id: 'exc-1',
    title: 'Approved IT Asset Inventory Script (PowerShell)',
    scope: 'Trusted Hash',
    targetValue: 'SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    owner: 'Gustavo Almanza (SecOps Lead)',
    reason: 'Quarterly hardware audit script running signed automation on DC01.',
    createdTime: '2026-07-01',
    expiration: '2026-10-01',
    status: 'Active'
  },
  {
    id: 'exc-2',
    title: 'QA Docker Swarm Build Server Ephemeral Ports',
    scope: 'Network Excluded',
    targetValue: '10.0.50.0/24 : Port Range 30000-32767',
    owner: 'Sarah Connor (DevOps)',
    reason: 'CI/CD pipeline test containers trigger port scan heuristics.',
    createdTime: '2026-08-01',
    expiration: '2026-12-31',
    status: 'Active'
  }
];

export let eventFilters: EventFilterPolicy[] = [
  {
    id: 'ef-1',
    name: 'Windows Filtering Platform Benign Discards (Event ID 5156/5157)',
    dataSource: 'Windows Security Event Logs',
    condition: 'EventID == 5156 AND ApplicationPath CONTAINS "C:\\Program Files\\CrowdStrike"',
    estimatedReductionGbDay: 410,
    status: 'Active'
  },
  {
    id: 'ef-2',
    name: 'Web Server Static Asset 200 OK Logs (.css, .js, .png)',
    dataSource: 'Nginx / Apache Access Logs',
    condition: 'RequestUri MATCHES "\\.(png|jpe?g|gif|css|js|woff2?)$" AND StatusCode == 200',
    estimatedReductionGbDay: 280,
    status: 'Active'
  },
  {
    id: 'ef-3',
    name: 'Kubernetes Kubelet Liveness Probe Heartbeats',
    dataSource: 'Kubernetes Audit Stream',
    condition: 'UserAgent == "kube-probe" AND ResponseStatus == 200',
    estimatedReductionGbDay: 195,
    status: 'Active'
  }
];

// =========================================================================
// 64. HORUS LIVE QUERY (OSQUERY ENDPOINT INTERROGATION)
// =========================================================================
export let liveQueryPacks: LiveQueryPack[] = [
  {
    id: 'lqp-1',
    name: 'RANSOMWARE TRIAGE PACK',
    description: 'Instant inspection of processes, shadow copies, suspicious startup entries, and high-frequency file modifications.',
    targetCategory: 'Ransomware Triage',
    sqlQuery: `SELECT p.pid, p.name, p.path, p.cmdline, u.username, pos.remote_address, pos.remote_port 
FROM processes p 
LEFT JOIN process_open_sockets pos ON p.pid = pos.pid 
LEFT JOIN users u ON p.uid = u.uid 
WHERE p.name IN ('powershell.exe', 'cmd.exe', 'vssadmin.exe', 'bcdedit.exe', 'wbadmin.exe', 'cipher.exe');`,
    defaultIntervalSeconds: 30
  },
  {
    id: 'lqp-2',
    name: 'LATERAL MOVEMENT & LISTENING PORTS PACK',
    description: 'Discovers exposed listening services, active SMB/RDP sessions, and unauthorized remote administration tools.',
    targetCategory: 'Lateral Movement',
    sqlQuery: `SELECT port, address, protocol, pid, (SELECT name FROM processes WHERE pid = listening_ports.pid) AS process_name 
FROM listening_ports 
WHERE port IN (22, 135, 445, 3389, 5985, 5986, 8080);`,
    defaultIntervalSeconds: 60
  },
  {
    id: 'lqp-3',
    name: 'PERSISTENT STARTUP & SCHEDULED TASKS PACK',
    description: 'Audits Windows Run registry keys, systemd services, and cron jobs across all endpoints.',
    targetCategory: 'Incident Forensics',
    sqlQuery: `SELECT name, path, command, enabled FROM startup_items UNION ALL SELECT name, action, path, enabled FROM scheduled_tasks WHERE enabled = 1;`,
    defaultIntervalSeconds: 120
  }
];

// =========================================================================
// 66. HORUS ATTACK DISCOVERY (AI-COALESCED ATTACK STORIES)
// =========================================================================
export let attackDiscoveryStories: AttackDiscoveryStory[] = [
  {
    id: 'HD-9831',
    title: 'Coordinated Multi-Stage Intrusion & Ransomware Staging',
    summary: 'Correlated attack story coalescing 8 telemetry events across 2 endpoints and 1 cloud tenant. Threat actor achieved initial access via phished credentials, escalated privileges, dumped LSASS memory, and staged persistence before network isolation was executed.',
    confidence: 'CRITICAL',
    riskScore: 96,
    startTime: '2026-08-14 13:00:12',
    lastUpdate: '2026-08-14 14:22:04',
    status: 'Active Attack',
    affectedEntities: {
      users: ['svc-backup', 'john.smith', 'admin.root'],
      endpoints: ['win-dc-primary', 'ubuntu-web-prod'],
      servers: ['win-dc-primary (Active Directory Domain Controller)'],
      ips: ['185.220.101.45', '198.51.100.89', '10.0.1.10']
    },
    stages: [
      {
        stageNumber: 1,
        tactic: 'Initial Access',
        technique: 'T1078.002 (Valid Accounts)',
        timestamp: '13:00:12',
        description: 'Compromised credentials used to authenticate svc-backup from external German IP 185.220.101.45.',
        severity: 'MEDIUM',
        source: 'Okta Identity Provider'
      },
      {
        stageNumber: 2,
        tactic: 'Credential Theft',
        technique: 'T1621 (MFA Request Generation)',
        timestamp: '13:19:10',
        description: 'MFA Fatigue attack bombarded operator until push notification accepted.',
        severity: 'HIGH',
        source: 'Okta Identity Provider'
      },
      {
        stageNumber: 3,
        tactic: 'Execution & Privilege Escalation',
        technique: 'T1059.001 (PowerShell Encoded)',
        timestamp: '13:46:02',
        description: 'Encoded PowerShell payload executed via WINWORD macro dropper.',
        severity: 'CRITICAL',
        source: 'Windows Endpoint Telemetry (win-dc-primary)'
      },
      {
        stageNumber: 4,
        tactic: 'Credential Access',
        technique: 'T1003.001 (LSASS Memory Dump)',
        timestamp: '14:04:45',
        description: 'comsvcs.dll invoked to dump LSASS memory to C:\\Windows\\Temp\\lsass.dmp.',
        severity: 'CRITICAL',
        source: 'Sysmon Event ID 10'
      },
      {
        stageNumber: 5,
        tactic: 'Command & Control / Lateral Movement',
        technique: 'T1071.004 (DNS C2 Communication)',
        timestamp: '14:22:04',
        description: 'Outbound DNS beacons to c2-sync-update.malicious-botnet.ru blocked by Webroot Shield.',
        severity: 'CRITICAL',
        source: 'Horus DNS Shield'
      }
    ],
    mitreCoverage: ['Initial Access (T1078)', 'Credential Access (T1621, T1003)', 'Execution (T1059)', 'Persistence (T1098)', 'C2 (T1071)'],
    threatActor: 'FIN7 / BlackCat Ransomware Affiliate (High Confidence)',
    recommendedActions: [
      '1. Isolate host win-dc-primary from corporate VLAN.',
      '2. Invalidate all active Kerberos TGT tokens and rotate Enterprise Admin credentials.',
      '3. Block IP 185.220.101.45 and domain malicious-botnet.ru across all edge firewalls.',
      '4. Purge temporary memory artifacts in C:\\Windows\\Temp\\.'
    ]
  }
];

// =========================================================================
// 67. MACHINE LEARNING SECURITY ANALYTICS
// =========================================================================
export let mlAnomalies: MlAnomalyRecord[] = [
  {
    id: 'mla-1',
    anomalyType: 'Rare Process',
    entity: 'win-dc-primary (10.0.1.10)',
    anomalyScore: 94,
    baselineDescription: 'Never observed in 90-day fleet baseline (0 occurrences across 10,000 agents).',
    observedValue: 'rundll32.exe comsvcs.dll, MiniDump',
    whyUnusual: 'Process spawned from cmd.exe with memory read handle to LSASS.',
    timestamp: '14:04:45',
    confidence: 96
  },
  {
    id: 'mla-2',
    anomalyType: 'Impossible Travel',
    entity: 'User: svc-backup',
    anomalyScore: 91,
    baselineDescription: 'Standard geographic location: Dallas, Texas (USA).',
    observedValue: 'Simultaneous login from Frankfurt, Germany (Speed required: 4,200 mph).',
    whyUnusual: 'Physically impossible velocity between consecutive authenticated sessions.',
    timestamp: '13:00:12',
    confidence: 99
  },
  {
    id: 'mla-3',
    anomalyType: 'Beaconing C2',
    entity: 'ubuntu-web-prod (10.0.2.15)',
    anomalyScore: 88,
    baselineDescription: 'Randomized Poisson distribution for external HTTP requests.',
    observedValue: 'Exact 30.0s periodic jittered DNS requests to unrated Russian TLD.',
    whyUnusual: 'Mathematical periodicity matches Cobalt Strike Malleable C2 profile.',
    timestamp: '14:09:40',
    confidence: 92
  },
  {
    id: 'mla-4',
    anomalyType: 'Data Exfiltration Spike',
    entity: 'Host: k8s-worker-04',
    anomalyScore: 82,
    baselineDescription: 'Average outbound transfer: 45 MB/hour.',
    observedValue: '4.8 GB outbound egress to AWS S3 bucket in 6 minutes.',
    whyUnusual: '106x standard deviation above peer group baseline.',
    timestamp: '13:30:00',
    confidence: 89
  }
];

// =========================================================================
// 73. DATA INGESTION HEALTH & 74. DATA LIFECYCLE
// =========================================================================
export let logSourceHealth: LogSourceHealth[] = [
  {
    id: 'src-1',
    name: 'Windows Event Forwarding (WEF) Cluster',
    category: 'Endpoint Security',
    eventsPerSec: 1420,
    gbPerDay: 185.4,
    lastEventTime: '1 sec ago',
    status: 'HEALTHY',
    parserErrors: 0,
    queueDepth: '42 events'
  },
  {
    id: 'src-2',
    name: 'Palo Alto Perimeter Firewalls (Syslog TLS)',
    category: 'Network Firewall',
    eventsPerSec: 3850,
    gbPerDay: 540.2,
    lastEventTime: '3 sec ago',
    status: 'HEALTHY',
    parserErrors: 2,
    queueDepth: '110 events'
  },
  {
    id: 'src-3',
    name: 'AWS CloudTrail & GuardDuty Ingest',
    category: 'Cloud Infrastructure',
    eventsPerSec: 210,
    gbPerDay: 28.5,
    lastEventTime: '15 sec ago',
    status: 'HEALTHY',
    parserErrors: 0,
    queueDepth: '5 events'
  },
  {
    id: 'src-4',
    name: 'Legacy Juniper VPN Gateway',
    category: 'VPN / Identity',
    eventsPerSec: 0,
    gbPerDay: 0,
    lastEventTime: '42 mins ago',
    status: 'CRITICAL',
    parserErrors: 14,
    queueDepth: '0 (Connector Offline)'
  }
];

export let dataLifecycles: DataLifecyclePolicy[] = [
  {
    tier: 'HOT',
    storageMedium: 'NVMe Ultra-Fast SSD Clusters',
    retentionDays: 14,
    currentSizeGb: 4820,
    searchLatency: '< 15 ms',
    costMonthly: '$1,200'
  },
  {
    tier: 'WARM',
    storageMedium: 'Standard High-IOPS Cloud Disks',
    retentionDays: 90,
    currentSizeGb: 28400,
    searchLatency: '~ 120 ms',
    costMonthly: '$2,400'
  },
  {
    tier: 'COLD',
    storageMedium: 'Object Storage with Index Cache',
    retentionDays: 365,
    currentSizeGb: 112000,
    searchLatency: '~ 1.2 s',
    costMonthly: '$3,100'
  },
  {
    tier: 'ARCHIVE',
    storageMedium: 'Encrypted Searchable Deep Glacier',
    retentionDays: 2555, // 7 years
    currentSizeGb: 480000,
    searchLatency: '~ 8.5 s (On-Demand Search)',
    costMonthly: '$1,800'
  }
];

// =========================================================================
// 85 & 86. SECURITY CONTENT PACKS & MARKETPLACE
// =========================================================================
export let securityContentPacks: SecurityContentPack[] = [
  {
    id: 'pack-win',
    name: 'Windows Active Directory & Fleet Defense Pack',
    category: 'Operating Systems',
    version: '3.4.1',
    author: 'Cyverax Core Lab',
    description: 'Comprehensive detections for Kerberoasting, DCSync, Pass-the-Hash, LSASS dumping, and AMSI bypasses.',
    rulesCount: 48,
    dashboardsCount: 6,
    playbooksCount: 8,
    installed: true,
    verifiedSigned: true
  },
  {
    id: 'pack-m365',
    name: 'Microsoft 365 & Entra ID Security Pack',
    category: 'Cloud & SaaS',
    version: '2.1.0',
    author: 'Cyverax SOC',
    description: 'Covers mailbox forwarding rules, suspicious OAuth app consent, impossible travel, and tenant admin takeover.',
    rulesCount: 32,
    dashboardsCount: 4,
    playbooksCount: 5,
    installed: true,
    verifiedSigned: true
  },
  {
    id: 'pack-aws',
    name: 'AWS Cloud Security & GuardDuty Enrichment Pack',
    category: 'Cloud & SaaS',
    version: '1.8.0',
    author: 'CloudSec Verified',
    description: 'S3 bucket exfiltration detection, IAM role assumption anomalies, root console logins without MFA, and VPC flow analysis.',
    rulesCount: 26,
    dashboardsCount: 3,
    playbooksCount: 4,
    installed: true,
    verifiedSigned: true
  },
  {
    id: 'pack-ransom',
    name: 'Ransomware Early Killchain & Canaries Pack',
    category: 'Threat Defense',
    version: '4.0.0',
    author: 'Cyverax Threat Intelligence',
    description: 'Heuristic canary traps, Volume Shadow Copy deletion alerts, rapid file rename detection, and automated host isolation.',
    rulesCount: 22,
    dashboardsCount: 2,
    playbooksCount: 6,
    installed: true,
    verifiedSigned: true
  },
  {
    id: 'pack-linux',
    name: 'Linux Server & Container Runtime Defense Pack',
    category: 'Operating Systems',
    version: '2.0.4',
    author: 'Cyverax Open Lab',
    description: 'eBPF-driven runtime security, unauthorized SSH key injections, cron persistence, and container escape detections.',
    rulesCount: 36,
    dashboardsCount: 5,
    playbooksCount: 4,
    installed: false,
    verifiedSigned: true
  },
  {
    id: 'pack-hipaa',
    name: 'Healthcare HIPAA & HITRUST Audit Pack',
    category: 'Compliance',
    version: '1.5.0',
    author: 'Compliance Standards Council',
    description: 'EHR database access auditing, PHI data exfiltration prevention, and automated 7-year compliance audit reporting.',
    rulesCount: 18,
    dashboardsCount: 4,
    playbooksCount: 3,
    installed: false,
    verifiedSigned: true
  }
];
