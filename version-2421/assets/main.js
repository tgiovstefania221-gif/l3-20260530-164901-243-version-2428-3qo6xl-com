(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  var slides = document.querySelectorAll('.hero-card');
  if (slides.length > 1) {
    var active = 0;
    setInterval(function () {
      slides[active].classList.remove('active');
      active = (active + 1) % slides.length;
      slides[active].classList.add('active');
    }, 5200);
  }

  var searchForm = document.querySelector('.hero-search');
  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = searchForm.querySelector('input');
      var keyword = input ? input.value.trim() : '';
      if (keyword) {
        location.href = 'search.html?q=' + encodeURIComponent(keyword);
      }
    });
  }

  var filters = document.querySelector('[data-filter-box]');
  if (filters) {
    var keywordInput = filters.querySelector('[data-filter-keyword]');
    var yearSelect = filters.querySelector('[data-filter-year]');
    var regionSelect = filters.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var params = new URLSearchParams(location.search);
    var initial = params.get('q') || '';
    if (keywordInput && initial) {
      keywordInput.value = initial;
    }
    var apply = function () {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var meta = [
          card.getAttribute('data-year') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || ''
        ].join(' ').toLowerCase();
        var okKeyword = !keyword || title.indexOf(keyword) >= 0 || meta.indexOf(keyword) >= 0;
        var okYear = !year || (card.getAttribute('data-year') || '') === year;
        var okRegion = !region || (card.getAttribute('data-region') || '').indexOf(region) >= 0;
        card.style.display = okKeyword && okYear && okRegion ? '' : 'none';
      });
    };
    [keywordInput, yearSelect, regionSelect].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
    apply();
  }

  var playButton = document.querySelector('[data-play-url]');
  if (playButton) {
    playButton.addEventListener('click', function () {
      var video = document.querySelector('.movie-player');
      var url = playButton.getAttribute('data-play-url');
      if (!video || !url) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = url;
        video.play().catch(function () {});
      }
    });
  }
})();
