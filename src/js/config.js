// System Configuration & Domain Definitions for Global Ticket Router

export const REGIONS = {
  NA: { id: 'NA', name: 'North America', code: 'NA' },
  EMEA: { id: 'EMEA', name: 'Europe, Middle East & Africa', code: 'EMEA' },
  APAC: { id: 'APAC', name: 'Asia-Pacific', code: 'APAC' },
  LATAM: { id: 'LATAM', name: 'Latin America', code: 'LATAM' }
};

export const CHANNELS = [
  'Portal',
  'Email',
  'Slack/Chat',
  'Phone'
];

export const ASSETS = [
  'Hardware',
  'Software/ERP',
  'Network/VPN',
  'Identity/IAM',
  'Finance System'
];

export const USER_ROLES = [
  'End User',
  'Tier 1 Agent',
  'Support Lead / Admin'
];

export const RESOLVER_GROUPS = [
  { id: 'NA-IT-Hardware', name: 'NA IT Hardware Team', region: 'NA', domain: 'Hardware' },
  { id: 'EMEA-IT-Hardware', name: 'EMEA IT Hardware Team', region: 'EMEA', domain: 'Hardware' },
  { id: 'APAC-IT-Hardware', name: 'APAC IT Hardware Team', region: 'APAC', domain: 'Hardware' },
  { id: 'LATAM-IT-Hardware', name: 'LATAM IT Hardware Team', region: 'LATAM', domain: 'Hardware' },
  { id: 'NA-Net-VPN', name: 'NA Network & VPN Team', region: 'NA', domain: 'Network/VPN' },
  { id: 'EMEA-Net-VPN', name: 'EMEA Network & VPN Team', region: 'EMEA', domain: 'Network/VPN' },
  { id: 'APAC-Net-VPN', name: 'APAC Network & VPN Team', region: 'APAC', domain: 'Network/VPN' },
  { id: 'Global-SecOps', name: 'Global Security & IAM Ops', region: 'GLOBAL', domain: 'Identity/IAM' },
  { id: 'Global-ERP-Support', name: 'Global ERP & Enterprise Software', region: 'GLOBAL', domain: 'Software/ERP' },
  { id: 'EMEA-Finance-Ops', name: 'EMEA Payroll & Finance IT', region: 'EMEA', domain: 'Finance System' },
  { id: 'LATAM-Finance-Ops', name: 'LATAM Finance IT Support', region: 'LATAM', domain: 'Finance System' },
  { id: 'Manual-Review', name: 'Manual Review Queue', region: 'GLOBAL', domain: 'Triage' }
];

export const INTENTS = {
  PASSWORD_RESET: {
    id: 'PASSWORD_RESET',
    label: 'Password & IAM Reset',
    defaultGroup: 'Global-SecOps',
    keywords: ['password', 'reset', 'locked', 'login', 'okta', 'auth', 'mfa', '2fa', 'sso', 'credential', 'access denied']
  },
  HARDWARE_FAULT: {
    id: 'HARDWARE_FAULT',
    label: 'Hardware Fault / Replacement',
    defaultGroupRegional: true,
    groupPrefix: 'IT-Hardware', // e.g. APAC-IT-Hardware
    keywords: ['screen', 'laptop', 'monitor', 'flicker', 'battery', 'keyboard', 'broken', 'boot', 'hardware', 'printer', 'mouse', 'docking', 'power', 'macbook', 'dell']
  },
  VPN_CONNECTIVITY: {
    id: 'VPN_CONNECTIVITY',
    label: 'VPN & Network Connectivity',
    defaultGroupRegional: true,
    groupPrefix: 'Net-VPN', // e.g. NA-Net-VPN
    keywords: ['vpn', 'connection', 'remote access', 'tunnel', 'disconnect', 'wifi', 'network', 'ping', 'dns', 'firewall', 'cisco', 'globalprotect', 'slow internet']
  },
  PAYROLL_FINANCE: {
    id: 'PAYROLL_FINANCE',
    label: 'Payroll & Finance System Access',
    defaultGroupRegional: true,
    groupPrefix: 'Finance-Ops',
    fallbackGroup: 'Global-ERP-Support',
    keywords: ['payroll', 'salary', 'workday', 'expense', 'invoice', 'payment', 'bank', 'payslip', 'reimbursement', 'tax']
  },
  SOFTWARE_LICENSE: {
    id: 'SOFTWARE_LICENSE',
    label: 'Software License & ERP Bug',
    defaultGroup: 'Global-ERP-Support',
    keywords: ['sap', 'license', 'salesforce', 'install', 'crash', 'bug', 'application', 'erp', 'office365', 'excel', 'outlook', 'software']
  },
  SECURITY_INCIDENT: {
    id: 'SECURITY_INCIDENT',
    label: 'Security & Threat Alert',
    defaultGroup: 'Global-SecOps',
    keywords: ['phishing', 'malware', 'unauthorized', 'stolen', 'breach', 'suspicious', 'virus', 'hacked', 'encryption', 'compromised']
  },
  UNKNOWN: {
    id: 'UNKNOWN',
    label: 'Unclear / Ambiguous Intent',
    defaultGroup: 'Manual-Review',
    keywords: []
  }
};

// Hard Constraints Rules Definition
export const HARD_CONSTRAINTS = [
  {
    id: 'RULE_EMEA_FINANCE_PRIVACY',
    name: 'EMEA Data Sovereignty (GDPR)',
    description: 'EMEA tickets for Finance System MUST be handled strictly by EMEA-Finance-Ops due to EU data privacy laws.',
    evaluate: (ticket) => {
      if (ticket.region === 'EMEA' && (ticket.asset === 'Finance System' || ticket.intent === 'PAYROLL_FINANCE')) {
        return {
          triggered: true,
          mandatoryGroup: 'EMEA-Finance-Ops',
          reason: 'Hard Constraint Triggered: EMEA GDPR Data Sovereignty locks ticket to EMEA-Finance-Ops.'
        };
      }
      return { triggered: false };
    }
  },
  {
    id: 'RULE_LATAM_PAYROLL_LOCK',
    name: 'LATAM Local Tax Compliance',
    description: 'LATAM Region tickets with Finance System asset MUST stay in LATAM-Finance-Ops.',
    evaluate: (ticket) => {
      if (ticket.region === 'LATAM' && ticket.asset === 'Finance System') {
        return {
          triggered: true,
          mandatoryGroup: 'LATAM-Finance-Ops',
          reason: 'Hard Constraint Triggered: LATAM Tax Compliance mandates LATAM-Finance-Ops routing.'
        };
      }
      return { triggered: false };
    }
  },
  {
    id: 'RULE_SECURITY_MANDATE',
    name: 'Mandatory Global SecOps Enforce',
    description: 'All Security Incidents or Identity/IAM asset requests MUST route to Global-SecOps regardless of region.',
    evaluate: (ticket) => {
      if (ticket.asset === 'Identity/IAM' || ticket.intent === 'SECURITY_INCIDENT') {
        return {
          triggered: true,
          mandatoryGroup: 'Global-SecOps',
          reason: 'Hard Constraint Triggered: Enterprise Security policy mandates Global-SecOps.'
        };
      }
      return { triggered: false };
    }
  }
];

// Soft Constraints Definitions
export const SOFT_CONSTRAINTS = [
  {
    id: 'PREFER_LOCAL_REGION',
    name: 'Local Regional Support Affinity',
    description: 'Adds +15% confidence boost when target team matches user region.',
    apply: (ticket, group, score) => {
      if (group.region === ticket.region) {
        return { scoreDelta: 15, note: 'Soft Constraint Matched: Local Region (+15%)' };
      }
      return { scoreDelta: 0, note: null };
    }
  },
  {
    id: 'HIGH_URGENCY_CHANNEL_BOOST',
    name: 'Real-time Channel Urgency Boost',
    description: 'Adds +10% confidence when ticket is submitted via Phone or Slack/Chat.',
    apply: (ticket, group, score) => {
      if (ticket.channel === 'Phone' || ticket.channel === 'Slack/Chat') {
        return { scoreDelta: 10, note: 'Soft Constraint Matched: High Urgency Channel (+10%)' };
      }
      return { scoreDelta: 0, note: null };
    }
  },
  {
    id: 'ROLE_AUTHORITY_BOOST',
    name: 'Manager / Support Agent Escalation',
    description: 'Adds +5% confidence boost when submitted by a Support Agent or Manager.',
    apply: (ticket, group, score) => {
      if (ticket.userRole === 'Support Lead / Admin' || ticket.userRole === 'Tier 1 Agent') {
        return { scoreDelta: 5, note: 'Soft Constraint Matched: Verified User Role (+5%)' };
      }
      return { scoreDelta: 0, note: null };
    }
  }
];
