document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var regionSelect = document.querySelector('[data-region-filter]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

  function applyFilter() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var region = regionSelect ? regionSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';

    cards.forEach(function (card) {
      var content = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.getAttribute('data-year')
      ].join(' ').toLowerCase();

      var matchedKeyword = !keyword || content.indexOf(keyword) !== -1;
      var matchedRegion = !region || card.getAttribute('data-region') === region;
      var matchedYear = !year || card.getAttribute('data-year') === year;
      card.classList.toggle('hidden-card', !(matchedKeyword && matchedRegion && matchedYear));
    });
  }

  [searchInput, regionSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    }
  });
});
