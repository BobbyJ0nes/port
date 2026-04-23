/* reactive video viewer
 * - play/pause, scrub, volume, mute
 * - samples the current frame on an offscreen canvas to tint the page bg
 * - keyboard: space = toggle, ←/→ = ±5s, ↑/↓ = ±10% volume, m = mute
 */

(function () {
  "use strict";

  const root = document.querySelector(".viewer");
  if (!root) return;

  const video = root.querySelector(".viewer__video");
  const playBtn = root.querySelector("[data-viewer-play]");
  const muteBtn = root.querySelector("[data-viewer-mute]");
  const volInput = root.querySelector("[data-viewer-volume]");
  const scrub = root.querySelector("[data-viewer-scrub]");
  const timeLabel = root.querySelector("[data-viewer-time]");
  const overlay = root.querySelector(".viewer__play-overlay");
  const overlayBtn = root.querySelector("[data-viewer-overlay-play]");
  const controls = root.querySelector(".viewer__controls");

  /* ---------- icons ---------- */
  const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  const ICON_VOL = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 10v4h4l5 4V6l-5 4H3zm13.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg>';
  const ICON_MUTE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 10v4h4l5 4V6l-5 4H3zm13.5 2a4.5 4.5 0 0 0-2.5-4v2.2l2.5 2.5zM19 5l-1.4 1.4L20.2 9H18v2h4V5zm.6 9.6L21 13.2 18.5 10.7 17 12.2l2.5 2.5-2.5 2.5 1.5 1.5 2.5-2.5 2.4 2.4L23 17.6l-3.4-3z"/></svg>';

  if (playBtn) playBtn.innerHTML = ICON_PLAY;
  if (muteBtn) muteBtn.innerHTML = ICON_VOL;
  if (overlayBtn) overlayBtn.innerHTML = ICON_PLAY;

  /* ---------- orientation detection ---------- */
  video.addEventListener("loadedmetadata", () => {
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (w && h) {
      root.dataset.orientation = h > w ? "portrait" : "landscape";
    }
  });

  /* ---------- play / pause ---------- */
  function syncPlayIcon() {
    const icon = video.paused ? ICON_PLAY : ICON_PAUSE;
    if (playBtn) playBtn.innerHTML = icon;
    if (playBtn) playBtn.setAttribute("aria-label", video.paused ? "play" : "pause");
    if (overlayBtn) overlayBtn.innerHTML = ICON_PLAY;
    if (overlay) overlay.classList.toggle("is-visible", video.paused);
  }

  function togglePlay() {
    if (video.paused) {
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          /* autoplay denied; overlay remains visible */
        });
      }
    } else {
      video.pause();
    }
  }

  if (playBtn) playBtn.addEventListener("click", togglePlay);
  if (overlayBtn) overlayBtn.addEventListener("click", togglePlay);
  video.addEventListener("click", togglePlay);
  video.addEventListener("play", syncPlayIcon);
  video.addEventListener("pause", syncPlayIcon);

  /* ---------- volume ---------- */
  const STORAGE_KEY = "basaira-viewer-volume";

  function applyVolume(v, muted) {
    video.volume = Math.max(0, Math.min(1, v));
    video.muted = !!muted || v === 0;
    if (volInput) volInput.value = String(video.volume);
    if (muteBtn) muteBtn.innerHTML = video.muted ? ICON_MUTE : ICON_VOL;
    if (muteBtn) muteBtn.setAttribute("aria-label", video.muted ? "unmute" : "mute");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: video.volume, m: video.muted }));
    } catch {}
  }

  (function restoreVolume() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        applyVolume(typeof saved.v === "number" ? saved.v : 0.8, !!saved.m);
        return;
      }
    } catch {}
    applyVolume(0.8, false);
  })();

  if (volInput) {
    volInput.addEventListener("input", (e) => {
      const v = parseFloat(e.target.value);
      applyVolume(v, v === 0);
    });
  }
  if (muteBtn) {
    muteBtn.addEventListener("click", () => applyVolume(video.volume || 0.8, !video.muted));
  }

  /* ---------- scrub / progress (native <input type="range">) ---------- */
  let scrubActive = false;

  function fmt(t) {
    if (!isFinite(t) || t < 0) t = 0;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function paintScrub(pct) {
    if (scrub) {
      scrub.style.setProperty("--pct", pct.toFixed(2) + "%");
      scrub.setAttribute("aria-valuenow", String(Math.round(pct)));
    }
  }

  function updateFromVideo() {
    const d = video.duration || 0;
    const c = video.currentTime || 0;
    const pct = d > 0 ? (c / d) * 100 : 0;
    if (scrub && !scrubActive) {
      scrub.value = String(Math.round(pct * 10)); // 0..1000
      paintScrub(pct);
    }
    if (timeLabel) timeLabel.textContent = `${fmt(c)} / ${fmt(d)}`;
  }
  video.addEventListener("timeupdate", updateFromVideo);
  video.addEventListener("loadedmetadata", updateFromVideo);
  video.addEventListener("durationchange", updateFromVideo);
  video.addEventListener("seeked", () => { if (!scrubActive) updateFromVideo(); });

  if (scrub) {
    // seek helper: plain currentTime. fastSeek() rounds to the nearest
    // keyframe and can round backwards, which made small drags look
    // like they were doing nothing.
    const seekToPct = (pct) => {
      const d = video.duration;
      if (!isFinite(d) || d <= 0) return;
      try {
        video.currentTime = Math.max(0, Math.min(d, pct * d));
      } catch (_) {}
    };

    // user dragging: fires continuously
    scrub.addEventListener("input", () => {
      scrubActive = true;
      const pct = parseFloat(scrub.value) / 10; // 0..100
      paintScrub(pct);
      const d = video.duration || 0;
      if (timeLabel) timeLabel.textContent = `${fmt((pct / 100) * d)} / ${fmt(d)}`;
      seekToPct(pct / 100);
    });

    // user released: commit (same logic, just flips scrubActive back)
    scrub.addEventListener("change", () => {
      const pct = parseFloat(scrub.value) / 10;
      seekToPct(pct / 100);
      scrubActive = false;
    });

    // native range input handles arrow/home/end/pageup/pagedown on its own;
    // stop them from also triggering the document-level shortcuts
    scrub.addEventListener("keydown", (e) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
           "Home", "End", "PageUp", "PageDown"].indexOf(e.key) !== -1) {
        e.stopPropagation();
      }
    });
  }

  /* ---------- keyboard shortcuts (document-level) ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if (e.key === " " || e.key === "k") {
      e.preventDefault();
      togglePlay();
    } else if (e.key === "ArrowLeft") {
      video.currentTime = Math.max(0, video.currentTime - 5);
    } else if (e.key === "ArrowRight") {
      video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
    } else if (e.key === "ArrowUp") {
      applyVolume(Math.min(1, video.volume + 0.1), false);
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      applyVolume(Math.max(0, video.volume - 0.1), video.volume - 0.1 <= 0);
      e.preventDefault();
    } else if (e.key === "m" || e.key === "M") {
      applyVolume(video.volume || 0.8, !video.muted);
    }
  });

  /* ---------- idle: hide chrome after inactivity ---------- */
  let idleTimer = null;
  function wake() {
    root.classList.remove("is-idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!video.paused) root.classList.add("is-idle");
    }, 2500);
  }
  ["pointermove", "pointerdown", "keydown", "touchstart"].forEach((ev) =>
    document.addEventListener(ev, wake, { passive: true })
  );
  video.addEventListener("pause", () => root.classList.remove("is-idle"));
  wake();

  /* ---------- reactive background: sample dominant hue ---------- */
  const SAMPLE_SIZE = 32;
  const off = document.createElement("canvas");
  off.width = SAMPLE_SIZE; off.height = SAMPLE_SIZE;
  const ctx = off.getContext("2d", { willReadFrequently: true });
  let lastSample = 0;
  const SAMPLE_INTERVAL = 150; // ms

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r)      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else                h = ((r - g) / d + 4) / 6;
    }
    return [h * 360, s, l];
  }

  function setTint(r, g, b) {
    const [h, s, l] = rgbToHsl(r, g, b);
    // aggressive saturation boost so dim, near-neutral scenes still read
    // as clearly coloured. low-sat sources get a strong additive floor.
    const boostedS = Math.min(0.82, s * 2.0 + 0.28);
    // lightness floor at 0.14 so dark scenes aren't near-black; ceiling
    // at 0.28 so bright scenes don't wash out the video.
    const targetL = 0.14 + Math.min(0.14, l * 0.22);
    const tint = `hsl(${h.toFixed(0)}, ${(boostedS * 100).toFixed(0)}%, ${(targetL * 100).toFixed(0)}%)`;
    root.style.setProperty("--v-bg-tint", tint);
  }

  function sampleNow() {
    if (video.readyState < 2) return;
    try {
      ctx.drawImage(video, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
      const data = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
      }
      if (n > 0) setTint(r / n, g / n, b / n);
    } catch (e) {
      /* cross-origin or not ready; ignore */
    }
  }

  function sampleFrame(ts) {
    // sample every ~150 ms; works whether playing, paused, or scrubbing
    if (!video.ended && ts - lastSample >= SAMPLE_INTERVAL) {
      lastSample = ts;
      sampleNow();
    }
    requestAnimationFrame(sampleFrame);
  }
  requestAnimationFrame(sampleFrame);

  // also sample immediately on seek/metadata so bg reflects new position
  video.addEventListener("seeked", sampleNow);
  video.addEventListener("loadeddata", sampleNow);

  /* on ended, settle to a neutral dark wash */
  video.addEventListener("ended", () => {
    root.style.setProperty("--v-bg-tint", "#0a0a0a");
    root.classList.remove("is-idle");
  });

  /* initial overlay visibility */
  syncPlayIcon();
})();
