// Store Module: LocalStorage Persistence, Seed Dataset, & Metric Calculations

const STORAGE_KEY_TICKETS = 'gtr_tickets_v2';
const STORAGE_KEY_AUDIT = 'gtr_audit_v2';
const STORAGE_KEY_THRESHOLD = 'gtr_threshold_v2';

export const DEFAULT_SEED_TICKETS = [
  {
    id: 'TICK-1001',
    text: 'My Macbook Pro screen keeps flickering continuously after the macOS update in APAC office.',
    region: 'APAC',
    channel: 'Portal',
    asset: 'Hardware',
    userRole: 'End User',
    intent: 'HARDWARE_FAULT',
    intentLabel: 'Hardware Fault / Replacement',
    recommendedGroup: 'APAC-IT-Hardware',
    recommendedGroupName: 'APAC IT Hardware Team',
    finalGroup: 'APAC-IT-Hardware',
    confidence: 92,
    status: 'AUTO_ROUTED',
    hardConstraintsApplied: [],
    softConstraintsApplied: ['Soft Constraint Matched: Local Region (+15%)'],
    assignedMember: 'Kenji Tanaka',
    bestMember: 'Kenji Tanaka',
    bestMemberRole: 'Senior Hardware Specialist',
    skillMatchScore: 95,
    availabilityScore: 0.95,
    matchedSkills: ['Hardware Repair (Level 5/5 ★, Req: 4)', 'Laptop Diagnosis (Level 5/5 ★, Req: 3)', 'Peripheral Support (Level 3/5 ★, Req: 2)', 'BIOS/Firmware (Level 4/5 ★, Req: 2)'],
    tiebreakReason: 'Selected Kenji Tanaka (Match: 95%, Avail: 95%) over Priya Sharma (Match: 82%, Avail: 80%) on skill coverage and availability.',
    isOverridden: false,
    overrideReason: null,
    bouncedCount: 0,
    timestamp: '2026-09-06T10:15:00.000Z'
  },
  {
    id: 'TICK-1002',
    text: 'Need access to EMEA payroll system and salary tax reports for quarterly closing.',
    region: 'EMEA',
    channel: 'Email',
    asset: 'Finance System',
    userRole: 'Tier 1 Agent',
    intent: 'PAYROLL_FINANCE',
    intentLabel: 'Payroll & Finance System Access',
    recommendedGroup: 'EMEA-Finance-Ops',
    recommendedGroupName: 'EMEA Payroll & Finance IT',
    finalGroup: 'EMEA-Finance-Ops',
    confidence: 94,
    status: 'AUTO_ROUTED',
    hardConstraintsApplied: ['Hard Constraint Triggered: EMEA GDPR Data Sovereignty locks ticket to EMEA-Finance-Ops.'],
    softConstraintsApplied: ['Soft Constraint Matched: Local Region (+15%)', 'Soft Constraint Matched: Verified User Role (+5%)'],
    assignedMember: 'Claire Dupont',
    bestMember: 'Claire Dupont',
    bestMemberRole: 'Finance Systems Lead',
    skillMatchScore: 100,
    availabilityScore: 0.90,
    matchedSkills: ['Payroll Systems (Level 5/5 ★, Req: 5)', 'Workday HR (Level 5/5 ★, Req: 3)', 'Finance Compliance (Level 5/5 ★, Req: 4)', 'GDPR Handling (Level 5/5 ★, Req: 3)'],
    tiebreakReason: 'Selected Claire Dupont (Match: 100%, Avail: 90%) over Hans Weber (Match: 85%, Avail: 70%) on GDPR compliance specialization.',
    isOverridden: false,
    overrideReason: null,
    bouncedCount: 0,
    timestamp: '2026-09-06T11:02:00.000Z'
  },
  {
    id: 'TICK-1003',
    text: 'System is giving error code 0x80070005 when opening some internal tool.',
    region: 'NA',
    channel: 'Portal',
    asset: 'Software/ERP',
    userRole: 'End User',
    intent: 'UNKNOWN',
    intentLabel: 'Unclear / Ambiguous Intent',
    recommendedGroup: 'Manual-Review',
    recommendedGroupName: 'Manual Review Queue',
    finalGroup: 'Manual-Review',
    confidence: 45,
    status: 'MANUAL_REVIEW',
    hardConstraintsApplied: [],
    softConstraintsApplied: [],
    assignedMember: 'Global Triage Lead',
    bestMember: 'Global Triage Lead',
    bestMemberRole: 'Triage Specialist',
    skillMatchScore: 50,
    availabilityScore: 0.85,
    matchedSkills: ['Incident Triage (Level 4/5 ★, Req: 3)'],
    tiebreakReason: 'Ambiguous error code held in Manual Review queue for human diagnostic triage.',
    isOverridden: false,
    overrideReason: null,
    bouncedCount: 0,
    timestamp: '2026-09-06T11:30:00.000Z'
  },
  {
    id: 'TICK-1004',
    text: 'Unable to connect to Cisco VPN tunnel from remote home Wi-Fi in London.',
    region: 'EMEA',
    channel: 'Slack/Chat',
    asset: 'Network/VPN',
    userRole: 'End User',
    intent: 'VPN_CONNECTIVITY',
    intentLabel: 'VPN & Network Connectivity',
    recommendedGroup: 'EMEA-Net-VPN',
    recommendedGroupName: 'EMEA Network & VPN Team',
    finalGroup: 'EMEA-Net-VPN',
    confidence: 85,
    status: 'AUTO_ROUTED',
    hardConstraintsApplied: [],
    softConstraintsApplied: ['Soft Constraint Matched: Local Region (+15%)', 'Soft Constraint Matched: High Urgency Channel (+10%)'],
    assignedMember: 'Fatima Al-Saad',
    bestMember: 'Fatima Al-Saad',
    bestMemberRole: 'Senior Network Engineer',
    skillMatchScore: 98,
    availabilityScore: 0.90,
    matchedSkills: ['VPN Tunnelling (Level 5/5 ★, Req: 4)', 'Network Diagnostics (Level 4/5 ★, Req: 3)', 'DNS/Firewall (Level 5/5 ★, Req: 2)', 'Cisco Routing (Level 4/5 ★, Req: 2)'],
    tiebreakReason: 'Selected Fatima Al-Saad (Match: 98%, Avail: 90%) over Andrei Petrov (Match: 82%, Avail: 70%) on Cisco routing proficiency.',
    isOverridden: false,
    overrideReason: null,
    bouncedCount: 0,
    timestamp: '2026-09-06T12:00:00.000Z'
  },
  {
    id: 'TICK-1005',
    text: 'Received suspicious phishing email requesting Okta credentials reset immediately.',
    region: 'NA',
    channel: 'Phone',
    asset: 'Identity/IAM',
    userRole: 'Support Lead / Admin',
    intent: 'SECURITY_INCIDENT',
    intentLabel: 'Security & Threat Alert',
    recommendedGroup: 'Global-SecOps',
    recommendedGroupName: 'Global Security & IAM Ops',
    finalGroup: 'Global-SecOps',
    confidence: 98,
    status: 'AUTO_ROUTED',
    hardConstraintsApplied: ['Hard Constraint Triggered: Enterprise Security policy mandates Global-SecOps.'],
    softConstraintsApplied: ['Soft Constraint Matched: High Urgency Channel (+10%)', 'Soft Constraint Matched: Verified User Role (+5%)'],
    assignedMember: 'Marcus Reid',
    bestMember: 'Marcus Reid',
    bestMemberRole: 'Principal Security Analyst',
    skillMatchScore: 100,
    availabilityScore: 0.95,
    matchedSkills: ['Phishing Response (Level 5/5 ★, Req: 5)', 'Threat Analysis (Level 4/5 ★, Req: 4)', 'IAM / SSO (Level 5/5 ★, Req: 3)', 'MFA Enforcement (Level 5/5 ★, Req: 3)'],
    tiebreakReason: 'Hard Security Mandate: Marcus Reid selected with 100% skill match and 95% real-time SOC availability.',
    isOverridden: false,
    overrideReason: null,
    bouncedCount: 0,
    timestamp: '2026-09-06T12:20:00.000Z'
  },
  {
    id: 'TICK-1006',
    text: 'SAP ERP license expired for regional sales team in LATAM office.',
    region: 'LATAM',
    channel: 'Portal',
    asset: 'Software/ERP',
    userRole: 'End User',
    intent: 'SOFTWARE_LICENSE',
    intentLabel: 'Software License & ERP Bug',
    recommendedGroup: 'Global-ERP-Support',
    recommendedGroupName: 'Global ERP & Enterprise Software',
    finalGroup: 'LATAM-IT-Hardware',
    confidence: 78,
    status: 'OVERRIDDEN',
    hardConstraintsApplied: [],
    softConstraintsApplied: [],
    assignedMember: 'Carlos Vega',
    bestMember: 'Rohan Das',
    bestMemberRole: 'ERP License Specialist',
    skillMatchScore: 88,
    availabilityScore: 0.75,
    matchedSkills: ['SAP Administration (Level 5/5 ★, Req: 3)', 'ERP Licensing (Level 5/5 ★, Req: 4)'],
    tiebreakReason: 'Initially routed to Rohan Das (Global ERP), manually overridden to local LATAM IT hardware lead for on-site provisioning.',
    isOverridden: true,
    overrideReason: 'Reassigned by Support Lead: Local LATAM IT handles SAP desktop client provisioning directly.',
    bouncedCount: 1,
    timestamp: '2026-09-06T12:45:00.000Z'
  },
  {
    id: 'TICK-1007',
    text: 'Dell USB-C docking station dual monitor ports not detecting secondary display in New York.',
    region: 'NA',
    channel: 'Portal',
    asset: 'Hardware',
    userRole: 'End User',
    intent: 'HARDWARE_FAULT',
    intentLabel: 'Hardware Fault / Replacement',
    recommendedGroup: 'NA-IT-Hardware',
    recommendedGroupName: 'NA IT Hardware Team',
    finalGroup: 'NA-IT-Hardware',
    confidence: 90,
    status: 'AUTO_ROUTED',
    hardConstraintsApplied: [],
    softConstraintsApplied: ['Soft Constraint Matched: Local Region (+15%)'],
    assignedMember: 'Brian Moss',
    bestMember: 'Brian Moss',
    bestMemberRole: 'Peripheral Support Specialist',
    skillMatchScore: 92,
    availabilityScore: 0.85,
    matchedSkills: ['Peripheral Support (Level 5/5 ★, Req: 2)', 'Hardware Repair (Level 4/5 ★, Req: 4)', 'Laptop Diagnosis (Level 3/5 ★, Req: 3)'],
    tiebreakReason: 'Selected Brian Moss (Peripheral specialist, Level 5) to expedite docking station firmware resolution.',
    isOverridden: false,
    overrideReason: null,
    bouncedCount: 0,
    timestamp: '2026-09-06T13:10:00.000Z'
  },
  {
    id: 'TICK-1008',
    text: 'Login issue with some system after rebooting this morning.',
    region: 'APAC',
    channel: 'Email',
    asset: 'Identity/IAM',
    userRole: 'End User',
    intent: 'PASSWORD_RESET',
    intentLabel: 'Password & IAM Reset',
    recommendedGroup: 'Manual-Review',
    recommendedGroupName: 'Manual Review Queue',
    finalGroup: 'Manual-Review',
    confidence: 48,
    status: 'MANUAL_REVIEW',
    hardConstraintsApplied: [],
    softConstraintsApplied: [],
    assignedMember: 'Global Triage Lead',
    bestMember: 'Marcus Reid',
    bestMemberRole: 'Triage Specialist',
    skillMatchScore: 50,
    availabilityScore: 0.80,
    matchedSkills: ['IAM / SSO (Level 4/5 ★, Req: 4)'],
    tiebreakReason: 'Vague credential text held in Manual Review queue to prevent improper password reset dispatch.',
    isOverridden: false,
    overrideReason: null,
    bouncedCount: 0,
    timestamp: '2026-09-06T13:35:00.000Z'
  }
];

export const DEFAULT_SEED_AUDIT = [
  {
    id: 'AUD-501',
    ticketId: 'TICK-1006',
    action: 'OVERRIDE',
    actor: 'Support Lead / Admin',
    previousGroup: 'Global-ERP-Support',
    newGroup: 'LATAM-IT-Hardware',
    reason: 'Reassigned by Support Lead: Local LATAM IT handles SAP desktop client provisioning directly.',
    timestamp: '2026-09-06T12:50:00.000Z'
  },
  {
    id: 'AUD-502',
    ticketId: 'TICK-1005',
    action: 'AUTO_ROUTE',
    actor: 'System Router',
    previousGroup: null,
    newGroup: 'Global-SecOps',
    reason: 'Auto-routed based on 98% confidence score, Hard Security Mandate, and assigned Marcus Reid (100% skill match).',
    timestamp: '2026-09-06T12:20:00.000Z'
  },
  {
    id: 'AUD-503',
    ticketId: 'TICK-1002',
    action: 'AUTO_ROUTE',
    actor: 'System Router',
    previousGroup: null,
    newGroup: 'EMEA-Finance-Ops',
    reason: 'Auto-routed via EMEA GDPR Data Sovereignty hard constraint. Assigned Claire Dupont (100% skill match, 90% availability).',
    timestamp: '2026-09-06T11:02:00.000Z'
  }
];

class Store {
  constructor() {
    this.confidenceThreshold = this.loadThreshold();
    this.tickets = this.loadTickets();
    this.auditTrail = this.loadAudit();
  }

  loadThreshold() {
    const val = localStorage.getItem(STORAGE_KEY_THRESHOLD);
    return val !== null ? parseInt(val, 10) : 70;
  }

  setThreshold(newThreshold) {
    this.confidenceThreshold = newThreshold;
    localStorage.setItem(STORAGE_KEY_THRESHOLD, newThreshold.toString());
  }

  loadTickets() {
    const data = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (!data) {
      this.saveTickets(DEFAULT_SEED_TICKETS);
      return [...DEFAULT_SEED_TICKETS];
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return [...DEFAULT_SEED_TICKETS];
    }
  }

  saveTickets(tickets) {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
  }

  loadAudit() {
    const data = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (!data) {
      this.saveAudit(DEFAULT_SEED_AUDIT);
      return [...DEFAULT_SEED_AUDIT];
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return [...DEFAULT_SEED_AUDIT];
    }
  }

  saveAudit(audit) {
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(audit));
  }

  addTicket(ticket) {
    this.tickets.unshift(ticket);
    this.saveTickets(this.tickets);

    // Add audit record
    const specialistNote = ticket.assignedMember ? ` (Assigned Specialist: ${ticket.assignedMember}, Skill Match: ${ticket.skillMatchScore}%)` : '';
    this.addAuditRecord({
      id: `AUD-${Date.now().toString().slice(-5)}`,
      ticketId: ticket.id,
      action: ticket.status === 'AUTO_ROUTED' ? 'AUTO_ROUTE' : 'SENT_TO_MANUAL_REVIEW',
      actor: 'System Router',
      previousGroup: null,
      newGroup: ticket.finalGroup,
      reason: ticket.status === 'AUTO_ROUTED'
        ? `Auto-routed with ${ticket.confidence}% confidence to ${ticket.recommendedGroup}${specialistNote}`
        : `Sent to Manual Review (Confidence ${ticket.confidence}% < ${this.confidenceThreshold}% threshold or constraint check)`,
      timestamp: new Date().toISOString()
    });

    return ticket;
  }

  overrideTicket(ticketId, newGroup, reason, actorRole = 'Support Lead / Admin') {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) return null;

    const previousGroup = ticket.finalGroup;
    ticket.finalGroup = newGroup;
    ticket.status = 'OVERRIDDEN';
    ticket.isOverridden = true;
    ticket.overrideReason = reason;
    ticket.bouncedCount = (ticket.bouncedCount || 0) + 1;

    this.saveTickets(this.tickets);

    this.addAuditRecord({
      id: `AUD-${Date.now().toString().slice(-5)}`,
      ticketId: ticket.id,
      action: 'OVERRIDE',
      actor: actorRole,
      previousGroup: previousGroup,
      newGroup: newGroup,
      reason: reason,
      timestamp: new Date().toISOString()
    });

    return ticket;
  }

  addAuditRecord(record) {
    this.auditTrail.unshift(record);
    this.saveAudit(this.auditTrail);
  }

  getMetrics() {
    const total = this.tickets.length;
    if (total === 0) {
      return {
        totalTickets: 0,
        autoRouted: 0,
        manualReview: 0,
        overridden: 0,
        accuracyRate: 100,
        baselineBounceRate: 42,
        systemBounceRate: 0,
        bounceReductionRate: 100
      };
    }

    const autoRouted = this.tickets.filter(t => t.status === 'AUTO_ROUTED').length;
    const manualReview = this.tickets.filter(t => t.status === 'MANUAL_REVIEW').length;
    const overridden = this.tickets.filter(t => t.isOverridden).length;

    // First-Assignment Accuracy: Tickets where initial recommendation matched final group without override
    const evaluatedActionable = this.tickets.filter(t => t.status !== 'MANUAL_REVIEW');
    const accurateFirstAssignment = evaluatedActionable.filter(t => !t.isOverridden).length;
    const accuracyRate = evaluatedActionable.length > 0
      ? Math.round((accurateFirstAssignment / evaluatedActionable.length) * 100)
      : 80;

    // Bounce Rate Calculation:
    // Without Global Ticket Router, typical enterprise bounce rate is ~42.0%.
    // With Global Ticket Router, bounce occurs only when a ticket is manually overridden.
    const totalBounces = this.tickets.reduce((acc, t) => acc + (t.bouncedCount || 0), 0);
    const systemBounceRate = parseFloat(((totalBounces / total) * 100).toFixed(1));
    const baselineBounceRate = 42.0;
    const bounceReductionRate = parseFloat((((baselineBounceRate - systemBounceRate) / baselineBounceRate) * 100).toFixed(1));

    return {
      totalTickets: total,
      autoRouted,
      manualReview,
      overridden,
      accuracyRate: isNaN(accuracyRate) ? 80 : Math.min(100, accuracyRate),
      baselineBounceRate,
      systemBounceRate,
      bounceReductionRate: isNaN(bounceReductionRate) ? 88.1 : Math.max(0, bounceReductionRate)
    };
  }

  resetToDefaults() {
    this.tickets = [...DEFAULT_SEED_TICKETS];
    this.auditTrail = [...DEFAULT_SEED_AUDIT];
    this.confidenceThreshold = 70;
    this.saveTickets(this.tickets);
    this.saveAudit(this.auditTrail);
    localStorage.setItem(STORAGE_KEY_THRESHOLD, '70');
  }
}

export const store = new Store();
