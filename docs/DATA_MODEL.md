# EYE OF HORUS — COMMON SECURITY DATA MODEL
### Normalized Entity Schema & Event Format

---

## 1. COMMON EVENT SCHEMA (HORUS ECS)

All telemetry ingested from Agents, Syslog, Firewalls, CloudTrail, and Identity Providers is normalized into the **Horus Common Event Schema**:

```typescript
export interface HorusSecurityEvent {
  // Metadata
  id: string;
  timestamp: string;          // ISO 8601 UTC
  tenantId: string;
  organizationId: string;
  dataCategory: 'endpoint' | 'network' | 'identity' | 'cloud' | 'email';
  
  // Host Context
  agentId: string;
  agentName: string;
  agentVersion: string;
  hostIp: string;
  hostMac: string;
  osFamily: 'windows' | 'linux' | 'macos';

  // Detection Classification
  severity: 'low' | 'medium' | 'high' | 'critical';
  numericLevel: number;        // 1 to 15 (Wazuh compatible)
  ruleId: string;
  ruleDescription: string;
  mitreTechniqueId?: string;   // e.g. T1059.001
  mitreTactic?: string;        // e.g. Execution

  // Process Context
  processId?: number;
  processName?: string;
  processPath?: string;
  parentProcessId?: number;
  parentProcessName?: string;
  commandLine?: string;

  // Network Context
  sourceIp?: string;
  destinationIp?: string;
  destinationPort?: number;
  dnsQueryDomain?: string;

  // Hash & Integrity
  fileMd5?: string;
  fileSha256?: string;
  
  // Raw Audit Data
  rawPayload: string;
}
```

---

## 2. INCIDENT GRAPH ENTITY RELATIONS

```
User Entity ──(authenticates to)──> Asset Entity ──(executes)──> Process Entity
                                                                     │
                                                               (initiates)
                                                                     │
                                                                     v
                                                             Network Domain / IP
```
