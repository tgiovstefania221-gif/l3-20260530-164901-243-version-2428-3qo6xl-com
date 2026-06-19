document.addEventListener("DOMContentLoaded", function () {
    setupNavigation();
    setupHeroCarousel();
    setupFilters();
    setupImageFallbacks();
    setupPlayers();
});

function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var header = document.querySelector(".site-header");

    if (!toggle || !header) {
        return;
    }

    toggle.addEventListener("click", function () {
        header.classList.toggle("is-open");
    });
}

function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
        return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === active);
        });
    }

    function restart() {
        if (timer) {
            clearInterval(timer);
        }
        timer = setInterval(function () {
            show(active + 1);
        }, 5000);
    }

    if (prev) {
        prev.addEventListener("click", function () {
            show(active - 1);
            restart();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            show(active + 1);
            restart();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            show(index);
            restart();
        });
    });

    if (slides.length > 1) {
        restart();
    }
}

function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-filter-grid]");

    if (!panel || !grid) {
        return;
    }

    var input = panel.querySelector(".filter-search");
    var region = panel.querySelector(".filter-region");
    var type = panel.querySelector(".filter-type");
    var year = panel.querySelector(".filter-year");
    var count = panel.querySelector("[data-result-count]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input && initialQuery) {
        input.value = initialQuery;
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        var query = normalize(input ? input.value : "");
        var selectedRegion = normalize(region ? region.value : "");
        var selectedType = normalize(type ? type.value : "");
        var selectedYear = normalize(year ? year.value : "");
        var visible = 0;

        cards.forEach(function (card) {
            var searchText = normalize(card.getAttribute("data-search"));
            var cardRegion = normalize(card.getAttribute("data-region"));
            var cardType = normalize(card.getAttribute("data-type"));
            var cardYear = normalize(card.getAttribute("data-year"));
            var matchesQuery = !query || searchText.indexOf(query) !== -1;
            var matchesRegion = !selectedRegion || cardRegion === selectedRegion;
            var matchesType = !selectedType || cardType === selectedType;
            var matchesYear = !selectedYear || cardYear === selectedYear;
            var isVisible = matchesQuery && matchesRegion && matchesType && matchesYear;

            card.classList.toggle("is-hidden", !isVisible);

            if (isVisible) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = String(visible);
        }
    }

    [input, region, type, year].forEach(function (control) {
        if (control) {
            control.addEventListener("input", applyFilters);
            control.addEventListener("change", applyFilters);
        }
    });

    applyFilters();
}

function setupImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll("[data-fallback-image]"));

    images.forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("image-missing");
        });
    });
}

function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (shell) {
        var video = shell.querySelector("video");
        var button = shell.querySelector("[data-player-button]");
        var message = shell.querySelector("[data-player-message]");
        var source = shell.getAttribute("data-src");
        var hlsInstance = null;

        if (!video || !button || !source) {
            return;
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }

        function attachSource() {
            if (video.dataset.loaded === "true") {
                return Promise.resolve();
            }

            video.dataset.loaded = "true";
            setMessage("正在加载播放源…");

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);

                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setMessage("");
                });

                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setMessage("网络波动，正在重试…");
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setMessage("媒体解码异常，正在恢复…");
                        hlsInstance.recoverMediaError();
                    } else {
                        setMessage("播放源暂时不可用，请稍后重试。");
                        hlsInstance.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                setMessage("");
            } else {
                setMessage("当前浏览器不支持 HLS 播放，请更换浏览器。 ");
            }

            return Promise.resolve();
        }

        button.addEventListener("click", function () {
            attachSource().then(function () {
                shell.classList.add("is-playing");
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        setMessage("浏览器阻止了自动播放，请再次点击视频控制栏播放。");
                    });
                }
            });
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}
