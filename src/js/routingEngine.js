// Routing Engine: Intent Classifier, Constraint Solver, & Decision Algorithm

import { INTENTS, HARD_CONSTRAINTS, SOFT_CONSTRAINTS, RESOLVER_GROUPS } from './config.js';
import { store } from './store.js';

export function evaluateTicket(ticketData) {
  const { text = '', region = 'NA', channel = 'Portal', asset = 'Hardware', userRole = 'End User' } = ticketData;
  const normalizedText = text.toLowerCase();

  // Step 1: Detect Intent
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

  // Step 2: Determine Default Base Target Resolver Group
  let targetGroupCode = 'Manual-Review';

  if (detectedIntent.defaultGroup) {
    targetGroupCode = detectedIntent.defaultGroup;
  } else if (detectedIntent.defaultGroupRegional) {
    // Construct regional group e.g. APAC-IT-Hardware, EMEA-Net-VPN
    const candidateId = `${region}-${detectedIntent.groupPrefix}`;
    const groupExists = RESOLVER_GROUPS.some(g => g.id === candidateId);
    targetGroupCode = groupExists ? candidateId : (detectedIntent.fallbackGroup || 'Manual-Review');
  }

  let targetGroupObj = RESOLVER_GROUPS.find(g => g.id === targetGroupCode) || RESOLVER_GROUPS.find(g => g.id === 'Manual-Review');

  // Step 3: Evaluate Hard Constraints (Mandatory Rules)
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
  let confidenceScore = 40; // Default base

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
    finalGroup: finalGroup,
    confidence: confidenceScore,
    status: status,
    thresholdUsed: currentThreshold,
    hardConstraintsApplied: hardConstraintResults,
    softConstraintsApplied: softConstraintNotes,
    isOverridden: false,
    overrideReason: null,
    bouncedCount: 0,
    timestamp: new Date().toISOString()
  };
}
