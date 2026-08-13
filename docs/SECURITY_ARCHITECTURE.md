# EYE OF HORUS — SECURITY ARCHITECTURE
### Cyverax Solutions Platform Defense & Hardening Specification

---

## 1. IDENTITY & ACCESS CONTROL (RBAC & ABAC)

Eye of Horus implements strict Role-Based and Attribute-Based Access Control:

* **Global Administrator (Cyverax Super Admin)**: System-wide operations.
* **MSSP / Partner Admin**: Multi-tenant client management.
* **Organization Admin**: Tenant-specific security configuration.
* **SOC Manager**: Incident assignment, SLA tracking, approval overrides.
* **Tier 1 / Tier 2 / Tier 3 SOC Analyst**: Investigation, hunting, triage.
* **Incident Responder**: Execution of high-impact response actions (Host Isolation, Process Termination).
* **Auditor / Read-Only**: Compliance reporting and read-only telemetry access.

---

## 2. CRYPTOGRAPHY & DATA PROTECTION

* **Data in Transit**: All agent-to-server and client-to-API communication requires **TLS 1.3** with Mutual TLS (mTLS) device certificate verification.
* **Data at Rest**: **AES-256-GCM** encryption for database stores, log archives, and credential vaults.
* **Secrets Management**: Dynamic secret fetching via HashiCorp Vault / KMS. Secrets are never hardcoded or logged in raw streams.

---

## 3. AGENT TAMPER PROTECTION & INTEGRITY

* **Signed Executables & Drivers**: Every agent binary, kernel driver, and update bundle is digitally signed with Cyverax code-signing certificates.
* **Self-Defense Module**: Prevents unprivileged or malicious processes from terminating agent services, deleting local log buffers, or unhooking kernel callbacks.
* **Mutual Authentication**: Agents verify server certificate fingerprints before transmitting telemetry or receiving response commands.

---

## 4. AUDIT & FORENSIC ACCOUNTABILITY

Every administrative action, policy modification, isolation trigger, or process kill is logged in a **tamper-evident audit trail**:

```json
{
  "timestamp": "2026-08-13T08:15:00Z",
  "actor_id": "usr-gustavo-01",
  "actor_email": "gustavo.almanza@cyverax.com",
  "action": "ENDPOINT_ISOLATE",
  "target_asset": "win-dc-primary",
  "tenant_id": "org-cyverax-corp",
  "result": "SUCCESS",
  "source_ip": "198.51.100.12",
  "reason": "Ransomware canary file encryption trigger mitigation"
}
```
