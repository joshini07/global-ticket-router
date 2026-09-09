// Routing Engine: Intent Classifier, Constraint Solver, & True Skill-Aware Routing Algorithm

import { INTENTS, HARD_CONSTRAINTS, SOFT_CONSTRAINTS, RESOLVER_GROUPS, RESOLVER_MEMBER_SKILLS, TICKET_SKILL_REQUIREMENTS, TEAM_SKILL_PROFILES } from './config.js';
import { store } from './store.js';

// ---------------------------------------------------------------------------
// TRUE SKILL-AWARE SCORING ENGINE
// ---------------------------------------------------------------------------

/**
 * Score the skill-match between a ticket intent and all members of a resolver group.
 * Selects candidate based on weighted skill coverage, using real-time availability as a deterministic tiebreaker.
 * Returns {
 *   skillMatchScore: 0–100,
 *   matchedSkills: [],
 *   missingSkills: [],
 *   bestMember: string | null,
 *   bestMemberRole: string | null,
 *   availabilityScore: 0.0–1.0,
 *   tiebreakReason: string,
 *   scoredCandidates: [],
 *   teamProfile: object
 * }
 */
export function scoreSkillMatch(intentKey, groupId) {
  const requirements = TICKET_SKILL_REQUIREMENTS[intentKey] || {};
  const members = RESOLVER_MEMBER_SKILLS[groupId] || [];
  const requiredSkillNames = Object.keys(requirements);
  const teamProfile = TEAM_SKILL_PROFILES[groupId] || {
    primaryFocus: 'General Support',
    coreCompetencies: [],
    coverageHours: 'Standard Business Hours',
    languages: ['English'],
    headcount: members.length
  };

  if (requiredSkillNames.length === 0 || members.length === 0) {
    const fallbackMember = members[0] ? members[0].name : 'Unassigned Specialist';
    return {
      skillMatchScore: 50,
      matchedSkills: [],
      missingSkills: [],
      bestMember: fallbackMember,
      bestMemberRole: 'Support Specialist',
      availabilityScore: members[0] ? members[0].availability : 0.5,
      tiebreakReason: 'Default baseline assignment (no specific skill requirements)',
      scoredCandidates: [],
      teamProfile
    };
  }

  // Score each resolver team member
  const candidateScores = members.map(member => {
    let coverageScore = 0;
    let totalWeight = 0;
    const matched = [];
    const missing = [];

    requiredSkillNames.forEach(skill => {
      const required = requirements[skill];
      const actual = member.skills[skill] || 0;
      totalWeight += required;
      coverageScore += Math.min(actual, required);

      if (actual >= required) {
        matched.push({ skill, required, actual, status: 'MATCHED' });
      } else {
        missing.push({ skill, required, actual, gap: required - actual });
      }
    });

    const skillCoverage = totalWeight > 0 ? (coverageScore / totalWeight) : 0; // 0.0 – 1.0
    // Weighted formula: 80% Skill Match + 20% Availability Tiebreak
    const combinedScore = (skillCoverage * 0.8) + (member.availability * 0.2);

    return {
      name: member.name,
      skillCoveragePct: Math.round(skillCoverage * 100),
      availabilityPct: Math.round(member.availability * 100),
      combinedScore: parseFloat(combinedScore.toFixed(4)),
      matched,
      missing,
      rawSkills: member.skills
    };
  });

  // Sort candidates by combined score descending
  candidateScores.sort((a, b) => b.combinedScore - a.combinedScore);

  const bestCandidate = candidateScores[0];
  const secondCandidate = candidateScores.length > 1 ? candidateScores[1] : null;

  // Generate tiebreaker / selection justification
  let tiebreakReason = `Selected ${bestCandidate.name} with ${bestCandidate.skillCoveragePct}% skill coverage and ${bestCandidate.availabilityPct}% availability.`;
  if (secondCandidate) {
    if (bestCandidate.skillCoveragePct === secondCandidate.skillCoveragePct) {
      tiebreakReason = `Availability Tiebreak: ${bestCandidate.name} (${bestCandidate.availabilityPct}% avail) selected over ${secondCandidate.name} (${secondCandidate.availabilityPct}% avail) on equal skill match (${bestCandidate.skillCoveragePct}%).`;
    } else {
      tiebreakReason = `Skill Rank: ${bestCandidate.name} (Match: ${bestCandidate.skillCoveragePct}%, Avail: ${bestCandidate.availabilityPct}%) surpassed ${secondCandidate.name} (Match: ${secondCandidate.skillCoveragePct}%, Avail: ${secondCandidate.availabilityPct}%).`;
    }
  }

  // Format matched skill tags with star ratings
  const matchedSkillStrings = bestCandidate.matched.map(
    m => `${m.skill} (Level ${m.actual}/5 ★, Req: ${m.required})`
  );

  const missingSkillStrings = bestCandidate.missing.map(
    m => `${m.skill} (Current: ${m.actual}/5, Needed: ${m.required})`
  );

  return {
    skillMatchScore: bestCandidate.skillCoveragePct,
    matchedSkills: matchedSkillStrings,
    missingSkills: missingSkillStrings,
    bestMember: bestCandidate.name,
    bestMemberRole: 'Senior Resolver Specialist',
    availabilityScore: parseFloat((bestCandidate.availabilityPct / 100).toFixed(2)),
    tiebreakReason,
    scoredCandidates: candidateScores,
    teamProfile
  };
}

// ---------------------------------------------------------------------------
// MAIN TICKET ROUTING & EVALUATION PIPELINE
// ---------------------------------------------------------------------------

export function evaluateTicket(ticketData = {}) {
  const {
    text = '',
    region = 'NA',
    channel = 'Portal',
    asset = 'Hardware',
    userRole = 'End User'
  } = ticketData;

  // Edge & Failure Case: Malformed or Zero-Byte / Whitespace-Only Payload Handling
  if (typeof text !== 'string' || text.trim().length === 0) {
    const defaultGroupObj = RESOLVER_GROUPS.find(g => g.id === 'Manual-Review');
    const skillResult = scoreSkillMatch('UNKNOWN', 'Manual-Review');
    return {
      id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      text: text || '',
      region,
      channel,
      asset,
      userRole,
      intent: 'UNKNOWN',
      intentLabel: 'Unclear / Ambiguous Intent (Malformed Payload)',
      recommendedGroup: 'Manual-Review',
      recommendedGroupName: defaultGroupObj.name,
      finalGroup: 'Manual-Review',
      confidence: 20,
      status: 'MANUAL_REVIEW',
      thresholdUsed: store.confidenceThreshold,
      hardConstraintsApplied: [],
      softConstraintsApplied: [],
      matchedSkills: [],
      missingSkills: ['Ticket description is empty or zero-byte payload'],
      skillMatchScore: 0,
      bestMember: 'Triage Lead',
      availabilityScore: 0.5,
      tiebreakReason: 'Zero-byte or whitespace-only description safely diverted to Manual Review triage.',
      routingReason: 'Failure Case Intercept: Empty description payload cannot be safely routed automatically.',
      teamProfile: TEAM_SKILL_PROFILES['Manual-Review'],
      isOverridden: false,
      overrideReason: null,
      bouncedCount: 0,
      timestamp: new Date().toISOString()
    };
  }

  const normalizedText = text.toLowerCase();

  // Step 1: Detect Intent via Keyword Classifier
  let bestIntentKey = 'UNKNOWN';
  let highestKeywordMatches = 0;

  Object.keys(INTENTS).forEach(intentKey => {
    if (intentKey === 'UNKNOWN') return;
    const intentDef = INTENTS[intentKey];
    let matchCount = 0;

    intentDef.keywords.forEach(keyword => {
      if (normalizedText.includes(keyword)) {
        matchCount += 1;
      }
    });

    if (matchCount > highestKeywordMatches) {
      highestKeywordMatches = matchCount;
      bestIntentKey = intentKey;
    }
  });

  // Secondary asset-based fallback if text matches zero keywords
  if (bestIntentKey === 'UNKNOWN') {
    if (asset === 'Identity/IAM') bestIntentKey = 'PASSWORD_RESET';
    else if (asset === 'Hardware') bestIntentKey = 'HARDWARE_FAULT';
    else if (asset === 'Network/VPN') bestIntentKey = 'VPN_CONNECTIVITY';
    else if (asset === 'Finance System') bestIntentKey = 'PAYROLL_FINANCE';
    else if (asset === 'Software/ERP') bestIntentKey = 'SOFTWARE_LICENSE';
  }

  const detectedIntent = INTENTS[bestIntentKey] || INTENTS.UNKNOWN;

  // Step 2: Determine Candidate Resolver Group
  let targetGroupCode = 'Manual-Review';

  if (detectedIntent.defaultGroup) {
    targetGroupCode = detectedIntent.defaultGroup;
  } else if (detectedIntent.defaultGroupRegional) {
    const candidateId = `${region}-${detectedIntent.groupPrefix}`;
    const groupExists = RESOLVER_GROUPS.some(g => g.id === candidateId);
    targetGroupCode = groupExists ? candidateId : (detectedIntent.fallbackGroup || 'Manual-Review');
  }

  let targetGroupObj = RESOLVER_GROUPS.find(g => g.id === targetGroupCode) || RESOLVER_GROUPS.find(g => g.id === 'Manual-Review');

  // Step 3: Evaluate Hard Constraints (Mandatory Sovereignty & Security Rules)
  const hardConstraintResults = [];
  let isHardConstraintTriggered = false;
  let mandatoryGroupCode = null;

  HARD_CONSTRAINTS.forEach(constraint => {
    const result = constraint.evaluate({
      text: normalizedText,
      region,
      channel,
      asset,
      userRole,
      intent: bestIntentKey
    });

    if (result.triggered) {
      isHardConstraintTriggered = true;
      mandatoryGroupCode = result.mandatoryGroup;
      hardConstraintResults.push(result.reason);
    }
  });

  if (isHardConstraintTriggered && mandatoryGroupCode) {
    targetGroupCode = mandatoryGroupCode;
    targetGroupObj = RESOLVER_GROUPS.find(g => g.id === targetGroupCode) || targetGroupObj;
  }

  // Step 4: Calculate Base Confidence Score
  let confidenceScore = 40;

  if (highestKeywordMatches >= 3) confidenceScore = 80;
  else if (highestKeywordMatches === 2) confidenceScore = 70;
  else if (highestKeywordMatches === 1) confidenceScore = 55;
  else confidenceScore = 35; // Ambiguous text

  // Asset correlation bonus (+15% if intent matches explicit asset category)
  if (
    (asset === 'Hardware' && bestIntentKey === 'HARDWARE_FAULT') ||
    (asset === 'Identity/IAM' && (bestIntentKey === 'PASSWORD_RESET' || bestIntentKey === 'SECURITY_INCIDENT')) ||
    (asset === 'Network/VPN' && bestIntentKey === 'VPN_CONNECTIVITY') ||
    (asset === 'Finance System' && bestIntentKey === 'PAYROLL_FINANCE') ||
    (asset === 'Software/ERP' && bestIntentKey === 'SOFTWARE_LICENSE')
  ) {
    confidenceScore += 15;
  }

  // Step 5: Evaluate Soft Constraints (Heuristic Boosts)
  const softConstraintNotes = [];

  SOFT_CONSTRAINTS.forEach(soft => {
    const res = soft.apply({ region, channel, asset, userRole }, targetGroupObj, confidenceScore);
    if (res.scoreDelta > 0) {
      confidenceScore += res.scoreDelta;
      if (res.note) softConstraintNotes.push(res.note);
    }
  });

  // Hard constraint compliance boost
  if (isHardConstraintTriggered) {
    confidenceScore = Math.max(confidenceScore, 90);
  }

  // Clamp confidence score between 15% and 98%
  confidenceScore = Math.min(98, Math.max(15, confidenceScore));

  // Step 6: Decision Routing & Threshold Check
  const currentThreshold = store.confidenceThreshold;
  let status = 'AUTO_ROUTED';
  let finalGroup = targetGroupCode;

  if (confidenceScore < currentThreshold || bestIntentKey === 'UNKNOWN') {
    status = 'MANUAL_REVIEW';
    finalGroup = 'Manual-Review';
  }

  // Step 7: True Skill-Aware Scoring & Agent Assignment
  const skillGroupId = status === 'MANUAL_REVIEW' ? targetGroupCode : finalGroup;
  const skillResult = scoreSkillMatch(bestIntentKey, skillGroupId);

  const routingReason = status === 'AUTO_ROUTED'
    ? `Auto-routed with ${confidenceScore}% confidence (Threshold: ${currentThreshold}%) to ${targetGroupObj.name}. Specialist ${skillResult.bestMember} assigned with ${skillResult.skillMatchScore}% skill match.`
    : `Held in Manual Review: Confidence score (${confidenceScore}%) is below threshold (${currentThreshold}%) or intent is unclassified.`;

  return {
    id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
    text,
    region,
    channel,
    asset,
    userRole,
    intent: bestIntentKey,
    intentLabel: detectedIntent.label,
    recommendedGroup: targetGroupCode,
    recommendedGroupName: targetGroupObj.name,
    finalGroup,
    confidence: confidenceScore,
    status,
    thresholdUsed: currentThreshold,
    hardConstraintsApplied: hardConstraintResults,
    softConstraintsApplied: softConstraintNotes,
    matchedSkills: skillResult.matchedSkills,
    missingSkills: skillResult.missingSkills,
    skillMatchScore: skillResult.skillMatchScore,
    bestMember: skillResult.bestMember,
    bestMemberRole: skillResult.bestMemberRole,
    availabilityScore: skillResult.availabilityScore,
    tiebreakReason: skillResult.tiebreakReason,
    scoredCandidates: skillResult.scoredCandidates,
    teamProfile: skillResult.teamProfile,
    routingReason,
    isOverridden: false,
    overrideReason: null,
    bouncedCount: 0,
    timestamp: new Date().toISOString()
  };
}
