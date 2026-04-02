const CROM_ENDPOINT = "https://apiv1.crom.avn.sh/graphql";

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
const randomArtBtn = document.getElementById("random-art-btn");

var TRANSLATIONS = {
  // English
  'en': {
    // Header
    'title': 'Better SCP Randomizer',
    'instructions': 'Pick a random SCP, Tale, or GoI-Formatted page.',
    // Buttons
    'scp-btn': 'Random SCP',
    'tale-btn': 'Random Tale',
    'goi-btn': 'Random GoI',
    'art-btn': 'Random Art',
    // Labels above Random Page's Title
    'scp-label': 'SCP Article',
    'tale-label': 'Tale',
    'goi-label': 'GoI Article',
    'art-label': 'Artwork',
    // Random Page Info
    'tags': 'Tags',
    'no-tags': 'No tags',
    'author': 'Author',
    'rating': 'Rating',
    // Loading Status and Errors
    'ready': 'Ready.',
    'loading-scp': 'Loading random SCP...',
    'loading-tale': 'Loading random Tale...',
    'loading-goi': 'Loading random GoI Article...',
    'loading-art': 'Loading random artwork...',
    'loaded-scp': 'Loaded random SCP.',
    'loaded-tale': 'Loaded random Tale.',
    'loaded-goi': 'Loaded random GoI Article.',
    'loaded-art': 'Loaded random Artwork.',
    'error-no-page': 'No page was returned.',
    'error-unknown-kind': 'Unknown randomizer type.',
    // Branch URL
    'wiki-url': 'http://scp-wiki.wikidot.com',
  },
  // French
  'fr': {
    // Header
    'title': 'Better SCP Randomizer (French)',
    'instructions': 'Pick a random SCP, Tale, or GoI-Formatted page. (French)',
    // Buttons
    'scp-btn': 'Random SCP (French)',
    'tale-btn': 'Random Tale (French)',
    'goi-btn': 'Random GoI (French)',
    'art-btn': 'Random Art (French)',
    // Labels above Random Page's Title
    'scp-label': 'SCP Article (French)',
    'tale-label': 'Tale (French)',
    'goi-label': 'GoI Article (French)',
    'art-label': 'Artwork (French)',
    // Random Page Info
    'tags': 'Tags (French)',
    'no-tags': 'No tags (French)',
    'author': 'Author (French)',
    'rating': 'Rating (French)',
    // Loading Text
    'ready': 'Ready. (French)',
    'loading-scp': 'Loading random SCP... (French)',
    'loading-tale': 'Loading random Tale... (French)',
    'loading-goi': 'Loading random GoI Article... (French)',
    'loading-art': 'Loading random artwork... (French)',
    'loaded-scp': 'Loaded random SCP. (French)',
    'loaded-tale': 'Loaded random Tale. (French)',
    'loaded-goi': 'Loaded random GoI Article. (French)',
    'loaded-art': 'Loaded random Artwork. (French)',
    'error-no-page': 'No page was returned. (French)',
    'error-unknown-kind': 'Unknown randomizer type. (French)',
    'wiki-url': 'http://fondationscp.wikidot.com',
  },
};

function getLang() {
  const params = new URLSearchParams(window.location.search);
  return params.get("lang") || "en";
}

function getMessage(language, key) {
  return TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.en?.[key] ?? key;
}

const language = getLang();

function initializeMessages(language) {
  document.documentElement.lang = language;

  document.getElementById('page-title').textContent =
    getMessage(language, 'title');

  document.getElementById('page-subtitle').textContent =
    getMessage(language, 'instructions');

  document.getElementById('tags-label').textContent =
    getMessage(language, 'tags');

  randomScpBtn.textContent = getMessage(language, 'scp-btn');
  randomTaleBtn.textContent = getMessage(language, 'tale-btn');
  randomGoiBtn.textContent = getMessage(language, 'goi-btn');
  randomArtBtn.textContent = getMessage(language, 'art-btn');

  statusEl.textContent = getMessage(language, 'ready');
}

function buildRandomQuery(tag, language) {
  const wikiUrl = getMessage(language, 'wiki-url');

  return `
    query RandomPage {
      randomPage(
        filter: {
          allTags: ["${tag}"]
          anyBaseUrl: ["${wikiUrl}"]
        }
      ) {
        page {
          url
          wikidotInfo {
            title
            rating
            tags
          }
          attributions {
            user {
              name
            }
          }
        }
      }
    }
  `;
}

function getQueryForKind(kind, language) {
  switch (kind) {
    case 'scp':
      return buildRandomQuery('scp', language);
    case 'tale':
      return buildRandomQuery('tale', language);
    case 'goi':
      return buildRandomQuery('goi-format', language);
    case 'art':
      return buildRandomQuery('artwork', language);
    default:
      throw new Error(getMessage(language, 'error-unknown-kind'));
  }
}

function normalizeTags(tags) {
  return Array.isArray(tags) ? tags : [];
}

function normalizeRating(rating) {
  if (rating === null || rating === undefined || rating === "") {
    return "N/A";
  }
  return String(rating);
}

function clearTags() {
  tagsEl.innerHTML = "";
}

function renderTags(tags, language) {
  clearTags();

  if (!tags.length) {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = getMessage(language, 'no-tags');
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

async function cromApiRequest(query, variables = null) {
  const response = await fetch(CROM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    throw new Error(`Crom request failed (${response.status})`);
  }

  const payload = await response.json();

  if (payload.errors && payload.errors.length) {
    throw new Error(payload.errors.map((e) => e.message).join("; "));
  }

  return payload.data;
}

function mapCromPageToRecord(page) {
  return {
    url: page?.url ?? "#",
    title: page?.wikidotInfo?.title ?? "Untitled",
    rating: page?.wikidotInfo?.rating ?? "N/A",
    tags: Array.isArray(page?.wikidotInfo?.tags) ? page.wikidotInfo.tags : [],
    authors: Array.isArray(page?.attributions)
      ? page.attributions.map((a) => a?.user?.name).filter(Boolean)
      : []
  };
}

function renderResult(record, kind, language) {
  if (!record) {
    statusEl.textContent = getMessage(language, 'error-no-page');
    return;
  }

  const title = record.title || "Untitled";
  const tags = normalizeTags(record.tags);
  const rating = normalizeRating(record.rating);

  typeEl.textContent =
    kind === "scp"
      ? getMessage(language, 'scp-label')
      : kind === "tale"
      ? getMessage(language, 'tale-label')
      : kind === "goi"
      ? getMessage(language, 'goi-label')
      : getMessage(language, 'art-label');

  titleEl.innerHTML = "";
  const link = document.createElement("a");
  link.href = record.url || "#";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = title;
  titleEl.appendChild(link);

  scpNumberEl.textContent = "";
  scpNumberEl.classList.add("hidden");

  const authorText =
    Array.isArray(record.authors) && record.authors.length
      ? ` | ${getMessage(language, 'author')}: ${record.authors.join(", ")}`
      : "";

  ratingEl.textContent = `${getMessage(language, 'rating')}: ${rating}${authorText}`;
  renderTags(tags, language);
  cardEl.classList.remove("hidden");
}

async function fetchAndRenderRandom(kind, language) {
  try {
    statusEl.textContent = getMessage(language, `loading-${kind}`);

    const query = getQueryForKind(kind, language);
    const data = await cromApiRequest(query);
    const page = data?.randomPage?.page;

    if (!page) {
      throw new Error(getMessage(language, 'error-no-page'));
    }

    renderResult(mapCromPageToRecord(page), kind, language);
    statusEl.textContent = getMessage(language, `loaded-${kind}`);
  } catch (error) {
    console.error(error);
    statusEl.textContent = error.message;
  }
}

initializeMessages(language);

randomScpBtn?.addEventListener("click", () => {
  fetchAndRenderRandom("scp", language);
});

randomTaleBtn?.addEventListener("click", () => {
  fetchAndRenderRandom("tale", language);
});

randomGoiBtn?.addEventListener("click", () => {
  fetchAndRenderRandom("goi", language);
});

randomArtBtn?.addEventListener("click", () => {
  fetchAndRenderRandom("art", language);
});

