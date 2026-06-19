(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var data = window.MOVIE_SEARCH_DATA || [];

  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  if (input) {
    input.value = initial;
  }

  var escapeHtml = function (value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  var render = function (keyword) {
    var query = String(keyword || '').trim().toLowerCase();
    var list = data.filter(function (item) {
      if (!query) {
        return true;
      }
      var merged = [item.title, item.year, item.region, item.type, item.genre, item.oneLine].concat(item.tags || []).join(' ').toLowerCase();
      return merged.indexOf(query) !== -1;
    }).slice(0, 120);

    if (!list.length) {
      results.innerHTML = '<div class="search-empty">没有找到匹配剧集</div>';
      return;
    }

    results.innerHTML = list.map(function (item) {
      return '<article class="movie-card">'
        + '<a class="poster" href="' + escapeHtml(item.href) + '">'
        + '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">'
        + '<span class="poster-badge">' + escapeHtml(item.year) + '</span>'
        + '</a>'
        + '<div class="card-body">'
        + '<a class="card-title" href="' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a>'
        + '<p>' + escapeHtml(item.oneLine) + '</p>'
        + '<div class="card-meta"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.region) + '</span></div>'
        + '</div>'
        + '</article>';
    }).join('');
  };

  if (form && input) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input.value);
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set('q', input.value.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
    });

    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  render(initial);
})();
