(function () {
  'use strict';

  function resolveApiBase() {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromQuery = params.get('api');
      if (fromQuery) {
        const cleaned = fromQuery.replace(/\/+$/, '');
        localStorage.setItem('eagles_eye_api_base', cleaned);
        return cleaned;
      }
      if (window.EAGLES_EYE_API_BASE) {
        return String(window.EAGLES_EYE_API_BASE).replace(/\/+$/, '');
      }
      const saved = localStorage.getItem('eagles_eye_api_base');
      if (saved) {
        return saved.replace(/\/+$/, '');
      }
    } catch (_) {
      // ignore storage errors
    }

    const host = window.location.hostname;
    if (
      host &&
      (host === 'localhost' ||
        host === '127.0.0.1' ||
        /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host))
    ) {
      const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';
      return `${proto}//${host}:8080`;
    }
    return 'http://localhost:8080';
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

  // Offline / pre-scan surveillance baseline (used when backend is offline or has 0 scans yet)
  const BASELINE_HOTSPOTS = [
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

  const BASELINE_THREATS = [
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

  const DEFAULT_CROPS = ['All crops', 'Cassava', 'Maize', 'Banana', 'Coffee'];
  const DEFAULT_DISEASES = ['All diseases', 'Cassava mosaic', 'Fall armyworm', 'Banana wilt', 'Coffee leaf rust'];
  const PERIOD_OPTIONS = ['Last 30 days', 'Last 7 days', 'Today'];

  const state = {
    apiBase: resolveApiBase(),
    backendOnline: false,
    storageMode: null,
    activeNav: 'overview',
    cropIdx: 0,
    diseaseIdx: 0,
    periodIdx: 0,
    seedReports: [],
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

  function hasLiveScans() {
    return state.backendOnline && state.liveReports.length > 0;
  }

  function activeReports() {
    if (hasLiveScans()) return state.liveReports;
    if (state.backendOnline && state.liveReports.length === 0) return [];
    return state.seedReports;
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
    if (!isoTimestamp || periodLabel === 'Last 30 days') {
      if (!isoTimestamp) return true;
      const ms = Date.now() - new Date(isoTimestamp).getTime();
      return Number.isNaN(ms) ? true : ms <= 30 * 24 * 3600 * 1000;
    }
    const ts = new Date(isoTimestamp).getTime();
    if (Number.isNaN(ts)) return true;
    const ageMs = Date.now() - ts;
    if (periodLabel === 'Today') {
      return ageMs <= 24 * 3600 * 1000;
    }
    if (periodLabel === 'Last 7 days') {
      return ageMs <= 7 * 24 * 3600 * 1000;
    }
    return true;
  }

  function getCropOptions() {
    if (!hasLiveScans()) return DEFAULT_CROPS;
    const unique = [...new Set(state.liveReports.map((r) => r.crop).filter((c) => c && c !== 'Unknown'))];
    return ['All crops', ...unique];
  }

  function getDiseaseOptions() {
    if (!hasLiveScans()) return DEFAULT_DISEASES;
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
    const crops = getCropOptions();
    const diseases = getDiseaseOptions();
    const selectedCrop = crops[state.cropIdx] || 'All crops';
    const selectedDisease = diseases[state.diseaseIdx] || 'All diseases';
    const selectedPeriod = PERIOD_OPTIONS[state.periodIdx] || 'Last 30 days';

    // When connected to backend with real/seeded scans, build district map directly from GET /scans
    if (hasLiveScans()) {
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

    // Offline / pre-scan fallback: merge baseline hotspots with seed_data.json
    const byDistrict = new Map();
    BASELINE_HOTSPOTS.forEach((h) => byDistrict.set(h.district.toLowerCase(), { ...h }));

    state.seedReports.forEach((r) => {
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
      <p>${escapeHtml(spot.scans)} confirmed scan${spot.scans === 1 ? '' : 's'}. ${escapeHtml(spot.summary)}</p>
    </div>`;
  }

  // =========================================================
  // KPI CARDS & LIVE INDICATOR
  // =========================================================
  function renderLiveStatusBadge() {
    const liveEl = document.getElementById('live-indicator');
    if (!liveEl) return;

    if (hasLiveScans()) {
      liveEl.classList.remove('is-seed');
      liveEl.innerHTML = `<i></i> Live API · ${state.liveReports.length} scan${state.liveReports.length === 1 ? '' : 's'}`;
    } else if (state.backendOnline) {
      liveEl.classList.remove('is-seed');
      liveEl.innerHTML = `<i></i> Live API · Ready`;
    } else {
      liveEl.classList.add('is-seed');
      liveEl.innerHTML = `<i></i> Seed data (offline)`;
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

    if (!hasLiveScans()) {
      elScans.textContent = '2,847';
      elScansSub.textContent = state.backendOnline ? 'Awaiting first live scan' : '+12.4%';
      elOutbreaks.textContent = '12';
      elOutbreaksSub.textContent = '+3 this week';
      elDistricts.textContent = '18';
      elDistrictsSub.textContent = 'of 146 districts';
      elDisease.textContent = 'Cassava mosaic';
      elDiseaseSub.textContent = '38% of diagnoses';
      return;
    }

    const total = state.liveReports.length;
    const weekCount = state.liveReports.filter((r) => isWithinPeriod(r.timestamp, 'Last 7 days')).length || total;
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
    condCounts.forEach((cnt, name) => {
      if (cnt > topDiseaseCount || topDisease === 'Healthy foliage') {
        if (cnt > (condCounts.get(topDisease) || 0)) {
          topDisease = name;
          topDiseaseCount = cnt;
        }
      }
    });
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
  // THREATS, REPORTS & BACKEND API SYNC (GET / & GET /scans)
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

    const sourceThreats = hasLiveScans() ? computeLiveThreats() : BASELINE_THREATS;
    const filtered = sourceThreats.filter((t) => {
      const cropMatch = selectedCrop === 'All crops' || t.crop.toLowerCase().includes(selectedCrop.toLowerCase());
      const disMatch = selectedDisease === 'All diseases' || t.disease.toLowerCase().includes(selectedDisease.toLowerCase());
      return cropMatch && disMatch;
    });

    const listEl = document.getElementById('threat-list');
    if (filtered.length === 0) {
      listEl.innerHTML = `<li><b>–</b><div><strong>No matching threats</strong><span>Click filter buttons to reset</span></div><em>0</em></li>`;
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

  async function loadInitialReports() {
    try {
      const res = await fetch('./seed_data.json', { cache: 'no-store' });
      if (res.ok) {
        const arr = await res.json();
        if (Array.isArray(arr)) {
          state.seedReports = arr.map(normalizeReport);
        }
      }
    } catch (_) {
      // ignore if opened via file://
    }

    refreshAllDashboardViews();
    await fetchLiveScansFromBackend();
  }

  async function fetchLiveScansFromBackend() {
    try {
      const healthCtrl = new AbortController();
      const healthTimer = window.setTimeout(() => healthCtrl.abort(), 3000);
      const healthRes = await fetch(`${state.apiBase}/`, { signal: healthCtrl.signal });
      window.clearTimeout(healthTimer);
      if (healthRes.ok) {
        const info = await healthRes.json();
        state.backendOnline = true;
        state.storageMode = info.storage || 'active';
      }
    } catch (_) {
      state.backendOnline = false;
    }

    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 5000);
      const liveRes = await fetch(`${state.apiBase}/scans?limit=200`, { signal: controller.signal });
      window.clearTimeout(timer);

      if (liveRes.ok) {
        const payload = await liveRes.json();
        const scans = Array.isArray(payload) ? payload : payload.scans;
        if (Array.isArray(scans)) {
          state.backendOnline = true;
          const mapped = scans.map(normalizeReport);
          const newestId = mapped[0]?.id || null;

          if (state.latestTopId && newestId && newestId !== state.latestTopId) {
            const notifDot = document.getElementById('notif-dot');
            if (notifDot) notifDot.hidden = false;
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
    } catch (_) {
      state.backendOnline = false;
    }

    refreshAllDashboardViews();
    return false;
  }

  async function fetchDistrictScansIfOnline(district) {
    if (!state.backendOnline || !district || district === 'all') {
      state.districtFilteredReports = null;
      renderReportsView();
      return;
    }

    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 4500);
      const res = await fetch(
        `${state.apiBase}/scans?district=${encodeURIComponent(district)}&limit=200`,
        { signal: controller.signal }
      );
      window.clearTimeout(timer);
      if (res.ok) {
        const payload = await res.json();
        const scans = Array.isArray(payload) ? payload : payload.scans;
        if (Array.isArray(scans)) {
          state.districtFilteredReports = scans.map(normalizeReport);
        }
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
      btn.textContent = 'Offline (seed data)';
    }

    window.setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Sync live API';
    }, 2200);
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
    const pool = activeReports();
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
    if (!listEl) return;

    const fDist = document.getElementById('rep-filter-district')?.value || 'all';
    const fCrop = document.getElementById('rep-filter-crop')?.value || 'all';
    const fSev = document.getElementById('rep-filter-severity')?.value || 'all';

    const basePool =
      fDist !== 'all' && Array.isArray(state.districtFilteredReports)
        ? state.districtFilteredReports
        : activeReports();

    const matches = basePool.filter((r) => {
      return (
        (fDist === 'all' || r.district === fDist) &&
        (fCrop === 'all' || r.crop === fCrop) &&
        (fSev === 'all' || r.severity === fSev)
      );
    });

    const totalCount = activeReports().length;
    if (state.backendOnline && totalCount === 0) {
      document.getElementById('reports-count-text').textContent =
        `Connected to live API (${state.storageMode || 'memory'}) · 0 scans recorded yet`;
      listEl.innerHTML = `<div class="report-row"><p class="report-meta">Live backend is online with 0 scans so far. Scan a crop leaf in the Farmer App to see it appear here in real time.</p></div>`;
      return;
    }

    const modeSuffix = state.backendOnline ? `live ${state.storageMode || 'API'}` : 'offline seed';
    document.getElementById('reports-count-text').textContent =
      `Showing ${matches.length} of ${totalCount} district reports (${modeSuffix})`;

    if (matches.length === 0) {
      listEl.innerHTML = `<div class="report-row"><p class="report-meta">No matching reports for the selected filters.</p></div>`;
      return;
    }

    listEl.innerHTML = matches
      .map((r) => {
        const conf = Math.round((r.confidence || 0.9) * 100);
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

    const pool = activeReports();
    const source = pool.length
      ? pool.slice(0, 4)
      : [
          { district: 'Masaka', crop: 'Banana / Matooke', condition: 'Banana Bacterial Wilt (BXW)', severity: 'high' },
          { district: 'Mukono', crop: 'Cassava', condition: 'Cassava Mosaic Disease (CMD)', severity: 'moderate' },
          { district: 'Mbale', crop: 'Coffee', condition: 'Coffee Leaf Rust (CLR)', severity: 'high' }
        ];

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

    pill.textContent = 'Checking status...';
    pill.classList.remove('online');

    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${state.apiBase}/`, { signal: controller.signal });
      window.clearTimeout(timer);
      if (res.ok) {
        const info = await res.json();
        state.backendOnline = true;
        state.storageMode = info.storage || 'active';
        pill.textContent = `Online · Storage: ${state.storageMode} · v${info.version || '1.0.0'}`;
        pill.classList.add('online');
        renderLiveStatusBadge();
        return;
      }
    } catch (_) {
      state.backendOnline = false;
    }
    pill.textContent = 'Offline · Using local seed_data.json';
    renderLiveStatusBadge();
  }

  function downloadReportCsv() {
    const rows = [
      ['Section', 'Rank/ID', 'District/Crop', 'Condition', 'Scans/Confidence', 'Trend/Severity', 'Timestamp']
    ];

    const threats = hasLiveScans() ? computeLiveThreats() : BASELINE_THREATS;
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

    activeReports().forEach((r) => {
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
      const nextUrl = raw || 'http://localhost:8080';
      state.apiBase = nextUrl;
      try {
        localStorage.setItem('eagles_eye_api_base', nextUrl);
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
    }, 15000);

    window.addEventListener('focus', () => {
      fetchLiveScansFromBackend();
    });
  }

  function init() {
    updateHeaderClock();
    bindEvents();
    renderThreatsAndPins();
    loadInitialReports();

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
