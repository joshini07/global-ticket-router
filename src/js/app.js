// Application UI Controller & Event Handlers

import { store } from './store.js';
import { evaluateTicket } from './routingEngine.js';
import { HARD_CONSTRAINTS, SOFT_CONSTRAINTS, RESOLVER_GROUPS } from './config.js';
import { runAllTests } from './testSuite.js';

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
    text: 'Need access to London regional salary tax reports and EMEA payroll portal.',
    region: 'EMEA',
    channel: 'Email',
    asset: 'Finance System',
    userRole: 'Tier 1 Agent'
  },
  {
    text: 'System is giving error code 0x80070005 when opening internal app.',
    region: 'NA',
    channel: 'Portal',
    asset: 'Software/ERP',
    userRole: 'End User'
  },
  {
    text: 'Received suspicious phishing email asking for Okta credentials immediately.',
    region: 'NA',
    channel: 'Phone',
    asset: 'Identity/IAM',
    userRole: 'Support Lead / Admin'
  },
  {
    text: 'Unable to connect to Cisco VPN tunnel from home Wi-Fi network.',
    region: 'EMEA',
    channel: 'Slack/Chat',
    asset: 'Network/VPN',
    userRole: 'End User'
  }
];

let presetIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  initUI();
});

function initUI() {
  bindTabs();
  bindThresholdSlider();
  bindForm();
  bindOverrideModal();
  bindTestSuite();
  bindResetButton();
  renderRules();
  refreshAllData();
}

// 1. Navigation Tabs Handling
function bindTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
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

// 3. Form Handling & Preset Fill
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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('ticketText').value.trim();
    const region = document.getElementById('ticketRegion').value;
    const channel = document.getElementById('ticketChannel').value;
    const asset = document.getElementById('ticketAsset').value;
    const userRole = document.getElementById('ticketRole').value;

    if (!text) return;

    // Evaluate
    const evaluatedTicket = evaluateTicket({ text, region, channel, asset, userRole });
    store.addTicket(evaluatedTicket);

    renderLiveResultCard(evaluatedTicket);
    refreshAllData();
  });
}

// Render Live Evaluation Result Preview Card
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

  const hardTagsHtml = ticket.hardConstraintsApplied.map(h => `<span class="tag-item hard-constraint">🛡️ ${h}</span>`).join('');
  const softTagsHtml = ticket.softConstraintsApplied.map(s => `<span class="tag-item soft-constraint">💡 ${s}</span>`).join('');

  container.innerHTML = `
    <div class="recommendation-card ${cardBorderClass}">
      <div class="rec-header">
        <div>
          <span style="font-size: 12px; color: var(--text-secondary);">RECOMMENDED RESOLVER GROUP:</span>
          <div class="rec-group-title">${ticket.recommendedGroupName} (${ticket.recommendedGroup})</div>
        </div>
        <span class="badge ${statusClass}">${statusText}</span>
      </div>

      <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
        <strong>Intent Identified:</strong> ${ticket.intentLabel}
      </div>

      <div class="confidence-container">
        <div class="confidence-header">
          <span>Confidence Score</span>
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

// 4. Data Refresh Controller
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

// 5. Manual Review Queue Table Renderer
function renderManualReviewQueue() {
  const tbody = document.getElementById('manualReviewTableBody');
  const reviewTickets = store.tickets.filter(t => t.status === 'MANUAL_REVIEW');

  if (reviewTickets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <div class="empty-icon">✅</div>
          <p>No low-confidence tickets in Manual Review Queue!</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = reviewTickets.map(t => `
    <tr>
      <td><strong>${t.id}</strong></td>
      <td style="max-width: 260px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${t.text}">${t.text}</td>
      <td><span class="tag-item">${t.region}</span> <span class="tag-item">${t.asset}</span></td>
      <td>${t.intentLabel}</td>
      <td><strong style="color: var(--accent-amber);">${t.confidence}%</strong></td>
      <td><span class="badge badge-review">MANUAL REVIEW</span></td>
      <td>
        <button class="btn btn-secondary btn-sm btn-override-trigger" data-id="${t.id}">✏️ Override / Assign</button>
      </td>
    </tr>
  `).join('');

  // Attach click handlers to override buttons
  document.querySelectorAll('.btn-override-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const ticketId = btn.getAttribute('data-id');
      openOverrideModal(ticketId);
    });
  });
}

// 6. Audit Trail Renderer
function renderAuditTrail() {
  const tbody = document.getElementById('auditTableBody');
  const audit = store.auditTrail;

  if (audit.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="7" class="empty-state">No audit logs recorded yet.</td></tr>
    `;
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

// 7. Analytics Breakdown Renderer
function renderAnalytics() {
  const statusContainer = document.getElementById('statusBreakdownContainer');
  const regionContainer = document.getElementById('regionBreakdownContainer');
  const intentContainer = document.getElementById('intentBreakdownContainer');

  const total = store.tickets.length || 1;
  const metrics = store.getMetrics();

  // Status Breakdown
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

  // Region Breakdown
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

  // Intent Breakdown
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

// 8. Rules Pane Renderer
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

// 9. Override Modal Controls
function bindOverrideModal() {
  const modal = document.getElementById('overrideModal');
  const btnClose = document.getElementById('btnCloseModal');
  const btnCancel = document.getElementById('btnCancelOverride');
  const form = document.getElementById('overrideForm');
  const selectGroup = document.getElementById('overrideTargetGroup');

  // Populate resolver groups select
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

// 10. Test Suite Handler
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
        ${report.failedCount === 0 ? '✅ All 8 Test Scenarios Passed Successfully!' : '⚠️ Some Test Scenarios Failed'}
      </div>
      <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
        Passed: <strong>${report.passedCount} / ${report.total}</strong> (${report.successRate}% Success Rate)
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

// 11. Reset Button Handler
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
