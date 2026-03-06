/*
Bingo-board (5 x 5) representation
indices [0 - 24]
 ________________________
|    |    |    |    |    |
| 00 | 01 | 02 | 03 | 04 |
|----|----|----|----|----|
| 05 | 06 | 07 | 08 | 09 |
|----|----|----|----|----|
| 10 | 11 | 12 | 13 | 14 |
|----|----|----|----|----|
| 15 | 16 | 17 | 18 | 19 |
|----|----|----|----|----|
| 20 | 21 | 22 | 23 | 24 |
|____|____|____|____|____|
*/

const REPO_NAME = "litter-picking-bingo";

// total amount of elements per card
const BINGO_CARD_SIZE = 25;

// all sets of winning indices
const WIN_LINES = [
  [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
];

// pseudo enum for shuffle mode
const ShuffleMode = {
  Random: 0,
  Rarity: 1
}
// set shuffle mode to Rarity by default
let shuffle_mode = ShuffleMode.Rarity;

// pseudo enum for item rarities
const Rarities = {
  Common: 0,
  Uncommon: 1,
  Rare: 2
}

const res = await fetch("items.json");
// item data
const ITEMS = await res.json();
const COMMON_ITEMS = ITEMS.filter(item => item.rarity === Rarities.Common);
const UNCOMMON_ITEMS = ITEMS.filter(item => item.rarity === Rarities.Uncommon);
const RARE_ITEMS = ITEMS.filter(item => item.rarity === Rarities.Rare);

// will contain chosen bingo card items
let card = []
// will keep track of marked items
let marked = new Array(BINGO_CARD_SIZE).fill(false);

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    // random() returns x in [0, 1)
    const j = Math.floor(Math.random() * (i + 1));
    // swap elements i and j
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// any item can be assigned to any slot
function fillCardRandom() {
  card = shuffle(ITEMS).slice(0, BINGO_CARD_SIZE);
}

/* 
items are assigned based on rarity
common = 00, uncommon = 01, rare = 02
 ________________________
|    |    |    |    |    |
| 01 | 00 | 00 | 00 | 01 |
|----|----|----|----|----|
| 00 | 01 | 00 | 01 | 00 |
|----|----|----|----|----|
| 00 | 00 | 02 | 00 | 00 |
|----|----|----|----|----|
| 00 | 01 | 00 | 01 | 00 |
|----|----|----|----|----|
| 01 | 00 | 00 | 00 | 01 |
|____|____|____|____|____|

items.json needs to contain at least:
16 common items
8 uncommon items
1 rare item
*/
function fillCardRarity() {
  // generate shuffled item arrays
  let common_items_shuffled = shuffle(COMMON_ITEMS);
  let uncommon_items_shuffled = shuffle(UNCOMMON_ITEMS);
  let rare_items_shuffled = shuffle(RARE_ITEMS);
  // set up indices
  let common_idx = 0;
  let uncommon_idx = 0;

  for (let i = 0; i < BINGO_CARD_SIZE; i++) {
    // put a rare item in the middle
    if (i === 12)
      card[i] = rare_items_shuffled[0];

    /* put uncommon items in the remaining X shape
     ________________________
    |    |    |    |    |    |
    | 00 |    |    |    | 04 |
    |----|----|----|----|----|
    |    | 06 |    | 08 |    |
    |----|----|----|----|----|
    |    |    |    |    |    |
    |----|----|----|----|----|
    |    | 16 |    | 18 |    |
    |----|----|----|----|----|
    | 20 |    |    |    | 24 |
    |____|____|____|____|____|
    */
    else if (i % 4 === 0 || i % 6 === 0)
      card[i] = uncommon_items_shuffled[uncommon_idx++];

    // put common items in the remaining slots
    else
      card[i] = common_items_shuffled[common_idx++];
  }
}

function generateCard() {
  resetMarks()
  if (shuffle_mode === ShuffleMode.Rarity)
    fillCardRarity();
  else
    fillCardRandom();
  shuffleCells();
}

function resetMarks() {
  for (let i = 0; i < marked.length; i++) {
    if (marked[i])
      toggleMark(i);
  }
  document.getElementById("winBanner").style.display = "none";
}

function toggleMark(i) {
  marked[i] = !marked[i];
  const selected_cell = document.getElementById("cell" + String(i));
  selected_cell.classList.toggle("marked");
}

function toggleCell(i) {
  toggleMark(i);
  // check for win
  if (WIN_LINES.some(line => line.every(i => marked[i])))
    document.getElementById("winBanner").style.display = "block";
  else
    document.getElementById("winBanner").style.display = "none";
}

function shuffleCells() {
  card.forEach((item, i) => {
    const cell = document.getElementById("cell" + String(i));
    // update image
    if (item.src) {
      const img = cell.querySelector("img");
      img.src = item.src;
      img.alt = item.label;
      img.srcset = item.srcset;
      img.sizes = item.sizes;
    }
    // update label
    const label = cell.querySelector("span");
    label.textContent = item.label;
  });
}

function addListeners() {
  document.querySelector(".btn-shuffle").addEventListener("click", generateCard);
  document.querySelector(".btn-reset").addEventListener("click", resetMarks);
  document.getElementById("rarity-switch").addEventListener("change", (e) => {
    if (e.target.checked)
      shuffle_mode = ShuffleMode.Rarity;
    else
      shuffle_mode = ShuffleMode.Random;
  });
  for (let i = 0; i < BINGO_CARD_SIZE; i++) {
    const cell = document.getElementById("cell" + String(i));
    cell.onclick = () => toggleCell(i);
  }
  // service worker for offline/caching
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(`/${REPO_NAME}/sw.js`, {
        scope: `/${REPO_NAME}/`
      });
    });
  }
}

// add listeners
addListeners();

// generate the bingo card
generateCard();
