# Software Requirements Specification (SRS) & Product Requirements Document (PRD)

**Project:** Global Ticket Router — Context- & True Skill-Aware Regional Support Routing Engine  
**Document Version:** 2.0.0  
**Author:** Joshini R  
**Status:** Approved / Release Baseline  
**Classification:** Enterprise ITIL Support Operations & Compliance  

---

## 1. Executive Summary & Problem Scope

### 1.1 Business Problem
Global enterprise IT operations manage support requests across heterogeneous geographical regions (North America, EMEA, APAC, LATAM). Without centralized intelligence, tickets are misrouted based on user assumptions, incomplete issue categorization, or arbitrary triage queues:
- **High Multi-Hop Ticket Bounce:** Tickets bounce an average of **3.4 times** between regional resolver groups before reaching the correct resolver.
- **Enterprise Baseline Bounce Rate:** Historical enterprise baseline data indicates **42.0%** of tickets experience at least one erroneous assignment.
- **Regulatory Breaches:** Sensitive European employee records are routed to non-EEA teams, breaching EU General Data Protection Regulation (GDPR) Article 44–50 cross-border data transfer rules.
- **Specialist Skill Misalignment:** Even when a ticket reaches the correct regional domain (e.g., APAC Hardware), it is assigned round-robin rather than to an engineer with verified skill proficiency in the affected subsystem (e.g., Apple Mac firmware vs. Dell dock firmware).

### 1.2 Product Objective
Deliver an automated routing engine that combines **multi-keyword intent classification**, **hard regulatory constraints**, **soft optimization heuristics**, **true skill-aware agent candidate scoring with availability tiebreaking**, and a **manual-review triage queue with authorized overrides and an immutable audit trail**.

---

## 2. User Personas & Journey Maps

| Persona | Role | Primary Goal | Pain Point Addressed |
| :--- | :--- | :--- | :--- |
| **End User / Employee** | Submitter | Rapid resolution of workplace tech issues. | Eliminates ticket ping-pong and multi-day delays. |
| **Tier 1 Support Agent** | Initial Intake | Quick classification without manual guessing. | Automates domain detection and highlights sovereign constraints. |
| **Regional Dispatch Lead** | Triage Lead | Review low-confidence exceptions and override routing. | Single-click override with justification and full audit trail. |
| **Enterprise SecOps Auditor** | Compliance Auditor | Verify data residency and security mandate locks. | Verifiable immutable logs ensuring GDPR and security policies are 100% enforced. |

---

## 3. Functional Requirements (FR)

### FR-1: Ticket Ingestion & Context Extraction (Priority: P0)
- **Input Parameters:**
  - `text` (String, required): Ticket description / user problem statement.
  - `region` (Enum: `NA`, `EMEA`, `APAC`, `LATAM`, required).
  - `channel` (Enum: `Portal`, `Email`, `Slack/Chat`, `Phone`, required).
  - `asset` (Enum: `Hardware`, `Software/ERP`, `Network/VPN`, `Identity/IAM`, `Finance System`, required).
  - `userRole` (Enum: `End User`, `Tier 1 Agent`, `Support Lead / Admin`, required).
- **Validation Rules:** Inputs must be validated against allowed enums. Empty, zero-byte, or whitespace-only descriptions must trigger failure-case handling (diverting to Manual Review).

### FR-2: Multi-Keyword Intent Classification (Priority: P0)
- The system must match tokenized and normalized ticket text against 6 core intent models:
  1. `PASSWORD_RESET` (Okta, IAM, MFA, SSO credentials)
  2. `HARDWARE_FAULT` (Laptop, screen, keyboard, battery, motherboard)
  3. `VPN_CONNECTIVITY` (Cisco VPN, network tunnel, Wi-Fi, DNS, firewall)
  4. `PAYROLL_FINANCE` (Workday, salary, payslip, invoice, statutory tax)
  5. `SOFTWARE_LICENSE` (SAP ERP, Salesforce, Office365, client crashes)
  6. `SECURITY_INCIDENT` (Phishing, breach, malware, suspicious login)
- If keyword matching yields zero hits, the system must use the selected `asset` category as a secondary heuristic fallback.

### FR-3: Hard Constraint Enforcement (Mandatory Rules) (Priority: P0)
- Hard constraints supersede confidence score calculations and lock tickets to mandatory resolver groups:
  - **`RULE_EMEA_FINANCE_PRIVACY`:** Tickets with `region == 'EMEA'` and (`asset == 'Finance System'` OR `intent == 'PAYROLL_FINANCE'`) MUST lock to `EMEA-Finance-Ops` (EU GDPR compliance).
  - **`RULE_LATAM_PAYROLL_LOCK`:** Tickets with `region == 'LATAM'` and `asset == 'Finance System'` MUST lock to `LATAM-Finance-Ops` (statutory tax compliance).
  - **`RULE_SECURITY_MANDATE`:** Tickets with `asset == 'Identity/IAM'` OR `intent == 'SECURITY_INCIDENT'` MUST lock to `Global-SecOps`.
- Hard constraint execution must enforce a confidence floor of $\ge 90\%$.

### FR-4: Soft Constraint Heuristic Scoring (Priority: P1)
- The system must dynamically adjust routing confidence by applying non-mandatory positive heuristics:
  - **`PREFER_LOCAL_REGION`:** Adds $+15\%$ confidence when resolver group region matches submitter region.
  - **`HIGH_URGENCY_CHANNEL_BOOST`:** Adds $+10\%$ confidence for synchronous real-time channels (`Phone`, `Slack/Chat`).
  - **`ROLE_AUTHORITY_BOOST`:** Adds $+5\%$ confidence when submitted by verified staff (`Tier 1 Agent` or `Support Lead / Admin`).
- Final confidence score must be clamped between $15\%$ and $98\%$.

### FR-5: Dynamic Routing Decision & Confidence Thresholding (Priority: P0)
- Configurable global threshold (default $70\%$, adjustable from $40\%$ to $95\%$).
- If `confidence >= threshold` AND `intent != 'UNKNOWN'`: Status = `AUTO_ROUTED`.
- If `confidence < threshold` OR `intent == 'UNKNOWN'`: Status = `MANUAL_REVIEW`, target locked to `Manual-Review`.

### FR-6: True Skill-Aware Resolver Member Scoring & Tiebreaking (Priority: P0)
- The system must maintain a granular per-agent skill model across all 11 resolver groups with 1–5 proficiency ratings.
- Required skill proficiencies must be mapped to each intent type.
- Member scoring formula:
  $$\text{Skill Coverage Score} = \frac{\sum \min(\text{actual\_level}, \text{required\_level})}{\sum \text{required\_level}} \times 100\%$$
- Candidate selection ranking:
  $$\text{Candidate Score} = (\text{Skill Coverage} \times 0.8) + (\text{Availability Score} \times 0.2)$$
- Real-time availability score ($0.0 \text{ to } 1.0$) must act as an automated tiebreaker when multiple specialists meet skill requirements.
- The assignment output must explicitly surface: `assignedMember`, `skillMatchScore`, `availabilityScore`, `matchedSkills`, `missingSkills`, `tiebreakReason`, and `teamProfile`.

### FR-7: Manual Review Triage Queue & Authorized Override (Priority: P0)
- The triage view must display all tickets in `MANUAL_REVIEW` status.
- Authorized Support Leads can trigger an override modal, reassign the ticket to any active resolver group, and provide mandatory textual justification.
- Reassignment transitions ticket status to `OVERRIDDEN` and increments `bouncedCount`.

### FR-8: Immutable Audit Trail (Priority: P0)
- Every routing event (`AUTO_ROUTE`, `SENT_TO_MANUAL_REVIEW`, `OVERRIDE`) must append an immutable record.
- Logged fields: `timestamp` (ISO 8601 UTC), `ticketId`, `action`, `actor`, `previousGroup`, `newGroup`, `reason`.

### FR-9: Operational Analytics & Bounce Reduction Metrics (Priority: P1)
- Live calculations for:
  - **First-Assignment Accuracy %:** $\frac{\text{Tickets correct on initial assignment}}{\text{Total actionable non-review tickets}} \times 100\%$
  - **System Bounce Rate %:** $\frac{\sum \text{bouncedCount}}{\text{Total Tickets}} \times 100\%$
  - **Bounce Reduction %:** $\frac{42.0\% - \text{System Bounce Rate}}{42.0\%} \times 100\%$
  - Regional ticket volume distributions and top detected intent charts.

### FR-10: Resolver Teams & Skills Roster View (Priority: P1)
- Interactive searchable and filterable directory of all 11 resolver teams.
- Displays team lead, coverage hours, supported languages, headcount, average SLA resolution hours, and individual agent skill matrices with proficiency stars.

### FR-11: REST API & Integration Stub (Priority: P0)
- Standalone Python HTTP service exposing:
  - `POST /api/route`: Accepts `{ text, region, channel, asset, userRole }`, returns complete JSON decision object.
  - `GET /api/health`: Healthcheck, uptime counter, and endpoint directory.
  - `GET /api/roster`: Resolver team directory and agent skill profiles.
  - `POST /api/override`: Programmatic reassignment webhook.

### FR-12: Automated 12-Scenario Test Runner (Priority: P0)
- Integrated test suite verifying 12 scenarios covering auto-routing, GDPR, security mandates, soft boosts, threshold forcing, authorized overrides, zero-byte/empty payloads, whitespace handling, skill tiebreaking, and API contract integrity.

---

## 4. Non-Functional Requirements (NFR)

- **NFR-1: Processing Latency:** In-browser client evaluation must execute in $< 5\text{ ms}$. REST API request round-trip must complete in $< 50\text{ ms}$.
- **NFR-2: Zero External Dependencies:** Core client must run entirely in modern standards-compliant web browsers (ES6 modules). API server must execute using Python 3.13 standard libraries (`http.server`, `urllib`, `json`) without requiring third-party pip packages.
- **NFR-3: Regulatory Data Sovereignty:** Hard constraints must guarantee zero ticket leakage outside the EEA for EU financial/payroll data, complying with GDPR Articles 44–50.
- **NFR-4: Browser Compatibility:** Supported on Chrome 100+, Firefox 100+, Edge 100+, Safari 15+.
- **NFR-5: High Availability:** Local storage persistence ensures state recovery on page reloads. Server API supports stateless horizontal scaling.
- **NFR-6: UI Accessibility & Ergonomics:** Responsive Glassmorphism dark-mode UI complying with WCAG 2.1 AA color contrast standards.
- **NFR-7: Determinism:** Given identical input text, metadata, and threshold, routing and member assignment outputs must be 100% deterministic.
- **NFR-8: Audit Immutability:** Audit records must only permit append operations; deletion or inline editing of audit history is strictly prohibited.

---

## 5. Edge Cases & Failure States Specification

| Scenario | Input Condition | System Behavior | Expected Result |
| :--- | :--- | :--- | :--- |
| **Empty / Zero-Byte Payload** | `text: ""` | Intercepted in pre-validation. Confidence set to $20\%$. | Status: `MANUAL_REVIEW`, Group: `Manual-Review`, Reason: `Empty description payload`. |
| **Whitespace-Only Payload** | `text: "   \n\t   "` | Trimmed to zero length; detected as malformed. | Status: `MANUAL_REVIEW`, Group: `Manual-Review`. |
| **Vague / Slang Description** | `"laptop is acting weird"` | Single or zero keyword match; confidence $< 70\%$. | Status: `MANUAL_REVIEW`, Group: `Manual-Review`. |
| **Conflicting Regional Constraints** | EMEA user with Global IAM asset | Evaluates both rules; Security Mandate takes precedence. | Group: `Global-SecOps`, Reason: `Enterprise Security policy mandates Global-SecOps`. |
| **Equal Skill Ties** | Two specialists with identical $100\%$ skill match | Availability score evaluated as secondary tiebreaker. | Specialist with higher availability selected; tiebreak reason logged. |
| **LocalStorage Corruption** | Corrupt JSON in browser cache | Handled via `try/catch` block; auto-resets to clean default seed dataset. | System initializes without crashing; logs warning to browser console. |

---

## 6. Acceptance Criteria (AC)

- **AC-1 (Skill-Aware Assignment):** When a valid ticket is processed, the system returns an assigned specialist agent name, skill match percentage ($\ge 0\%$), list of matched skills with levels, and the tiebreaker selection reason.
- **AC-2 (Regulatory Sovereignty):** Submitting an EMEA Finance ticket MUST route to `EMEA-Finance-Ops` and assign Claire Dupont or Hans Weber; routing to NA or APAC MUST be impossible under hard constraints.
- **AC-3 (Security Mandate):** Submitting an IAM or phishing ticket MUST route to `Global-SecOps` and assign Marcus Reid or Nina Koch.
- **AC-4 (Triage Intercept):** Any ticket scoring below the threshold slider value MUST be diverted to the `Manual Review` queue with status `MANUAL_REVIEW`.
- **AC-5 (Authorized Override):** An authorized user must be able to reassign any ticket in the Manual Review queue; doing so MUST transition status to `OVERRIDDEN` and create an audit log.
- **AC-6 (Audit Integrity):** Every auto-route and manual override MUST create an audit entry containing timestamp, actor, ticket ID, previous group, new group, and rationale.
- **AC-7 (REST API Contract):** `POST /api/route` must accept JSON and return `{ id, status, recommendedGroup, recommendedGroupName, assignedMember, confidence, skillMatchScore, availabilityScore, matchedSkills, hardConstraints, softConstraints }`.
- **AC-8 (Zero-Byte Resilience):** Sending empty text to the client or API must return status `MANUAL_REVIEW` without throwing an uncaught exception.
- **AC-9 (Test Runner Pass Rate):** Executing `runAllTests()` must return 12 passed tests out of 12 (100% pass rate).
- **AC-10 (Metric Computations):** The analytics banner must accurately reflect 80% First-Assignment Accuracy and 88.1% Bounce Reduction based on the seeded validation dataset.
