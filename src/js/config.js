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

// ---------------------------------------------------------------------------
// SKILL MODEL: Per-member skills per resolver group
// Proficiency scale: 1 (beginner) → 5 (expert)
// availability: 0.0–1.0 (simulated workload-based availability score)
// ---------------------------------------------------------------------------
export const RESOLVER_MEMBER_SKILLS = {
  'NA-IT-Hardware': [
    { name: 'Alice Carter',   skills: { 'Hardware Repair': 5, 'Laptop Diagnosis': 5, 'Peripheral Support': 4, 'BIOS/Firmware': 3 }, availability: 0.9 },
    { name: 'Brian Moss',     skills: { 'Hardware Repair': 4, 'Laptop Diagnosis': 3, 'Peripheral Support': 5, 'BIOS/Firmware': 4 }, availability: 0.7 }
  ],
  'EMEA-IT-Hardware': [
    { name: 'Sophie Müller',  skills: { 'Hardware Repair': 5, 'Laptop Diagnosis': 4, 'Peripheral Support': 3, 'BIOS/Firmware': 3 }, availability: 0.85 },
    { name: 'Luca Romano',    skills: { 'Hardware Repair': 3, 'Laptop Diagnosis': 5, 'Peripheral Support': 4, 'BIOS/Firmware': 5 }, availability: 0.6 }
  ],
  'APAC-IT-Hardware': [
    { name: 'Kenji Tanaka',   skills: { 'Hardware Repair': 5, 'Laptop Diagnosis': 5, 'Peripheral Support': 3, 'BIOS/Firmware': 4 }, availability: 0.95 },
    { name: 'Priya Sharma',   skills: { 'Hardware Repair': 4, 'Laptop Diagnosis': 4, 'Peripheral Support': 5, 'BIOS/Firmware': 2 }, availability: 0.8 }
  ],
  'LATAM-IT-Hardware': [
    { name: 'Carlos Vega',    skills: { 'Hardware Repair': 4, 'Laptop Diagnosis': 4, 'Peripheral Support': 4, 'BIOS/Firmware': 3 }, availability: 0.75 }
  ],
  'NA-Net-VPN': [
    { name: 'Derek Walsh',    skills: { 'VPN Tunnelling': 5, 'Network Diagnostics': 5, 'DNS/Firewall': 4, 'Cisco Routing': 5 }, availability: 0.88 },
    { name: 'Tanya Lin',      skills: { 'VPN Tunnelling': 4, 'Network Diagnostics': 5, 'DNS/Firewall': 5, 'Cisco Routing': 3 }, availability: 0.65 }
  ],
  'EMEA-Net-VPN': [
    { name: 'Fatima Al-Saad', skills: { 'VPN Tunnelling': 5, 'Network Diagnostics': 4, 'DNS/Firewall': 5, 'Cisco Routing': 4 }, availability: 0.9 },
    { name: 'Andrei Petrov',  skills: { 'VPN Tunnelling': 3, 'Network Diagnostics': 5, 'DNS/Firewall': 4, 'Cisco Routing': 5 }, availability: 0.7 }
  ],
  'APAC-Net-VPN': [
    { name: 'Li Wei',         skills: { 'VPN Tunnelling': 5, 'Network Diagnostics': 5, 'DNS/Firewall': 3, 'Cisco Routing': 4 }, availability: 0.82 }
  ],
  'Global-SecOps': [
    { name: 'Marcus Reid',    skills: { 'IAM / SSO': 5, 'Phishing Response': 5, 'MFA Enforcement': 5, 'Threat Analysis': 4, 'Okta Admin': 5 }, availability: 0.95 },
    { name: 'Nina Koch',      skills: { 'IAM / SSO': 4, 'Phishing Response': 5, 'MFA Enforcement': 4, 'Threat Analysis': 5, 'Okta Admin': 4 }, availability: 0.8 }
  ],
  'Global-ERP-Support': [
    { name: 'Rohan Das',      skills: { 'SAP Administration': 5, 'Salesforce CRM': 4, 'Office365 Support': 5, 'ERP Licensing': 5 }, availability: 0.75 },
    { name: 'Elena Moreau',   skills: { 'SAP Administration': 4, 'Salesforce CRM': 5, 'Office365 Support': 4, 'ERP Licensing': 3 }, availability: 0.85 }
  ],
  'EMEA-Finance-Ops': [
    { name: 'Claire Dupont',  skills: { 'Payroll Systems': 5, 'Workday HR': 5, 'Finance Compliance': 5, 'GDPR Handling': 5 }, availability: 0.9 },
    { name: 'Hans Weber',     skills: { 'Payroll Systems': 4, 'Workday HR': 4, 'Finance Compliance': 4, 'GDPR Handling': 5 }, availability: 0.7 }
  ],
  'LATAM-Finance-Ops': [
    { name: 'Isabella Ruiz',  skills: { 'Payroll Systems': 5, 'Workday HR': 4, 'Finance Compliance': 5, 'GDPR Handling': 2 }, availability: 0.85 }
  ]
};

// ---------------------------------------------------------------------------
// TICKET SKILL REQUIREMENTS: Required skill proficiency per intent
// Weight = minimum proficiency level needed from assigned agent (1–5)
// ---------------------------------------------------------------------------
export const TICKET_SKILL_REQUIREMENTS = {
  HARDWARE_FAULT:    { 'Hardware Repair': 4, 'Laptop Diagnosis': 3, 'Peripheral Support': 2, 'BIOS/Firmware': 2 },
  VPN_CONNECTIVITY:  { 'VPN Tunnelling': 4, 'Network Diagnostics': 3, 'DNS/Firewall': 2, 'Cisco Routing': 2 },
  PASSWORD_RESET:    { 'IAM / SSO': 4, 'Okta Admin': 3, 'MFA Enforcement': 3 },
  SECURITY_INCIDENT: { 'Phishing Response': 5, 'Threat Analysis': 4, 'IAM / SSO': 3, 'MFA Enforcement': 3 },
  PAYROLL_FINANCE:   { 'Payroll Systems': 5, 'Workday HR': 3, 'Finance Compliance': 4, 'GDPR Handling': 3 },
  SOFTWARE_LICENSE:  { 'SAP Administration': 3, 'ERP Licensing': 4, 'Salesforce CRM': 2, 'Office365 Support': 2 },
  UNKNOWN:           {}
};

// ---------------------------------------------------------------------------
// TEAM SKILL PROFILES: Team-scoped capabilities, coverage, and SLAs
// ---------------------------------------------------------------------------
export const TEAM_SKILL_PROFILES = {
  'NA-IT-Hardware': {
    teamLead: 'Alice Carter',
    primaryFocus: 'Laptops, Desktops, BIOS, Peripherals',
    coreCompetencies: ['Hardware Repair', 'Laptop Diagnosis', 'Peripheral Support'],
    coverageHours: '08:00 - 18:00 EST',
    languages: ['English', 'Spanish'],
    headcount: 2,
    avgResolutionTimeHours: 1.8
  },
  'EMEA-IT-Hardware': {
    teamLead: 'Sophie Müller',
    primaryFocus: 'EU Depot Hardware, Field Diagnosis, Warranty Replacement',
    coreCompetencies: ['Hardware Repair', 'Laptop Diagnosis', 'BIOS/Firmware'],
    coverageHours: '08:00 - 18:00 CET',
    languages: ['English', 'German', 'Italian'],
    headcount: 2,
    avgResolutionTimeHours: 2.1
  },
  'APAC-IT-Hardware': {
    teamLead: 'Kenji Tanaka',
    primaryFocus: 'APAC Fleet Management & Rapid Device Replacement',
    coreCompetencies: ['Hardware Repair', 'Laptop Diagnosis', 'Peripheral Support'],
    coverageHours: '08:00 - 19:00 JST/IST',
    languages: ['English', 'Japanese', 'Hindi'],
    headcount: 2,
    avgResolutionTimeHours: 1.5
  },
  'LATAM-IT-Hardware': {
    teamLead: 'Carlos Vega',
    primaryFocus: 'Regional Logistics, Mobile Hardware, Desktop Support',
    coreCompetencies: ['Hardware Repair', 'Laptop Diagnosis', 'Peripheral Support'],
    coverageHours: '08:00 - 17:00 BRT',
    languages: ['Spanish', 'Portuguese', 'English'],
    headcount: 1,
    avgResolutionTimeHours: 2.4
  },
  'NA-Net-VPN': {
    teamLead: 'Derek Walsh',
    primaryFocus: 'Enterprise VPN Tunnels, Cisco SD-WAN, DNS Infrastructure',
    coreCompetencies: ['VPN Tunnelling', 'Network Diagnostics', 'Cisco Routing'],
    coverageHours: '24/7 Follow-the-Sun',
    languages: ['English'],
    headcount: 2,
    avgResolutionTimeHours: 0.9
  },
  'EMEA-Net-VPN': {
    teamLead: 'Fatima Al-Saad',
    primaryFocus: 'European WAN Gateways, Secure Firewalls, Remote Workers',
    coreCompetencies: ['VPN Tunnelling', 'Network Diagnostics', 'DNS/Firewall'],
    coverageHours: '07:00 - 19:00 GMT/CET',
    languages: ['English', 'Arabic', 'Russian'],
    headcount: 2,
    avgResolutionTimeHours: 1.2
  },
  'APAC-Net-VPN': {
    teamLead: 'Li Wei',
    primaryFocus: 'Subsea Transit Links, Regional Gateways, VPN Latency',
    coreCompetencies: ['VPN Tunnelling', 'Network Diagnostics', 'Cisco Routing'],
    coverageHours: '08:00 - 18:00 SGT',
    languages: ['English', 'Mandarin'],
    headcount: 1,
    avgResolutionTimeHours: 1.1
  },
  'Global-SecOps': {
    teamLead: 'Marcus Reid',
    primaryFocus: 'Zero-Trust IAM, Incident Response, Okta MFA, Threat Remediation',
    coreCompetencies: ['IAM / SSO', 'Phishing Response', 'MFA Enforcement', 'Threat Analysis'],
    coverageHours: '24/7 Global SOC',
    languages: ['English', 'German', 'Spanish'],
    headcount: 2,
    avgResolutionTimeHours: 0.5
  },
  'Global-ERP-Support': {
    teamLead: 'Rohan Das',
    primaryFocus: 'SAP S/4HANA Core, Salesforce CRM, Enterprise Licensing',
    coreCompetencies: ['SAP Administration', 'ERP Licensing', 'Salesforce CRM', 'Office365 Support'],
    coverageHours: '06:00 - 20:00 UTC',
    languages: ['English', 'Hindi', 'French'],
    headcount: 2,
    avgResolutionTimeHours: 3.2
  },
  'EMEA-Finance-Ops': {
    teamLead: 'Claire Dupont',
    primaryFocus: 'EU GDPR Payroll Sovereignty, Workday HRIS, Regional Banking IT',
    coreCompetencies: ['Payroll Systems', 'Workday HR', 'Finance Compliance', 'GDPR Handling'],
    coverageHours: '08:00 - 18:00 CET',
    languages: ['English', 'French', 'German'],
    headcount: 2,
    avgResolutionTimeHours: 1.4
  },
  'LATAM-Finance-Ops': {
    teamLead: 'Isabella Ruiz',
    primaryFocus: 'LATAM Statutory Tax Integration, Regional Payroll & Expense',
    coreCompetencies: ['Payroll Systems', 'Finance Compliance', 'Workday HR'],
    coverageHours: '08:00 - 18:00 BRT/COT',
    languages: ['Spanish', 'Portuguese', 'English'],
    headcount: 1,
    avgResolutionTimeHours: 1.7
  },
  'Manual-Review': {
    teamLead: 'Global Triage Lead',
    primaryFocus: 'Unclassified Ambiguous Tickets & Exception Handling',
    coreCompetencies: ['Incident Triage', 'Cross-Functional Routing', 'Root Cause Discovery'],
    coverageHours: '24/7 Business Hours',
    languages: ['English', 'Spanish', 'French', 'Mandarin'],
    headcount: 4,
    avgResolutionTimeHours: 0.8
  }
};


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
