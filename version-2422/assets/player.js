(function () {
    document.querySelectorAll('.player-wrap').forEach(function (wrap) {
        var video = wrap.querySelector('video');
        var button = wrap.querySelector('.center-play');
        var message = wrap.querySelector('.player-message');
        var stream = video ? video.getAttribute('data-stream') : '';
        var hls = null;

        function showMessage(text) {
            if (message) {
                message.textContent = text;
            }
            wrap.classList.add('is-error');
        }

        function prepare() {
            if (!video || !stream || video.getAttribute('data-ready') === '1') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.setAttribute('data-ready', '1');
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage('播放暂时不可用');
                    }
                });
                video.setAttribute('data-ready', '1');
                return;
            }

            showMessage('播放暂时不可用');
        }

        function playVideo() {
            prepare();
            if (!video || wrap.classList.contains('is-error')) {
                return;
            }
            var started = video.play();
            if (started && started.catch) {
                started.catch(function () {
                    wrap.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                playVideo();
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener('play', function () {
                wrap.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                wrap.classList.remove('is-playing');
            });
            video.addEventListener('ended', function () {
                wrap.classList.remove('is-playing');
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
})();
