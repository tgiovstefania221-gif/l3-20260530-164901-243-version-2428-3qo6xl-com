import { H as Hls } from "./hls.js";

export function initMoviePlayer(source, poster) {
  const video = document.getElementById("movie-video");
  const cover = document.querySelector("[data-player-cover]");

  if (!video || !source) {
    return;
  }

  if (poster) {
    video.setAttribute("poster", poster);
  }

  let hls = null;
  let started = false;

  const attachSource = () => {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
    }
  };

  const playVideo = () => {
    video.controls = true;
    const result = video.play();

    if (result && typeof result.catch === "function") {
      result.catch(() => {
        video.controls = true;
      });
    }
  };

  const startPlayback = () => {
    if (!started) {
      started = true;
      attachSource();

      if (cover) {
        cover.hidden = true;
      }

      if (hls) {
        hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
        window.setTimeout(playVideo, 600);
      } else {
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        window.setTimeout(playVideo, 250);
      }

      return;
    }

    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  };

  if (cover) {
    cover.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", startPlayback);
}
