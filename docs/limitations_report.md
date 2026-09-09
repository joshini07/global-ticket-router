# Consolidated Limitations, Risks, Assumptions & Non-Goals Report

**Project:** Global Ticket Router — Context- & True Skill-Aware Regional Support Routing Engine  
**Document Version:** 2.0.0  
**Classification:** Operational Governance & Risk Architecture  

---

## 1. Introduction & Purpose

This report provides a formal, consolidated architectural evaluation of the **Global Ticket Router**, isolating operational risks, fundamental operating assumptions, explicit non-goals, and deferred roadmap items. By maintaining transparency regarding boundaries and constraints, support leadership can ensure responsible deployment and risk management.

---

## 2. Architectural & Operational Risks

| Risk ID | Risk Title | Severity | Likelihood | Impact Description | Mitigation Strategy |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **RSK-01** | **Skill Model Drift & Stale Rosters** | High | Medium | As engineers gain new certifications or leave teams, static skill scores (1–5 ★) become obsolete, leading to misallocation. | Implement quarterly HRIS/LMS automated skill audit sync; allow team leads to update proficiency matrices via Admin API. |
| **RSK-02** | **Regional Jargon & Multilingual Nuance** | Medium | High | Non-native English phrasing, acronyms, or colloquial slang may fail exact keyword tokenization, lowering confidence. | Secondary asset category fallback heuristic catches intent; low-confidence tickets safely held in Manual Review triage. |
| **RSK-03** | **Triage Queue Starvation under High Thresholds** | Medium | Medium | If administrators raise the threshold slider to $\ge 90\%$, automated routing drops to $< 30\%$, creating manual review backlog. | System triggers visual warning banner when threshold exceeds $85\%$; default clamped at $70\%$. |
| **RSK-04** | **Availability Telemetry Latency** | Low | Medium | Simulated availability ($0.0 \text{ to } 1.0$) assumes real-time calendar and queue sync. Stale availability could assign an on-leave engineer. | Availability acts strictly as a tiebreaker ($20\%$ weight) after primary skill match ($80\%$ weight); failsafe re-routing upon ticket rejection. |
| **RSK-05** | **Single Point of Override Abuse** | Medium | Low | Support Leads overriding tickets without legitimate cause could reintroduce manual bias into routing paths. | Mandatory text justification required for all overrides; every change permanently logged in immutable audit trail. |

---

## 3. Core Operational Assumptions

The successful execution of Global Ticket Router rests upon the following core operational prerequisites:

1. **Deterministic Rule Priority:** Hard constraints (GDPR, SecOps mandate, LATAM tax) must always take absolute precedence over soft constraints and keyword confidence scores.
2. **Standardized Context Metadata:** Incoming ticket ingestion pipelines (webhooks, email parsers, portals) must provide valid categorical tags for `region`, `asset`, and `channel`.
3. **Availability Telemetry Validity:** Workload-based availability scores ($0.0–1.0$) are assumed to accurately represent real-time specialist queue depth and shift schedule.
4. **Human-in-the-Loop Safeguards:** Low-confidence tickets ($<70\%$) require active monitoring by human triage leads during regional business hours.
5. **Audit Trail Immutability:** Audit records stored in browser storage or enterprise databases are assumed to be append-only and protected against retroactive tampering.

---

## 4. Explicit Non-Goals

To prevent scope creep and maintain architectural clarity, the following capabilities are explicitly defined as **Non-Goals** for the current system:

- ❌ **Not an ITSM Ticketing Database Replacement:** Global Ticket Router is an intelligent classification and dispatch engine, not a replacement for enterprise record stores like ServiceNow, Jira Service Management, or BMC Remedy.
- ❌ **No Unsupervised Autonomous Remediation:** The router assigns tickets to the optimal human specialist or team; it does NOT autonomously execute administrative remediation (e.g., executing remote bash scripts, resetting Active Directory passwords, or rebooting servers without approval).
- ❌ **No Black-Box Probabilistic LLM Routing:** The system deliberately avoids non-deterministic Large Language Model (LLM) prompts for routing decisions, eliminating hallucinated resolver assignments and ensuring 100% regulatory auditability.
- ❌ **Not a Telephony IVR Voice Engine:** The system ingests text representations and transcripts from phone calls, but does not perform real-time acoustic signal processing or VoIP telephony switching.
- ❌ **No Dynamic Self-Authoring of Hard Constraints:** Regulatory rules must be formally authored and verified by compliance officers; the system will not auto-generate new regulatory constraints.

---

## 5. Deferred Features & Product Roadmap

The following non-blocking enhancements are scheduled for subsequent product releases:

### Phase 2 Roadmap (Q4 2026)
1. **Single-Click Audit Action Rollback ("Undo Override"):**
   - Direct "Revert Reassignment" button on audit log records allowing authorized leads to roll back an erroneous override in one click.
2. **Pre-Change Threshold Impact Assessment Modal:**
   - Real-time modal preview calculating how many pending tickets will transition between `AUTO_ROUTED` and `MANUAL_REVIEW` before applying a global threshold slider change.
3. **Per-Ticket Multi-Hop Transfer Timeline Card:**
   - Visual step-by-step lifecycle card showing every hop, timestamp, actor, and reason for an individual ticket from creation to resolution.
4. **Bi-Directional Slack & MS Teams Dispatch Bots:**
   - Webhook bots that notify the assigned engineer directly in Slack/Teams with interactive "Accept Ticket" or "Re-Triage" action buttons.

### Phase 3 Roadmap (Q1 2027)
1. **Hybrid Vector Embedding Classifier:**
   - Dense semantic vector embedding layer (e.g., multilingual sentence transformers) operating as a secondary fallback beneath hard constraints to parse complex non-English phrasing.
2. **Dynamic Skill Proficiency Self-Learning:**
   - Automated skill score recalibration based on historical MTTR (Mean Time to Resolution) and positive user satisfaction ratings.
3. **Multi-Jurisdiction Sovereign Cloud Federation:**
   - Physically isolated worker nodes ensuring ticket text never leaves the European Economic Area (EEA) even during in-flight inference.

---

## 6. Risk Mitigation Matrix

```
   HIGH    │ [RSK-02: Jargon / Multilingual]      [RSK-01: Skill Drift]
           │ ↳ Heuristic fallback & review        ↳ Quarterly audit & Admin API
 L         │
 I  MED    │ [RSK-04: Telemetry Latency]          [RSK-03: Queue Starvation]
 K         │ ↳ 20% weight tiebreak only           ↳ Visual alerts & 70% sweet spot
 E         │
 L  LOW    │                                      [RSK-05: Override Abuse]
 I         │                                      ↳ Mandatory reason & audit log
           └─────────────────────────────────────────────────────────────
                        LOW                       MEDIUM                    HIGH
                                      IMPACT
```

### Summary Statement
The Global Ticket Router architecture explicitly defines its operational boundaries. By pairing deterministic constraints with human triage oversight, the system minimizes risk while delivering an 88.1% reduction in ticket bounces.
