(function () {
  var nav = document.querySelector('[data-nav]');
  var toggle = document.querySelector('[data-nav-toggle]');
  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    var show = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  var filterScope = document.querySelector('[data-filter-scope]');
  if (filterScope) {
    var input = filterScope.querySelector('[data-filter-input]');
    var yearSelect = filterScope.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    var apply = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var genre = (card.getAttribute('data-genre') || '').toLowerCase();
        var region = (card.getAttribute('data-region') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var textHit = !keyword || title.indexOf(keyword) !== -1 || genre.indexOf(keyword) !== -1 || region.indexOf(keyword) !== -1;
        var yearHit = !year || cardYear === year;
        card.style.display = textHit && yearHit ? '' : 'none';
      });
    };

    if (input) {
      input.addEventListener('input', apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
  }
})();
