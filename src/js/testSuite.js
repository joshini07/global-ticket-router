// Interactive Automated Test Suite Module

import { evaluateTicket } from './routingEngine.js';
import { store } from './store.js';

export const TEST_CASES = [
  {
    id: 'TC-01',
    title: 'High Confidence Regional Auto-Route',
    description: 'Verifies that clear APAC laptop screen fault text routes directly to APAC-IT-Hardware with high confidence.',
    input: {
      text: 'My laptop screen is flickering constantly after the latest software update in APAC office Tokyo.',
      region: 'APAC',
      channel: 'Portal',
      asset: 'Hardware',
      userRole: 'End User'
    },
    validate: (result) => {
      const passGroup = result.recommendedGroup === 'APAC-IT-Hardware';
      const passConfidence = result.confidence >= 80;
      const passStatus = result.status === 'AUTO_ROUTED';
      return {
        passed: passGroup && passConfidence && passStatus,
        details: `Recommended Group: ${result.recommendedGroup} (Expected: APAC-IT-Hardware), Confidence: ${result.confidence}%, Status: ${result.status}`
      };
    }
  },
  {
    id: 'TC-02',
    title: 'Low Confidence Manual Review Trigger',
    description: 'Verifies that vague, ambiguous ticket text fails confidence threshold and routes to Manual Review Queue.',
    input: {
      text: 'Something is wrong and not working right now.',
      region: 'NA',
      channel: 'Email',
      asset: 'Software/ERP',
      userRole: 'End User'
    },
    validate: (result) => {
      const passStatus = result.status === 'MANUAL_REVIEW';
      const passConfidence = result.confidence < store.confidenceThreshold;
      return {
        passed: passStatus && passConfidence,
        details: `Status: ${result.status} (Expected: MANUAL_REVIEW), Confidence: ${result.confidence}% (Threshold: ${store.confidenceThreshold}%)`
      };
    }
  },
  {
    id: 'TC-03',
    title: 'Hard Constraint - EMEA GDPR Sovereignty',
    description: 'Verifies that EMEA Finance System tickets trigger GDPR Hard Constraint and lock to EMEA-Finance-Ops.',
    input: {
      text: 'Need assistance with quarterly salary payout reports in London office payroll system.',
      region: 'EMEA',
      channel: 'Portal',
      asset: 'Finance System',
      userRole: 'Tier 1 Agent'
    },
    validate: (result) => {
      const passConstraint = result.hardConstraintsApplied.some(c => c.includes('EMEA GDPR'));
      const passGroup = result.recommendedGroup === 'EMEA-Finance-Ops';
      return {
        passed: passConstraint && passGroup,
        details: `Hard Constraint Triggered: ${passConstraint ? 'YES' : 'NO'}, Target Group: ${result.recommendedGroup}`
      };
    }
  },
  {
    id: 'TC-04',
    title: 'Hard Constraint - Enterprise Security Mandate',
    description: 'Verifies that Security & IAM asset requests route strictly to Global-SecOps.',
    input: {
      text: 'Suspicious Okta MFA prompt received on personal device, potential unauthorized login attempt.',
      region: 'NA',
      channel: 'Phone',
      asset: 'Identity/IAM',
      userRole: 'Support Lead / Admin'
    },
    validate: (result) => {
      const passConstraint = result.hardConstraintsApplied.some(c => c.includes('Security policy'));
      const passGroup = result.recommendedGroup === 'Global-SecOps';
      return {
        passed: passConstraint && passGroup,
        details: `Hard Constraint Triggered: ${passConstraint ? 'YES' : 'NO'}, Recommended Group: ${result.recommendedGroup}`
      };
    }
  },
  {
    id: 'TC-05',
    title: 'Soft Constraints Optimization Heuristic',
    description: 'Verifies that local region match and real-time phone channel apply +15% and +10% soft constraint boosts.',
    input: {
      text: 'Unable to establish VPN connection tunnel from home network.',
      region: 'NA',
      channel: 'Phone',
      asset: 'Network/VPN',
      userRole: 'Tier 1 Agent'
    },
    validate: (result) => {
      const passSoftCount = result.softConstraintsApplied.length >= 2;
      return {
        passed: passSoftCount,
        details: `Soft Constraints Applied: ${result.softConstraintsApplied.join(' | ')}`
      };
    }
  },
  {
    id: 'TC-06',
    title: 'Hard Constraint - LATAM Tax Compliance',
    description: 'Verifies that LATAM region tickets with Finance System lock to LATAM-Finance-Ops.',
    input: {
      text: 'Requesting access update for LATAM regional invoicing & tax submission module.',
      region: 'LATAM',
      channel: 'Portal',
      asset: 'Finance System',
      userRole: 'End User'
    },
    validate: (result) => {
      const passGroup = result.recommendedGroup === 'LATAM-Finance-Ops';
      return {
        passed: passGroup,
        details: `Recommended Group: ${result.recommendedGroup} (Expected: LATAM-Finance-Ops)`
      };
    }
  },
  {
    id: 'TC-07',
    title: 'Dynamic Confidence Threshold Adjustment',
    description: 'Verifies that setting a higher threshold (e.g. 95%) forces medium-confidence tickets into Manual Review.',
    input: {
      text: 'Intermittent network latency observed in conference room.',
      region: 'APAC',
      channel: 'Portal',
      asset: 'Network/VPN',
      userRole: 'End User'
    },
    validate: (result) => {
      // Evaluate with threshold forced at 95%
      const originalThreshold = store.confidenceThreshold;
      store.setThreshold(95);
      const reEvaluated = evaluateTicket(TEST_CASES[6].input);
      store.setThreshold(originalThreshold); // restore

      const passStatus = reEvaluated.status === 'MANUAL_REVIEW';
      return {
        passed: passStatus,
        details: `With 95% threshold: Status = ${reEvaluated.status}, Confidence = ${reEvaluated.confidence}%`
      };
    }
  },
  {
    id: 'TC-08',
    title: 'Authorized Override & Audit Trail Verification',
    description: 'Verifies that overriding a ticket updates status to OVERRIDDEN and creates a corresponding audit trail entry.',
    input: {
      text: 'Custom ERP software plugin crashing on startup.',
      region: 'NA',
      channel: 'Portal',
      asset: 'Software/ERP',
      userRole: 'End User'
    },
    validate: (result) => {
      // Create temporary ticket, override it, and verify
      const ticket = store.addTicket(result);
      const updated = store.overrideTicket(ticket.id, 'NA-IT-Hardware', 'Test suite manual override verification');
      const auditEntry = store.auditTrail.find(a => a.ticketId === ticket.id && a.action === 'OVERRIDE');

      const passOverride = updated && updated.status === 'OVERRIDDEN';
      const passAudit = !!auditEntry;

      return {
        passed: passOverride && passAudit,
        details: `Override Status: ${updated?.status}, Audit Entry Logged: ${passAudit ? 'YES' : 'NO'}`
      };
    }
  },
  {
    id: 'TC-09',
    title: 'Failure Edge: Zero-Byte / Empty Payload Handling',
    description: 'Verifies that submitting a completely empty text payload is safely intercepted, does not crash, and routes to Manual Review queue.',
    input: {
      text: '',
      region: 'NA',
      channel: 'Portal',
      asset: 'Hardware',
      userRole: 'End User'
    },
    validate: (result) => {
      const passStatus = result.status === 'MANUAL_REVIEW';
      const passGroup = result.finalGroup === 'Manual-Review';
      const passIntent = result.intent === 'UNKNOWN';
      return {
        passed: passStatus && passGroup && passIntent,
        details: `Empty Input Handled: Status=${result.status}, Group=${result.finalGroup}, Intent=${result.intent}`
      };
    }
  },
  {
    id: 'TC-10',
    title: 'Failure Edge: Whitespace-Only Payload Handling',
    description: 'Verifies that input consisting only of spaces, tabs, and newlines is treated as malformed and held in Manual Review.',
    input: {
      text: '   \n\t   \n   ',
      region: 'EMEA',
      channel: 'Email',
      asset: 'Finance System',
      userRole: 'End User'
    },
    validate: (result) => {
      const passStatus = result.status === 'MANUAL_REVIEW';
      const passGroup = result.finalGroup === 'Manual-Review';
      return {
        passed: passStatus && passGroup,
        details: `Whitespace Input: Status=${result.status}, TargetGroup=${result.finalGroup}`
      };
    }
  },
  {
    id: 'TC-11',
    title: 'Skill-Aware Specialist Assignment & Availability Tiebreak',
    description: 'Verifies that for an APAC hardware issue, the router scores candidates and selects Kenji Tanaka based on skill match (95%) and availability (95%).',
    input: {
      text: 'Dell laptop motherboard and BIOS firmware corrupted after reboot in APAC Tokyo office.',
      region: 'APAC',
      channel: 'Portal',
      asset: 'Hardware',
      userRole: 'End User'
    },
    validate: (result) => {
      const passMember = result.bestMember === 'Kenji Tanaka';
      const passSkillScore = result.skillMatchScore >= 90;
      const passSkills = result.matchedSkills && result.matchedSkills.length > 0;
      return {
        passed: passMember && passSkillScore && passSkills,
        details: `Assigned Specialist: ${result.bestMember} (Expected: Kenji Tanaka), Skill Match: ${result.skillMatchScore}%, Matched Skills Count: ${result.matchedSkills?.length}`
      };
    }
  },
  {
    id: 'TC-12',
    title: 'API & Integration Payload Contract Verification',
    description: 'Verifies that the evaluated ticket contract contains all required fields: recommendedGroup, confidence, status, matchedSkills, hardConstraints, and assignedMember.',
    input: {
      text: 'Urgent: Phishing email attack targeting corporate SSO credentials in EMEA headquarters.',
      region: 'EMEA',
      channel: 'Phone',
      asset: 'Identity/IAM',
      userRole: 'Support Lead / Admin'
    },
    validate: (result) => {
      const hasGroup = typeof result.recommendedGroup === 'string';
      const hasConfidence = typeof result.confidence === 'number';
      const hasStatus = typeof result.status === 'string';
      const hasSkills = Array.isArray(result.matchedSkills);
      const hasHardConstraints = Array.isArray(result.hardConstraintsApplied);
      const hasMember = typeof result.bestMember === 'string';

      const allPresent = hasGroup && hasConfidence && hasStatus && hasSkills && hasHardConstraints && hasMember;

      return {
        passed: allPresent,
        details: `Contract Verification: recommendedGroup=${hasGroup}, confidence=${hasConfidence}, status=${hasStatus}, matchedSkills=${hasSkills}, hardConstraints=${hasHardConstraints}, assignedMember=${hasMember}`
      };
    }
  }
];

export function runAllTests() {
  const results = TEST_CASES.map(tc => {
    const ticketResult = evaluateTicket(tc.input);
    const validation = tc.validate(ticketResult);
    return {
      id: tc.id,
      title: tc.title,
      description: tc.description,
      passed: validation.passed,
      details: validation.details,
      ticketResult
    };
  });

  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = total - passedCount;

  return {
    results,
    total,
    passedCount,
    failedCount,
    successRate: Math.round((passedCount / total) * 100)
  };
}
