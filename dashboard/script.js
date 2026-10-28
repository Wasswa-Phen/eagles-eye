
'use strict';

/* =========================================================
   EAGLES EYE DASHBOARD
   ========================================================= */

let allReports = [];
let cropMap = null;
let cropMapMarkers = [];
let mapInfoWindows = [];

/* =========================================================
   SAFE HTML HELPERS
   ========================================================= */

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(message, type = 'info', durationMs = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, durationMs);
}

/* =========================================================
   REPORT NORMALIZATION
   Supports your seed_data.json structure and common
   alternative backend field names.
   ========================================================= */

function normalizeReport(report, index = 0) {
  const location = report.location || {};

  const rawLat =
    location.latitude ?? location.lat ??
    report.latitude ?? report.lat;

  const rawLng =
    location.longitude ?? location.lng ??
    report.longitude ?? report.lng;

  const lat = rawLat === null || rawLat === undefined ||
              rawLat === '' ? NaN : Number(rawLat);

  const lng = rawLng === null || rawLng === undefined ||
              rawLng === '' ? NaN : Number(rawLng);

  return {
    ...report,
    id: report.id ?? `report-${index}`,
    crop: String(report.crop ?? report.crop_type ?? 'Unknown crop'),
    condition: String(
      report.condition ?? report.disease ?? report.disease_name ??
      'Condition not specified'
    ),
    severity: String(report.severity ?? 'unknown').toLowerCase(),
    confidence: Number(report.confidence ?? 0),
    advice: String(report.advice ?? 'No advice available.'),
    advice_luganda: String(report.advice_luganda ?? ''),
    timestamp: report.timestamp ?? report.created_at ?? null,
    location: {
      ...location,
      district: String(
        location.district ?? report.district ?? 'Unknown district'
      ),
      subcounty: String(
        location.subcounty ?? report.subcounty ??
        location.district ?? report.district ?? 'Unknown area'
      ),
      latitude: lat,
      longitude: lng
    }
  };
}

/* =========================================================
   SEVERITY STYLING
   ========================================================= */

function severityClass(severity) {
  switch (String(severity ?? '').toLowerCase()) {
    case 'high':
      return 'severity-high';
    case 'moderate':
      return 'severity-moderate';
    case 'low':
      return 'severity-low';
    default:
      return 'severity-none';
  }
}

function markerColor(severity) {
  switch (String(severity ?? '').toLowerCase()) {
    case 'high':
      return '#dc2626';
    case 'moderate':
      return '#d97706';
    case 'low':
      return '#059669';
    default:
      return '#64748b';
  }
}

/* =========================================================
   LOAD DEMO DATA
   ========================================================= */

async function loadOutbreakFeed() {
  const container = document.getElementById('outbreak-list-container');

  try {
    const response = await fetch('./seed_data.json', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Could not load seed_data.json (HTTP ${response.status}).`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('seed_data.json must contain a JSON array of reports.');
    }

    allReports = data.map(normalizeReport);

    updateKPIs();
    populateFilter('district-filter', allReports.map(r => r.location.district));
    populateFilter('crop-filter', allReports.map(r => r.crop));
    populateFilter('severity-filter', allReports.map(r => r.severity));

    renderOutbreakFeed();

    if (cropMap) {
      placeMarkersFromReports();
    }

    console.info(`Loaded ${allReports.length} report(s).`);
  } catch (error) {
    console.error('Failed to load demo reports:', error);

    if (container) {
      container.innerHTML = `
        <div class="state-box state-box--error">
          <div class="state-box-title">Could not load reports</div>
          <div class="state-box-text">
            ${escapeHtml(error.message)}
            <p>Check that the dashboard is running on a local web server
            and that seed_data.json is in the same folder as index.html.</p>
          </div>
          <button type="button" class="btn-sync" id="retry-load-reports">
            Retry loading reports
          </button>
        </div>
      `;

      document.getElementById('retry-load-reports')
        ?.addEventListener('click', loadOutbreakFeed);
    }

    const count = document.getElementById('alerts-count-label');
    if (count) count.textContent = 'Reports unavailable';
  }
}

/* =========================================================
   KPI CARDS
   ========================================================= */

function updateKPIs() {
  const districts = new Set(
    allReports.map(r => r.location.district).filter(Boolean)
  );

  const crops = new Set(
    allReports.map(r => r.crop).filter(Boolean)
  );

  const highCount = allReports.filter(
    r => r.severity === 'high'
  ).length;

  document.getElementById('kpi-scans').textContent =
    allReports.length;

  document.getElementById('kpi-districts').textContent =
    districts.size;

  document.getElementById('kpi-high-severity').textContent =
    highCount;

  document.getElementById('kpi-crops').textContent =
    crops.size;
}

/* =========================================================
   FILTER DROPDOWNS
   ========================================================= */

function populateFilter(filterId, values) {
  const dropdown = document.getElementById(filterId);

  if (!dropdown) {
    console.error(`Dropdown not found: #${filterId}`);
    return;
  }

  const previousValue = dropdown.value;

  const uniqueValues = [...new Set(
    values
      .filter(value => value !== null && value !== undefined)
      .map(value => String(value).trim())
      .filter(value => value !== '')
  )].sort((a, b) => a.localeCompare(b));

  // Preserve the first option, such as "All districts".
  while (dropdown.options.length > 1) {
    dropdown.remove(1);
  }

  uniqueValues.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent =
      value.charAt(0).toUpperCase() + value.slice(1);

    dropdown.appendChild(option);
  });

  // Keep the selected value if it still exists.
  if (uniqueValues.includes(previousValue)) {
    dropdown.value = previousValue;
  } else {
    dropdown.value = 'all';
  }
}

/* =========================================================
   FILTERING
   ========================================================= */

function getFilteredReports() {
  const district = document.getElementById('district-filter')?.value ?? 'all';
  const crop = document.getElementById('crop-filter')?.value ?? 'all';
  const severity = document.getElementById('severity-filter')?.value ?? 'all';

  return allReports.filter(report => {
    const matchesDistrict =
      district === 'all' || report.location.district === district;

    const matchesCrop =
      crop === 'all' || report.crop === crop;

    const matchesSeverity =
      severity === 'all' || report.severity === severity;

    return matchesDistrict && matchesCrop && matchesSeverity;
  });
}

/* =========================================================
   REPORT LIST
   ========================================================= */

function renderOutbreakFeed() {
  const container = document.getElementById('outbreak-list-container');
  const countLabel = document.getElementById('alerts-count-label');

  if (!container) return;

  const filteredReports = getFilteredReports();

  if (countLabel) {
    countLabel.textContent =
      `${filteredReports.length} of ${allReports.length} reports`;
  }

  container.innerHTML = '';

  if (filteredReports.length === 0) {
    container.innerHTML = `
      <div class="state-box">
        <div class="state-box-title">No matching reports</div>
        <div class="state-box-text">
          Try changing the district, crop, or severity filters.
        </div>
        <button type="button" class="btn-sync" id="clear-report-filters">
          Clear filters
        </button>
      </div>
    `;

    document.getElementById('clear-report-filters')
      ?.addEventListener('click', clearFilters);

    updateMapMarkers();
    return;
  }

  filteredReports.forEach(report => {
    const severity = report.severity;
    const confidence = Math.max(
      0,
      Math.min(100, Math.round(report.confidence * 100))
    );

    let formattedTime = 'Time unavailable';

    if (report.timestamp) {
      const date = new Date(report.timestamp);

      if (!Number.isNaN(date.getTime())) {
        formattedTime = date.toLocaleString('en-UG', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }

    const item = document.createElement('article');
    item.className = 'outbreak-item';
    item.setAttribute('role', 'listitem');
    item.dataset.id = report.id;

    item.innerHTML = `
      <div class="outbreak-item-header">
        <span class="district-name">
          ${escapeHtml(report.location.district)} District
        </span>
        <span class="severity-pill ${severityClass(severity)}">
          ${escapeHtml(severity)}
        </span>
      </div>

      <div class="outbreak-crop">
        ${escapeHtml(report.crop)} — ${escapeHtml(report.condition)}
      </div>

      <div class="outbreak-subcounty">
        ${escapeHtml(report.location.subcounty)}
      </div>

      <div class="confidence-bar-wrapper">
        <span class="confidence-label">AI confidence</span>
        <div class="confidence-bar">
          <div class="confidence-fill" style="width:${confidence}%"></div>
        </div>
        <span class="confidence-percent">${confidence}%</span>
      </div>

      <div class="outbreak-meta">
        <span>${escapeHtml(formattedTime)}</span>
      </div>

      <div class="outbreak-advice">${escapeHtml(report.advice)}</div>

      ${report.advice_luganda ? `
        <button type="button"
          class="outbreak-luganda-toggle"
          aria-expanded="false">
          View Luganda advice
        </button>
        <div class="outbreak-luganda-text" hidden>
          ${escapeHtml(report.advice_luganda)}
        </div>
      ` : ''}
    `;

    const toggle = item.querySelector('.outbreak-luganda-toggle');

    if (toggle) {
      const lugandaText = item.querySelector('.outbreak-luganda-text');

      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

        toggle.setAttribute('aria-expanded', String(!isExpanded));
        lugandaText.hidden = isExpanded;
        lugandaText.classList.toggle('visible', !isExpanded);
        toggle.textContent = isExpanded
          ? 'View Luganda advice'
          : 'Hide Luganda advice';
      });
    }

    container.appendChild(item);
  });

  updateMapMarkers();
}

function clearFilters() {
  ['district-filter', 'crop-filter', 'severity-filter'].forEach(id => {
    const dropdown = document.getElementById(id);
    if (dropdown) dropdown.value = 'all';
  });

  renderOutbreakFeed();
}

/* =========================================================
   GOOGLE MAP INITIALIZATION
   The Google Maps script calls this function.
   ========================================================= */

function initGoogleMap() {
  const mapElement = document.getElementById('google-map');
  const overlay = document.getElementById('map-loading-overlay');

  if (!mapElement || !window.google?.maps) {
    console.error('Google Maps could not be initialized.');
    if (overlay) {
      overlay.classList.remove('hidden');
      overlay.innerHTML = `
        <div class="map-overlay-title">Map unavailable</div>
        <div class="map-overlay-text">
          Check your Google Maps API key, enabled APIs, and billing settings.
        </div>
      `;
    }
    return;
  }

  cropMap = new google.maps.Map(mapElement, {
    center: { lat: 0.3476, lng: 32.5825 },
    zoom: 7,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
      {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'transit',
        stylers: [{ visibility: 'off' }]
      }
    ]
  });

  if (overlay) overlay.classList.add('hidden');

  // Data may have loaded before or after the map.
  if (allReports.length > 0) {
    placeMarkersFromReports();
  }
}

/* =========================================================
   MAP MARKERS
   ========================================================= */

function placeMarkersFromReports() {
  if (!cropMap || !window.google?.maps) return;

  // Remove old markers and info windows before rebuilding.
  cropMapMarkers.forEach(marker => marker.setMap(null));
  mapInfoWindows.forEach(infoWindow => infoWindow.close());

  cropMapMarkers = [];
  mapInfoWindows = [];

  allReports.forEach(report => {
    const lat = report.location.latitude;
    const lng = report.location.longitude;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.warn(
        `Skipping report "${report.id}": valid coordinates are missing.`,
        report
      );
      return;
    }

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: cropMap,
      title: `${report.crop} — ${report.location.district}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: markerColor(report.severity),
        fillOpacity: 0.95,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: report.severity === 'high' ? 10 : 8
      }
    });

    marker.reportData = report;

    const infoContent = `
      <div style="font-family:Arial,sans-serif;max-width:250px;padding:8px;color:#1f2937">
        <strong>${escapeHtml(report.location.district)} District</strong>
        <p><strong>${escapeHtml(report.crop)}</strong></p>
        <p>${escapeHtml(report.condition)}</p>
        <p>Severity: <strong>${escapeHtml(report.severity)}</strong></p>
        <p>Area: ${escapeHtml(report.location.subcounty)}</p>
        <p>AI confidence: ${Math.round(report.confidence * 100)}%</p>
        <p>${escapeHtml(report.advice)}</p>
        <p style="font-size:11px;color:#64748b;border-top:1px solid #e5e7eb;padding-top:6px">
          Demonstration data — not a verified outbreak.
        </p>
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
      content: infoContent
    });

    marker.addListener('click', () => {
      mapInfoWindows.forEach(windowItem => windowItem.close());
      infoWindow.open({ map: cropMap, anchor: marker });
    });

    cropMapMarkers.push(marker);
    mapInfoWindows.push(infoWindow);
  });

  updateMapMarkers();

  console.info(
    `Created ${cropMapMarkers.length} map marker(s) from ${allReports.length} report(s).`
  );
}

/* =========================================================
   KEEP MARKERS IN SYNC WITH FILTERS
   ========================================================= */

function updateMapMarkers() {
  if (!cropMap || cropMapMarkers.length === 0) return;

  const district = document.getElementById('district-filter')?.value ?? 'all';
  const crop = document.getElementById('crop-filter')?.value ?? 'all';
  const severity = document.getElementById('severity-filter')?.value ?? 'all';

  cropMapMarkers.forEach(marker => {
    const report = marker.reportData;

    const matchesDistrict =
      district === 'all' || report.location.district === district;

    const matchesCrop =
      crop === 'all' || report.crop === crop;

    const matchesSeverity =
      severity === 'all' || report.severity === severity;

    marker.setVisible(
      matchesDistrict && matchesCrop && matchesSeverity
    );
  });
}

/* =========================================================
   BACKEND SYNC
   ========================================================= */

async function syncBackend() {
  const button = document.getElementById('btn-fetch-backend');
  if (!button) return;

  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = 'Syncing...';
  button.classList.add('loading');

  try {
    const response = await fetch('http://localhost:8080/scans');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Accept either an array or an object containing a scans array.
    const scans = Array.isArray(data) ? data : data.scans;

    if (!Array.isArray(scans)) {
      throw new Error('Backend response must be an array or contain a scans array.');
    }

    allReports = scans.map(normalizeReport);

    updateKPIs();
    populateFilter('district-filter', allReports.map(r => r.location.district));
    populateFilter('crop-filter', allReports.map(r => r.crop));
    populateFilter('severity-filter', allReports.map(r => r.severity));

    renderOutbreakFeed();

    if (cropMap) {
      placeMarkersFromReports();
    }

    showToast(`Synced ${allReports.length} records from the backend.`, 'success');
  } catch (error) {
    console.error('Backend sync failed:', error);

    showToast(
      `Backend sync failed: ${error.message}. Demo data remains available if loaded.`,
      'error',
      6000
    );
  } finally {
    button.disabled = false;
    button.textContent = originalText;
    button.classList.remove('loading');
  }
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeDashboard() {
  document.getElementById('district-filter')
    ?.addEventListener('change', renderOutbreakFeed);

  document.getElementById('crop-filter')
    ?.addEventListener('change', renderOutbreakFeed);

  document.getElementById('severity-filter')
    ?.addEventListener('change', renderOutbreakFeed);

  document.getElementById('btn-fetch-backend')
    ?.addEventListener('click', syncBackend);

  loadOutbreakFeed();
}

// Google Maps may call initGoogleMap before or after this event.
document.addEventListener('DOMContentLoaded', initializeDashboard);
