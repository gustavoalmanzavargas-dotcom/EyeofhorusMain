# EYE OF HORUS — API ARCHITECTURE
### RESTful API & Ingestion Webhook Specification

---

## 1. REST ENDPOINTS SPECIFICATION

All API routes are prefixed with `/api` and require Bearer Token / API Key authentication.

### Core Telemetry & Alerts
* `GET /api/dashboard`: Aggregated EPS, alert trends, MITRE matrix, top agents.
* `GET /api/alerts`: Filtered security alerts (level, agent, technique).
* `POST /api/alerts`: Ingest structured security event.

### Agents & EDR Control
* `GET /api/agents`: Fleets listing, statuses, OS distribution.
* `POST /api/agents/:id/isolate`: Engage network isolation on endpoint.
* `POST /api/agents/:id/unisolate`: Re-establish endpoint network connectivity.
* `POST /api/agents/:id/kill-process`: Terminate process by PID.

### Interoperability Integrations
* `GET /api/wazuh/sca`: Fetch CIS Configuration Assessment policies.
* `POST /api/wazuh/sca/scan`: Re-evaluate endpoint CIS benchmarks.
* `GET /api/wazuh/rules/export`: Download active detection rules in Wazuh XML format.
* `GET /api/huntress/footholds`: Inspect Windows Run keys and Linux Cron persistence mechanisms.
* `POST /api/huntress/footholds/:id/quarantine`: Quarantine persistent binary.
* `GET /api/huntress/canaries`: Fetch ransomware honeypot canary trap files.
* `POST /api/huntress/canaries/:id/trigger-test`: Simulate canary encryption attack.
* `GET /api/webroot/dns-logs`: Fetch Web Threat Shield & DNS protection query logs.
* `POST /api/webroot/dns-block`: Add domain to global Webroot blocklist.
* `POST /api/webroot/threat-intel/lookup`: Query threat intelligence hash DB (MD5/SHA256).
