(function () {
  'use strict';

  const API_BASE = "https://eagles-eye-api.onrender.com";
  const API_STORAGE_KEY = 'eagles_eye_live_api_base_v2';

  function resolveApiBase() {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromQuery = params.get('api');
      if (fromQuery) {
        const cleaned = fromQuery.replace(/\/+$/, '');
        localStorage.setItem(API_STORAGE_KEY, cleaned);
        return cleaned;
      }
      if (window.EAGLES_EYE_API_BASE) {
        return String(window.EAGLES_EYE_API_BASE).replace(/\/+$/, '');
      }
      const saved = localStorage.getItem(API_STORAGE_KEY);
      if (saved) {
        return saved.replace(/\/+$/, '');
      }
    } catch (_) {
      // ignore storage errors
    }
    return API_BASE;
  }

  const UGANDA_CENTER = { lat: 1.3733, lng: 32.2903 };
  const UGANDA_BOUNDS = {
    north: 4.5,
    south: -1.65,
    west: 29.2,
    east: 35.3
  };

  // Complete 54 Ugandan districts matching backend/districts.py
  const UGANDA_DISTRICTS = {
    Adjumani: { lat: 3.3760, lng: 31.7900 },
    Apac: { lat: 1.9760, lng: 32.5390 },
    Arua: { lat: 3.0200, lng: 30.9110 },
    Bududa: { lat: 1.0000, lng: 34.3333 },
    Bugiri: { lat: 0.5710, lng: 33.7490 },
    Buikwe: { lat: 0.3167, lng: 33.0167 },
    Bukomansimbi: { lat: -0.1500, lng: 31.6000 },
    Bundibugyo: { lat: 0.7130, lng: 30.0640 },
    Bushenyi: { lat: -0.5410, lng: 30.1840 },
    Busia: { lat: 0.4710, lng: 34.0910 },
    Gulu: { lat: 2.7746, lng: 32.2990 },
    Hoima: { lat: 1.4350, lng: 31.3524 },
    Ibanda: { lat: -0.1300, lng: 30.5000 },
    Iganga: { lat: 0.6090, lng: 33.4680 },
    Jinja: { lat: 0.4244, lng: 33.2042 },
    Kabale: { lat: -1.2490, lng: 29.9900 },
    Kabarole: { lat: 0.6710, lng: 30.2750 },
    Kampala: { lat: 0.3476, lng: 32.5825 },
    Kamuli: { lat: 0.9470, lng: 33.1200 },
    Kapchorwa: { lat: 1.4000, lng: 34.4500 },
    Kasese: { lat: 0.1830, lng: 30.0880 },
    Kayunga: { lat: 0.7020, lng: 32.8890 },
    Kiboga: { lat: 0.9167, lng: 31.7667 },
    Kisoro: { lat: -1.2850, lng: 29.6850 },
    Kitgum: { lat: 3.2780, lng: 32.8870 },
    Kumi: { lat: 1.4600, lng: 33.9360 },
    Kyenjojo: { lat: 0.6290, lng: 30.6410 },
    Kyotera: { lat: -0.6333, lng: 31.5167 },
    Lira: { lat: 2.2499, lng: 32.8998 },
    Luwero: { lat: 0.8490, lng: 32.4730 },
    Lwengo: { lat: -0.4167, lng: 31.4000 },
    Lyantonde: { lat: -0.4017, lng: 31.1583 },
    Masaka: { lat: -0.3411, lng: 31.7361 },
    Masindi: { lat: 1.6744, lng: 31.7150 },
    Mayuge: { lat: 0.4590, lng: 33.4800 },
    Mbale: { lat: 1.0784, lng: 34.1754 },
    Mbarara: { lat: -0.6072, lng: 30.6545 },
    Mityana: { lat: 0.4167, lng: 32.0333 },
    Moroto: { lat: 2.5340, lng: 34.6660 },
    Mpigi: { lat: 0.2260, lng: 32.3140 },
    Mubende: { lat: 0.5833, lng: 31.3667 },
    Mukono: { lat: 0.3549, lng: 32.7523 },
    Nakaseke: { lat: 0.7333, lng: 32.4167 },
    Nakasongola: { lat: 1.3167, lng: 32.4667 },
    Nebbi: { lat: 2.4780, lng: 31.0890 },
    Ntungamo: { lat: -0.8794, lng: 30.2639 },
    Pallisa: { lat: 1.1450, lng: 33.7090 },
    Rakai: { lat: -0.7167, lng: 31.4167 },
    Rukungiri: { lat: -0.8417, lng: 29.9417 },
    Sironko: { lat: 1.2300, lng: 34.2500 },
    Soroti: { lat: 1.7150, lng: 33.6110 },
    Ssembabule: { lat: -0.0750, lng: 31.4600 },
    Tororo: { lat: 0.6928, lng: 34.1810 },
    Wakiso: { lat: 0.4044, lng: 32.4594 }
  };

  const PERIOD_OPTIONS = ['Last 30 days', 'Last 7 days', 'Today'];

  const state = {
    apiBase: resolveApiBase(),
    syncState: 'loading', // 'loading' | 'online' | 'offline'
    storageMode: null,
    activeNav: 'overview',
    cropIdx: 0,
    diseaseIdx: 0,
    periodIdx: 0,
    liveReports: [],
    districtFilteredReports: null,
    latestTopId: null,
    pollTimer: null,
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

  function severityRank(sev) {
    const s = String(sev || '').toLowerCase();
    if (s === 'high') return 3;
    if (s === 'moderate') return 2;
    if (s === 'low') return 1;
    return 0;
  }

  function updateHeaderClock() {
    const now = new Date();
    const dateEl = document.getElementById('header-date');
    const titleEl = document.getElementById('header-title');
    if (dateEl) {
      dateEl.textContent = now
        .toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
        .toUpperCase();
    }
    if (titleEl) {
      const hr = now.getHours();
      const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
      titleEl.textContent = `${greeting}, Amina`;
    }
  }

  function hideMapLoading() {
    const loader = document.getElementById('map-loading');
    if (loader) loader.hidden = true;
  }

  // =========================================================
  // PERIOD, CROP & DISEASE FILTERING + LIVE AGGREGATION
  // =========================================================
  function isWithinPeriod(isoTimestamp, periodLabel) {
    if (!isoTimestamp) return true;
    const ts = new Date(isoTimestamp).getTime();
    if (Number.isNaN(ts)) return true;
    const ageMs = Date.now() - ts;
    if (periodLabel === 'Today') {
      return ageMs <= 24 * 3600 * 1000;
    }
    if (periodLabel === 'Last 7 days') {
      return ageMs <= 7 * 24 * 3600 * 1000;
    }
    return ageMs <= 30 * 24 * 3600 * 1000;
  }

  function getCropOptions() {
    const unique = [
      ...new Set(
        state.liveReports
          .map((r) => r.crop)
          .filter((c) => c && c !== 'Unknown')
      )
    ];
    return ['All crops', ...unique];
  }

  function getDiseaseOptions() {
    const unique = [
      ...new Set(
        state.liveReports
          .filter((r) => !r.isHealthy && r.severity !== 'none' && r.severity !== 'healthy')
          .map((r) => r.condition)
          .filter(Boolean)
      )
    ];
    return ['All diseases', ...unique];
  }

  function computeLiveThreats() {
    const diseased = state.liveReports.filter(
      (r) => !r.isHealthy && r.severity !== 'none' && r.severity !== 'healthy'
    );
    const groups = new Map();

    diseased.forEach((r) => {
      const key = `${r.condition.toLowerCase()}|${r.crop.toLowerCase()}`;
      if (!groups.has(key)) {
        groups.set(key, {
          disease: r.condition,
          crop: r.crop,
          scans30d: 0,
          scans7d: 0,
          scansToday: 0,
          highCount: 0,
          total: 0
        });
      }
      const g = groups.get(key);
      g.total += 1;
      if (r.severity === 'high') g.highCount += 1;
      if (isWithinPeriod(r.timestamp, 'Last 30 days')) g.scans30d += 1;
      if (isWithinPeriod(r.timestamp, 'Last 7 days')) g.scans7d += 1;
      if (isWithinPeriod(r.timestamp, 'Today')) g.scansToday += 1;
    });

    return [...groups.values()]
      .sort((a, b) => b.total - a.total)
      .map((g, index) => {
        const highPct = Math.round((g.highCount / Math.max(1, g.total)) * 100);
        return {
          rank: index + 1,
          disease: g.disease,
          crop: g.crop,
          scans30d: g.scans30d || g.total,
          scans7d: g.scans7d,
          scansToday: g.scansToday,
          trend: highPct > 0 ? `${highPct}% high` : 'Active',
          trendClass: highPct >= 40 ? 'up' : ''
        };
      });
  }

  function getFilteredHotspots() {
    if (state.syncState !== 'online' || state.liveReports.length === 0) {
      return [];
    }

    const crops = getCropOptions();
    const diseases = getDiseaseOptions();
    const selectedCrop = crops[state.cropIdx] || 'All crops';
    const selectedDisease = diseases[state.diseaseIdx] || 'All diseases';
    const selectedPeriod = PERIOD_OPTIONS[state.periodIdx] || 'Last 30 days';

    const periodScans = state.liveReports.filter((r) => isWithinPeriod(r.timestamp, selectedPeriod));
    const byDistrict = new Map();

    periodScans.forEach((r) => {
      if (!Number.isFinite(r.latitude) || !Number.isFinite(r.longitude)) return;
      const cropOk = selectedCrop === 'All crops' || r.crop.toLowerCase().includes(selectedCrop.toLowerCase());
      const disOk = selectedDisease === 'All diseases' || r.condition.toLowerCase().includes(selectedDisease.toLowerCase());
      if (!cropOk || !disOk) return;

      const key = r.district.toLowerCase();
      if (!byDistrict.has(key)) {
        byDistrict.set(key, {
          district: r.district,
          lat: r.latitude,
          lng: r.longitude,
          crop: r.crop,
          disease: r.condition,
          severity: r.severity,
          scans: 0,
          weight: 1,
          summary: r.advice
        });
      }

      const entry = byDistrict.get(key);
      entry.scans += 1;
      if (severityRank(r.severity) > severityRank(entry.severity)) {
        entry.severity = r.severity;
        entry.crop = r.crop;
        entry.disease = r.condition;
        if (r.advice) entry.summary = r.advice;
      }
      entry.weight = Math.min(
        6,
        1.3 + entry.scans * 0.45 + (entry.severity === 'high' ? 1.6 : entry.severity === 'moderate' ? 0.8 : 0.2)
      );
    });

    return [...byDistrict.values()];
  }

  function buildPopupHtml(spot) {
    return `<div class="ug-info-popup">
      <strong>${escapeHtml(spot.district)} District</strong>
      <div class="ug-pop-crop">${escapeHtml(spot.crop)} · ${escapeHtml(spot.disease)} (${escapeHtml(spot.severity)})</div>
      <p>${escapeHtml(spot.scans)} confirmed scan${spot.scans === 1 ? '' : 's'}. ${escapeHtml(spot.summary)}</p>
    </div>`;
  }

  // =========================================================
  // KPI CARDS & LIVE INDICATOR (STRICTLY REAL API DATA)
  // =========================================================
  function renderLiveStatusBadge() {
    const liveEl = document.getElementById('live-indicator');
    if (!liveEl) return;

    if (state.syncState === 'loading') {
      liveEl.classList.add('is-offline');
      liveEl.innerHTML = '<i></i> Connecting...';
    } else if (state.syncState === 'online') {
      liveEl.classList.remove('is-offline');
      const count = state.liveReports.length;
      liveEl.innerHTML = `<i></i> Live API · ${count} scan${count === 1 ? '' : 's'}`;
    } else {
      liveEl.classList.add('is-offline');
      liveEl.innerHTML = '<i></i> API unreachable';
    }
  }

  function renderKpiStats() {
    const elScans = document.getElementById('stat-scans');
    const elScansSub = document.getElementById('stat-scans-sub');
    const elOutbreaks = document.getElementById('stat-outbreaks');
    const elOutbreaksSub = document.getElementById('stat-outbreaks-sub');
    const elDistricts = document.getElementById('stat-districts');
    const elDistrictsSub = document.getElementById('stat-districts-sub');
    const elDisease = document.getElementById('stat-disease');
    const elDiseaseSub = document.getElementById('stat-disease-sub');

    if (state.syncState === 'loading') {
      elScans.textContent = '…';
      elScansSub.textContent = 'Syncing live API...';
      elOutbreaks.textContent = '…';
      elOutbreaksSub.textContent = 'Syncing live API...';
      elDistricts.textContent = '…';
      elDistrictsSub.textContent = 'of 146 districts';
      elDisease.textContent = '…';
      elDiseaseSub.textContent = 'Syncing live API...';
      return;
    }

    if (state.syncState === 'offline') {
      elScans.textContent = '—';
      elScansSub.textContent = 'Server unreachable';
      elOutbreaks.textContent = '—';
      elOutbreaksSub.textContent = 'Check connection';
      elDistricts.textContent = '—';
      elDistrictsSub.textContent = 'of 146 districts';
      elDisease.textContent = 'Offline';
      elDiseaseSub.textContent = 'Click Sync live API';
      return;
    }

    const total = state.liveReports.length;
    if (total === 0) {
      elScans.textContent = '0';
      elScansSub.textContent = `0 total (${state.storageMode || 'API'})`;
      elOutbreaks.textContent = '0';
      elOutbreaksSub.textContent = '0 high severity';
      elDistricts.textContent = '0';
      elDistrictsSub.textContent = 'of 146 districts';
      elDisease.textContent = 'No outbreaks';
      elDiseaseSub.textContent = '0 diagnoses recorded';
      return;
    }

    const weekCount = state.liveReports.filter((r) => isWithinPeriod(r.timestamp, 'Last 7 days')).length;
    const diseased = state.liveReports.filter(
      (r) => !r.isHealthy && r.severity !== 'none' && r.severity !== 'healthy'
    );
    const highCount = diseased.filter((r) => r.severity === 'high').length;

    const clusterSet = new Set(
      diseased.map((r) => `${r.district.toLowerCase()}|${r.condition.toLowerCase()}`)
    );
    const districtSet = new Set(
      diseased
        .map((r) => r.district)
        .filter((d) => d && d.toLowerCase() !== 'unknown')
    );

    const condCounts = new Map();
    diseased.forEach((r) => {
      condCounts.set(r.condition, (condCounts.get(r.condition) || 0) + 1);
    });

    let topDisease = 'Healthy foliage';
    let topDiseaseCount = total - diseased.length;
    if (condCounts.size > 0) {
      topDiseaseCount = 0;
      condCounts.forEach((cnt, name) => {
        if (cnt > topDiseaseCount) {
          topDisease = name;
          topDiseaseCount = cnt;
        }
      });
    }
    const topPct = Math.round((topDiseaseCount / Math.max(1, total)) * 100);

    elScans.textContent = weekCount.toLocaleString();
    elScansSub.textContent = `${total} total (${state.storageMode || 'API'})`;

    elOutbreaks.textContent = String(clusterSet.size);
    elOutbreaksSub.textContent = `${highCount} high severity`;

    elDistricts.textContent = String(districtSet.size);
    elDistrictsSub.textContent = 'of 146 districts';

    elDisease.textContent = topDisease;
    elDisease.title = topDisease;
    elDiseaseSub.textContent = `${topPct}% of diagnoses`;
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

      if (spots.length > 0 && google.maps.visualization?.HeatmapLayer) {
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
  // THREATS, REPORTS & LIVE RENDER API SYNC (GET / & GET /scans)
  // =========================================================
  function normalizeReport(raw, idx) {
    const loc = raw.location || {};
    const districtName = String(loc.district || raw.district || 'Unknown');
    const knownCoords = UGANDA_DISTRICTS[districtName] || null;
    const rawLat = Number(loc.latitude ?? raw.latitude ?? knownCoords?.lat);
    const rawLng = Number(loc.longitude ?? raw.longitude ?? knownCoords?.lng);
    const isHealthy = Boolean(raw.is_healthy);
    const rawSev = String(raw.severity || (isHealthy ? 'healthy' : 'moderate')).toLowerCase();

    return {
      id: raw.id || `scan-${idx + 1}`,
      crop: String(raw.crop || 'Unknown'),
      condition: String(raw.condition || 'Unspecified condition'),
      confidence: Number(raw.confidence ?? 0.9),
      severity: isHealthy || rawSev === 'none' ? 'healthy' : rawSev,
      isHealthy,
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
    const crops = getCropOptions();
    const diseases = getDiseaseOptions();
    if (state.cropIdx >= crops.length) state.cropIdx = 0;
    if (state.diseaseIdx >= diseases.length) state.diseaseIdx = 0;

    const selectedCrop = crops[state.cropIdx];
    const selectedDisease = diseases[state.diseaseIdx];
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

    const listEl = document.getElementById('threat-list');

    if (state.syncState === 'loading') {
      listEl.innerHTML =
        '<li><b>…</b><div><strong>Syncing live database...</strong><span>Fetching confirmed scans from Eagles Eye API</span></div><em>—</em></li>';
      renderMapLayers();
      return;
    }

    if (state.syncState === 'offline') {
      listEl.innerHTML =
        '<li><b>!</b><div><strong>Could not reach live API</strong><span>Open Reports or Settings to retry connection</span></div><em>Offline</em></li>';
      renderMapLayers();
      return;
    }

    const sourceThreats = computeLiveThreats();
    if (sourceThreats.length === 0) {
      listEl.innerHTML =
        '<li><b>0</b><div><strong>No active disease threats</strong><span>0 diseased scans recorded in database</span></div><em>0</em></li>';
      renderMapLayers();
      return;
    }

    const filtered = sourceThreats.filter((t) => {
      const cropMatch = selectedCrop === 'All crops' || t.crop.toLowerCase().includes(selectedCrop.toLowerCase());
      const disMatch = selectedDisease === 'All diseases' || t.disease.toLowerCase().includes(selectedDisease.toLowerCase());
      return cropMatch && disMatch;
    });

    if (filtered.length === 0) {
      listEl.innerHTML =
        '<li><b>–</b><div><strong>No matching threats</strong><span>Click filter buttons to reset</span></div><em>0</em></li>';
    } else {
      listEl.innerHTML = filtered
        .slice(0, 8)
        .map((item, idx) => {
          const count = getPeriodScans(item);
          const emClass = item.trendClass ? ` class="${item.trendClass}"` : '';
          return `<li>
            <b>${idx + 1}</b>
            <div>
              <strong>${escapeHtml(item.disease)}</strong>
              <span>${escapeHtml(item.crop)} · ${count} scan${count === 1 ? '' : 's'}</span>
            </div>
            <em${emClass}>${escapeHtml(item.trend)}</em>
          </li>`;
        })
        .join('');
    }

    renderMapLayers();
  }

  function refreshAllDashboardViews() {
    renderLiveStatusBadge();
    renderKpiStats();
    populateReportFilters();
    renderNotifications();
    renderReportsView();
    renderThreatsAndPins();
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

  async function fetchJsonWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      window.clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      window.clearTimeout(timer);
      throw err;
    }
  }

  async function fetchLiveScansFromBackend() {
    const [healthOutcome, scansOutcome] = await Promise.allSettled([
      fetchJsonWithTimeout(`${state.apiBase}/`, 45000),
      fetchJsonWithTimeout(`${state.apiBase}/scans?limit=200`, 45000)
    ]);

    if (healthOutcome.status === 'fulfilled' && healthOutcome.value) {
      state.storageMode = healthOutcome.value.storage || 'firestore';
    }

    if (scansOutcome.status === 'fulfilled' && scansOutcome.value) {
      const payload = scansOutcome.value;
      const scans = Array.isArray(payload) ? payload : payload.scans;
      if (Array.isArray(scans)) {
        state.syncState = 'online';
        const mapped = scans.map(normalizeReport);
        const newestId = mapped[0]?.id || null;
        const hasDiseased = mapped.some((r) => !r.isHealthy && r.severity !== 'healthy');

        const notifDot = document.getElementById('notif-dot');
        if (notifDot) {
          if (state.latestTopId && newestId && newestId !== state.latestTopId) {
            notifDot.hidden = false;
          } else if (!state.latestTopId && hasDiseased) {
            notifDot.hidden = false;
          }
        }
        if (newestId) {
          state.latestTopId = newestId;
        }

        state.liveReports = mapped;
        state.districtFilteredReports = null;
        refreshAllDashboardViews();
        return true;
      }
    }

    state.syncState = 'offline';
    refreshAllDashboardViews();
    return false;
  }

  async function fetchDistrictScansIfOnline(district) {
    if (state.syncState !== 'online' || !district || district === 'all') {
      state.districtFilteredReports = null;
      renderReportsView();
      return;
    }

    try {
      const payload = await fetchJsonWithTimeout(
        `${state.apiBase}/scans?district=${encodeURIComponent(district)}&limit=200`,
        45000
      );
      const scans = Array.isArray(payload) ? payload : payload.scans;
      if (Array.isArray(scans)) {
        state.districtFilteredReports = scans.map(normalizeReport);
      }
    } catch (_) {
      state.districtFilteredReports = null;
    }
    renderReportsView();
  }

  async function syncBackendExplicit() {
    const btn = document.getElementById('btn-sync-backend');
    btn.disabled = true;
    btn.textContent = 'Syncing...';

    const ok = await fetchLiveScansFromBackend();
    if (ok) {
      btn.textContent = `Synced (${state.liveReports.length})`;
    } else {
      btn.textContent = 'Connection failed';
    }

    window.setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Sync live API';
    }, 2400);
  }

  function populateSelect(selectId, items, defaultLabel) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const prev = sel.value;
    const unique = [...new Set(items.filter(Boolean))].sort();
    sel.innerHTML =
      `<option value="all">${escapeHtml(defaultLabel)}</option>` +
      unique.map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
    if (unique.includes(prev)) sel.value = prev;
  }

  function populateReportFilters() {
    const pool = state.liveReports;
    populateSelect('rep-filter-district', pool.map((r) => r.district), 'All districts');
    populateSelect('rep-filter-crop', pool.map((r) => r.crop), 'All crops');
    populateSelect('rep-filter-severity', pool.map((r) => r.severity), 'All severities');
  }

  function formatScanTimestamp(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return ' · ' + d.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  function renderReportsView() {
    const listEl = document.getElementById('reports-list');
    const countEl = document.getElementById('reports-count-text');
    if (!listEl || !countEl) return;

    if (state.syncState === 'loading') {
      countEl.textContent = `Connecting to ${state.apiBase}...`;
      listEl.innerHTML =
        '<div class="report-row"><p class="report-meta">Syncing live field diagnostic reports from the Eagles Eye database...</p></div>';
      return;
    }

    if (state.syncState === 'offline') {
      countEl.textContent = `Unable to reach ${state.apiBase}`;
      listEl.innerHTML =
        '<div class="report-row"><p class="report-meta">Could not connect to the live Eagles Eye API. Check your internet connection or click "Sync live API" to retry.</p></div>';
      return;
    }

    const totalCount = state.liveReports.length;
    if (totalCount === 0) {
      countEl.textContent = `Connected to live API (${state.storageMode || 'firestore'}) · 0 scans recorded yet`;
      listEl.innerHTML =
        '<div class="report-row"><p class="report-meta">Live database is online with 0 crop scans recorded so far. Upload a leaf photo in the Farmer App to see it appear here in real time.</p></div>';
      return;
    }

    const fDist = document.getElementById('rep-filter-district')?.value || 'all';
    const fCrop = document.getElementById('rep-filter-crop')?.value || 'all';
    const fSev = document.getElementById('rep-filter-severity')?.value || 'all';

    const basePool =
      fDist !== 'all' && Array.isArray(state.districtFilteredReports)
        ? state.districtFilteredReports
        : state.liveReports;

    const matches = basePool.filter((r) => {
      return (
        (fDist === 'all' || r.district === fDist) &&
        (fCrop === 'all' || r.crop === fCrop) &&
        (fSev === 'all' || r.severity === fSev)
      );
    });

    countEl.textContent = `Showing ${matches.length} of ${totalCount} live district reports (${state.storageMode || 'API'})`;

    if (matches.length === 0) {
      listEl.innerHTML =
        '<div class="report-row"><p class="report-meta">No matching reports for the selected filters.</p></div>';
      return;
    }

    listEl.innerHTML = matches
      .map((r) => {
        const conf = Math.round((r.confidence || 0) * 100);
        const area = r.subcounty ? `${r.district} · ${r.subcounty}` : `${r.district} District`;
        const timePart = formatScanTimestamp(r.timestamp);
        return `<article class="report-row">
          <div class="report-row-top">
            <strong>${escapeHtml(r.crop)} — ${escapeHtml(r.condition)}</strong>
            <span class="sev-badge ${escapeHtml(r.severity)}">${escapeHtml(r.severity)}</span>
          </div>
          <div class="report-meta">${escapeHtml(area)} · AI confidence ${conf}%${escapeHtml(timePart)}</div>
          <p class="report-advice">${escapeHtml(r.advice)}</p>
          ${r.advice_luganda ? `<p class="report-luganda">Luganda: ${escapeHtml(r.advice_luganda)}</p>` : ''}
        </article>`;
      })
      .join('');
  }

  function renderNotifications() {
    const notifList = document.getElementById('notif-list');
    if (!notifList) return;

    if (state.syncState === 'loading') {
      notifList.innerHTML =
        '<div class="notif-item"><b>Syncing live alerts...</b><small>Connecting to Eagles Eye API</small></div>';
      return;
    }

    if (state.syncState === 'offline') {
      notifList.innerHTML =
        '<div class="notif-item"><b>Live API unreachable</b><small>Click Sync live API to reconnect</small></div>';
      return;
    }

    const diseased = state.liveReports.filter((r) => !r.isHealthy && r.severity !== 'healthy');
    const source = diseased.length > 0 ? diseased.slice(0, 5) : state.liveReports.slice(0, 5);

    if (source.length === 0) {
      notifList.innerHTML =
        '<div class="notif-item"><b>No district alerts yet</b><small>0 crop scans recorded in live database</small></div>';
      return;
    }

    notifList.innerHTML = source
      .map(
        (item) => `<div class="notif-item">
          <b>${escapeHtml(item.district)} · ${escapeHtml(item.condition)}</b>
          <small>${escapeHtml(item.crop)} (${escapeHtml(item.severity)} severity)${escapeHtml(formatScanTimestamp(item.timestamp))}</small>
        </div>`
      )
      .join('');
  }

  async function checkApiHealth() {
    const pill = document.getElementById('api-health-pill');
    const titleEl = document.getElementById('api-setting-title');
    const inputEl = document.getElementById('input-api-base');
    if (titleEl) titleEl.textContent = `Backend API (${state.apiBase})`;
    if (inputEl && !inputEl.value) inputEl.value = state.apiBase;
    if (!pill) return;

    pill.textContent = 'Checking live API status...';
    pill.classList.remove('online');

    try {
      const info = await fetchJsonWithTimeout(`${state.apiBase}/`, 45000);
      state.syncState = 'online';
      state.storageMode = info.storage || 'firestore';
      pill.textContent = `Online · Storage: ${state.storageMode} · v${info.version || '1.0.0'}`;
      pill.classList.add('online');
      renderLiveStatusBadge();
      return;
    } catch (_) {
      state.syncState = 'offline';
    }
    pill.textContent = 'Unreachable · Check connection or Render service status';
    renderLiveStatusBadge();
  }

  function downloadReportCsv() {
    const rows = [
      ['Section', 'Rank/ID', 'District/Crop', 'Condition', 'Scans/Confidence', 'Trend/Severity', 'Timestamp']
    ];

    const threats = computeLiveThreats();
    threats.forEach((t) => {
      rows.push([
        'Top Threat',
        String(t.rank),
        t.crop,
        t.disease,
        `${getPeriodScans(t)} scans`,
        t.trend,
        ''
      ]);
    });

    state.liveReports.forEach((r) => {
      rows.push([
        'Field Report',
        r.id,
        `${r.district} (${r.crop})`,
        r.condition,
        `${Math.round((r.confidence || 0) * 100)}%`,
        r.severity,
        r.timestamp || ''
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
    link.download = 'eagles-eye-live-outbreak-report.csv';
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
      const crops = getCropOptions();
      state.cropIdx = (state.cropIdx + 1) % crops.length;
      renderThreatsAndPins();
    });
    document.getElementById('filter-disease').addEventListener('click', () => {
      const diseases = getDiseaseOptions();
      state.diseaseIdx = (state.diseaseIdx + 1) % diseases.length;
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

    document.getElementById('rep-filter-district')?.addEventListener('change', (e) => {
      fetchDistrictScansIfOnline(e.target.value);
    });
    ['rep-filter-crop', 'rep-filter-severity'].forEach((id) => {
      document.getElementById(id)?.addEventListener('change', renderReportsView);
    });

    document.getElementById('btn-sync-backend').addEventListener('click', syncBackendExplicit);
    document.getElementById('btn-check-health').addEventListener('click', checkApiHealth);

    const inputApiBase = document.getElementById('input-api-base');
    const btnSaveApi = document.getElementById('btn-save-api');
    if (inputApiBase) {
      inputApiBase.value = state.apiBase;
    }
    btnSaveApi?.addEventListener('click', async () => {
      const raw = (inputApiBase?.value || '').trim().replace(/\/+$/, '');
      const nextUrl = raw || API_BASE;
      state.apiBase = nextUrl;
      state.syncState = 'loading';
      refreshAllDashboardViews();
      try {
        localStorage.setItem(API_STORAGE_KEY, nextUrl);
      } catch (_) {
        // ignore
      }
      await checkApiHealth();
      await fetchLiveScansFromBackend();
    });

    // Live background sync when extension officer keeps dashboard open
    state.pollTimer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchLiveScansFromBackend();
      }
    }, 20000);

    window.addEventListener('focus', () => {
      fetchLiveScansFromBackend();
    });
  }

  function init() {
    updateHeaderClock();
    bindEvents();
    refreshAllDashboardViews();
    fetchLiveScansFromBackend();

    const mapContainer = document.getElementById('uganda-real-map');
    if (mapContainer && 'ResizeObserver' in window) {
      let resizeTimer = null;
      const observer = new ResizeObserver(() => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(refreshMapViewport, 120);
      });
      observer.observe(mapContainer);
    }

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
