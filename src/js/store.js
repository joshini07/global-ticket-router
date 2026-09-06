// Store Module: LocalStorage Persistence & Metric Calculations

const STORAGE_KEY_TICKETS = 'gtr_tickets_v1';
const STORAGE_KEY_AUDIT = 'gtr_audit_v1';
const STORAGE_KEY_THRESHOLD = 'gtr_threshold_v1';

const DEFAULT_SEED_TICKETS = [
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
    finalGroup: 'APAC-IT-Hardware',
    confidence: 92,
    status: 'AUTO_ROUTED',
    hardConstraintsApplied: [],
    softConstraintsApplied: ['Soft Constraint Matched: Local Region (+15%)'],
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
    finalGroup: 'EMEA-Finance-Ops',
    confidence: 88,
    status: 'AUTO_ROUTED',
    hardConstraintsApplied: ['Hard Constraint Triggered: EMEA GDPR Data Sovereignty locks ticket to EMEA-Finance-Ops.'],
    softConstraintsApplied: ['Soft Constraint Matched: Local Region (+15%)', 'Soft Constraint Matched: Verified User Role (+5%)'],
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
    finalGroup: 'Manual-Review',
    confidence: 45,
    status: 'MANUAL_REVIEW',
    hardConstraintsApplied: [],
    softConstraintsApplied: [],
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
    finalGroup: 'EMEA-Net-VPN',
    confidence: 85,
    status: 'AUTO_ROUTED',
    hardConstraintsApplied: [],
    softConstraintsApplied: ['Soft Constraint Matched: Local Region (+15%)', 'Soft Constraint Matched: High Urgency Channel (+10%)'],
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
    finalGroup: 'Global-SecOps',
    confidence: 98,
    status: 'AUTO_ROUTED',
    hardConstraintsApplied: ['Hard Constraint Triggered: Enterprise Security policy mandates Global-SecOps.'],
    softConstraintsApplied: ['Soft Constraint Matched: High Urgency Channel (+10%)', 'Soft Constraint Matched: Verified User Role (+5%)'],
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
    finalGroup: 'LATAM-IT-Hardware',
    confidence: 78,
    status: 'OVERRIDDEN',
    hardConstraintsApplied: [],
    softConstraintsApplied: [],
    isOverridden: true,
    overrideReason: 'Reassigned by Support Lead: Local LATAM IT handles SAP desktop client provisioning directly.',
    bouncedCount: 1,
    timestamp: '2026-09-06T12:45:00.000Z'
  }
];

const DEFAULT_SEED_AUDIT = [
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
    reason: 'Auto-routed based on 98% confidence score and Hard Security Constraint.',
    timestamp: '2026-09-06T12:20:00.000Z'
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
      return DEFAULT_SEED_TICKETS;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_SEED_TICKETS;
    }
  }

  saveTickets(tickets) {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
  }

  loadAudit() {
    const data = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (!data) {
      this.saveAudit(DEFAULT_SEED_AUDIT);
      return DEFAULT_SEED_AUDIT;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_SEED_AUDIT;
    }
  }

  saveAudit(audit) {
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(audit));
  }

  addTicket(ticket) {
    this.tickets.unshift(ticket);
    this.saveTickets(this.tickets);

    // Add audit record
    this.addAuditRecord({
      id: `AUD-${Date.now().toString().slice(-5)}`,
      ticketId: ticket.id,
      action: ticket.status === 'AUTO_ROUTED' ? 'AUTO_ROUTE' : 'SENT_TO_MANUAL_REVIEW',
      actor: 'System Router',
      previousGroup: null,
      newGroup: ticket.finalGroup,
      reason: ticket.status === 'AUTO_ROUTED'
        ? `Auto-routed with ${ticket.confidence}% confidence to ${ticket.recommendedGroup}`
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
    const accurateFirstAssignment = this.tickets.filter(t => !t.isOverridden && t.status !== 'MANUAL_REVIEW').length;
    const accuracyRate = Math.round((accurateFirstAssignment / (total - manualReview || 1)) * 100);

    // Bounce Rate Calculation:
    // Without Global Ticket Router, typical enterprise bounce rate is ~42%.
    // With Global Ticket Router, bounce occurs only when a ticket is manually overridden to a 2nd team.
    const totalBounces = this.tickets.reduce((acc, t) => acc + (t.bouncedCount || 0), 0);
    const systemBounceRate = parseFloat(((totalBounces / total) * 100).toFixed(1));
    const baselineBounceRate = 42.0;
    const bounceReductionRate = parseFloat((((baselineBounceRate - systemBounceRate) / baselineBounceRate) * 100).toFixed(1));

    return {
      totalTickets: total,
      autoRouted,
      manualReview,
      overridden,
      accuracyRate: isNaN(accuracyRate) ? 100 : Math.min(100, accuracyRate),
      baselineBounceRate,
      systemBounceRate,
      bounceReductionRate: isNaN(bounceReductionRate) ? 100 : Math.max(0, bounceReductionRate)
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
