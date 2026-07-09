// ==========================================
// K-SHELF — SYSTÈME DE THÈMES & SETTINGS
// ==========================================

const THEMES = {
  dark: {
    name: "Dark",
    label: "Glassmorphism",
    preview: "#07090e",
    vars: {
      "--bg":              "#07090e",
      "--surface":         "rgba(13,17,23,0.45)",
      "--surface-hover":   "rgba(255,255,255,0.06)",
      "--border":          "rgba(255,255,255,0.06)",
      "--border-hover":    "rgba(255,255,255,0.14)",
      "--text-primary":    "#ffffff",
      "--text-secondary":  "#808799",
      "--text-tertiary":   "#4a5060",
      "--accent":          "#ffffff",

      /* Typo */
      "--font-display":    "'Syne', sans-serif",
      "--font-body":       "'Plus Jakarta Sans', sans-serif",
      "--font-weight-display": "800",
      "--letter-spacing-display": "-2px",
      "--text-transform-display": "none",

      /* Formes */
      "--radius-card":     "16px",
      "--radius-panel":    "24px",
      "--radius-btn":      "10px",
      "--radius-pill":     "40px",
      "--btn-border":      "none",

      "--blur":            "blur(20px) saturate(190%)",
      "--grid-line":       "none",
      "--card-shadow":     "0 12px 40px rgba(0,0,0,0.3)",
      "--card-border":     "none",
    }
  },
  grid: {
    name: "Grid",
    label: "Technical",
    preview: "#e8e6e1",
    vars: {
      "--bg":              "#e8e6e1",
      "--surface":         "#f0ede8",
      "--surface-hover":   "#e0ddd8",
      "--border":          "rgba(0,0,0,0.15)",
      "--border-hover":    "rgba(0,0,0,0.4)",
      "--text-primary":    "#0a0a0a",
      "--text-secondary":  "#555555",
      "--text-tertiary":   "#999999",
      "--accent":          "#ff5500",

      /* Typo — mono technique */
      "--font-display":    "'JetBrains Mono', monospace",
      "--font-body":       "'Space Mono', monospace",
      "--font-weight-display": "700",
      "--letter-spacing-display": "-1px",
      "--text-transform-display": "uppercase",

      /* Formes — angles droits partout */
      "--radius-card":     "0px",
      "--radius-panel":    "0px",
      "--radius-btn":      "0px",
      "--radius-pill":     "2px",
      "--btn-border":      "1.5px solid currentColor",

      "--blur":            "none",
      "--grid-line":       "1px solid rgba(0,0,0,0.12)",
      "--card-shadow":     "none",
      "--card-border":     "1.5px solid rgba(0,0,0,0.15)",
    }
  },
  editorial: {
    name: "Editorial",
    label: "Serif",
    preview: "#f7f7f5",
    vars: {
      "--bg":              "#f7f7f5",
      "--surface":         "#ffffff",
      "--surface-hover":   "#f0f0ee",
      "--border":          "rgba(0,0,0,0.07)",
      "--border-hover":    "rgba(0,0,0,0.15)",
      "--text-primary":    "#0a0a0a",
      "--text-secondary":  "#6b6b6b",
      "--text-tertiary":   "#b0b0b0",
      "--accent":          "#0a0a0a",

      /* Typo — serif élégante */
      "--font-display":    "'Fraunces', serif",
      "--font-body":       "'Plus Jakarta Sans', sans-serif",
      "--font-weight-display": "500",
      "--letter-spacing-display": "-1px",
      "--text-transform-display": "none",

      /* Formes — pills ultra arrondies */
      "--radius-card":     "28px",
      "--radius-panel":    "32px",
      "--radius-btn":      "100px",
      "--radius-pill":     "100px",
      "--btn-border":      "1px solid rgba(0,0,0,0.08)",

      "--blur":            "blur(20px)",
      "--grid-line":       "none",
      "--card-shadow":     "0 4px 16px rgba(0,0,0,0.06)",
      "--card-border":     "1px solid rgba(0,0,0,0.06)",
    }
  },
  chatgpt: {
    name: "ChatGPT",
    label: "Dark Minimal",
    preview: "#212121",
    vars: {
      "--bg":              "#212121",
      "--surface":         "#2f2f2f",
      "--surface-hover":   "#3a3a3a",
      "--border":          "rgba(255,255,255,0.1)",
      "--border-hover":    "rgba(255,255,255,0.2)",
      "--text-primary":    "#ececec",
      "--text-secondary":  "#8e8ea0",
      "--text-tertiary":   "#565869",
      "--accent":          "#10a37f",

      "--font-display":    "'Syne', sans-serif",
      "--font-body":       "'Plus Jakarta Sans', sans-serif",
      "--font-weight-display": "700",
      "--letter-spacing-display": "-1px",
      "--text-transform-display": "none",

      "--radius-card":     "12px",
      "--radius-panel":    "16px",
      "--radius-btn":      "8px",
      "--radius-pill":     "8px",
      "--btn-border":      "none",

      "--blur":            "none",
      "--grid-line":       "none",
      "--card-shadow":     "0 2px 8px rgba(0,0,0,0.4)",
      "--card-border":     "1px solid rgba(255,255,255,0.08)",
    }
  },
  kpopping: {
    name: "Kpopping",
    label: "K-pop Coloré",
    preview: "#f7f7f8",
    vars: {
      "--bg":              "#f7f7f8",
      "--surface":         "#ffffff",
      "--surface-hover":   "#f0f0f2",
      "--border":          "rgba(0,0,0,0.08)",
      "--border-hover":    "rgba(0,0,0,0.16)",
      "--text-primary":    "#0d0d0d",
      "--text-secondary":  "#6b7280",
      "--text-tertiary":   "#9ca3af",
      "--accent":          "#e040a0",

      "--font-display":    "'Syne', sans-serif",
      "--font-body":       "'Plus Jakarta Sans', sans-serif",
      "--font-weight-display": "800",
      "--letter-spacing-display": "-1.5px",
      "--text-transform-display": "none",

      "--radius-card":     "20px",
      "--radius-panel":    "24px",
      "--radius-btn":      "100px",
      "--radius-pill":     "100px",
      "--btn-border":      "none",

      "--blur":            "none",
      "--grid-line":       "none",
      "--card-shadow":     "0 4px 16px rgba(0,0,0,0.08)",
      "--card-border":     "1px solid rgba(0,0,0,0.06)",
    }
  },
  lemontang: {
    name: "LemonTang",
    label: "Y2K Frutiger Aero",
    preview: "linear-gradient(135deg, #4fc3f7, #fff176)",
    vars: {
      "--bg":              "#5fc9e8",
      "--surface":         "rgba(255,255,255,0.22)",
      "--surface-hover":   "rgba(255,255,255,0.32)",
      "--border":          "rgba(255,255,255,0.45)",
      "--border-hover":    "rgba(255,255,255,0.7)",
      "--text-primary":    "#0d3b52",
      "--text-secondary":  "#1c5c78",
      "--text-tertiary":   "#3d7c95",
      "--accent":          "#ffe14d",

      /* Typo — rondes Y2K, gros titres ludiques */
      "--font-display":    "'Syne', sans-serif",
      "--font-body":       "'Plus Jakarta Sans', sans-serif",
      "--font-weight-display": "800",
      "--letter-spacing-display": "-1px",
      "--text-transform-display": "none",

      /* Formes — très arrondies, bulles */
      "--radius-card":     "26px",
      "--radius-panel":    "32px",
      "--radius-btn":      "100px",
      "--radius-pill":     "100px",
      "--btn-border":      "1px solid rgba(255,255,255,0.6)",

      "--blur":            "blur(18px) saturate(160%)",
      "--grid-line":       "none",
      "--card-shadow":     "0 10px 30px rgba(13,59,82,0.25), inset 0 1px 0 rgba(255,255,255,0.5)",
      "--card-border":     "1.5px solid rgba(255,255,255,0.55)",
    }
  }
};

// Settings par défaut
const DEFAULT_SETTINGS = {
  theme:      "dark",
  lang:       "fr",
  animations: true,
  accent:     null, // null = couleur par défaut du thème
};

let currentSettings = {
  ...DEFAULT_SETTINGS,
  ...JSON.parse(localStorage.getItem("kshelf_settings") || "{}")
};

// ==========================================
// APPLIQUER UN THÈME
// ==========================================
function applyTheme(themeId) {
  try {
    const theme = THEMES[themeId];
    if (!theme) { console.error("Thème inconnu:", themeId); return; }

    const root = document.documentElement;

    // Appliquer les variables CSS
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));

    // Accent personnalisé override
    if (currentSettings.accent) {
      root.style.setProperty("--accent", currentSettings.accent);
    }

    // Body background + classe thème
    document.body.style.background = theme.vars["--bg"];
    document.body.className = document.body.className
      .replace(/theme-\S+/g, "").replace(/is-(light|dark)/g, "").trim();
    if (themeId !== "dark") document.body.classList.add(`theme-${themeId}`);

    // Classe de luminosité — permet de cibler tous les thèmes clairs d'un coup
    const LIGHT_THEMES = ["grid", "editorial", "kpopping", "lemontang"];
    document.body.classList.add(LIGHT_THEMES.includes(themeId) ? "is-light" : "is-dark");

    // Thème clair : cacher l'aurora
    const aurora = document.querySelector(".apple-aurora");
    if (aurora) aurora.style.display = themeId === "dark" ? "block" : "none";

    // Glass panels suivent les variables CSS automatiquement
    document.querySelectorAll(".glass-panel").forEach(el => {
      el.style.background = "";
      el.style.backdropFilter = "";
      el.style.webkitBackdropFilter = "";
      el.style.border = "";
      el.style.borderRadius = "";
    });

    // Topbar (tous les boutons, pas juste le premier)
    document.querySelectorAll(".profile-btn, .topbar-settings-btn").forEach(el => {
      if (themeId !== "dark") {
        el.style.background = theme.vars["--surface"];
        el.style.border = `1px solid ${theme.vars["--border"]}`;
        el.style.color = theme.vars["--text-primary"];
      } else {
        el.style.background = "";
        el.style.border = "";
        el.style.color = "";
      }
    });

    currentSettings.theme = themeId;
    saveSettings();
    updateSettingsUI();

    // Afficher/cacher la section upload bg LemonTang
    const lemontangSection = document.getElementById("lemontang-bg-section");
    if (lemontangSection) lemontangSection.style.display = themeId === "lemontang" ? "block" : "none";

    // Réappliquer l'image de fond sauvegardée si on revient sur LemonTang
    if (themeId === "lemontang") {
      const savedBg = localStorage.getItem("kshelf_lemontang_bg");
      if (savedBg) root.style.setProperty("--lemontang-bg-image", `url(${savedBg})`);
    }

    // Forcer re-render du contenu actif
    if (window.showDashboard) window.showDashboard();

  } catch (err) {
    console.error("Erreur applyTheme:", err);
  }
}

// ==========================================
// IMAGE DE FOND LEMONTANG
// ==========================================
function compressBgImage(file, maxSize = 1400, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize) { height *= maxSize / width; width = maxSize; }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
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

async function uploadLemonTangBg(input) {
  if (!input.files[0]) return;
  try {
    const compressed = await compressBgImage(input.files[0]);
    localStorage.setItem("kshelf_lemontang_bg", compressed);
    document.documentElement.style.setProperty("--lemontang-bg-image", `url(${compressed})`);
  } catch(e) {
    console.error("Erreur upload image LemonTang:", e);
  }
}
window.uploadLemonTangBg = uploadLemonTangBg;

// ==========================================
// ANIMATIONS
// ==========================================
function applyAnimations(enabled) {
  if (!enabled) {
    document.documentElement.style.setProperty("--transition-speed", "0ms");
    const style = document.getElementById("no-anim-style") || document.createElement("style");
    style.id = "no-anim-style";
    style.textContent = `*, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }`;
    document.head.appendChild(style);
  } else {
    document.getElementById("no-anim-style")?.remove();
    document.documentElement.style.removeProperty("--transition-speed");
  }
  currentSettings.animations = enabled;
  saveSettings();
}

// ==========================================
// LANGUE
// ==========================================
const TRANSLATIONS = {
  fr: {
    "search_placeholder": "rechercher un album, un artiste...",
    "offline":            "Lecteur Hors-Ligne",
    "no_track":           "Aucun morceau sélectionné",
    "spotify_connect":    "connexion spotify",
    "spotify_connected":  "✓ Spotify connecté",
    "owned":              "● possédé",
    "wishlist":           "○ wishlist",
    "dashboard_title":    "ma collection virtuelle.",
    "dashboard_desc":     "explorez et gérez vos albums physiques en temps réel.",
    "albums":             "albums",
    "artists":            "artistes",
    "agencies":           "agences",
    "add_album":          "+ ajouter un album",
    "lightsticks":        "✦ lightsticks",
    "photocards":         "✦ photocards",
    "settings":           "paramètres",
    "collection":         "collection",
    "search_results":     "résultats.",
    "no_result":          "Aucun résultat.",
  },
  en: {
    "search_placeholder": "search an album, an artist...",
    "offline":            "Offline Player",
    "no_track":           "No track selected",
    "spotify_connect":    "connect spotify",
    "spotify_connected":  "✓ Spotify connected",
    "owned":              "● owned",
    "wishlist":           "○ wishlist",
    "dashboard_title":    "my virtual collection.",
    "dashboard_desc":     "browse and manage your physical albums in real time.",
    "albums":             "albums",
    "artists":            "artists",
    "agencies":           "agencies",
    "add_album":          "+ add an album",
    "lightsticks":        "✦ lightsticks",
    "photocards":         "✦ photocards",
    "settings":           "settings",
    "collection":         "collection",
    "search_results":     "results.",
    "no_result":          "No results found.",
  }
};

function t(key) {
  return TRANSLATIONS[currentSettings.lang]?.[key] || TRANSLATIONS["fr"][key] || key;
}
window.t = t;

function applyLang(lang) {
  currentSettings.lang = lang;
  saveSettings();
  // Mettre à jour les éléments statiques
  const searchInput = document.getElementById("album-search");
  if (searchInput) searchInput.placeholder = t("search_placeholder");
  const trackStatus = document.getElementById("track-status");
  if (trackStatus && trackStatus.innerText === TRANSLATIONS[lang === "fr" ? "en" : "fr"]["offline"])
    trackStatus.innerText = t("offline");
  // Re-render
  if (window.showDashboard) window.showDashboard();
  if (window.initSidebar)   window.initSidebar();
  updateSettingsUI();
}

// ==========================================
// ACCENT COULEUR
// ==========================================
// applyAccent retirée

// ==========================================
// SAVE / LOAD
// ==========================================
function saveSettings() {
  localStorage.setItem("kshelf_settings", JSON.stringify(currentSettings));
}

function loadSettings() {
  applyTheme(currentSettings.theme || "dark");
  applyAnimations(currentSettings.animations !== false);
  // accent retiré

  // Restaurer l'image de fond LemonTang si elle existe
  const savedBg = localStorage.getItem("kshelf_lemontang_bg");
  if (savedBg) {
    document.documentElement.style.setProperty("--lemontang-bg-image", `url(${savedBg})`);
  }
}

// ==========================================
// PANNEAU SETTINGS
// ==========================================
function openSettings() {
  document.getElementById("settings-overlay").classList.add("visible");
  updateSettingsUI();
}
function closeSettings() {
  document.getElementById("settings-overlay").classList.remove("visible");
}

function updateSettingsUI() {
  // Thèmes
  document.querySelectorAll(".theme-card").forEach(card => {
    card.classList.toggle("active", card.dataset.theme === currentSettings.theme);
  });
  // Lang
  document.querySelectorAll(".lang-btn").forEach(btn => {
    const lang = window.currentLang || currentSettings.lang || "fr";
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
  // Animations
  const animToggle = document.getElementById("anim-toggle");
  if (animToggle) animToggle.checked = currentSettings.animations !== false;
  // Accent
  const accentPicker = document.getElementById("accent-picker");
  // accent retiré
  // Partage / profil public
  if (window.updateShareUI) window.updateShareUI();
}

window.openSettings   = openSettings;
window.closeSettings  = closeSettings;
window.applyTheme     = applyTheme;
window.applyLang      = applyLang;
// applyAccent retirée
window.applyAnimations = applyAnimations;
window.t              = t;

// Init au chargement
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
});
