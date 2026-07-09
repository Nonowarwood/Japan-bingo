// ═══════════════════════════════════════════════════════════════
// K-SHELF — PROFILS PUBLICS (affichage lecture seule)
// ═══════════════════════════════════════════════════════════════
//
// Quand un visiteur arrive avec ?profile={uid}, on lit la vitrine
// publique de cet utilisateur et on l'affiche en lecture seule.
// Aucune connexion requise, aucune donnée privée exposée.
//
// ═══════════════════════════════════════════════════════════════

// Point d'entrée : détecte ?profile= dans l'URL au chargement.
async function checkForPublicProfile() {
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("profile");
  if (!uid) return false;

  // Attendre que readPublicProfile (firebase.js, module async) soit prêt
  let tries = 0;
  while (!window.readPublicProfile && tries < 50) {
    await new Promise(r => setTimeout(r, 100));
    tries++;
  }
  if (!window.readPublicProfile) {
    renderProfileError("Le chargement a échoué. Réessaie dans un instant.");
    return true;
  }

  renderProfileLoading();
  let profile;
  try {
    profile = await window.readPublicProfile(uid);
  } catch(e) {
    renderProfileError("Erreur de lecture : " + (e.message || e.code || e));
    return true;
  }

  if (!profile) {
    renderProfileError("Ce profil n'existe pas ou n'est plus disponible.");
    return true;
  }
  if (profile.enabled === false) {
    renderProfileError("Ce collectionneur a rendu son profil privé.");
    return true;
  }

  try {
    renderPublicProfile(profile, uid);
  } catch(e) {
    renderProfileError("Erreur d'affichage : " + (e.message || e.code || e));
  }
  return true;
}

function profileRoot() {
  // On remplace tout le contenu de la page par la vue profil
  let root = document.getElementById("public-profile-view");
  if (!root) {
    root = document.createElement("div");
    root.id = "public-profile-view";
    document.body.appendChild(root);
  }
  // Cacher l'app normale
  document.querySelectorAll("body > *:not(#public-profile-view):not(#splash-screen)").forEach(el => {
    el.style.display = "none";
  });
  return root;
}

function renderProfileLoading() {
  profileRoot().innerHTML = `
    <div class="pp-loading">
      <div class="pp-spinner"></div>
      <p>Chargement du profil…</p>
    </div>`;
}

function renderProfileError(msg) {
  profileRoot().innerHTML = `
    <div class="pp-error">
      <div class="pp-error-icon">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <p class="pp-error-title">Profil indisponible</p>
      <p class="pp-error-desc">${msg}</p>
      <a href="/K-Shelf/" class="pp-btn">Découvrir k-shelf.</a>
    </div>`;
}

// Compte les albums dans la structure de collection
function countAlbums(collection) {
  let n = 0;
  if (!collection || typeof collection !== "object") return 0;
  Object.values(collection).forEach(agency => {
    if (!agency || typeof agency !== "object") return;
    Object.values(agency).forEach(artist => {
      if (Array.isArray(artist)) n += artist.filter(a => a && typeof a === "object").length;
    });
  });
  return n;
}

// Aplatit la collection en liste d'albums pour l'affichage
function flattenAlbums(collection) {
  const out = [];
  if (!collection || typeof collection !== "object") return out;
  Object.entries(collection).forEach(([agency, artists]) => {
    if (!artists || typeof artists !== "object") return;
    Object.entries(artists).forEach(([artist, albums]) => {
      if (!Array.isArray(albums)) return;
      albums.forEach(alb => {
        if (alb && typeof alb === "object") out.push({ agency, artist, ...alb });
      });
    });
  });
  return out;
}

function renderPublicProfile(profile, uid) {
  const albums = flattenAlbums(profile.collection);
  const albumCount = albums.length;
  const artistCount = new Set(albums.map(a => a.artist)).size;
  const agencyCount = new Set(albums.map(a => a.agency)).size;
  const pcCount = Array.isArray(profile.photocards) ? profile.photocards.length : 0;
  const concertCount = Array.isArray(profile.concerts) ? profile.concerts.length : 0;

  const pseudo = profile.pseudo || "Collectionneur";
  const avatar = profile.photoURL
    ? `<img src="${profile.photoURL}" alt="${pseudo}" class="pp-avatar-img"/>`
    : `<div class="pp-avatar-fallback">${pseudo[0] ? pseudo[0].toUpperCase() : "?"}</div>`;

  // Grille d'albums
  const albumsHtml = albums.length
    ? albums.map(a => `
        <div class="pp-album">
          <div class="pp-album-cover">
            ${a.img ? `<img src="${a.img}" alt="${(a.title||"").replace(/"/g,'')}" loading="lazy"/>` : `<div class="pp-album-ph"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg></div>`}
          </div>
          <p class="pp-album-title">${a.title || "Sans titre"}</p>
          <p class="pp-album-artist">${a.artist || ""}</p>
        </div>`).join("")
    : `<p class="pp-empty">Ce collectionneur n'a pas encore partagé d'albums.</p>`;

  // Stats (barres) — seulement si l'utilisateur a activé le partage des stats
  let statsHtml = "";
  if (profile.showStats && albums.length) {
    const byAgency = {};
    albums.forEach(a => { byAgency[a.agency] = (byAgency[a.agency]||0)+1; });
    const top = Object.entries(byAgency).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const max = top[0] ? top[0][1] : 1;
    statsHtml = `
      <div class="pp-section">
        <h3 class="pp-section-title">Répartition par agence</h3>
        <div class="pp-bars">
          ${top.map(([ag,n]) => `
            <div class="pp-bar-row">
              <span class="pp-bar-label">${ag}</span>
              <div class="pp-bar-track"><div class="pp-bar-fill" style="width:${(n/max*100)}%"></div></div>
              <span class="pp-bar-val">${n}</span>
            </div>`).join("")}
        </div>
      </div>`;
  }

  profileRoot().innerHTML = `
    <div class="pp-wrap">
      <header class="pp-header">
        <div class="pp-avatar">${avatar}</div>
        <h1 class="pp-name">${pseudo}</h1>
        <p class="pp-tagline">collection k-pop sur k-shelf.</p>
        <div class="pp-follow-slot" id="pp-follow-slot"></div>
        <div class="pp-stats-row">
          <div class="pp-stat"><span class="pp-stat-num">${albumCount}</span><span class="pp-stat-label">albums</span></div>
          <div class="pp-stat"><span class="pp-stat-num">${artistCount}</span><span class="pp-stat-label">artistes</span></div>
          <div class="pp-stat"><span class="pp-stat-num">${agencyCount}</span><span class="pp-stat-label">agences</span></div>
          ${pcCount ? `<div class="pp-stat"><span class="pp-stat-num">${pcCount}</span><span class="pp-stat-label">photocards</span></div>` : ""}
          ${concertCount ? `<div class="pp-stat"><span class="pp-stat-num">${concertCount}</span><span class="pp-stat-label">concerts</span></div>` : ""}
        </div>
      </header>

      ${statsHtml}

      <div class="pp-section">
        <h3 class="pp-section-title">La collection${albumCount ? ` · ${albumCount}` : ""}</h3>
        <div class="pp-albums-grid">${albumsHtml}</div>
      </div>

      <footer class="pp-footer">
        <p>Crée ta propre collection K-pop virtuelle</p>
        <a href="/K-Shelf/" class="pp-btn">Découvrir k-shelf.</a>
      </footer>
    </div>`;

  // Bouton Suivre (seulement si connecté et si ce n'est pas son propre profil)
  setupFollowButton(uid);
}

// Met en place le bouton Suivre selon l'état de connexion
async function setupFollowButton(targetUid) {
  const slot = document.getElementById("pp-follow-slot");
  if (!slot) return;

  // Attendre que les fonctions Firebase soient prêtes
  let tries = 0;
  while (!window.toggleFollow && tries < 30) { await new Promise(r => setTimeout(r, 100)); tries++; }

  const me = window._currentUser;
  // Pas connecté → inviter à se connecter pour suivre
  if (!me) {
    slot.innerHTML = `<a href="/K-Shelf/" class="pp-follow-btn pp-follow-guest">Connecte-toi pour suivre</a>`;
    return;
  }
  // Son propre profil → pas de bouton suivre
  if (me.uid === targetUid) {
    slot.innerHTML = `<span class="pp-follow-self">C'est ton profil public ✦</span>`;
    return;
  }

  const following = window._following || (window.getFollowing ? await window.getFollowing(me.uid) : []);
  const isFollowing = Array.isArray(following) && following.includes(targetUid);
  renderFollowBtn(slot, targetUid, isFollowing);
}

function renderFollowBtn(slot, targetUid, isFollowing) {
  slot.innerHTML = `
    <button class="pp-follow-btn ${isFollowing ? 'following' : ''}" id="pp-follow-btn">
      ${isFollowing
        ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Abonné`
        : `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Suivre`}
    </button>`;
  const btn = document.getElementById("pp-follow-btn");
  btn.onclick = async () => {
    btn.disabled = true;
    const res = await window.toggleFollow(targetUid);
    btn.disabled = false;
    if (res.ok) renderFollowBtn(slot, targetUid, res.following);
  };
}

window.checkForPublicProfile = checkForPublicProfile;
