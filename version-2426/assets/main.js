document.addEventListener("DOMContentLoaded", () => {
  bindMobileMenu();
  bindSiteSearch();
  bindHeroSlider();
  bindFilters();
});

function bindMobileMenu() {
  const toggle = document.querySelector("[data-mobile-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener("click", () => {
    panel.classList.toggle("is-open");
  });
}

function bindSiteSearch() {
  document.querySelectorAll("[data-site-search]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input[name='q']");
      const value = input ? input.value.trim() : "";
      const target = value ? `./library.html?q=${encodeURIComponent(value)}` : "./library.html";
      window.location.href = target;
    });
  });
}

function bindHeroSlider() {
  const slider = document.querySelector("[data-hero-slider]");
  if (!slider) {
    return;
  }
  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  const dots = Array.from(slider.querySelectorAll(".hero-dot"));
  if (slides.length <= 1) {
    return;
  }
  let current = 0;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
  };
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => show(index));
  });
  window.setInterval(() => show(current + 1), 5200);
}

function bindFilters() {
  const input = document.querySelector("[data-filter-search]");
  const yearSelect = document.querySelector("[data-filter-year]");
  const regionSelect = document.querySelector("[data-filter-region]");
  const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
  if (!cards.length) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  if (input && query) {
    input.value = query;
  }
  const apply = () => {
    const keyword = input ? input.value.trim().toLowerCase() : "";
    const year = yearSelect ? yearSelect.value : "";
    const region = regionSelect ? regionSelect.value : "";
    cards.forEach((card) => {
      const text = (card.dataset.title || "").toLowerCase();
      const cardYear = card.dataset.year || "";
      const cardRegion = card.dataset.region || "";
      const matched = (!keyword || text.includes(keyword)) && (!year || cardYear === year) && (!region || cardRegion === region);
      card.classList.toggle("is-hidden", !matched);
    });
  };
  [input, yearSelect, regionSelect].forEach((element) => {
    if (element) {
      element.addEventListener("input", apply);
      element.addEventListener("change", apply);
    }
  });
  apply();
}
