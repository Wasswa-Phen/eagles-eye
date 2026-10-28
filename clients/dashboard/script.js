(function () {
  'use strict';

  const API_BASE = 'http://localhost:8080';
  const UGANDA_CENTER = { lat: 1.3733, lng: 32.2903 };
  const UGANDA_BOUNDS = {
    north: 4.5,
    south: -1.65,
    west: 29.2,
    east: 35.3
  };

  // Real WGS84 coordinates for Ugandan districts (from backend/districts.py)
  const UGANDA_DISTRICTS = {
    Masaka: { lat: -0.3411, lng: 31.7361 },
    Mukono: { lat: 0.3549, lng: 32.7523 },
    Mbale: { lat: 1.0784, lng: 34.1754 },
    Mbarara: { lat: -0.6072, lng: 30.6545 },
    Gulu: { lat: 2.7746, lng: 32.2990 },
    Wakiso: { lat: 0.4044, lng: 32.4594 },
    Kampala: { lat: 0.3476, lng: 32.5825 },
    Iganga: { lat: 0.6090, lng: 33.4680 },
    Jinja: { lat: 0.4244, lng: 33.2042 },
    Lira: { lat: 2.2499, lng: 32.8998 },
    Soroti: { lat: 1.7150, lng: 33.6110 },
    Kasese: { lat: 0.1830, lng: 30.0880 },
    Hoima: { lat: 1.4350, lng: 31.3524 },
    Arua: { lat: 3.0200, lng: 30.9110 },
    Kabale: { lat: -1.2490, lng: 29.9900 }
  };

  const OUTBREAK_HOTSPOTS = [
    {
      district: 'Masaka',
      lat: -0.3411,
      lng: 31.7361,
      crop: 'Cassava',
      disease: 'Cassava mosaic',
      severity: 'high',
      scans: 412,
      weight: 5,
      summary: 'High outbreak intensity across Buwunga & Nyendo. Banana wilt & Cassava mosaic active.'
    },
    {
      district: 'Mbale',
      lat: 1.0784,
      lng: 34.1754,
      crop: 'Coffee',
      disease: 'Coffee leaf rust',
      severity: 'high',
      scans: 268,
      weight: 4,
      summary: 'Coffee leaf rust & Fall armyworm confirmed across Bungokho slopes.'
    },
    {
      district: 'Mbarara',
      lat: -0.6072,
      lng: 30.6545,
      crop: 'Banana',
      disease: 'Banana wilt',
      severity: 'moderate',
      scans: 219,
      weight: 3.2,
      summary: 'Moderate Banana bacterial wilt clusters; extension officers deployed.'
    },
    {
      district: 'Mukono',
      lat: 0.3549,
      lng: 32.7523,
      crop: 'Cassava',
      disease: 'Cassava mosaic',
      severity: 'moderate',
      scans: 184,
      weight: 3,
      summary: 'Cassava mosaic & whitefly advisories issued in Goma subcounty.'
    },
    {
      district: 'Iganga',
      lat: 0.6090,
      lng: 33.4680,
      crop: 'Maize',
      disease: 'Fall armyworm',
      severity: 'moderate',
      scans: 163,
      weight: 2.8,
      summary: 'Fall armyworm scouting alerts active across Busoga maize belt.'
    },
    {
      district: 'Gulu',
      lat: 2.7746,
      lng: 32.2990,
      crop: 'Maize',
      disease: 'Fall armyworm',
      severity: 'low',
      scans: 94,
      weight: 1.5,
      summary: 'Low outbreak risk; early maize scouting mostly healthy foliage.'
    },
    {
      district: 'Lira',
      lat: 2.2499,
      lng: 32.8998,
      crop: 'Cassava',
      disease: 'Cassava mosaic',
      severity: 'low',
      scans: 78,
      weight: 1.4,
      summary: 'Isolated Cassava mosaic reports; clean NASE-14 cuttings distributed.'
    },
    {
      district: 'Kasese',
      lat: 0.1830,
      lng: 30.0880,
      crop: 'Coffee',
      disease: 'Coffee leaf rust',
      severity: 'moderate',
      scans: 112,
      weight: 2.2,
      summary: 'Canopy pruning & copper fungicide advisories active in Rwenzori foothills.'
    }
  ];

  const THREATS = [
    {
      rank: 1,
      disease: 'Cassava mosaic',
      crop: 'Cassava',
      scans30d: 486,
      scans7d: 142,
      scansToday: 24,
      trend: '↑ 18%',
      trendClass: 'up'
    },
    {
      rank: 2,
      disease: 'Fall armyworm',
      crop: 'Maize',
      scans30d: 321,
      scans7d: 96,
      scansToday: 17,
      trend: '↑ 12%',
      trendClass: 'up'
    },
    {
      rank: 3,
      disease: 'Banana wilt',
      crop: 'Banana',
      scans30d: 197,
      scans7d: 51,
      scansToday: 8,
      trend: '↓ 4%',
      trendClass: 'down'
    },
    {
      rank: 4,
      disease: 'Coffee leaf rust',
      crop: 'Coffee',
      scans30d: 145,
      scans7d: 39,
      scansToday: 6,
      trend: '→ 0%',
      trendClass: ''
    }
  ];

  const CROP_OPTIONS = ['All crops', 'Cassava', 'Maize', 'Banana', 'Coffee'];
  const DISEASE_OPTIONS = ['All diseases', 'Cassava mosaic', 'Fall armyworm', 'Banana wilt', 'Coffee leaf rust'];
  const PERIOD_OPTIONS = ['Last 30 days', 'Last 7 days', 'Today'];

  const state = {
    activeNav: 'overview',
    cropIdx: 0,
    diseaseIdx: 0,
    periodIdx: 0,
    reports: [],
    mapEngine: null, // 'google' | 'leaflet'
    googleMap: null,
    googleMarkers: [],
    googleCircles: [],
    googleHeatmap: null,
    googleInfoWindow: null,
    leafletMap: null,
    leafletLayerGroup: null
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function severityColor(sev) {
    const s = String(sev || '').toLowerCase();
    if (s === 'high') return '#c62828';
    if (s === 'moderate') return '#f9a825';
    return '#2e7d32';
  }

  function hideMapLoading() {
    const loader = document.getElementById('map-loading');
    if (loader) loader.hidden = true;
  }

  function getFilteredHotspots() {
    const selectedCrop = CROP_OPTIONS[state.cropIdx];
    const selectedDisease = DISEASE_OPTIONS[state.diseaseIdx];

    // Merge canonical Uganda hotspots with any live backend reports from new districts
    const byDistrict = new Map();
    OUTBREAK_HOTSPOTS.forEach((h) => byDistrict.set(h.district.toLowerCase(), { ...h }));

    state.reports.forEach((r) => {
      const key = r.district.toLowerCase();
      if (!byDistrict.has(key) && Number.isFinite(r.latitude) && Number.isFinite(r.longitude)) {
        byDistrict.set(key, {
          district: r.district,
          lat: r.latitude,
          lng: r.longitude,
          crop: r.crop.includes('Banana') ? 'Banana' : r.crop,
          disease: r.condition,
          severity: r.severity,
          scans: 1,
          weight: r.severity === 'high' ? 4 : 2,
          summary: r.advice
        });
      }
    });

    return [...byDistrict.values()].filter((spot) => {
      const cropOk = selectedCrop === 'All crops' || spot.crop.toLowerCase().includes(selectedCrop.toLowerCase());
      const disOk = selectedDisease === 'All diseases' || spot.disease.toLowerCase().includes(selectedDisease.toLowerCase());
      return cropOk && disOk;
    });
  }

  function buildPopupHtml(spot) {
    return `<div class="ug-info-popup">
      <strong>${escapeHtml(spot.district)} District</strong>
      <div class="ug-pop-crop">${escapeHtml(spot.crop)} · ${escapeHtml(spot.disease)} (${escapeHtml(spot.severity)})</div>
      <p>${escapeHtml(spot.scans)} confirmed scans. ${escapeHtml(spot.summary)}</p>
    </div>`;
  }

  // =========================================================
  // REAL UGANDA MAP — GOOGLE MAPS ENGINE + LEAFLET FALLBACK
  // =========================================================
  function initGoogleMapInstance() {
    const el = document.getElementById('uganda-real-map');
    if (!el || !window.google?.maps) {
      initLeafletFallback();
      return;
    }

    state.mapEngine = 'google';
    state.googleMap = new google.maps.Map(el, {
      center: UGANDA_CENTER,
      zoom: 7,
      minZoom: 6,
      maxZoom: 14,
      restriction: {
        latLngBounds: UGANDA_BOUNDS,
        strictBounds: false
      },
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#eef4e8' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cfe4f2' }] },
        { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#5c7c58' }, { weight: 2 }] }
      ]
    });

    state.googleInfoWindow = new google.maps.InfoWindow();
    hideMapLoading();
    renderMapLayers();
  }

  function initLeafletFallback() {
    if (state.mapEngine === 'leaflet' && state.leafletMap) return;
    const el = document.getElementById('uganda-real-map');
    if (!el || !window.L) return;

    state.mapEngine = 'leaflet';
    el.innerHTML = '';

    state.leafletMap = L.map(el, {
      center: [UGANDA_CENTER.lat, UGANDA_CENTER.lng],
      zoom: 7,
      minZoom: 6,
      maxZoom: 15,
      maxBounds: [
        [UGANDA_BOUNDS.south - 1, UGANDA_BOUNDS.west - 1],
        [UGANDA_BOUNDS.north + 1, UGANDA_BOUNDS.east + 1]
      ],
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(state.leafletMap);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(state.leafletMap);

    state.leafletLayerGroup = L.layerGroup().addTo(state.leafletMap);
    hideMapLoading();
    renderMapLayers();
  }

  function renderMapLayers() {
    const spots = getFilteredHotspots();

    if (state.mapEngine === 'google' && state.googleMap && window.google?.maps) {
      state.googleMarkers.forEach((m) => m.setMap(null));
      state.googleCircles.forEach((c) => c.setMap(null));
      state.googleMarkers = [];
      state.googleCircles = [];
      if (state.googleHeatmap) {
        state.googleHeatmap.setMap(null);
      }

      if (google.maps.visualization?.HeatmapLayer) {
        const heatPoints = spots.map((s) => ({
          location: new google.maps.LatLng(s.lat, s.lng),
          weight: s.weight
        }));
        state.googleHeatmap = new google.maps.visualization.HeatmapLayer({
          data: heatPoints,
          map: state.googleMap,
          radius: 48,
          opacity: 0.62,
          gradient: [
            'rgba(105, 170, 100, 0)',
            '#69aa64',
            '#f3c34f',
            '#e8893d',
            '#d9583e'
          ]
        });
      }

      spots.forEach((spot) => {
        const color = severityColor(spot.severity);

        const halo = new google.maps.Circle({
          strokeColor: color,
          strokeOpacity: 0.35,
          strokeWeight: 1.5,
          fillColor: color,
          fillOpacity: 0.16,
          map: state.googleMap,
          center: { lat: spot.lat, lng: spot.lng },
          radius: spot.severity === 'high' ? 34000 : 25000
        });
        state.googleCircles.push(halo);

        const marker = new google.maps.Marker({
          position: { lat: spot.lat, lng: spot.lng },
          map: state.googleMap,
          title: `${spot.district} — ${spot.disease}`,
          label: {
            text: spot.district,
            color: '#1b1b1b',
            fontSize: '12px',
            fontWeight: '800'
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
            scale: spot.severity === 'high' ? 9 : 7.5,
            labelOrigin: new google.maps.Point(0, -2.2)
          }
        });

        marker.addListener('click', () => {
          state.googleInfoWindow.setContent(buildPopupHtml(spot));
          state.googleInfoWindow.open({ map: state.googleMap, anchor: marker });
        });

        state.googleMarkers.push(marker);
      });
    } else if (state.mapEngine === 'leaflet' && state.leafletMap && state.leafletLayerGroup) {
      state.leafletLayerGroup.clearLayers();

      spots.forEach((spot) => {
        const color = severityColor(spot.severity);

        L.circle([spot.lat, spot.lng], {
          radius: spot.severity === 'high' ? 35000 : 25000,
          color,
          weight: 1.5,
          opacity: 0.45,
          fillColor: color,
          fillOpacity: 0.22
        }).addTo(state.leafletLayerGroup);

        const pin = L.circleMarker([spot.lat, spot.lng], {
          radius: spot.severity === 'high' ? 9 : 7,
          color: '#ffffff',
          weight: 3,
          fillColor: color,
          fillOpacity: 1
        })
          .bindPopup(buildPopupHtml(spot))
          .bindTooltip(escapeHtml(spot.district), {
            permanent: true,
            direction: 'right',
            offset: [8, 0],
            className: 'leaflet-district-label'
          });

        pin.addTo(state.leafletLayerGroup);
      });
    }
  }

  function refreshMapViewport() {
    window.setTimeout(() => {
      if (state.mapEngine === 'google' && state.googleMap && window.google?.maps) {
        google.maps.event.trigger(state.googleMap, 'resize');
        state.googleMap.setCenter(UGANDA_CENTER);
      } else if (state.mapEngine === 'leaflet' && state.leafletMap) {
        state.leafletMap.invalidateSize();
        state.leafletMap.setView([UGANDA_CENTER.lat, UGANDA_CENTER.lng], 7);
      }
    }, 80);
  }

  // Expose Google Maps callbacks & auth-failure fallback
  window.initGoogleMap = function () {
    initGoogleMapInstance();
  };
  window.gm_authFailure = function () {
    initLeafletFallback();
  };
  window.handleGoogleMapsError = function () {
    initLeafletFallback();
  };

  // =========================================================
  // THREATS, REPORTS & ACTIONS
  // =========================================================
  function normalizeReport(raw, idx) {
    const loc = raw.location || {};
    const districtName = String(loc.district || raw.district || 'Masaka');
    const knownCoords = UGANDA_DISTRICTS[districtName] || null;
    const rawLat = Number(loc.latitude ?? raw.latitude ?? knownCoords?.lat);
    const rawLng = Number(loc.longitude ?? raw.longitude ?? knownCoords?.lng);

    return {
      id: raw.id || `scan-${idx + 1}`,
      crop: String(raw.crop || 'Unknown'),
      condition: String(raw.condition || 'Unspecified condition'),
      confidence: Number(raw.confidence ?? 0.9),
      severity: String(raw.severity || 'moderate').toLowerCase(),
      advice: String(raw.advice || ''),
      advice_luganda: String(raw.advice_luganda || ''),
      district: districtName,
      subcounty: String(loc.subcounty || ''),
      latitude: rawLat,
      longitude: rawLng,
      timestamp: raw.timestamp || ''
    };
  }

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

    renderMapLayers();
  }

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
      refreshMapViewport();
    } else if (viewName === 'overview') {
      dashboardGrid.classList.remove('map-expanded');
      threatPanel.hidden = false;
      refreshMapViewport();
    } else if (viewName === 'reports') {
      renderReportsView();
    } else if (viewName === 'settings') {
      checkApiHealth();
    }
  }

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
      // ignore if opened via file://
    }

    state.reports = seedReports;
    populateReportFilters();
    renderNotifications();
    renderReportsView();
    renderMapLayers();

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
          renderMapLayers();
        }
      }
    } catch (_) {
      // Seed data remains active
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
        renderMapLayers();
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

    const blob = new Blob([csv], { type: 'text/csv;charset-utf-8;' });
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
    document.querySelectorAll('.sidebar nav button').forEach((btn) => {
      btn.addEventListener('click', () => {
        switchView(btn.getAttribute('data-nav') || 'overview');
      });
    });

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

    document.getElementById('btn-view-all').addEventListener('click', () => {
      switchView('reports');
    });

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

    document.getElementById('btn-download').addEventListener('click', downloadReportCsv);

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

    // If Google Maps already loaded before DOMContentLoaded, initialize right away;
    // otherwise give Google Maps 3.5s before activating Leaflet real Uganda map fallback.
    if (window.google?.maps && !state.mapEngine) {
      initGoogleMapInstance();
    } else {
      window.setTimeout(() => {
        if (!state.mapEngine) {
          initLeafletFallback();
        }
      }, 3500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
