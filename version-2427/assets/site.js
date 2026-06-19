
(function () {
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function toLower(v) { return (v || '').toString().toLowerCase(); }

  function initSearchIndex() {
    if (!window.MOVIE_INDEX || !Array.isArray(window.MOVIE_INDEX)) return;
    const input = $('[data-search-input]');
    const box = $('[data-search-results]');
    if (!input || !box) return;

    let timer = null;
    const render = (list) => {
      if (!list.length) {
        box.innerHTML = '<div class="muted">没有找到匹配的影片，试试换个关键词。</div>';
        return;
      }
      box.innerHTML = list.slice(0, 12).map(item => `
        <a href="${item.slug}">
          <strong>${item.title}</strong>
          <div class="muted">${item.year} · ${item.region} · ${item.type} · ${item.genre}</div>
        </a>
      `).join('');
    };

    const doSearch = () => {
      const q = toLower(input.value.trim());
      if (!q) {
        box.innerHTML = '';
        return;
      }
      const terms = q.split(/\s+/).filter(Boolean);
      const list = window.MOVIE_INDEX.filter(item => {
        const hay = toLower([item.title, item.region, item.type, item.genre, item.tags, item.category].join(' '));
        return terms.every(t => hay.includes(t));
      }).sort((a, b) => b.score - a.score);
      render(list);
    };

    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(doSearch, 80);
    });

    render(window.MOVIE_INDEX.slice(0, 12));
  }

  function initFilterCards() {
    const input = $('[data-filter-input]');
    const cards = $all('[data-search]');
    if (!input || !cards.length) return;

    input.addEventListener('input', () => {
      const q = toLower(input.value.trim());
      cards.forEach(card => {
        const hay = toLower(card.getAttribute('data-search'));
        card.classList.toggle('hidden', q && !hay.includes(q));
      });
    });
  }

  function drawDemoFrame(ctx, t, title, c1, c2) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const grad = ctx.createRadialGradient(w * 0.7, h * 0.2, 10, w * 0.7, h * 0.2, Math.max(w, h) * 0.7);
    grad.addColorStop(0, 'rgba(255,255,255,0.18)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(3,7,18,0.30)';
    for (let i = 0; i < 10; i++) {
      const y = ((i * 90) + (t * 0.03 * (i + 1))) % (h + 120) - 80;
      ctx.beginPath();
      ctx.roundRect(60 + i * 20, y, w - 140 - i * 12, 20, 10);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(2,6,23,0.82)';
    ctx.fillRect(0, h * 0.64, w, h * 0.36);

    ctx.fillStyle = '#fff';
    ctx.font = '700 48px Inter, PingFang SC, sans-serif';
    ctx.fillText(title, 36, 88);
    ctx.font = '400 22px Inter, PingFang SC, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.86)';
    ctx.fillText('静态站点内置演示播放 · 支持 HLS / MP4 输入', 36, 130);

    const x = 38 + (Math.sin(t / 1000) + 1) * 140;
    const y = h * 0.34 + (Math.cos(t / 700) + 1) * 24;
    ctx.fillStyle = 'rgba(255,255,255,0.13)';
    ctx.beginPath();
    ctx.arc(x, y, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.34)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 36, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.80)';
    ctx.font = '700 24px Inter, PingFang SC, sans-serif';
    ctx.fillText('DEMO', w - 120, 56);
  }

  function initPlayer() {
    const root = $('[data-player]');
    if (!root) return;

    const video = $('[data-player-video]', root);
    const canvas = $('[data-player-canvas]', root);
    const sourceInput = $('[data-player-source]', root);
    const playBtn = $('[data-player-play]', root);
    const demoBtn = $('[data-player-demo]', root);
    const stopBtn = $('[data-player-stop]', root);
    const title = root.getAttribute('data-player-title') || '影海静态影院';
    const c1 = root.getAttribute('data-c1') || '#f97316';
    const c2 = root.getAttribute('data-c2') || '#0f172a';

    let hls = null;
    let stream = null;
    let raf = 0;
    let ctx = canvas.getContext('2d');
    let started = false;

    function stopDemo() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
      }
      canvas.classList.add('hidden');
      video.classList.remove('hidden');
    }

    function stopHls() {
      if (hls) {
        try { hls.destroy(); } catch (e) {}
        hls = null;
      }
      video.pause();
      video.removeAttribute('src');
      video.load();
    }

    function startNative(url) {
      stopDemo();
      stopHls();
      video.src = url;
      video.play().catch(() => {});
    }

    function startHls(url) {
      stopDemo();
      stopHls();
      if (window.Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(() => {});
        });
      } else {
        startNative(url);
      }
    }

    function startDemo() {
      stopHls();
      canvas.classList.remove('hidden');
      video.classList.add('hidden');
      if (!canvas.width || !canvas.height) {
        canvas.width = 1280;
        canvas.height = 720;
      }
      const capture = canvas.captureStream ? canvas.captureStream(30) : null;
      if (capture) {
        stream = capture;
        video.srcObject = capture;
        video.play().catch(() => {});
      }
      const tick = (t) => {
        drawDemoFrame(ctx, t, title, c1, c2);
        raf = requestAnimationFrame(tick);
      };
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
      started = true;
    }

    playBtn && playBtn.addEventListener('click', () => {
      const url = sourceInput.value.trim();
      if (url) {
        if (/\.m3u8(\?|#|$)/i.test(url)) startHls(url);
        else startNative(url);
      } else {
        startDemo();
      }
    });

    demoBtn && demoBtn.addEventListener('click', startDemo);
    stopBtn && stopBtn.addEventListener('click', () => {
      stopDemo();
      stopHls();
      video.pause();
      sourceInput.value = '';
    });

    // load lightweight first frame in the poster canvas so the block is never empty.
    canvas.width = 1280;
    canvas.height = 720;
    drawDemoFrame(ctx, 0, title, c1, c2);
    canvas.classList.remove('hidden');
    video.classList.add('hidden');
  }

  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSearchIndex();
    initFilterCards();
    initPlayer();
    initSmoothScroll();
  });
})();
