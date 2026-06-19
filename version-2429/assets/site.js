const menuButton = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("is-open");
  });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  let activeIndex = 0;
  let timer = null;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, itemIndex) => {
      slide.classList.toggle("is-active", itemIndex === activeIndex);
    });

    dots.forEach((dot, itemIndex) => {
      dot.classList.toggle("is-active", itemIndex === activeIndex);
    });
  };

  const start = () => {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(() => {
      showSlide(activeIndex + 1);
    }, 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      stop();
      showSlide(index);
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  start();
}

const normalize = (value) => {
  return String(value || "").toLowerCase().trim();
};

const panels = document.querySelectorAll("[data-filter-panel]");

panels.forEach((panel) => {
  const controls = Array.from(panel.querySelectorAll("[data-card-filter]"));
  const section = panel.closest("section") || document;
  const cards = Array.from(section.querySelectorAll("[data-movie-card]"));
  const empty = section.querySelector("[data-empty-state]");

  const applyFilters = () => {
    const filters = new Map();

    controls.forEach((control) => {
      filters.set(control.dataset.cardFilter, normalize(control.value));
    });

    let visible = 0;

    cards.forEach((card) => {
      const keyword = filters.get("keyword") || "";
      const type = filters.get("type") || "";
      const year = filters.get("year") || "";
      const content = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.year,
        card.dataset.type
      ].join(" "));

      const matchesKeyword = !keyword || content.includes(keyword);
      const matchesType = !type || normalize(card.dataset.type) === type;
      const matchesYear = !year || normalize(card.dataset.year) === year;
      const isVisible = matchesKeyword && matchesType && matchesYear;

      card.hidden = !isVisible;

      if (isVisible) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  };

  controls.forEach((control) => {
    control.addEventListener("input", applyFilters);
    control.addEventListener("change", applyFilters);
  });
});
