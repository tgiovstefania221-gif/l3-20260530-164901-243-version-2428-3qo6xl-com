(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.nav-toggle');

    if (header && toggle) {
        toggle.addEventListener('click', function () {
            var opened = header.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            if (slides.length < 2) {
                return;
            }
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        var input = root.querySelector('[data-search-input]');
        var year = root.querySelector('[data-year-filter]');
        var region = root.querySelector('[data-region-filter]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
        var empty = root.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            var selectedYear = normalize(year ? year.value : '');
            var selectedRegion = normalize(region ? region.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year')
                ].join(' '));
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
                var matchRegion = !selectedRegion || normalize(card.getAttribute('data-region')) === selectedRegion;
                var matched = matchQuery && matchYear && matchRegion;

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        [input, year, region].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    });
})();
