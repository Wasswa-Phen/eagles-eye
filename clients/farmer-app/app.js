(function () {
  'use strict';

  const API_BASE = "https://eagles-eye-api.onrender.com";
  const STORAGE_KEY = 'eagles_eye_real_scans_v1';
  const DISTRICT_STORAGE_KEY = 'eagles_eye_district';

  const SVG_ICONS = {
    leaf: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4C12 3 5 7 5 14c0 3 2 5 5 5 7 0 10-7 10-15Z"/><path d="M4 21c3-6 7-9 13-13"/></svg>',
    shield: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>',
    arrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    check: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>'
  };

  const I18N = {
    en: {
      eyebrow: 'Trusted crop guidance',
      heroTitle: 'Your crop doctor<br>in your pocket',
      heroSubtitle: 'Spot crop problems early and get simple, practical advice in seconds.',
      btnStart: 'Start',
      historyLink: 'View scan history',
      microcopy: 'Works with low data • Advice in your language',
      scanHeader: 'Scan crop',
      scanInstruction: 'Take a clear photo of<br><b>the sick leaf</b>',
      cropAuto: 'Auto-detect crop',
      leafFrame: 'Tap to capture leaf',
      leafReady: 'Tap to change photo',
      loadingTitle: 'Analysing your crop...',
      loadingSub: 'Sending leaf photo to Eagles Eye AI...',
      gallery: 'Gallery',
      retry: 'Retry',
      resultHeader: 'Your crop result',
      highConfidence: 'High confidence',
      moderateConfidence: 'Moderate confidence',
      lowConfidence: 'Needs clearer photo',
      retakeBtn: 'Retake clearer photo',
      severityLabel: 'Severity',
      stepsKicker: 'Recommended action',
      stepsHeading: 'What to do now',
      listenAdvice: 'Listen to advice',
      stopListening: 'Stop audio',
      findDealers: 'Find nearest agro-dealer',
      nearbyLink: 'View nearby crop alert',
      advisory: 'Advisory only. Confirm with your extension officer.',
      nearbyHeader: 'Nearby alert',
      nearFarm: 'NEAR YOUR FARM',
      checkingAlerts: 'Checking live outbreak reports...',
      noOutbreaksHeadline: 'No active outbreaks reported near <em>{district}</em>',
      noOutbreaksTitle: 'Continue regular crop scouting',
      noOutbreaksDesc: 'No disease outbreaks have been logged in the live database near your district yet. Inspect your crops weekly and scan any suspicious leaf early.',
      alertErrorHeadline: 'Could not reach live outbreak server',
      alertErrorDesc: 'Check your internet connection and tap the bell icon above to refresh live outbreak distances.',
      mapYou: 'Your farm',
      btnTips: 'See prevention tips',
      syncingDb: 'Syncing with live database...',
      historyHeader: 'Scan history',
      farmRecord: 'YOUR FARM RECORD',
      pastScans: 'Past scans',
      emptyHistory: 'No crop scans yet. Capture or upload a real leaf photo to diagnose your crop.',
      scanAnother: 'Scan a crop leaf',
      dealersTitle: 'Nearest agro-dealers',
      districtLabel: 'Your district',
      tipsTitle: 'Crop protection guidance',
      gotIt: 'Got it',
      callLabel: 'Call',
      networkError: 'Could not connect to Eagles Eye AI server. Please check your connection and retry.'
    },
    lg: {
      eyebrow: 'Okubuulirira okwesigika',
      heroTitle: "Omusawo w'ebirime<br>mu nsawo yo",
      heroSubtitle: "Zuula obulwadde bw'ebirime mangu ofune amagezi amangu mu sikonda ntono.",
      btnStart: 'Tandika',
      historyLink: 'Laba ebyakeberebwa',
      microcopy: 'Kikola ne data mutono • Amagezi mu lulimi lwo',
      scanHeader: 'Kebera ekirime',
      scanInstruction: "Kuba ekifanyi ekirungi<br><b>eky'ekikoola ekirwadde</b>",
      cropAuto: 'Zuula ekirime kyokka',
      leafFrame: 'Nyiga wano okukuba ekifanyi',
      leafReady: 'Nyiga okukyusa ekifanyi',
      loadingTitle: 'Tukebera ekirime kyo...',
      loadingSub: 'Tuweereza ekifanyi ku Eagles Eye AI...',
      gallery: 'Ebifanyi',
      retry: 'Ddamu',
      resultHeader: 'Ebyazuuliddwa',
      highConfidence: 'Obukakafu obw’amaanyi',
      moderateConfidence: 'Obukakafu bwa wakati',
      lowConfidence: 'Ekifanyi kyeetaaga okutangaala',
      retakeBtn: 'Kuba ekifanyi ekirala ekirungi',
      severityLabel: 'Obukambwe',
      stepsKicker: 'Amagezi ag’okukola',
      stepsHeading: 'Kiki eky’okukola kati',
      listenAdvice: 'Wuliriza amagezi',
      stopListening: 'Yimiriza eddoboozi',
      findDealers: 'Zuula dduuka ly’ebyobulimi',
      nearbyLink: 'Laba okulabula kw’ebiwuka okumpi',
      advisory: 'Kino kya kubuulirira kwokka. Kakasa n’omukugu w’ebyobulimi.',
      nearbyHeader: 'Okulabula okumpi',
      nearFarm: 'OKUMPI N’ENNIMIRO YO',
      checkingAlerts: 'Tukebera alipoota z’obulwadde...',
      noOutbreaksHeadline: 'Tewali bulwadde buzuuliddwa kumpi ne <em>{district}</em>',
      noOutbreaksTitle: 'Weeyongere okukebera ennimiro yo',
      noOutbreaksDesc: 'Tewali alipoota za bulwadde bw’ebirime mu kitundu kyo kati. Kebera ebirime byo buli wiiki.',
      alertErrorHeadline: 'Tetwasobodde kutuuka ku server',
      alertErrorDesc: 'Kebera yintaneeti yo onyige akade waggulu okuddamu okukebera.',
      mapYou: 'Ennimiro yo',
      btnTips: 'Laba amagezi ag’okuziyiza',
      syncingDb: 'Tukwatagana ne database...',
      historyHeader: 'Ebyakeberebwa',
      farmRecord: 'EBYAFAAYO BY’ENNIMIRO YO',
      pastScans: 'Ebyakeberebwa',
      emptyHistory: 'Tonnaba kukebera kirime kyonna. Kuba ekifanyi ky’ekikoola otandike.',
      scanAnother: 'Kebera ekikoola',
      dealersTitle: 'Amaduuka g’ebyobulimi agali okumpi',
      districtLabel: 'Disitulikiti yo',
      tipsTitle: 'Amagezi ag’okukuuma ebirime',
      gotIt: 'Ntegedde',
      callLabel: 'Kuba',
      networkError: 'Tetwasobodde kutuuka ku Eagles Eye AI. Kebera yintaneeti yo oddemu.'
    }
  };

  // Exact 54 Ugandan districts & WGS84 coordinates from backend/districts.py
  const DISTRICT_COORDS = {
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

  const AGRO_DEALERS = {
    Masaka: [
      { name: 'Masaka Central Farmers Agro-Inputs', address: 'Elgin Road, Masaka City', phone: '+256772123456' },
      { name: 'Buddu Clean Seed & Crop Care', address: 'Hobart Street, Masaka', phone: '+256701987654' },
      { name: 'Equator Agro-Vet Supplies', address: 'Nyendo Trading Centre', phone: '+256752334411' }
    ],
    Mukono: [
      { name: 'Mukono Quality Seeds Ltd', address: 'Jinja Road, Mukono Town', phone: '+256752443322' },
      { name: 'Sezibwa Farm Inputs', address: 'Main Market Road, Mukono', phone: '+256782556677' }
    ],
    Mbale: [
      { name: 'Mount Elgon Agro-Vet Centre', address: 'Republic Street, Mbale', phone: '+256772334455' },
      { name: 'Bugisu Coffee & Crop Care', address: 'Cathedral Avenue, Mbale', phone: '+256703445566' }
    ],
    Mbarara: [
      { name: 'Ankole Farmers Enterprise', address: 'High Street, Mbarara', phone: '+256702112233' },
      { name: 'Western Crop Protection Hub', address: 'Mbaguta Street, Mbarara', phone: '+256775443311' }
    ],
    Gulu: [
      { name: 'Acholi Grain & Seed Depot', address: 'Main Market Road, Gulu', phone: '+256781667788' }
    ],
    Wakiso: [
      { name: 'Wakiso Agri-Solutions', address: 'Hoima Road, Wakiso Town', phone: '+256754889900' }
    ],
    Kampala: [
      { name: 'Container Village Agro-Inputs Hub', address: 'Nakivubo Channel, Kampala', phone: '+256772998877' },
      { name: 'Uganda National Farmers Supply', address: 'Nasser Road, Kampala', phone: '+256704112299' }
    ],
    Iganga: [
      { name: 'Busoga Farmers Hub', address: 'Main Street, Iganga', phone: '+256774223344' }
    ],
    Jinja: [
      { name: 'Nile Basin Seed & Crop Care', address: 'Clive Road, Jinja', phone: '+256751887766' }
    ],
    Lira: [
      { name: 'Lango Cooperative Farm Supply', address: 'Obote Avenue, Lira', phone: '+256783221144' }
    ],
    Kasese: [
      { name: 'Rwenzori Highland Agro-Care', address: 'Alexander Street, Kasese', phone: '+256776554433' }
    ]
  };

  const GENERAL_SCOUTING_TIPS = [
    ['Inspect leaves weekly', 'Walk through your garden every week checking undersides and young shoots.', 'Kebera ebikoola buli wiiki', 'Tambula mu nnimiro yo buli wiiki okebere wansi w’ebikoola.'],
    ['Sterilize farm tools', 'Clean pangas, knives, and hoes before moving between plots.', 'Yosa ebiwabyo by’ennimiro', 'Yosa ebiwabyo n’obwambe nga tonnagenda mu nnimiro ndala.'],
    ['Use certified planting material', 'Source clean seeds and cuttings from registered agro-dealers.', 'Kozesa ensigo ezikakasiddwa', 'Gula ensigo n’ebiti ebiramu okuva mu maduuka agakakasiddwa.']
  ];

  function loadSavedDistrict() {
    try {
      const saved = localStorage.getItem(DISTRICT_STORAGE_KEY);
      if (saved && DISTRICT_COORDS[saved]) return saved;
    } catch (_) {
      // ignore storage errors
    }
    return 'Masaka';
  }

  const state = {
    screen: 'welcome',
    previousScreen: 'welcome',
    resultOrigin: 'scan',
    lang: 'en',
    district: loadSavedDistrict(),
    cropHint: '',
    selectedFile: null,
    userPhotoDataUrl: null,
    userThumbDataUrl: null,
    currentDiagnosis: null,
    nearbyStatus: 'idle', // 'loading' | 'ready' | 'error'
    nearbyScans: [],
    activeNearbyOutbreak: null,
    isAnalysing: false,
    isSpeaking: false,
    googleReady: false,
    googleFailed: false,
    nearbyMapMode: null,
    nearbyGoogleMap: null,
    nearbyGoogleOverlays: [],
    nearbyLeafletMap: null,
    nearbyLeafletGroup: null
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function haversineKm(lat1, lng1, lat2, lng2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function showScanError(message, canRetry) {
    const toast = document.getElementById('scan-toast');
    const msgEl = document.getElementById('scan-toast-msg');
    const retryBtn = document.getElementById('btn-retry-scan');
    if (!toast || !msgEl || !retryBtn) return;
    msgEl.textContent = message;
    retryBtn.textContent = I18N[state.lang].retry;
    retryBtn.hidden = !canRetry;
    toast.hidden = false;
  }

  function hideScanError() {
    const toast = document.getElementById('scan-toast');
    if (toast) toast.hidden = true;
  }

  // Screen elements
  const screenEls = {
    welcome: document.getElementById('screen-welcome'),
    scan: document.getElementById('screen-scan'),
    result: document.getElementById('screen-result'),
    nearby: document.getElementById('screen-nearby'),
    history: document.getElementById('screen-history')
  };

  function showScreen(nextScreen) {
    stopSpeech();
    if (nextScreen === 'result' && !state.currentDiagnosis) {
      nextScreen = 'scan';
    }
    if (nextScreen !== state.screen) {
      state.previousScreen = state.screen;
    }
    state.screen = nextScreen;
    Object.keys(screenEls).forEach((key) => {
      screenEls[key].hidden = key !== nextScreen;
    });
    window.scrollTo(0, 0);

    if (nextScreen === 'history') {
      renderHistory();
    } else if (nextScreen === 'result') {
      renderResult(state.currentDiagnosis);
    } else if (nextScreen === 'nearby') {
      fetchLiveNearbyOutbreaks();
    }
  }

  // =========================================================
  // LIVE NEARBY OUTBREAKS (GET https://eagles-eye-api.onrender.com/scans?limit=50)
  // =========================================================
  async function fetchLiveNearbyOutbreaks() {
    state.nearbyStatus = 'loading';
    renderNearbyAlertView();
    renderNearbyUgandaMap();

    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 45000);
      const res = await fetch(`${API_BASE}/scans?limit=50`, { signal: controller.signal });
      window.clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const payload = await res.json();
      const scans = Array.isArray(payload) ? payload : payload.scans;
      if (!Array.isArray(scans)) {
        throw new Error('Invalid scans payload');
      }

      state.nearbyScans = scans;
      state.nearbyStatus = 'ready';
      computeClosestOutbreakFromLiveScans();
    } catch (_) {
      state.nearbyStatus = 'error';
      state.activeNearbyOutbreak = null;
    }

    if (state.screen === 'nearby') {
      renderNearbyAlertView();
      renderNearbyUgandaMap();
    }
    renderPreventionTips();
  }

  function computeClosestOutbreakFromLiveScans() {
    const selectedDistrict = document.getElementById('scan-district')?.value || state.district || 'Masaka';
    const farm = DISTRICT_COORDS[selectedDistrict] || DISTRICT_COORDS.Masaka;

    const activeDiseaseScans = state.nearbyScans.filter((s) => {
      if (!s || s.is_healthy === true) return false;
      const sev = String(s.severity || '').toLowerCase();
      const crop = String(s.crop || '');
      return sev !== 'none' && crop !== 'Unknown';
    });

    if (activeDiseaseScans.length === 0) {
      state.activeNearbyOutbreak = null;
      return;
    }

    const sevRank = { high: 3, moderate: 2, low: 1 };
    let closest = null;

    activeDiseaseScans.forEach((scan) => {
      const loc = scan.location || {};
      const distName = String(loc.district || 'Unknown');
      const tableCoords = DISTRICT_COORDS[distName];
      const lat = tableCoords ? tableCoords.lat : Number(loc.latitude);
      const lng = tableCoords ? tableCoords.lng : Number(loc.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const exactKm = Math.round(haversineKm(farm.lat, farm.lng, lat, lng));
      const sameDistrict = distName.toLowerCase() === selectedDistrict.toLowerCase() || exactKm === 0;
      const weight = sevRank[String(scan.severity || '').toLowerCase()] || 1;

      if (
        !closest ||
        exactKm < closest.distanceKm ||
        (exactKm === closest.distanceKm && weight > closest.weight)
      ) {
        closest = {
          crop: String(scan.crop || 'Crop'),
          condition: String(scan.condition || 'Crop disease'),
          severity: String(scan.severity || 'moderate').toLowerCase(),
          advice: String(scan.advice || ''),
          advice_luganda: String(scan.advice_luganda || ''),
          district: distName,
          sameDistrict,
          lat,
          lng,
          distanceKm: exactKm,
          weight,
          timestamp: scan.timestamp || ''
        };
      }
    });

    state.activeNearbyOutbreak = closest;
  }

  function formatLiveTimestamp(isoStr, lang) {
    if (!isoStr) {
      return lang === 'lg' ? 'Kyatereezeddwa kati okuva ku server' : 'Updated just now from live server';
    }
    const parsed = new Date(isoStr);
    if (Number.isNaN(parsed.getTime())) {
      return lang === 'lg' ? 'Kyatereezeddwa kati okuva ku server' : 'Updated just now from live server';
    }
    const timeStr = parsed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const dateStr = parsed.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return lang === 'lg'
      ? `Alipoota esembayo: ${dateStr}, ${timeStr}`
      : `Latest scan logged ${dateStr} at ${timeStr}`;
  }

  function renderNearbyAlertView() {
    const t = I18N[state.lang];
    const heroEl = document.getElementById('alert-hero');
    const headlineEl = document.getElementById('txt-alert-headline');
    const cardTitleEl = document.getElementById('txt-alert-card-title');
    const cardDescEl = document.getElementById('txt-alert-card-desc');
    const updatedEl = document.getElementById('txt-updated');

    if (state.nearbyStatus === 'loading') {
      heroEl.classList.remove('is-safe');
      headlineEl.textContent = t.checkingAlerts;
      cardTitleEl.textContent = state.lang === 'lg' ? 'Tukebera mu kitundu kyo' : 'Live regional surveillance';
      cardDescEl.textContent = t.syncingDb;
      updatedEl.innerHTML = `<span></span> ${escapeHtml(t.syncingDb)}`;
      return;
    }

    if (state.nearbyStatus === 'error') {
      heroEl.classList.remove('is-safe');
      headlineEl.textContent = t.alertErrorHeadline;
      cardTitleEl.textContent = state.lang === 'lg' ? 'Yintaneeti yeetaagisa' : 'Connection required';
      cardDescEl.textContent = t.alertErrorDesc;
      updatedEl.innerHTML = `<span></span> ${escapeHtml(t.alertErrorHeadline)}`;
      return;
    }

    const outbreak = state.activeNearbyOutbreak;
    if (!outbreak) {
      heroEl.classList.add('is-safe');
      headlineEl.innerHTML = t.noOutbreaksHeadline.replace('{district}', escapeHtml(state.district));
      cardTitleEl.textContent = t.noOutbreaksTitle;
      cardDescEl.textContent = t.noOutbreaksDesc;
      updatedEl.innerHTML = `<span></span> ${escapeHtml(
        state.lang === 'lg'
          ? `Server ennanda (${state.nearbyScans.length} ebyakeberebwa)`
          : `Live database (${state.nearbyScans.length} total scans checked)`
      )}`;
      return;
    }

    heroEl.classList.remove('is-safe');
    const safeCond = escapeHtml(outbreak.condition);
    const safeDist = escapeHtml(outbreak.district);

    if (outbreak.sameDistrict) {
      headlineEl.innerHTML =
        state.lang === 'lg'
          ? `${safeCond} azuuliddwa mu <em>${safeDist} (0 km)</em>`
          : `${safeCond} confirmed in <em>${safeDist} (0 km)</em>`;
    } else {
      headlineEl.innerHTML =
        state.lang === 'lg'
          ? `${safeCond} azuuliddwa <em>${outbreak.distanceKm} km</em> okuva e ${ escapeHtml(state.district) } (${safeDist})`
          : `${safeCond} confirmed <em>${outbreak.distanceKm} km</em> from you (${safeDist})`;
    }

    cardTitleEl.textContent =
      state.lang === 'lg'
        ? `Kuuma ${outbreak.crop} wo kati`
        : `Protect your ${outbreak.crop.toLowerCase()} now`;

    cardDescEl.textContent =
      state.lang === 'lg' && outbreak.advice_luganda
        ? outbreak.advice_luganda
        : outbreak.advice;

    updatedEl.innerHTML = `<span></span> ${escapeHtml(formatLiveTimestamp(outbreak.timestamp, state.lang))}`;
  }

  function getActiveMapPoints() {
    const farm = DISTRICT_COORDS[state.district] || DISTRICT_COORDS.Masaka;
    const t = I18N[state.lang];
    const live = state.activeNearbyOutbreak;

    if (live) {
      // Slightly separate co-located district markers (~2 km visual offset) so both pins are clearly readable
      const outLat = live.sameDistrict ? live.lat + 0.015 : live.lat;
      const outLng = live.sameDistrict ? live.lng + 0.015 : live.lng;
      return {
        hasOutbreak: true,
        farm,
        outbreak: { lat: outLat, lng: outLng },
        center: { lat: (farm.lat + outLat) / 2, lng: (farm.lng + outLng) / 2 },
        youLabel: `${t.mapYou} (${state.district})`,
        pestLabel: live.sameDistrict
          ? `${live.condition} · ${live.district} (0 km)`
          : `${live.condition} · ${live.district} (${live.distanceKm} km)`,
        sameDistrict: live.sameDistrict
      };
    }

    return {
      hasOutbreak: false,
      farm,
      outbreak: null,
      center: farm,
      youLabel: `${t.mapYou} (${state.district})`,
      pestLabel: '',
      sameDistrict: true
    };
  }

  function renderNearbyUgandaMap() {
    const mapBox = document.getElementById('nearby-real-map');
    const statusBox = document.getElementById('nearby-map-status');
    if (!mapBox) return;

    const pts = getActiveMapPoints();

    if (!state.googleFailed && window.google?.maps) {
      if (statusBox) statusBox.hidden = true;
      mapBox.hidden = false;

      if (!state.nearbyGoogleMap) {
        state.nearbyMapMode = 'google';
        state.nearbyGoogleMap = new google.maps.Map(mapBox, {
          center: pts.center,
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
            { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#e6f0df' }] }
          ]
        });
      } else {
        google.maps.event.trigger(state.nearbyGoogleMap, 'resize');
      }

      state.nearbyGoogleOverlays.forEach((o) => o.setMap(null));
      state.nearbyGoogleOverlays = [];

      const youMarker = new google.maps.Marker({
        map: state.nearbyGoogleMap,
        position: pts.farm,
        title: pts.youLabel,
        label: { text: pts.youLabel, color: '#1b1b1b', fontSize: '11px', fontWeight: '700' },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#2e7d32',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3.5,
          scale: 8,
          labelOrigin: new google.maps.Point(0, 2.3)
        }
      });
      state.nearbyGoogleOverlays.push(youMarker);

      if (pts.hasOutbreak && pts.outbreak) {
        const ring = new google.maps.Circle({
          map: state.nearbyGoogleMap,
          center: pts.outbreak,
          radius: pts.sameDistrict ? 2200 : 9000,
          strokeColor: '#c62828',
          strokeOpacity: 0.45,
          strokeWeight: 2,
          fillColor: '#c62828',
          fillOpacity: 0.16
        });

        const pestMarker = new google.maps.Marker({
          map: state.nearbyGoogleMap,
          position: pts.outbreak,
          title: pts.pestLabel,
          label: { text: pts.pestLabel, color: '#c62828', fontSize: '11px', fontWeight: '800' },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#c62828',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3.5,
            scale: 8.5,
            labelOrigin: new google.maps.Point(0, -2.3)
          }
        });

        state.nearbyGoogleOverlays.push(ring, pestMarker);

        if (!pts.sameDistrict) {
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(pts.farm);
          bounds.extend(pts.outbreak);
          state.nearbyGoogleMap.fitBounds(bounds, 44);
        } else {
          state.nearbyGoogleMap.setCenter(pts.center);
          state.nearbyGoogleMap.setZoom(12);
        }
      } else {
        state.nearbyGoogleMap.setCenter(pts.farm);
        state.nearbyGoogleMap.setZoom(11);
      }
      return;
    }

    if (window.L && navigator.onLine !== false) {
      if (statusBox) statusBox.hidden = true;
      mapBox.hidden = false;

      if (!state.nearbyLeafletMap) {
        state.nearbyMapMode = 'leaflet';
        state.nearbyLeafletMap = L.map(mapBox, {
          center: [pts.center.lat, pts.center.lng],
          zoom: 12,
          zoomControl: true,
          attributionControl: false
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(state.nearbyLeafletMap);
        state.nearbyLeafletGroup = L.layerGroup().addTo(state.nearbyLeafletMap);
      }

      state.nearbyLeafletGroup.clearLayers();

      L.circleMarker([pts.farm.lat, pts.farm.lng], {
        radius: 8,
        color: '#ffffff',
        weight: 3,
        fillColor: '#2e7d32',
        fillOpacity: 1
      })
        .bindTooltip(escapeHtml(pts.youLabel), {
          permanent: true,
          direction: 'bottom',
          offset: [0, 6],
          className: 'nearby-map-label'
        })
        .addTo(state.nearbyLeafletGroup);

      if (pts.hasOutbreak && pts.outbreak) {
        L.circle([pts.outbreak.lat, pts.outbreak.lng], {
          radius: pts.sameDistrict ? 2200 : 9000,
          color: '#c62828',
          weight: 2,
          opacity: 0.5,
          fillColor: '#c62828',
          fillOpacity: 0.18
        }).addTo(state.nearbyLeafletGroup);

        L.circleMarker([pts.outbreak.lat, pts.outbreak.lng], {
          radius: 8.5,
          color: '#ffffff',
          weight: 3,
          fillColor: '#c62828',
          fillOpacity: 1
        })
          .bindTooltip(escapeHtml(pts.pestLabel), {
            permanent: true,
            direction: 'top',
            offset: [0, -6],
            className: 'nearby-map-label'
          })
          .addTo(state.nearbyLeafletGroup);
      }

      window.setTimeout(() => {
        if (!state.nearbyLeafletMap) return;
        state.nearbyLeafletMap.invalidateSize();
        if (pts.hasOutbreak && pts.outbreak && !pts.sameDistrict) {
          state.nearbyLeafletMap.fitBounds(
            [
              [pts.farm.lat, pts.farm.lng],
              [pts.outbreak.lat, pts.outbreak.lng]
            ],
            { padding: [36, 36], maxZoom: 12 }
          );
        } else {
          state.nearbyLeafletMap.setView([pts.center.lat, pts.center.lng], pts.hasOutbreak ? 12 : 11);
        }
      }, 60);
      return;
    }

    mapBox.hidden = true;
    if (statusBox) {
      statusBox.textContent = `${pts.youLabel}${pts.pestLabel ? ' • ' + pts.pestLabel : ''}`;
      statusBox.hidden = false;
    }
  }

  function refreshNearbyMapViewport() {
    if (state.screen !== 'nearby') return;
    const pts = getActiveMapPoints();

    if (state.nearbyMapMode === 'google' && state.nearbyGoogleMap && window.google?.maps) {
      google.maps.event.trigger(state.nearbyGoogleMap, 'resize');
      if (pts.hasOutbreak && pts.outbreak && !pts.sameDistrict) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(pts.farm);
        bounds.extend(pts.outbreak);
        state.nearbyGoogleMap.fitBounds(bounds, 44);
      } else {
        state.nearbyGoogleMap.setCenter(pts.center);
      }
    } else if (state.nearbyMapMode === 'leaflet' && state.nearbyLeafletMap) {
      state.nearbyLeafletMap.invalidateSize();
      if (pts.hasOutbreak && pts.outbreak && !pts.sameDistrict) {
        state.nearbyLeafletMap.fitBounds(
          [
            [pts.farm.lat, pts.farm.lng],
            [pts.outbreak.lat, pts.outbreak.lng]
          ],
          { padding: [36, 36], maxZoom: 12, animate: false }
        );
      } else {
        state.nearbyLeafletMap.setView([pts.center.lat, pts.center.lng], pts.hasOutbreak ? 12 : 11, { animate: false });
      }
    }
  }

  window.initFarmerGoogleMap = function () {
    state.googleReady = true;
    if (state.screen === 'nearby') {
      renderNearbyUgandaMap();
    }
  };
  window.handleFarmerMapError = function () {
    state.googleFailed = true;
    if (state.screen === 'nearby') {
      renderNearbyUgandaMap();
    }
  };
  window.gm_authFailure = function () {
    state.googleFailed = true;
    if (state.nearbyGoogleMap) {
      state.nearbyGoogleMap = null;
      const mapBox = document.getElementById('nearby-real-map');
      if (mapBox) mapBox.innerHTML = '';
    }
    if (state.screen === 'nearby') {
      renderNearbyUgandaMap();
    }
  };

  // =========================================================
  // LANGUAGE & DISTRICT MANAGEMENT
  // =========================================================
  function populateDistrictSelects() {
    const names = Object.keys(DISTRICT_COORDS).sort();
    const optionsHtml = names
      .map((d) => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`)
      .join('');

    ['scan-district', 'select-district'].forEach((id) => {
      const sel = document.getElementById(id);
      if (sel) {
        sel.innerHTML = optionsHtml;
        sel.value = state.district;
      }
    });
  }

  function setDistrict(newDistrict) {
    if (!newDistrict || !DISTRICT_COORDS[newDistrict]) return;
    state.district = newDistrict;
    try {
      localStorage.setItem(DISTRICT_STORAGE_KEY, newDistrict);
    } catch (_) {
      // ignore storage errors
    }
    ['scan-district', 'select-district'].forEach((id) => {
      const sel = document.getElementById(id);
      if (sel && sel.value !== newDistrict) {
        sel.value = newDistrict;
      }
    });
    computeClosestOutbreakFromLiveScans();
    renderDealers();
    if (state.screen === 'nearby') {
      renderNearbyAlertView();
      renderNearbyUgandaMap();
    }
  }

  function setLanguage(lang) {
    state.lang = lang;
    stopSpeech();
    const t = I18N[lang];

    document.getElementById('btn-lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('btn-lang-lg').classList.toggle('active', lang === 'lg');

    document.getElementById('txt-eyebrow').textContent = t.eyebrow;
    document.getElementById('txt-hero-title').innerHTML = t.heroTitle;
    document.getElementById('txt-hero-subtitle').textContent = t.heroSubtitle;
    document.getElementById('txt-btn-start').textContent = t.btnStart;
    document.getElementById('txt-history-link').textContent = t.historyLink;
    document.getElementById('txt-microcopy').textContent = t.microcopy;

    document.getElementById('txt-scan-header').textContent = t.scanHeader;
    document.getElementById('txt-scan-instruction').innerHTML = t.scanInstruction;
    const optAuto = document.getElementById('opt-crop-auto');
    if (optAuto) optAuto.textContent = t.cropAuto;
    document.getElementById('txt-leaf-frame').textContent = state.userPhotoDataUrl ? t.leafReady : t.leafFrame;
    document.getElementById('txt-loading-title').textContent = t.loadingTitle;
    document.getElementById('txt-loading-sub').textContent = t.loadingSub;
    document.getElementById('txt-gallery').textContent = t.gallery;

    document.getElementById('txt-result-header').textContent = t.resultHeader;
    document.getElementById('txt-severity-label').textContent = t.severityLabel;
    document.getElementById('txt-steps-kicker').textContent = t.stepsKicker;
    document.getElementById('txt-steps-heading').textContent = t.stepsHeading;
    document.getElementById('txt-btn-retake').textContent = t.retakeBtn;
    document.getElementById('txt-btn-listen').textContent = t.listenAdvice;
    document.getElementById('txt-btn-dealers').textContent = t.findDealers;
    document.getElementById('txt-nearby-link').textContent = t.nearbyLink;
    document.getElementById('txt-advisory').textContent = t.advisory;

    document.getElementById('txt-nearby-header').textContent = t.nearbyHeader;
    document.getElementById('txt-near-farm').textContent = t.nearFarm;
    document.getElementById('txt-btn-tips').textContent = t.btnTips;

    document.getElementById('txt-history-header').textContent = t.historyHeader;
    document.getElementById('txt-farm-record').textContent = t.farmRecord;
    document.getElementById('txt-past-scans').textContent = t.pastScans;
    document.getElementById('txt-scan-another').textContent = t.scanAnother;

    document.getElementById('sheet-dealers-title').textContent = t.dealersTitle;
    document.getElementById('txt-district-label').textContent = t.districtLabel;
    document.getElementById('txt-dealers-alert-btn').textContent = t.nearbyLink;
    document.getElementById('btn-tips-done').textContent = t.gotIt;

    if (state.currentDiagnosis) {
      renderResult(state.currentDiagnosis);
    }
    renderDealers();
    renderNearbyAlertView();
    renderPreventionTips();
    if (state.screen === 'history') {
      renderHistory();
    }
    if (state.screen === 'nearby') {
      renderNearbyUgandaMap();
    }
  }

  // =========================================================
  // REAL CAMERA/FILE UPLOAD & LIVE POST /diagnose
  // =========================================================
  function buildStepsFromAdvice(adviceEn, adviceLg) {
    const splitSentences = (txt) =>
      String(txt || '')
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

    const enParts = splitSentences(adviceEn);
    const lgParts = splitSentences(adviceLg);

    if (enParts.length === 0) {
      return [];
    }

    const titlesEn = ['Immediate field action', 'Clean farm hygiene', 'Follow-up care'];
    const titlesLg = ['Ekikolwa eky’amangu', 'Obuyonjo mu nnimiro', 'Okugoberera'];

    return enParts.slice(0, 3).map((sentence, idx) => [
      titlesEn[idx] || `Step ${idx + 1}`,
      sentence,
      titlesLg[idx] || `Etendera ${idx + 1}`,
      lgParts[idx] || adviceLg || sentence
    ]);
  }

  function createHistoryThumbnail(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxSide = 260;
        let { width, height } = img;
        if (width > maxSide || height > maxSide) {
          const scale = Math.min(maxSide / width, maxSide / height);
          width = Math.max(1, Math.round(width * scale));
          height = Math.max(1, Math.round(height * scale));
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  async function ensureUploadableImageFile(file) {
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
    const mime = String(file.type || '').toLowerCase();

    if (allowed.has(mime) && file.size > 0 && file.size <= 4.8 * 1024 * 1024) {
      return file;
    }

    // Compress oversized phone camera photos (> 4.8 MB) or convert HEIC/other formats to JPEG File
    return new Promise((resolve) => {
      const img = new Image();
      const objUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objUrl);
        const maxDim = 1600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const stem = String(file.name || 'crop_leaf').replace(/\.[^.]+$/, '');
              resolve(new File([blob], `${stem}.jpg`, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.86
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        resolve(file);
      };
      img.src = objUrl;
    });
  }

  async function diagnoseUserPhoto(rawFile) {
    if (!rawFile || state.isAnalysing) return;
    state.isAnalysing = true;
    hideScanError();

    const loadingCard = document.getElementById('loading-card');
    loadingCard.hidden = false;

    const districtSelect = document.getElementById('scan-district');
    const cropHintSelect = document.getElementById('scan-crop-hint');
    const selectedDistrict = (districtSelect && districtSelect.value) || state.district || 'Masaka';

    try {
      const uploadFile = await ensureUploadableImageFile(rawFile);

      const formData = new FormData();
      formData.append('image', uploadFile);
      formData.append('district', selectedDistrict);
      if (cropHintSelect && cropHintSelect.value) {
        formData.append('crop_hint', cropHintSelect.value);
      }

      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`${API_BASE}/diagnose`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      window.clearTimeout(timer);

      let payload = null;
      try {
        payload = await response.json();
      } catch (_) {
        payload = null;
      }

      if (!response.ok || !payload || (payload.status !== 'success' && payload.status !== 'inconclusive') || !payload.data) {
        const errMsg =
          (payload && payload.message) ||
          `${I18N[state.lang].networkError} (HTTP ${response.status})`;
        loadingCard.hidden = true;
        state.isAnalysing = false;
        showScanError(errMsg, true);
        return;
      }

      const d = payload.data;
      const conf = Number(d.confidence ?? 0);
      const isInconclusive =
        payload.status === 'inconclusive' ||
        conf <= 0.40 ||
        (!d.is_healthy &&
          (d.crop === 'Unknown' ||
            String(d.condition || '').toLowerCase() === 'unknown' ||
            String(d.condition || '').toLowerCase().includes('inconclusive')));

      let normSev;
      if (isInconclusive) {
        normSev = 'inconclusive';
      } else if (d.is_healthy || d.severity === 'none') {
        normSev = 'healthy';
      } else {
        normSev = String(d.severity || 'moderate').toLowerCase();
      }

      if (d.location?.district && DISTRICT_COORDS[d.location.district]) {
        setDistrict(d.location.district);
      }

      const liveDiagnosis = {
        crop: d.crop || 'Unknown',
        condition:
          isInconclusive && (!d.condition || d.condition === 'Unknown')
            ? 'Inconclusive Image'
            : String(d.condition || 'Unknown'),
        confidence: conf,
        severity: normSev,
        is_healthy: Boolean(d.is_healthy),
        is_inconclusive: isInconclusive,
        photoDataUrl: state.userPhotoDataUrl,
        thumbDataUrl: state.userThumbDataUrl || state.userPhotoDataUrl,
        advice: String(d.advice || ''),
        advice_luganda: String(d.advice_luganda || ''),
        location: d.location || null,
        timestamp: d.timestamp || new Date().toISOString(),
        steps: buildStepsFromAdvice(d.advice, d.advice_luganda)
      };

      state.currentDiagnosis = liveDiagnosis;

      if (!isInconclusive) {
        saveScanToHistory(liveDiagnosis);
      }

      loadingCard.hidden = true;
      state.isAnalysing = false;
      state.resultOrigin = 'scan';
      showScreen('result');
    } catch (_) {
      loadingCard.hidden = true;
      state.isAnalysing = false;
      showScanError(I18N[state.lang].networkError, true);
    }
  }

  function renderResult(diag) {
    if (!diag) return;
    const t = I18N[state.lang];

    // Display strictly the farmer's actual uploaded/captured photo data URL
    const resImage = document.getElementById('res-image');
    const actualPhoto = diag.photoDataUrl || diag.thumbDataUrl || state.userPhotoDataUrl || '';
    if (actualPhoto) {
      resImage.src = actualPhoto;
      resImage.hidden = false;
    } else {
      resImage.removeAttribute('src');
      resImage.hidden = true;
    }
    resImage.alt = `${diag.crop} — ${diag.condition}`;

    document.getElementById('res-crop').textContent = String(diag.crop || 'UNKNOWN').toUpperCase();
    document.getElementById('res-condition').textContent = diag.condition;

    const confPct = typeof diag.confidence === 'number' ? Math.round(diag.confidence * 100) : 0;
    const isInconclusive = Boolean(diag.is_inconclusive) || (typeof diag.confidence === 'number' && diag.confidence <= 0.40);
    const isModConf = !isInconclusive && typeof diag.confidence === 'number' && diag.confidence < 0.75;
    const baseConfText = isInconclusive
      ? t.lowConfidence
      : isModConf
        ? t.moderateConfidence
        : t.highConfidence;

    const confEl = document.getElementById('res-confidence');
    const confBadge = document.getElementById('res-confidence-badge');
    confEl.textContent = `${baseConfText} (${confPct}%)`;
    confBadge.classList.toggle('is-low', isInconclusive);

    const btnRetake = document.getElementById('btn-retake');
    btnRetake.hidden = !isInconclusive;

    const sev = String(diag.severity || 'moderate').toLowerCase();
    const resSev = document.getElementById('res-severity');
    const resBar = document.getElementById('res-severity-bar');
    const resNote = document.getElementById('res-severity-note');

    resSev.className = '';
    resBar.className = '';

    if (isInconclusive || sev === 'inconclusive') {
      resSev.textContent = state.lang === 'lg' ? 'Tekirabika bulungi' : 'Unclear photo';
      resBar.classList.add('tone-inconclusive');
      resNote.textContent = state.lang === 'lg'
        ? 'Ekifanyi tekirabika bulungi. Nyiga wansi okukuba ekifanyi ekirala ekiri okumpi mu kitangaala.'
        : 'Confidence is too low for a reliable diagnosis. Please retake a closer, well-lit photo of the affected leaf.';
    } else if (sev === 'high') {
      resSev.textContent = state.lang === 'lg' ? 'Kw’amaanyi' : 'High';
      resSev.classList.add('tone-high');
      resBar.classList.add('tone-high');
      resNote.textContent = state.lang === 'lg'
        ? 'Kola mangu ddala okuziyiza obulwadde okusaasaana.'
        : 'Urgent action needed to stop spread across your field.';
    } else if (sev === 'healthy' || sev === 'none') {
      resSev.textContent = state.lang === 'lg' ? 'Kiramu' : 'Healthy';
      resSev.classList.add('tone-healthy');
      resBar.classList.add('tone-healthy');
      resNote.textContent = state.lang === 'lg'
        ? 'Ekirime kirabika bulungi. Weeyongere okukirabirira.'
        : 'No major disease spotted. Continue regular field care.';
    } else if (sev === 'low') {
      resSev.textContent = state.lang === 'lg' ? 'Kitono' : 'Low';
      resSev.classList.add('tone-healthy');
      resBar.classList.add('tone-low');
      resNote.textContent = state.lang === 'lg'
        ? 'Obubonero butono. Goberera amagezi gano mangu.'
        : 'Early symptoms spotted. Act early to keep your crop safe.';
    } else {
      resSev.textContent = state.lang === 'lg' ? 'Kya wakati' : 'Moderate';
      resNote.textContent = state.lang === 'lg'
        ? 'Kola mangu okukuuma ekitundu ky’ennimiro ekisigaddeyo.'
        : 'Act soon to protect the rest of your field.';
    }

    const steps = Array.isArray(diag.steps) && diag.steps.length
      ? diag.steps
      : buildStepsFromAdvice(diag.advice, diag.advice_luganda);

    document.getElementById('res-step-count').textContent =
      steps.length > 1 ? `1–${steps.length}` : '1';

    const checklist = document.getElementById('res-checklist');
    checklist.innerHTML = steps
      .map((step, index) => {
        const title = state.lang === 'lg' && step[2] ? step[2] : step[0];
        const desc = state.lang === 'lg' && step[3] ? step[3] : step[1];
        return `<div class="check-item">
          <span class="check-number">${index + 1}</span>
          <div><b>${escapeHtml(title)}</b><p>${escapeHtml(desc)}</p></div>
          ${SVG_ICONS.check}
        </div>`;
      })
      .join('');
  }

  // =========================================================
  // REAL SCAN HISTORY (ZERO DEMO ITEMS)
  // =========================================================
  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {
      // ignore storage errors
    }
    return [];
  }

  function saveScanToHistory(diag) {
    try {
      const list = loadHistory();
      const sev = String(diag.severity || 'moderate').toLowerCase();
      const normalizedSev = sev === 'none' ? 'healthy' : sev;

      const storedDiag = {
        crop: diag.crop,
        condition: diag.condition,
        confidence: diag.confidence,
        severity: normalizedSev,
        is_healthy: diag.is_healthy,
        is_inconclusive: false,
        thumbDataUrl: diag.thumbDataUrl || '',
        advice: diag.advice,
        advice_luganda: diag.advice_luganda,
        location: diag.location,
        timestamp: diag.timestamp,
        steps: diag.steps
      };

      const parsedDate = diag.timestamp ? new Date(diag.timestamp) : new Date();
      const timeStr = parsedDate.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });

      list.unshift({
        id: 'scan-' + Date.now(),
        time: timeStr,
        crop: diag.crop,
        condition: diag.condition,
        severity: normalizedSev,
        thumbDataUrl: diag.thumbDataUrl || '',
        diagnosis: storedDiag
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 15)));
    } catch (_) {
      // ignore quota/storage errors
    }
  }

  function renderHistory() {
    const scans = loadHistory();
    document.getElementById('history-count').textContent = String(scans.length);
    const container = document.getElementById('history-list');
    container.innerHTML = '';

    if (scans.length === 0) {
      container.innerHTML = `<div class="empty-history">${escapeHtml(I18N[state.lang].emptyHistory)}</div>`;
      return;
    }

    scans.forEach((scan) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'history-item';

      const sev = String(scan.severity || 'moderate').toLowerCase();
      const thumbInner = scan.thumbDataUrl
        ? `<img src="${escapeHtml(scan.thumbDataUrl)}" alt="${escapeHtml(scan.crop)}">`
        : (sev === 'healthy' ? SVG_ICONS.shield : SVG_ICONS.leaf);

      btn.innerHTML = `
        <span class="history-thumb">${thumbInner}</span>
        <div>
          <small>${escapeHtml(scan.time)}</small>
          <strong>${escapeHtml(scan.crop)}</strong>
          <span>${escapeHtml(scan.condition)}</span>
        </div>
        <em class="${escapeHtml(sev)}">${escapeHtml(sev)}</em>
        ${SVG_ICONS.arrow}
      `;

      btn.addEventListener('click', () => {
        if (!scan.diagnosis) return;
        state.currentDiagnosis = JSON.parse(JSON.stringify(scan.diagnosis));
        state.resultOrigin = 'history';
        showScreen('result');
      });

      container.appendChild(btn);
    });
  }

  // =========================================================
  // AUDIO TTS & SLIDE-UP SHEETS
  // =========================================================
  function toggleSpeech() {
    if (state.isSpeaking) {
      stopSpeech();
      return;
    }
    if (!('speechSynthesis' in window) || !state.currentDiagnosis) {
      return;
    }

    const diag = state.currentDiagnosis;
    const text = state.lang === 'lg' ? diag.advice_luganda || diag.advice : diag.advice;
    if (!text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.93;

    const btnListen = document.getElementById('btn-listen');
    const txtListen = document.getElementById('txt-btn-listen');

    utterance.onstart = () => {
      state.isSpeaking = true;
      btnListen.classList.add('is-speaking');
      txtListen.textContent = I18N[state.lang].stopListening;
    };
    utterance.onend = stopSpeech;
    utterance.onerror = stopSpeech;

    window.speechSynthesis.speak(utterance);
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    state.isSpeaking = false;
    const btnListen = document.getElementById('btn-listen');
    const txtListen = document.getElementById('txt-btn-listen');
    if (btnListen && txtListen) {
      btnListen.classList.remove('is-speaking');
      txtListen.textContent = I18N[state.lang].listenAdvice;
    }
  }

  function getDealersForDistrict(district) {
    if (AGRO_DEALERS[district]) return AGRO_DEALERS[district];
    return [
      {
        name: `${district} District Farmers Agro-Inputs`,
        address: `Main Trading Centre, ${district}`,
        phone: '+256772123456'
      },
      {
        name: `${district} Clean Seed & Vet Care`,
        address: `Market Street, ${district}`,
        phone: '+256701987654'
      }
    ];
  }

  function renderDealers() {
    const dealers = getDealersForDistrict(state.district);
    const callText = I18N[state.lang].callLabel;
    const listEl = document.getElementById('dealers-list');
    listEl.innerHTML = dealers
      .map(
        (d) => `<div class="dealer-card">
          <div>
            <b>${escapeHtml(d.name)}</b>
            <small>${escapeHtml(d.address)}</small>
          </div>
          <a class="dealer-call" href="tel:${escapeHtml(d.phone)}">${escapeHtml(callText)}</a>
        </div>`
      )
      .join('');
  }

  function renderPreventionTips() {
    const titleEl = document.getElementById('sheet-tips-title');
    const listEl = document.getElementById('tips-checklist');
    const live = state.activeNearbyOutbreak;

    let tips = GENERAL_SCOUTING_TIPS;
    if (live && live.advice) {
      titleEl.textContent =
        state.lang === 'lg'
          ? `Okuziyiza ${live.condition}`
          : `${live.condition} prevention`;
      const built = buildStepsFromAdvice(live.advice, live.advice_luganda);
      if (built.length > 0) tips = built;
    } else {
      titleEl.textContent = I18N[state.lang].tipsTitle;
    }

    listEl.innerHTML = tips
      .map((tip, i) => {
        const title = state.lang === 'lg' && tip[2] ? tip[2] : tip[0];
        const desc = state.lang === 'lg' && tip[3] ? tip[3] : tip[1];
        return `<div class="check-item">
          <span class="check-number">${i + 1}</span>
          <div><b>${escapeHtml(title)}</b><p>${escapeHtml(desc)}</p></div>
          ${SVG_ICONS.check}
        </div>`;
      })
      .join('');
  }

  // =========================================================
  // EVENT BINDINGS
  // =========================================================
  function bindEvents() {
    const cameraFileInput = document.getElementById('camera-file-input');
    const viewfinderCard = document.getElementById('viewfinder-card');
    const btnCapture = document.getElementById('btn-capture');
    const btnGallery = document.getElementById('btn-gallery');

    function openCameraPicker(preferEnvironmentCamera) {
      if (state.isAnalysing || !cameraFileInput) return;
      hideScanError();
      if (preferEnvironmentCamera) {
        cameraFileInput.setAttribute('capture', 'environment');
      } else {
        cameraFileInput.removeAttribute('capture');
      }
      cameraFileInput.value = '';
      cameraFileInput.click();
    }

    // Welcome
    document.getElementById('btn-lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('btn-lang-lg').addEventListener('click', () => setLanguage('lg'));
    document.getElementById('btn-start').addEventListener('click', () => showScreen('scan'));
    document.getElementById('btn-open-history').addEventListener('click', () => showScreen('history'));

    // Scan navigation & live bell
    document.getElementById('btn-scan-back').addEventListener('click', () => showScreen('welcome'));
    document.getElementById('btn-scan-bell').addEventListener('click', () => showScreen('nearby'));

    // Viewfinder card, shutter button, and gallery button all trigger cameraFileInput.click()
    viewfinderCard.addEventListener('click', () => openCameraPicker(true));
    viewfinderCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCameraPicker(true);
      }
    });
    btnCapture.addEventListener('click', () => openCameraPicker(true));
    btnGallery.addEventListener('click', () => openCameraPicker(false));

    // Read real user photo with FileReader as data URL, render in viewfinder, keep in memory & diagnose
    cameraFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      state.selectedFile = file;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = String(ev.target?.result || '');
        if (!dataUrl) return;

        state.userPhotoDataUrl = dataUrl;
        document.getElementById('scan-photo').style.backgroundImage = `url("${dataUrl}")`;
        document.getElementById('txt-leaf-frame').textContent = I18N[state.lang].leafReady;

        state.userThumbDataUrl = await createHistoryThumbnail(dataUrl);
        diagnoseUserPhoto(file);
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('btn-retry-scan').addEventListener('click', () => {
      if (state.selectedFile) {
        diagnoseUserPhoto(state.selectedFile);
      } else {
        openCameraPicker(true);
      }
    });

    document.getElementById('scan-district').addEventListener('change', (e) => {
      setDistrict(e.target.value);
    });
    document.getElementById('scan-crop-hint').addEventListener('change', (e) => {
      state.cropHint = e.target.value;
    });

    // Result screen actions + Retake clearer photo handler
    document.getElementById('btn-result-back').addEventListener('click', () => {
      showScreen(state.resultOrigin === 'history' ? 'history' : 'scan');
    });
    document.getElementById('btn-result-bell').addEventListener('click', () => showScreen('nearby'));
    document.getElementById('btn-retake').addEventListener('click', () => {
      showScreen('scan');
      openCameraPicker(true);
    });
    document.getElementById('btn-listen').addEventListener('click', toggleSpeech);
    document.getElementById('btn-nearby-link').addEventListener('click', () => showScreen('nearby'));

    // Agro-dealers sheet
    const sheetDealers = document.getElementById('sheet-dealers');
    document.getElementById('btn-dealers').addEventListener('click', () => {
      renderDealers();
      sheetDealers.hidden = false;
    });
    document.getElementById('btn-close-dealers').addEventListener('click', () => {
      sheetDealers.hidden = true;
    });
    sheetDealers.addEventListener('click', (e) => {
      if (e.target === sheetDealers) sheetDealers.hidden = true;
    });
    document.getElementById('select-district').addEventListener('change', (e) => {
      setDistrict(e.target.value);
    });
    document.getElementById('btn-dealers-to-alert').addEventListener('click', () => {
      sheetDealers.hidden = true;
      showScreen('nearby');
    });

    // Nearby alert & Prevention tips sheet
    document.getElementById('btn-nearby-back').addEventListener('click', () => {
      const backTarget =
        state.previousScreen && state.previousScreen !== 'nearby'
          ? state.previousScreen
          : (state.currentDiagnosis ? 'result' : 'scan');
      showScreen(backTarget);
    });
    document.getElementById('btn-nearby-bell').addEventListener('click', () => {
      fetchLiveNearbyOutbreaks();
    });

    const sheetTips = document.getElementById('sheet-tips');
    document.getElementById('btn-prevention-tips').addEventListener('click', () => {
      renderPreventionTips();
      sheetTips.hidden = false;
    });
    document.getElementById('btn-close-tips').addEventListener('click', () => {
      sheetTips.hidden = true;
    });
    document.getElementById('btn-tips-done').addEventListener('click', () => {
      sheetTips.hidden = true;
    });
    sheetTips.addEventListener('click', (e) => {
      if (e.target === sheetTips) sheetTips.hidden = true;
    });

    // History
    document.getElementById('btn-history-back').addEventListener('click', () => showScreen('welcome'));
    document.getElementById('btn-history-bell').addEventListener('click', () => showScreen('nearby'));
    document.getElementById('btn-history-scan').addEventListener('click', () => showScreen('scan'));

    // Dismiss open sheets on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        sheetDealers.hidden = true;
        sheetTips.hidden = true;
      }
    });

    // Keep real Uganda map sharp on orientation change / viewport resize
    const nearbyMapBox = document.getElementById('nearby-real-map');
    if (nearbyMapBox && typeof ResizeObserver === 'function') {
      let resizeTimer = null;
      const observer = new ResizeObserver(() => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(refreshNearbyMapViewport, 120);
      });
      observer.observe(nearbyMapBox);
    } else {
      window.addEventListener('resize', refreshNearbyMapViewport);
    }
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  }

  function init() {
    populateDistrictSelects();
    bindEvents();
    renderDealers();
    renderPreventionTips();
    renderHistory();
    registerServiceWorker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
