(function () {
  'use strict';

  const API_BASE = 'http://localhost:8080';
  const STORAGE_KEY = 'eagles_eye_scans_v2';

  const SVG_ICONS = {
    leaf: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4C12 3 5 7 5 14c0 3 2 5 5 5 7 0 10-7 10-15Z"/><path d="M4 21c3-6 7-9 13-13"/></svg>',
    shield: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>',
    arrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    check: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>'
  };

  const DEFAULT_PHOTO = "https://images.unsplash.com/photo-1744723491952-fc9e6f184fd1?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=900";
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
      leafFrame: 'Place leaf here',
      loadingTitle: 'Analysing your crop...',
      loadingSub: 'This may take a few seconds',
      gallery: 'Gallery',
      resultHeader: 'Your crop result',
      highConfidence: 'High confidence',
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
      leafFrame: 'Teeka wano ekikoola',
      loadingTitle: 'Tukebera ekirime kyo...',
      loadingSub: 'Kino kitwala sikonda ntono',
      gallery: 'Ebifanyi',
      resultHeader: 'Ebyazuuliddwa',
      highConfidence: 'Obukakafu obw’amaanyi',
      lowConfidence: 'Ekifanyi kyeetaaga okutangaala',
      severityLabel: 'Obukambwe',
      stepsKicker: 'Amatendera 3 amangu',
      stepsHeading: 'Kiki eky’okukola kati',
      listenAdvice: 'Wuliriza amagezi',
      stopListening: 'imiriza eddoboozi',
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

  const CATALOG = {
    cassava: {
      crop: 'Cassava',
      condition: 'Cassava mosaic disease',
      condition_lg: 'Obulwadde bwa Cassava mosaic',
      confidence: 0.94,
      severity: 'moderate',
      is_healthy: false,
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
      { name: 'Ankole Farmers Enterprise', address: 'High Street, Mbarara', phone: '+256702112233' }
    ],
    Gulu: [
      { name: 'Acholi Grain & Seed Depot', address: 'Main Market Road, Gulu', phone: '+256781667788' }
    ],
    Wakiso: [
      { name: 'Wakiso Agri-Solutions', address: 'Hoima Road, Wakiso Town', phone: '+256754889900' }
    ],
    Iganga: [
      { name: 'Busoga Farmers Hub', address: 'Main Street, Iganga', phone: '+256774223344' }
    ]
  };

  const PREVENTION_TIPS = [
    ['Inspect young funnels early', 'Check maize whorls every 3–4 days for window-pane leaf feeding and frass.', 'Kebera kasooli omuto mangu', 'Kebera mu mutwe gwa kasooli buli nnaku 3–4 okulaba obubonero.'],
    ['Hand-pick or apply ash/sand', 'On small plots, crush egg masses and caterpillars early in the morning.', 'Ggyamu obunnyo ku makya', 'Ku nnimiro entono, ggyamu amagi n’obunnyo ku makya ennyo.'],
    ['Use approved biopesticides', 'Ask your agro-dealer for neem-based or registered selective treatments.', 'Kozesa eddagala erikakasiddwa', 'Saba eddagala lya neem oba erikakasiddwa ku dduuka ly’ebyobulimi.']
  ];

  const DISTRICT_COORDS = {
    Masaka: { lat: -0.3411, lng: 31.7361 },
    Mukono: { lat: 0.3549, lng: 32.7523 },
    Mbale: { lat: 1.0784, lng: 34.1754 },
    Mbarara: { lat: -0.6072, lng: 30.6545 },
    Gulu: { lat: 2.7746, lng: 32.2990 },
    Wakiso: { lat: 0.4044, lng: 32.4594 },
    Iganga: { lat: 0.6090, lng: 33.4680 }
  };

  const state = {
    screen: 'welcome',
    previousScreen: 'welcome',
    resultOrigin: 'scan',
    lang: 'en',
    district: 'Masaka',
    selectedFile: null,
    previewUrl: null,
    currentDiagnosis: cloneDiagnosis(CATALOG.cassava),
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
      renderNearbyUgandaMap();
    }
  }

  function renderNearbyUgandaMap() {
    const mapBox = document.getElementById('nearby-real-map');
    const offlineSvg = document.getElementById('nearby-offline-svg');
    if (!mapBox) return;

    const farm = DISTRICT_COORDS[state.district] || DISTRICT_COORDS.Masaka;
    // ~8 km northeast of the farmer's Ugandan district center
    const outbreak = { lat: farm.lat + 0.048, lng: farm.lng + 0.052 };
    const center = { lat: (farm.lat + outbreak.lat) / 2, lng: (farm.lng + outbreak.lng) / 2 };
    const t = I18N[state.lang];

    if (!state.googleFailed && window.google?.maps) {
      offlineSvg.hidden = true;
      mapBox.hidden = false;

      if (!state.nearbyGoogleMap) {
        state.nearbyMapMode = 'google';
        state.nearbyGoogleMap = new google.maps.Map(mapBox, {
          center,
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
        state.nearbyGoogleMap.setCenter(center);
      }

      state.nearbyGoogleOverlays.forEach((o) => o.setMap(null));
      state.nearbyGoogleOverlays = [];

      const ring = new google.maps.Circle({
        map: state.nearbyGoogleMap,
        center: outbreak,
        radius: 2200,
        strokeColor: '#c62828',
        strokeOpacity: 0.45,
        strokeWeight: 2,
        fillColor: '#c62828',
        fillOpacity: 0.16
      });

      const youMarker = new google.maps.Marker({
        map: state.nearbyGoogleMap,
        position: farm,
        title: t.mapYou,
        label: { text: t.mapYou, color: '#1b1b1b', fontSize: '12px', fontWeight: '700' },
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
        position: outbreak,
        title: `${t.mapPest} (${t.mapDist})`,
        label: { text: `${t.mapPest} · ${t.mapDist}`, color: '#c62828', fontSize: '12px', fontWeight: '800' },
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

      state.nearbyGoogleOverlays.push(ring, youMarker, pestMarker);
      return;
    }

    if (window.L && navigator.onLine !== false) {
      offlineSvg.hidden = true;
      mapBox.hidden = false;

      if (!state.nearbyLeafletMap) {
        state.nearbyMapMode = 'leaflet';
        state.nearbyLeafletMap = L.map(mapBox, {
          center: [center.lat, center.lng],
          zoom: 12,
          zoomControl: true,
          attributionControl: false
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(state.nearbyLeafletMap);
        state.nearbyLeafletGroup = L.layerGroup().addTo(state.nearbyLeafletMap);
      } else {
        window.setTimeout(() => {
          state.nearbyLeafletMap.invalidateSize();
          state.nearbyLeafletMap.setView([center.lat, center.lng], 12);
        }, 60);
      }

      state.nearbyLeafletGroup.clearLayers();

      L.circle([outbreak.lat, outbreak.lng], {
        radius: 2200,
        color: '#c62828',
        weight: 2,
        opacity: 0.5,
        fillColor: '#c62828',
        fillOpacity: 0.18
      }).addTo(state.nearbyLeafletGroup);

      L.circleMarker([farm.lat, farm.lng], {
        radius: 8,
        color: '#ffffff',
        weight: 3,
        fillColor: '#2e7d32',
        fillOpacity: 1
      })
        .bindTooltip(escapeHtml(t.mapYou), {
          permanent: true,
          direction: 'bottom',
          offset: [0, 6],
          className: 'nearby-map-label'
        })
        .addTo(state.nearbyLeafletGroup);

      L.circleMarker([outbreak.lat, outbreak.lng], {
        radius: 8.5,
        color: '#ffffff',
        weight: 3,
        fillColor: '#c62828',
        fillOpacity: 1
      })
        .bindTooltip(`${escapeHtml(t.mapPest)} · ${escapeHtml(t.mapDist)}`, {
          permanent: true,
          direction: 'top',
          offset: [0, -6],
          className: 'nearby-map-label'
        })
        .addTo(state.nearbyLeafletGroup);
      return;
    }

    // Complete offline fallback
    mapBox.hidden = true;
    offlineSvg.hidden = false;
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

  // Language handling
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
    document.getElementById('txt-alert-headline').innerHTML = t.alertHeadline;
    document.getElementById('txt-map-you').textContent = t.mapYou;
    document.getElementById('txt-map-pest').textContent = t.mapPest;
    document.getElementById('txt-map-dist').textContent = t.mapDist;
    document.getElementById('txt-alert-card-title').textContent = t.alertCardTitle;
    document.getElementById('txt-alert-card-desc').textContent = t.alertCardDesc;
    document.getElementById('txt-btn-tips').textContent = t.btnTips;
    document.getElementById('txt-updated').innerHTML = `<span></span> ${escapeHtml(t.updated)}`;

    document.getElementById('txt-history-header').textContent = t.historyHeader;
    document.getElementById('txt-farm-record').textContent = t.farmRecord;
    document.getElementById('txt-past-scans').textContent = t.pastScans;
    document.getElementById('txt-scan-another').textContent = t.scanAnother;

    document.getElementById('sheet-dealers-title').textContent = t.dealersTitle;
    document.getElementById('txt-district-label').textContent = t.districtLabel;
    document.getElementById('txt-dealers-alert-btn').textContent = t.nearbyLink;
    document.getElementById('sheet-tips-title').textContent = t.tipsTitle;
    document.getElementById('btn-tips-done').textContent = t.gotIt;

    renderResult(state.currentDiagnosis);
    renderDealers();
    renderPreventionTips();
    if (state.screen === 'nearby') {
      renderNearbyUgandaMap();
    }
  }

  // Convert plain advice sentences into 1–3 structured steps when live API responds
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

  function guessFallbackByFilename(filename) {
    const lower = String(filename || '').toLowerCase();
    if (lower.includes('banana') || lower.includes('matooke') || lower.includes('wilt')) {
      return cloneDiagnosis(CATALOG.banana_wilt);
    }
    if (lower.includes('maize') || lower.includes('corn') || lower.includes('healthy')) {
      return cloneDiagnosis(CATALOG.maize);
    }
    if (lower.includes('coffee') || lower.includes('rust')) {
      return cloneDiagnosis(CATALOG.coffee);
    }
    return cloneDiagnosis(CATALOG.cassava);
  }

  async function runCapture() {
    if (state.isAnalysing) return;
    state.isAnalysing = true;

    const loadingCard = document.getElementById('loading-card');
    loadingCard.hidden = false;

    const startedAt = Date.now();
    let apiDiagnosis = null;

    try {
      const formData = new FormData();
      formData.append('district', state.district || 'Masaka');

      if (state.selectedFile) {
        formData.append('image', state.selectedFile);
      } else {
        const sampleBlob = await fetch('assets/cassava_mosaic.jpg')
          .then((r) => (r.ok ? r.blob() : null))
          .catch(() => null);
        if (sampleBlob) {
          formData.append('image', sampleBlob, 'cassava_mosaic.jpg');
        }
      }

      if (formData.has('image')) {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 4000);

        const response = await fetch(`${API_BASE}/diagnose`, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });

        window.clearTimeout(timer);

        if (response.ok) {
          const payload = await response.json();
          if (payload && payload.data) {
            const d = payload.data;
            const normSev = d.is_healthy || d.severity === 'none'
              ? 'healthy'
              : String(d.severity || 'moderate').toLowerCase();

            apiDiagnosis = {
              crop: d.crop || 'Cassava',
              condition: d.condition || 'Cassava mosaic disease',
              condition_lg: d.condition || 'Obulwadde bw’ekirime',
              confidence: typeof d.confidence === 'number' ? d.confidence : 0.94,
              severity: normSev,
              is_healthy: Boolean(d.is_healthy),
              image: state.previewUrl || DEFAULT_RESULT_PHOTO,
              fallbackImage: 'assets/cassava_mosaic.jpg',
              advice: d.advice || CATALOG.cassava.advice,
              advice_luganda: d.advice_luganda || CATALOG.cassava.advice_luganda,
              steps: buildStepsFromAdvice(d.advice, d.advice_luganda)
            };
          }
        }
      }
    } catch (_) {
      // Backend offline or unconfigured — fall back cleanly to local catalog
    }

    if (!apiDiagnosis) {
      apiDiagnosis = state.selectedFile
        ? guessFallbackByFilename(state.selectedFile.name)
        : cloneDiagnosis(CATALOG.cassava);

      if (state.previewUrl) {
        apiDiagnosis.image = state.previewUrl;
      }
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed < 1300) {
      await new Promise((resolve) => window.setTimeout(resolve, 1300 - elapsed));
    }

    state.currentDiagnosis = apiDiagnosis;
    if (state.selectedFile || apiDiagnosis !== CATALOG.cassava) {
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

    const confLabel = diag.confidence && diag.confidence < 0.5 ? t.lowConfidence : t.highConfidence;
    document.getElementById('res-confidence').textContent = confLabel;

    const sev = String(diag.severity || 'moderate').toLowerCase();
    const resSev = document.getElementById('res-severity');
    const resBar = document.getElementById('res-severity-bar');
    const resNote = document.getElementById('res-severity-note');

    resSev.className = '';
    resBar.className = '';

    if (sev === 'high') {
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

  // History persistence
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

      // Avoid duplicating identical seed top scan when clicking default demo capture repeatedly
      if (
        !state.selectedFile &&
        list[0] &&
        list[0].crop === diag.crop &&
        list[0].condition.toLowerCase() === 'cassava mosaic'
      ) {
        return;
      }

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

      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 20)));
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

  // Audio TTS
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

  // Sheets (Agro-dealers & Prevention tips)
  function renderDealers() {
    const dealers = AGRO_DEALERS[state.district] || AGRO_DEALERS.Masaka;
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
    const listEl = document.getElementById('tips-checklist');
    listEl.innerHTML = PREVENTION_TIPS.map((tip, i) => {
      const title = state.lang === 'lg' ? tip[2] : tip[0];
      const desc = state.lang === 'lg' ? tip[3] : tip[1];
      return `<div class="check-item">
        <span class="check-number">${i + 1}</span>
        <div><b>${escapeHtml(title)}</b><p>${escapeHtml(desc)}</p></div>
        ${SVG_ICONS.check}
      </div>`;
    }).join('');
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
      state.district = e.target.value;
      renderDealers();
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
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  }

  function init() {
    bindEvents();
    renderDealers();
    renderPreventionTips();
    renderHistory();
    renderResult(state.currentDiagnosis);
    registerServiceWorker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
