// ==========================================
// CONFIGURATION ET BASE DE DONNÉES K-SHELF
// ==========================================

// --- Liste blanche Spotify ---
// Seuls ces emails voient les fonctionnalités Spotify (player + onglet Stats).
// Pour autoriser quelqu'un : ajoute son email Google (en minuscules) à cette liste.
const SPOTIFY_ALLOWLIST = [
  "noahguerbois@gmail.com",
  // "ami1@gmail.com",
  // "ami2@gmail.com",
];

// Renvoie true si l'utilisateur connecté a le droit d'utiliser Spotify
function spotifyAccessAllowed() {
  const user = window._currentUser;
  if (!user || !user.email) return false;
  return SPOTIFY_ALLOWLIST.includes(user.email.trim().toLowerCase());
}
window.spotifyAccessAllowed = spotifyAccessAllowed;

// Applique la visibilité des éléments Spotify selon la liste blanche
function applySpotifyVisibility() {
  const allowed = spotifyAccessAllowed();
  document.body.classList.toggle("spotify-allowed", allowed);
  document.body.classList.toggle("spotify-denied", !allowed);
}
window.applySpotifyVisibility = applySpotifyVisibility;

const agencyThemes = {
  HYBE: "#F5FF00",
  "SM Entertainment": "#de6b7f",
  "JYP Entertainment": "#0091ea",
  "YG Entertainment": "#a8a8a8",
  "The Black Label": "#ffffff",
  "Autres / Indés": "#34d399",
};

// Renvoie la luminance approximative d'une couleur hex (0 = noir, 255 = blanc)
function colorLuminance(hex) {
  const c = hex.replace("#", "");
  if (c.length !== 6) return 128;
  const r = parseInt(c.slice(0,2), 16);
  const g = parseInt(c.slice(2,4), 16);
  const b = parseInt(c.slice(4,6), 16);
  return 0.299*r + 0.587*g + 0.114*b;
}

// Couleur de titre d'agence adaptée : garde la couleur de marque si elle est
// suffisamment visible, sinon bascule sur la variable de texte du thème
function agencyTitleColor(agency) {
  const brand = agencyThemes[agency];
  if (!brand) return "var(--text-primary)";
  // Couleur trop claire (blanc/quasi-blanc) → laisser le thème décider
  if (colorLuminance(brand) > 225) return "var(--text-primary)";
  return brand;
}

// ==========================================
// ÉTAT VIDE UNIFIÉ (composant réutilisable)
// ==========================================
// icon : chemin SVG (contenu intérieur d'un <svg> 24x24 stroke)
// title, desc : textes ; action (optionnel) : { label, onclick }
function emptyState(icon, title, desc, action) {
  const btn = action
    ? `<button class="empty-action-btn" onclick="${action.onclick}">
         <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
         ${action.label}
       </button>`
    : "";
  return `
    <div class="empty-state">
      <div class="empty-state-icon">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>
      </div>
      <p class="empty-state-title">${title}</p>
      <p class="empty-state-desc">${desc}</p>
      ${btn}
    </div>`;
}
window.emptyState = emptyState;

const defaultCollectionData = {
  HYBE: {
    NewJeans: [
      { title: "NewJeans - New Jeans (Bluebook, minji ver)", img: "https://m.media-amazon.com/images/I/61SZb-7QRgL.jpg", status: "owned", mp3: "musique/newjeans-hypeboy.mp3" },
      { title: "NEWJEANS - GET UP (The POWERPUFF GIRLS X NJ Box ver.)", img: "https://media.asiaworldmusic.fr/83471-large_default/newjeans-get-up-the-powerpuff-girls-x-nj-box-ver.jpg", status: "owned", mp3: "" },
      { title: "NewJeans - How Sweet (Minji ver.)", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkQBtDTTgm3-keFp8w8jOKCVV0xab46cHc-NOf6uCb_7klRh2utd-sSn8&s=10", status: "wishlist", mp3: "" },
      { title: "NewJeans - How Sweet (hyein ver.)", img: "https://m.media-amazon.com/images/I/51KTPXH9ZLL.jpg", status: "owned", mp3: "" },
      { title: "NewJeans - 'Supernatural' NJ X MURAKAMI (Minji ver.)", img: "https://www.broadcastfantasia.com/cdn/shop/files/newjeans_supernatural_cross_bag_minji.png?v=1718646323&width=800", status: "owned", mp3: "" },
    ],
    BTS: [{ title: "AIRIRANG", img: "https://media.asiaworldmusic.fr/96592-large_default/bts-arirang-living-legend-ver.jpg", status: "owned", mp3: "" }],
    CORTIS: [
      { title: "CORTIS - COLOR OUTSIDE THE LINES", img: "https://media.asiaworldmusic.fr/93541-large_default/cortis-color-outside-the-lines.jpg", status: "owned", mp3: "" },
      { title: "CORTIS - GREENGREEN (bridge ver)", img: "https://media.asiaworldmusic.fr/97250-large_default/cortis-greengreen.jpg", status: "wishlist", mp3: "" },
      { title: "CORTIS - GREENGREEN (studio ver)", img: "https://media.asiaworldmusic.fr/97250-large_default/cortis-greengreen.jpg", status: "owned", mp3: "" },
    ],
    "LE Sserafim": [
      { title: "LE SSERAFIM - SPAGHETTI", img: "https://media.asiaworldmusic.fr/94280-large_default/le-sserafim-spaghetti.jpg", status: "owned", mp3: "musique/le-sserafim-spaghetti.mp3" },
      { title: "LE SSERAFIM - SPAGHETTI (COMPACT ver.)", img: "https://media.asiaworldmusic.fr/94281-large_default/le-sserafim-spaghetti-compact-ver.jpg", status: "wishlist", mp3: "musique/le-sserafim-blue-flame.mp3" },
      { title: "LE SSERAFIM - PUREFLOW pt.1 (COMPACT Ver.)", img: "https://media.asiaworldmusic.fr/98167-large_default/le-sserafim-pureflow-pt1.jpg", status: "owned", mp3: "musique/le-sserafim-antifragile.mp3" },
    ],
    ILLIT: [{ title: "ILLIT - NOT CUTE ANYMORE", img: "https://media.asiaworldmusic.fr/94638-large_default/illit-not-cute-anymore.jpg", status: "wishlist", mp3: "musique/illit-nca.mp3" }],
    Enhypen: [
      { title: "ENHYPEN - DARK MOON SPECIAL ALBUM 'MEMORABILIA' (Moon ver.)", img: "https://media.asiaworldmusic.fr/86009-large_default/enhypen-dark-moon-special-album-memorabilia-moon-ver.jpg", status: "owned", mp3: "" },
    ],
    KATSEYE: [{ title: "KATSEYE - BEAUTIFUL CHAOS", img: "https://media.asiaworldmusic.fr/91679-large_default/katseye-beautiful-chaos.jpg", status: "wishlist", mp3: "" }],
  },
  "SM Entertainment": {
    EXO: [{ title: "Exo - War: The Power Of Music (Korean Version)", img: "https://m.media-amazon.com/images/I/81VQC8EooOL._UF894,1000_QL80_.jpg", status: "owned", mp3: "" }],
    AESPA: [{ title: "aespa - LEMONADE (ACID, Winter Ver.)", img: "https://media.asiaworldmusic.fr/97934-large_default/aespa-lemonade-acid-ver.jpg", status: "wishlist", mp3: "" }],
    Hearts2hearts: [
      { title: "Hearts2Hearts - Lemon Tang (Photobook, Beach Ver.)", img: "https://media.asiaworldmusic.fr/98459-large_default/hearts2hearts-lemon-tang-photobook-ver.jpg", status: "owned", mp3: "musique/hearts2hearts-lemontang.mp3" },
      { title: "Hearts2Hearts - Lemon Tang (Photobook, Sun Ver.)", img: "https://media.asiaworldmusic.fr/98459-large_default/hearts2hearts-lemon-tang-photobook-ver.jpg", status: "owned", mp3: "musique/hearts2hearts-RUDE!.mp3" },
      { title: "Hearts2Hearts - Lemon Tang (Jewel Case Ver.)", img: "https://media.asiaworldmusic.fr/98461-large_default/hearts2hearts-lemon-tang-jewel-case-ver.jpg", status: "wishlist", mp3: "musique/hearts2hearts-heart-emoji-(♡).mp3" },
    ],
  },
  "JYP Entertainment": {
    TWICE: [
      { title: "TWICE - STRATEGY", img: "https://media.asiaworldmusic.fr/89551-thickbox_default/twice-strategy.jpg", status: "owned", mp3: "musique/twice-strategy.mp3" },
      { title: "TWICE - THIS IS FOR", img: "https://media.asiaworldmusic.fr/92660-thickbox_default/twice-this-is-for.jpg", status: "owned", mp3: "musique/twice-this-is-for.mp3" },
      { title: "TWICE - TEN: The Story Goes On (MOMO ver.)", img: "https://media.asiaworldmusic.fr/94071-large_default/twice-ten-the-story-goes-on-cast-ver.jpg", status: "wishlist", mp3: "musique/twice-move-like-that-(momo).mp3" },
    ],
    "STRAY KIDS": [
      { title: "[EUROPE] Stray Kids - KARMA (KARMA ver.)", img: "https://media.asiaworldmusic.fr/93126-large_default/stray-kids-karma-karma-ver.jpg", status: "owned", mp3: "" },
      { title: "Stray Kids - SKZ IT TAPE 'DO IT' (IT ver.)", img: "https://media.asiaworldmusic.fr/94816-large_default/stray-kids-skz-it-tape-do-it-it-ver.jpg", status: "owned", mp3: "" },
    ],
  },
  "YG Entertainment": {
    BABYMONSTER: [{ title: "BABYMONSTER - WE GO UP (PATTERN, Ahyeon ver.)", img: "https://media.asiaworldmusic.fr/93904-large_default/babymonster-we-go-up-pattern-ver.jpg", status: "owned", mp3: "musique/babymonster-we-go-up.mp3" }],
  },
  "The Black Label": {
    MEOVV: [{ title: "MEOVV - BITE NOW (PHOTOBOOK, Beast Ver.)", img: "https://media.asiaworldmusic.fr/98021-large_default/meovv-bite-now-photobook-ver.jpg", status: "owned", mp3: "" }],
  },
  "Autres / Indés": {
    "CLOSE YOUR EYES": [{ title: "CLOSE YOUR EYES - blackout (blackout ver.)", img: "https://media.asiaworldmusic.fr/94632-large_default/close-your-eyes-blackout-blackout-ver.jpg", status: "owned", mp3: "" }],
  },
};

// Photocards data (sauvegardé en localStorage)
let photocardsData = JSON.parse(localStorage.getItem("kshelf_photocards")) || [
  { id: "pc1", artist: "NewJeans", member: "Minji", album: "How Sweet", img: "", status: "owned", page: 0, slot: 0 },
  { id: "pc2", artist: "NewJeans", member: "Hanni", album: "How Sweet", img: "", status: "owned", page: 0, slot: 1 },
  { id: "pc3", artist: "LE Sserafim", member: "Kazuha", album: "SPAGHETTI", img: "", status: "favorite", page: 0, slot: 2 },
];

function savePhotocards() {
  localStorage.setItem("kshelf_photocards", JSON.stringify(photocardsData));
  syncSafe();
}

// Lightsticks data
let lightsticksData = JSON.parse(localStorage.getItem("kshelf_lightsticks") || "[]");

function saveLightsticks() {
  localStorage.setItem("kshelf_lightsticks", JSON.stringify(lightsticksData));
}

// Exposé pour Firebase (première connexion)
window.defaultCollectionData = defaultCollectionData;

// Collection vide par défaut — defaultCollectionData sert uniquement pour la démo
let collectionData = JSON.parse(localStorage.getItem("kshelf_save")) || {};
let currentPlaylist = [];
let currentTrackIndex = 0;

// profileExtra déclaré tôt pour être disponible avant que firebase.js
// (chargé en module async) ne tente d'y accéder
let profileExtra = JSON.parse(localStorage.getItem("kshelf_profile_extra") || "{}");
Object.defineProperty(window, 'profileExtra', {
  get: () => profileExtra,
  set: (v) => { profileExtra = v; },
  configurable: true
});

// DOM refs
const audioPlayer = document.getElementById("local-audio-player");
const playBtn     = document.getElementById("btn-play");
const prevBtn     = document.getElementById("btn-prev");
const nextBtn     = document.getElementById("btn-next");
const progressBar = document.getElementById("progress-bar");
const trackStatus = document.getElementById("track-status");
const playerTitle = document.getElementById("player-title");

// ==========================================
// PERSISTANCE
// ==========================================
// Queue de sync : si Firebase pas encore prêt, on mémorise et on sync dès qu'il l'est
let _syncPending = false;

function syncSafe() {
  if (window.syncToFirestore) {
    window.syncToFirestore();
    _syncPending = false;
  } else {
    _syncPending = true;
    // Toast visible sur mobile pour diagnostiquer
    const t = document.createElement("div");
    t.style.cssText = "position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:#f59e0b;color:#000;padding:8px 16px;border-radius:20px;font-size:12px;font-weight:700;z-index:9999;";
    t.innerText = "⏳ En attente de Firebase...";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  }
}

// Appelé par firebase.js dès que syncToFirestore est disponible
window._onSyncReady = function() {
  if (_syncPending) {
    console.log("🔄 Sync en attente déclenchée");
    window.syncToFirestore();
    _syncPending = false;
  }
};

function saveCollection() {
  localStorage.setItem("kshelf_save", JSON.stringify(collectionData));
  syncSafe();
}

// ==========================================
// SIDEBAR
// ==========================================
let sidebarTab = localStorage.getItem("kshelf_sidebar_tab") || "albums";

function switchSidebarTab(tab) {
  exitHome();
  sidebarTab = tab;
  localStorage.setItem("kshelf_sidebar_tab", tab);
  initSidebar();
  // Synchroniser l'état actif des onglets du header
  document.querySelectorAll(".header-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  if (tab === "albums")     showDashboard();
  else if (tab === "photocards") showBinder();
  else if (tab === "concerts")   showConcerts();
  else if (tab === "favorites")  showFavorites();
}
window.switchSidebarTab = switchSidebarTab;

function initSidebar() {
  // Synchroniser les onglets du header avec l'onglet actif
  document.querySelectorAll(".header-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === sidebarTab);
  });
  const nav = document.getElementById("sidebar-nav");
  let html = "";

  // Switch d'onglets en haut
  html += `<div class="sidebar-tabs">
    <button class="sidebar-tab-btn ${sidebarTab === 'albums' ? 'active' : ''}" onclick="switchSidebarTab('albums')">Albums</button>
    <button class="sidebar-tab-btn ${sidebarTab === 'photocards' ? 'active' : ''}" onclick="switchSidebarTab('photocards')">Photos</button>
    <button class="sidebar-tab-btn ${sidebarTab === 'concerts' ? 'active' : ''}" onclick="switchSidebarTab('concerts')">Concerts</button>
    <button class="sidebar-tab-btn ${sidebarTab === 'favorites' ? 'active' : ''}" onclick="switchSidebarTab('favorites')">★</button>
  </div>`;

  if (sidebarTab === "albums") {
    for (const agency in collectionData) {
      const color = agencyTitleColor(agency);
      html += `<div class="agency-section">
        <div class="agency-title" style="color:${color}">${agency}</div>
        <div class="artist-list">`;
      for (const artist in collectionData[agency]) {
        const sa = encodeURIComponent(artist);
        const sg = encodeURIComponent(agency);
        html += `<div class="artist-item" data-artist="${artist}" onclick="selectArtist('${sg}','${sa}')">${artist}</div>`;
      }
      html += `</div></div>`;
    }
    html += `<div class="agency-section">
      <div class="artist-list">
        <div class="artist-item lightstick-nav" onclick="showLightsticks()">✦ lightsticks</div>
      </div>
    </div>`;
  } else if (sidebarTab === "photocards") {
    const artists = (typeof getBinderArtists === "function") ? getBinderArtists() : [];
    html += `<div class="agency-section">
      <div class="artist-list">
        <div class="artist-item" onclick="showBinder('all')">Tout le binder</div>`;
    artists.forEach(a => {
      html += `<div class="artist-item" onclick="showBinder('${a.replace(/'/g,"\'")}')">${a}</div>`;
    });
    html += `</div></div>`;
  } else if (sidebarTab === "concerts") {
    html += `<div class="agency-section">
      <div class="artist-list">
        <div class="artist-item" onclick="showConcerts()">Tous mes concerts</div>
      </div>
    </div>`;
  } else if (sidebarTab === "favorites") {
    const favAlbums = [];
    for (const ag in collectionData)
      for (const ar in collectionData[ag])
        collectionData[ag][ar].forEach(a => { if (a.status === "favorite") favAlbums.push(a); });
    const favPcs   = photocardsData.filter(pc => pc.status === "favorite");
    html += `<div class="agency-section">
      <div class="artist-list">
        <div class="artist-item" onclick="showFavorites()">Tous les favoris</div>
        <div class="artist-item" onclick="showFavorites('albums')">Albums (${favAlbums.length})</div>
        <div class="artist-item" onclick="showFavorites('photocards')">Photocards (${favPcs.length})</div>
      </div>
    </div>`;
  }

  // Bouton ajout — contextuel selon l'onglet
  let addBtnLabel = "+ ajouter un album";
  let addBtnAction = "openAddModal()";
  if (sidebarTab === "photocards") { addBtnLabel = "+ ajouter une photocard"; addBtnAction = "openAddPhotocard(binderCurrentPage, findFirstEmptySlot())"; }
  if (sidebarTab === "concerts")   { addBtnLabel = "+ ajouter un concert";   addBtnAction = "openAddConcert()"; }
  if (sidebarTab === "favorites")  { addBtnLabel = ""; addBtnAction = ""; }

  html += `<div class="add-album-btn-wrap">
    <button class="add-album-nav-btn" onclick="${addBtnAction}">${addBtnLabel}</button>
  </div>`;
  nav.innerHTML = html;
}

// ==========================================
// PAGE D'ACCUEIL PLEIN ÉCRAN (mode home)
// ==========================================
function showHome() {
  const app = document.querySelector(".app-fullscreen");
  if (app) app.classList.add("home-mode");
  document.querySelectorAll(".header-tab").forEach(b => b.classList.remove("active"));
  renderHomeStats();
}
window.showHome = showHome;

// Quitter le mode accueil (au clic sur un onglet)
function exitHome() {
  const app = document.querySelector(".app-fullscreen");
  if (app) app.classList.remove("home-mode");
}
window.exitHome = exitHome;

// ==========================================
// SYSTÈME DE BADGES / ACHIEVEMENTS
// ==========================================
const BADGE_DEFS = [
  { id: "first_album", name: "Premier pas", desc: "Ajoute ton premier album", color: "#6366f1",
    icon: '<path d="M12 2v20M2 12h20"/>', check: s => s.totalAlbums >= 1 },
  { id: "collector_10", name: "Collectionneur", desc: "10 albums dans ta collection", color: "#8b5cf6",
    icon: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>', check: s => s.totalAlbums >= 10 },
  { id: "collector_25", name: "Passionné", desc: "25 albums dans ta collection", color: "#a855f7",
    icon: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>', check: s => s.totalAlbums >= 25 },
  { id: "collector_50", name: "Encyclopédie", desc: "50 albums dans ta collection", color: "#ec4899",
    icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>', check: s => s.totalAlbums >= 50 },
  { id: "multi_agency", name: "Éclectique", desc: "Des albums de 3 agences différentes", color: "#f97316",
    icon: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>', check: s => s.totalAgencies >= 3 },
  { id: "loyal_fan", name: "Fan dévoué", desc: "5 albums d'un même artiste", color: "#ef4444",
    icon: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>', check: s => s.maxArtistAlbums >= 5 },
  { id: "favorite_lover", name: "Coup de cœur", desc: "Marque 5 albums en favori", color: "#fbbf24",
    icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', check: s => s.favCount >= 5 },
  { id: "concert_goer", name: "Live addict", desc: "Vis ton premier concert", color: "#10b981",
    icon: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>', check: s => s.concertCount >= 1 },
  { id: "concert_veteran", name: "Vétéran des lives", desc: "5 concerts vécus", color: "#14b8a6",
    icon: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>', check: s => s.concertCount >= 5 },
  { id: "photocard_starter", name: "Binder ouvert", desc: "Ajoute ta première photocard", color: "#f472b6",
    icon: '<rect x="3" y="2" width="18" height="20" rx="2"/><circle cx="12" cy="9" r="3"/><path d="M7 19c1.5-2.5 8.5-2.5 10 0"/>', check: s => s.pcCount >= 1 },
  { id: "photocard_collector", name: "Chasseur de PC", desc: "10 photocards collectionnées", color: "#e879f9",
    icon: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 9h20"/><circle cx="7" cy="14" r="1.5"/>', check: s => s.pcCount >= 10 },
  { id: "globetrotter", name: "Globe-trotter", desc: "Des concerts dans 3 lieux différents", color: "#3b82f6",
    icon: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>', check: s => s.uniqueVenues >= 3 },
];

function computeCollectionStats() {
  let totalAlbums = 0, favCount = 0, maxArtistAlbums = 0;
  const artistCounts = {};
  const totalAgencies = Object.keys(collectionData).length;
  for (const agency in collectionData) {
    if (!collectionData[agency] || typeof collectionData[agency] !== "object") continue;
    for (const artist in collectionData[agency]) {
      const list = collectionData[agency][artist];
      if (!Array.isArray(list)) continue;
      artistCounts[artist] = (artistCounts[artist] || 0) + list.length;
      for (const alb of list) {
        if (!alb) continue;
        totalAlbums++;
        if (alb.status === "favorite") favCount++;
      }
    }
  }
  for (const a in artistCounts) if (artistCounts[a] > maxArtistAlbums) maxArtistAlbums = artistCounts[a];
  const pcCount = (typeof photocardsData !== "undefined" && Array.isArray(photocardsData) ? photocardsData : []).length;
  const concertCount = (typeof concertsData !== "undefined" && Array.isArray(concertsData) ? concertsData : []).length;
  const uniqueVenues = (typeof concertsData !== "undefined" && Array.isArray(concertsData))
    ? new Set(concertsData.filter(c => c.venue && c.venue.trim()).map(c => c.venue.trim().toLowerCase())).size
    : 0;
  return { totalAlbums, totalAgencies, favCount, maxArtistAlbums, pcCount, concertCount, uniqueVenues };
}

function renderBadgesHtml() {
  const stats = computeCollectionStats();
  const badges = BADGE_DEFS.map(b => ({ ...b, unlocked: b.check(stats) }));
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const cards = badges.map(b => `
    <div class="badge-card ${b.unlocked ? "unlocked" : "locked"}" title="${b.desc}">
      <div class="badge-icon" style="${b.unlocked ? `background:${b.color}1a; color:${b.color}` : ""}">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${b.icon}</svg>
      </div>
      <span class="badge-name">${b.name}</span>
      <span class="badge-desc">${b.desc}</span>
      ${b.unlocked ? '<div class="badge-check">✓</div>' : '<div class="badge-lock">🔒</div>'}
    </div>`).join("");
  return `
    <div class="home-section">
      <p class="dash-section-label">badges · ${unlockedCount}/${BADGE_DEFS.length} débloqués</p>
      <div class="badges-grid">${cards}</div>
    </div>`;
}

function renderHomeStats() {
  // Collecte sécurisée
  let totalAlbums = 0, favCount = 0;
  const allAlbums = [];
  const agencyCounts = {};
  const artistCounts = {};
  const totalAgencies = Object.keys(collectionData).length;
  let totalArtists = 0;

  for (const agency in collectionData) {
    if (!collectionData[agency] || typeof collectionData[agency] !== "object") continue;
    let agencyAlbumCount = 0;
    for (const artist in collectionData[agency]) {
      const list = collectionData[agency][artist];
      if (!Array.isArray(list)) continue;
      totalArtists++;
      artistCounts[artist] = (artistCounts[artist] || 0) + list.length;
      for (const alb of list) {
        if (!alb) continue;
        totalAlbums++;
        agencyAlbumCount++;
        if (alb.status === "favorite") favCount++;
        allAlbums.push({ ...alb, artist, agency });
      }
    }
    if (agencyAlbumCount) agencyCounts[agency] = agencyAlbumCount;
  }

  const pcCount = (typeof photocardsData !== "undefined" && Array.isArray(photocardsData) ? photocardsData : []).length;
  const concertCount = (typeof concertsData !== "undefined" && Array.isArray(concertsData) ? concertsData : []).length;

  // Artiste le plus collectionné
  let topArtist = "—", topArtistCount = 0;
  for (const a in artistCounts) if (artistCounts[a] > topArtistCount) { topArtist = a; topArtistCount = artistCounts[a]; }

  // Agence dominante (nom + pourcentage de la collection)
  let topAgency = "—", topAgencyCount = 0;
  for (const ag in agencyCounts) if (agencyCounts[ag] > topAgencyCount) { topAgency = ag; topAgencyCount = agencyCounts[ag]; }
  const topAgencyPct = totalAlbums ? Math.round((topAgencyCount / totalAlbums) * 100) : 0;

  // Répartition par agence (barres)
  const maxAgency = Math.max(1, ...Object.values(agencyCounts));
  const agencyBars = Object.entries(agencyCounts)
    .sort((a,b) => b[1]-a[1])
    .map(([ag, n]) => {
      const color = (typeof agencyTitleColor === "function") ? agencyTitleColor(ag) : "var(--accent)";
      const pct = Math.round((n / maxAgency) * 100);
      return `
        <div class="home-bar-row">
          <span class="home-bar-label">${ag}</span>
          <div class="home-bar-track"><div class="home-bar-fill" style="width:${pct}%; background:${color}"></div></div>
          <span class="home-bar-value">${n}</span>
        </div>`;
    }).join("");

  // Mosaïque récente
  const recent = allAlbums.filter(a => a.img).slice(-8).reverse();
  const mosaicHtml = recent.map(a => `
    <div class="dash-mosaic-item" onclick="selectArtist('${encodeURIComponent(a.agency)}','${encodeURIComponent(a.artist)}')" title="${a.title} — ${a.artist}">
      <img src="${a.img}" alt="${a.title}" loading="lazy">
    </div>`).join("");

  const isEmpty = totalAlbums === 0;

  document.getElementById("main-content").innerHTML = isEmpty ? `
    <div class="home-view animate-fade">
      <div class="home-hero">
        <p class="landing-tag">✦ votre collection k-pop virtuelle</p>
        <h1 class="home-title">k-shelf.</h1>
        <p class="welcome-desc">Ta collection est vide pour l'instant. Ajoute ton premier album ou explore la démo.</p>
        <div class="dash-empty-actions">
          <button class="add-submit-btn" style="max-width:260px" onclick="exitHome(); openAddModal()">+ Ajouter un album</button>
          <button class="dash-demo-btn" onclick="loadDemoCollection()">Explorer la démo →</button>
        </div>
      </div>
    </div>` : `
    <div class="home-view animate-fade">
      <div class="home-hero">
        <p class="landing-tag">✦ tableau de bord</p>
        <h1 class="home-title">ma collection.</h1>
      </div>

      <div class="home-stats-grid">
        <div class="home-stat"><span class="home-stat-num">${totalAlbums}</span><span class="home-stat-label">albums</span></div>
        <div class="home-stat"><span class="home-stat-num">${totalArtists}</span><span class="home-stat-label">artistes</span></div>
        <div class="home-stat"><span class="home-stat-num">${totalAgencies}</span><span class="home-stat-label">agences</span></div>
        <div class="home-stat"><span class="home-stat-num">${favCount}</span><span class="home-stat-label">★ favoris</span></div>
        <div class="home-stat"><span class="home-stat-num">${pcCount}</span><span class="home-stat-label">photocards</span></div>
        <div class="home-stat"><span class="home-stat-num">${concertCount}</span><span class="home-stat-label">concerts</span></div>
      </div>

      <div class="home-highlights">
        <div class="home-highlight-card">
          <span class="home-highlight-label">artiste le plus collectionné</span>
          <span class="home-highlight-value">${topArtist}</span>
          <span class="home-highlight-sub">${topArtistCount} album(s)</span>
        </div>
        <div class="home-highlight-card">
          <span class="home-highlight-label">agence dominante</span>
          <span class="home-highlight-value">${topAgency}</span>
          <span class="home-highlight-sub">${topAgencyCount ? topAgencyPct + "% de la collection" : "—"}</span>
        </div>
      </div>

      ${agencyBars ? `
      <div class="home-section">
        <p class="dash-section-label">répartition par agence</p>
        <div class="home-bars">${agencyBars}</div>
      </div>` : ""}

      ${recent.length ? `
      <div class="home-section">
        <p class="dash-section-label">ajoutés récemment</p>
        <div class="dash-mosaic home-mosaic">${mosaicHtml}</div>
      </div>` : ""}

      ${renderBadgesHtml()}

      <div class="home-credits">
        <span class="home-credits-label">Propulsé par</span>
        <div class="home-credits-logos">
          <span class="home-credit">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.66 13.5 1.62.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.1 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.32-1.32 11.4-1.02 15.9 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.36z"/></svg>
            Spotify
          </span>
          <span class="home-credit">
            <svg viewBox="0 0 24 24" width="15" height="15"><path fill="#FFA000" d="M3.89 15.67 6.26 2.6a.42.42 0 0 1 .78-.13l2.54 4.74z"/><path fill="#F57F17" d="m3.89 15.67 4.34-8.46 1.35 2.53z"/><path fill="#FFCA28" d="m3.89 15.67 8.32-9.9a.42.42 0 0 1 .72.14l1.4 4.06 1.85 3.44a.85.85 0 0 1-.32 1.12l-6.6 3.7a.85.85 0 0 1-.83 0z"/><path fill="#FFA000" d="M14.05 9.87 12.93 6.6a.42.42 0 0 0-.72-.14l-8.32 9.21z"/></svg>
            Firebase
          </span>
          <span class="home-credit">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="#D97757"><path d="M4.5 15.5 8.8 4.4a.6.6 0 0 1 1.12 0l4.3 11.1h-2.2l-.9-2.5H7.6l-.9 2.5zm3.8-4.4h2.9L9.75 7z"/><path d="M14.2 15.5 18.5 4.4a.6.6 0 0 1 1.12 0L24 15.5h-2.2z" opacity=".55"/></svg>
            Claude
          </span>
          <span class="home-credit">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z"/></svg>
            GitHub
          </span>
          <span class="home-credit">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h8M12 8v9" stroke="var(--bg,#000)" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
            Val Town
          </span>
        </div>
        <a class="home-credits-author" href="https://github.com/Nonowarwood" target="_blank" rel="noopener">by Nonowarwood</a>
      </div>
    </div>`;
}
window.renderHomeStats = renderHomeStats;

// ==========================================
// DASHBOARD
// ==========================================
function showDashboard() {
  document.querySelectorAll(".artist-item").forEach(el => el.classList.remove("active"));
  document.getElementById("album-search").value = "";
  document.documentElement.style.setProperty("--dynamic-agency-color", "rgba(255,255,255,0.2)");

  let totalAlbums = 0, totalArtists = 0, favCount = 0;
  const allAlbums = [];
  const totalAgencies = Object.keys(collectionData).length;
  for (const agency in collectionData) {
    if (!collectionData[agency] || typeof collectionData[agency] !== "object") continue;
    totalArtists += Object.keys(collectionData[agency]).length;
    for (const artist in collectionData[agency]) {
      const list = collectionData[agency][artist];
      if (!Array.isArray(list)) continue;
      for (const alb of list) {
        if (!alb) continue;
        totalAlbums++;
        if (alb.status === "favorite") favCount++;
        allAlbums.push({ ...alb, artist, agency });
      }
    }
  }
  const pcCount = (typeof photocardsData !== "undefined" && Array.isArray(photocardsData) ? photocardsData : []).length;
  const concertCount = (typeof concertsData !== "undefined" && Array.isArray(concertsData) ? concertsData : []).length;

  // Accueil engageant si collection vide
  if (totalAlbums === 0) {
    // Effet plein écran (sidebar masquée) pour les visiteurs sans collection
    const app = document.querySelector(".app-fullscreen");
    if (app && !window._currentUser) app.classList.add("home-mode");
    document.getElementById("main-content").innerHTML = `
      <div class="dashboard-view animate-fade">
        <div class="dash-hero-empty">
          <p class="landing-tag">✦ votre collection k-pop virtuelle</p>
          <h2 class="welcome-title">bienvenue sur k-shelf.</h2>
          <p class="welcome-desc">Albums, photocards, concerts et lightsticks — tout au même endroit, synchronisé sur tous vos appareils.</p>
          <div class="dash-empty-actions">
            <button class="add-submit-btn" style="max-width:260px" onclick="openAddModal()">+ Ajouter mon premier album</button>
            <button class="dash-demo-btn" onclick="loadDemoCollection()">Explorer la démo →</button>
          </div>
        </div>
        <div class="dash-quick-grid">
          <div class="dash-quick-card" onclick="openAddModal()">
            <div class="dash-quick-icon" style="background:rgba(99,102,241,0.12)">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <h3>Albums</h3>
            <p>Catalogue tes albums physiques par artiste et agence</p>
          </div>
          <div class="dash-quick-card" onclick="switchSidebarTab('photocards')">
            <div class="dash-quick-icon" style="background:rgba(236,72,153,0.12)">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="18" height="20" rx="2"/><circle cx="12" cy="9" r="3"/><path d="M7 19c1.5-2.5 8.5-2.5 10 0"/></svg>
            </div>
            <h3>Binder photocards</h3>
            <p>Organise tes photocards avec effets holo</p>
          </div>
          <div class="dash-quick-card" onclick="switchSidebarTab('concerts')">
            <div class="dash-quick-icon" style="background:rgba(249,115,22,0.12)">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            </div>
            <h3>Concerts</h3>
            <p>Archive tes souvenirs avec setlists et photos</p>
          </div>
          <div class="dash-quick-card" onclick="showLightsticks()">
            <div class="dash-quick-icon" style="background:rgba(234,179,8,0.12)">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V11h-4V9.5A4 4 0 0 1 12 2z"/><path d="M10 11h4l-1 11h-2l-1-11z"/></svg>
            </div>
            <h3>Lightsticks</h3>
            <p>Collectionne tes lightsticks officiels</p>
          </div>
        </div>
      </div>`;
    return;
  }

  // Mosaïque des 6 dernières pochettes ajoutées
  const recent = allAlbums.filter(a => a.img).slice(-6).reverse();
  const mosaicHtml = recent.map(a => `
    <div class="dash-mosaic-item" onclick="selectArtist('${encodeURIComponent(a.agency)}','${encodeURIComponent(a.artist)}')" title="${a.title} — ${a.artist}">
      <img src="${a.img}" alt="${a.title}" loading="lazy">
    </div>`).join("");

  // Collection présente → sidebar visible (désactive le mode plein écran landing)
  const appEl = document.querySelector(".app-fullscreen");
  if (appEl) appEl.classList.remove("home-mode");

  document.getElementById("main-content").innerHTML = `
    <div class="dashboard-view animate-fade">
      <h2 class="welcome-title">ma collection virtuelle.</h2>
      <p class="welcome-desc">explorez et gérez vos albums physiques en temps réel.</p>
      <div class="stats-grid">
        <div class="stat-card"><span class="stat-number">${totalAlbums}</span><br><span class="stat-label">albums</span></div>
        <div class="stat-card"><span class="stat-number">${totalArtists}</span><br><span class="stat-label">artistes</span></div>
        <div class="stat-card"><span class="stat-number">${totalAgencies}</span><br><span class="stat-label">agences</span></div>
        <div class="stat-card stat-card-clickable" onclick="switchSidebarTab('favorites')"><span class="stat-number">${favCount}</span><br><span class="stat-label">★ favoris</span></div>
        <div class="stat-card stat-card-clickable" onclick="switchSidebarTab('photocards')"><span class="stat-number">${pcCount}</span><br><span class="stat-label">photocards</span></div>
        <div class="stat-card stat-card-clickable" onclick="switchSidebarTab('concerts')"><span class="stat-number">${concertCount}</span><br><span class="stat-label">concerts</span></div>
      </div>
      ${recent.length ? `
      <div class="dash-section">
        <p class="dash-section-label">ajoutés récemment</p>
        <div class="dash-mosaic">${mosaicHtml}</div>
      </div>` : ""}
    </div>`;
}

// Mode démo — charge la collection par défaut temporairement
function loadDemoCollection() {
  collectionData = JSON.parse(JSON.stringify(defaultCollectionData));
  initSidebar();
  showDashboard();
  showDebugToast("✨ Mode démo — connecte-toi pour ta vraie collection", "#a855f7");
}
window.loadDemoCollection = loadDemoCollection;

// Vide entièrement la collection (irréversible)
function clearCollection() {
  const total = Object.values(collectionData).reduce((sum, ag) => {
    if (!ag || typeof ag !== "object") return sum;
    return sum + Object.values(ag).reduce((s, list) => s + (Array.isArray(list) ? list.length : 0), 0);
  }, 0);

  if (total === 0) {
    showDebugToast("Ta collection est déjà vide", "#808799");
    return;
  }

  const ok = confirm(`Supprimer définitivement tes ${total} album(s) ?\n\nCette action est irréversible.`);
  if (!ok) return;

  collectionData = {};
  saveCollection();
  if (window.syncToFirestore) window.syncToFirestore();
  initSidebar();
  closeSettings();
  showDashboard();
  showDebugToast("🗑 Collection vidée", "#ef4444");
}
window.clearCollection = clearCollection;

// ==========================================
// PARTAGE / PROFIL PUBLIC — réglages
// ==========================================
function getShareSettings() {
  if (window.shareSettings) return window.shareSettings;
  try {
    const s = JSON.parse(localStorage.getItem("kshelf_share_settings"));
    if (s) { window.shareSettings = s; return s; }
  } catch(e) {}
  window.shareSettings = (window.defaultShareSettings ? window.defaultShareSettings() : { enabled:true, albums:true, photocards:true, concerts:true, stats:false });
  return window.shareSettings;
}

function persistShareSettings() {
  localStorage.setItem("kshelf_share_settings", JSON.stringify(window.shareSettings));
  // Sauvegarder dans Firestore + resynchroniser la vitrine publique
  const user = window._currentUser;
  if (user && window.syncPublicProfile) {
    // Écrit shareSettings dans le doc privé puis régénère la copie publique
    if (window._writeShareSettings) window._writeShareSettings(user.uid, window.shareSettings);
    window.syncPublicProfile(user.uid);
  }
}

function updateShareUI() {
  const s = getShareSettings();
  const setChk = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };
  setChk("share-enabled", s.enabled);
  setChk("share-albums", s.albums);
  setChk("share-photocards", s.photocards);
  setChk("share-concerts", s.concerts);
  setChk("share-stats", s.stats);

  const opts = document.getElementById("share-options");
  if (opts) opts.style.opacity = s.enabled ? "1" : "0.4";
  if (opts) opts.style.pointerEvents = s.enabled ? "auto" : "none";

  const hint = document.getElementById("share-link-hint");
  const user = window._currentUser;
  if (hint) {
    if (!user) hint.textContent = "Connecte-toi pour obtenir ton lien.";
    else if (!s.enabled) hint.textContent = "Ton profil est privé. Active-le pour partager.";
    else hint.textContent = "Ton lien est prêt ! Colle-le où tu veux (bio, story…).";
  }
}
window.updateShareUI = updateShareUI;

async function toggleShareEnabled(val) {
  getShareSettings().enabled = val;
  persistShareSettings();
  updateShareUI();
  // À l'activation, on crée immédiatement la vitrine publique
  const user = window._currentUser;
  if (val && user && window.syncPublicProfile) {
    await window.syncPublicProfile(user.uid);
  }
}
window.toggleShareEnabled = toggleShareEnabled;

function updateShareSetting(key, val) {
  getShareSettings()[key] = val;
  persistShareSettings();
}
window.updateShareSetting = updateShareSetting;

async function copyShareLink() {
  const user = window._currentUser;
  if (!user) { showDebugToast("⚠️ Connecte-toi d'abord", "#f59e0b"); return; }
  if (!getShareSettings().enabled) { showDebugToast("⚠️ Active ton profil public d'abord", "#f59e0b"); return; }

  const link = `${location.origin}/K-Shelf/?profile=${user.uid}`;

  // Sur mobile/iPad : utiliser la feuille de partage native (WhatsApp, Messages…)
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Ma collection K-pop sur k-shelf.",
        text: "Découvre ma collection K-pop !",
        url: link,
      });
      // Sync en arrière-plan
      if (window.syncPublicProfile) window.syncPublicProfile(user.uid);
      return;
    } catch(e) {
      // L'utilisateur a annulé le partage, ou erreur → on tombe sur la copie
      if (e && e.name === "AbortError") return;
    }
  }

  // Sinon : copier dans le presse-papier
  let copied = false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(link);
      copied = true;
    }
  } catch(e) { copied = false; }

  if (!copied) {
    try {
      const ta = document.createElement("textarea");
      ta.value = link;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      copied = document.execCommand("copy");
      document.body.removeChild(ta);
    } catch(e) { copied = false; }
  }

  if (copied) showDebugToast("🔗 Lien copié !", "#1db954");
  else window.prompt("Copie ton lien de partage :", link);

  if (window.syncPublicProfile) window.syncPublicProfile(user.uid);
}
window.copyShareLink = copyShareLink;

function openShareModal() {
  document.getElementById("share-modal-overlay").classList.add("visible");
  updateShareUI();
}
window.openShareModal = openShareModal;

function closeShareModal() {
  document.getElementById("share-modal-overlay").classList.remove("visible");
}
window.closeShareModal = closeShareModal;

// ==========================================
// COMMUNAUTÉ — recherche + abonnements/abonnés
// ==========================================
let _communityTab = "following";
let _searchTimer = null;

function openCommunityModal() {
  const user = window._currentUser;
  if (!user) { showDebugToast("⚠️ Connecte-toi pour accéder à la communauté", "#f59e0b"); return; }
  document.getElementById("community-modal-overlay").classList.add("visible");
  document.getElementById("community-search-input").value = "";
  document.getElementById("community-search-results").innerHTML = "";
  switchCommunityTab("following");
}
window.openCommunityModal = openCommunityModal;

function closeCommunityModal() {
  document.getElementById("community-modal-overlay").classList.remove("visible");
}
window.closeCommunityModal = closeCommunityModal;

// Rendu d'une ligne utilisateur (avatar + pseudo + action)
function userRow(u, actionHtml) {
  const avatar = u.photoURL
    ? `<img src="${u.photoURL}" alt="" class="community-row-avatar">`
    : `<div class="community-row-avatar community-row-avatar-fb">${(u.pseudo||"?")[0].toUpperCase()}</div>`;
  return `
    <div class="community-row">
      <a href="?profile=${u.uid}" class="community-row-link">
        ${avatar}
        <span class="community-row-name">${u.pseudo || "Collectionneur"}</span>
      </a>
      ${actionHtml || ""}
    </div>`;
}

// Recherche d'utilisateurs (avec debounce)
function handleUserSearch(term) {
  clearTimeout(_searchTimer);
  const box = document.getElementById("community-search-results");
  if (!term || term.trim().length < 2) { box.innerHTML = ""; return; }
  box.innerHTML = `<p class="community-hint">Recherche…</p>`;
  _searchTimer = setTimeout(async () => {
    const results = await window.searchUsers(term);
    const me = window._currentUser;
    const following = window._following || [];
    if (!results.length) { box.innerHTML = `<p class="community-hint">Aucun collectionneur trouvé.</p>`; return; }
    box.innerHTML = results.map(u => {
      if (me && u.uid === me.uid) return userRow(u, `<span class="community-badge">toi</span>`);
      const isF = following.includes(u.uid);
      return userRow(u, `<button class="community-follow-btn ${isF?'following':''}" onclick="quickFollow('${u.uid}', this)">${isF?'Abonné':'Suivre'}</button>`);
    }).join("");
  }, 350);
}
window.handleUserSearch = handleUserSearch;

async function quickFollow(uid, btn) {
  btn.disabled = true;
  const res = await window.toggleFollow(uid);
  btn.disabled = false;
  if (res.ok) {
    btn.classList.toggle("following", res.following);
    btn.textContent = res.following ? "Abonné" : "Suivre";
  }
}
window.quickFollow = quickFollow;

async function switchCommunityTab(tab) {
  _communityTab = tab;
  document.getElementById("tab-following").classList.toggle("active", tab === "following");
  document.getElementById("tab-followers").classList.toggle("active", tab === "followers");
  const list = document.getElementById("community-list");
  list.innerHTML = `<p class="community-hint">Chargement…</p>`;

  const user = window._currentUser;
  if (!user) { list.innerHTML = ""; return; }

  if (tab === "following") {
    const uids = window._following || (await window.getFollowing(user.uid));
    if (!uids.length) { list.innerHTML = `<p class="community-hint">Tu ne suis personne pour l'instant. Cherche un pseudo ci-dessus !</p>`; return; }
    const profiles = await window.getProfilesByUids(uids);
    list.innerHTML = profiles.map(u => userRow(u, `<button class="community-follow-btn following" onclick="quickFollow('${u.uid}', this)">Abonné</button>`)).join("")
      || `<p class="community-hint">Tes abonnements ne sont plus disponibles.</p>`;
  } else {
    const followers = await window.getFollowers(user.uid);
    if (!followers.length) { list.innerHTML = `<p class="community-hint">Personne ne te suit encore. Partage ton profil !</p>`; return; }
    const following = window._following || [];
    list.innerHTML = followers.map(u => {
      const isF = following.includes(u.uid);
      return userRow(u, `<button class="community-follow-btn ${isF?'following':''}" onclick="quickFollow('${u.uid}', this)">${isF?'Abonné':'Suivre'}</button>`);
    }).join("");
  }
}
window.switchCommunityTab = switchCommunityTab;


// ==========================================
// SELECT ARTIST
// ==========================================
function selectArtist(encodedAgency, encodedArtist) {
  if (window.exitHome) exitHome();
  const agency = decodeURIComponent(encodedAgency);
  const artist = decodeURIComponent(encodedArtist);

  document.querySelectorAll(".artist-item").forEach(el => el.classList.remove("active"));
  const activeItem = document.querySelector(`[data-artist="${artist}"]`);
  if (activeItem) activeItem.classList.add("active");

  const brandColor = agencyThemes[agency] || "#ffffff";
  document.documentElement.style.setProperty("--dynamic-agency-color", brandColor);

  const albums = collectionData[agency][artist];
  currentPlaylist = albums.filter(a => a.mp3 !== "");
  if (currentPlaylist.length > 0) {
    currentTrackIndex = 0;
    loadTrack(0);
  } else {
    currentPlaylist = [];
    audioPlayer.pause(); audioPlayer.src = "";
    playerTitle.innerText = "Aucun morceau sélectionné";
    trackStatus.innerText = "Lecteur Hors-Ligne";
    progressBar.style.width = "0%";
    setPlayIcon(false);
    document.getElementById("player-cover").style.display = "none";
    document.getElementById("player-emoji").style.display = "inline";
  }

  renderAlbumGrid(agency, artist, albums);
}

// ==========================================
// RENDER GRID
// ==========================================
function albumCardHtml(album, artist, agency) {
  const safeTitle  = encodeURIComponent(album.title);
  const safeArtist = encodeURIComponent(artist);
  const safeAgency = encodeURIComponent(agency);
  const isFav = album.status === "favorite";
  const media = album.img
    ? `<img src="${album.img}" alt="${album.title}" class="album-artwork" loading="lazy">`
    : `<div class="album-artwork-placeholder">💿</div>`;
  const spotifyOverlay = spotifyAccessToken
    ? `<div class="card-spotify-overlay"><span>▶ Spotify</span></div>`
    : "";

  return `
    <div class="album-card"
      data-title="${safeTitle}"
      data-artist="${safeArtist}"
      data-agency="${safeAgency}"
      data-img="${encodeURIComponent(album.img||'')}"
      data-status="${album.status || 'none'}">
      <div class="album-media-wrapper">
        ${media}
        ${spotifyOverlay}
        <button class="album-fav-btn ${isFav ? 'active' : ''}" data-toggle="fav" title="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">★</button>
      </div>
      <div class="album-meta-header">
        <h4 class="album-title-text">${album.title}</h4>
      </div>
      <span class="agency-tag">${agency}</span>
    </div>`;
}

function renderAlbumGrid(agency, artist, albums) {
  const cardsHtml = albums.map(a => albumCardHtml(a, artist, agency)).join("");
  document.getElementById("main-content").innerHTML = `
    <div class="artist-view-header animate-fade">
      <div class="breadcrumbs">${agency} › ${artist}</div>
      <h2 class="artist-main-title">${artist}.</h2>
      <p class="album-total-count">${albums.length} disque(s)</p>
    </div>
    <div class="albums-display-grid animate-fade">
      ${cardsHtml || emptyState(
        '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>',
        "Aucun album ici",
        "Cet artiste n'a pas encore d'album dans ta collection.",
        { label: "Ajouter un album", onclick: "openAddModal()" }
      )}
    </div>`;
}

// ==========================================
// SEARCH
// ==========================================
function handleSearch() {
  const query = document.getElementById("album-search").value.toLowerCase().trim();
  if (!query) { showDashboard(); return; }

  document.querySelectorAll(".artist-item").forEach(el => el.classList.remove("active"));
  document.documentElement.style.setProperty("--dynamic-agency-color", "#ffffff");

  const results = [];
  for (const agency in collectionData)
    for (const artist in collectionData[agency])
      collectionData[agency][artist].forEach(album => {
        if (album.title.toLowerCase().includes(query) || artist.toLowerCase().includes(query))
          results.push({ ...album, agency, artist });
      });

  const cardsHtml = results.map(a => albumCardHtml(a, a.artist, a.agency)).join("");
  document.getElementById("main-content").innerHTML = `
    <div class="artist-view-header animate-fade">
      <div class="breadcrumbs">Recherche globale</div>
      <h2 class="artist-main-title">résultats.</h2>
      <p class="album-total-count">${results.length} album(s) trouvé(s)</p>
    </div>
    <div class="albums-display-grid animate-fade">
      ${cardsHtml || emptyState(
        '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
        "Aucun résultat",
        "Essaie un autre nom d'artiste, d'album ou d'agence.",
        null
      )}
    </div>`;
}

// ==========================================
// TOGGLE STATUS
// ==========================================
// Délégation d'événements pour les album-cards (évite les bugs de quotes inline)
document.getElementById("main-content").addEventListener("click", function(e) {
  const card = e.target.closest(".album-card");
  if (!card) return;

  // Clic sur le bouton favori
  if (e.target.closest("[data-toggle='fav']")) {
    e.stopPropagation();
    toggleAlbumFav(card.dataset.agency, card.dataset.artist, card.dataset.title);
    return;
  }

  // Clic sur l'overlay Spotify
  if (e.target.closest(".card-spotify-overlay")) {
    e.stopPropagation();
    const artist = decodeURIComponent(card.dataset.artist);
    const title  = decodeURIComponent(card.dataset.title);
    playAlbumOnSpotify(artist, title);
    return;
  }

  // Clic sur la card → ouvrir la fiche
  const title  = decodeURIComponent(card.dataset.title);
  const artist = decodeURIComponent(card.dataset.artist);
  const agency = decodeURIComponent(card.dataset.agency);
  const img    = decodeURIComponent(card.dataset.img || "");
  const status = card.dataset.status;
  openAlbumModal(title, artist, agency, img, status);
});

window.toggleAlbumFav = function(encodedAgency, encodedArtist, encodedTitle) {
  const agency = decodeURIComponent(encodedAgency);
  const artist = decodeURIComponent(encodedArtist);
  const title  = decodeURIComponent(encodedTitle);
  const albums = collectionData[agency]?.[artist];
  if (!albums) return;
  const album = albums.find(a => a.title === title);
  if (!album) return;
  album.status = album.status === "favorite" ? "none" : "favorite";
  saveCollection();
  const q = document.getElementById("album-search").value.toLowerCase().trim();
  if (q) handleSearch();
  else if (sidebarTab === "favorites") showFavorites();
  else renderAlbumGrid(agency, artist, albums);
};

// ==========================================
// LIGHTSTICKS
// ==========================================
function showLightsticks() {
  document.querySelectorAll(".artist-item").forEach(el => el.classList.remove("active"));
  document.querySelector(".lightstick-nav")?.classList.add("active");
  document.documentElement.style.setProperty("--dynamic-agency-color", "rgba(255,255,255,0.3)");

  const cardsHtml = lightsticksData.map((ls, i) => `
    <div class="lightstick-card">
      <div class="lightstick-img-wrapper">
        ${ls.img ? `<img src="${ls.img}" alt="${ls.name}" class="lightstick-img" loading="lazy">` : `<div class="lightstick-placeholder">🪄</div>`}
        <button class="lightstick-delete-btn" onclick="deleteLightstick(${i})" title="Supprimer">✕</button>
      </div>
      <p class="lightstick-name">${ls.name}</p>
      <span class="lightstick-artist">${ls.artist}</span>
    </div>`).join("");

  const emptyHtml = emptyState(
    '<path d="M9 2h6v6l-1 1v11a2 2 0 0 1-4 0V9L9 8z"/><line x1="9" y1="6" x2="15" y2="6"/>',
    "Aucun lightstick pour l'instant",
    "Ajoute les lightsticks officiels de tes groupes préférés à ta collection.",
    { label: "Ajouter un lightstick", onclick: "openAddLightstick()" }
  );

  document.getElementById("main-content").innerHTML = `
    <div class="artist-view-header animate-fade">
      <div class="breadcrumbs">collection</div>
      <h2 class="artist-main-title">lightsticks.</h2>
      <p class="album-total-count">${lightsticksData.length} lightstick(s)</p>
    </div>
    <div class="lightsticks-grid animate-fade">
      ${cardsHtml || emptyHtml}
    </div>`;
}

function openAddLightstick() {
  const overlay = document.createElement("div");
  overlay.id = "lightstick-modal-overlay";
  overlay.className = "add-modal-overlay visible";
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div class="add-modal glass-panel" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="document.getElementById('lightstick-modal-overlay').remove()">✕</button>
      <h2 class="add-modal-title">Ajouter un lightstick</h2>
      <div class="add-form">
        <div class="add-form-group">
          <label>Nom *</label>
          <input type="text" id="ls-name" placeholder="TWICE Candy Bong Z2">
        </div>
        <div class="add-form-group">
          <label>Artiste *</label>
          <input type="text" id="ls-artist" placeholder="TWICE">
        </div>
        <div class="add-form-group">
          <label>URL de l'image</label>
          <input type="text" id="ls-img" placeholder="https://...">
        </div>
        <div id="ls-error" class="add-error" style="display:none">Nom et artiste obligatoires.</div>
        <button class="add-submit-btn" onclick="submitAddLightstick()">Ajouter ce lightstick</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}
window.openAddLightstick = openAddLightstick;

function submitAddLightstick() {
  const name   = document.getElementById("ls-name").value.trim();
  const artist = document.getElementById("ls-artist").value.trim();
  const img    = document.getElementById("ls-img").value.trim();
  if (!name || !artist) {
    document.getElementById("ls-error").style.display = "block";
    return;
  }
  lightsticksData.push({ name, artist, img });
  saveLightsticks();
  document.getElementById("lightstick-modal-overlay").remove();
  showLightsticks();
}
window.submitAddLightstick = submitAddLightstick;

function deleteLightstick(index) {
  if (!confirm("Supprimer ce lightstick ?")) return;
  lightsticksData.splice(index, 1);
  saveLightsticks();
  showLightsticks();
}
window.deleteLightstick = deleteLightstick;

// ==========================================
// SYSTEME AUDIO LOCAL
// ==========================================
function loadTrack(index) {
  if (!currentPlaylist.length) return;
  const track = currentPlaylist[index];
  audioPlayer.src = track.mp3;
  let songTitle = track.title.includes(" - ") ? track.title.split(" - ")[1] : track.title;
  playerTitle.innerText = songTitle;
  const cover = document.getElementById("player-cover");
  const emoji = document.getElementById("player-emoji");
  if (track.img) { cover.src = track.img; cover.style.display = "block"; emoji.style.display = "none"; }
  else { cover.style.display = "none"; emoji.style.display = "inline"; }
  trackStatus.innerText = "Prêt à écouter";
  progressBar.style.width = "0%";
  setPlayIcon(false);
}

// Bascule entre l'icône play et pause (SVG)
function setPlayIcon(isPlaying) {
  const playIcon  = document.getElementById("play-icon");
  const pauseIcon = document.getElementById("pause-icon");
  if (playIcon)  playIcon.style.display  = isPlaying ? "none" : "block";
  if (pauseIcon) pauseIcon.style.display = isPlaying ? "block" : "none";
}
window.setPlayIcon = setPlayIcon;

function togglePlay() {
  if (!audioPlayer.src || !currentPlaylist.length) return;
  if (audioPlayer.paused) { audioPlayer.play(); setPlayIcon(true); trackStatus.innerText = "En cours"; }
  else { audioPlayer.pause(); setPlayIcon(false); trackStatus.innerText = "Pause"; }
}

function nextTrack() {
  if (!currentPlaylist.length) return;
  currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
  loadTrack(currentTrackIndex); audioPlayer.play();
  setPlayIcon(true); trackStatus.innerText = "En cours";
}

function prevTrack() {
  if (!currentPlaylist.length) return;
  currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
  loadTrack(currentTrackIndex); audioPlayer.play();
  setPlayIcon(true); trackStatus.innerText = "En cours";
}

audioPlayer.addEventListener("timeupdate", () => {
  if (audioPlayer.duration) progressBar.style.width = `${(audioPlayer.currentTime / audioPlayer.duration) * 100}%`;
});
audioPlayer.addEventListener("ended", nextTrack);

// ==========================================
// AJOUT D'ALBUM
// ==========================================
let addStatus = "owned";

function openAddModal() {
  document.getElementById("add-modal-overlay").classList.add("visible");
  document.getElementById("add-title").value = "";
  document.getElementById("add-artist").value = "";
  document.getElementById("add-img").value = "";
  const yEl = document.getElementById("add-year");
  if (yEl) yEl.value = "";
  document.getElementById("add-error").style.display = "none";
  document.getElementById("add-preview").style.display = "none";
  addStatus = "owned";
}

function closeAddModal(e) {
  if (e && e.target !== document.getElementById("add-modal-overlay")) return;
  document.getElementById("add-modal-overlay").classList.remove("visible");
}

function setAddStatus(s) {
  addStatus = s;
}

// Preview de la cover (délégué via l'élément statique dans l'HTML)
document.addEventListener("input", function(e) {
  if (e.target && e.target.id === "add-img") {
    const url = e.target.value.trim();
    const preview = document.getElementById("add-preview");
    const img = document.getElementById("add-preview-img");
    if (url) { img.src = url; preview.style.display = "block"; }
    else { preview.style.display = "none"; }
  }
});

function submitAddAlbum() {
  const title  = document.getElementById("add-title").value.trim();
  const artist = document.getElementById("add-artist").value.trim();
  const agency = document.getElementById("add-agency").value;
  const img    = document.getElementById("add-img").value.trim();
  const yearEl = document.getElementById("add-year");
  const year   = yearEl && yearEl.value ? parseInt(yearEl.value) : null;
  const errEl  = document.getElementById("add-error");

  if (!title || !artist) {
    errEl.textContent = "Le titre et l'artiste sont obligatoires.";
    errEl.style.display = "block"; return;
  }

  // Créer l'agency si elle n'existe pas
  if (!collectionData[agency]) collectionData[agency] = {};
  // Créer l'artiste si il n'existe pas
  if (!collectionData[agency][artist]) collectionData[agency][artist] = [];

  collectionData[agency][artist].push({ title, img, status: addStatus, mp3: "", year });
  saveCollection();
  initSidebar();

  document.getElementById("add-modal-overlay").classList.remove("visible");
  selectArtist(encodeURIComponent(agency), encodeURIComponent(artist));
}

// ==========================================
// BINDER PHOTOCARDS
// ==========================================
const SLOTS_PER_PAGE = 9;
let binderCurrentPage = 0;
let binderArtistFilter = "all";
let pendingSlot = null; // { page, slot } en attente d'ajout

function getBinderArtists() {
  const artists = [...new Set(photocardsData.map(pc => pc.artist))];
  return artists;
}

function getFilteredCards() {
  if (binderArtistFilter === "all") return photocardsData;
  return photocardsData.filter(pc => pc.artist === binderArtistFilter);
}

// Nombre de pages créées manuellement
let binderTotalPages = parseInt(localStorage.getItem("kshelf_binder_pages") || "1");

function getTotalBinderPages() {
  const maxFromCards = photocardsData.reduce((max, pc) => Math.max(max, pc.page), 0) + 1;
  return Math.max(binderTotalPages, maxFromCards);
}

function addNewBinderPage() {
  binderTotalPages = getTotalBinderPages() + 1;
  localStorage.setItem("kshelf_binder_pages", binderTotalPages);
  binderCurrentPage = binderTotalPages - 1;
  if (window.syncToFirestore) window.syncToFirestore();
  showBinder();
}

function findFirstEmptySlot() {
  const used = new Set(
    photocardsData.filter(pc => pc.page === binderCurrentPage).map(pc => pc.slot)
  );
  for (let i = 0; i < SLOTS_PER_PAGE; i++) {
    if (!used.has(i)) return i;
  }
  return 0; // page pleine, ouvrira sur le slot 0 (l'utilisateur peut changer de page)
}
window.findFirstEmptySlot = findFirstEmptySlot;

function showBinder(artistFilter = binderArtistFilter) {
  binderArtistFilter = artistFilter;
  document.querySelectorAll(".artist-item").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".lightstick-nav").forEach((el, i) => { if (i === 1) el.classList.add("active"); });
  document.documentElement.style.setProperty("--dynamic-agency-color", "rgba(255,255,255,0.3)");

  const artists = getBinderArtists();
  const totalPages = getTotalBinderPages();
  if (binderCurrentPage >= totalPages) binderCurrentPage = totalPages - 1;
  if (binderCurrentPage < 0) binderCurrentPage = 0;

  const filterBtns = [
    `<button class="binder-filter-btn ${binderArtistFilter === 'all' ? 'active' : ''}" onclick="showBinder('all')">Tous</button>`,
    ...artists.map(a => `<button class="binder-filter-btn ${binderArtistFilter === a ? 'active' : ''}" onclick="showBinder('${a.replace(/'/g, "\'")}')">${a}</button>`)
  ].join("");

  const slots = Array(SLOTS_PER_PAGE).fill(null);
  photocardsData.forEach(pc => {
    if (pc.page === binderCurrentPage && pc.slot >= 0 && pc.slot < SLOTS_PER_PAGE) {
      if (binderArtistFilter === "all" || pc.artist === binderArtistFilter)
        slots[pc.slot] = pc;
    }
  });

  const slotsHtml = slots.map((pc, i) => {
    if (pc) {
      const imgContent = pc.img
        ? `<img src="${pc.img}" alt="${pc.member || ''}" class="binder-card-img">`
        : `<div class="binder-card-empty-img"><span>${pc.member ? pc.member[0] : "?"}</span></div>`;
      const isFav = pc.status === "favorite";
      // Aura colorée par groupe (agency color)
      const agencyOfCard = Object.keys(collectionData).find(ag =>
        collectionData[ag][pc.artist] !== undefined
      ) || "Autres / Indés";
      const auraColor = agencyThemes[agencyOfCard] || "#ffffff";

      return `
        <div class="binder-slot-wrapper ${isFav ? 'is-favorite' : ''}">
          ${isFav ? `<div class="group-aura" style="--aura-color:${auraColor}"></div>` : ''}
          <div class="binder-slot filled ${isFav ? 'is-favorite' : ''}" data-slot="${i}" data-pcid="${pc.id}">
            <div class="binder-card-tilt">
              ${imgContent}
              ${isFav ? '<div class="holo-layer"></div>' : ''}
              <div class="binder-card-info">
                <span class="binder-card-member">${pc.member || "—"}</span>
                <span class="binder-card-artist">${pc.artist}</span>
              </div>
              <div class="binder-card-actions">
                <button class="binder-fav-btn ${isFav ? 'active' : ''}" onclick="togglePcFavorite('${pc.id}')">★</button>
                <button class="binder-remove-btn" onclick="removePhotocard('${pc.id}')">✕</button>
              </div>
            </div>
          </div>
        </div>`;
    } else {
      return `
        <div class="binder-slot-wrapper">
          <div class="binder-slot empty" onclick="openAddPhotocard(${binderCurrentPage}, ${i})">
            <div class="binder-slot-add">+</div>
          </div>
        </div>`;
    }
  }).join("");

  document.getElementById("main-content").innerHTML = `
    <div class="artist-view-header animate-fade">
      <div class="breadcrumbs">collection</div>
      <h2 class="artist-main-title">photocards.</h2>
      <p class="album-total-count">${photocardsData.length} photocard(s) · ${totalPages} page(s)</p>
    </div>
    <div class="binder-toolbar animate-fade">
      <div class="binder-filters">${filterBtns}</div>
      <div class="binder-page-nav">
        <button class="binder-nav-btn" onclick="binderChangePage(-1)" ${binderCurrentPage === 0 ? "disabled" : ""}>‹</button>
        <span class="binder-page-label">${binderCurrentPage + 1} / ${totalPages}</span>
        <button class="binder-nav-btn" onclick="binderChangePage(1)" ${binderCurrentPage >= totalPages - 1 ? "disabled" : ""}>›</button>
        <button class="binder-add-page-btn" onclick="addNewBinderPage()">+ page</button>
      </div>
    </div>
    <div class="binder-book animate-fade">
      <div class="binder-spine">
        <div class="binder-ring"></div>
        <div class="binder-ring"></div>
        <div class="binder-ring"></div>
        <div class="binder-ring"></div>
        <div class="binder-ring"></div>
        <div class="binder-ring"></div>
      </div>
      <div class="binder-page-sheet">
        <div class="binder-grid">
          ${slotsHtml}
        </div>
      </div>
    </div>`;
  setTimeout(initTilt, 60);
}

function binderChangePage(dir) {
  const totalPages = getTotalBinderPages();
  const next = binderCurrentPage + dir;
  if (next < 0 || next >= totalPages) return;
  binderCurrentPage = next;
  showBinder();
}

function removePhotocard(id) {
  photocardsData = photocardsData.filter(pc => pc.id !== id);
  savePhotocards();
  showBinder();
}

function initTilt() {
  document.querySelectorAll(".binder-slot.filled").forEach(card => {
    const tilt = card.querySelector(".binder-card-tilt");
    const holo = card.querySelector(".holo-layer"); // null si pas favori
    if (!tilt) return;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;   // 0→1
      const py = (e.clientY - rect.top)  / rect.height;  // 0→1
      const dx = px - 0.5;
      const dy = py - 0.5;

      // Tilt 3D
      tilt.style.transform =
        `rotateX(${-dy * 20}deg) rotateY(${dx * 20}deg) scale3d(1.04,1.04,1.04)`;

      // Effet holo prismatique — FAVORIS SEULEMENT
      if (holo) {
        // Hue pivote selon position X, saturation selon Y
        const hue    = Math.round(px * 360);
        const hue60  = (hue + 60)  % 360;
        const hue180 = (hue + 180) % 360;
        const hue270 = (hue + 270) % 360;
        const angle  = Math.round(dx * 30 + py * 60 + 110); // angle dynamique

        // Couche 1 : dégradé arc-en-ciel en mouvement
        const rainbow = `linear-gradient(
          ${angle}deg,
          hsla(${hue},100%,65%,0.0)   0%,
          hsla(${hue},100%,65%,0.5)  20%,
          hsla(${hue60},100%,65%,0.4) 35%,
          hsla(${hue180},100%,65%,0.5) 55%,
          hsla(${hue270},100%,65%,0.4) 75%,
          hsla(${hue},100%,65%,0.0)  100%
        )`;

        // Couche 2 : micro-grille de facettes
        const facets = `repeating-linear-gradient(
          ${angle + 45}deg,
          transparent           0px,
          transparent           2px,
          rgba(255,255,255,0.06) 2px,
          rgba(255,255,255,0.06) 3px
        )`;

        // Couche 3 : spot lumineux au curseur
        const spot = `radial-gradient(
          ellipse 60% 40% at ${Math.round(px*100)}% ${Math.round(py*100)}%,
          rgba(255,255,255,0.18) 0%,
          transparent 70%
        )`;

        holo.style.background = [rainbow, facets, spot].join(", ");
        holo.style.mixBlendMode = "color-dodge";
        holo.style.opacity = "1";
      }
    });

    card.addEventListener("mouseleave", () => {
      tilt.style.transform = "rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
      if (holo) holo.style.opacity = "0";
    });
  });
}

window.showBinder       = showBinder;
window.initTilt         = initTilt;
window.binderChangePage = binderChangePage;
window.removePhotocard  = removePhotocard;

// ==========================================
// AJOUT PHOTOCARD
// ==========================================
function openAddPhotocard(page, slot) {
  pendingSlot = { page, slot };
  const modal = document.getElementById("add-photocard-modal");
  modal.querySelector("#pc-member").value = "";
  modal.querySelector("#pc-artist").value = "";
  modal.querySelector("#pc-album").value = "";
  modal.querySelector("#pc-img-url").value = "";
  modal.querySelector("#pc-img-preview").style.display = "none";
  modal.querySelector("#pc-error").style.display = "none";
  document.getElementById("pc-toggle-owned").classList.add("active");
  document.getElementById("pc-toggle-favorite").classList.remove("active");
  pcAddStatus = "owned";
  modal.classList.add("visible");
}

function closeAddPhotocard() {
  document.getElementById("add-photocard-modal").classList.remove("visible");
  pendingSlot = null;
}

let pcAddStatus = "owned";
function setPcStatus(s) {
  pcAddStatus = s;
  document.getElementById("pc-toggle-owned").classList.toggle("active", s === "owned");
  document.getElementById("pc-toggle-favorite").classList.toggle("active", s === "favorite");
}

function submitAddPhotocard() {
  const member = document.getElementById("pc-member").value.trim();
  const artist = document.getElementById("pc-artist").value.trim();
  const album  = document.getElementById("pc-album").value.trim();
  const imgUrl = document.getElementById("pc-img-url").value.trim();
  const errEl  = document.getElementById("pc-error");
  const fileInput = document.getElementById("pc-img-file");

  if (!artist) {
    errEl.textContent = "L'artiste est obligatoire.";
    errEl.style.display = "block"; return;
  }

  const id = "pc_" + Date.now();
  const { page, slot } = pendingSlot;

  const doAdd = (imgSrc) => {
    photocardsData.push({ id, artist, member, album, img: imgSrc, status: pcAddStatus, page, slot });
    savePhotocards();
    closeAddPhotocard();
    showBinder();
  };

  // Upload fichier local → base64
  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => doAdd(e.target.result);
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    doAdd(imgUrl);
  }
}

function togglePcFavorite(id) {
  const pc = photocardsData.find(p => p.id === id);
  if (!pc) return;
  pc.status = pc.status === "favorite" ? "owned" : "favorite";
  savePhotocards();
  showBinder();
}
window.togglePcFavorite = togglePcFavorite;

window.openAddPhotocard  = openAddPhotocard;
window.closeAddPhotocard = closeAddPhotocard;
window.setPcStatus       = setPcStatus;
window.submitAddPhotocard = submitAddPhotocard;

// Preview image URL
document.addEventListener("input", function(e) {
  if (e.target && e.target.id === "pc-img-url") {
    const url = e.target.value.trim();
    const preview = document.getElementById("pc-img-preview");
    if (preview) { preview.src = url; preview.style.display = url ? "block" : "none"; }
  }
});

// Preview fichier upload
document.addEventListener("change", function(e) {
  if (e.target && e.target.id === "pc-img-file") {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const preview = document.getElementById("pc-img-preview");
      if (preview) { preview.src = ev.target.result; preview.style.display = "block"; }
    };
    reader.readAsDataURL(file);
  }
});

function resetToDefaultCollection() {
  if (!confirm("Restaurer la collection originale (28 albums) ? Cette action écrasera tes modifications actuelles.")) return;
  collectionData = JSON.parse(JSON.stringify(defaultCollectionData)); // deep clone
  saveCollection();
  initSidebar();
  showDashboard();
  if (window.syncToFirestore) window.syncToFirestore();
  if (typeof showDebugToast === "function") showDebugToast("✅ Collection restaurée !");
  else alert("Collection restaurée !");
}
window.resetToDefaultCollection = resetToDefaultCollection;

window.openAddModal   = openAddModal;
window.closeAddModal  = closeAddModal;
window.setAddStatus   = setAddStatus;
window.submitAddAlbum = submitAddAlbum;
window.showLightsticks = showLightsticks;

// ==========================================
// SPOTIFY — PKCE OAuth
// ==========================================
const SPOTIFY_CLIENT_ID   = "af102f75697746ccbc32cdd3e24e7a55";
const SPOTIFY_REDIRECT_URI = "https://nonowarwood.github.io/K-Shelf/";
const SPOTIFY_SCOPES = ["user-read-playback-state","user-modify-playback-state","user-read-currently-playing","user-top-read","user-read-recently-played"].join(" ");

let spotifyAccessToken = null;
let spotifyTokenExpiry = null;
let nowPlayingInterval = null;

function generateCodeVerifier() {
  const arr = new Uint8Array(64);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
}
async function generateCodeChallenge(v) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return btoa(String.fromCharCode(...new Uint8Array(d))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
}

async function loginSpotify() {
  const v = generateCodeVerifier();
  const c = await generateCodeChallenge(v);
  localStorage.setItem("spotify_code_verifier", v);
  const p = new URLSearchParams({ client_id: SPOTIFY_CLIENT_ID, response_type:"code", redirect_uri: SPOTIFY_REDIRECT_URI, code_challenge_method:"S256", code_challenge:c, scope: SPOTIFY_SCOPES });
  window.location.href = `https://accounts.spotify.com/authorize?${p}`;
}

async function exchangeSpotifyCode(code) {
  const v = localStorage.getItem("spotify_code_verifier");
  const r = await fetch("https://accounts.spotify.com/api/token", {
    method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body: new URLSearchParams({ grant_type:"authorization_code", code, redirect_uri: SPOTIFY_REDIRECT_URI, client_id: SPOTIFY_CLIENT_ID, code_verifier:v })
  });
  if (!r.ok) { console.error("Token exchange failed"); return; }
  const data = await r.json();
  spotifyAccessToken = data.access_token;
  spotifyTokenExpiry = Date.now() + data.expires_in * 1000;
  localStorage.setItem("spotify_access_token", spotifyAccessToken);
  localStorage.setItem("spotify_token_expiry", spotifyTokenExpiry);
  localStorage.removeItem("spotify_code_verifier");
  window.history.replaceState({}, document.title, SPOTIFY_REDIRECT_URI);
  onSpotifyConnected();
}

function restoreSpotifySession() {
  const token  = localStorage.getItem("spotify_access_token");
  const expiry = parseInt(localStorage.getItem("spotify_token_expiry") || "0");
  if (token && Date.now() < expiry) { spotifyAccessToken = token; spotifyTokenExpiry = expiry; onSpotifyConnected(); return true; }
  return false;
}

function disconnectSpotify() {
  spotifyAccessToken = null; spotifyTokenExpiry = null;
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_token_expiry");
  if (nowPlayingInterval) clearInterval(nowPlayingInterval);
  nowPlayingInterval = null;
  updateSpotifyButton(false);
  trackStatus.innerText = "Lecteur Hors-Ligne";
  playerTitle.innerText = "Aucun morceau sélectionné";
  document.getElementById("player-cover").style.display = "none";
  document.getElementById("player-emoji").style.display = "inline";
}

function updateSpotifyButton(connected) {
  const btn = document.getElementById("spotify-connect-btn");
  if (!btn) return;
  const lbl = document.getElementById("spotify-btn-label");
  if (connected) {
    if (lbl) lbl.innerText = "spotify connecté";
    btn.style.background = "#1DB954"; btn.style.color = "#000";
    btn.onclick = disconnectSpotify;
  } else {
    if (lbl) lbl.innerText = "connexion spotify";
    btn.style.background = ""; btn.style.color = "";
    btn.onclick = loginSpotify;
  }
}

function onSpotifyConnected() { updateSpotifyButton(true); startNowPlayingPolling(); }

async function fetchNowPlaying() {
  if (!spotifyAccessToken || Date.now() > spotifyTokenExpiry) { disconnectSpotify(); return; }
  try {
    const res = await fetch("https://api.spotify.com/v1/me/player", { headers:{ Authorization:`Bearer ${spotifyAccessToken}` } });
    if (res.status === 204 || res.status === 404) { trackStatus.innerText = "Spotify — rien en lecture"; return; }
    if (!res.ok) return;
    const data = await res.json();
    const track = data.item;
    if (!track) return;
    const isPlaying = data.is_playing;
    _spotifyIsPlaying = isPlaying;
    playerTitle.innerText = track.name;
    trackStatus.innerText = track.artists.map(a=>a.name).join(", ");
    const cover = track.album?.images?.[0]?.url;
    if (cover) {
      document.getElementById("player-cover").src = cover;
      document.getElementById("player-cover").style.display = "block";
      document.getElementById("player-emoji").style.display = "none";
    }
    progressBar.style.width = `${(data.progress_ms / track.duration_ms) * 100}%`;
    setPlayIcon(isPlaying);
  } catch(e) { console.error("Now playing error:", e); }
}

function startNowPlayingPolling() {
  fetchNowPlaying();
  if (nowPlayingInterval) clearInterval(nowPlayingInterval);
  nowPlayingInterval = setInterval(fetchNowPlaying, 5000);
}

async function spotifyControl(endpoint, method="PUT") {
  if (!spotifyAccessToken) return false;
  try {
    const r = await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, { method, headers:{ Authorization:`Bearer ${spotifyAccessToken}` } });
    if (r.status === 403) { alert("Contrôle de lecture : Spotify Premium requis."); return false; }
    return true;
  } catch(e) { return false; }
}

let _spotifyIsPlaying = false; // état réel maintenu par fetchNowPlaying

async function spotifyTogglePlay() {
  if (!spotifyAccessToken) { togglePlay(); return; }
  const ok = await spotifyControl(_spotifyIsPlaying ? "pause" : "play");
  if (ok) setTimeout(fetchNowPlaying, 300);
}
async function spotifyNext() {
  if (!spotifyAccessToken) { nextTrack(); return; }
  if (await spotifyControl("next", "POST")) setTimeout(fetchNowPlaying, 300);
}
async function spotifyPrev() {
  if (!spotifyAccessToken) { prevTrack(); return; }
  if (await spotifyControl("previous", "POST")) setTimeout(fetchNowPlaying, 300);
}

async function searchSpotifyAlbum(q) {
  const r = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=album&limit=1`, { headers:{ Authorization:`Bearer ${spotifyAccessToken}` } });
  return (await r.json()).albums?.items?.[0] || null;
}

// ==========================================
// STATS D'ÉCOUTE SPOTIFY
// ==========================================
let statsPeriod = "medium_term"; // short_term | medium_term | long_term

async function spotifyGet(endpoint) {
  const r = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
    headers: { Authorization: `Bearer ${spotifyAccessToken}` }
  });
  if (!r.ok) throw new Error("Spotify API " + r.status);
  return r.json();
}

async function showStats() {
  exitHome();
  // Sécurité : accès réservé aux comptes autorisés
  if (!spotifyAccessAllowed()) { showDashboard(); return; }
  document.querySelectorAll(".header-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === "stats"));
  const main = document.getElementById("main-content");

  // Pas connecté à Spotify
  if (!spotifyAccessToken) {
    main.innerHTML = `
      <div class="artist-view-header animate-fade">
        <div class="breadcrumbs">écoute</div>
        <h2 class="artist-main-title">mes stats.</h2>
      </div>
      <div class="stats-connect-prompt animate-fade">
        <div class="stats-connect-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.66 13.5 1.62.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.1 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.32-1.32 11.4-1.02 15.9 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.36z"/></svg>
        </div>
        <p class="stats-connect-title">Connecte Spotify pour voir tes stats</p>
        <p class="stats-connect-desc">Découvre tes artistes et titres les plus écoutés, façon Wrapped.</p>
        <button class="add-submit-btn" style="max-width:280px" onclick="loginSpotify()">Connexion Spotify</button>
      </div>`;
    return;
  }

  // Structure de la page avec sélecteur de période
  main.innerHTML = `
    <div class="artist-view-header animate-fade">
      <div class="breadcrumbs">écoute</div>
      <h2 class="artist-main-title">mes stats.</h2>
      <p class="album-total-count">tes écoutes Spotify, façon Wrapped</p>
      <div class="stats-period-selector">
        <button class="stats-period-btn ${statsPeriod==='short_term'?'active':''}" onclick="setStatsPeriod('short_term')">4 semaines</button>
        <button class="stats-period-btn ${statsPeriod==='medium_term'?'active':''}" onclick="setStatsPeriod('medium_term')">6 mois</button>
        <button class="stats-period-btn ${statsPeriod==='long_term'?'active':''}" onclick="setStatsPeriod('long_term')">tout le temps</button>
      </div>
    </div>
    <div id="stats-content" class="stats-content animate-fade">
      <div class="stats-loading"><div class="modal-spinner"></div><span>Chargement de tes stats…</span></div>
    </div>`;

  try {
    const [topArtists, topTracks, recent] = await Promise.all([
      spotifyGet(`me/top/artists?time_range=${statsPeriod}&limit=10`),
      spotifyGet(`me/top/tracks?time_range=${statsPeriod}&limit=10`),
      spotifyGet(`me/player/recently-played?limit=8`)
    ]);
    renderStatsContent(topArtists.items || [], topTracks.items || [], recent.items || []);
  } catch(e) {
    document.getElementById("stats-content").innerHTML = `
      <div class="stats-connect-prompt">
        <p class="stats-connect-title">Impossible de charger les stats</p>
        <p class="stats-connect-desc">Reconnecte-toi à Spotify (les permissions ont peut-être changé) : déconnecte puis reconnecte via le bouton dans la sidebar.</p>
        <button class="add-submit-btn" style="max-width:280px" onclick="disconnectSpotify(); loginSpotify()">Reconnecter Spotify</button>
      </div>`;
  }
}
window.showStats = showStats;

function setStatsPeriod(period) {
  statsPeriod = period;
  showStats();
}
window.setStatsPeriod = setStatsPeriod;

// Vérifie si un artiste est dans la collection physique
function artistInCollection(artistName) {
  const target = artistName.trim().toLowerCase();
  for (const agency in collectionData) {
    if (!collectionData[agency] || typeof collectionData[agency] !== "object") continue;
    for (const artist in collectionData[agency]) {
      if (artist.trim().toLowerCase() === target) {
        const list = collectionData[agency][artist];
        return Array.isArray(list) ? list.length : 0;
      }
    }
  }
  return 0;
}

function renderStatsContent(artists, tracks, recent) {
  const content = document.getElementById("stats-content");
  if (!content) return;

  if (!artists.length && !tracks.length) {
    content.innerHTML = `<div class="stats-connect-prompt">
      <p class="stats-connect-title">Pas encore assez de données</p>
      <p class="stats-connect-desc">Écoute un peu de musique sur Spotify et reviens plus tard !</p>
    </div>`;
    return;
  }

  // PODIUM top 3 artistes
  const podiumOrder = [1, 0, 2]; // 2e, 1er, 3e pour l'effet podium
  const podiumHtml = artists.length >= 1 ? `
    <div class="stats-section">
      <p class="dash-section-label">top artistes</p>
      <div class="stats-podium">
        ${podiumOrder.map(i => {
          const a = artists[i];
          if (!a) return "";
          const rank = i + 1;
          const img = a.images?.[0]?.url || "";
          const owned = artistInCollection(a.name);
          return `
            <div class="podium-spot podium-rank-${rank}">
              <div class="podium-avatar">
                ${img ? `<img src="${img}" alt="${a.name}">` : `<div class="podium-avatar-empty">${a.name[0]}</div>`}
                <span class="podium-medal">${rank}</span>
              </div>
              <span class="podium-name">${a.name}</span>
              ${owned ? `<span class="podium-owned">💿 ${owned} album${owned>1?'s':''}</span>` : ""}
            </div>`;
        }).join("")}
      </div>
    </div>` : "";

  // Reste des artistes (4-10) en liste
  const restArtists = artists.slice(3);
  const restArtistsHtml = restArtists.length ? `
    <div class="stats-list">
      ${restArtists.map((a, idx) => {
        const owned = artistInCollection(a.name);
        return `
          <div class="stats-list-row">
            <span class="stats-list-rank">${idx + 4}</span>
            <img class="stats-list-img" src="${a.images?.[2]?.url || a.images?.[0]?.url || ''}" alt="${a.name}">
            <span class="stats-list-name">${a.name}</span>
            ${owned ? `<span class="stats-list-badge">💿 ${owned}</span>` : ""}
          </div>`;
      }).join("")}
    </div>` : "";

  // TOP TITRES
  const tracksHtml = tracks.length ? `
    <div class="stats-section">
      <p class="dash-section-label">top titres</p>
      <div class="stats-list">
        ${tracks.map((t, idx) => `
          <div class="stats-list-row">
            <span class="stats-list-rank">${idx + 1}</span>
            <img class="stats-list-img" src="${t.album?.images?.[2]?.url || t.album?.images?.[0]?.url || ''}" alt="${t.name}">
            <div class="stats-list-track">
              <span class="stats-list-name">${t.name}</span>
              <span class="stats-list-artist">${t.artists?.map(a=>a.name).join(", ")}</span>
            </div>
          </div>`).join("")}
      </div>
    </div>` : "";

  // RÉCEMMENT ÉCOUTÉS
  const recentHtml = recent.length ? `
    <div class="stats-section">
      <p class="dash-section-label">récemment écoutés</p>
      <div class="stats-recent-grid">
        ${recent.map(r => {
          const t = r.track;
          if (!t) return "";
          return `
            <div class="stats-recent-card" title="${t.name} — ${t.artists?.map(a=>a.name).join(', ')}">
              <img src="${t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || ''}" alt="${t.name}">
              <span class="stats-recent-name">${t.name}</span>
              <span class="stats-recent-artist">${t.artists?.[0]?.name || ''}</span>
            </div>`;
        }).join("")}
      </div>
    </div>` : "";

  content.innerHTML = podiumHtml + restArtistsHtml + tracksHtml + recentHtml;
}
window.renderStatsContent = renderStatsContent;

// Auto-remplir année + cover depuis Spotify dans le formulaire d'ajout
async function autofillFromSpotify() {
  const btn = document.getElementById("spotify-autofill-btn");
  const title  = document.getElementById("add-title").value.trim();
  const artist = document.getElementById("add-artist").value.trim();
  const statusEl = document.getElementById("spotify-autofill-status");

  if (!title && !artist) {
    if (statusEl) { statusEl.textContent = "Renseigne au moins le titre ou l'artiste."; statusEl.style.color = "#f87171"; statusEl.style.display = "block"; }
    return;
  }

  if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Recherche…"; }
  if (statusEl) { statusEl.style.display = "none"; }

  try {
    // Passe par le proxy (fetchSpotifyAlbumData) → marche sans connexion Spotify
    const album = await fetchSpotifyAlbumData(artist || title, title || artist);

    if (!album) {
      if (statusEl) { statusEl.textContent = "Aucun album trouvé sur Spotify."; statusEl.style.color = "#f87171"; statusEl.style.display = "block"; }
      return;
    }

    // Année
    const year = (album.release_date || "").split("-")[0];
    const yearEl = document.getElementById("add-year");
    if (year && yearEl) yearEl.value = year;

    // Cover (si le champ est vide)
    const imgEl = document.getElementById("add-img");
    const coverUrl = album.images?.[0]?.url;
    if (coverUrl && imgEl && !imgEl.value.trim()) {
      imgEl.value = coverUrl;
      const preview = document.getElementById("add-preview");
      const previewImg = document.getElementById("add-preview-img");
      if (preview && previewImg) { previewImg.src = coverUrl; preview.style.display = "block"; }
    }

    if (statusEl) {
      statusEl.textContent = `✓ Trouvé : ${album.name} (${year || "année inconnue"})`;
      statusEl.style.color = "#34d399";
      statusEl.style.display = "block";
    }
  } catch(e) {
    if (statusEl) { statusEl.textContent = "Erreur lors de la recherche Spotify."; statusEl.style.color = "#f87171"; statusEl.style.display = "block"; }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || "✦ Récupérer via Spotify"; }
  }
}
window.autofillFromSpotify = autofillFromSpotify;


async function getActiveDevice() {
  try {
    const r = await fetch("https://api.spotify.com/v1/me/player/devices", {
      headers: { Authorization: `Bearer ${spotifyAccessToken}` }
    });
    const data = await r.json();
    return data.devices?.find(d => d.is_active) || data.devices?.[0] || null;
  } catch(e) { return null; }
}

async function playAlbumOnSpotify(artistName, albumTitle) {
  if (!spotifyAccessToken) { alert("Connecte-toi à Spotify d'abord !"); return; }
  const clean = albumTitle.replace(/\s*\(.*?\)\s*/g,"").replace(/\s*\[.*?\]\s*/g,"").replace(new RegExp(`^${artistName}\\s*[-–]\\s*`,"i"),"").trim();
  const queries = [`album:"${clean}" artist:"${artistName}"`, `album:${clean} artist:${artistName}`, `${clean} ${artistName}`, clean];
  let album = null;
  for (const q of queries) { try { album = await searchSpotifyAlbum(q); if (album) break; } catch(e){} }
  if (!album) { alert(`Album introuvable sur Spotify : "${clean}"`); return; }

  // Vérifier qu'un appareil est actif
  const device = await getActiveDevice();
  if (!device) {
    // Aucun appareil — ouvrir l'album directement sur Spotify Web
    window.open(album.external_urls?.spotify || `https://open.spotify.com/search/${encodeURIComponent(clean)}`, "_blank");
    return;
  }

  try {
    const body = { context_uri: album.uri };
    if (!device.is_active) body.device_id = device.id;
    await fetch("https://api.spotify.com/v1/me/player/play", {
      method:"PUT", headers:{ Authorization:`Bearer ${spotifyAccessToken}`, "Content-Type":"application/json" },
      body: JSON.stringify(body)
    });
    setTimeout(fetchNowPlaying, 800);
  } catch(e) { console.error(e); }
}
window.playAlbumOnSpotify = playAlbumOnSpotify;

// Boutons player
playBtn.onclick = spotifyTogglePlay;
prevBtn.onclick = spotifyPrev;
nextBtn.onclick = spotifyNext;

// ==========================================
// MODAL FICHE ALBUM
// ==========================================
function msToMinSec(ms) {
  const s = Math.floor(ms/1000);
  return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;
}
function totalDuration(tracks) {
  return `${Math.floor(tracks.reduce((a,t)=>a+(t.duration_ms||0),0)/60000)} min`;
}

// URL du proxy Spotify (Val Town) — récupère les infos d'album sans
// que l'utilisateur ait besoin de se connecter à Spotify.
const SPOTIFY_PROXY_URL = "https://nonowarwood--954f2bba77a211f19bd91607ee4eb77e.web.val.run";

async function fetchSpotifyAlbumData(artistName, albumTitle) {
  const clean = albumTitle.replace(/\s*\(.*?\)\s*/g,"").replace(/\s*\[.*?\]\s*/g,"").replace(new RegExp(`^${artistName}\\s*[-–]\\s*`,"i"),"").trim();
  try {
    const url = `${SPOTIFY_PROXY_URL}/?artist=${encodeURIComponent(artistName)}&title=${encodeURIComponent(clean)}`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const data = await r.json();
    if (!data || !data.found) return null;

    // Adapter la réponse du proxy au format attendu par openAlbumModal
    return {
      id: null,
      name: data.name,
      images: data.images || [],
      release_date: data.release_date || "",
      total_tracks: data.total_tracks || 0,
      label: data.label || "",
      external_urls: { spotify: data.external_url || "" },
      artists: (data.artists || []).map(n => ({ name: n })),
      trackList: (data.tracks || []).map(t => ({ name: t.name, duration_ms: t.duration_ms })),
      artistData: {
        genres: data.genres || [],
        popularity: data.popularity,
      },
    };
  } catch(e) {
    return null;
  }
}

async function openAlbumModal(title, artist, agency, img, status) {
  const overlay = document.createElement("div");
  overlay.id = "album-modal-overlay";
  overlay.innerHTML = `<div class="album-modal" id="album-modal"><button class="modal-close" onclick="closeAlbumModal()">✕</button><div class="modal-loading"><div class="modal-spinner"></div><span>Chargement…</span></div></div>`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add("visible"), 10);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeAlbumModal(); });

  // Le proxy Spotify (Val Town) enrichit la fiche pour TOUS les visiteurs,
  // sans qu'ils aient besoin de se connecter à Spotify.
  let sp = null;
  try { sp = await fetchSpotifyAlbumData(artist, title); } catch(e) { sp = null; }
  // Retrouver l'année stockée dans la collection si le proxy ne répond pas
  const stored = findAlbum(agency, artist, title);
  const storedYear = stored?.album?.year || null;

  const coverUrl   = sp?.images?.[0]?.url || img || "";
  const releaseYear = (sp?.release_date || "").split("-")[0] || storedYear || "—";
  const totalTracks = sp?.total_tracks || "—";
  const label       = sp?.label || agency;
  const duration    = sp?.trackList?.length ? totalDuration(sp.trackList) : "—";
  const spotifyUrl  = sp?.external_urls?.spotify || "";
  const genres      = sp?.artistData?.genres?.slice(0,3).join(", ") || "";
  const popularity  = sp?.artistData?.popularity;
  const cleanTitle  = title.replace(/\s*\(.*?\)\s*/g,"").replace(/\s*\[.*?\]\s*/g,"").replace(new RegExp(`^${artist}\\s*[-–]\\s*`,"i"),"").trim();

  const tracklistHtml = sp?.trackList?.length
    ? sp.trackList.map((t,i) => `<div class="modal-track"><span class="modal-track-num">${i+1}</span><span class="modal-track-name">${t.name}</span><span class="modal-track-dur">${msToMinSec(t.duration_ms)}</span></div>`).join("")
    : "";

  document.getElementById("album-modal").innerHTML = `
    <button class="modal-close" onclick="closeAlbumModal()">✕</button>
    <div class="modal-inner">
      <div class="modal-left">
        <div class="modal-cover-wrapper">
          ${coverUrl ? `<img src="${coverUrl}" class="modal-cover" alt="${title}">` : `<div class="modal-cover-placeholder">💿</div>`}
        </div>
        <div class="modal-meta-block">
          ${spotifyUrl ? `<a class="modal-spotify-link" href="${spotifyUrl}" target="_blank">Ouvrir sur Spotify ↗</a>` : ""}
          ${sp ? `<button class="modal-play-btn spotify-feature" onclick="playAlbumOnSpotify('${artist.replace(/'/g,"\\'")}','${title.replace(/'/g,"\\'")}')">▶ Écouter</button>` : ""}
          <button class="modal-edit-btn" onclick="openEditAlbum('${encodeURIComponent(agency)}','${encodeURIComponent(artist)}','${encodeURIComponent(title)}')">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Modifier
          </button>
        </div>
      </div>
      <div class="modal-right">
        <div class="modal-header">
          <p class="modal-agency">${agency}</p>
          <h2 class="modal-title">${cleanTitle}</h2>
          <p class="modal-artist">${artist}</p>
        </div>
        <div class="modal-stats">
          <div class="modal-stat"><span class="modal-stat-value">${releaseYear}</span><span class="modal-stat-label">Sortie</span></div>
          ${totalTracks !== "—" ? `<div class="modal-stat"><span class="modal-stat-value">${totalTracks}</span><span class="modal-stat-label">Titres</span></div>` : ""}
          ${duration !== "—" ? `<div class="modal-stat"><span class="modal-stat-value">${duration}</span><span class="modal-stat-label">Durée</span></div>` : ""}
          ${popularity != null ? `<div class="modal-stat"><span class="modal-stat-value">${popularity}<span style="font-size:.9rem">/100</span></span><span class="modal-stat-label">Popularité</span></div>` : ""}
        </div>
        ${label ? `<p class="modal-label-line">Label · ${label}</p>` : ""}
        ${genres ? `<p class="modal-genres">${genres}</p>` : ""}
        ${tracklistHtml ? `
        <div class="modal-tracklist">
          <h3 class="modal-section-title">Tracklist</h3>
          <div class="modal-tracks-container">${tracklistHtml}</div>
        </div>` : ""}
      </div>
    </div>`;
}

function closeAlbumModal() {
  const o = document.getElementById("album-modal-overlay");
  if (!o) return;
  o.classList.remove("visible");
  setTimeout(() => o.remove(), 300);
}

window.openAlbumModal  = openAlbumModal;
window.closeAlbumModal = closeAlbumModal;

// ==========================================
// ÉDITION D'ALBUM
// ==========================================
// Retrouve un album et son index à partir de agency/artist/title
function findAlbum(agency, artist, title) {
  if (!collectionData[agency] || !Array.isArray(collectionData[agency][artist])) return null;
  const list = collectionData[agency][artist];
  const idx = list.findIndex(a => a && a.title === title);
  if (idx === -1) return null;
  return { list, idx, album: list[idx] };
}

function openEditAlbum(encAgency, encArtist, encTitle) {
  const agency = decodeURIComponent(encAgency);
  const artist = decodeURIComponent(encArtist);
  const title  = decodeURIComponent(encTitle);
  const found = findAlbum(agency, artist, title);
  if (!found) { showDebugToast("Album introuvable", "#ef4444"); return; }
  const alb = found.album;

  closeAlbumModal();

  const overlay = document.createElement("div");
  overlay.id = "edit-modal-overlay";
  overlay.className = "add-modal-overlay visible";
  overlay.innerHTML = `
    <div class="add-modal">
      <button class="modal-close" onclick="closeEditAlbum()">✕</button>
      <h2 class="add-modal-title">Modifier l'album</h2>
      <div class="add-form-group">
        <label>Titre</label>
        <input type="text" id="edit-title" value="${(alb.title||'').replace(/"/g,'&quot;')}">
      </div>
      <div class="add-form-row">
        <div class="add-form-group">
          <label>Artiste</label>
          <input type="text" id="edit-artist" value="${(artist||'').replace(/"/g,'&quot;')}">
        </div>
        <div class="add-form-group">
          <label>Agence</label>
          <input type="text" id="edit-agency" value="${(agency||'').replace(/"/g,'&quot;')}">
        </div>
      </div>
      <div class="add-form-group">
        <label>URL de la cover</label>
        <input type="text" id="edit-img" value="${(alb.img||'').replace(/"/g,'&quot;')}">
      </div>
      <div class="add-form-group">
        <label>Année de sortie</label>
        <input type="number" id="edit-year" value="${alb.year||''}" min="1990" max="2030">
      </div>
      <p id="edit-error" class="add-error" style="display:none"></p>
      <div class="edit-modal-actions">
        <button class="add-submit-btn" onclick="submitEditAlbum('${encAgency}','${encArtist}','${encodeURIComponent(title)}')">Enregistrer</button>
        <button class="edit-delete-btn" onclick="deleteAlbum('${encAgency}','${encArtist}','${encodeURIComponent(title)}')" title="Supprimer">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeEditAlbum(); });
}
window.openEditAlbum = openEditAlbum;

function closeEditAlbum() {
  const o = document.getElementById("edit-modal-overlay");
  if (o) { o.classList.remove("visible"); setTimeout(() => o.remove(), 200); }
}
window.closeEditAlbum = closeEditAlbum;

function submitEditAlbum(encAgency, encArtist, encTitle) {
  const oldAgency = decodeURIComponent(encAgency);
  const oldArtist = decodeURIComponent(encArtist);
  const oldTitle  = decodeURIComponent(encTitle);
  const found = findAlbum(oldAgency, oldArtist, oldTitle);
  if (!found) { showDebugToast("Album introuvable", "#ef4444"); return; }

  const newTitle  = document.getElementById("edit-title").value.trim();
  const newArtist = document.getElementById("edit-artist").value.trim();
  const newAgency = document.getElementById("edit-agency").value.trim();
  const newImg    = document.getElementById("edit-img").value.trim();
  const newYearEl = document.getElementById("edit-year");
  const newYear   = newYearEl && newYearEl.value ? parseInt(newYearEl.value) : null;
  const errEl = document.getElementById("edit-error");

  if (!newTitle || !newArtist || !newAgency) {
    errEl.textContent = "Titre, artiste et agence sont obligatoires.";
    errEl.style.display = "block"; return;
  }

  // Album mis à jour (on garde le statut et le mp3 existants)
  const updated = { ...found.album, title: newTitle, img: newImg, year: newYear };

  // Si l'artiste ou l'agence a changé, on déplace l'album
  if (newAgency !== oldAgency || newArtist !== oldArtist) {
    // Retirer de l'ancien emplacement
    found.list.splice(found.idx, 1);
    // Nettoyer les structures vides
    if (found.list.length === 0) delete collectionData[oldAgency][oldArtist];
    if (collectionData[oldAgency] && Object.keys(collectionData[oldAgency]).length === 0) delete collectionData[oldAgency];
    // Ajouter au nouvel emplacement
    if (!collectionData[newAgency]) collectionData[newAgency] = {};
    if (!collectionData[newAgency][newArtist]) collectionData[newAgency][newArtist] = [];
    collectionData[newAgency][newArtist].push(updated);
  } else {
    // Même emplacement : mise à jour directe
    found.list[found.idx] = updated;
  }

  saveCollection();
  if (window.syncToFirestore) window.syncToFirestore();
  initSidebar();
  closeEditAlbum();
  showDashboard();
  showDebugToast("✓ Album modifié", "#34d399");
}
window.submitEditAlbum = submitEditAlbum;

function deleteAlbum(encAgency, encArtist, encTitle) {
  const agency = decodeURIComponent(encAgency);
  const artist = decodeURIComponent(encArtist);
  const title  = decodeURIComponent(encTitle);
  const found = findAlbum(agency, artist, title);
  if (!found) { showDebugToast("Album introuvable", "#ef4444"); return; }

  const ok = confirm(`Supprimer "${title}" de ta collection ?\n\nCette action est irréversible.`);
  if (!ok) return;

  found.list.splice(found.idx, 1);
  if (found.list.length === 0) delete collectionData[agency][artist];
  if (collectionData[agency] && Object.keys(collectionData[agency]).length === 0) delete collectionData[agency];

  saveCollection();
  if (window.syncToFirestore) window.syncToFirestore();
  initSidebar();
  closeEditAlbum();
  showDashboard();
  showDebugToast("🗑 Album supprimé", "#ef4444");
}
window.deleteAlbum = deleteAlbum;

// ==========================================
// EXPOSITION GLOBALE POUR FIREBASE SYNC
// ==========================================
// Firebase.js lit/écrit window.collectionData et window.photocardsData
Object.defineProperty(window, 'collectionData', {
  get: () => collectionData,
  set: (v) => { collectionData = v; },
  configurable: true
});
Object.defineProperty(window, 'photocardsData', {
  get: () => photocardsData,
  set: (v) => { photocardsData = v; },
  configurable: true
});
Object.defineProperty(window, 'binderTotalPages', {
  get: () => binderTotalPages,
  set: (v) => { binderTotalPages = v; },
  configurable: true
});

window._loadLocalData = function() {
  collectionData   = JSON.parse(localStorage.getItem("kshelf_save"))        || {};
  photocardsData   = JSON.parse(localStorage.getItem("kshelf_photocards"))  || [];
  binderTotalPages = parseInt(localStorage.getItem("kshelf_binder_pages")   || "1");
  if (window.initSidebar)   window.initSidebar();
  if (window.showDashboard) window.showDashboard();
};

// ==========================================
// INIT — déplacé en fin de fichier (voir tout en bas)
// ==========================================
const urlParams = new URLSearchParams(window.location.search);
const authCode  = urlParams.get("code");
if (authCode) exchangeSpotifyCode(authCode);
else { restoreSpotifySession(); updateSpotifyButton(!!spotifyAccessToken); }

window.showDashboard = showDashboard;
window.selectArtist  = selectArtist;
window.handleSearch  = handleSearch;

// ==========================================
// CONCERTS — système complet
// ==========================================
let concertsData = JSON.parse(localStorage.getItem("kshelf_concerts")) || [];

function saveConcerts() {
  localStorage.setItem("kshelf_concerts", JSON.stringify(concertsData));
  syncSafe();
}

function concertDateLabel(dateStr) {
  if (!dateStr) return "Date inconnue";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function starsHtml(rating, interactive = false) {
  let html = `<div class="stars-row ${interactive ? 'interactive' : ''}" data-rating="${rating || 0}">`;
  for (let i = 1; i <= 5; i++) {
    const filled = i <= (rating || 0);
    html += interactive
      ? `<span class="star-icon ${filled ? 'filled' : ''}" onclick="setConcertRating(${i})">★</span>`
      : `<span class="star-icon ${filled ? 'filled' : ''}">★</span>`;
  }
  html += `</div>`;
  return html;
}

// ==========================================
// VUE LISTE DES CONCERTS
// ==========================================
function showConcerts() {
  document.querySelectorAll(".artist-item").forEach(el => el.classList.remove("active"));
  // sidebarTab est déjà "concerts" donc initSidebar() régénère le bon état actif
  document.documentElement.style.setProperty("--dynamic-agency-color", "rgba(255,255,255,0.3)");

  const sorted = [...concertsData].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const cardsHtml = sorted.map(c => {
    const cover = c.photos && c.photos[0] ? c.photos[0] : null;
    const mediaContent = cover
      ? `<img src="${cover}" alt="${c.artist}" class="concert-card-img">`
      : `<div class="concert-card-placeholder">🎤</div>`;
    return `
      <div class="concert-card" onclick="openConcertDetail('${c.id}')">
        <div class="concert-card-media">
          ${mediaContent}
          <div class="concert-card-overlay">
            ${starsHtml(c.rating)}
          </div>
        </div>
        <div class="concert-card-info">
          <h4 class="concert-card-artist">${c.artist}</h4>
          <p class="concert-card-meta">${concertDateLabel(c.date)} · ${c.venue || "Lieu non renseigné"}</p>
          ${c.tour ? `<p class="concert-card-tour">${c.tour}</p>` : ""}
        </div>
      </div>`;
  }).join("");

  document.getElementById("main-content").innerHTML = `
    <div class="artist-view-header animate-fade">
      <div class="breadcrumbs">collection</div>
      <h2 class="artist-main-title">concerts.</h2>
      <p class="album-total-count">${concertsData.length} concert(s) vécu(s)</p>
      ${concertsData.length ? `<button class="concerts-map-btn" onclick="showConcertsMap()">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
        Voir la carte
      </button>` : ""}
    </div>
    <div class="concerts-grid animate-fade">
      ${cardsHtml || emptyState(
        '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
        "Aucun concert pour l'instant",
        "Immortalise tes souvenirs de lives : artiste, date, lieu et photos.",
        { label: "Ajouter un concert", onclick: "openAddConcert()" }
      )}
    </div>`;
}
window.showConcerts = showConcerts;

// ==========================================
// CARTE DES CONCERTS (Leaflet + géocodage Nominatim)
// ==========================================
const geocodeCache = JSON.parse(localStorage.getItem("kshelf_geocode_cache") || "{}");

function saveGeocodeCache() {
  try { localStorage.setItem("kshelf_geocode_cache", JSON.stringify(geocodeCache)); } catch(e) {}
}

async function geocodeVenue(venue) {
  if (!venue) return null;
  const key = venue.trim().toLowerCase();
  if (geocodeCache[key]) return geocodeCache[key];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(venue)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    const data = await res.json();
    if (data && data[0]) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache[key] = coords;
      saveGeocodeCache();
      return coords;
    }
  } catch(e) { /* échec géocodage, on ignore ce lieu */ }
  return null;
}

let concertMapInstance = null;

async function showConcertsMap() {
  document.getElementById("main-content").innerHTML = `
    <div class="artist-view-header animate-fade">
      <div class="breadcrumbs">collection · concerts</div>
      <h2 class="artist-main-title">carte des concerts.</h2>
      <p class="album-total-count">tes souvenirs à travers le monde</p>
      <button class="concerts-map-btn" onclick="showConcerts()">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m0 0l7 7m-7-7l7-7"/></svg>
        Retour à la liste
      </button>
    </div>
    <div class="concert-map-wrapper animate-fade">
      <div id="concert-map"></div>
      <div class="concert-map-status" id="concert-map-status">Localisation des lieux en cours…</div>
    </div>`;

  // Attendre que le DOM soit prêt et que Leaflet soit chargé
  if (typeof L === "undefined") {
    document.getElementById("concert-map-status").textContent = "La carte n'a pas pu être chargée. Vérifie ta connexion.";
    return;
  }

  // Initialiser la carte
  if (concertMapInstance) { concertMapInstance.remove(); concertMapInstance = null; }
  concertMapInstance = L.map("concert-map", { scrollWheelZoom: true }).setView([20, 0], 2);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '© OpenStreetMap © CARTO',
    maxZoom: 19,
  }).addTo(concertMapInstance);

  // Géocoder chaque concert avec un lieu
  const withVenue = concertsData.filter(c => c.venue && c.venue.trim());
  const statusEl = document.getElementById("concert-map-status");

  if (!withVenue.length) {
    statusEl.textContent = "Aucun de tes concerts n'a de lieu renseigné. Ajoute un lieu à tes concerts pour les voir ici !";
    return;
  }

  const bounds = [];
  let located = 0;

  for (const c of withVenue) {
    const coords = await geocodeVenue(c.venue);
    if (coords) {
      located++;
      bounds.push([coords.lat, coords.lng]);
      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius: 8,
        fillColor: "#e040a0",
        color: "#fff",
        weight: 2,
        fillOpacity: 0.85,
      }).addTo(concertMapInstance);
      marker.bindPopup(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif; min-width:140px">
          <strong style="font-size:0.95rem">${c.artist}</strong><br>
          <span style="font-size:0.8rem; color:#666">${c.venue}</span><br>
          <span style="font-size:0.75rem; color:#999">${concertDateLabel(c.date)}</span>
        </div>`);
    }
    // Pause pour respecter la limite de Nominatim (1 req/sec)
    await new Promise(r => setTimeout(r, 1100));
  }

  if (bounds.length) {
    concertMapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
    statusEl.textContent = `${located} concert(s) localisé(s) sur ${withVenue.length}`;
  } else {
    statusEl.textContent = "Impossible de localiser tes lieux de concert.";
  }
}
window.showConcertsMap = showConcertsMap;

// ==========================================
// MODAL AJOUT / EDITION CONCERT
// ==========================================
let concertFormState = {
  id: null,
  rating: 0,
  photos: [],
  videos: [],
  setlist: [],
};

function openAddConcert(concertId = null) {
  const existing = concertId ? concertsData.find(c => c.id === concertId) : null;

  concertFormState = existing
    ? {
        id: existing.id,
        rating: existing.rating || 0,
        photos: [...(existing.photos || [])],
        videos: [],
        setlist: [...(existing.setlist || [])],
      }
    : { id: null, rating: 0, photos: [], videos: [], setlist: [] };

  const overlay = document.createElement("div");
  overlay.id = "concert-modal-overlay";
  overlay.className = "add-modal-overlay visible";
  overlay.onclick = (e) => { if (e.target === overlay) closeConcertModal(); };

  overlay.innerHTML = `
    <div class="add-modal glass-panel concert-form-modal">
      <button class="modal-close" onclick="closeConcertModal()">✕</button>
      <h2 class="add-modal-title">${existing ? "Modifier le concert" : "Ajouter un concert"}</h2>

      <div class="add-form concert-form">
        <div class="add-form-row">
          <div class="add-form-group">
            <label>Artiste *</label>
            <input type="text" id="concert-artist" placeholder="NewJeans" value="${existing?.artist || ""}">
          </div>
          <div class="add-form-group">
            <label>Date *</label>
            <input type="date" id="concert-date" value="${existing?.date || ""}">
          </div>
        </div>

        <div class="add-form-row">
          <div class="add-form-group">
            <label>Lieu</label>
            <input type="text" id="concert-venue" placeholder="AccorHotels Arena, Paris" value="${existing?.venue || ""}">
          </div>
          <div class="add-form-group">
            <label>Tournée</label>
            <input type="text" id="concert-tour" placeholder="World Tour 2026" value="${existing?.tour || ""}">
          </div>
        </div>

        <div class="add-form-group">
          <label>Ma note</label>
          <div id="concert-rating-picker">${starsHtml(concertFormState.rating, true)}</div>
        </div>

        <div class="add-form-group">
          <label>Mon avis</label>
          <textarea id="concert-review" placeholder="Une expérience inoubliable..." rows="4">${existing?.review || ""}</textarea>
        </div>

        <div class="add-form-group">
          <label>Setlist (un titre par ligne)</label>
          <textarea id="concert-setlist" placeholder="Hype Boy&#10;Attention&#10;Super Shy" rows="4">${(existing?.setlist || []).join("\n")}</textarea>
        </div>

        <div class="add-form-group">
          <label>Photos (URLs)</label>
          <div class="concert-url-input-row">
            <input type="text" id="concert-photo-url" placeholder="https://... (URL d'une image)">
            <button type="button" class="concert-add-url-btn" onclick="addConcertPhotoUrl()">+ Ajouter</button>
          </div>
          <div id="concert-photos-preview" class="concert-media-preview-grid">${renderMediaPreview(concertFormState.photos, 'photos')}</div>
        </div>

        <div id="concert-error" class="add-error" style="display:none"></div>
        <button class="add-submit-btn" onclick="submitConcert()">${existing ? "Enregistrer les modifications" : "Ajouter ce concert"}</button>
        ${existing ? `<button class="signout-btn" onclick="deleteConcert('${existing.id}')">Supprimer ce concert</button>` : ""}
      </div>
    </div>`;

  document.body.appendChild(overlay);

  // Attacher le listener preview sur le champ URL
  const urlInput = document.getElementById("concert-photo-url");
  if (urlInput) {
    urlInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") { e.preventDefault(); addConcertPhotoUrl(); }
    });
  }
}
window.openAddConcert = openAddConcert;

function closeConcertModal() {
  document.getElementById("concert-modal-overlay")?.remove();
}
window.closeConcertModal = closeConcertModal;

function setConcertRating(n) {
  concertFormState.rating = n;
  document.getElementById("concert-rating-picker").innerHTML = starsHtml(n, true);
}
window.setConcertRating = setConcertRating;

// ==========================================
// UPLOAD MEDIA (compression photos, vidéos en l'état)
// ==========================================
function compressConcertImage(file, maxSize = 1000, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize) { height *= maxSize / width; width = maxSize; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleConcertMediaUpload(input, type) {
  const files = Array.from(input.files || []);
  for (const file of files) {
    try {
      if (type === "photos") {
        const compressed = await compressConcertImage(file);
        concertFormState.photos.push(compressed);
      } else {
        // Vidéos : pas de compression possible côté client simplement —
        // on prévient si trop lourd pour éviter de saturer le localStorage
        if (file.size > 8 * 1024 * 1024) {
          alert(`"${file.name}" dépasse 8MB et risque de ne pas pouvoir être sauvegardée localement. Privilégie des vidéos courtes.`);
        }
        const dataUrl = await readFileAsDataURL(file);
        concertFormState.videos.push(dataUrl);
      }
    } catch(e) {
      console.error("Erreur upload média concert:", e);
    }
  }
  document.getElementById(`concert-${type}-preview`).innerHTML = renderMediaPreview(concertFormState[type], type);
  input.value = "";
}
window.handleConcertMediaUpload = handleConcertMediaUpload;

function addConcertPhotoUrl() {
  const input = document.getElementById("concert-photo-url");
  if (!input) return;
  const url = input.value.trim();
  if (!url) return;
  if (!url.startsWith("http")) {
    alert("Merci d'entrer une URL valide commençant par http");
    return;
  }
  concertFormState.photos.push(url);
  document.getElementById("concert-photos-preview").innerHTML = renderMediaPreview(concertFormState.photos, "photos");
  input.value = "";
}
window.addConcertPhotoUrl = addConcertPhotoUrl;

function renderMediaPreview(items, type) {
  return items.map((src, i) => {
    const thumb = type === "photos"
      ? `<img src="${src}" class="concert-media-thumb">`
      : `<video src="${src}" class="concert-media-thumb"></video>`;
    return `<div class="concert-media-item">
      ${thumb}
      <button class="concert-media-remove" onclick="removeConcertMedia('${type}', ${i})">✕</button>
    </div>`;
  }).join("");
}

function removeConcertMedia(type, index) {
  concertFormState[type].splice(index, 1);
  document.getElementById(`concert-${type}-preview`).innerHTML = renderMediaPreview(concertFormState[type], type);
}
window.removeConcertMedia = removeConcertMedia;

// ==========================================
// SUBMIT / DELETE
// ==========================================
function submitConcert() {
  const artist = document.getElementById("concert-artist").value.trim();
  const date   = document.getElementById("concert-date").value;
  const venue  = document.getElementById("concert-venue").value.trim();
  const tour   = document.getElementById("concert-tour").value.trim();
  const review = document.getElementById("concert-review").value.trim();
  const setlistRaw = document.getElementById("concert-setlist").value.trim();
  const setlist = setlistRaw ? setlistRaw.split("\n").map(s => s.trim()).filter(Boolean) : [];
  const errEl = document.getElementById("concert-error");

  if (!artist || !date) {
    errEl.textContent = "L'artiste et la date sont obligatoires.";
    errEl.style.display = "block";
    return;
  }

  const concertObj = {
    id: concertFormState.id || ("concert_" + Date.now()),
    artist, date, venue, tour, review, setlist,
    rating: concertFormState.rating,
    photos: concertFormState.photos,
  };

  if (concertFormState.id) {
    const idx = concertsData.findIndex(c => c.id === concertFormState.id);
    if (idx !== -1) concertsData[idx] = concertObj;
  } else {
    concertsData.push(concertObj);
  }

  saveConcerts();
  closeConcertModal();
  showConcerts();
}
window.submitConcert = submitConcert;

function deleteConcert(id) {
  if (!confirm("Supprimer ce concert et tous ses souvenirs ?")) return;
  concertsData = concertsData.filter(c => c.id !== id);
  saveConcerts();
  closeConcertModal();
  showConcerts();
}
window.deleteConcert = deleteConcert;

// ==========================================
// FICHE DÉTAIL CONCERT
// ==========================================
function openConcertDetail(id) {
  const c = concertsData.find(x => x.id === id);
  if (!c) return;

  const overlay = document.createElement("div");
  overlay.id = "concert-detail-overlay";
  overlay.className = "add-modal-overlay visible";
  overlay.onclick = (e) => { if (e.target === overlay) closeConcertDetail(); };

  const photosHtml = (c.photos || []).map(src => `<img src="${src}" class="concert-gallery-photo" onclick="event.stopPropagation()">`).join("");
  const setlistHtml = (c.setlist || []).map((t, i) => `<div class="modal-track"><span class="modal-track-num">${i+1}</span><span class="modal-track-name">${t}</span></div>`).join("");

  overlay.innerHTML = `
    <div class="album-modal concert-detail-modal" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="closeConcertDetail()">✕</button>
      <div class="concert-detail-scroll">

        <div class="concert-detail-header">
          <p class="modal-agency">${concertDateLabel(c.date)}${c.tour ? " · " + c.tour : ""}</p>
          <h2 class="modal-title">${c.artist}</h2>
          <p class="modal-artist">📍 ${c.venue || "Lieu non renseigné"}</p>
          ${starsHtml(c.rating)}
        </div>

        ${c.review ? `<div class="concert-detail-section">
          <h3 class="modal-section-title">Mon avis</h3>
          <p class="concert-review-text">${c.review}</p>
        </div>` : ""}

        ${setlistHtml ? `<div class="concert-detail-section">
          <h3 class="modal-section-title">Setlist</h3>
          <div class="modal-tracks-container">${setlistHtml}</div>
        </div>` : ""}

        ${photosHtml ? `<div class="concert-detail-section">
          <h3 class="modal-section-title">Photos</h3>
          <div class="concert-gallery-grid">${photosHtml}</div>
        </div>` : ""}

        <div class="concert-detail-actions">
          <button class="add-submit-btn" onclick="closeConcertDetail(); openAddConcert('${c.id}')">✎ Modifier</button>
        </div>

      </div>
    </div>`;

  document.body.appendChild(overlay);
}
window.openConcertDetail = openConcertDetail;

function closeConcertDetail() {
  document.getElementById("concert-detail-overlay")?.remove();
}
window.closeConcertDetail = closeConcertDetail;

// Exposer pour Firebase sync
Object.defineProperty(window, 'concertsData', {
  get: () => concertsData,
  set: (v) => { concertsData = v; },
  configurable: true
});

// ==========================================
// VUE FAVORIS
// ==========================================
function showFavorites(filter = "all") {
  document.querySelectorAll(".artist-item").forEach(el => el.classList.remove("active"));
  document.documentElement.style.setProperty("--dynamic-agency-color", "rgba(255,215,0,0.4)");

  // Collecter tous les favoris
  const favAlbums = [];
  for (const ag in collectionData)
    for (const ar in collectionData[ag])
      collectionData[ag][ar].forEach(a => {
        if (a.status === "favorite") favAlbums.push({ ...a, artist: ar, agency: ag });
      });
  const favPcs    = photocardsData.filter(pc => pc.status === "favorite");

  let html = "";

  // Albums favoris
  if (filter === "all" || filter === "albums") {
    if (favAlbums.length) {
      const cards = favAlbums.map(a => albumCardHtml(a, a.artist, a.agency)).join("");
      html += `<div class="favorites-section">
        <h3 class="favorites-section-label">⭐ Albums</h3>
        <div class="albums-display-grid">${cards}</div>
      </div>`;
    }
  }

  // Photocards favorites
  if (filter === "all" || filter === "photocards") {
    if (favPcs.length) {
      const cards = favPcs.map(pc => {
        const isFav = true;
        const agencyOfCard = Object.keys(collectionData).find(ag => collectionData[ag][pc.artist] !== undefined) || "Autres / Indés";
        const auraColor = agencyThemes[agencyOfCard] || "#ffffff";
        const imgContent = pc.img
          ? `<img src="${pc.img}" alt="${pc.member||''}" class="binder-card-img">`
          : `<div class="binder-card-empty-img"><span>${pc.member?pc.member[0]:"?"}</span></div>`;
        return `
          <div class="binder-slot-wrapper is-favorite">
            <div class="group-aura" style="--aura-color:${auraColor}"></div>
            <div class="binder-slot filled is-favorite">
              <div class="binder-card-tilt">
                ${imgContent}
                <div class="holo-layer"></div>
                <div class="binder-card-info">
                  <span class="binder-card-member">${pc.member||"—"}</span>
                  <span class="binder-card-artist">${pc.artist}</span>
                </div>
              </div>
            </div>
          </div>`;
      }).join("");
      html += `<div class="favorites-section">
        <h3 class="favorites-section-label">★ Photocards</h3>
        <div class="binder-grid" style="max-width:600px">${cards}</div>
      </div>`;
    }
  }

  if (!html) {
    html = emptyState(
      '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
      "Aucun favori pour l'instant",
      "Marque tes albums et photocards préférés d'un ★ pour les retrouver ici.",
      null
    );
  }

  document.getElementById("main-content").innerHTML = `
    <div class="artist-view-header animate-fade">
      <div class="breadcrumbs">collection</div>
      <h2 class="artist-main-title">favoris.</h2>
      <p class="album-total-count">${favAlbums.length + favPcs.length} élément(s)</p>
    </div>
    <div class="favorites-content animate-fade">${html}</div>`;

  // Réactiver le tilt sur les photocards favoris
  setTimeout(initTilt, 60);
}
window.showFavorites = showFavorites;

// ==========================================
// PROFIL ENRICHI — BIASES & RÉSEAUX
// (profileExtra est déclaré tout en haut du fichier pour être
//  disponible dès le premier instant, avant même que firebase.js
//  ne tente d'y accéder de manière asynchrone)
// ==========================================
// { favGroup, favAlbum, youtube, tiktok, pinterest, kpopping, biases: [{name, group, img}] }

function saveProfileExtra() {
  localStorage.setItem("kshelf_profile_extra", JSON.stringify(profileExtra));
  if (window.syncToFirestore) window.syncToFirestore();
}

// Charger les données dans le modal
function loadProfileExtraIntoForm() {
  // Recharger depuis localStorage pour avoir les données les plus récentes
  profileExtra = JSON.parse(localStorage.getItem("kshelf_profile_extra") || "{}");
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
  setVal("profile-fav-group",  profileExtra.favGroup);
  setVal("profile-fav-album",  profileExtra.favAlbum);
  setVal("profile-youtube",    profileExtra.youtube);
  setVal("profile-tiktok",     profileExtra.tiktok);
  setVal("profile-pinterest",  profileExtra.pinterest);
  setVal("profile-kpopping",   profileExtra.kpopping);
  renderBiasesGrid();
}
window.loadProfileExtraIntoForm = loadProfileExtraIntoForm;

// Chercher une photo de l'artiste via le wiki K-pop (fandom) puis Wikipédia
async function fetchArtistPhoto(name, group) {
  const tryApi = async (base, title) => {
    try {
      const res = await fetch(`${base}?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=300&redirects=1&origin=*`);
      const data = await res.json();
      const pages = data.query?.pages;
      if (pages) {
        const page = Object.values(pages)[0];
        if (page?.thumbnail?.source) return page.thumbnail.source;
      }
    } catch (e) {}
    return null;
  };
  const fandom = "https://kpop.fandom.com/api.php";
  const wiki = "https://en.wikipedia.org/w/api.php";
  const tries = [];
  if (group) tries.push([fandom, `${name} (${group})`]);
  tries.push([fandom, name]);
  if (group) tries.push([wiki, `${name} (${group} member)`], [wiki, `${name} (singer)`]);
  tries.push([wiki, name]);
  for (const [base, title] of tries) {
    const url = await tryApi(base, title);
    if (url) return url;
  }
  return null; // fallback initiale géré dans le rendu
}

// Rendu de la grille des biases
function renderBiasesGrid() {
  const grid = document.getElementById("biases-grid");
  if (!grid) return;
  const biases = profileExtra.biases || [];
  grid.innerHTML = biases.map((b, i) => `
    <div class="bias-card">
      <div class="bias-avatar">
        ${b.img ? `<img src="${b.img}" alt="${b.name}">` : `<span>${b.name[0]}</span>`}
      </div>
      <p class="bias-name">${b.name}</p>
      <p class="bias-group">${b.group || ""}</p>
      <button class="bias-remove" onclick="removeBias(${i})">✕</button>
    </div>`).join("");
  const countEl = document.getElementById("biases-count");
  if (countEl) countEl.innerText = `${biases.length}/6`;
}

async function addBias() {
  const nameEl  = document.getElementById("bias-name-input");
  const groupEl = document.getElementById("bias-group-input");
  const name  = nameEl?.value.trim();
  const group = groupEl?.value.trim();
  if (!name) return;
  if ((profileExtra.biases || []).length >= 6) { alert("Maximum 6 biases !"); return; }

  // Feedback pendant la recherche
  const addBtn = document.querySelector(".kp2-add-submit");
  if (addBtn) { addBtn.innerText = "⏳"; addBtn.disabled = true; }

  const img = await fetchArtistPhoto(name, group);

  if (addBtn) { addBtn.innerText = "Ajouter"; addBtn.disabled = false; }

  if (!profileExtra.biases) profileExtra.biases = [];
  profileExtra.biases.push({ name, group, img: img || "" });
  localStorage.setItem("kshelf_profile_extra", JSON.stringify(profileExtra));
  renderBiasesGrid();
  if (window.renderKp2Badges) renderKp2Badges();
  closeBiasAdd();
}
window.addBias = addBias;

function removeBias(index) {
  profileExtra.biases = (profileExtra.biases || []).filter((_, i) => i !== index);
  renderBiasesGrid();
  if (window.renderKp2Badges) renderKp2Badges();
}
window.removeBias = removeBias;

// ==========================================
// PROFIL PUBLIC
// ==========================================
function openPublicProfile() {
  const user = window._currentUser;
  if (!user) return;
  const pseudo   = localStorage.getItem(`kshelf_pseudo_${user.uid}`) || user.displayName || "Utilisateur";
  const photoURL = localStorage.getItem(`kshelf_photo_${user.uid}`) || user.photoURL || "";

  // Toujours recharger depuis localStorage pour avoir les données les plus récentes
  const extra = JSON.parse(localStorage.getItem("kshelf_profile_extra") || "{}");
  profileExtra = extra; // synchroniser aussi la variable locale

  // Stats
  let totalAlbums = 0, favAlbums = 0;
  for (const ag in collectionData)
    for (const ar in collectionData[ag]) {
      totalAlbums += collectionData[ag][ar].length;
      favAlbums   += collectionData[ag][ar].filter(a => a.status === "favorite").length;
    }

  const biasesHtml = (extra.biases || []).map(b => `
    <div class="public-bias-card">
      <div class="public-bias-avatar">
        ${b.img ? `<img src="${b.img}" alt="${b.name}">` : `<span>${b.name[0]}</span>`}
      </div>
      <p class="public-bias-name">${b.name}</p>
      <p class="public-bias-group">${b.group || ""}</p>
    </div>`).join("");

  const socialsHtml = [
    extra.youtube    ? `<a class="public-social-link" href="https://youtube.com/${extra.youtube}" target="_blank"><span class="public-social-icon">▶</span>${extra.youtube}</a>` : "",
    extra.tiktok     ? `<a class="public-social-link" href="https://tiktok.com/${extra.tiktok}" target="_blank"><span class="public-social-icon">♪</span>${extra.tiktok}</a>` : "",
    extra.pinterest  ? `<a class="public-social-link" href="https://pinterest.com/${extra.pinterest}" target="_blank"><span class="public-social-icon">P</span>${extra.pinterest}</a>` : "",
    extra.kpopping   ? `<a class="public-social-link" href="https://kpopping.com/${extra.kpopping}" target="_blank"><span class="public-social-icon">K</span>${extra.kpopping}</a>` : "",
  ].filter(Boolean).join("");

  const overlay = document.createElement("div");
  overlay.id = "public-profile-overlay";
  overlay.className = "add-modal-overlay visible";
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div class="album-modal public-profile-modal" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="document.getElementById('public-profile-overlay').remove()">✕</button>
      <div class="public-profile-scroll">

        <div class="public-profile-header">
          <div class="public-profile-avatar">
            ${photoURL ? `<img src="${photoURL}" alt="${pseudo}">` : `<span>${pseudo[0]}</span>`}
          </div>
          <h2 class="public-profile-name">${pseudo}</h2>
          ${socialsHtml ? `<div class="public-socials">${socialsHtml}</div>` : ""}
        </div>

        <div class="public-stats-row">
          <div class="public-stat"><span class="public-stat-num">${totalAlbums}</span><span class="public-stat-label">albums</span></div>
          <div class="public-stat"><span class="public-stat-num">${favAlbums}</span><span class="public-stat-label">favoris</span></div>
          <div class="public-stat"><span class="public-stat-num">${concertsData.length}</span><span class="public-stat-label">concerts</span></div>
          <div class="public-stat"><span class="public-stat-num">${photocardsData.length}</span><span class="public-stat-label">photocards</span></div>
        </div>

        ${extra.favGroup || extra.favAlbum ? `
        <div class="public-fav-section">
          ${extra.favGroup ? `<div class="public-fav-item"><span class="public-fav-label">Groupe favori</span><span class="public-fav-value">${extra.favGroup}</span></div>` : ""}
          ${extra.favAlbum ? `<div class="public-fav-item"><span class="public-fav-label">Album favori</span><span class="public-fav-value">${extra.favAlbum}</span></div>` : ""}
        </div>` : ""}

        ${biasesHtml ? `
        <div class="public-biases-section">
          <h3 class="modal-section-title">Mes biases</h3>
          <div class="public-biases-grid">${biasesHtml}</div>
        </div>` : ""}

      </div>
    </div>`;

  document.body.appendChild(overlay);
}
window.openPublicProfile = openPublicProfile;

// ==========================================
// INIT FINAL — appelé une fois TOUT le script chargé
// (garantit que collectionData, photocardsData, concertsData,
//  profileExtra etc. sont tous déclarés avant le premier rendu)
// ==========================================
initSidebar();
showDashboard();
applySpotifyVisibility();

// Masquer l'écran de chargement une fois le site prêt
(function hideSplash() {
  const splash = document.getElementById("splash-screen");
  if (!splash) return;
  // Laisser le temps à l'animation du logo de s'afficher, puis fondu
  setTimeout(() => {
    splash.classList.add("splash-hidden");
    setTimeout(() => splash.remove(), 600);
  }, 700);
})();

// ==========================================
// RECHERCHE MOBILE
// ==========================================
function toggleMobileSearch() {
  const overlay = document.getElementById("mobile-search-overlay");
  if (!overlay) return;
  overlay.classList.toggle("visible");
  if (overlay.classList.contains("visible")) {
    setTimeout(() => document.getElementById("mobile-search-input")?.focus(), 100);
  }
}
window.toggleMobileSearch = toggleMobileSearch;

// ==========================================
// DROPDOWN MENU PROFIL
// ==========================================
function toggleProfileDropdown() {
  const user = window._currentUser;
  if (!user) { openProfilePage(); return; }
  document.getElementById("profile-dropdown-menu")?.classList.toggle("visible");
}
window.toggleProfileDropdown = toggleProfileDropdown;

function closeProfileDropdown() {
  document.getElementById("profile-dropdown-menu")?.classList.remove("visible");
}
window.closeProfileDropdown = closeProfileDropdown;

// Fermer le dropdown si clic ailleurs
document.addEventListener("click", (e) => {
  const wrap = document.querySelector(".profile-dropdown-wrap");
  if (wrap && !wrap.contains(e.target)) closeProfileDropdown();
});

// ==========================================
// PAGE PROFIL — ouverture avec stats
// ==========================================
function openProfilePage() {
  document.getElementById("profile-modal-overlay")?.classList.add("visible");
  setTimeout(() => {
    if (window.loadProfileExtraIntoForm) window.loadProfileExtraIntoForm();
    renderKprofileStats();
    renderBiasesGrid();
    renderKp2Top3();
    renderKp2Badges();
    initKfcTilt();
    kp2SyncHeroName();
    kp2LoadCovers();
  }, 50);
}
window.openProfilePage = openProfilePage;

function renderKprofileStats() {
  const grid = document.getElementById("kprofile-stats-grid");
  if (!grid) return;

  let totalAlbums = 0, favAlbums = 0;
  for (const ag in collectionData)
    for (const ar in collectionData[ag]) {
      totalAlbums += collectionData[ag][ar].length;
      favAlbums   += collectionData[ag][ar].filter(a => a.status === "favorite").length;
    }

  grid.innerHTML = `
    <div class="kprofile-stat"><span class="kprofile-stat-num">${totalAlbums}</span><span class="kprofile-stat-label">Albums</span></div>
    <div class="kprofile-stat"><span class="kprofile-stat-num">${favAlbums}</span><span class="kprofile-stat-label">Favoris</span></div>
    <div class="kprofile-stat"><span class="kprofile-stat-num">${concertsData.length}</span><span class="kprofile-stat-label">Concerts</span></div>
    <div class="kprofile-stat"><span class="kprofile-stat-num">${photocardsData.length}</span><span class="kprofile-stat-label">Photocards</span></div>
  `;
}
window.renderKprofileStats = renderKprofileStats;

// ==========================================
// PROFIL V2.1 — top 3 + sélecteur, badges, tilt 3D, tuile d'ajout de bias
// ==========================================

// -- Tuile d'ajout de bias (+ → formulaire) --
function openBiasAdd() {
  document.getElementById("kp2-add-tile")?.classList.add("kp2-add-open");
  setTimeout(() => document.getElementById("bias-name-input")?.focus(), 150);
}
window.openBiasAdd = openBiasAdd;

function closeBiasAdd() {
  document.getElementById("kp2-add-tile")?.classList.remove("kp2-add-open");
  const n = document.getElementById("bias-name-input");
  const g = document.getElementById("bias-group-input");
  if (n) n.value = "";
  if (g) g.value = "";
}
window.closeBiasAdd = closeBiasAdd;

// -- Albums favoris (aplatis, avec clé stable) --
function kp2FavoriteAlbums() {
  const out = [];
  for (const ag in collectionData)
    for (const ar in collectionData[ag])
      collectionData[ag][ar].forEach(al => {
        if (al.status === "favorite") out.push({ title: al.title, img: al.img || "", artist: ar, key: ar + "|" + al.title });
      });
  return out;
}

// -- Pochettes automatiques (iTunes, cache localStorage) --
let kp2CoverCache = {};
try { kp2CoverCache = JSON.parse(localStorage.getItem("kshelf_cover_cache") || "{}"); } catch (e) {}

async function kp2FetchCover(artist, title) {
  try {
    const q = encodeURIComponent(artist + " " + title.replace(/\(.*?\)/g, "").trim());
    const res = await fetch("https://itunes.apple.com/search?term=" + q + "&entity=album&limit=1");
    const d = await res.json();
    const url = d.results?.[0]?.artworkUrl100;
    return url ? url.replace("100x100", "400x400") : null;
  } catch (e) { return null; }
}

async function kp2LoadCovers() {
  let changed = false;
  for (const a of kp2FavoriteAlbums()) {
    if (a.img || kp2CoverCache[a.key]) continue;
    const url = await kp2FetchCover(a.artist, a.title);
    if (url) { kp2CoverCache[a.key] = url; changed = true; renderKp2Top3(); }
  }
  if (changed) { try { localStorage.setItem("kshelf_cover_cache", JSON.stringify(kp2CoverCache)); } catch (e) {} }
}

function kp2CoverFor(a) { return a.img || kp2CoverCache[a.key] || ""; }

// -- Top 3 --
function kp2Top3Albums() {
  const favs = kp2FavoriteAlbums();
  const chosen = (profileExtra.top3 || []).map(k => favs.find(f => f.key === k)).filter(Boolean);
  for (const f of favs) {
    if (chosen.length >= 3) break;
    if (!chosen.includes(f)) chosen.push(f);
  }
  return chosen.slice(0, 3);
}

function renderKp2Top3() {
  const grid = document.getElementById("kp2-top3-grid");
  if (!grid) return;
  const top3 = kp2Top3Albums();
  if (!top3.length) {
    grid.innerHTML = `<div class="kp2-top3-empty">Marque des albums en ★ favori pour remplir ton top 3 !</div>`;
    return;
  }
  grid.innerHTML = top3.map((a, i) => {
    const cover = kp2CoverFor(a);
    return `
    <div class="kp2-top3-item" onclick="openTop3Picker(${i})">
      <span class="kp2-top3-rank kp2-rank-${i + 1}">${i + 1}</span>
      <div class="kp2-top3-cover">${cover ? `<img src="${cover}" alt="">` : ""}</div>
      <p class="kp2-top3-title">${a.title}</p>
      <p class="kp2-top3-artist">${a.artist}</p>
    </div>`;
  }).join("");
}
window.renderKp2Top3 = renderKp2Top3;

// -- Sélecteur top 3 --
let kp2PickerIndex = null;
let _kp2Favs = [];

function openTop3Picker(i) {
  if (kp2PickerIndex === i) { closeTop3Picker(); return; }
  kp2PickerIndex = i;
  const panel = document.getElementById("kp2-picker");
  const grid = document.getElementById("kp2-picker-grid");
  const title = document.getElementById("kp2-picker-title");
  if (!panel || !grid) return;
  _kp2Favs = kp2FavoriteAlbums();
  const currentKey = kp2Top3Albums()[i]?.key;
  if (title) title.innerText = "choisir l'album — position №" + (i + 1);
  grid.innerHTML = _kp2Favs.map((a, idx) => {
    const cover = kp2CoverFor(a);
    return `
    <div class="kp2-pick-item ${a.key === currentKey ? "selected" : ""}" onclick="pickTop3(${idx})">
      <div class="kp2-pick-cover">${cover ? `<img src="${cover}" alt="">` : (a.title[0] || "?")}</div>
      <div class="kp2-pick-meta">
        <p class="kp2-pick-title">${a.title}</p>
        <p class="kp2-pick-artist">${a.artist}</p>
      </div>
    </div>`;
  }).join("");
  panel.style.display = "block";
}
window.openTop3Picker = openTop3Picker;

function closeTop3Picker() {
  kp2PickerIndex = null;
  const panel = document.getElementById("kp2-picker");
  if (panel) panel.style.display = "none";
}
window.closeTop3Picker = closeTop3Picker;

function pickTop3(favIdx) {
  if (kp2PickerIndex == null) return;
  const key = _kp2Favs[favIdx]?.key;
  if (!key) return;
  const keys = kp2Top3Albums().map(a => a.key);
  const j = keys.indexOf(key);
  if (j !== -1 && j !== kp2PickerIndex) keys[j] = keys[kp2PickerIndex]; // échange de positions
  keys[kp2PickerIndex] = key;
  profileExtra.top3 = keys;
  saveProfileExtra();
  renderKp2Top3();
  closeTop3Picker();
}
window.pickTop3 = pickTop3;

// -- Badges de collection --
function renderKp2Badges() {
  const grid = document.getElementById("kp2-badges-grid");
  if (!grid) return;

  let totalAlbums = 0, favAlbums = 0;
  const artists = new Set();
  for (const ag in collectionData)
    for (const ar in collectionData[ag]) {
      totalAlbums += collectionData[ag][ar].length;
      favAlbums += collectionData[ag][ar].filter(a => a.status === "favorite").length;
      if (collectionData[ag][ar].length) artists.add(ar);
    }
  const s = {
    albums: totalAlbums,
    favs: favAlbums,
    artists: artists.size,
    biases: (profileExtra.biases || []).length,
    photocards: photocardsData.length,
    concerts: concertsData.length,
    profileComplete: !!(document.getElementById("profile-pseudo-input")?.value && profileExtra.favGroup && profileExtra.favAlbum),
  };
  const defs = [
    { glyph: "✦", name: "Premier album", desc: "Ajouter ton 1er album", ok: s.albums >= 1 },
    { glyph: "◈", name: "Collectionneur", desc: "10 albums catalogués", ok: s.albums >= 10 },
    { glyph: "◆", name: "Sérieux", desc: "25 albums catalogués", ok: s.albums >= 25 },
    { glyph: "❖", name: "Obsédé (avoué)", desc: "50 albums catalogués", ok: s.albums >= 50 },
    { glyph: "★", name: "Cœur de fan", desc: "5 albums en favori", ok: s.favs >= 5 },
    { glyph: "♫", name: "Multi-fandom", desc: "5 artistes différents", ok: s.artists >= 5 },
    { glyph: "♥", name: "Bias confirmé", desc: "Déclarer un bias", ok: s.biases >= 1 },
    { glyph: "❤", name: "Polyamour", desc: "6 biases (le max !)", ok: s.biases >= 6 },
    { glyph: "◎", name: "Photocard hunter", desc: "10 photocards", ok: s.photocards >= 10 },
    { glyph: "♪", name: "Concert-goer", desc: "1er concert vécu", ok: s.concerts >= 1 },
    { glyph: "✧", name: "Tour de chauffe", desc: "5 concerts vécus", ok: s.concerts >= 5 },
    { glyph: "✪", name: "Profil complet", desc: "Pseudo, groupe et album favoris", ok: s.profileComplete },
  ];
  let earned = 0;
  grid.innerHTML = defs.map(b => {
    if (b.ok) earned++;
    return `
    <div class="kp2-badge ${b.ok ? "unlocked" : "locked"}">
      <span class="kp2-badge-icon" style="background:${b.ok ? "rgba(245,255,0,0.12)" : "rgba(128,135,153,0.1)"}; color:${b.ok ? "#f5ff00" : "#808799"};">${b.glyph}</span>
      <div style="min-width:0;">
        <p class="kp2-badge-name">${b.name}</p>
        <p class="kp2-badge-desc">${b.desc}</p>
      </div>
    </div>`;
  }).join("");
  const countEl = document.getElementById("kp2-badges-count");
  if (countEl) countEl.innerText = earned + "/" + defs.length;
}
window.renderKp2Badges = renderKp2Badges;

// -- Tilt 3D sur la fan card --
function initKfcTilt() {
  const el = document.querySelector(".kfc-frame");
  if (!el || el._tiltBound) return;
  el._tiltBound = true;
  el.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = "transform 0.08s ease-out";
    el.style.transform = `perspective(1000px) rotateY(${(px * 10).toFixed(2)}deg) rotateX(${(-py * 10).toFixed(2)}deg)`;
  });
  el.addEventListener("mouseleave", () => {
    el.style.transition = "transform 0.6s cubic-bezier(0.16,1,0.3,1)";
    el.style.transform = "perspective(1000px) rotate(-1.6deg)";
  });
}
window.initKfcTilt = initKfcTilt;

// -- Pseudo géant du héro --
function kp2SyncHeroName() {
  const heroEl = document.getElementById("kp2-hero-name");
  const input = document.getElementById("profile-pseudo-input");
  if (!heroEl) return;
  const pseudo = (input?.value || "").trim() || "profil";
  heroEl.textContent = pseudo;
  const dot = document.createElement("span");
  dot.className = "kp2-hero-dot";
  dot.textContent = ".";
  heroEl.appendChild(dot);
}
window.kp2SyncHeroName = kp2SyncHeroName;
document.getElementById("profile-pseudo-input")?.addEventListener("input", kp2SyncHeroName);
