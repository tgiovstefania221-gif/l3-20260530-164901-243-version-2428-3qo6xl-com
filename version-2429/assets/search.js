const params = new URLSearchParams(window.location.search);
const queryInput = document.getElementById("search-query");
const results = document.getElementById("search-results");
const empty = document.getElementById("search-empty");
const query = (params.get("q") || "").trim();

if (queryInput) {
  queryInput.value = query;
}

const normalizeSearchText = (value) => {
  return String(value || "").toLowerCase().trim();
};

const makeCard = (item) => {
  const article = document.createElement("article");
  article.className = "movie-card";

  article.innerHTML = `
    <a class="poster-wrap" href="${item.url}">
      <img src="${item.cover}" alt="${item.title}" loading="lazy">
      <span class="play-dot">▶</span>
    </a>
    <div class="card-content">
      <h2><a href="${item.url}">${item.title}</a></h2>
      <p>${item.description}</p>
      <div class="card-meta">
        <span>${item.year}</span>
        <span>${item.type}</span>
        <span>${item.region}</span>
      </div>
      <div class="tag-row">
        <span>${item.category}</span>
        <span>${item.genre}</span>
      </div>
    </div>
  `;

  return article;
};

const renderResults = () => {
  if (!results || !Array.isArray(window.searchIndex)) {
    return;
  }

  results.innerHTML = "";

  const words = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  const items = window.searchIndex.filter((item) => {
    if (!words.length) {
      return true;
    }

    const text = normalizeSearchText([
      item.title,
      item.description,
      item.region,
      item.type,
      item.year,
      item.genre,
      item.category,
      item.tags
    ].join(" "));

    return words.every((word) => text.includes(word));
  }).slice(0, 120);

  items.forEach((item) => {
    results.appendChild(makeCard(item));
  });

  if (empty) {
    empty.hidden = items.length !== 0;
  }
};

renderResults();
