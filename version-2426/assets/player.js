let hlsLoader = null;

function loadHls() {
  if (window.Hls) {
    return Promise.resolve(window.Hls);
  }
  if (hlsLoader) {
    return hlsLoader;
  }
  hlsLoader = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
    script.async = true;
    script.onload = () => resolve(window.Hls || null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
  return hlsLoader;
}

export async function setupPlayer(url, videoId, overlayId) {
  const video = document.getElementById(videoId);
  const overlay = document.getElementById(overlayId);
  if (!video || !url) {
    return;
  }
  let attached = false;
  const attach = async () => {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.load();
      return;
    }
    const Hls = await loadHls();
    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      return;
    }
    video.src = url;
    video.load();
  };
  const play = async () => {
    await attach();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    try {
      await video.play();
    } catch (error) {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    }
  };
  if (overlay) {
    overlay.addEventListener("click", play);
  }
  video.addEventListener("click", () => {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", () => {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
  await attach();
}
