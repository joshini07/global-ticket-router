// Application UI Controller & Event Handlers with True Skill-Aware Surfacing,
// REST API Explorer, Interactive Guided Demo, and 12-Scenario Test Suite.

import { store } from './store.js';
import { evaluateTicket, scoreSkillMatch } from './routingEngine.js';
import { HARD_CONSTRAINTS, SOFT_CONSTRAINTS, RESOLVER_GROUPS, RESOLVER_MEMBER_SKILLS, TEAM_SKILL_PROFILES, TICKET_SKILL_REQUIREMENTS } from './config.js';
import { runAllTests } from './testSuite.js';

// API Mode state
let apiModeEnabled = false;

// Sample Presets for Quick Testing
const PRESETS = [
  {
    text: 'My Macbook Pro screen keeps flickering continuously after the latest macOS update in Tokyo office.',
    region: 'APAC',
    channel: 'Portal',
    asset: 'Hardware',
    userRole: 'End User'
  },
  {
    text: 'Need access to London regional salary tax reports and EMEA payroll portal for quarterly compliance.',
    region: 'EMEA',
    channel: 'Email',
    asset: 'Finance System',
    userRole: 'Tier 1 Agent'
  },
  {
    text: 'Received suspicious phishing email asking for Okta credentials and MFA tokens immediately.',
    region: 'NA',
    channel: 'Phone',
    asset: 'Identity/IAM',
    userRole: 'Support Lead / Admin'
  },
  {
    text: 'System is giving error code 0x80070005 when opening internal app.',
    region: 'NA',
    channel: 'Portal',
    asset: 'Software/ERP',
    userRole: 'End User'
  },
  {
    text: 'Unable to connect to Cisco VPN tunnel from home Wi-Fi network in Berlin.',
    region: 'EMEA',
    channel: 'Slack/Chat',
    asset: 'Network/VPN',
    userRole: 'End User'
  }
];

let presetIndex = 0;

// Guided Demo Steps Definition
const DEMO_STEPS = [
  {
    title: 'Step 1: Skill-Aware Auto-Routing (APAC Hardware)',
    content: `
      <div class="demo-step-box">
        <h4>1. True Skill-Aware Matching & Availability Tiebreak</h4>
        <p>A user in Tokyo submits a hardware fault ticket. The router identifies <code>HARDWARE_FAULT</code>, evaluates candidate group <code>APAC-IT-Hardware</code>, and compares member proficiencies. <strong>Kenji Tanaka</strong> (Hardware Repair: 5/5, 95% availability) is scored against <strong>Priya Sharma</strong> (Hardware Repair: 4/5, 80% availability). Kenji is selected with 95% skill coverage.</p>
        <div class="demo-preview-card">
          <strong>Payload:</strong> "Macbook screen flickering in Tokyo office" (APAC, Hardware)<br>
          <strong>Expected:</strong> AUTO_ROUTED &rarr; APAC-IT-Hardware &rarr; Assigned: Kenji Tanaka
        </div>
      </div>
    `,
    action: () => {
      switchTab('tabSubmit');
      document.getElementById('ticketText').value = PRESETS[0].text;
      document.getElementById('ticketRegion').value = PRESETS[0].region;
      document.getElementById('ticketChannel').value = PRESETS[0].channel;
      document.getElementById('ticketAsset').value = PRESETS[0].asset;
      document.getElementById('ticketRole').value = PRESETS[0].userRole;
      document.getElementById('ticketForm').dispatchEvent(new Event('submit'));
    }
  },
  {
    title: 'Step 2: Hard Constraint Sovereignty Lock (EMEA GDPR)',
    content: `
      <div class="demo-step-box">
        <h4>2. Mandatory EU GDPR Data Sovereignty Enforced</h4>
        <p>An employee requests payroll reports in Europe. The hard constraint <code>RULE_EMEA_FINANCE_PRIVACY</code> intercepts the ticket, overrides standard routing, and locks it strictly to <code>EMEA-Finance-Ops</code>. Specialist <strong>Claire Dupont</strong> (GDPR Handling: 5/5, Workday HR: 5/5) is assigned.</p>
        <div class="demo-preview-card">
          <strong>Payload:</strong> "Access to London regional salary tax reports" (EMEA, Finance System)<br>
          <strong>Expected:</strong> Locked to EMEA-Finance-Ops &rarr; Assigned: Claire Dupont (100% match)
        </div>
      </div>
    `,
    action: () => {
      switchTab('tabSubmit');
      document.getElementById('ticketText').value = PRESETS[1].text;
      document.getElementById('ticketRegion').value = PRESETS[1].region;
      document.getElementById('ticketChannel').value = PRESETS[1].channel;
      document.getElementById('ticketAsset').value = PRESETS[1].asset;
      document.getElementById('ticketRole').value = PRESETS[1].userRole;
      document.getElementById('ticketForm').dispatchEvent(new Event('submit'));
    }
  },
  {
    title: 'Step 3: Low Confidence Intercept & Manual Review Triage',
    content: `
      <div class="demo-step-box">
        <h4>3. Ambiguous Text Diverted to Manual Review Queue</h4>
        <p>A ticket description contains only vague text ("error code 0x80070005"). Because confidence falls to 45% (below the 70% threshold), the system holds the ticket in the Manual Review queue to prevent misrouting.</p>
        <div class="demo-preview-card">
          <strong>Payload:</strong> "System is giving error code 0x80070005" (NA, Software/ERP)<br>
          <strong>Expected:</strong> MANUAL_REVIEW &rarr; Held in Triage Queue
        </div>
      </div>
    `,
    action: () => {
      switchTab('tabSubmit');
      document.getElementById('ticketText').value = PRESETS[3].text;
      document.getElementById('ticketRegion').value = PRESETS[3].region;
      document.getElementById('ticketChannel').value = PRESETS[3].channel;
      document.getElementById('ticketAsset').value = PRESETS[3].asset;
      document.getElementById('ticketRole').value = PRESETS[3].userRole;
      document.getElementById('ticketForm').dispatchEvent(new Event('submit'));
      setTimeout(() => switchTab('tabManual'), 600);
    }
  },
  {
    title: 'Step 4: Resolver Teams & Skills Competency Matrix',
    content: `
      <div class="demo-step-box">
        <h4>4. Inspecting Team Roster & Skill Coverage</h4>
        <p>Explore the full roster matrix covering all 11 global resolver groups, agent profiles, skill proficiencies (1-5 ★), team leads, operating hours, and live availability scores.</p>
        <div class="demo-preview-card">
          <strong>Coverage:</strong> 11 Resolver Groups &bull; 20+ Specialists &bull; 6 Core Intent Domains
        </div>
      </div>
    `,
    action: () => {
      switchTab('tabRoster');
    }
  },
  {
    title: 'Step 5: Full Automated Test Suite (12 Scenarios)',
    content: `
      <div class="demo-step-box">
        <h4>5. Comprehensive 12-Scenario Test Suite Execution</h4>
        <p>Executes all 12 test cases including regional auto-route, GDPR & tax compliance locks, threshold adjustments, authorized override & audit logging, zero-byte/malformed payloads, and true skill-aware tiebreaking.</p>
        <div class="demo-preview-card">
          <strong>Target:</strong> 12 / 12 Test Cases Passed (100% Success Rate)
        </div>
      </div>
    `,
    action: () => {
      switchTab('tabTests');
      document.getElementById('btnRunTests').click();
    }
  }
];

let currentDemoStep = 0;

document.addEventListener('DOMContentLoaded', () => {
  initUI();
});

function initUI() {
  bindTabs();
  bindThresholdSlider();
  bindApiToggle();
  bindForm();
  bindOverrideModal();
  bindTestSuite();
  bindResetButton();
  bindRoster();
  bindApiExplorer();
  bindGuidedDemo();
  renderRules();
  refreshAllData();
}

// 1. Navigation Tabs Handling
function bindTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      switchTab(targetId);
    });
  });
}

function switchTab(tabId) {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(b => {
    if (b.getAttribute('data-tab') === tabId) b.classList.add('active');
    else b.classList.remove('active');
  });

  document.querySelectorAll('.tab-pane').forEach(p => {
    if (p.id === tabId) p.classList.add('active');
    else p.classList.remove('active');
  });

  if (tabId === 'tabRoster') renderRoster();
}

// 2. Threshold Controller Handling
function bindThresholdSlider() {
  const slider = document.getElementById('thresholdSlider');
  const display = document.getElementById('thresholdDisplay');
  const manualLabel = document.getElementById('manualThresholdLabel');

  slider.value = store.confidenceThreshold;
  display.textContent = `${store.confidenceThreshold}%`;
  if (manualLabel) manualLabel.textContent = store.confidenceThreshold;

  slider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    store.setThreshold(val);
    display.textContent = `${val}%`;
    if (manualLabel) manualLabel.textContent = val;
    refreshAllData();
  });
}

// 3. API Mode Toggle
function bindApiToggle() {
  const toggle = document.getElementById('apiModeToggle');
  const label = document.getElementById('apiModeLabel');
  if (!toggle) return;
  toggle.checked = false;
  toggle.addEventListener('change', () => {
    apiModeEnabled = toggle.checked;
    if (label) label.textContent = apiModeEnabled ? 'API Mode: ON (Flask/Python)' : 'API Mode: OFF';
  });
}

// 4. Form Handling & Preset Fill
function bindForm() {
  const form = document.getElementById('ticketForm');
  const btnPreset = document.getElementById('btnFillPreset');

  btnPreset.addEventListener('click', () => {
    const preset = PRESETS[presetIndex % PRESETS.length];
    presetIndex++;
    document.getElementById('ticketText').value = preset.text;
    document.getElementById('ticketRegion').value = preset.region;
    document.getElementById('ticketChannel').value = preset.channel;
    document.getElementById('ticketAsset').value = preset.asset;
    document.getElementById('ticketRole').value = preset.userRole;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('ticketText').value;
    const region = document.getElementById('ticketRegion').value;
    const channel = document.getElementById('ticketChannel').value;
    const asset = document.getElementById('ticketAsset').value;
    const userRole = document.getElementById('ticketRole').value;

    let evaluatedTicket;

    if (apiModeEnabled) {
      try {
        const container = document.getElementById('liveResultContainer');
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><p>Calling Python REST API at <code>http://localhost:5000/api/route</code>...</p></div>`;
        const response = await fetch('http://localhost:5000/api/route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, region, channel, asset, userRole, threshold: store.confidenceThreshold })
        });
        if (!response.ok) throw new Error(`API returned HTTP ${response.status}`);
        evaluatedTicket = await response.json();
        evaluatedTicket.thresholdUsed = store.confidenceThreshold;
        evaluatedTicket.hardConstraintsApplied = evaluatedTicket.hardConstraints || [];
        evaluatedTicket.softConstraintsApplied = evaluatedTicket.softConstraints || [];
      } catch (err) {
        // Fallback to in-browser with alert
        evaluatedTicket = evaluateTicket({ text, region, channel, asset, userRole });
        console.warn('API connection failed, fell back to in-browser engine:', err);
      }
    } else {
      evaluatedTicket = evaluateTicket({ text, region, channel, asset, userRole });
    }

    store.addTicket(evaluatedTicket);
    renderLiveResultCard(evaluatedTicket);
    refreshAllData();
  });
}

// 5. Render Live Evaluation Result Preview Card with True Skill-Awareness
function renderLiveResultCard(ticket) {
  const container = document.getElementById('liveResultContainer');
  const statusBadge = document.getElementById('liveStatusBadge');

  let statusClass = 'badge-auto';
  let statusText = 'AUTO-ROUTED';
  let cardBorderClass = 'status-auto';

  if (ticket.status === 'MANUAL_REVIEW') {
    statusClass = 'badge-review';
    statusText = 'MANUAL REVIEW';
    cardBorderClass = 'status-review';
  } else if (ticket.status === 'OVERRIDDEN') {
    statusClass = 'badge-override';
    statusText = 'OVERRIDDEN';
    cardBorderClass = 'status-override';
  }

  statusBadge.className = `badge ${statusClass}`;
  statusBadge.textContent = statusText;

  const confidenceClass = ticket.confidence >= 75 ? 'high' : (ticket.confidence >= 55 ? 'med' : 'low');
  const hardTagsHtml = (ticket.hardConstraintsApplied || []).map(h => `<span class="tag-item hard-constraint">🛡️ ${h}</span>`).join('');
  const softTagsHtml = (ticket.softConstraintsApplied || []).map(s => `<span class="tag-item soft-constraint">💡 ${s}</span>`).join('');

  // Skill-Aware Rendering
  const specialistName = ticket.assignedMember || ticket.bestMember || 'Triage Specialist';
  const specialistRole = ticket.bestMemberRole || 'Resolver Specialist';
  const availPct = Math.round((ticket.availabilityScore || 0.8) * 100);
  const skillScore = ticket.skillMatchScore || 85;

  const matchedPills = (ticket.matchedSkills || []).map(
    s => `<span class="skill-pill">★ ${s}</span>`
  ).join('');

  const missingPills = (ticket.missingSkills || []).map(
    m => `<span class="skill-pill missing">⚠️ ${m}</span>`
  ).join('');

  const teamProfile = ticket.teamProfile || {};
  const teamLead = teamProfile.teamLead ? `<span>Team Lead: <strong>${teamProfile.teamLead}</strong></span>` : '';
  const operatingHours = teamProfile.coverageHours ? `<span>Hours: <strong>${teamProfile.coverageHours}</strong></span>` : '';

  container.innerHTML = `
    <div class="recommendation-card ${cardBorderClass}">
      <div class="rec-header">
        <div>
          <span style="font-size: 12px; color: var(--text-secondary);">RECOMMENDED RESOLVER GROUP:</span>
          <div class="rec-group-title">${ticket.recommendedGroupName || ticket.recommendedGroup} (${ticket.recommendedGroup})</div>
        </div>
        <span class="badge ${statusClass}">${statusText}</span>
      </div>

      <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
        <strong>Intent Identified:</strong> ${ticket.intentLabel}
      </div>

      <div class="confidence-container">
        <div class="confidence-header">
          <span>Routing Confidence Score</span>
          <span style="color: var(--accent-cyan); font-weight: 700;">${ticket.confidence}%</span>
        </div>
        <div class="confidence-track">
          <div class="confidence-fill ${confidenceClass}" style="width: ${ticket.confidence}%;"></div>
          <div class="threshold-marker" style="left: ${ticket.thresholdUsed}%;" title="Threshold: ${ticket.thresholdUsed}%"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 4px;">
          <span>0%</span>
          <span>Threshold: ${ticket.thresholdUsed}%</span>
          <span>100%</span>
        </div>
      </div>

      <!-- Skill-Aware Specialist Assignment Box -->
      <div class="specialist-box">
        <div class="specialist-header">
          <div class="specialist-profile">
            <div class="specialist-avatar">👤</div>
            <div>
              <div class="specialist-name">${specialistName}</div>
              <div class="specialist-role">${specialistRole}</div>
            </div>
          </div>
          <span class="availability-tag">● ${availPct}% Available</span>
        </div>

        <div class="skill-match-metric">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span>Specialist Skill Match</span>
            <span style="color: var(--accent-emerald); font-weight: 700;">${skillScore}%</span>
          </div>
          <div class="confidence-track" style="height: 6px;">
            <div class="confidence-fill high" style="width: ${skillScore}%; background: var(--accent-emerald);"></div>
          </div>
        </div>

        <div>
          <div style="font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-top: 8px;">Matched Competencies:</div>
          <div class="skill-pills-list">
            ${matchedPills || '<span style="font-size: 11px; color: var(--text-muted);">No specific skills required</span>'}
            ${missingPills}
          </div>
        </div>

        ${ticket.tiebreakReason ? `<div class="tiebreak-note">💡 ${ticket.tiebreakReason}</div>` : ''}

        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
          ${teamLead}
          ${operatingHours}
        </div>
      </div>

      <div style="margin-top: 14px;">
        <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Evaluated Constraints:</div>
        <div class="tag-list">
          ${hardTagsHtml}
          ${softTagsHtml}
          ${(!hardTagsHtml && !softTagsHtml) ? '<span class="tag-item">No special constraints triggered</span>' : ''}
        </div>
      </div>

      <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-card); font-size: 12px; color: var(--text-muted); display: flex; justify-content: space-between;">
        <span>Ticket ID: <strong>${ticket.id}</strong></span>
        <span>Target: <strong>${ticket.finalGroup}</strong></span>
      </div>
    </div>
  `;
}

// 6. Data Refresh Controller
function refreshAllData() {
  updateMetricsBanner();
  renderManualReviewQueue();
  renderAuditTrail();
  renderAnalytics();
}

function updateMetricsBanner() {
  const metrics = store.getMetrics();
  document.getElementById('statTotalTickets').textContent = metrics.totalTickets;
  document.getElementById('statAutoRouted').textContent = metrics.autoRouted;
  document.getElementById('statManualReview').textContent = metrics.manualReview;
  document.getElementById('statAccuracy').textContent = `${metrics.accuracyRate}%`;
  document.getElementById('statBounceReduction').textContent = `${metrics.bounceReductionRate}%`;

  const badgeCount = document.getElementById('badgeManualCount');
  if (badgeCount) badgeCount.textContent = metrics.manualReview;
}

// 7. Manual Review Queue Table Renderer
function renderManualReviewQueue() {
  const tbody = document.getElementById('manualReviewTableBody');
  const reviewTickets = store.tickets.filter(t => t.status === 'MANUAL_REVIEW');

  if (reviewTickets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          <div class="empty-icon">✅</div>
          <p>No low-confidence tickets in Manual Review Queue!</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = reviewTickets.map(t => {
    const specialist = t.assignedMember || t.bestMember || 'Triage Specialist';
    const skillScore = t.skillMatchScore ? `${t.skillMatchScore}%` : '—';
    return `
      <tr>
        <td><strong>${t.id}</strong></td>
        <td style="max-width: 240px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${t.text}">${t.text}</td>
        <td><span class="tag-item">${t.region}</span> <span class="tag-item">${t.asset}</span></td>
        <td>${t.intentLabel}</td>
        <td><strong>${specialist}</strong> <span style="font-size: 11px; color: var(--accent-cyan);">(${skillScore})</span></td>
        <td><strong style="color: var(--accent-amber);">${t.confidence}%</strong></td>
        <td><span class="badge badge-review">MANUAL REVIEW</span></td>
        <td>
          <button class="btn btn-secondary btn-sm btn-override-trigger" data-id="${t.id}">✏️ Override / Assign</button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.btn-override-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const ticketId = btn.getAttribute('data-id');
      openOverrideModal(ticketId);
    });
  });
}

// 8. Audit Trail Renderer
function renderAuditTrail() {
  const tbody = document.getElementById('auditTableBody');
  const audit = store.auditTrail;

  if (audit.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No audit logs recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = audit.map(a => {
    let actionBadge = `<span class="badge badge-auto">AUTO ROUTE</span>`;
    if (a.action === 'OVERRIDE') actionBadge = `<span class="badge badge-override">OVERRIDE</span>`;
    else if (a.action === 'SENT_TO_MANUAL_REVIEW') actionBadge = `<span class="badge badge-review">REVIEW</span>`;

    const timeStr = new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return `
      <tr>
        <td style="font-size: 12px; color: var(--text-muted);">${timeStr}</td>
        <td><strong>${a.ticketId}</strong></td>
        <td>${actionBadge}</td>
        <td>${a.actor}</td>
        <td style="color: var(--text-secondary);">${a.previousGroup || '—'}</td>
        <td><strong style="color: var(--accent-cyan);">${a.newGroup}</strong></td>
        <td style="font-size: 12px; max-width: 280px;">${a.reason}</td>
      </tr>
    `;
  }).join('');
}

// 9. Analytics Breakdown Renderer
function renderAnalytics() {
  const statusContainer = document.getElementById('statusBreakdownContainer');
  const regionContainer = document.getElementById('regionBreakdownContainer');
  const intentContainer = document.getElementById('intentBreakdownContainer');

  const total = store.tickets.length || 1;
  const metrics = store.getMetrics();

  statusContainer.innerHTML = `
    <div style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
        <span>Auto-Routed (${metrics.autoRouted})</span>
        <span>${Math.round((metrics.autoRouted / total) * 100)}%</span>
      </div>
      <div class="confidence-track"><div class="confidence-fill high" style="width: ${(metrics.autoRouted / total) * 100}%;"></div></div>
    </div>
    <div style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
        <span>Manual Review (${metrics.manualReview})</span>
        <span>${Math.round((metrics.manualReview / total) * 100)}%</span>
      </div>
      <div class="confidence-track"><div class="confidence-fill med" style="width: ${(metrics.manualReview / total) * 100}%;"></div></div>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
        <span>Overridden (${metrics.overridden})</span>
        <span>${Math.round((metrics.overridden / total) * 100)}%</span>
      </div>
      <div class="confidence-track"><div class="confidence-fill low" style="width: ${(metrics.overridden / total) * 100}%;"></div></div>
    </div>
  `;

  const regionCounts = { NA: 0, EMEA: 0, APAC: 0, LATAM: 0 };
  store.tickets.forEach(t => {
    if (regionCounts[t.region] !== undefined) regionCounts[t.region]++;
  });

  regionContainer.innerHTML = Object.keys(regionCounts).map(r => `
    <div style="margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
        <span>${r} Region</span>
        <span>${regionCounts[r]} tickets</span>
      </div>
      <div class="confidence-track"><div class="confidence-fill high" style="width: ${(regionCounts[r] / total) * 100}%;"></div></div>
    </div>
  `).join('');

  const intentCounts = {};
  store.tickets.forEach(t => {
    intentCounts[t.intentLabel] = (intentCounts[t.intentLabel] || 0) + 1;
  });

  intentContainer.innerHTML = Object.keys(intentCounts).map(label => `
    <div style="margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
        <span>${label}</span>
        <span>${intentCounts[label]} tickets</span>
      </div>
      <div class="confidence-track"><div class="confidence-fill med" style="width: ${(intentCounts[label] / total) * 100}%;"></div></div>
    </div>
  `).join('');
}

// 10. Resolver Teams & Skills Roster Renderer
function bindRoster() {
  const filter = document.getElementById('rosterRegionFilter');
  if (filter) {
    filter.addEventListener('change', () => renderRoster());
  }
}

function renderRoster() {
  const container = document.getElementById('rosterContainer');
  if (!container) return;

  const filterVal = document.getElementById('rosterRegionFilter')?.value || 'ALL';
  const groupsToDisplay = RESOLVER_GROUPS.filter(g => {
    if (g.id === 'Manual-Review') return false;
    if (filterVal === 'ALL') return true;
    return g.region === filterVal;
  });

  container.innerHTML = groupsToDisplay.map(group => {
    const profile = TEAM_SKILL_PROFILES[group.id] || {};
    const members = RESOLVER_MEMBER_SKILLS[group.id] || [];

    const membersHtml = members.map(m => {
      const skillsHtml = Object.entries(m.skills).map(([skillName, level]) => `
        <span class="skill-pill">★ ${skillName}: ${level}/5</span>
      `).join('');

      return `
        <div class="roster-member-item">
          <div class="roster-member-header">
            <span class="roster-member-name">👤 ${m.name}</span>
            <span class="availability-tag">● ${Math.round(m.availability * 100)}% Avail</span>
          </div>
          <div class="skill-pills-list">
            ${skillsHtml}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="roster-card">
        <div class="roster-card-header">
          <div>
            <div class="roster-group-title">${group.name}</div>
            <div class="roster-group-domain">${group.domain} &bull; ${group.region}</div>
          </div>
          <span class="badge badge-auto">${group.id}</span>
        </div>

        <div class="roster-meta-grid">
          <div class="roster-meta-item">Team Lead: <strong>${profile.teamLead || 'Lead'}</strong></div>
          <div class="roster-meta-item">Coverage: <strong>${profile.coverageHours || '24/7'}</strong></div>
          <div class="roster-meta-item">Languages: <strong>${(profile.languages || []).join(', ')}</strong></div>
          <div class="roster-meta-item">Avg Res Time: <strong>${profile.avgResolutionTimeHours || 1.5}h</strong></div>
        </div>

        <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Active Specialists (${members.length}):</div>
        ${membersHtml}
      </div>
    `;
  }).join('');
}

// 11. REST API Explorer Controls
function bindApiExplorer() {
  const btnSend = document.getElementById('btnSendApiRequest');
  const btnPing = document.getElementById('btnCheckApiHealth');
  const endpointSelect = document.getElementById('apiEndpointSelect');
  const payloadGroup = document.getElementById('apiPayloadGroup');
  const payloadInput = document.getElementById('apiPayloadInput');
  const responseViewer = document.getElementById('apiResponseViewer');
  const latencyDisplay = document.getElementById('apiLatencyVal');
  const httpCodeDisplay = document.getElementById('apiHttpCodeVal');
  const statusBadge = document.getElementById('apiResponseStatus');
  const healthBadge = document.getElementById('apiHealthBadge');
  const curlSnippet = document.getElementById('curlSnippet');

  if (!btnSend) return;

  // Change payload template when endpoint changes
  endpointSelect.addEventListener('change', () => {
    const ep = endpointSelect.value;
    if (ep.startsWith('GET')) {
      payloadGroup.style.display = 'none';
      if (ep.includes('/api/health')) {
        curlSnippet.textContent = `curl http://localhost:5000/api/health`;
      } else {
        curlSnippet.textContent = `curl http://localhost:5000/api/roster`;
      }
    } else {
      payloadGroup.style.display = 'block';
      curlSnippet.textContent = `curl -X POST http://localhost:5000/api/route \\\n  -H "Content-Type: application/json" \\\n  -d '{"text":"Macbook screen flicker","region":"APAC","asset":"Hardware"}'`;
    }
  });

  const checkHealth = async () => {
    try {
      healthBadge.className = 'api-status-badge online';
      healthBadge.textContent = '● Checking...';
      const res = await fetch('http://localhost:5000/api/health', { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        healthBadge.className = 'api-status-badge online';
        healthBadge.textContent = '● Server Online (Port 5000)';
        return true;
      }
    } catch (e) {
      healthBadge.className = 'api-status-badge offline';
      healthBadge.textContent = '○ Server Offline (Using In-Browser Engine)';
      return false;
    }
  };

  btnPing.addEventListener('click', checkHealth);
  checkHealth();

  btnSend.addEventListener('click', async () => {
    const ep = endpointSelect.value;
    const [method, path] = ep.split(' ');
    const startTime = performance.now();

    statusBadge.className = 'badge badge-review';
    statusBadge.textContent = 'SENDING';
    responseViewer.textContent = '// Sending request to ' + path + '...';

    try {
      let options = { method, headers: { 'Content-Type': 'application/json' } };
      if (method === 'POST') {
        options.body = payloadInput.value;
      }

      const res = await fetch(`http://localhost:5000${path}`, options);
      const latency = Math.round(performance.now() - startTime);
      const json = await res.json();

      latencyDisplay.textContent = `${latency} ms`;
      httpCodeDisplay.textContent = `${res.status} ${res.statusText}`;
      statusBadge.className = res.ok ? 'badge badge-auto' : 'badge badge-override';
      statusBadge.textContent = `${res.status} OK`;
      responseViewer.textContent = JSON.stringify(json, null, 2);
    } catch (err) {
      // Mock fallback
      const latency = Math.round(performance.now() - startTime);
      latencyDisplay.textContent = `${latency} ms (Mock)`;
      httpCodeDisplay.textContent = '200 OK (In-Browser Stub)';
      statusBadge.className = 'badge badge-auto';
      statusBadge.textContent = '200 OK (STUB)';

      let mockOutput;
      if (path === '/api/health') {
        mockOutput = {
          status: 'healthy',
          service: 'Global Ticket Router API (In-Browser Stub)',
          version: '2.0.0',
          endpoints: ['POST /api/route', 'GET /api/health', 'GET /api/roster']
        };
      } else if (path === '/api/roster') {
        mockOutput = {
          resolverGroups: RESOLVER_GROUPS,
          resolverMemberSkills: RESOLVER_MEMBER_SKILLS,
          teamProfiles: TEAM_SKILL_PROFILES
        };
      } else {
        try {
          const parsed = JSON.parse(payloadInput.value);
          mockOutput = evaluateTicket(parsed);
        } catch (e) {
          mockOutput = { error: 'Invalid JSON payload in request' };
        }
      }
      responseViewer.textContent = JSON.stringify(mockOutput, null, 2);
    }
  });
}

// 12. Guided Demo Tour Simulation
function bindGuidedDemo() {
  const btnLaunch = document.getElementById('btnGuidedDemo');
  const modal = document.getElementById('demoModal');
  const btnClose = document.getElementById('btnCloseDemoModal');
  const btnPrev = document.getElementById('btnPrevDemoStep');
  const btnNext = document.getElementById('btnNextDemoStep');
  const title = document.getElementById('demoStepTitle');
  const content = document.getElementById('demoStepContent');
  const counter = document.getElementById('demoStepCounter');

  if (!btnLaunch || !modal) return;

  const updateStepView = () => {
    const step = DEMO_STEPS[currentDemoStep];
    title.textContent = `🎬 ${step.title}`;
    content.innerHTML = step.content;
    counter.textContent = `Step ${currentDemoStep + 1} of ${DEMO_STEPS.length}`;
    btnPrev.disabled = currentDemoStep === 0;
    btnNext.textContent = currentDemoStep === DEMO_STEPS.length - 1 ? 'Finish & Execute' : 'Next Step ➜';
  };

  btnLaunch.addEventListener('click', () => {
    currentDemoStep = 0;
    updateStepView();
    modal.classList.add('active');
  });

  btnClose.addEventListener('click', () => modal.classList.remove('active'));

  btnPrev.addEventListener('click', () => {
    if (currentDemoStep > 0) {
      currentDemoStep--;
      updateStepView();
    }
  });

  btnNext.addEventListener('click', () => {
    const step = DEMO_STEPS[currentDemoStep];
    if (step.action) step.action();

    if (currentDemoStep < DEMO_STEPS.length - 1) {
      currentDemoStep++;
      updateStepView();
    } else {
      modal.classList.remove('active');
    }
  });
}

// 13. Rules Pane Renderer
function renderRules() {
  const hardList = document.getElementById('hardRulesList');
  const softList = document.getElementById('softRulesList');

  hardList.innerHTML = HARD_CONSTRAINTS.map(r => `
    <div style="background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.25); padding: 14px; border-radius: var(--radius-sm); margin-bottom: 10px;">
      <strong style="color: #fecdd3; font-size: 14px;">🛡️ ${r.name}</strong>
      <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">${r.description}</p>
    </div>
  `).join('');

  softList.innerHTML = SOFT_CONSTRAINTS.map(s => `
    <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.25); padding: 14px; border-radius: var(--radius-sm); margin-bottom: 10px;">
      <strong style="color: #cff4fc; font-size: 14px;">💡 ${s.name}</strong>
      <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">${s.description}</p>
    </div>
  `).join('');
}

// 14. Override Modal Controls
function bindOverrideModal() {
  const modal = document.getElementById('overrideModal');
  const btnClose = document.getElementById('btnCloseModal');
  const btnCancel = document.getElementById('btnCancelOverride');
  const form = document.getElementById('overrideForm');
  const selectGroup = document.getElementById('overrideTargetGroup');

  selectGroup.innerHTML = RESOLVER_GROUPS
    .filter(g => g.id !== 'Manual-Review')
    .map(g => `<option value="${g.id}">${g.name} (${g.id})</option>`).join('');

  const closeModal = () => modal.classList.remove('active');

  btnClose.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ticketId = document.getElementById('overrideTicketId').value;
    const newGroup = selectGroup.value;
    const reason = document.getElementById('overrideReason').value.trim();

    if (!ticketId || !reason) return;

    store.overrideTicket(ticketId, newGroup, reason);
    closeModal();
    refreshAllData();
  });
}

function openOverrideModal(ticketId) {
  const ticket = store.tickets.find(t => t.id === ticketId);
  if (!ticket) return;

  document.getElementById('overrideTicketId').value = ticket.id;
  document.getElementById('overrideTicketInfo').innerHTML = `
    <strong>Ticket ID:</strong> ${ticket.id}<br>
    <strong>Description:</strong> ${ticket.text}<br>
    <strong>Recommended Target:</strong> ${ticket.recommendedGroup} (${ticket.confidence}% confidence)
  `;
  document.getElementById('overrideReason').value = '';
  document.getElementById('overrideModal').classList.add('active');
}

// 15. Automated Test Suite (12 Scenarios)
function bindTestSuite() {
  const btnRun = document.getElementById('btnRunTests');
  const summaryBox = document.getElementById('testSuiteSummary');
  const container = document.getElementById('testResultsContainer');

  btnRun.addEventListener('click', () => {
    const report = runAllTests();

    summaryBox.style.display = 'block';
    summaryBox.className = `stat-card ${report.failedCount === 0 ? 'accent-emerald' : 'accent-amber'}`;
    summaryBox.innerHTML = `
      <div style="font-size: 16px; font-weight: 700; color: var(--text-primary);">
        ${report.failedCount === 0 ? '✅ All 12 Test Scenarios Passed Successfully!' : '⚠️ Some Test Scenarios Failed'}
      </div>
      <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
        Passed: <strong>${report.passedCount} / ${report.total}</strong> (${report.successRate}% Success Rate) &bull; Edge & Failure Tests Verified
      </div>
    `;

    container.innerHTML = report.results.map(r => `
      <div class="test-card ${r.passed ? 'pass' : 'fail'}">
        <div class="test-info">
          <h4>${r.id}: ${r.title} ${r.passed ? '✅' : '❌'}</h4>
          <p>${r.description}</p>
          <div class="test-details">${r.details}</div>
        </div>
        <div>
          <span class="badge ${r.passed ? 'badge-auto' : 'badge-override'}">${r.passed ? 'PASSED' : 'FAILED'}</span>
        </div>
      </div>
    `).join('');
  });
}

// 16. Reset Button Handler
function bindResetButton() {
  document.getElementById('btnResetData').addEventListener('click', () => {
    if (confirm('Reset store back to original seed demonstration tickets?')) {
      store.resetToDefaults();
      const slider = document.getElementById('thresholdSlider');
      const display = document.getElementById('thresholdDisplay');
      slider.value = 70;
      display.textContent = '70%';
      refreshAllData();
      alert('Data reset to default demonstration state.');
    }
  });
}
