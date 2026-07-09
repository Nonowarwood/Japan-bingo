// ==========================================
// FIREBASE AUTH + FIRESTORE — K-Shelf
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSuRQEdiSo61wc2DrguCiLIrwoqDEHfJ8",
  authDomain: "k-shelf.firebaseapp.com",
  projectId: "k-shelf",
  storageBucket: "k-shelf.firebasestorage.app",
  messagingSenderId: "640794546993",
  appId: "1:640794546993:web:81107074929a4013f69610"
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const db       = getFirestore(app);
const provider = new GoogleAuthProvider();

window._currentUser = null;
let _unsubscribe    = null;

// ==========================================
// HELPERS — sérialisation JSON string
// Les objets complexes sont stockés en string
// pour éviter les limites Firestore sur les maps
// ==========================================
function userDocRef(uid) {
  return doc(db, "users", uid, "kshelf", "data");
}

async function readFromFirestore(uid) {
  try {
    const snap = await getDoc(userDocRef(uid));
    if (!snap.exists()) return null;
    const raw = snap.data();
    return {
      collection:  raw.collection  ? JSON.parse(raw.collection)  : null,
      photocards:  raw.photocards  ? JSON.parse(raw.photocards)  : null,
      binderPages: raw.binderPages ?? null,
      concerts:    raw.concerts    ? JSON.parse(raw.concerts)    : null,
      pseudo:      raw.pseudo      ?? null,
      photoURL:    raw.photoURL    ?? null,
      profileExtra: raw.profileExtra ?? null,
      shareSettings: raw.shareSettings ? JSON.parse(raw.shareSettings) : null,
      following: raw.following ? (typeof raw.following === "string" ? JSON.parse(raw.following) : raw.following) : [],
    };
  } catch(e) {
    console.error("❌ Firestore read error:", e);
    return null;
  }
}

async function writeToFirestore(uid, payload) {
  try {
    const toWrite = { updatedAt: Date.now() };
    if (payload.collection    !== undefined) toWrite.collection    = JSON.stringify(payload.collection);
    if (payload.photocards    !== undefined) toWrite.photocards    = JSON.stringify(payload.photocards);
    if (payload.binderPages   !== undefined) toWrite.binderPages   = payload.binderPages;
    if (payload.concerts      !== undefined) toWrite.concerts      = JSON.stringify(payload.concerts);
    if (payload.pseudo        !== undefined) toWrite.pseudo        = payload.pseudo;
    if (payload.photoURL      !== undefined) toWrite.photoURL      = payload.photoURL;
    if (payload.profileExtra  !== undefined) toWrite.profileExtra  = payload.profileExtra;
    if (payload.shareSettings !== undefined) toWrite.shareSettings = JSON.stringify(payload.shareSettings);
    await setDoc(userDocRef(uid), toWrite, { merge: true });
    return true;
  } catch(e) {
    showDebugToast("❌ Firestore: " + e.code, "#f87171");
    return false;
  }
}

// ==========================================
// PROFILS PUBLICS (partage de collection)
// ==========================================
// Préférences de partage par défaut (ce qui est public)
function defaultShareSettings() {
  return { enabled: true, albums: true, photocards: true, concerts: true, stats: false };
}

function publicDocRef(uid) {
  return doc(db, "users_public", uid);
}

// Écrit la copie publique en respectant les préférences de partage.
// N'expose QUE ce que l'utilisateur a accepté de montrer.
async function syncPublicProfile(uid) {
  try {
    const share = window.shareSettings || defaultShareSettings();
    // Si le partage est désactivé, on efface la vitrine publique.
    if (!share.enabled) {
      await setDoc(publicDocRef(uid), { enabled: false, updatedAt: Date.now() });
      return true;
    }
    const pub = {
      enabled: true,
      updatedAt: Date.now(),
      pseudo:   window._pseudo   || "",
      pseudo_lower: (window._pseudo || "").toLowerCase(),
      photoURL: window._photoURL || "",
    };
    // On ne copie que les sections autorisées.
    if (share.albums)     pub.collection = JSON.stringify(window.collectionData || {});
    if (share.photocards) { pub.photocards = JSON.stringify(window.photocardsData || []); pub.binderPages = window.binderPages || 1; }
    if (share.concerts)   pub.concerts = JSON.stringify(window.concertsData || []);
    // Les "stats" se recalculent à la volée côté visiteur à partir des albums,
    // donc rien de spécial à stocker ici ; on garde juste le flag.
    pub.showStats = !!share.stats;
    // Expose la liste des abonnements (pour calculer les abonnés des autres)
    pub.following = JSON.stringify(window._following || []);
    pub.following_contains = Array.isArray(window._following) ? window._following : [];
    await setDoc(publicDocRef(uid), pub);
    showDebugToast("🌐 Profil public synchronisé ✓", "#1db954");
    return true;
  } catch(e) {
    console.error("❌ sync profil public:", e);
    showDebugToast("❌ Profil public: " + (e.code || e.message || "erreur"), "#f87171");
    return false;
  }
}
window.syncPublicProfile = syncPublicProfile;
window.defaultShareSettings = defaultShareSettings;

// Lit le profil public d'un utilisateur (accessible à tous).
async function readPublicProfile(uid) {
  try {
    const snap = await getDoc(publicDocRef(uid));
    if (!snap.exists()) return null;
    const raw = snap.data();
    if (raw.enabled === false) return { enabled: false };
    return {
      enabled: true,
      pseudo:      raw.pseudo   || "",
      photoURL:    raw.photoURL || "",
      showStats:   !!raw.showStats,
      collection:  raw.collection  ? JSON.parse(raw.collection)  : null,
      photocards:  raw.photocards  ? JSON.parse(raw.photocards)  : null,
      binderPages: raw.binderPages ?? 1,
      concerts:    raw.concerts    ? JSON.parse(raw.concerts)    : null,
    };
  } catch(e) {
    console.error("❌ lecture profil public:", e);
    return null;
  }
}
window.readPublicProfile = readPublicProfile;

// ==========================================
// SYSTÈME DE SUIVI
// ==========================================

// Accès sûr aux préférences de partage depuis firebase.js
function getShareSettings_safe() {
  return window.shareSettings || defaultShareSettings();
}

// Recherche d'utilisateurs par pseudo (annuaire public).
async function searchUsers(term) {
  const t = (term || "").trim().toLowerCase();
  if (t.length < 2) return [];
  try {
    // Requête "commence par" via une plage sur pseudo_lower
    const q = query(
      collection(db, "users_public"),
      where("pseudo_lower", ">=", t),
      where("pseudo_lower", "<=", t + "\uf8ff"),
      limit(20)
    );
    const snap = await getDocs(q);
    const results = [];
    snap.forEach(docSnap => {
      const d = docSnap.data();
      if (d.enabled === false) return;
      results.push({ uid: docSnap.id, pseudo: d.pseudo || "", photoURL: d.photoURL || "" });
    });
    return results;
  } catch(e) {
    console.error("❌ recherche utilisateurs:", e);
    return [];
  }
}
window.searchUsers = searchUsers;

// Récupère la liste des UID que l'utilisateur suit (depuis son doc privé).
async function getFollowing(uid) {
  try {
    const snap = await getDoc(userDocRef(uid));
    if (!snap.exists()) return [];
    const raw = snap.data();
    return Array.isArray(raw.following) ? raw.following : (raw.following ? JSON.parse(raw.following) : []);
  } catch(e) {
    console.error("❌ getFollowing:", e);
    return [];
  }
}
window.getFollowing = getFollowing;

// Suivre / ne plus suivre un utilisateur.
async function toggleFollow(targetUid) {
  const user = window._currentUser;
  if (!user) return { ok: false, following: false };
  if (targetUid === user.uid) return { ok: false, following: false };
  try {
    const current = await getFollowing(user.uid);
    let next;
    let nowFollowing;
    if (current.includes(targetUid)) {
      next = current.filter(u => u !== targetUid);
      nowFollowing = false;
    } else {
      next = [...current, targetUid];
      nowFollowing = true;
    }
    await setDoc(userDocRef(user.uid), { following: JSON.stringify(next) }, { merge: true });
    window._following = next;
    // Met à jour la vitrine publique pour que "qui me suit" se calcule chez les autres
    if (getShareSettings_safe().enabled) await syncPublicProfile(user.uid);
    return { ok: true, following: nowFollowing };
  } catch(e) {
    console.error("❌ toggleFollow:", e);
    return { ok: false, following: false };
  }
}
window.toggleFollow = toggleFollow;

// Récupère les profils publics d'une liste d'UID (pour afficher abonnements).
async function getProfilesByUids(uids) {
  if (!Array.isArray(uids) || !uids.length) return [];
  const out = [];
  for (const uid of uids) {
    try {
      const p = await readPublicProfile(uid);
      if (p && p.enabled !== false) out.push({ uid, pseudo: p.pseudo, photoURL: p.photoURL });
    } catch(e) {}
  }
  return out;
}
window.getProfilesByUids = getProfilesByUids;

// Calcule qui suit l'utilisateur en parcourant l'annuaire public :
// tous ceux dont la liste "following" contient mon UID.
async function getFollowers(uid) {
  try {
    const q = query(
      collection(db, "users_public"),
      where("following_contains", "array-contains", uid),
      limit(100)
    );
    const snap = await getDocs(q);
    const out = [];
    snap.forEach(docSnap => {
      const d = docSnap.data();
      if (d.enabled === false) return;
      out.push({ uid: docSnap.id, pseudo: d.pseudo || "", photoURL: d.photoURL || "" });
    });
    return out;
  } catch(e) {
    console.error("❌ getFollowers:", e);
    return [];
  }
}
window.getFollowers = getFollowers;

// Sauvegarde les préférences de partage dans le doc privé
window._writeShareSettings = async function(uid, settings) {
  return writeToFirestore(uid, { shareSettings: settings });
};

// ==========================================
// AUTH
// ==========================================
window.signInWithGoogle = async function() {
  try {
    await signInWithPopup(auth, provider);
  } catch(e) {
    console.error("Connexion Google (popup):", e);
    if (e.code === "auth/popup-blocked" || e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") {
      showDebugToast("↪️ Redirection vers Google...", "#4fc3f7");
      try {
        await signInWithRedirect(auth, provider);
      } catch(e2) {
        console.error("Connexion Google (redirect):", e2);
        alert("Connexion impossible : " + e2.message);
      }
    } else {
      alert("Connexion impossible : " + e.message);
    }
  }
};

// Gérer le retour d'une connexion par redirect (mobile/navigateurs stricts)
getRedirectResult(auth).then((result) => {
  if (result?.user) {
    showDebugToast("✅ Connecté via redirect", "#1db954");
  }
}).catch((e) => {
  if (e.code && e.code !== "auth/no-auth-event") {
    console.error("Erreur redirect result:", e);
  }
});

window.signOutUser = async function() {
  if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
  await signOut(auth);
  window._currentUser = null;

  // Vider toutes les données locales
  localStorage.removeItem("kshelf_save");
  localStorage.removeItem("kshelf_photocards");
  localStorage.removeItem("kshelf_concerts");
  localStorage.removeItem("kshelf_lightsticks");
  localStorage.removeItem("kshelf_binder_pages");
  localStorage.removeItem("kshelf_profile_extra");
  localStorage.removeItem("kshelf_concerts");

  // Remettre les variables en mémoire à zéro
  window.collectionData   = {};
  window.photocardsData   = [];
  window.concertsData     = [];
  window.lightsticksData  = [];
  window.profileExtra     = {};

  clearProfileUI();
  closeProfileModal();

  // Retour à la landing page
  if (window.initSidebar)   window.initSidebar();
  if (window.showDashboard) window.showDashboard();
};

// ==========================================
// OBSERVER AUTH
// ==========================================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    window._currentUser = user;
    await initUserData(user);
    // Infos publiques (pseudo + avatar) pour la vitrine partageable
    window._pseudo   = localStorage.getItem(`kshelf_pseudo_${user.uid}`) || user.displayName || "Collectionneur";
    window._photoURL = localStorage.getItem(`kshelf_photo_${user.uid}`) || user.photoURL || "";
    updateProfileUI(user);
    startRealtimeSync(user);
    // Déclencher les syncs en attente (données ajoutées avant connexion)
    if (window._onSyncReady) window._onSyncReady();
    if (window.applySpotifyVisibility) window.applySpotifyVisibility();
  } else {
    window._currentUser = null;
    if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
    clearProfileUI();
    if (window._loadLocalData) window._loadLocalData();
    if (window.applySpotifyVisibility) window.applySpotifyVisibility();
  }
});

// ==========================================
// INIT DONNÉES — lecture Firestore
// ==========================================
function showDebugToast(msg, color="#1db954") {
  const t = document.createElement("div");
  t.style.cssText = `position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:${color};color:#000;padding:10px 18px;border-radius:20px;font-size:13px;font-weight:700;z-index:9999;max-width:90vw;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.4)`;
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 5000);
}

async function initUserData(user) {
  showDebugToast("🔄 Connexion Firebase... UID: " + user.uid.slice(0,8));
  const data = await readFromFirestore(user.uid);

  if (data && data.collection && Object.keys(data.collection).length > 0) {
    showDebugToast("✅ Données Firestore trouvées !");
    window.collectionData = data.collection;
    localStorage.setItem("kshelf_save", JSON.stringify(data.collection));
    if (data.photocards !== null) {
      window.photocardsData = data.photocards;
      localStorage.setItem("kshelf_photocards", JSON.stringify(data.photocards));
    }
    if (data.binderPages !== null) {
      window.binderTotalPages = data.binderPages;
      localStorage.setItem("kshelf_binder_pages", data.binderPages);
    }
    if (data.concerts !== null) {
      // Les photos sont des URLs stockées dans Firestore, pas besoin de fusion locale
      window.concertsData = data.concerts;
      localStorage.setItem("kshelf_concerts", JSON.stringify(data.concerts));
    }
    if (data.pseudo) {
      localStorage.setItem(`kshelf_pseudo_${user.uid}`, data.pseudo);
    }
    if (data.profileExtra) {
      try {
        const extra = JSON.parse(data.profileExtra);
        localStorage.setItem("kshelf_profile_extra", JSON.stringify(extra));
        if (window.profileExtra !== undefined) window.profileExtra = extra;
      } catch(e) {}
    }
    if (data.photoURL) {
      localStorage.setItem(`kshelf_photo_${user.uid}`, data.photoURL);
    }
    // Préférences de partage (profil public)
    window.shareSettings = data.shareSettings || defaultShareSettings();
    localStorage.setItem("kshelf_share_settings", JSON.stringify(window.shareSettings));
    // Liste des abonnements (qui l'utilisateur suit)
    window._following = Array.isArray(data.following) ? data.following : [];
  } else {
    showDebugToast("🆕 Première connexion, sauvegarde en cours...", "#f59e0b");
    // Forcer le chargement des données par défaut
    if (!window.collectionData || Object.keys(window.collectionData).length === 0) {
      window.collectionData = window.defaultCollectionData || {};
    }
    const result = await writeToFirestore(user.uid, {
      collection:   sanitizeForFirestore(window.collectionData),
      photocards:   sanitizeForFirestore(window.photocardsData  || []),
      binderPages:  window.binderTotalPages || 1,
      concerts:     prepareConcertsForSync(window.concertsData),
      profileExtra: JSON.stringify(window.profileExtra || {}),
    });
    showDebugToast(result ? "✅ Sauvegarde OK !" : "❌ Erreur sauvegarde", result ? "#1db954" : "#f87171");
  }

  if (window.initSidebar)   window.initSidebar();
  if (window.showDashboard) window.showDashboard();
}

// ==========================================
// SYNC TEMPS RÉEL
// ==========================================
function startRealtimeSync(user) {
  if (_unsubscribe) _unsubscribe();
  _unsubscribe = onSnapshot(userDocRef(user.uid), (snap) => {
    if (!snap.exists()) return;
    const raw = snap.data();

    try {
      const remoteCollection  = raw.collection  ? JSON.parse(raw.collection)  : null;
      const remotePhotocards  = raw.photocards  ? JSON.parse(raw.photocards)  : null;
      const remoteBinderPages = raw.binderPages ?? null;
      const remoteConcerts    = raw.concerts    ? JSON.parse(raw.concerts)    : null;

      // Mettre à jour seulement si différent (évite les boucles)
      if (remoteCollection && JSON.stringify(remoteCollection) !== JSON.stringify(window.collectionData)) {
        console.log("🔄 Sync collection depuis un autre appareil");
        window.collectionData = remoteCollection;
        localStorage.setItem("kshelf_save", JSON.stringify(remoteCollection));
        if (window.initSidebar)   window.initSidebar();
        if (window.showDashboard) window.showDashboard();
      }
      if (remotePhotocards && JSON.stringify(remotePhotocards) !== JSON.stringify(window.photocardsData)) {
        console.log("🔄 Sync photocards depuis un autre appareil");
        window.photocardsData = remotePhotocards;
        localStorage.setItem("kshelf_photocards", JSON.stringify(remotePhotocards));
      }
      if (remoteBinderPages !== null && remoteBinderPages !== window.binderTotalPages) {
        window.binderTotalPages = remoteBinderPages;
        localStorage.setItem("kshelf_binder_pages", remoteBinderPages);
      }
      // Sync profileExtra depuis autre appareil
      if (raw.profileExtra) {
        try {
          const remoteExtra = JSON.parse(raw.profileExtra);
          const localExtra = JSON.stringify(window.profileExtra || {});
          if (JSON.stringify(remoteExtra) !== localExtra) {
            window.profileExtra = remoteExtra;
            localStorage.setItem("kshelf_profile_extra", JSON.stringify(remoteExtra));
          }
        } catch(e) {}
      }

      if (remoteConcerts && JSON.stringify(remoteConcerts) !== JSON.stringify(window.concertsData)) {
        console.log("🔄 Sync concerts depuis un autre appareil");
        window.concertsData = remoteConcerts;
        localStorage.setItem("kshelf_concerts", JSON.stringify(remoteConcerts));
        if (window.location && document.querySelector(".artist-main-title")?.textContent === "concerts.") {
          if (window.showConcerts) window.showConcerts();
        }
      }
    } catch(e) {
      console.error("❌ Sync parse error:", e);
    }
  });
}

// ==========================================
// SYNC SORTANTE — appelée depuis script.js
// ==========================================
function sanitizeForFirestore(data) {
  // Nettoie récursivement : supprime undefined, garde seulement les types valides
  // Exclut les vidéos base64 (trop lourdes) mais garde les photos
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)).filter(item => item !== undefined);
  }
  if (data !== null && typeof data === "object") {
    const clean = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined) continue;
      // Exclure les vidéos base64 (data:video/...) — trop lourdes pour Firestore
      if (typeof v === "string" && v.startsWith("data:video/")) continue;
      clean[k] = sanitizeForFirestore(v);
    }
    return clean;
  }
  return data;
}

function prepareConcertsForSync(concerts) {
  // Les photos sont maintenant des URLs (pas du base64) — on peut les stocker dans Firestore
  return (concerts || []).map(c => sanitizeForFirestore({
    id:      c.id,
    artist:  c.artist,
    date:    c.date,
    venue:   c.venue,
    tour:    c.tour,
    review:  c.review,
    setlist: c.setlist || [],
    rating:  c.rating  || 0,
    photos:  (c.photos || []).filter(p => p.startsWith("http")), // URLs seulement
  }));
}

window.syncToFirestore = async function() {
  const user = window._currentUser;
  if (!user) {
    showDebugToast("⚠️ Sync ignorée : non connecté", "#f59e0b");
    return;
  }
  try {
    const ok = await writeToFirestore(user.uid, {
      collection:   sanitizeForFirestore(window.collectionData),
      photocards:   sanitizeForFirestore(window.photocardsData),
      binderPages:  window.binderTotalPages || 1,
      concerts:     prepareConcertsForSync(window.concertsData),
      profileExtra: JSON.stringify(window.profileExtra || {}),
    });
    if (ok) showDebugToast("☁️ Sauvegardé dans le cloud ✓", "#1db954");
    // Met à jour la vitrine publique (profil partageable)
    if (ok) syncPublicProfile(user.uid);
  } catch(e) {
    showDebugToast("❌ Sync: " + e.message?.slice(0,40), "#f87171");
    console.error("syncToFirestore error:", e);
  }
};

// Notifier script.js que syncToFirestore est maintenant disponible
showDebugToast("🔧 Firebase prêt", "#4fc3f7");
if (window._onSyncReady) window._onSyncReady();

// ==========================================
// UI PROFIL
// ==========================================
function updateProfileUI(user) {
  const pseudo   = localStorage.getItem(`kshelf_pseudo_${user.uid}`) || user.displayName || "Utilisateur";
  const photoURL = localStorage.getItem(`kshelf_photo_${user.uid}`)  || user.photoURL    || "";

  setEl("profile-name-label",    el => el.innerText = pseudo);
  setEl("profile-avatar-letter", el => { el.innerText = pseudo[0].toUpperCase(); el.style.display = photoURL ? "none" : "block"; });
  setEl("profile-avatar-img",    el => { el.src = photoURL; el.style.display = photoURL ? "block" : "none"; });
  setEl("profile-logged-out", el => el.style.display = "none");
  const loggedIn = document.getElementById("profile-logged-in");
  if (loggedIn) loggedIn.classList.remove("profile-hidden");
  setEl("profile-pseudo-input",    el => el.value = pseudo);
  setEl("profile-email-display",   el => el.value = user.email || "");
  setEl("profile-email-display-text", el => el.innerText = user.email || "");
  setEl("profile-large-letter",  el => { el.innerText = pseudo[0].toUpperCase(); el.style.display = photoURL ? "none" : "block"; });
  setEl("profile-large-img",     el => { el.src = photoURL; el.style.display = photoURL ? "block" : "none"; });
  setEl("topbar-logged-out", el => el.classList.remove("visible"));
}

function clearProfileUI() {
  setEl("profile-name-label",    el => el.innerText = "Se connecter");
  setEl("profile-avatar-letter", el => { el.innerText = "?"; el.style.display = "block"; });
  setEl("profile-avatar-img",    el => el.style.display = "none");
  setEl("profile-logged-out",    el => el.style.display = "block");
  const loggedIn3 = document.getElementById("profile-logged-in");
  if (loggedIn3) loggedIn3.classList.add("profile-hidden");
  setEl("topbar-logged-out", el => el.classList.remove("visible"));
}

function setEl(id, fn) {
  const el = document.getElementById(id);
  if (el) fn(el);
}

// ==========================================
// SAUVEGARDE PROFIL
// ==========================================
window.saveProfile = async function() {
  const user = window._currentUser;
  if (!user) return;
  const pseudo = document.getElementById("profile-pseudo-input")?.value.trim();
  if (!pseudo) return;
  localStorage.setItem(`kshelf_pseudo_${user.uid}`, pseudo);

  // Récupérer les données extra actuelles depuis localStorage (inclut les biases)
  const currentExtra = JSON.parse(localStorage.getItem("kshelf_profile_extra") || "{}");
  const getVal = (id) => document.getElementById(id)?.value.trim() || "";

  const updatedExtra = {
    ...currentExtra, // préserve les biases et autres champs
    favGroup:  getVal("profile-fav-group"),
    favAlbum:  getVal("profile-fav-album"),
    youtube:   getVal("profile-youtube"),
    tiktok:    getVal("profile-tiktok"),
    pinterest: getVal("profile-pinterest"),
    kpopping:  getVal("profile-kpopping"),
    biases:    window.profileExtra?.biases || currentExtra.biases || [],
  };

  window.profileExtra = updatedExtra;
  localStorage.setItem("kshelf_profile_extra", JSON.stringify(updatedExtra));

  // Écriture complète incluant toutes les données pour garantir la cohérence
  const ok = await writeToFirestore(user.uid, {
    pseudo,
    profileExtra:  JSON.stringify(updatedExtra),
    collection:    sanitizeForFirestore(window.collectionData),
    photocards:    sanitizeForFirestore(window.photocardsData),
    binderPages:   window.binderTotalPages || 1,
    concerts:      prepareConcertsForSync(window.concertsData),
  });
  showDebugToast(ok ? "✅ Profil sauvegardé et synchronisé" : "❌ Erreur sauvegarde profil", ok ? "#1db954" : "#f87171");
  updateProfileUI(user);
  closeProfileModal();
};

// Compresse une image en redimensionnant + réduisant la qualité JPEG
function compressImage(file, maxSize = 200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) { height *= maxSize / width; width = maxSize; }
        } else {
          if (height > maxSize) { width *= maxSize / height; height = maxSize; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

window.uploadProfilePhoto = async function(input) {
  const user = window._currentUser;
  if (!user || !input.files[0]) return;
  try {
    const compressed = await compressImage(input.files[0], 200, 0.75);
    localStorage.setItem(`kshelf_photo_${user.uid}`, compressed);
    updateProfileUI(user);
    const ok = await writeToFirestore(user.uid, { photoURL: compressed });
    showDebugToast(ok ? "✅ Photo sauvegardée" : "❌ Erreur photo", ok ? "#1db954" : "#f87171");
  } catch(e) {
    showDebugToast("❌ Erreur compression photo", "#f87171");
  }
};

// ==========================================
// MODAL PROFIL
// ==========================================
window.openProfileModal  = () => {
  document.getElementById("profile-modal-overlay")?.classList.add("visible");
  // Charger les données extra dans le formulaire
  setTimeout(() => { if (window.loadProfileExtraIntoForm) window.loadProfileExtraIntoForm(); }, 50);
};
window.closeProfileModal = () => document.getElementById("profile-modal-overlay")?.classList.remove("visible");
