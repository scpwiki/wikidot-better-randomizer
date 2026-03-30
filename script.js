const PATHS = {
  scp: "./data/scp/raw/scp_items.json",
  tale: "./data/scp/raw/scp_tales.json",
  goi: "./data/scp/raw/goi.json",
};

const state = {
  scps: [],
  tales: [],
  gois: [],
};

const statusEl = document.getElementById("status");
const cardEl = document.getElementById("result-card");
const typeEl = document.getElementById("result-type");
const titleEl = document.getElementById("result-title");
const scpNumberEl = document.getElementById("result-scp-number");
const ratingEl = document.getElementById("result-rating");
const tagsEl = document.getElementById("result-tags");

const randomScpBtn = document.getElementById("random-scp-btn");
const randomTaleBtn = document.getElementById("random-tale-btn");
const randomGoiBtn = document.getElementById("random-goi-btn");

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags;
  }
  return [];
}

function normalizeRating(rating) {
  if (rating === null || rating === undefined || rating === "") {
    return "N/A";
  }
  return String(rating);
}

function makeTitle(record, kind) {
  if (kind === "scp") {
    return record.scp || record.title || record.link || "Untitled SCP";
  }
  return record.title || record.link || "Untitled";
}

function makeUrl(record) {
  if (record.url) {
    return record.url;
  }
  if (record.link) {
    return `https://scp-wiki.wikidot.com/${record.link}`;
  }
  return "#";
}

function pickRandom(array) {
  if (!array.length) {
    return null;
  }
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

function clearTags() {
  tagsEl.innerHTML = "";
}

function renderTags(tags) {
  clearTags();

  if (!tags.length) {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = "No tags";
    tagsEl.appendChild(span);
    return;
  }

  for (const tag of tags) {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tag;
    tagsEl.appendChild(span);
  }
}

function renderResult(record, kind) {
  if (!record) {
    statusEl.textContent = `No ${kind} entries available.`;
    return;
  }

  const url = makeUrl(record);
  const title = makeTitle(record, kind);
  const tags = normalizeTags(record.tags);
  const rating = normalizeRating(record.rating);

  typeEl.textContent =
    kind === "scp" ? "SCP Article" :
    kind === "tale" ? "Tale" :
    "GoI";

  titleEl.innerHTML = "";
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = title;
  titleEl.appendChild(link);

  if (kind === "scp" && record.scp) {
    scpNumberEl.textContent = "";
    scpNumberEl.classList.add("hidden");
  } else {
    scpNumberEl.textContent = "";
    scpNumberEl.classList.add("hidden");
  }

  ratingEl.textContent = `Rating: ${rating}`;
  renderTags(tags);

  cardEl.classList.remove("hidden");
}

function isValidScp(record) {
  return record && typeof record === "object";
}

function isValidTale(record) {
  return record && typeof record === "object";
}

function isValidGoi(record) {
  return record && typeof record === "object";
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path} (${response.status})`);
  }
  return response.json();
}

async function loadData() {
  try {
    const [scpData, taleData, goiData] = await Promise.all([
      loadJson(PATHS.scp),
      loadJson(PATHS.tale),
      loadJson(PATHS.goi),
    ]);

    state.scps = Array.isArray(scpData) ? scpData.filter(isValidScp) : [];
    state.tales = Array.isArray(taleData) ? taleData.filter(isValidTale) : [];
    state.gois = Array.isArray(goiData) ? goiData.filter(isValidGoi) : [];

    statusEl.textContent =
      `Loaded ${state.scps.length} SCPs, ` +
      `${state.tales.length} Tales, ` +
      `${state.gois.length} GoI pages.`;
  } catch (error) {
    console.error(error);
    statusEl.textContent = error.message;
  }
}

randomScpBtn.addEventListener("click", () => {
  renderResult(pickRandom(state.scps), "scp");
});

randomTaleBtn.addEventListener("click", () => {
  renderResult(pickRandom(state.tales), "tale");
});

randomGoiBtn.addEventListener("click", () => {
  renderResult(pickRandom(state.gois), "goi");
});

loadData();
