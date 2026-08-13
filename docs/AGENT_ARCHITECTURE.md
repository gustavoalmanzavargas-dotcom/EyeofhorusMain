# EYE OF HORUS — AGENT ARCHITECTURE
### Horus Endpoint Agent Daemon (Windows, Linux, macOS)

---

## 1. AGENT ARCHITECTURE & DAEMON ENGINE

The **Horus Agent** is a lightweight, low-overhead security daemon that runs natively on host operating systems.

```
+-------------------------------------------------------------------------+
|                              HORUS AGENT                                |
+-------------------------------------------------------------------------+
  │                      │                      │                     │
  v                      v                      v                     v
Kernel Hooks         File & FIM            Network & DNS          Syslog / Event
(e.g. ETW / eBPF)    (Inotify / USN)       (Filtering Driver)     Log Collectors
  │                      │                      │                     │
  +----------------------+----------------------+---------------------+
                                 │
                                 v
                 +-------------------------------+
                 |  Local SQLite Buffer & HMAC   |
                 +-------------------------------+
                                 │
                                 v
                     mTLS Stream Encrypted
                                 │
                                 v
                        Eye of Horus SIEM
```

---

## 2. KEY RESPONSIBILITIES

1. **Process Activity Tracking**: Monitors process creation, parent/child trees, command-line arguments, and DLL/so injection.
2. **File Integrity Monitoring (FIM)**: Tracks file creation, modification, permissions changes, and deletion on critical system directories.
3. **Ransomware Canary Traps**: Plants decoy files in user directories and monitors for unauthorized write/encryption attempts.
4. **Persistent Foothold Inspection**: Scans Registry Run keys, Scheduled Tasks, Systemd services, and Cron jobs.
5. **Active Response Execution**: Executes host network isolation, process termination, binary quarantine, and script execution upon authorization from the server.
