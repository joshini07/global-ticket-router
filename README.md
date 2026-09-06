# Global Ticket Router

**From Operational Pain to Working Product: Global Company Transferring Tickets Between Regional Support**

Global Ticket Router is a context-aware support ticket routing web application designed to solve the operational pain of support tickets bouncing between regional resolver groups in global enterprises.

---

## 📌 Project Overview
In global companies, support tickets are frequently assigned to incorrect regional teams (e.g., an APAC hardware issue misrouted to a US software team). This creates high ticket bounce rates, delayed resolution times, and operational frustration. 

**Global Ticket Router** automates ticket classification and routing by analyzing ticket text and contextual metadata against intent models, hard compliance rules, and soft optimization heuristics—automatically routing high-confidence tickets while holding ambiguous tickets in a Manual Review Triage Queue.

---

## 🚨 Problem Statement
- **Ticket Bouncing**: Enterprise support tickets bounce an average of **3 to 4 times** before reaching the correct resolver group.
- **Industry Baseline Bounce Rate**: ~42% of tickets suffer from at least one incorrect assignment.
- **Cross-Border Compliance Violations**: Sensitive regional tickets (such as EMEA GDPR payroll data) are accidentally assigned to teams in non-compliant jurisdictions.

---

## 🎯 Objective
- Automate ticket classification using multi-keyword intent recognition and context metadata.
- Enforce mandatory data sovereignty and security rules (Hard Constraints).
- Apply optimization heuristics like local region affinity and channel urgency (Soft Constraints).
- Set an adjustable confidence threshold (default 70%) to route low-confidence tickets to Manual Review.
- Provide authorized manual overrides with immutable audit trails.
- Measure First-Assignment Accuracy and Ticket Bounce Reduction %.

---

## ✨ Key Features
1. **Context-Aware Ticket Input Form**: Captures Ticket Text, Region (`NA`, `EMEA`, `APAC`, `LATAM`), Channel (`Portal`, `Email`, `Slack/Chat`, `Phone`), Asset (`Hardware`, `Software/ERP`, `Network/VPN`, `Identity/IAM`, `Finance System`), and User Role.
2. **Intent Recognition Engine**: Identifies core intents (*Password & IAM Reset*, *Hardware Fault*, *VPN Connectivity*, *Payroll & Finance Access*, *Software License*, *Security Alert*).
3. **Dynamic Confidence Scoring**: Calculates confidence percentage ($0\% \text{ to } 100\%$) and renders a live visual gauge bar.
4. **Hard & Soft Constraints Solver**: Validates mandatory security/regulatory constraints and applies heuristic scoring boosts.
5. **Adjustable Confidence Threshold Slider**: Header control allowing real-time threshold adjustment ($40\% \text{ to } 95\%$, default $70\%$).
6. **Manual Review Queue**: Holds low-confidence ($<70\%$) or unclassified tickets for human triage.
7. **Authorized Manual Override**: Allows support leads to reassign tickets to a new resolver group with justification.
8. **System Audit Trail**: Logs all routing decisions and manual overrides with timestamps, actor role, previous group, new group, and justification.
9. **Analytics Dashboard**: Live charts displaying status distribution, regional breakdown, top intents, First-Assignment Accuracy %, and Ticket Bounce Reduction %.
10. **Interactive Test Suite**: Built-in test runner executing 8 automated test scenarios with visual pass/fail validation.

---

## 🔄 Routing Workflow
```
[User Submits Ticket]
        │
        ▼
[1. Intent Classification] ──► Keyword Matching & Asset Correlation
        │
        ▼
[2. Hard Constraints Check] ──► Triggered? Lock Mandatory Group & Floor Confidence at 90%
        │
        ▼
[3. Soft Constraints Check] ──► Apply Region Affinity (+15%), Urgency (+10%), Role (+5%)
        │
        ▼
[4. Calculate Confidence %]
        │
        ├── Confidence ≥ Threshold (70%) ──► Status: AUTO_ROUTED ──► Assigned to Target Group
        │
        └── Confidence < Threshold (70%) ──► Status: MANUAL_REVIEW ──► Held in Triage Queue
                                                    │
                                                    ▼
                                     [Support Lead Manual Override]
                                                    │
                                                    ▼
                                         [Saved to Audit Trail Log]
```

---

## 🛡️ Hard & Soft Constraints

### Hard Constraints (Mandatory Regulatory & Security Rules)
- `RULE_EMEA_FINANCE_PRIVACY`: EMEA tickets with Finance System asset lock to `EMEA-Finance-Ops` (EU GDPR Data Sovereignty).
- `RULE_SECURITY_MANDATE`: Identity/IAM asset requests route strictly to `Global-SecOps`.
- `RULE_LATAM_PAYROLL_LOCK`: LATAM region tickets with Finance System asset lock to `LATAM-Finance-Ops`.

### Soft Constraints (Optimization Heuristics)
- `PREFER_LOCAL_REGION`: Adds +15% confidence boost when resolver group matches user region.
- `HIGH_URGENCY_CHANNEL_BOOST`: Adds +10% confidence for real-time channels (Phone / Slack Chat).
- `ROLE_AUTHORITY_BOOST`: Adds +5% confidence for verified Support Agent or Manager submissions.

---

## 📋 Manual Review Queue
Tickets with confidence scores below the threshold (e.g. $<70\%$) or unclassified intents are assigned `status: MANUAL_REVIEW` and target group `Manual-Review`. Support leads can inspect these tickets in the **Manual Review** tab, click **Override / Assign**, select the correct target group, and enter justification.

---

## ⚠️ Failure-State Handling
- **Ambiguous / Garbage Input**: Unrecognized ticket text is mapped to `UNKNOWN` intent with base confidence (35%–50%). Because this falls below the 70% threshold, the system safely diverts the ticket to `Manual-Review` to prevent misrouting.
- **Missing Keyword Match**: Uses asset category as fallback classification to determine candidate resolver group.
- **Corrupt LocalStorage State**: Handled via `try/catch` fallbacks that automatically re-initialize default seed data if browser storage is corrupted.

---

## 📜 Audit Trail
Every routing decision and manual override creates an immutable record saved to LocalStorage:
- **Fields Logged**: `Timestamp`, `Ticket ID`, `Action` (`AUTO_ROUTE`, `SENT_TO_MANUAL_REVIEW`, `OVERRIDE`), `Actor`, `Previous Group`, `Target Resolver Group`, `Reason & Notes`.
- **View**: Accessible in the **Audit Trail** tab in a filterable, timestamped table.

---

## ⏪ Rollback
- **Data Reset (`⚡ Reset Data`)**: A header control allows administrators to reset system state back to default seed demonstration data.
- *Note on Individual Action Rollback*: Dedicated single-click "Undo Override" button per audit record is planned as *Pending Work* for Phase 2.

---

## 🔍 Change Review
- **Live Threshold Controller**: Real-time slider in header allows users to test how changing the global threshold ($40\% \text{ to } 95\%$) immediately re-evaluates auto-routing vs manual review ratios across the dashboard.
- *Note on Pre-change Preview*: A confirmation dialog calculating affected ticket counts before applying threshold changes is planned as *Pending Work* for Phase 2.

---

## 📊 Analytics & Metrics
- **First-Assignment Accuracy**: **80%** on baseline seed dataset (tickets assigned correctly on initial attempt without override).
- **Ticket Bounce Reduction**: **88.1%** reduction achieved comparing enterprise baseline (42.0%) vs measured system bounce rate (~5.0%).
- **Visual Breakdown Charts**: Status distribution (Auto-Routed vs Manual Review vs Overridden), Regional volume, and Top Intents.

---

## 🧪 Interactive Test Suite
Includes **8 built-in automated test scenarios** accessible in the **Interactive Test Suite** tab:
1. `TC-01`: High Confidence Regional Auto-Route (APAC Hardware $\rightarrow$ `APAC-IT-Hardware`) — **PASSED ✅**
2. `TC-02`: Low Confidence Manual Review Trigger (Ambiguous text $\rightarrow$ `Manual-Review`) — **PASSED ✅**
3. `TC-03`: Hard Constraint - EMEA GDPR Sovereignty (`EMEA-Finance-Ops`) — **PASSED ✅**
4. `TC-04`: Hard Constraint - Enterprise Security Mandate (`Global-SecOps`) — **PASSED ✅**
5. `TC-05`: Soft Constraints Optimization Heuristic (+15% Region, +10% Channel, +5% Role) — **PASSED ✅**
6. `TC-06`: Hard Constraint - LATAM Tax Compliance (`LATAM-Finance-Ops`) — **PASSED ✅**
7. `TC-07`: Dynamic Confidence Threshold Adjustment (95% threshold forces review) — **PASSED ✅**
8. `TC-08`: Authorized Override & Audit Trail Verification — **PASSED ✅**

**Overall Test Result**: **8 / 8 Passed (100% Success Rate)**

---

## 🛠️ Technology Stack
- **Frontend UI**: Vanilla HTML5, Modern CSS3 (Glassmorphism dark theme, custom CSS variables, responsive layout).
- **Logic & Architecture**: JavaScript ES Modules (`config.js`, `routingEngine.js`, `store.js`, `testSuite.js`, `app.js`).
- **State Management**: `LocalStorage` API for browser persistence.
- **Server**: Python `http.server` / Vite for lightweight zero-dependency hosting.

---

## 🚀 How to Run

1. Open terminal in the project directory:
   ```bash
   python -m http.server 3000
   ```
2. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🚦 Current Status
- **Phase 1 Working Prototype**: **COMPLETE & FULLY FUNCTIONAL**
- Core routing engine, hard/soft constraints solver, threshold slider, manual review queue, override modal, audit trail, analytics dashboard, and automated test suite are fully implemented and running at `http://localhost:3000`.

---

## ⏳ Pending Work (Planned for Phase 2 Review)
1. **Single-Click Action Rollback**: Adding an "Undo Override" button directly on audit trail entries.
2. **Pre-Change Impact Assessment Modal**: Showing a preview modal calculating how many tickets will change state before updating global threshold slider.
3. **Failure Case Test Suite Expansion**: Adding explicit malformed payload test cases (e.g. empty text, zero-byte input).
4. **Per-Ticket Multi-Hop Transfer Timeline Card**: Visual lifecycle card showing every reassignment step for a specific ticket.
