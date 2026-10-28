(function () {
  'use strict';

  const API_BASE = 'http://localhost:8080';

  const THREATS = [
    {
      rank: 1,
      disease: 'Cassava mosaic',
      crop: 'Cassava',
      scans30d: 486,
      scans7d: 142,
      scansToday: 24,
      trend: '↑ 18%',
      trendClass: 'up',
      districts: ['Masaka', 'Mukono', 'Mbarara']
    },
    {
      rank: 2,
      disease: 'Fall armyworm',
      crop: 'Maize',
      scans30d: 321,
      scans7d: 96,
      scansToday: 17,
      trend: '↑ 12%',
      trendClass: 'up',
      districts: ['Mbale', 'Gulu', 'Masaka']
    },
    {
      rank: 3,
      disease: 'Banana wilt',
      crop: 'Banana',
      scans30d: 197,
      scans7d: 51,
      scansToday: 8,
      trend: '↓ 4%',
      trendClass: 'down',
      districts: ['Masaka', 'Mbarara']
    },
    {
      rank: 4,
      disease: 'Coffee leaf rust',
      crop: 'Coffee',
      scans30d: 145,
      scans7d: 39,
      scansToday: 6,
      trend: '→ 0%',
      trendClass: '',
      districts: ['Mbale']
    }
  ];

  const DISTRICT_SUMMARIES = {
    Masaka: {
      severity: 'high',
      label: 'High risk',
      summary: '412 confirmed scans · Banana bacterial wilt & Cassava mosaic hotspots active in Buwunga.'
    },
    Mbale: {
      severity: 'moderate',
      label: 'Moderate risk',
      summary: '268 confirmed scans · Coffee leaf rust & Fall armyworm reported across Bungokho.'
    },
    Gulu: {
      severity: 'healthy',
      label: 'Low risk',
      summary: '94 confirmed scans · Early maize scouting active; mostly healthy crop foliage.'
    },
    Mbarara: {
      severity: 'moderate',
      label: 'Moderate risk',
      summary: '219 confirmed scans · Banana wilt & Cassava mosaic advisories issued to cooperatives.'
    }
  };

  const CROP_OPTIONS = ['All crops', 'Cassava', 'Maize', 'Banana', 'Coffee'];
  const DISEASE_OPTIONS = ['All diseases', 'Cassava mosaic', 'Fall armyworm', 'Banana wilt', 'Coffee leaf rust'];
  const PERIOD_OPTIONS = ['Last 30 days', 'Last 7 days', 'Today'];

  const state = {
    activeNav: 'overview',
    cropIdx: 0,
    diseaseIdx: 0,
    periodIdx: 0,
    reports: []
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeReport(raw, idx) {
    const loc = raw.location || {};
    return {
      id: raw.id || `scan-${idx + 1}`,
      crop: String(raw.crop || 'Unknown'),
      condition: String(raw.condition || 'Unspecified condition'),
      confidence: Number(raw.confidence ?? 0.9),
      severity: String(raw.severity || 'moderate').toLowerCase(),
      advice: String(raw.advice || ''),
      advice_luganda: String(raw.advice_luganda || ''),
      district: String(loc.district || raw.district || 'Unknown'),
      subcounty: String(loc.subcounty || ''),
      timestamp: raw.timestamp || ''
    };
  }

  // Threat filtering & map pin synchronization
  function getPeriodScans(threat) {
    const period = PERIOD_OPTIONS[state.periodIdx];
    if (period === 'Last 7 days') return threat.scans7d;
    if (period === 'Today') return threat.scansToday;
    return threat.scans30d;
  }

  function renderThreatsAndPins() {
    const selectedCrop = CROP_OPTIONS[state.cropIdx];
    const selectedDisease = DISEASE_OPTIONS[state.diseaseIdx];
    const selectedPeriod = PERIOD_OPTIONS[state.periodIdx];

    const btnCrop = document.getElementById('filter-crop');
    const btnDisease = document.getElementById('filter-disease');
    const btnPeriod = document.getElementById('filter-period');

    btnCrop.innerHTML = `${escapeHtml(selectedCrop)}<span>⌄</span>`;
    btnDisease.innerHTML = `${escapeHtml(selectedDisease)}<span>⌄</span>`;
    btnPeriod.innerHTML = `${escapeHtml(selectedPeriod)}<span>⌄</span>`;

    btnCrop.classList.toggle('filtered', state.cropIdx > 0);
    btnDisease.classList.toggle('filtered', state.diseaseIdx > 0);
    btnPeriod.classList.toggle('filtered', state.periodIdx > 0);

    document.getElementById('map-period-subtitle').textContent =
      `Confirmed cases by district · ${selectedPeriod}`;

    const filtered = THREATS.filter((t) => {
      const cropMatch = selectedCrop === 'All crops' || t.crop === selectedCrop;
      const disMatch = selectedDisease === 'All diseases' || t.disease === selectedDisease;
      return cropMatch && disMatch;
    });

    const listEl = document.getElementById('threat-list');
    if (filtered.length === 0) {
      listEl.innerHTML = `<li><b>–</b><div><strong>No matching threats</strong><span>Click filter buttons to reset</span></div><em>0</em></li>`;
    } else {
      listEl.innerHTML = filtered
        .map((item, idx) => {
          const count = getPeriodScans(item);
          const emClass = item.trendClass ? ` class="${item.trendClass}"` : '';
          return `<li>
            <b>${idx + 1}</b>
            <div>
              <strong>${escapeHtml(item.disease)}</strong>
              <span>${escapeHtml(item.crop)} · ${count} scans</span>
            </div>
            <em${emClass}>${escapeHtml(item.trend)}</em>
          </li>`;
        })
        .join('');
    }

    // Highlight matching map pins
    const activeDistricts = new Set();
    filtered.forEach((t) => t.districts.forEach((d) => activeDistricts.add(d)));
    const isFiltered = state.cropIdx > 0 || state.diseaseIdx > 0;

    document.querySelectorAll('#map-pins .map-pin').forEach((pin) => {
      const dist = pin.getAttribute('data-district');
      pin.classList.toggle('dimmed', isFiltered && !activeDistricts.has(dist));
    });
  }

  // Map pin popover
  function openPinCard(districtName) {
    const info = DISTRICT_SUMMARIES[districtName];
    if (!info) return;

    const card = document.getElementById('map-pin-card');
    const badge = document.getElementById('pin-card-badge');

    document.getElementById('pin-card-title').textContent = `${districtName} District`;
    badge.textContent = info.label;
    badge.className = `sev-badge ${info.severity}`;

    const liveMatching = state.reports.filter(
      (r) => r.district.toLowerCase() === districtName.toLowerCase()
    );
    const extra = liveMatching.length
      ? ` Latest report: ${liveMatching[0].condition} (${Math.round(liveMatching[0].confidence * 100)}% confidence).`
      : '';

    document.getElementById('pin-card-body').textContent = info.summary + extra;
    card.hidden = false;
  }

  // Navigation switching
  function switchView(viewName) {
    state.activeNav = viewName;

    document.querySelectorAll('.sidebar nav button').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-nav') === viewName);
    });

    const statsSection = document.getElementById('stats-section');
    const dashboardGrid = document.getElementById('dashboard-grid');
    const threatPanel = document.getElementById('threat-panel');
    const reportsView = document.getElementById('reports-view');
    const settingsView = document.getElementById('settings-view');

    statsSection.hidden = viewName === 'settings';
    dashboardGrid.hidden = viewName === 'reports' || viewName === 'settings';
    reportsView.hidden = viewName !== 'reports';
    settingsView.hidden = viewName !== 'settings';

    if (viewName === 'map') {
      dashboardGrid.classList.add('map-expanded');
      threatPanel.hidden = true;
    } else {
      dashboardGrid.classList.remove('map-expanded');
      threatPanel.hidden = false;
    }

    if (viewName === 'reports') {
      renderReportsView();
    } else if (viewName === 'settings') {
      checkApiHealth();
    }
  }

  // Load seed_data.json + optional live /scans
  async function loadInitialReports() {
    let seedReports = [];
    try {
      const res = await fetch('./seed_data.json', { cache: 'no-store' });
      if (res.ok) {
        const arr = await res.json();
        if (Array.isArray(arr)) {
          seedReports = arr.map(normalizeReport);
        }
      }
    } catch (_) {
      // ignore if opened via file:// protocol
    }

    state.reports = seedReports;
    populateReportFilters();
    renderNotifications();
    renderReportsView();

    // Quietly try syncing live backend scans as well
    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 2200);
      const liveRes = await fetch(`${API_BASE}/scans`, { signal: controller.signal });
      window.clearTimeout(timer);

      if (liveRes.ok) {
        const payload = await liveRes.json();
        const scans = Array.isArray(payload) ? payload : payload.scans;
        if (Array.isArray(scans) && scans.length > 0) {
          state.reports = scans.map(normalizeReport);
          populateReportFilters();
          renderNotifications();
          renderReportsView();
        }
      }
    } catch (_) {
      // Backend not running; seed data remains active
    }
  }

  async function syncBackendExplicit() {
    const btn = document.getElementById('btn-sync-backend');
    btn.disabled = true;
    btn.textContent = 'Syncing...';

    try {
      const res = await fetch(`${API_BASE}/scans`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      const scans = Array.isArray(payload) ? payload : payload.scans;
      if (Array.isArray(scans)) {
        state.reports = scans.map(normalizeReport);
        populateReportFilters();
        renderNotifications();
        renderReportsView();
        btn.textContent = `Synced (${state.reports.length})`;
      }
    } catch (_) {
      btn.textContent = 'Offline (seed data)';
    } finally {
      window.setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Sync live API';
      }, 2000);
    }
  }

  function populateSelect(selectId, items, defaultLabel) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const prev = sel.value;
    const unique = [...new Set(items.filter(Boolean))].sort();
    sel.innerHTML = `<option value="all">${escapeHtml(defaultLabel)}</option>` +
      unique.map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
    if (unique.includes(prev)) sel.value = prev;
  }

  function populateReportFilters() {
    populateSelect('rep-filter-district', state.reports.map((r) => r.district), 'All districts');
    populateSelect('rep-filter-crop', state.reports.map((r) => r.crop), 'All crops');
    populateSelect('rep-filter-severity', state.reports.map((r) => r.severity), 'All severities');
  }

  function renderReportsView() {
    const listEl = document.getElementById('reports-list');
    if (!listEl) return;

    const fDist = document.getElementById('rep-filter-district')?.value || 'all';
    const fCrop = document.getElementById('rep-filter-crop')?.value || 'all';
    const fSev = document.getElementById('rep-filter-severity')?.value || 'all';

    const matches = state.reports.filter((r) => {
      return (
        (fDist === 'all' || r.district === fDist) &&
        (fCrop === 'all' || r.crop === fCrop) &&
        (fSev === 'all' || r.severity === fSev)
      );
    });

    document.getElementById('reports-count-text').textContent =
      `Showing ${matches.length} of ${state.reports.length} confirmed district reports`;

    if (matches.length === 0) {
      listEl.innerHTML = `<div class="report-row"><p class="report-meta">No matching reports for the selected filters.</p></div>`;
      return;
    }

    listEl.innerHTML = matches
      .map((r) => {
        const conf = Math.round((r.confidence || 0.9) * 100);
        const area = r.subcounty ? `${r.district} · ${r.subcounty}` : `${r.district} District`;
        return `<article class="report-row">
          <div class="report-row-top">
            <strong>${escapeHtml(r.crop)} — ${escapeHtml(r.condition)}</strong>
            <span class="sev-badge ${escapeHtml(r.severity)}">${escapeHtml(r.severity)}</span>
          </div>
          <div class="report-meta">${escapeHtml(area)} · AI confidence ${conf}%</div>
          <p class="report-advice">${escapeHtml(r.advice)}</p>
          ${r.advice_luganda ? `<p class="report-luganda">Luganda: ${escapeHtml(r.advice_luganda)}</p>` : ''}
        </article>`;
      })
      .join('');
  }

  function renderNotifications() {
    const notifList = document.getElementById('notif-list');
    if (!notifList) return;

    const source = state.reports.length
      ? state.reports.slice(0, 3)
      : [
          { district: 'Masaka', crop: 'Banana / Matooke', condition: 'Banana Bacterial Wilt (BXW)', severity: 'high' },
          { district: 'Mukono', crop: 'Cassava', condition: 'Cassava Mosaic Disease (CMD)', severity: 'moderate' },
          { district: 'Mbale', crop: 'Coffee', condition: 'Coffee Leaf Rust (CLR)', severity: 'high' }
        ];

    notifList.innerHTML = source
      .map(
        (item) => `<div class="notif-item">
          <b>${escapeHtml(item.district)} · ${escapeHtml(item.condition)}</b>
          <small>${escapeHtml(item.crop)} (${escapeHtml(item.severity)} severity)</small>
        </div>`
      )
      .join('');
  }

  async function checkApiHealth() {
    const pill = document.getElementById('api-health-pill');
    if (!pill) return;
    pill.textContent = 'Checking status...';
    pill.classList.remove('online');

    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE}/`, { signal: controller.signal });
      window.clearTimeout(timer);
      if (res.ok) {
        const info = await res.json();
        pill.textContent = `Online · Storage: ${info.storage || 'active'}`;
        pill.classList.add('online');
        return;
      }
    } catch (_) {
      // ignore
    }
    pill.textContent = 'Offline · Using local seed_data.json';
  }

  // Export CSV report
  function downloadReportCsv() {
    const rows = [
      ['Section', 'Rank/ID', 'District/Crop', 'Condition', 'Scans/Confidence', 'Trend/Severity']
    ];

    THREATS.forEach((t) => {
      rows.push([
        'Top Threat',
        String(t.rank),
        t.crop,
        t.disease,
        `${getPeriodScans(t)} scans`,
        t.trend
      ]);
    });

    state.reports.forEach((r) => {
      rows.push([
        'Field Report',
        r.id,
        `${r.district} (${r.crop})`,
        r.condition,
        `${Math.round((r.confidence || 0) * 100)}%`,
        r.severity
      ]);
    });

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'eagles-eye-outbreak-report.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function bindEvents() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar nav button').forEach((btn) => {
      btn.addEventListener('click', () => {
        switchView(btn.getAttribute('data-nav') || 'overview');
      });
    });

    // Threat filters
    document.getElementById('filter-crop').addEventListener('click', () => {
      state.cropIdx = (state.cropIdx + 1) % CROP_OPTIONS.length;
      renderThreatsAndPins();
    });
    document.getElementById('filter-disease').addEventListener('click', () => {
      state.diseaseIdx = (state.diseaseIdx + 1) % DISEASE_OPTIONS.length;
      renderThreatsAndPins();
    });
    document.getElementById('filter-period').addEventListener('click', () => {
      state.periodIdx = (state.periodIdx + 1) % PERIOD_OPTIONS.length;
      renderThreatsAndPins();
    });

    // View all threats -> open Reports view
    document.getElementById('btn-view-all').addEventListener('click', () => {
      switchView('reports');
    });

    // Map pins
    document.querySelectorAll('#map-pins .map-pin').forEach((pin) => {
      const dist = pin.getAttribute('data-district');
      pin.addEventListener('click', () => openPinCard(dist));
      pin.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPinCard(dist);
        }
      });
    });
    document.getElementById('btn-close-pin-card').addEventListener('click', () => {
      document.getElementById('map-pin-card').hidden = true;
    });

    // Notifications popover
    const btnNotif = document.getElementById('btn-notification');
    const notifPopover = document.getElementById('notif-popover');
    const notifDot = document.getElementById('notif-dot');

    btnNotif.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = notifPopover.hidden;
      notifPopover.hidden = !willOpen;
      if (willOpen && notifDot) {
        notifDot.hidden = true;
      }
    });
    document.addEventListener('click', (e) => {
      if (!notifPopover.hidden && !notifPopover.contains(e.target) && e.target !== btnNotif) {
        notifPopover.hidden = true;
      }
    });

    // Download CSV report
    document.getElementById('btn-download').addEventListener('click', downloadReportCsv);

    // Reports view controls
    ['rep-filter-district', 'rep-filter-crop', 'rep-filter-severity'].forEach((id) => {
      document.getElementById(id)?.addEventListener('change', renderReportsView);
    });
    document.getElementById('btn-sync-backend').addEventListener('click', syncBackendExplicit);
    document.getElementById('btn-check-health').addEventListener('click', checkApiHealth);
  }

  function init() {
    bindEvents();
    renderThreatsAndPins();
    loadInitialReports();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
