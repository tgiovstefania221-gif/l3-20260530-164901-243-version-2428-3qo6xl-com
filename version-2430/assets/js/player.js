(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-player-start]');
    var src = box.getAttribute('data-src');
    var ready = false;

    var start = function () {
      if (!video || !src) {
        return;
      }

      if (!ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          ready = true;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
          ready = true;
        } else {
          video.src = src;
          ready = true;
        }
      }

      box.classList.add('is-playing');
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    };

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          start();
        }
      });
    }
  });
})();
