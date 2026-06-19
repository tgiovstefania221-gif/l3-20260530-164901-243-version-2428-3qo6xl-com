(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var next = panel.hasAttribute('hidden');
        if (next) {
          panel.removeAttribute('hidden');
          toggle.textContent = '×';
        } else {
          panel.setAttribute('hidden', '');
          toggle.textContent = '☰';
        }
        toggle.setAttribute('aria-expanded', String(next));
      });
    }

    document.querySelectorAll('form[role="search"]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (input && !input.value.trim()) {
          event.preventDefault();
          input.focus();
        }
      });
    });

    var slider = document.querySelector('.hero-slider');
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
      var index = 0;
      var timer = null;

      function setSlide(next) {
        if (!slides.length) return;
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          setSlide(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          setSlide(Number(dot.getAttribute('data-target')) || 0);
          start();
        });
      });
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      start();
    }

    document.querySelectorAll('.filter-bar').forEach(function (bar) {
      var input = bar.querySelector('.page-filter-input');
      var scope = bar.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.filter-card'));
      var chips = Array.prototype.slice.call(bar.querySelectorAll('.filter-chip'));
      var activeChip = '';

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var type = (card.getAttribute('data-type') || '').toLowerCase();
          var okQuery = !query || text.indexOf(query) !== -1;
          var okChip = !activeChip || text.indexOf(activeChip) !== -1 || type.indexOf(activeChip) !== -1;
          card.style.display = okQuery && okChip ? '' : 'none';
        });
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && !input.value) {
          input.value = q;
        }
        input.addEventListener('input', apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (item) {
            item.classList.remove('active');
          });
          chip.classList.add('active');
          activeChip = (chip.getAttribute('data-chip') || '').toLowerCase();
          apply();
        });
      });

      apply();
    });
  });
})();
