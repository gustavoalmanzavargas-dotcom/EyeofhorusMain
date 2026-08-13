# EYE OF HORUS — THREAT MODEL
### STRIDE Analysis & Defensive Controls

---

## 1. THREAT SURFACE ANALYSIS

As a central cybersecurity platform with active response capabilities, Eye of Horus is a high-value target for sophisticated threat actors.

| Threat Category | Potential Attack Vector | Defensive Controls Implemented |
|---|---|---|
| **Spoofing** | Rogue agent attempting to inject false log telemetry or trigger fake alerts. | Mutual TLS (mTLS) with per-device X.509 client certificate validation. |
| **Tampering** | Attacker modifying local agent logs or disabling active response daemons. | Signed binaries, driver kernel hooks, local log buffering with HMAC verification. |
| **Repudiation** | Analyst claiming unauthorized host isolation or file deletion was not performed by them. | Tamper-evident immutable audit log recording actor, IP, timestamp, and signed payload. |
| **Information Disclosure** | Cross-tenant data leakage or unauthorized access to vulnerability reports. | Database-level tenant isolation (`tenant_id` mandatory in all queries), encrypted DB storage. |
| **Denial of Service** | Log flooding (event storms) attempting to blind the SIEM. | Ingestion rate-limiting, backpressure queuing, memory safeguards, auto-scaling collectors. |
| **Elevation of Privilege** | Compromised user account trying to execute remote shell on endpoints. | Multi-Factor Authentication (MFA), strict RBAC permissions, approval workflow for high-risk actions. |
