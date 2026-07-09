import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const CRITERIA = [
  "Naruto",
  "Personnage de Demon Slayer",
  "One Piece",
  "Jujutsu Kaisen",
  "Pokémon",
  "Genshin Impact",
  "Honkai: Star Rail",
  "My Hero Academia",
  "Chainsaw Man",
  "Spy x Family",
  "Personnage en armure complète",
  "Cosplay fait maison incroyable",
  "Cosplay avec une arme géante",
  "Duo de cosplays assortis",
  "Groupe de 3 personnes ou plus en cosplay",
  "Cosplay d'un personnage méconnu",
  "Mascotte ou costume gonflable",
  "Personnage de jeu vidéo rétro",
  "Sailor Moon",
  "JoJo's Bizarre Adventure",
  "Personnage K-pop ou idol",
  "Cosplay qui semble extrêmement coûteux",
  "Cosplayeur qui pose comme son personnage",
  "Cosplay tellement réaliste qu'on doute que ce soit un cosplay",
  "Cosplay complètement random ou inattendu",
];

const CELL_COUNT = 9;

// 3 rows, 3 columns, 2 diagonals = 8 winning lines
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const PLAYERS = [
  { id: "mateo", name: "Matéo", image: "2.jpeg" },
  { id: "robin", name: "Robin", image: "1.jpeg" },
  { id: "noah", name: "Noah", image: "3.jpeg" },
];

const LOCAL_STORAGE_KEY = "bingoCurrentPlayerId";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const bgPhotoEl = document.getElementById("bg-photo");
const playerSelectEl = document.getElementById("player-select");
const playerButtonsEl = document.getElementById("player-buttons");
const appEl = document.getElementById("app");
const playerNameLabelEl = document.getElementById("player-name-label");
const gridEl = document.getElementById("bingo-grid");
const scoreEl = document.getElementById("score");
const progressFillEl = document.getElementById("progress-fill");
const bingoCountEl = document.getElementById("bingo-count");
const resetBtn = document.getElementById("reset-btn");
const editModeBtn = document.getElementById("edit-mode-btn");
const overlayEl = document.getElementById("bingo-overlay");
const othersGridEl = document.getElementById("others-grid");
const toastContainerEl = document.getElementById("toast-container");

let currentPlayerId = localStorage.getItem(LOCAL_STORAGE_KEY);
const playersData = {};
const knownBingoCounts = {};
let overlayTimeout = null;
let editMode = false;

function shuffledIndices(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createNewPlayerState() {
  return {
    order: shuffledIndices(CRITERIA.length).slice(0, CELL_COUNT),
    checked: Array(CELL_COUNT).fill(false),
    completedLines: [],
    customTexts: Array(CELL_COUNT).fill(null),
  };
}

function getCellText(data, pos) {
  const custom = data.customTexts && data.customTexts[pos];
  return custom || CRITERIA[data.order[pos]];
}

function computeCompletedLines(checked) {
  const completed = [];
  LINES.forEach((line, lineId) => {
    if (line.every((pos) => checked[pos])) completed.push(lineId);
  });
  return completed;
}

function playerDocRef(id) {
  return doc(db, "players", id);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainerEl.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showBingoOverlay() {
  clearTimeout(overlayTimeout);
  overlayEl.hidden = false;
  overlayTimeout = setTimeout(() => {
    overlayEl.hidden = true;
  }, 1800);
}

function renderOwnGrid() {
  const data = playersData[currentPlayerId];
  if (!data) return;

  const winningPositions = new Set();
  data.completedLines.forEach((lineId) => {
    LINES[lineId].forEach((pos) => winningPositions.add(pos));
  });

  gridEl.classList.toggle("edit-mode", editMode);
  gridEl.innerHTML = "";
  data.order.forEach((criterionIndex, pos) => {
    const cell = document.createElement("div");
    cell.className = "bingo-cell";
    cell.textContent = getCellText(data, pos);
    cell.setAttribute("role", "button");
    cell.setAttribute("tabindex", "0");

    if (data.checked[pos]) cell.classList.add("done");
    if (winningPositions.has(pos)) cell.classList.add("win-line");

    const activate = () => (editMode ? editCellText(pos) : toggleCell(pos));
    cell.addEventListener("click", activate);
    cell.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    });

    gridEl.appendChild(cell);
  });

  const checkedCount = data.checked.filter(Boolean).length;
  scoreEl.textContent = `${checkedCount} / ${CELL_COUNT}`;
  progressFillEl.style.width = `${(checkedCount / CELL_COUNT) * 100}%`;

  if (data.completedLines.length > 0) {
    bingoCountEl.hidden = false;
    bingoCountEl.textContent = `${data.completedLines.length} BINGO 🎉`;
  } else {
    bingoCountEl.hidden = true;
  }
}

function renderOthers() {
  othersGridEl.innerHTML = "";

  PLAYERS.filter((p) => p.id !== currentPlayerId).forEach((p) => {
    const data = playersData[p.id];
    const card = document.createElement("div");
    card.className = "other-card";

    if (!data) {
      card.innerHTML = `
        <div class="other-card-header">
          <span class="other-card-name">${p.name}</span>
        </div>
        <div class="other-card-loading">Chargement...</div>
      `;
      othersGridEl.appendChild(card);
      return;
    }

    const checkedCount = data.checked.filter(Boolean).length;
    const winningPositions = new Set();
    data.completedLines.forEach((lineId) => {
      LINES[lineId].forEach((pos) => winningPositions.add(pos));
    });

    const bingoBadge =
      data.completedLines.length > 0
        ? `<span class="other-card-bingo">${data.completedLines.length} BINGO</span>`
        : "";

    card.innerHTML = `
      <div class="other-card-header">
        <span class="other-card-name">${p.name}</span>
        ${bingoBadge}
      </div>
      <div class="other-card-score">${checkedCount} / ${CELL_COUNT}</div>
      <div class="other-progress-track">
        <div class="other-progress-fill" style="width:${(checkedCount / CELL_COUNT) * 100}%"></div>
      </div>
      <div class="other-mini-grid"></div>
    `;

    const miniGrid = card.querySelector(".other-mini-grid");
    data.order.forEach((criterionIndex, pos) => {
      const miniCell = document.createElement("div");
      miniCell.className = "other-mini-cell";
      if (data.checked[pos]) miniCell.classList.add("done");
      miniCell.title = getCellText(data, pos);
      miniGrid.appendChild(miniCell);
    });

    othersGridEl.appendChild(card);
  });
}

function renderAll() {
  renderOwnGrid();
  renderOthers();
}

async function toggleCell(pos) {
  const data = playersData[currentPlayerId];
  if (!data) return;
  const checked = [...data.checked];
  checked[pos] = !checked[pos];
  const completedLines = computeCompletedLines(checked);
  await updateDoc(playerDocRef(currentPlayerId), { checked, completedLines });
}

async function editCellText(pos) {
  const data = playersData[currentPlayerId];
  if (!data) return;

  const currentText = getCellText(data, pos);
  const newText = prompt("Modifier ce critère :", currentText);
  if (newText === null) return;

  const trimmed = newText.trim();
  if (!trimmed) return;

  const customTexts = data.customTexts ? [...data.customTexts] : Array(CELL_COUNT).fill(null);
  customTexts[pos] = trimmed;
  await updateDoc(playerDocRef(currentPlayerId), { customTexts });
}

function attachPlayerListener(player) {
  onSnapshot(playerDocRef(player.id), async (snap) => {
    if (!snap.exists()) {
      if (player.id === currentPlayerId) {
        await setDoc(playerDocRef(player.id), createNewPlayerState());
      }
      return;
    }

    const data = snap.data();
    const previousCount = knownBingoCounts[player.id];
    knownBingoCounts[player.id] = data.completedLines.length;
    playersData[player.id] = data;

    if (previousCount !== undefined && data.completedLines.length > previousCount) {
      if (player.id === currentPlayerId) {
        showBingoOverlay();
      } else {
        showToast(`🎉 ${player.name} vient de faire BINGO !`);
      }
    }

    renderAll();
  });
}

function startApp(animate) {
  const player = PLAYERS.find((p) => p.id === currentPlayerId);

  const reveal = () => {
    document.body.dataset.player = player.id;
    playerNameLabelEl.textContent = player.name.toUpperCase();
    playerSelectEl.hidden = true;
    appEl.hidden = false;
    bgPhotoEl.classList.add("visible");

    if (animate) {
      appEl.classList.add("entering");
      setTimeout(() => appEl.classList.remove("entering"), 1800);
    }

    PLAYERS.forEach(attachPlayerListener);
  };

  if (animate) {
    playerButtonsEl.style.pointerEvents = "none";
    playerSelectEl.classList.add("leaving");
    setTimeout(reveal, 450);
  } else {
    reveal();
  }
}

function showPlayerSelect() {
  appEl.hidden = true;
  playerSelectEl.hidden = false;
}

PLAYERS.forEach((p) => {
  const btn = document.createElement("button");
  btn.className = "player-card";
  btn.innerHTML = `
    <img src="${p.image}" alt="${p.name}">
    <span class="player-card-name">${p.name}</span>
  `;
  btn.addEventListener("click", () => {
    btn.classList.add("picked");
    currentPlayerId = p.id;
    localStorage.setItem(LOCAL_STORAGE_KEY, p.id);
    startApp(true);
  });
  playerButtonsEl.appendChild(btn);
});

resetBtn.addEventListener("click", async () => {
  const ok = confirm("Réinitialiser ta grille de bingo ?");
  if (!ok) return;
  await setDoc(playerDocRef(currentPlayerId), createNewPlayerState());
});

editModeBtn.addEventListener("click", () => {
  editMode = !editMode;
  editModeBtn.classList.toggle("active", editMode);
  editModeBtn.textContent = editMode ? "✅ Terminer la modification" : "✏️ Modifier mes cases";
  renderOwnGrid();
});

if (currentPlayerId && PLAYERS.some((p) => p.id === currentPlayerId)) {
  startApp(false);
} else {
  showPlayerSelect();
}
