const CROM_ENDPOINT = "https://apiv1.crom.avn.sh/graphql";
const PREVIEW_REGEX =
  /\[\[include\s+(?::[a-z0-9-]{1,12}:)?component:preview\s+(?:\|\s*)?text\s*=\s*(.+?)\s*\]\]/ms;

const statusEl = document.getElementById("status");
const cardEl = document.getElementById("result-card");
const typeEl = document.getElementById("result-type");
const titleEl = document.getElementById("result-title");
const scpNumberEl = document.getElementById("result-scp-number");
const ratingEl = document.getElementById("result-rating");
const tagsEl = document.getElementById("result-tags");
const altTitleEl = document.getElementById("result-alt-title");
const previewEl = document.getElementById("result-preview");
const thumbnailEl = document.getElementById("result-thumbnail");

const randomScpBtn = document.getElementById("random-scp-btn");
const randomTaleBtn = document.getElementById("random-tale-btn");
const randomGoiBtn = document.getElementById("random-goi-btn");
const randomArtBtn = document.getElementById("random-art-btn");

const RATE_LIMIT_MAX_REQUESTS = 12;
const RATE_LIMIT_WINDOWS_MS = 60 * 1000;

const requestTimeStamps = [];

const TAG_MAP = {
  // English
  en: {
    scp: "scp",
    tale: "tale",
    goi: "goi-format",
    art: "artwork",
  },
  vn: {
    scp: "scp",
    tale: "truyện",
    goi: "tài-liệu-goi",
    art: "hội-họa",
  },
  // French
  fr: {
    scp: "scp",
    tale: "conte",
    goi: "format-gdi",
    art: "fanart",
  }
};

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
    'error-rate-limit': 'Rate limit reached. Try again in %%seconds%% seconds.',
    // Branch URL
    'wiki-url': 'http://scp-wiki.wikidot.com',
  },
  // Vietnamese
  'vn': {
    'title': 'Better SCP Randomizer',
    'instructions': 'Chọn một trang SCP, Ngoại truyện, hoặc tài liệu TLĐLT ngẫu nhiên.',
    // Buttons
    'scp-btn': 'SCP Ngẫu Nhiên',
    'tale-btn': 'Ngoại truyện Ngẫu nhiên',
    'goi-btn': 'TLĐLT Ngẫu nhiên',
    'art-btn': 'Họa phẩm Ngẫu nhiên',
    // Labels above Random Page's Title
    'scp-label': 'Tài liệu SCP',
    'tale-label': 'Ngoại truyện',
    'goi-label': 'Tài liệu TLĐLT',
    'art-label': 'Họa Phẩm',
    // Random Page Info
    'tags': 'Tag',
    'no-tags': 'Không có Tag',
    'author': 'Tác giả',
    'rating': 'Đánh giá',
    // Loading Status and Errors
    'ready': 'Sẵn sàng.',
    'loading-scp': 'Đang tải tài liệu SCP ngẫu nhiên...',
    'loading-tale': 'Đang tải Ngoại truyện ngẫu nhiên...',
    'loading-goi': 'Đang tải tài liệu TLĐLT ngẫu nhiên...',
    'loading-art': 'Đang tải Họa phẩm ngẫu nhiên...',
    'loaded-scp': 'Đã tải xong tài liệu SCP ngẫu nhiên.',
    'loaded-tale': 'Đã tải xong Ngoại truyện ngẫu nhiên.',
    'loaded-goi': 'Đã tải xong tài liệu TLĐLT ngẫu nhiên.',
    'loaded-art': 'Đã tải xong Họa phẩm ngẫu nhiên.',
    'error-no-page': 'Không trả về được kết quả.',
    'error-unknown-kind': 'Không rõ phân loại ngẫu nhiên.',
    'error-rate-limit': 'Đã đạt giới hạn cho phép. Hãy thử lại trong %%seconds%% giây.',
    // Branch URL
    'wiki-url': 'http://scp-vn.wikidot.com',
  },
  // French
  'fr': {
    // Header
    'title': 'Article au hasard',
    'instructions': 'Obtenez un rapport SCP, conte ou format GdI au hasard.',
    // Buttons
    'scp-btn': 'SCP au hasard',
    'tale-btn': 'Conte au hasard',
    'goi-btn': 'Format GdI au hasard',
    'art-btn': 'Random Art',
    // Labels above Random Page's Title
    'scp-label': 'Rapport SCP',
    'tale-label': 'Conte',
    'goi-label': 'Format GdI',
    'art-label': 'Artwork',
    // Random Page Info
    'tags': 'Tags',
    'no-tags': 'Pas de tags',
    'author': 'Auteur',
    'rating': 'Note',
    // Loading Text
    'ready': 'Prêt.',
    'loading-scp': 'Recherche d\'un rapport au hasard...',
    'loading-tale': 'Recherche d\'un conte au hasard...',
    'loading-goi': 'Recherche d\'un format GdI au hasard...',
    'loading-art': 'Loading random artwork...',
    'loaded-scp': 'Rapport trouvé.',
    'loaded-tale': 'Conte trouvé.',
    'loaded-goi': 'Format GdI trouvé.',
    'loaded-art': 'Loaded random Artwork.',
    'error-no-page': 'Aucune page trouvée.',
    'error-unknown-kind': 'Type inconnu.',
    'error-rate-limit': 'Limite de requête atteinte. Merci de réessayer dans %%seconds%% secondes.',
    'wiki-url': 'http://fondationscp.wikidot.com',
  },
};

function checkRateLimit() {
  const now = Date.now();

  while (requestTimeStamps.length > 0 && now - requestTimeStamps[0] >= RATE_LIMIT_WINDOWS_MS) {
    requestTimeStamps.shift();
  }

  if (requestTimeStamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const waitMs = RATE_LIMIT_WINDOWS_MS - (now - requestTimeStamps[0]);
    return {allowed: false, waitMs};
  }

  requestTimeStamps.push(now);

  return {allowed: true, waitMs: 0};
}
      

function getLang() {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get("lang");
  
  if (!lang || !TRANSLATIONS[lang]) {
    statusEl.textContent = "Error: Missing or invalid language. Please add ?lang=(en, fr, or vn) to the end of the URL.";
    throw new Error("Invalid language");
  }

  return lang;
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
          alternateTitles {
            title
          }
          wikidotInfo {
            title
            rating
            tags
            thumbnailUrl
            source
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
  const tag = TAG_MAP[language]?.[kind] || TAG_MAP.en[kind];
  return buildRandomQuery(tag, language);
}

function normalizeTags(tags) {
  return Array.isArray(tags) ? tags : [];
}

function filterDisplayTags(tags) {
  return normalizeTags(tags).filter(tag =>
    typeof tag === "string" &&
    !tag.startsWith("_") &&
    !tag.startsWith("crom:")
  );
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

function extractPreviewText(pageSource) {
  if (!pageSource || typeof pageSource !== "string") {
    return "";
  }

  const previewText = pageSource.match(PREVIEW_REGEX)?.[1]?.trim();

  if (!previewText) {
    return "";
  }

  return previewText;
}

function mapCromPageToRecord(page) {
  const source = page?.wikidotInfo?.source ?? "";
  
  return {
    url: page?.url ?? "#",
    title: page?.wikidotInfo?.title ?? "Untitled",
    alternateTitle: Array.isArray(page?.alternateTitles) && page.alternateTitles.length
      ? page.alternateTitles[0]?.title ?? ""
      : "",
    rating: page?.wikidotInfo?.rating ?? "N/A",
    tags: Array.isArray(page?.wikidotInfo?.tags) ? page.wikidotInfo.tags : [],
    thumbnailUrl: page?.wikidotInfo?.thumbnailUrl ?? "",
    source,
    previewText: extractPreviewText(source),
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
  const alternateTitle = record.alternateTitle || "";
  const tags = filterDisplayTags(record.tags);
  const rating = normalizeRating(record.rating);
  const previewText = record.previewText || "";

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

  if (alternateTitle) {
    altTitleEl.textContent = alternateTitle;
    altTitleEl.classList.remove("hidden");
  } else {
    altTitleEl.textContent = "";
    altTitleEl.classList.add("hidden");
  }

  if (previewText) {
    previewEl.textContent = previewText;
    previewEl.classList.remove("hidden");
  } else {
    previewEl.textContent = "";
    previewEl.classList.add("hidden");
  }

  if (record.thumbnailUrl) {
    thumbnailEl.src = record.thumbnailUrl;
    thumbnailEl.alt = alternateTitle
      ? `${alternateTitle} thumbnail`
      : `${title} thumbnail`;
    thumbnailEl.classList.remove("hidden");
  } else {
    thumbnailEl.removeAttribute("src");
    thumbnailEl.classList.add("hidden");
  }
  
  renderTags(tags, language);
  cardEl.classList.remove("hidden");
}

async function fetchAndRenderRandom(kind, language) {
  const rateLimit = checkRateLimit();

  if (!rateLimit.allowed) {
    const waitSeconds = Math.ceil(rateLimit.waitMs / 1000);
    statusEl.textContent = getMessage(language, 'error-rate-limit')
      .replace('%%seconds%%', waitSeconds);
    return;
  }
  
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

async function fetchAndMaybeRedirect(kind, language, shouldRedirect = false) {
  const rateLimit = checkRateLimit();

  if (!rateLimit.allowed) {
    const waitSeconds = Math.ceil(rateLimit.waitMs / 1000);
    statusEl.textContent = getMessage(language, 'error-rate-limit')
      .replace('%%seconds%%', waitSeconds);
    return;
  }

  try {
    const query = getQueryForKind(kind, language);
    const data = await cromApiRequest(query);
    const page = data?.randomPage?.page;

    if (!page || !page.url) {
      throw new Error(getMessage(language, 'error-no-page'));
    }

    if (shouldRedirect) {
      window.location.replace(page.url);
      return;
    }

    renderResult(mapCromPageToRecord(page), kind, language);
  } catch (error) {
    console.error(error);
    statusEl.textContent = error.message;
  }
}

initializeMessages(language);

function checkAutoRedirect() {
  const params = new URLSearchParams(window.location.search);
  const randomType = params.get("random");

  if (!randomType) return;

  const validTypes = ["scp", "tale", "goi", "art"];

  if (!validTypes.includes(randomType)) {
    statusEl.textContent = "Invalid random type.";
    return;
  }

  statusEl.textContent = getMessage(language, `loading-${randomType}`);

  fetchAndMaybeRedirect(randomType, language, true);
}

checkAutoRedirect();

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

