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

const CROM_QUERIES = {
  scp: `
    query RandomArticle {
      randomPage(
        filter: {
          allTags: ["scp"]
          anyBaseUrl: ["http://scp-wiki.wikidot.com"]
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
  `,
  tale: `
    query RandomTale {
      randomPage(
        filter: {
          allTags: ["tale"]
          anyBaseUrl: ["http://scp-wiki.wikidot.com"]
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
  `,
    art: `
    query RandomTale {
      randomPage(
        filter: {
          allTags: ["artwork"]
          anyBaseUrl: ["http://scp-wiki.wikidot.com"]
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
  `,
  goi: `
    query RandomGoi {
      randomPage(
        filter: {
          allTags: ["goi-format"]
          anyBaseUrl: ["http://scp-wiki.wikidot.com"]
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
  `
};

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

function renderResult(record, kind) {
  if (!record) {
    statusEl.textContent = `No ${kind} entries available.`;
    return;
  }

  const title = record.title || "Untitled";
  const tags = normalizeTags(record.tags);
  const rating = normalizeRating(record.rating);

  typeEl.textContent =
    kind === "scp"
      ? "SCP Article"
      : kind === "tale"
      ? "Tale"
      : "GoI";

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
      ? ` | Authors: ${record.authors.join(", ")}`
      : "";

  ratingEl.textContent = `Rating: ${rating}${authorText}`;
  renderTags(tags);
  cardEl.classList.remove("hidden");
}

async function fetchAndRenderRandom(kind) {
  try {
    statusEl.textContent = `Loading random ${kind}...`;

    const query = CROM_QUERIES[kind];
    if (!query) {
      throw new Error(`Unknown randomizer type: ${kind}`);
    }

    const data = await cromApiRequest(query);
    const page = data?.randomPage?.page;

    if (!page) {
      throw new Error(`Crom returned no ${kind} page.`);
    }

    renderResult(mapCromPageToRecord(page), kind);
    statusEl.textContent = `Loaded random ${kind}.`;
  } catch (error) {
    console.error(error);
    statusEl.textContent = error.message;
  }
}

randomScpBtn.addEventListener("click", () => {
  fetchAndRenderRandom("scp");
});

randomTaleBtn.addEventListener("click", () => {
  fetchAndRenderRandom("tale");
});

randomTaleBtn.addEventListener("click", () => {
  fetchAndRenderRandom("art");
});

randomGoiBtn.addEventListener("click", () => {
  fetchAndRenderRandom("goi");
});

statusEl.textContent = "Ready.";
