# 1. Goals and Background
The Docker Log Summariser MCP provides lightning-fast situational awareness for engineers operating Docker-based services. By continuously summarising verbose container logs with Gemini every _N_ seconds, the tool reduces mean-time-to-resolve incidents by surfacing key events, anomalies, and unanswered questions.

* **Primary Outcome:** ≥ 30 % MTTR reduction for pilot teams.
* **Context:** Micro-services generate torrents of JSON and stack-trace logs; manual `tail -f | grep` analysis is slow and error-prone.

---
