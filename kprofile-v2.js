// ═══════════════════════════════════════════════════════════════
// K-SHELF — PROFIL V2 (partage fan card en PNG)
// À charger APRÈS script.js et firebase.js.
// NOTE : le top 3 (avec sélecteur), les badges, le tilt 3D et la
// tuile d'ajout de bias vivent désormais dans script.js (PROFIL V2.1).
// Ce fichier ne contient plus que l'export canvas de la fan card.
// ═══════════════════════════════════════════════════════════════

(function () {
  "use strict";

  function getExtra() {
    return JSON.parse(localStorage.getItem("kshelf_profile_extra") || "{}");
  }

  function computeShareStats() {
    let albums = 0, favs = 0;
    for (const ag in collectionData)
      for (const ar in collectionData[ag]) {
        albums += collectionData[ag][ar].length;
        favs += collectionData[ag][ar].filter(a => a.status === "favorite").length;
      }
    return {
      albums,
      favs,
      concerts: (typeof concertsData !== "undefined" ? concertsData.length : 0),
    };
  }

  // ══════════════════════════════════════
  // PARTAGE FAN CARD — export PNG via canvas
  // ══════════════════════════════════════
  window.shareFanCard = async function () {
    const user = window._currentUser;
    const pseudo = user ? (localStorage.getItem(`kshelf_pseudo_${user.uid}`) || user.displayName || "Fan") : "Fan";
    const photoURL = user ? (localStorage.getItem(`kshelf_photo_${user.uid}`) || user.photoURL || "") : "";
    const extra = getExtra();

    const W = 720, H = 1080;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");

    // Fond
    ctx.fillStyle = "#0c0c12";
    ctx.fillRect(0, 0, W, H);
    // Bordure holo (vert → jaune → orange, comme la carte à l'écran)
    const grad = ctx.createLinearGradient(0, 0, W, H);
    ["#8affa0", "#f5ff00", "#ffb84d"].forEach((c, i) => grad.addColorStop(i / 2, c));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);

    // En-tête
    ctx.fillStyle = "#808799";
    ctx.font = "700 20px 'Space Mono', monospace";
    ctx.fillText("FAN CARD № 001", 48, 76);
    ctx.fillStyle = "#f5ff00";
    ctx.textAlign = "right";
    ctx.fillText("★ HOLO", W - 48, 76);
    ctx.textAlign = "left";

    // Photo
    if (photoURL) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = photoURL; });
        const size = W - 96, x = 48, y = 110;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, size, size * 0.82, 24);
        ctx.clip();
        const scale = Math.max(size / img.width, (size * 0.82) / img.height);
        ctx.drawImage(img, x + (size - img.width * scale) / 2, y + (size * 0.82 - img.height * scale) / 2, img.width * scale, img.height * scale);
        ctx.restore();
      } catch (e) { /* photo cross-origin non exportable → on continue sans */ }
    }

    // Pseudo
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 64px 'Syne', sans-serif";
    ctx.fillText(pseudo, 48, 780);

    // Favoris
    ctx.font = "700 20px 'Space Mono', monospace";
    ctx.fillStyle = "#808799";
    ctx.fillText("ULT GROUP", 48, 850);
    ctx.fillText("ALBUM FAVORI", 380, 850);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 30px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(extra.favGroup || "—", 48, 890);
    ctx.fillText(extra.favAlbum || "—", 380, 890);

    // Stats
    const s = computeShareStats();
    ctx.fillStyle = "#808799";
    ctx.font = "700 20px 'Space Mono', monospace";
    ctx.fillText(`${s.albums} ALBUMS · ${s.favs} FAVORIS · ${s.concerts} CONCERTS`, 48, 950);

    // Footer
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 28px 'Syne', sans-serif";
    ctx.fillText("k-shelf", 48, H - 48);
    ctx.fillStyle = "#f5ff00";
    ctx.fillText(".", 48 + ctx.measureText("k-shelf").width, H - 48);

    // Télécharger
    cv.toBlob(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `fan-card-${pseudo.toLowerCase().replace(/\s+/g, "-")}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  };
})();
