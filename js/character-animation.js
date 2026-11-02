/**
 * ============================================================================
 * INTERACTIVE 3D CHARACTER ANIMATION (CHESS PIECE SEQUENCE)
 * ============================================================================
 * Plays the converted image sequence (144 frames) with high performance:
 *  - Canvas-based rendering to eliminate DOM flicker and lag
 *  - Frame 1 displays immediately as the static cover / trigger
 *  - Background preloading with priority queuing
 *  - Click to play / click to replay from start
 *  - Stable 30 FPS timing with requestAnimationFrame
 *  - Smooth idle floating effect & subtle portfolio-matching blue glow
 *  - Responsive across desktop, tablet, and mobile
 * ============================================================================
 */

(function () {
  'use strict';

  // Configuration
  const TOTAL_FRAMES = 144;
  const TARGET_FPS = 30;
  const FRAME_INTERVAL = 1000 / TARGET_FPS; // ~33.33ms per frame
  const FRAME_BASE_PATH = 'Camera_moving_toward_chess_piece_4fb02cfd_frames/';
  const FRAME_FALLBACK_PATH = 'Camera_moving_toward_chess_piece_4fb02cfd_frames/Camera_moving_toward_chess_piece_4fb02cfd_frames/';

  // DOM Elements
  const canvas = document.getElementById('characterCanvas');
  const stage = document.getElementById('characterStage');
  const playBadge = document.getElementById('characterPlayBadge');
  const statusDot = document.getElementById('characterStatusDot');
  const statusText = document.getElementById('characterStatusText');
  const hintText = document.getElementById('characterHintText');

  if (!canvas || !stage) {
    return;
  }

  const ctx = canvas.getContext('2d', { alpha: true });

  // Animation State
  const frames = new Array(TOTAL_FRAMES);
  let framesLoadedCount = 0;
  let currentFrameIndex = 0;
  let isPlaying = false;
  let isCompleted = false;
  let animFrameId = null;
  let lastTimestamp = 0;

  /**
   * Format index (0..143) to 3-digit frame filename (frame_001.png .. frame_144.png)
   */
  function getFrameUrl(index) {
    const frameNum = String(index + 1).padStart(3, '0');
    return FRAME_BASE_PATH + 'frame_' + frameNum + '.png';
  }

  function getFallbackFrameUrl(index) {
    const frameNum = String(index + 1).padStart(3, '0');
    return FRAME_FALLBACK_PATH + 'frame_' + frameNum + '.png';
  }

  /**
   * Draw a specific frame index on the canvas
   */
  function drawFrame(index) {
    const img = frames[index];
    if (img && img.complete && img.naturalWidth > 0) {
      // Clear and draw with crisp scaling
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return true;
    }
    return false;
  }

  /**
   * Load a single frame image
   */
  function loadFrame(index, onComplete) {
    if (frames[index]) {
      if (onComplete) onComplete(frames[index]);
      return;
    }

    const img = new Image();
    img.src = getFrameUrl(index);

    img.onload = function () {
      frames[index] = img;
      framesLoadedCount++;
      if (onComplete) onComplete(img);
    };

    img.onerror = function () {
      // Retry with fallback path
      const retryImg = new Image();
      retryImg.src = getFallbackFrameUrl(index);
      retryImg.onload = function () {
        frames[index] = retryImg;
        framesLoadedCount++;
        if (onComplete) onComplete(retryImg);
      };
      retryImg.onerror = function () {
        console.warn('Failed to load frame:', index + 1);
      };
    };
  }

  /**
   * Preload remaining frames in batches to avoid network bottleneck
   */
  function preloadAllFrames() {
    let nextToLoad = 1; // 0 already loaded
    const concurrent = 6;
    let activeLoads = 0;

    function loadNext() {
      while (activeLoads < concurrent && nextToLoad < TOTAL_FRAMES) {
        const idx = nextToLoad++;
        activeLoads++;
        loadFrame(idx, function () {
          activeLoads--;
          loadNext();
        });
      }
    }

    loadNext();
  }

  /**
   * Animation render loop
   */
  function renderLoop(timestamp) {
    if (!isPlaying) return;

    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }

    const delta = timestamp - lastTimestamp;

    if (delta >= FRAME_INTERVAL) {
      lastTimestamp = timestamp - (delta % FRAME_INTERVAL);

      // Check if current frame can be drawn
      const drawn = drawFrame(currentFrameIndex);

      if (drawn) {
        currentFrameIndex++;

        // Update progress in status bar
        if (statusText) {
          const progress = Math.min(100, Math.round((currentFrameIndex / TOTAL_FRAMES) * 100));
          statusText.textContent = 'ANIMATING // ' + progress + '%';
        }

        // Reached end of sequence
        if (currentFrameIndex >= TOTAL_FRAMES) {
          stopAnimation(true);
          return;
        }
      }
    }

    animFrameId = requestAnimationFrame(renderLoop);
  }

  /**
   * Start or restart animation
   */
  function startAnimation() {
    if (isPlaying) {
      // If clicked while already playing, restart from beginning
      currentFrameIndex = 0;
      lastTimestamp = 0;
      return;
    }

    isPlaying = true;
    isCompleted = false;
    currentFrameIndex = 0;
    lastTimestamp = 0;

    // UI state updates
    stage.classList.add('is-playing');
    stage.classList.remove('is-completed');

    if (statusDot) {
      statusDot.classList.add('status-playing');
    }
    if (statusText) {
      statusText.textContent = 'ANIMATING // 0%';
    }
    if (hintText) {
      hintText.textContent = 'PLAYING...';
    }
    if (playBadge) {
      playBadge.classList.add('is-hidden');
    }

    animFrameId = requestAnimationFrame(renderLoop);
  }

  /**
   * Stop animation (reached end or paused)
   */
  function stopAnimation(reachedEnd) {
    isPlaying = false;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }

    stage.classList.remove('is-playing');

    if (statusDot) {
      statusDot.classList.remove('status-playing');
    }

    if (reachedEnd) {
      isCompleted = true;
      currentFrameIndex = TOTAL_FRAMES - 1; // Stay on final frame
      drawFrame(currentFrameIndex);

      stage.classList.add('is-completed');

      if (statusText) {
        statusText.textContent = '3D INTERACTIVE // COMPLETED';
      }
      if (hintText) {
        hintText.textContent = 'CLICK TO REPLAY ↺';
      }
      if (playBadge) {
        const icon = playBadge.querySelector('.badge-icon');
        const text = playBadge.querySelector('.badge-text');
        if (icon) icon.textContent = '↺';
        if (text) text.textContent = 'Replay Animation';
        playBadge.classList.remove('is-hidden');
      }
    } else {
      if (statusText) {
        statusText.textContent = '3D INTERACTIVE // PAUSED';
      }
      if (hintText) {
        hintText.textContent = 'CLICK TO PLAY';
      }
      if (playBadge) {
        playBadge.classList.remove('is-hidden');
      }
    }
  }

  /**
   * Handle user interaction (click, keypress)
   */
  function handleTrigger() {
    startAnimation();
  }

  // Event Listeners
  stage.addEventListener('click', handleTrigger);
  stage.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTrigger();
    }
  });

  // Hover effect: slight camera pulse / cursor cue
  stage.addEventListener('mouseenter', function () {
    if (!isPlaying && !isCompleted && hintText) {
      hintText.textContent = 'CLICK TO PLAY ▶';
    }
  });

  stage.addEventListener('mouseleave', function () {
    if (!isPlaying && !isCompleted && hintText) {
      hintText.textContent = 'CLICK TO ANIMATE';
    }
  });

  // Initialize: Load Frame 1 immediately
  loadFrame(0, function () {
    drawFrame(0);

    // Preload remaining frames in background after initial render
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preloadAllFrames, { timeout: 1500 });
    } else {
      setTimeout(preloadAllFrames, 300);
    }
  });

})();

/* ============================================================================
   SKILLS SECTION — BACKGROUND ANIMATION CONTROLLER
   Renders the chess sequence as a full-section background, looping infinitely.
   IntersectionObserver pauses rendering when off-screen to save CPU.
   ============================================================================ */
(function () {
  'use strict';

  const BG_FPS        = 15;
  const BG_INTERVAL   = 1000 / BG_FPS;
  const TOTAL_FRAMES  = 144;
  const BASE_PATH     = 'Camera_moving_toward_chess_piece_4fb02cfd_frames/';
  const FALLBACK_PATH = 'Camera_moving_toward_chess_piece_4fb02cfd_frames/Camera_moving_toward_chess_piece_4fb02cfd_frames/';

  const bgCanvas  = document.getElementById('skillsBgCanvas');
  const skillsSec = document.getElementById('skills');
  if (!bgCanvas || !skillsSec) return;

  const ctx = bgCanvas.getContext('2d', { alpha: false });

  const frames = [];
  let current  = 0;
  let rafId    = null;
  let lastTs   = 0;
  let running  = false;

  /* ── Sizing ─────────────────────────────────────────────────────────────── */
  function syncSize() {
    // Use the full rendered height of the section (including padding)
    const w = skillsSec.offsetWidth;
    const h = skillsSec.offsetHeight || skillsSec.scrollHeight;
    if (bgCanvas.width !== w || bgCanvas.height !== h) {
      bgCanvas.width  = w;
      bgCanvas.height = h;
    }
  }

  /* ── Draw ────────────────────────────────────────────────────────────────── */
  function paint(idx) {
    const img = frames[idx];
    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = bgCanvas.width;
    const ch = bgCanvas.height;
    const iw = img.naturalWidth;   // 640
    const ih = img.naturalHeight;  // 360

    // Step 1: Clear
    ctx.clearRect(0, 0, cw, ch);

    // Step 2: Scale so the image FILLS the whole canvas (cover behaviour)
    const scale  = Math.max(cw / iw, ch / ih);
    const drawW  = iw * scale;
    const drawH  = ih * scale;

    // Center the scaled image; if canvas is taller than one frame we tile downward
    const startX = (cw - drawW) / 2;
    let   startY = (ch - drawH) / 2;

    // Draw the frame centered
    ctx.drawImage(img, startX, startY, drawW, drawH);

    // If the section is taller than one scaled frame, fill the gap with
    // additional copies above and below so there's no empty space
    if (drawH < ch) {
      let y = startY - drawH;
      while (y + drawH > 0) {
        ctx.drawImage(img, startX, y, drawW, drawH);
        y -= drawH;
      }
      y = startY + drawH;
      while (y < ch) {
        ctx.drawImage(img, startX, y, drawW, drawH);
        y += drawH;
      }
    }
  }

  /* ── Loop ────────────────────────────────────────────────────────────────── */
  function loop(ts) {
    if (!running) return;
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs;
    if (dt >= BG_INTERVAL) {
      lastTs = ts - (dt % BG_INTERVAL);
      syncSize();
      paint(current);
      current = (current + 1) % TOTAL_FRAMES;
    }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    lastTs  = 0;
    rafId   = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  /* ── Load ────────────────────────────────────────────────────────────────── */
  function loadFrame(idx, cb) {
    if (frames[idx]) { if (cb) cb(); return; }
    const num = String(idx + 1).padStart(3, '0');
    const img = new Image();
    img.src = BASE_PATH + 'frame_' + num + '.png';
    img.onload = function () { frames[idx] = img; if (cb) cb(); };
    img.onerror = function () {
      const r = new Image();
      r.src = FALLBACK_PATH + 'frame_' + num + '.png';
      r.onload = function () { frames[idx] = r; if (cb) cb(); };
    };
  }

  function preloadAll() {
    const CONCURRENT = 6;
    let next = 1, active = 0;          // frame 0 already loaded
    function tick() {
      while (active < CONCURRENT && next < TOTAL_FRAMES) {
        active++;
        const i = next++;
        loadFrame(i, function () { active--; tick(); });
      }
    }
    tick();
  }

  /* ── Visibility gate ─────────────────────────────────────────────────────── */
  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
    },
    { threshold: 0.02 }
  );
  io.observe(skillsSec);

  /* ── Boot ────────────────────────────────────────────────────────────────── */
  loadFrame(0, function () {
    syncSize();
    paint(0);
    // Kick off background preload after the first paint settles
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadAll, { timeout: 2500 });
    } else {
      setTimeout(preloadAll, 400);
    }
  });

  window.addEventListener('resize', function () { syncSize(); paint(current); }, { passive: true });

})();
