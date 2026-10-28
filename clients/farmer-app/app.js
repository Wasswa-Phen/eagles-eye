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
      // ignore storage/URL errors
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

  const API_BASE = resolveApiBase();
  const STORAGE_KEY = 'eagles_eye_scans_v2';
  const DISTRICT_STORAGE_KEY = 'eagles_eye_district';

  const SVG_ICONS = {
    leaf: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4C12 3 5 7 5 14c0 3 2 5 5 5 7 0 10-7 10-15Z"/><path d="M4 21c3-6 7-9 13-13"/></svg>',
    shield: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>',
    arrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    check: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>'
  };

  const DEFAULT_RESULT_PHOTO = "https://images.unsplash.com/photo-1744723491952-fc9e6f184fd1?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=500";

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
      leafFrame: 'Place leaf here',
      loadingTitle: 'Analysing your crop...',
      loadingSub: 'Connecting to Eagles Eye AI...',
      gallery: 'Gallery',
      resultHeader: 'Your crop result',
      highConfidence: 'High confidence',
      moderateConfidence: 'Moderate confidence',
      lowConfidence: 'Needs clearer photo',
      severityLabel: 'Severity',
      stepsKicker: '3 simple steps',
      stepsHeading: 'What to do now',
      listenAdvice: 'Listen to advice',
      stopListening: 'Stop audio',
      findDealers: 'Find nearest agro-dealer',
      nearbyLink: 'View nearby crop alert',
      advisory: 'Advisory only. Confirm with your extension officer.',
      nearbyHeader: 'Nearby alert',
      nearFarm: 'NEAR YOUR FARM',
      alertHeadline: 'Fall armyworm confirmed <em>8 km</em> from you',
      mapYou: 'Your farm',
      mapPest: 'Armyworm',
      mapDist: '8 km away',
      alertCardTitle: 'Protect your maize now',
      alertCardDesc: 'Check the funnel of young maize plants for holes, sawdust-like waste, or caterpillars.',
      btnTips: 'See prevention tips',
      updated: 'Updated today at 8:30 AM',
      historyHeader: 'Scan history',
      farmRecord: 'YOUR FARM RECORD',
      pastScans: 'Past scans',
      scanAnother: 'Scan another crop',
      dealersTitle: 'Nearest agro-dealers',
      districtLabel: 'Your district',
      tipsTitle: 'Fall armyworm prevention',
      gotIt: 'Got it',
      callLabel: 'Call'
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
      leafFrame: 'Teeka wano ekikoola',
      loadingTitle: 'Tukebera ekirime kyo...',
      loadingSub: 'Kino kitwala sikonda ntono',
      gallery: 'Ebifanyi',
      resultHeader: 'Ebyazuuliddwa',
      highConfidence: 'Obukakafu obw’amaanyi',
      moderateConfidence: 'Obukakafu bwa wakati',
      lowConfidence: 'Ekifanyi kyeetaaga okutangaala',
      severityLabel: 'Obukambwe',
      stepsKicker: 'Amatendera 3 amangu',
      stepsHeading: 'Kiki eky’okukola kati',
      listenAdvice: 'Wuliriza amagezi',
      stopListening: 'Yimiriza eddoboozi',
      findDealers: 'Zuula dduuka ly’ebyobulimi',
      nearbyLink: 'Laba okulabula kw’ebiwuka okumpi',
      advisory: 'Kino kya kubuulirira kwokka. Kakasa n’omukugu w’ebyobulimi.',
      nearbyHeader: 'Okulabula okumpi',
      nearFarm: 'OKUMPI N’ENNIMIRO YO',
      alertHeadline: 'Fall armyworm azuuliddwa <em>8 km</em> okuva w’oli',
      mapYou: 'Ennimiro yo',
      mapPest: 'Armyworm',
      mapDist: '8 km okuva wano',
      alertCardTitle: 'Kuuma kasooli wo kati',
      alertCardDesc: 'Kebera mu mutwe gwa kasooli omuto okulaba ebituli, obusa bw’ebiwuka, oba obunnyo.',
      btnTips: 'Laba amagezi ag’okuziyiza',
      updated: 'Kyatereezeddwa leero ku 8:30 AM',
      historyHeader: 'Ebyakeberebwa',
      farmRecord: 'EBYAFAAYO BY’ENNIMIRO YO',
      pastScans: 'Ebyakeberebwa',
      scanAnother: 'Kebera ekirime ekirala',
      dealersTitle: 'Amaduuka g’ebyobulimi agali okumpi',
      districtLabel: 'Disitulikiti yo',
      tipsTitle: 'Okuziyiza Fall armyworm',
      gotIt: 'Ntegedde',
      callLabel: 'Kuba'
    }
  };

  // All 54 Ugandan districts matching backend/districts.py
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

  const CATALOG = {
    cassava: {
      crop: 'Cassava',
      condition: 'Cassava mosaic disease',
      condition_lg: 'Obulwadde bwa Cassava mosaic',
      confidence: 0.94,
      severity: 'moderate',
      is_healthy: false,
      is_inconclusive: false,
      image: DEFAULT_RESULT_PHOTO,
      fallbackImage: 'assets/cassava_mosaic.jpg',
      advice: 'Cut and safely bury badly affected leaves. Do not replant stems from sick crops. Ask for an approved whitefly treatment at your agro-dealer.',
      advice_luganda: 'Sala era oziike amakoola agalwadde ennyo. Tosimba biti biva ku birime ebirwadde. Saba eddagala erikakasiddwa ku dduuka ly’ebyobulimi.',
      steps: [
        ['Remove affected leaves', 'Cut and safely bury badly affected leaves.', 'Ggyako amakoola amalwadde', 'Sala era oziike amakoola agalwadde ennyo.'],
        ['Use clean planting material', 'Do not replant stems from sick crops.', 'Kozesa ebiti ebiramu', 'Tosimba biti biva ku birime ebirwadde.'],
        ['Control whiteflies', 'Ask for an approved treatment at your agro-dealer.', 'Ziyiza obuwuka obweru', 'Saba eddagala erikakasiddwa ku dduuka ly’ebyobulimi.']
      ]
    },
    maize: {
      crop: 'Maize',
      condition: 'Healthy crop',
      condition_lg: 'Kasooli mulamu bulungi',
      confidence: 0.98,
      severity: 'healthy',
      is_healthy: true,
      is_inconclusive: false,
      image: 'assets/healthy_maize.jpg',
      fallbackImage: 'assets/healthy_maize.jpg',
      advice: 'Crop foliage looks healthy with no pest damage. Keep weeding regularly and scout weekly for early signs of Fall armyworm.',
      advice_luganda: 'Amakoola ga kasooli malamu bulungi. Weeyongere okukoola mu budde era okebere buli wiiki okulaba obubonero bwa Armyworm.',
      steps: [
        ['Keep weeding regularly', 'Maintain a clean field during early growth stages.', 'Koola mu budde', 'Kuuma ennimiro nga nnyonjo mu biseera eby’okukula.'],
        ['Balanced nutrition', 'Apply organic manure or recommended top-dressing at knee height.', 'Teekamu ebigimusa', 'Teekamu obusa oba ebigimusa kasooli lw’atuuka mu maviivi.'],
        ['Scout weekly', 'Inspect central funnels every week for caterpillars.', 'Kebera buli wiiki', 'Kebera mu mutwe gwa kasooli buli wiiki.']
      ]
    },
    banana: {
      crop: 'Banana',
      condition: 'Black sigatoka',
      condition_lg: 'Obulwadde bwa Black sigatoka',
      confidence: 0.91,
      severity: 'moderate',
      is_healthy: false,
      is_inconclusive: false,
      image: 'assets/banana_wilt.jpg',
      fallbackImage: 'assets/banana_wilt.jpg',
      advice: 'Prune streaked or drying lower leaves and burn or bury them away from the mat. Improve spacing and drainage to reduce leaf moisture.',
      advice_luganda: 'Salako endagala ezikaze wansi oziike wala n’ensuku. Gaziya amabanga g’ebitooke empewo eyingire bulungi.',
      steps: [
        ['Prune affected lower leaves', 'Cut streaked leaves early and remove them from the garden.', 'Salako endagala endwadde', 'Salako endagala eziriko amabala oziggye mu lusuku.'],
        ['Sterilize cutting tools', 'Disinfect knives and pangas with Jik bleach or flame.', 'Yosa ebiwabyo', 'Yosa akambe n’ekiwabyo mu Jik oba mu muliro.'],
        ['Improve airflow & mulch', 'De-sucker excess shoots and apply clean mulch.', 'Yingiza empewo mu lusuku', 'Ggyamu ensukusa ezisusse obungi obikke bulungi.']
      ]
    },
    banana_wilt: {
      crop: 'Banana / Matooke',
      condition: 'Banana bacterial wilt',
      condition_lg: 'Kiijukizo ky’ebitooke (BXW)',
      confidence: 0.95,
      severity: 'high',
      is_healthy: false,
      is_inconclusive: false,
      image: 'assets/banana_wilt.jpg',
      fallbackImage: 'assets/banana_wilt.jpg',
      advice: 'Cut down the infected plant at ground level and bury residues immediately. Disinfect all farming tools with fire or bleach and break male buds with a forked stick.',
      advice_luganda: 'Temako ekitooke ekirwadde wansi ku ttaka era oziike ebisigalira. Yosa ebyuma mu muliro oba Jik era oggyeko empummumpu n’akakondo.',
      steps: [
        ['Uproot or cut at soil level', 'Remove infected stems immediately and bury them.', 'Temera ku ttaka', 'Temako ekitooke ekirwadde ku ttaka oziike ebisigalira.'],
        ['Disinfect tools thoroughly', 'Clean pangas with fire or household bleach between plants.', 'Yosa ebiwabyo', 'Yosa ebiwabyo mu muliro oba mu Jik buli lw’osala.'],
        ['Remove male buds early', 'Use a wooden forked stick once the last hand forms.', 'Ggyako empummumpu', 'Kozesa akakondo okuggyako empummumpu.']
      ]
    },
    coffee: {
      crop: 'Coffee',
      condition: 'Coffee leaf rust',
      condition_lg: 'Obulwadde bw’atala ku mmwanyi',
      confidence: 0.92,
      severity: 'high',
      is_healthy: false,
      is_inconclusive: false,
      image: DEFAULT_RESULT_PHOTO,
      fallbackImage: 'assets/cassava_mosaic.jpg',
      advice: 'Prune dense branches to improve canopy airflow. Collect fallen rust-spotted leaves and consult an agro-dealer for approved copper fungicide.',
      advice_luganda: 'Saalira amatabi okuyingiza empewo. Kung’aanya amakoola agagudde era weebuuze ku dduuka ly’ebyobulimi ku ddagala lya kopa.',
      steps: [
        ['Prune dense canopy', 'Open up branches so sunlight and air dry the leaves.', 'Saalira emmwanyi', 'Salako amatabi agasukkiridde empewo eyingire.'],
        ['Clear fallen leaves', 'Remove heavily rusted leaves beneath the trees.', 'Ggyawoko amakoola agagudde', 'Kung’aanya amakoola agalwadde wansi w’emiti.'],
        ['Apply copper protection', 'Ask your agro-dealer for registered copper fungicide.', 'Kozesa eddagala lya kopa', 'Saba eddagala lya kopa erikakasiddwa ku dduuka.']
      ]
    }
  };

  const DEFAULT_HISTORY = [
    { id: 'seed-0', time: 'Today, 10:42 AM', crop: 'Cassava', condition: 'Cassava mosaic', severity: 'moderate', thumbClass: 'thumb-0', icon: 'leaf', catalogKey: 'cassava' },
    { id: 'seed-1', time: '11 Oct, 4:18 PM', crop: 'Maize', condition: 'Healthy crop', severity: 'healthy', thumbClass: 'thumb-1', icon: 'shield', catalogKey: 'maize' },
    { id: 'seed-2', time: '03 Oct, 8:05 AM', crop: 'Banana', condition: 'Black sigatoka', severity: 'moderate', thumbClass: 'thumb-2', icon: 'leaf', catalogKey: 'banana' },
    { id: 'seed-3', time: '22 Sep, 2:31 PM', crop: 'Coffee', condition: 'Coffee leaf rust', severity: 'high', thumbClass: 'thumb-3', icon: 'leaf', catalogKey: 'coffee' }
  ];

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

  const DEFAULT_PREVENTION_TIPS = [
    ['Inspect young funnels early', 'Check maize whorls every 3–4 days for window-pane leaf feeding and frass.', 'Kebera kasooli omuto mangu', 'Kebera mu mutwe gwa kasooli buli nnaku 3–4 okulaba obubonero.'],
    ['Hand-pick or apply ash/sand', 'On small plots, crush egg masses and caterpillars early in the morning.', 'Ggyamu obunnyo ku makya', 'Ku nnimiro entono, ggyamu amagi n’obunnyo ku makya ennyo.'],
    ['Use approved biopesticides', 'Ask your agro-dealer for neem-based or registered selective treatments.', 'Kozesa eddagala erikakasiddwa', 'Saba eddagala lya neem oba erikakasiddwa ku dduuka ly’ebyobulimi.']
  ];

  function loadSavedDistrict() {
    try {
      const saved = localStorage.getItem(DISTRICT_STORAGE_KEY);
      if (saved && DISTRICT_COORDS[saved]) return saved;
    } catch (_) {
      // ignore
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
    previewUrl: null,
    currentDiagnosis: cloneDiagnosis(CATALOG.cassava),
    mockCases: null,
    backendOnline: false,
    backendScans: [],
    activeNearbyOutbreak: null,
    isAnalysing: false,
    isSpeaking: false,
    toastTimer: null,
    googleReady: false,
    googleFailed: false,
    nearbyMapMode: null,
    nearbyGoogleMap: null,
    nearbyGoogleOverlays: [],
    nearbyLeafletMap: null,
    nearbyLeafletGroup: null
  };

  function cloneDiagnosis(item) {
    return JSON.parse(JSON.stringify(item));
  }

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

  function showToast(message) {
    const toast = document.getElementById('scan-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 4500);
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
      renderNearbyAlertView();
      renderNearbyUgandaMap();
      fetchNearbyOutbreaks();
    }
  }

  // =========================================================
  // BACKEND HEALTH, MOCK FALLBACK & LIVE NEARBY SCANS (GET /scans)
  // =========================================================
  async function checkBackendHealth() {
    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API_BASE}/`, { signal: controller.signal });
      window.clearTimeout(timer);
      if (res.ok) {
        const info = await res.json();
        state.backendOnline = info && info.status === 'healthy';
      }
    } catch (_) {
      state.backendOnline = false;
    }
  }

  async function loadMockFallbackData() {
    try {
      const res = await fetch('./mock_data.json');
      if (res.ok) {
        const json = await res.json();
        if (json && json.mock_cases) {
          state.mockCases = json.mock_cases;
        }
      }
    } catch (_) {
      // ignore if unavailable
    }
  }

  async function fetchNearbyOutbreaks() {
    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_BASE}/scans?limit=100`, { signal: controller.signal });
      window.clearTimeout(timer);

      if (!res.ok) return;
      const payload = await res.json();
      const scans = Array.isArray(payload) ? payload : payload.scans;
      if (!Array.isArray(scans)) return;

      state.backendOnline = true;
      state.backendScans = scans;
      computeClosestOutbreak();

      if (state.screen === 'nearby') {
        renderNearbyAlertView();
        renderNearbyUgandaMap();
      }
      renderPreventionTips();
    } catch (_) {
      // Offline: retain local default alert
    }
  }

  function computeClosestOutbreak() {
    const farm = DISTRICT_COORDS[state.district] || DISTRICT_COORDS.Masaka;
    const candidates = state.backendScans.filter((s) => {
      if (!s || s.is_healthy) return false;
      const sev = String(s.severity || '').toLowerCase();
      const crop = String(s.crop || '');
      return sev !== 'none' && crop !== 'Unknown';
    });

    if (candidates.length === 0) {
      state.activeNearbyOutbreak = null;
      return;
    }

    const sevRank = { high: 3, moderate: 2, low: 1 };
    let best = null;

    candidates.forEach((scan) => {
      const loc = scan.location || {};
      const distName = loc.district || 'Unknown';
      const coords = DISTRICT_COORDS[distName];
      const lat = Number.isFinite(Number(loc.latitude)) ? Number(loc.latitude) : coords?.lat;
      const lng = Number.isFinite(Number(loc.longitude)) ? Number(loc.longitude) : coords?.lng;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const sameDistrict = distName.toLowerCase() === state.district.toLowerCase();
      const rawKm = sameDistrict ? 6 : Math.max(1, Math.round(haversineKm(farm.lat, farm.lng, lat, lng)));
      const weight = sevRank[String(scan.severity || '').toLowerCase()] || 1;

      if (
        !best ||
        rawKm < best.distanceKm ||
        (rawKm === best.distanceKm && weight > best.weight)
      ) {
        best = {
          crop: String(scan.crop || 'Crop'),
          condition: String(scan.condition || 'Crop disease'),
          severity: String(scan.severity || 'moderate').toLowerCase(),
          advice: String(scan.advice || ''),
          advice_luganda: String(scan.advice_luganda || ''),
          district: distName,
          sameDistrict,
          lat: sameDistrict ? farm.lat + 0.038 : lat,
          lng: sameDistrict ? farm.lng + 0.041 : lng,
          distanceKm: rawKm,
          weight,
          timestamp: scan.timestamp || ''
        };
      }
    });

    state.activeNearbyOutbreak = best;
  }

  function formatRelativeUpdate(isoStr, lang) {
    if (!isoStr) return I18N[lang].updated;
    const parsed = new Date(isoStr);
    if (Number.isNaN(parsed.getTime())) return I18N[lang].updated;
    const timeStr = parsed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const dateStr = parsed.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return lang === 'lg'
      ? `API ennanda • Kyatereezeddwa ${dateStr}, ${timeStr}`
      : `Live API • Updated ${dateStr} at ${timeStr}`;
  }

  function renderNearbyAlertView() {
    const t = I18N[state.lang];
    const outbreak = state.activeNearbyOutbreak;

    if (!outbreak) {
      document.getElementById('txt-alert-headline').innerHTML = t.alertHeadline;
      document.getElementById('txt-map-you').textContent = t.mapYou;
      document.getElementById('txt-map-pest').textContent = t.mapPest;
      document.getElementById('txt-map-dist').textContent = t.mapDist;
      document.getElementById('txt-alert-card-title').textContent = t.alertCardTitle;
      document.getElementById('txt-alert-card-desc').textContent = t.alertCardDesc;
      document.getElementById('txt-updated').innerHTML = `<span></span> ${escapeHtml(t.updated)}`;
      return;
    }

    const safeCond = escapeHtml(outbreak.condition);
    const distTag = outbreak.sameDistrict
      ? (state.lang === 'lg' ? `mu ${escapeHtml(outbreak.district)}` : `~${outbreak.distanceKm} km (${escapeHtml(outbreak.district)})`)
      : `${outbreak.distanceKm} km`;

    document.getElementById('txt-alert-headline').innerHTML =
      state.lang === 'lg'
        ? `${safeCond} azuuliddwa <em>${distTag}</em> okuva w’oli`
        : `${safeCond} confirmed <em>${distTag}</em> from you`;

    const cropLower = outbreak.crop.toLowerCase();
    document.getElementById('txt-alert-card-title').textContent =
      state.lang === 'lg'
        ? `Kuuma ${outbreak.crop} wo kati`
        : `Protect your ${cropLower} now`;

    document.getElementById('txt-alert-card-desc').textContent =
      state.lang === 'lg' && outbreak.advice_luganda
        ? outbreak.advice_luganda
        : outbreak.advice || t.alertCardDesc;

    document.getElementById('txt-map-you').textContent = `${t.mapYou} (${state.district})`;
    document.getElementById('txt-map-pest').textContent = outbreak.condition.slice(0, 18);
    document.getElementById('txt-map-dist').textContent = `${outbreak.distanceKm} km`;
    document.getElementById('txt-updated').innerHTML =
      `<span></span> ${escapeHtml(formatRelativeUpdate(outbreak.timestamp, state.lang))}`;
  }

  function getActiveMapPoints() {
    const farm = DISTRICT_COORDS[state.district] || DISTRICT_COORDS.Masaka;
    const t = I18N[state.lang];
    const live = state.activeNearbyOutbreak;

    if (live) {
      return {
        farm,
        outbreak: { lat: live.lat, lng: live.lng },
        center: { lat: (farm.lat + live.lat) / 2, lng: (farm.lng + live.lng) / 2 },
        youLabel: `${t.mapYou} (${state.district})`,
        pestLabel: `${live.condition} · ${live.distanceKm} km`,
        sameDistrict: live.sameDistrict
      };
    }

    const fallbackOutbreak = { lat: farm.lat + 0.048, lng: farm.lng + 0.052 };
    return {
      farm,
      outbreak: fallbackOutbreak,
      center: { lat: (farm.lat + fallbackOutbreak.lat) / 2, lng: (farm.lng + fallbackOutbreak.lng) / 2 },
      youLabel: `${t.mapYou} (${state.district})`,
      pestLabel: `${t.mapPest} · ${t.mapDist}`,
      sameDistrict: true
    };
  }

  function renderNearbyUgandaMap() {
    const mapBox = document.getElementById('nearby-real-map');
    const offlineSvg = document.getElementById('nearby-offline-svg');
    if (!mapBox) return;

    const pts = getActiveMapPoints();

    if (!state.googleFailed && window.google?.maps) {
      offlineSvg.hidden = true;
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

      const ring = new google.maps.Circle({
        map: state.nearbyGoogleMap,
        center: pts.outbreak,
        radius: pts.sameDistrict ? 2200 : 8500,
        strokeColor: '#c62828',
        strokeOpacity: 0.45,
        strokeWeight: 2,
        fillColor: '#c62828',
        fillOpacity: 0.16
      });

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

      if (!pts.sameDistrict) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(pts.farm);
        bounds.extend(pts.outbreak);
        state.nearbyGoogleMap.fitBounds(bounds, 42);
      } else {
        state.nearbyGoogleMap.setCenter(pts.center);
        state.nearbyGoogleMap.setZoom(12);
      }

      state.nearbyGoogleOverlays.push(ring, youMarker, pestMarker);
      return;
    }

    if (window.L && navigator.onLine !== false) {
      offlineSvg.hidden = true;
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

      L.circle([pts.outbreak.lat, pts.outbreak.lng], {
        radius: pts.sameDistrict ? 2200 : 8500,
        color: '#c62828',
        weight: 2,
        opacity: 0.5,
        fillColor: '#c62828',
        fillOpacity: 0.18
      }).addTo(state.nearbyLeafletGroup);

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

      window.setTimeout(() => {
        if (!state.nearbyLeafletMap) return;
        state.nearbyLeafletMap.invalidateSize();
        if (!pts.sameDistrict) {
          state.nearbyLeafletMap.fitBounds(
            [
              [pts.farm.lat, pts.farm.lng],
              [pts.outbreak.lat, pts.outbreak.lng]
            ],
            { padding: [36, 36], maxZoom: 12 }
          );
        } else {
          state.nearbyLeafletMap.setView([pts.center.lat, pts.center.lng], 12);
        }
      }, 60);
      return;
    }

    // Complete offline fallback
    mapBox.hidden = true;
    offlineSvg.hidden = false;
  }

  function refreshNearbyMapViewport() {
    if (state.screen !== 'nearby') return;
    const pts = getActiveMapPoints();

    if (state.nearbyMapMode === 'google' && state.nearbyGoogleMap && window.google?.maps) {
      google.maps.event.trigger(state.nearbyGoogleMap, 'resize');
      if (!pts.sameDistrict) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(pts.farm);
        bounds.extend(pts.outbreak);
        state.nearbyGoogleMap.fitBounds(bounds, 42);
      } else {
        state.nearbyGoogleMap.setCenter(pts.center);
      }
    } else if (state.nearbyMapMode === 'leaflet' && state.nearbyLeafletMap) {
      state.nearbyLeafletMap.invalidateSize();
      if (!pts.sameDistrict) {
        state.nearbyLeafletMap.fitBounds(
          [
            [pts.farm.lat, pts.farm.lng],
            [pts.outbreak.lat, pts.outbreak.lng]
          ],
          { padding: [36, 36], maxZoom: 12, animate: false }
        );
      } else {
        state.nearbyLeafletMap.setView([pts.center.lat, pts.center.lng], 12, { animate: false });
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
      // ignore
    }
    ['scan-district', 'select-district'].forEach((id) => {
      const sel = document.getElementById(id);
      if (sel && sel.value !== newDistrict) {
        sel.value = newDistrict;
      }
    });
    computeClosestOutbreak();
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
    document.getElementById('txt-leaf-frame').textContent = t.leafFrame;
    document.getElementById('txt-loading-title').textContent = t.loadingTitle;
    document.getElementById('txt-loading-sub').textContent = t.loadingSub;
    document.getElementById('txt-gallery').textContent = t.gallery;

    document.getElementById('txt-result-header').textContent = t.resultHeader;
    document.getElementById('txt-severity-label').textContent = t.severityLabel;
    document.getElementById('txt-steps-kicker').textContent = t.stepsKicker;
    document.getElementById('txt-steps-heading').textContent = t.stepsHeading;
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

    renderResult(state.currentDiagnosis);
    renderDealers();
    renderNearbyAlertView();
    renderPreventionTips();
    if (state.screen === 'nearby') {
      renderNearbyUgandaMap();
    }
  }

  // =========================================================
  // IMAGE PREPARATION & LIVE DIAGNOSIS (POST /diagnose)
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
      return CATALOG.cassava.steps;
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

  async function prepareImageForBackend(file) {
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
    const mime = String(file.type || '').toLowerCase();

    if (allowed.has(mime) && file.size > 0 && file.size <= 3.8 * 1024 * 1024) {
      return { blob: file, filename: file.name || 'crop_leaf.jpg' };
    }

    // Resize/compress oversized smartphone camera photos or convert unsupported formats to JPEG <= 5 MB
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
              resolve({ blob, filename: `${stem}.jpg` });
            } else {
              resolve({ blob: file, filename: file.name || 'crop_leaf.jpg' });
            }
          },
          'image/jpeg',
          0.86
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        resolve({ blob: file, filename: file.name || 'crop_leaf.jpg' });
      };
      img.src = objUrl;
    });
  }

  function buildOfflineDiagnosis(filename) {
    const hint = (state.cropHint || filename || '').toLowerCase();
    const mc = state.mockCases;

    if (hint.includes('banana') || hint.includes('matooke') || hint.includes('wilt')) {
      if (mc && mc.infected_banana) {
        const b = mc.infected_banana;
        return {
          crop: b.crop,
          condition: b.condition,
          condition_lg: 'Kiijukizo ky’ebitooke (BXW)',
          confidence: b.confidence,
          severity: b.severity,
          is_healthy: b.is_healthy,
          is_inconclusive: false,
          image: 'assets/banana_wilt.jpg',
          fallbackImage: 'assets/banana_wilt.jpg',
          advice: b.advice,
          advice_luganda: b.advice_luganda,
          steps: buildStepsFromAdvice(b.advice, b.advice_luganda)
        };
      }
      return cloneDiagnosis(CATALOG.banana_wilt);
    }

    if (hint.includes('maize') || hint.includes('corn') || hint.includes('healthy')) {
      if (mc && mc.healthy_crop) {
        const m = mc.healthy_crop;
        return {
          crop: m.crop,
          condition: m.condition,
          condition_lg: 'Kasooli mulamu bulungi',
          confidence: m.confidence,
          severity: 'healthy',
          is_healthy: m.is_healthy,
          is_inconclusive: false,
          image: 'assets/healthy_maize.jpg',
          fallbackImage: 'assets/healthy_maize.jpg',
          advice: m.advice,
          advice_luganda: m.advice_luganda,
          steps: buildStepsFromAdvice(m.advice, m.advice_luganda)
        };
      }
      return cloneDiagnosis(CATALOG.maize);
    }

    if (hint.includes('coffee') || hint.includes('rust')) {
      return cloneDiagnosis(CATALOG.coffee);
    }

    return cloneDiagnosis(CATALOG.cassava);
  }

  function getSampleAssetForHint() {
    const h = state.cropHint.toLowerCase();
    if (h.includes('banana')) return { path: 'assets/banana_wilt.jpg', name: 'banana_wilt.jpg' };
    if (h.includes('maize')) return { path: 'assets/healthy_maize.jpg', name: 'healthy_maize.jpg' };
    return { path: 'assets/cassava_mosaic.jpg', name: 'cassava_mosaic.jpg' };
  }

  async function runCapture() {
    if (state.isAnalysing) return;
    state.isAnalysing = true;

    const toast = document.getElementById('scan-toast');
    if (toast) toast.hidden = true;

    const loadingCard = document.getElementById('loading-card');
    loadingCard.hidden = false;

    const startedAt = Date.now();
    let apiDiagnosis = null;
    let clientValidationError = null;
    let sampleAssetUsed = null;

    try {
      const formData = new FormData();
      formData.append('district', state.district || 'Masaka');
      if (state.cropHint) {
        formData.append('crop_hint', state.cropHint);
      }

      if (state.selectedFile) {
        const prepared = await prepareImageForBackend(state.selectedFile);
        formData.append('image', prepared.blob, prepared.filename);
      } else {
        sampleAssetUsed = getSampleAssetForHint();
        const sampleBlob = await fetch(sampleAssetUsed.path)
          .then((r) => (r.ok ? r.blob() : null))
          .catch(() => null);
        if (sampleBlob) {
          const typedBlob = sampleBlob.type
            ? sampleBlob
            : new Blob([sampleBlob], { type: 'image/jpeg' });
          formData.append('image', typedBlob, sampleAssetUsed.name);
        }
      }

      if (formData.has('image')) {
        // 30s timeout gives multimodal Gemini + Firestore sufficient headroom
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 30000);

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

        if (response.ok && payload && payload.data) {
          state.backendOnline = true;
          const d = payload.data;
          const conf = typeof d.confidence === 'number' ? d.confidence : 0.9;
          const isInconclusive =
            payload.status === 'inconclusive' ||
            (!d.is_healthy &&
              (conf <= 0.4 ||
                d.crop === 'Unknown' ||
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

          const resolvedImg =
            state.previewUrl ||
            (sampleAssetUsed ? sampleAssetUsed.path : DEFAULT_RESULT_PHOTO);

          apiDiagnosis = {
            crop: d.crop || 'Unknown',
            condition: isInconclusive && (!d.condition || d.condition === 'Unknown')
              ? 'Unclear leaf photo'
              : (d.condition || 'Crop condition'),
            condition_lg: isInconclusive
              ? 'Ekifanyi tekirabika bulungi'
              : (d.condition || 'Obulwadde bw’ekirime'),
            confidence: conf,
            severity: normSev,
            is_healthy: Boolean(d.is_healthy),
            is_inconclusive: isInconclusive,
            image: resolvedImg,
            fallbackImage: sampleAssetUsed ? sampleAssetUsed.path : 'assets/cassava_mosaic.jpg',
            advice: d.advice || CATALOG.cassava.advice,
            advice_luganda: d.advice_luganda || CATALOG.cassava.advice_luganda,
            location: d.location || null,
            timestamp: d.timestamp || new Date().toISOString(),
            steps: buildStepsFromAdvice(d.advice, d.advice_luganda)
          };

          // Refresh nearby alerts in background so the newly saved scan appears on the map
          if (!isInconclusive) {
            fetchNearbyOutbreaks();
          }
        } else if (response.status === 400 || response.status === 413) {
          clientValidationError =
            (payload && payload.message) || 'Please upload a valid JPEG, PNG, or WebP photo under 5 MB.';
        }
      }
    } catch (_) {
      // Backend offline or unreachable — fall back cleanly to offline catalog/mock_data.json
    }

    if (clientValidationError) {
      loadingCard.hidden = true;
      state.isAnalysing = false;
      showToast(clientValidationError);
      return;
    }

    if (!apiDiagnosis) {
      apiDiagnosis = buildOfflineDiagnosis(state.selectedFile ? state.selectedFile.name : '');
      if (state.previewUrl) {
        apiDiagnosis.image = state.previewUrl;
      } else if (sampleAssetUsed) {
        apiDiagnosis.image = sampleAssetUsed.path;
      }
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed < 900) {
      await new Promise((resolve) => window.setTimeout(resolve, 900 - elapsed));
    }

    state.currentDiagnosis = apiDiagnosis;
    if (!apiDiagnosis.is_inconclusive) {
      saveScanToHistory(apiDiagnosis);
    }

    loadingCard.hidden = true;
    state.isAnalysing = false;
    state.resultOrigin = 'scan';
    showScreen('result');
  }

  function renderResult(diag) {
    if (!diag) return;
    const t = I18N[state.lang];

    const resImage = document.getElementById('res-image');
    const primaryImg = diag.image || DEFAULT_RESULT_PHOTO;
    const fallbackImg = diag.fallbackImage || 'assets/cassava_mosaic.jpg';
    resImage.style.backgroundImage = `url('${primaryImg}'), url('${fallbackImg}')`;
    resImage.setAttribute('aria-label', `${diag.crop} — ${diag.condition}`);

    document.getElementById('res-crop').textContent = String(diag.crop || 'CASSAVA').toUpperCase();
    document.getElementById('res-condition').textContent =
      state.lang === 'lg' && diag.condition_lg ? diag.condition_lg : diag.condition;

    const confPct = typeof diag.confidence === 'number' ? Math.round(diag.confidence * 100) : null;
    const isLowConf = Boolean(diag.is_inconclusive) || (typeof diag.confidence === 'number' && diag.confidence < 0.5);
    const isModConf = !isLowConf && typeof diag.confidence === 'number' && diag.confidence < 0.75;
    const baseConfText = isLowConf
      ? t.lowConfidence
      : isModConf
        ? t.moderateConfidence
        : t.highConfidence;

    const confEl = document.getElementById('res-confidence');
    confEl.textContent = confPct !== null ? `${baseConfText} (${confPct}%)` : baseConfText;
    confEl.parentElement?.classList.toggle('is-low', isLowConf);

    const sev = String(diag.severity || 'moderate').toLowerCase();
    const resSev = document.getElementById('res-severity');
    const resBar = document.getElementById('res-severity-bar');
    const resNote = document.getElementById('res-severity-note');

    resSev.className = '';
    resBar.className = '';

    if (sev === 'inconclusive' || diag.is_inconclusive) {
      resSev.textContent = state.lang === 'lg' ? 'Tekirabika' : 'Unclear photo';
      resBar.classList.add('tone-inconclusive');
      resNote.textContent = state.lang === 'lg'
        ? 'Kuba ekifanyi ekirala ekiri okumpi mu kitangaala ekirungi.'
        : 'Retake a closer, well-lit photo of a single affected leaf.';
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

    const steps = Array.isArray(diag.steps) && diag.steps.length ? diag.steps : CATALOG.cassava.steps;
    document.getElementById('res-step-count').textContent = `1–${steps.length}`;

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
  // HISTORY PERSISTENCE
  // =========================================================
  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {
      // ignore storage errors
    }
    return DEFAULT_HISTORY.slice();
  }

  function saveScanToHistory(diag) {
    try {
      const list = loadHistory();
      const sev = String(diag.severity || 'moderate').toLowerCase();
      const normalizedSev = sev === 'none' ? 'healthy' : sev;

      const timeStr = 'Today, ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const thumbClass = normalizedSev === 'high'
        ? 'thumb-high'
        : normalizedSev === 'healthy'
          ? 'thumb-1'
          : 'thumb-moderate';

      list.unshift({
        id: 'scan-' + Date.now(),
        time: timeStr,
        crop: diag.crop,
        condition: diag.condition,
        severity: normalizedSev,
        thumbClass,
        icon: normalizedSev === 'healthy' ? 'shield' : 'leaf',
        diagnosis: diag
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 25)));
    } catch (_) {
      // ignore storage errors
    }
  }

  function renderHistory() {
    const scans = loadHistory();
    document.getElementById('history-count').textContent = String(scans.length);
    const container = document.getElementById('history-list');
    container.innerHTML = '';

    scans.forEach((scan) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'history-item';

      const sev = String(scan.severity || 'moderate').toLowerCase();
      const iconSvg = scan.icon === 'shield' ? SVG_ICONS.shield : SVG_ICONS.leaf;

      btn.innerHTML = `
        <span class="history-thumb ${escapeHtml(scan.thumbClass || 'thumb-0')}">${iconSvg}</span>
        <div>
          <small>${escapeHtml(scan.time)}</small>
          <strong>${escapeHtml(scan.crop)}</strong>
          <span>${escapeHtml(scan.condition)}</span>
        </div>
        <em class="${escapeHtml(sev)}">${escapeHtml(sev)}</em>
        ${SVG_ICONS.arrow}
      `;

      btn.addEventListener('click', () => {
        const chosen = scan.diagnosis
          ? cloneDiagnosis(scan.diagnosis)
          : cloneDiagnosis(CATALOG[scan.catalogKey] || CATALOG.cassava);
        state.currentDiagnosis = chosen;
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
    if (!('speechSynthesis' in window)) {
      return;
    }

    const diag = state.currentDiagnosis || CATALOG.cassava;
    const text = state.lang === 'lg' ? diag.advice_luganda || diag.advice : diag.advice;

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

    let tips = DEFAULT_PREVENTION_TIPS;
    if (live && live.advice) {
      titleEl.textContent =
        state.lang === 'lg'
          ? `Okuziyiza ${live.condition}`
          : `${live.condition} prevention`;
      tips = buildStepsFromAdvice(live.advice, live.advice_luganda);
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

  function bindEvents() {
    // Welcome
    document.getElementById('btn-lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('btn-lang-lg').addEventListener('click', () => setLanguage('lg'));
    document.getElementById('btn-start').addEventListener('click', () => showScreen('scan'));
    document.getElementById('btn-open-history').addEventListener('click', () => showScreen('history'));

    // Scan
    document.getElementById('btn-scan-back').addEventListener('click', () => showScreen('welcome'));
    document.getElementById('btn-scan-bell').addEventListener('click', () => showScreen('nearby'));
    document.getElementById('btn-capture').addEventListener('click', runCapture);

    document.getElementById('scan-district').addEventListener('change', (e) => {
      setDistrict(e.target.value);
    });
    document.getElementById('scan-crop-hint').addEventListener('change', (e) => {
      state.cropHint = e.target.value;
      if (!state.selectedFile) {
        const asset = getSampleAssetForHint();
        document.getElementById('scan-photo').style.backgroundImage = `url('${asset.path}')`;
      }
    });

    const fileInput = document.getElementById('file-input');
    document.getElementById('btn-gallery').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      state.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        state.previewUrl = String(ev.target.result || '');
        document.getElementById('scan-photo').style.backgroundImage = `url('${state.previewUrl}')`;
        runCapture();
      };
      reader.readAsDataURL(file);
    });

    // Result
    document.getElementById('btn-result-back').addEventListener('click', () => {
      showScreen(state.resultOrigin === 'history' ? 'history' : 'scan');
    });
    document.getElementById('btn-result-bell').addEventListener('click', () => showScreen('nearby'));
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
      const backTarget = state.previousScreen && state.previousScreen !== 'nearby' ? state.previousScreen : 'result';
      showScreen(backTarget);
    });
    document.getElementById('btn-nearby-bell').addEventListener('click', () => {
      renderPreventionTips();
      document.getElementById('sheet-tips').hidden = false;
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
    renderNearbyAlertView();
    renderPreventionTips();
    renderHistory();
    renderResult(state.currentDiagnosis);
    loadMockFallbackData();
    checkBackendHealth();
    fetchNearbyOutbreaks();
    registerServiceWorker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
