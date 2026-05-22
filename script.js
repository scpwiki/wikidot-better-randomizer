const CROM_ENDPOINT = "https://apiv1.crom.avn.sh/graphql";

// For Isolating Preview Text from Source
const PREVIEW_REGEX =
  /\[\[include\s+(?::[a-z0-9-]{1,12}:)?component:preview\s+(?:\|\s*)?text\s*=\s*(.+?)\s*\]\]/ms;

const statusEl = document.getElementById("status");

// Custom Seach Elements
const menuToggleBtn = document.getElementById("menu-toggle-btn");
const menuPanel = document.getElementById("menu-panel");
const menuCloseBtn = document.getElementById("menu-close-btn");
const customSearchKindSelect = document.getElementById("custom-search-kind-select");
const customSearchTagsInput = document.getElementById("custom-search-tags-input");
const customSearchAuthorInput = document.getElementById("custom-search-author-input");
const customSearchIncludeAdultBtn = document.getElementById("custom-search-include-adult");
const customSearchIncludeAdultLabel = document.getElementById("custom-search-include-adult-label");
const customSearchIncludeTranslationsBtn = document.getElementById("custom-search-include-translations");
const customSearchIncludeTranslationsLabel = document.getElementById("custom-search-include-translations-label");
const customSearchSubmitBtn = document.getElementById("custom-search-submit-btn");

// Result Elements
const cardEl = document.getElementById("result-card");
const typeEl = document.getElementById("result-type");
const titleEl = document.getElementById("result-title");
const ratingEl = document.getElementById("result-rating");
const tagsEl = document.getElementById("result-tags");
const altTitleEl = document.getElementById("result-alt-title");
const previewEl = document.getElementById("result-preview");
const thumbnailEl = document.getElementById("result-thumbnail");
const licenseboxEl = document.getElementById("result-licensebox");

// Top Button Elements
const randomScpBtn = document.getElementById("random-scp-btn");
const randomTaleBtn = document.getElementById("random-tale-btn");
const randomGoiBtn = document.getElementById("random-goi-btn");
const randomArtBtn = document.getElementById("random-art-btn");
const adultToggleBtn = document.getElementById("adult-toggle-btn");
const translationToggleBtn = document.getElementById("translation-toggle-btn");

// Rate Limit for Queries (12/min)
const RATE_LIMIT_MAX_REQUESTS = 12;
const RATE_LIMIT_WINDOWS_MS = 60 * 1000;

const requestTimeStamps = [];

// Tags associated with 'scp', 'tale', 'goi-format', and 'artwork' for each branch
const TAG_MAP = {
  // English
  en: {
    scp: "scp",
    tale: "tale",
    goi: "goi-format",
    art: "artwork",
  },
  // Vietnamese
  vn: {
    scp: "scp-vn",
    tale: "truyện-vn",
    goi: "tài-liệu-goi-vn",
    art: "hội-họa-vn",
  },
  // French
  fr: {
    scp: "scp",
    tale: "conte",
    goi: "format-gdi",
    art: "fanart",
  },
  // Polish
  pl: {
    scp: "scp",
    tale: "opowieść",
    goi: "goi-format",
    art: "fanart",
  },
  // Simplified Chinese
  cn: {
    scp: "scp",
    tale: "故事",
    goi: "goi格式",
    art: "艺术作品",
  }
};

// Translated Pages Tags for -VN
const TRANSLATED_TAG_MAP = {
  vn: {
    scp: "scp",
    tale: "truyện",
    goi: "tài-liệu-goi",
    art: "hội-họa",
  },
};


// Tags Excluded for Random SCP
const MAINLIST_SCP_EXCLUDED_TAGS = {
  en: ["joke", "explained", "archived", "decommissioned", "international"],
};

// Tags Excluded from General Random SCP unless Specified
function getMainlistScpExcludedTags(language) {
  return MAINLIST_SCP_EXCLUDED_TAGS[language] ?? [];
}

var TRANSLATIONS = {
  // English
  'en': {
    // Header
    'title': 'SCP Randomizer',
    'credit': '',
    'instructions': 'Pick a random SCP, Tale, or GoI-Formatted page.',
    // Buttons
    'scp-btn': 'Random SCP',
    'tale-btn': 'Random Tale',
    'goi-btn': 'Random GoI',
    'art-btn': 'Random Art',
    // Exclude "_adult" Tag Toggle
    'include-adult-off': 'Include Adult Pages: Off',
    'include-adult-on': 'Include Adult Pages: On',
    'adult-tag': '_adult',
    // Custom Search
    'custom-search-submit': 'Get Random Page',
    'custom-search-kind-label': 'Content Type',
    'custom-search-kind-any': 'Any',
    'custom-search-kind-scp': 'SCP',
    'custom-search-kind-tale': 'Tale',
    'custom-search-kind-goi': 'GoI',
    'custom-search-kind-art': 'Art',
    'custom-search-tags-label': 'Tags',
    'custom-search-author-label': 'Author',
    'custom-search-tags-placeholder': 'euclid, horror, antimemetic',
    'custom-search-author-placeholder': 'Enter author here.',
    'custom-search-include-adult': 'Include Adult Pages',
    'loading-custom-search': 'Loading random page...',
    'loaded-custom-search': 'Loaded random page.',
    'error-custom-search-empty': 'Enter at least one filter.',
    // Labels above Random Page's Title
    'scp-label': 'SCP Article',
    'tale-label': 'Tale',
    'goi-label': 'GoI Format',
    'art-label': 'Artwork',
    'random-tag-label': 'Page Tagged With',
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
    'loading-tag': 'Loading random page tagged "%%tag%%"...',
    'loaded-scp': 'Loaded random SCP.',
    'loaded-tale': 'Loaded random Tale.',
    'loaded-goi': 'Loaded random GoI Article.',
    'loaded-art': 'Loaded random Artwork.',
    'loaded-tag': 'Loaded random page tagged "%%tag%%".',
    'error-no-page': 'No page was returned.',
    'error-unknown-kind': 'Unknown randomizer type.',
    'error-rate-limit': 'Rate limit reached. Try again in %%seconds%% seconds.',
    // Branch URL
    'wiki-url': 'http://scp-wiki.wikidot.com',
  },
  // Vietnamese
  'vn': {
    'title': 'Bộ chọn SCP Ngẫu nhiên Tốt hơn',
    'credit': 'Được phát triển bởi người dùng danjon56 -EN',
    'instructions': 'Chọn một trang SCP, Ngoại truyện, hoặc tài liệu TLĐLT ngẫu nhiên.',
    // Buttons
    'scp-btn': 'SCP Ngẫu Nhiên',
    'tale-btn': 'Ngoại truyện Ngẫu nhiên',
    'goi-btn': 'TLĐLT Ngẫu nhiên',
    'art-btn': 'Họa phẩm Ngẫu nhiên',
    // Exclude "_adult" Tag Toggle
    'include-adult-off': 'Bao gồm bài viết người lớn : Tắt',
    'include-adult-on': 'Bao gồm bài viết người lớn : Bật',
    'adult-tag': '_người-lớn',
    // Custom Search
    'custom-search-submit': 'Tải Bài viết Ngẫu nhiên',
    'custom-search-kind-label': 'Dạng Tài liệu',
    'custom-search-kind-any': 'Bất kỳ',
    'custom-search-kind-scp': 'SCP',
    'custom-search-kind-tale': 'Truyện',
    'custom-search-kind-goi': 'TLĐLT',
    'custom-search-kind-art': 'Họa phẩm',
    'custom-search-tags-label': 'Tags',
    'custom-search-author-label': 'Tác giả',
    'custom-search-tags-placeholder': 'euclid, kinh-dị, phản-nhận-thức',
    'custom-search-author-placeholder': 'Nhập tên tác giả.',
    'custom-search-include-adult': 'Bao gồm Bài viết người lớn',
    'loading-custom-search': 'Đang tải Bài viết ngẫu nhiên...',
    'loaded-custom-search': 'Đã tải xong Bài viết ngẫu nhiên.',
    'error-custom-search-empty': 'Hãy nhập ít nhất một bộ lọc.',
    'custom-search-include-translations': 'Dịch giả',
    'include-translations-on': 'Bản dịch: ✓',
    'include-translations-off': 'Bản dịch: X',
    // Labels above Random Page's Title
    'scp-label': 'Tài liệu SCP',
    'tale-label': 'Ngoại truyện',
    'goi-label': 'Tài liệu TLĐLT',
    'art-label': 'Họa phẩm',
    'random-tag-label': 'Những bài viết bao gồm tag',
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
    'loading-tag': 'Đang tải bài viết bao gồm những tag "%%tag%%"...',
    'loaded-scp': 'Đã tải xong tài liệu SCP ngẫu nhiên.',
    'loaded-tale': 'Đã tải xong Ngoại truyện ngẫu nhiên.',
    'loaded-goi': 'Đã tải xong tài liệu TLĐLT ngẫu nhiên.',
    'loaded-art': 'Đã tải xong Họa phẩm ngẫu nhiên.',
    'loaded-tag': 'Loaded random page tagged "%%tag%%".',
    'error-no-page': 'Kết quả trả về không thành công.',
    'error-unknown-kind': 'Không rõ phân loại ngẫu nhiên.',
    'error-rate-limit': 'Đã đạt giới hạn cho phép. Hãy thử lại sau %%seconds%% giây.',
    // Branch URL
    'wiki-url': 'http://scp-vn.wikidot.com',
  },
  // French
  'fr': {
    // Header
    'title': 'Article au hasard',
    'credit': 'Développé par l\'utilisateur Danjon56 de la branche EN',
    'instructions': 'Obtenez un rapport SCP, conte ou format GdI au hasard.',
    // Buttons
    'scp-btn': 'SCP au hasard',
    'tale-btn': 'Conte au hasard',
    'goi-btn': 'Format GdI au hasard',
    'art-btn': '',
    // Exclude "_adult" Tag Toggle
    'include-adult-off': 'Inclure les pages au contenu sensible : Non',
    'include-adult-on': 'Inclure les pages au contenu sensible : Oui',
    'adult-tag': 'adulte',
    // Custom Search
    'custom-search-submit': 'Trouver une page au hasard',
    'custom-search-kind-label': 'Type de contenu',
    'custom-search-kind-any': 'Tous',
    'custom-search-kind-scp': 'SCP',
    'custom-search-kind-tale': 'Conte',
    'custom-search-kind-goi': 'Format GdI',
    'custom-search-kind-art': 'Art',
    'custom-search-tags-label': 'Tags',
    'custom-search-author-label': 'Auteur',
    'custom-search-tags-placeholder': 'euclide, caldeira, antimémétique',
    'custom-search-author-placeholder': 'Indiquer le pseudo de l\'auteur ici.',
    'custom-search-include-adult': 'Inclure les pages comportant du contenu adulte',
    'loading-custom-search': 'Recherche d\'une page au hasard...',
    'loaded-custom-search': 'Page au hasard trouvée.',
    'error-custom-search-empty': 'Indiquez au moins un filtre.',
    // Labels above Random Page's Title
    'scp-label': 'Rapport SCP',
    'tale-label': 'Conte',
    'goi-label': 'Format GdI',
    'art-label': '',
    'random-tag-label': 'Page avec le tag ',
    // Random Page Info
    'tags': 'Tags',
    'no-tags': 'Pas de tags',
    'author': 'Auteur ',
    'rating': 'Note ',
    // Loading Text
    'ready': 'Prêt.',
    'loading-scp': 'Recherche d\'un rapport au hasard...',
    'loading-tale': 'Recherche d\'un conte au hasard...',
    'loading-goi': 'Recherche d\'un format GdI au hasard...',
    'loading-art': '',
    'loading-tag': 'Recherche d\'une page au hasard avec le tag "%%tag%%"...',
    'loaded-scp': 'Rapport trouvé.',
    'loaded-tale': 'Conte trouvé.',
    'loaded-goi': 'Format GdI trouvé.',
    'loaded-art': '',
    'loaded-tag': 'Page avec le "%%tag%%" trouvée.',
    'error-no-page': 'Aucune page trouvée.',
    'error-unknown-kind': 'Type inconnu.',
    'error-rate-limit': 'Limite de requête atteinte. Merci de réessayer dans %%seconds%% secondes.',
    // Branch URL
    'wiki-url': 'http://fondationscp.wikidot.com',
  },
// Polish
  'pl': {
    // Header
    'title': 'Lepsze losowanie SCP',
    'credit': '',
    'instructions': 'Wybierz losowy artykuł SCP, opowieść, albo GoI Format.',
    // Buttons
    'scp-btn': 'Losowy SCP',
    'tale-btn': 'Losowa opowieść',
    'goi-btn': 'Losowy GoI Format',
    'art-btn': '',
    // Exclude "_adult" Tag Toggle
    'include-adult-off': 'Uwzględnij str. dla dorosłych: Wył.',
    'include-adult-on': 'Uwzględnij str. dla dorosłych: Wł.',
    'adult-tag': 'dla-dorosłych',
    // Custom Search
    'custom-search-submit': 'Losuj stronę',
    'custom-search-kind-label': 'Rodzaj treści',
    'custom-search-kind-any': 'Dowolna',
    'custom-search-kind-scp': 'SCP',
    'custom-search-kind-tale': 'Opowieść',
    'custom-search-kind-goi': 'GoI Format',
    'custom-search-kind-art': '',
    'custom-search-tags-label': 'Tagi',
    'custom-search-author-label': 'Autor',
    'custom-search-tags-placeholder': 'euclid, horror, antymemetyczne',
    'custom-search-author-placeholder': 'Wpisz autora.',
    'custom-search-include-adult': 'Uwzględnij str. dla dorosłych',
    'custom-search-include-translations': 'Uwzględnij tłumaczenia',
    'loading-custom-search': 'Wybieranie losowej strony...',
    'loaded-custom-search': 'Wybrano losową stronę.',
    'error-custom-search-empty': 'Wybierz co najmniej jeden filtr.',
    // Labels above Random Page's Title
    'scp-label': 'Raport SCP',
    'tale-label': 'Opowieść',
    'goi-label': 'GoI Format',
    'art-label': '',
    'random-tag-label': 'Tagi strony',
    // Random Page Info
    'tags': 'Tagi',
    'no-tags': 'Brak tagów',
    'author': 'Autor',
    'rating': 'Ocena',
    // Loading Status and Errors
    'ready': 'Gotowe.',
    'loading-scp': 'Wybieranie losowego SCP...',
    'loading-tale': 'Wybieranie losowej opowieści...',
    'loading-goi': 'Wybieranie losowego Formatu GoI...',
    'loading-art': '',
    'loading-tag': 'Wybieranie losowej strony otagowanej "%%tag%%"...',
    'loaded-scp': 'Wybrano losowego SCP.',
    'loaded-tale': 'Wybrano losową opowieść.',
    'loaded-goi': 'Wybrano losowy Format GoI.',
    'loaded-art': '',
    'loaded-tag': 'Wybrano losową stronę otagowaną "%%tag%%".',
    'error-no-page': 'Brak kompatybilnych stron.',
    'error-unknown-kind': 'Nieznany typ losowania.',
    'error-rate-limit': 'Osiągnięto limit żądań. Spróbuj ponownie za %%seconds%% sekund.',
    // Branch URL
    'wiki-url': 'http://scp-pl.wikidot.com',
  },
// Simplified Chinese
  'cn': {
    'title': '更好的SCP随机化',
    'credit': '',
    'instructions': '选择随机SCP, 故事，或者 GoI格式.',
    // 按钮
    'scp-btn': '随机SCP',
    'tale-btn': '随机故事',
    'goi-btn': '随机GoI',
    'art-btn': '随机艺术',
    // Exclude "_成人" Tag Toggle
    'include-adult-off': '包含成人页面: 关',
    'include-adult-on': '包含成人页面: 开',
    'adult-tag': '_成人',
    // 自定义搜索
    'custom-search-submit': '获取随机页面',
    'custom-search-kind-label': '内容类型',
    'custom-search-kind-any': '任何',
    'custom-search-kind-scp': 'SCP',
    'custom-search-kind-tale': '故事',
    'custom-search-kind-goi': 'GoI',
    'custom-search-kind-art': '艺术',
    'custom-search-tags-label': '标签',
    'custom-search-author-label': '作者',
    'custom-search-tags-placeholder': 'euclid, 恐怖， 反模因',
    'custom-search-author-placeholder': '输入作者这里.',
    'custom-search-include-adult': '包含成人页面',
    'loading-custom-search': '正在下载随机页面...',
    'loaded-custom-search': '下载页面完成.',
    'error-custom-search-empty': '输入至少一个过滤器。',
    // 随机页面标题上方的标签
    'scp-label': 'SCP文章',
    'tale-label': '故事',
    'goi-label': 'GoI文章',
    'art-label': '艺术作品',
    'random-tag-label': '带有页面标签',
    // 随机页面详情
    'tags': '标签',
    'no-tags': '没有标签',
    'author': '作者',
    'rating': '评分',
    // 下载状态和错误
    'ready': '准备.',
    'loading-scp': '正在下载随机SCP...',
    'loading-tale': '正在下载随机故事...',
    'loading-goi': '正在下载随机GoI文章...',
    'loading-art': '正在下载随机艺术...',
    'loading-tag': '正在下载随机已标签的页面 "%%tag%%"...',
    'loaded-scp': '随机SCP加载成功。',
    'loaded-tale': '随机故事加载成功。',
    'loaded-goi': '随机GoI文章加载成功。',
    'loaded-art': '随机艺术加载成功。',
    'loaded-tag': '加载随机页面标签。 "%%tag%%".',
    'error-no-page': '未返回页面。',
    'error-unknown-kind': ' 未知随机化器类型。',
    'error-rate-limit': '评分上限到了。 请刷新 %%seconds%% 秒钟。',
    // 分部URL
    'wiki-url': 'http://scp-wiki-cn.wikidot.com',
  }
};

// Branches without an "artwork" Equivalent Tag
const disabledArt = ["fr", "pl", "cn"];

// Rate Limit
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
      
// Setting language with ?lang=(en,fr,vn...)
function getLang() {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get("lang");
  
  if (!lang || !TRANSLATIONS[lang]) {
    statusEl.textContent = "Error: Missing or invalid language. Please add ?lang=(en, fr, vn, cn, or pl) to the end of the URL.";
    throw new Error("Invalid language");
  }

  return lang;
}

// Displays Localized Text
function getMessage(language, key) {
  return TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.en?.[key] ?? key;
}

const language = getLang();

// Defaults to Excluding "_adult" on Startup
let includeAdultPages = false;

// Displays Inclusion/Exclusion of "_adult" Pages for User
function updateAdultToggleLabel(language) {
  if (!adultToggleBtn) return;

  adultToggleBtn.textContent = getMessage(
    language,
    includeAdultPages ? 'include-adult-on' : 'include-adult-off'
  );
  adultToggleBtn.setAttribute("aria-pressed", String(includeAdultPages));
  adultToggleBtn.classList.toggle("is-active", includeAdultPages);
}

function getAvailableContentTypeTags(language) {
  const tagMap = getTagMapForLanguage(language);

  const tags = [
    tagMap.scp,
    tagMap.tale,
    tagMap.goi,
  ];

  if (!disabledArt.includes(language) && tagMap.art) {
    tags.push(tagMap.art);
  }

  return [...new Set(tags.filter(Boolean))];
}

let customSearchIncludeAdultPages = false;

let customSearchIncludeTranslations = false;

let includeTranslations = false;

// Crom Data Citation
function buildCromDataLicenseEntry(record) {
  const title = record?.title || "Untitled";
  const authors = Array.isArray(record?.authors) && record.authors.length
    ? record.authors.join(", ")
    : "Unknown";
  const url = record?.url || "";

  return [
    `> **Filename:** Crom Data for "${title}"`,
    `> **Author:** ${authors}`,
    `> **License:** CC-BY-SA 3.0`,
    `> **Source:** ${url}`,
  ];
}

function updateTranslationToggleLabel(language) {
  if (!translationToggleBtn) return;

  translationToggleBtn.textContent = getMessage(
    language,
    includeTranslations ? 'include-translations-on' : 'include-translations-off'
  );

  translationToggleBtn.setAttribute("aria-pressed", String(includeTranslations));
  translationToggleBtn.classList.toggle("is-active", includeTranslations);
}

function updateCustomSearchTranslationToggle(language) {
  const show = language === "pl" || language === "vn";

  if (customSearchIncludeTranslationsBtn) {
    customSearchIncludeTranslationsBtn.hidden = !show;
    customSearchIncludeTranslationsBtn.setAttribute(
      "aria-pressed",
      String(customSearchIncludeTranslations)
    );
    customSearchIncludeTranslationsBtn.classList.toggle(
      "is-active",
      customSearchIncludeTranslations
    );
  }

  if (customSearchIncludeTranslationsLabel) {
    customSearchIncludeTranslationsLabel.hidden = !show;
    customSearchIncludeTranslationsLabel.textContent =
      getMessage(language, 'custom-search-include-translations');
  }
}

// Same as updateAdultToggleLabel, but for the Custom Search
function updateCustomSearchAdultToggle(language) {
  if (!customSearchIncludeAdultBtn) return;

  customSearchIncludeAdultBtn.setAttribute(
    "aria-pressed",
    String(customSearchIncludeAdultPages)
  );

  if (customSearchIncludeAdultLabel) {
    customSearchIncludeAdultLabel.textContent =
      getMessage(language, 'custom-search-include-adult');
  }
}

function pickRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

// Startup Layout
function initializeMessages(language) {
  document.documentElement.lang = language;

  document.getElementById('credit').textContent =
    getMessage(language, 'credit');
  
  document.getElementById('page-title').textContent =
    getMessage(language, 'title');
  
  document.getElementById('page-subtitle').textContent =
    getMessage(language, 'instructions');

  document.getElementById('tags-label').textContent =
    getMessage(language, 'tags');

  randomScpBtn.textContent = getMessage(language, 'scp-btn');
  randomTaleBtn.textContent = getMessage(language, 'tale-btn');
  randomGoiBtn.textContent = getMessage(language, 'goi-btn');

  if (disabledArt.includes(language.slice(0, 2))) { 
    randomArtBtn.classList.add("hidden");
    randomArtBtn.disabled = true;
  } else {
    randomArtBtn.textContent = getMessage(language, 'art-btn');
    randomArtBtn.classList.remove("hidden");
    randomArtBtn.disabled = false;
  }

  if (language === "pl" || language === "vn") {
    translationToggleBtn?.classList.remove("hidden");
  } else {
    translationToggleBtn?.classList.add("hidden");
  }

  // Custom Menu
  if (customSearchSubmitBtn) {
    customSearchSubmitBtn.textContent = getMessage(language, 'custom-search-submit');
  }

  const kindLabel = document.querySelector('label[for="custom-search-kind-select"]');
  const tagsLabel = document.querySelector('label[for="custom-search-tags-input"]');
  const authorLabel = document.querySelector('label[for="custom-search-author-input"]');

  if (kindLabel) {
    kindLabel.textContent = getMessage(language, 'custom-search-kind-label');
  }

  if (tagsLabel) {
    tagsLabel.textContent = getMessage(language, 'custom-search-tags-label');
  }

  if (authorLabel) {
    authorLabel.textContent = getMessage(language, 'custom-search-author-label');
  }

  if (customSearchKindSelect) {
    customSearchKindSelect.innerHTML = `
      <option value="any">${getMessage(language, 'custom-search-kind-any')}</option>
      <option value="scp">${getMessage(language, 'custom-search-kind-scp')}</option>
      <option value="tale">${getMessage(language, 'custom-search-kind-tale')}</option>
      <option value="goi">${getMessage(language, 'custom-search-kind-goi')}</option>
      ${disabledArt.includes(language) ? "" : `<option value="art">${getMessage(language, 'custom-search-kind-art')}</option>`}
    `;
  }

  if (customSearchTagsInput) {
    customSearchTagsInput.placeholder = getMessage(language, 'custom-search-tags-placeholder');
  }

  if (customSearchAuthorInput) {
    customSearchAuthorInput.placeholder = getMessage(language, 'custom-search-author-placeholder');
  }

  updateTranslationToggleLabel(language);
  updateCustomSearchTranslationToggle(language);
  updateAdultToggleLabel(language);
  updateCustomSearchAdultToggle(language);
  statusEl.textContent = getMessage(language, 'ready');
}

// Crom Query Structure (Main Buttons)
function buildRandomQuery(tag, language) {
  const wikiUrl = getMessage(language, 'wiki-url');
  const adultTag = getMessage(language, 'adult-tag');
  const noneTags = [];

  if (!includeAdultPages) {
    noneTags.push(adultTag);
  }

  if (language === "pl" && !includeTranslations) {
    noneTags.push("tłumaczenie");
  }

  const scpTag = getTagForKind("scp", language);
  if (tag === scpTag) {
    noneTags.push(...getMainlistScpExcludedTags(language));
  }

  const noneTagsFilter = noneTags.length
    ? `noneTags: ${JSON.stringify(noneTags)}`
    : "";

  return `
    query RandomPage {
      randomPage(
        filter: {
          allTags: ["${tag}"]
          anyBaseUrl: ["${wikiUrl}"]
          ${noneTagsFilter}
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

// Crom Query Structure (Custom Search)
function buildCustomRandomQuery(kind, tagsInput, authorInput, includeAdult, language) {
  const wikiUrl = getMessage(language, 'wiki-url');
  const adultTag = getMessage(language, 'adult-tag');

  const tags = tagsInput
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(Boolean);

  const author = authorInput.trim();

  let kindTag = getTagForKind(kind, language);

  if (kind === "any") {
    const availableContentTypeTags = getAvailableContentTypeTags(language);
    kindTag = pickRandomItem(availableContentTypeTags);
  }

  const filterParts = [
    `anyBaseUrl: ["${wikiUrl}"]`
  ];

  const allTags = [...tags];

  if (kindTag && !allTags.includes(kindTag)) {
    allTags.unshift(kindTag);
  }

  if (!tags.length && !author && !kindTag) {
    throw new Error(getMessage(language, 'error-custom-search-empty'));
  }

  if (allTags.length) {
    filterParts.push(`allTags: ${JSON.stringify(allTags)}`);
  }

  if (author) {
    filterParts.push(`allAttributedUsers: ${JSON.stringify([author])}`);
  }

  const noneTags = [];

  if (!includeAdult) {
    noneTags.push(adultTag);
  }

  if (language === "pl" && !customSearchIncludeTranslations) {
    noneTags.push("tłumaczenie");
  }

  const scpTag = getTagForKind("scp", language);
  const mainlistExcludedTags = getMainlistScpExcludedTags(language);
  const isExplicitScpContentType = kind === "scp" || kindTag === scpTag;

  if (isExplicitScpContentType && mainlistExcludedTags.length) {
    const userRequestedTags = new Set(tags);

    for (const excludedTag of mainlistExcludedTags) {
      if (!userRequestedTags.has(excludedTag)) {
        noneTags.push(excludedTag);
      }
    }
  }

  if (noneTags.length) {
    filterParts.push(`noneTags: ${JSON.stringify([...new Set(noneTags)])}`);
  }

  return {
    query: `
      query RandomPage {
        randomPage(
          filter: {
            ${filterParts.join('\n          ')}
          }
        ) {
          page {
            url
            alternateTitles { title }
            wikidotInfo { title rating tags thumbnailUrl source }
            attributions { user { name } }
          }
        }
      }
    `,
    selectedKindTag: kindTag,
  };
}

function getQueryForKind(kind, language) {
  const tag = getTagForKind(kind, language);
  return buildRandomQuery(tag, language);
}

function shouldUseTranslatedTags(language) {
  return language === "pl"
    ? includeTranslations
    : language === "vn"
    ? includeTranslations
    : false;
}

function getTagMapForLanguage(language) {
  if (shouldUseTranslatedTags(language) && TRANSLATED_TAG_MAP[language]) {
    return TRANSLATED_TAG_MAP[language];
  }

  return TAG_MAP[language] ?? TAG_MAP.en;
}

function getTagForKind(kind, language) {
  if (!kind || kind === "any") return null;

  const tagMap = getTagMapForLanguage(language);
  return tagMap[kind] ?? TAG_MAP.en[kind] ?? null;
}

function getKindForTag(tag, language) {
  const tagMap = TAG_MAP[language] ?? TAG_MAP.en;

  for (const [kind, mappedTag] of Object.entries(tagMap)) {
    if (mappedTag === tag) {
      return kind;
    }
  }

  return null;
}

function normalizeTags(tags) {
  return Array.isArray(tags) ? tags : [];
}

// Converts Crom URL from http:// to https://
function normalizePageUrl(url) {
  if (!url || typeof url !== "string") {
    return "#";
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === "http:") {
      parsedUrl.protocol = "https:";
    }
    return parsedUrl.toString();
  } catch {
    return url;
  }
}

// Removes Hidden and Crom Tags
function filterDisplayTags(tags) {
  return normalizeTags(tags).filter(tag =>
    typeof tag === "string" &&
    !tag.startsWith("_") &&
    !tag.startsWith("crom:")
  );
}

// Page Rating
function normalizeRating(rating) {
  if (rating === null || rating === undefined || rating === "") {
    return "N/A";
  }
  return String(rating);
}

// Removes Tags Between Queries
function clearTags() {
  tagsEl.innerHTML = "";
}

// Displays Tags. Users can Click a Tag to View a Randomly Selected Page Containing That Tag
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
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tag";
    button.textContent = tag;

    button.addEventListener("click", () => {
      fetchAndRenderRandomByTag(tag, language);
    });
    
    tagsEl.appendChild(button);
  }
}

// Crom API Query
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

// Extracts Preview Text from Source (See Line 4)
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

// Extracts Licensebox Text from Page Source
function extractLicensebox(source) {
  if (!source || typeof source !== "string") return null;

  // Standard Licensebox
  const normalMatch = source.match(
    /\[\[include\s+(?::[a-z0-9-]+:)?component:license-box(?:[^\]]*)\]\]([\s\S]*?)\[\[include\s+(?::[a-z0-9-]+:)?component:license-box-end\s*\]\]/i
  );

  if (normalMatch) {
    return cleanLicensebox(normalMatch[1]);
  }

  // Licensebox without [[component:license-box-end]]
  const startMatch = source.match(
    /\[\[include\s+(?::[a-z0-9-]+:)?component:license-box(?:[^\]]*)\]\]([\s\S]*)/i
  );

  if (!startMatch) return null;

  let body = startMatch[1];

  // Remove [[/div]] or [[/collapsible]]
  body = body
    .replace(/\[\[\/div\]\][\s\S]*$/i, "")
    .replace(/\[\[\/collapsible\]\][\s\S]*$/i, "");

  return cleanLicensebox(body);
}

function cleanLicensebox(text) {
  return text
    // Remove Licensebox Comments [!-- Example --]
    .replace(/\[!--[\s\S]*?--\]/g, "")

    // Remove Alignment Wrappers
    .replace(/^\s*\[\[(?:=|\/=|<|\/<|>|\/>)\]\]\s*$/gm, "")

    .trim();
}

// Trims ")" only if Similar to Nearby Punctuation, not part of URL (E.g. File:Cyclone_Oli_(2010).png)
function splitTrailingUrlPunctuation(rawHref) {
  let href = rawHref;
  let trailing = "";

  while (href.length > 0) {
    const last = href[href.length - 1];

    if (/[.;:!?]/.test(last)) {
      trailing = last + trailing;
      href = href.slice(0, -1);
      continue;
    }

    if (last === "," && !/%2c$/i.test(href)) {
      trailing = last + trailing;
      href = href.slice(0, -1);
      continue;
    }

    if (last === ")") {
      const openCount = (href.match(/\(/g) || []).length;
      const closeCount = (href.match(/\)/g) || []).length;

      if (closeCount > openCount) {
        trailing = last + trailing;
        href = href.slice(0, -1);
        continue;
      }
    }

    break;
  }

  return { href, trailing };
}

// Parse Wikitext to HTML
function wikidotToHtml(text) {
  const links = [];

  function stashLink(href, label) {
    const index = links.length;
    links.push({ href, label });
    return `@@LINK_${index}@@`;
  }

  let output = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    // Remove Quote Marker
    .replace(/^&gt;\s?/gm, "")

    // [[[https://example.com/path|Label]]]
    .replace(
      /\[\[\[(https?:\/\/[^\]|]+)\|([^\]]+)\]\]\]/g,
      (_, href, label) => stashLink(href, label)
    )

    // [[[https://example.com/path]]]
    .replace(
      /\[\[\[(https?:\/\/[^\]]+)\]\]\]/g,
      (_, href) => stashLink(href, href)
    )

    // [https://example.com Label]
    .replace(
      /\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]/g,
      (_, href, label) => stashLink(href, label)
    )

    // [https://example.com]
    .replace(
      /\[(https?:\/\/[^\s\]]+)\]/g,
      (_, href) => stashLink(href, href)
    )

    // (&lt;https://example.com&gt)
    .replace(
      /&lt;(https?:\/\/[^&]+)&gt;/g,
      (_, href) => stashLink(href, href)
    )

    // Bare URL
    .replace(
      /(^|[\s(])((?:https?:\/\/)[^\s<]+)/g,
      (_, prefix, rawHref) => {
        const { href, trailing } = splitTrailingUrlPunctuation(rawHref);
        return `${prefix}${stashLink(href, href)}${trailing}`;
      }
    )

    // [[*user username]]
    .replace(
      /\[\[\*user\s+([^\]]+)\]\]/gi,
      '<span class="wikidot-user">$1</span>'
    )

    // **bold**
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  for (let i = 0; i < links.length; i += 1) {
    const { href, label } = links[i];

    output = output.replace(
      `@@LINK_${i}@@`,
      `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`
    );
  }

  return output;
}

function isLicenseboxField(line, fieldName) {
  const escapedField = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return new RegExp(
    `^>\\s*\\*\\*${escapedField}:\\*\\*`,
    "i"
  ).test(line);
}

// Detects Separator between Entries
function isEntryHeading(line) {
  return (
    /^\*\*.+?\*\*(?:\s*[-–—].*)?$/.test(line) &&
    !/^\*\*[^*]+:\*\*/.test(line) &&
    !/^>\s*\*\*[^*]+:\*\*/.test(line)
  );
}

// Separate Licensebox Entries
function splitLicenseboxEntries(licensebox) {
  const lines = licensebox
    .split(/\r?\n/)
    .map(line => line.trim());

  const entries = [];
  let current = [];
  let currentHasSourceLink = false;

  function pushCurrent() {
    const cleaned = current.filter(Boolean);

    if (cleaned.length) {
      entries.push(cleaned);
    }

    current = [];
    currentHasSourceLink = false;
  }

  for (const line of lines) {
    if (!line) {
      current.push(line);
      continue;
    }

    if (/^(=+|-{4,})$/.test(line)) {
      pushCurrent();
      continue;
    }

    const startsNewHeadingEntry = isEntryHeading(line) && current.filter(Boolean).length > 0;

    const startsRepeatedFilenameEntry =
      isLicenseboxField(line, "Filename") &&
      current.filter(Boolean).length > 0 &&
      currentHasSourceLink;

    if (startsNewHeadingEntry || startsRepeatedFilenameEntry) {
      pushCurrent();
    }

    current.push(line);

    if (isLicenseboxField(line, "Source Link") || isLicenseboxField(line, "Source")) {
      currentHasSourceLink = true;
    }
  }

  pushCurrent();

  return entries;
}

// Display Licensebox
function renderLicensebox(record) {
  if (!licenseboxEl) return;

  licenseboxEl.innerHTML = "";
  licenseboxEl.classList.add("hidden");

  const source = record?.source || "";
  const licensebox = extractLicensebox(source);

  const entries = licensebox
    ? splitLicenseboxEntries(licensebox)
    : [];

  const firstEntry = entries[0] || [];
  const cromDataEntry = buildCromDataLicenseEntry(record);

  licenseboxEl.classList.remove("hidden");

  // Closed Collapsible by Default
  const details = document.createElement("details");
  details.className = "licensebox-details";

  // Create Licensebox Header
  const summary = document.createElement("summary");
  summary.className = "licensebox-summary";
  summary.textContent = " Licensing / Citation";

  details.appendChild(summary);

  // Determines whether Article contains Thumbnail Image, Adds Image License
  if (firstEntry.length) {
    const imageSection = document.createElement("section");
    imageSection.className = "licensebox-entry";

    for (const line of firstEntry) {
      const row = document.createElement("p");
      row.innerHTML = wikidotToHtml(line);
      imageSection.appendChild(row);
    }

    details.appendChild(imageSection);
  }

  // If Image is Present, add Crom Data Citation below Image
  const cromSection = document.createElement("section");
  cromSection.className = "licensebox-entry licensebox-entry-crom";

  for (const line of cromDataEntry) {
    const row = document.createElement("p");
    row.innerHTML = wikidotToHtml(line);
    cromSection.appendChild(row);
  }

  details.appendChild(cromSection);
  licenseboxEl.appendChild(details);
}

// Stores Info from Crom Query
function mapCromPageToRecord(page) {
  const source = page?.wikidotInfo?.source ?? "";
  
  return {
    url: normalizePageUrl(page?.url),
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

// Displays Random Page Info
function renderResult(record, kind, language, activeTag = null) {
  if (!record) {
    statusEl.textContent = getMessage(language, 'error-no-page');
    return;
  }

  const title = record.title || "Untitled";
  const alternateTitle = record.alternateTitle || "";
  const tags = filterDisplayTags(record.tags);
  const rating = normalizeRating(record.rating);
  const previewText = record.previewText || "";

  // Label Above Title
  if (kind === "tag") {
    typeEl.textContent = activeTag
      ? `${getMessage(language, 'random-tag-label')}: ${activeTag}`
      : getMessage(language, 'custom-search-kind-any');
  } else {
    typeEl.textContent =
      kind === "scp"
        ? getMessage(language, 'scp-label')
        : kind === "tale"
        ? getMessage(language, 'tale-label')
        : kind === "goi"
        ? getMessage(language, 'goi-label')
        : getMessage(language, 'art-label');
  }

  // Hyperlink for Title
  titleEl.innerHTML = "";
  const link = document.createElement("a");
  link.href = record.url || "#";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = title;
  titleEl.appendChild(link);

  // Author
  const authorText =
    Array.isArray(record.authors) && record.authors.length
      ? ` | ${getMessage(language, 'author')}: ${record.authors.join(", ")}`
      : "";

  // Rating
  ratingEl.textContent = `${getMessage(language, 'rating')}: ${rating}${authorText}`;

  // Alternate Title (If Applicable)
  if (alternateTitle) {
    altTitleEl.textContent = alternateTitle;
    altTitleEl.classList.remove("hidden");
  } else {
    altTitleEl.textContent = "";
    altTitleEl.classList.add("hidden");
  }

  // Preview Text (If Applicable)
  if (previewText) {
    previewEl.textContent = previewText;
    previewEl.classList.remove("hidden");
  } else {
    previewEl.textContent = "";
    previewEl.classList.add("hidden");
  }

  // Thumbnail (If Applicable)
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

  // Tags
  renderTags(tags, language);
  cardEl.classList.remove("hidden");

  // Licensebox
  renderLicensebox(record);
}

// Top Buttons Functionality
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

// Tag Button Functionality
async function fetchAndRenderRandomByTag(tag, language) {
  const rateLimit = checkRateLimit();

  if (!rateLimit.allowed) {
    const waitSeconds = Math.ceil(rateLimit.waitMs / 1000);
    statusEl.textContent = getMessage(language, 'error-rate-limit')
      .replace('%%seconds%%', waitSeconds);
    return;
  }

  try {
    statusEl.textContent = getMessage(language, 'loading-tag')
      .replace("%%tag%%", tag);

    const query = buildRandomQuery(tag, language);
    const data = await cromApiRequest(query);
    const page = data?.randomPage?.page;

    if (!page) {
      throw new Error(getMessage(language, 'error-no-page'));
    }

    renderResult(mapCromPageToRecord(page), "tag", language, tag);
    statusEl.textContent = getMessage(language, 'loaded-tag')
      .replace("%%tag%%", tag);
  } catch (error) {
    console.error(error);
    statusEl.textContent = error.message;
  }
}

// Custom Menu Functionality
async function fetchAndRenderCustomRandom(kind, tagsInput, authorInput, includeAdult, language) {
  const rateLimit = checkRateLimit();

  if (!rateLimit.allowed) {
    const waitSeconds = Math.ceil(rateLimit.waitMs / 1000);
    statusEl.textContent = getMessage(language, 'error-rate-limit')
      .replace('%%seconds%%', waitSeconds);
    return;
  }

  try {
    statusEl.textContent = getMessage(language, 'loading-custom-search');

    const customQuery = buildCustomRandomQuery(
      kind,
      tagsInput,
      authorInput,
      includeAdult,
      language
    );

    const data = await cromApiRequest(customQuery.query);
    const page = data?.randomPage?.page;

    if (!page) {
      throw new Error(getMessage(language, 'error-no-page'));
    }

    const selectedKind =
      kind === "any"
      ? getKindForTag(customQuery.selectedKindTag, language)
      : kind;

    renderResult(
      mapCromPageToRecord(page),
      selectedKind || "tag",
      language
    );

    statusEl.textContent = getMessage(language, 'loaded-custom-search');
  } catch (error) {
    console.error(error);
    statusEl.textContent = error.message;
  }
}

// Allows for Auto-Redirect to a Random Page using ?random=(scp,tale,goi,art)&lang=(en,fr,vn...). Enabled by checkAutoRedirect()
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
      window.location.replace(normalizePageUrl(page.url));
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

// Top Button Triggers
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

adultToggleBtn?.addEventListener("click", () => {
  includeAdultPages = !includeAdultPages;
  updateAdultToggleLabel(language);
});

translationToggleBtn?.addEventListener("click", () => {
  includeTranslations = !includeTranslations;
  updateTranslationToggleLabel(language);
  initializeMessages(language);
});

// Custom Menu Triggers
menuToggleBtn?.addEventListener("click", () => {
  if (!menuPanel || !menuToggleBtn) return;
  const isOpen = !menuPanel.classList.contains("hidden");

  menuPanel.classList.toggle("hidden");
  menuToggleBtn.classList.toggle("hidden", !isOpen);
  menuToggleBtn.setAttribute("aria-expanded", String(!isOpen));
});

menuCloseBtn?.addEventListener("click", () => {
  if (!menuPanel || !menuToggleBtn) return;
  
  menuPanel.classList.add("hidden");
  menuToggleBtn.classList.remove("hidden");
  menuToggleBtn.setAttribute("aria-expanded", "false");
});

customSearchIncludeAdultBtn?.addEventListener("click", () => {
  customSearchIncludeAdultPages = !customSearchIncludeAdultPages;
  updateCustomSearchAdultToggle(language);
});

customSearchIncludeTranslationsBtn?.addEventListener("click", () => {
  customSearchIncludeTranslations = !customSearchIncludeTranslations;
  includeTranslations = customSearchIncludeTranslations;

  updateTranslationToggleLabel(language);
  updateCustomSearchTranslationToggle(language);
  initializeMessages(language);
});

customSearchSubmitBtn?.addEventListener("click", () => {
  const kind = customSearchKindSelect?.value ?? "";
  const tagsInput = customSearchTagsInput?.value ?? "";
  const authorInput = customSearchAuthorInput?.value ?? "";

  fetchAndRenderCustomRandom(
    kind,
    tagsInput,
    authorInput,
    customSearchIncludeAdultPages,
    language
  );
});

customSearchTagsInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const kind = customSearchKindSelect?.value ?? "";
    const tagsInput = customSearchTagsInput?.value ?? "";
    const authorInput = customSearchAuthorInput?.value ?? "";

    fetchAndRenderCustomRandom(
      kind,
      tagsInput,
      authorInput,
      customSearchIncludeAdultPages,
      language
    );
  }
});

customSearchAuthorInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const kind = customSearchKindSelect?.value ?? "";
    const tagsInput = customSearchTagsInput?.value ?? "";
    const authorInput = customSearchAuthorInput?.value ?? "";

    fetchAndRenderCustomRandom(
      kind,
      tagsInput,
      authorInput,
      customSearchIncludeAdultPages,
      language
    );
  }
});

customSearchKindSelect?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const kind = customSearchKindSelect?.value ?? "";
    const tagsInput = customSearchTagsInput?.value ?? "";
    const authorInput = customSearchAuthorInput?.value ?? "";

    fetchAndRenderCustomRandom(
      kind,
      tagsInput,
      authorInput,
      customSearchIncludeAdultPages,
      language
    );
  }
});
