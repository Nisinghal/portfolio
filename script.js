/**
 * Calm, gentle fade-on-scroll logic
 * Minimalist, performant, unobtrusive
 */
document.addEventListener('DOMContentLoaded', () => {
  const fadeElements = document.querySelectorAll('.fade-in');

  if (!('IntersectionObserver' in window)) {
    fadeElements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.08
  };

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observerInstance.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => observer.observe(el));

  // Interactive HD Video Facade: Seamless click-to-play with 1080p stream
  const videoFrames = document.querySelectorAll('.video-poster-frame');
  videoFrames.forEach(frame => {
    const videoId = frame.getAttribute('data-video-id');
    const title = frame.getAttribute('data-title') || 'Video';
    if (!videoId) return;

    frame.addEventListener('click', () => {
      frame.innerHTML = `<iframe 
        src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&controls=1&vq=hd1080&hd=1" 
        title="${title}" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>`;
      frame.classList.remove('video-poster-frame');
    });
  });

  // Initialize subtle generative ASCII header canvas
  initHeroAscii();
});

// ==========================================================================
// INTERACTIVE ASCII FIELD (Hero Header Effect)
// Generative breathing ASCII halftone matrix with smooth cursor ripple
// ==========================================================================
function initHeroAscii() {
  const canvas = document.getElementById('hero-ascii-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  // Density ramp — sparse to dense
  const CHARS = [' ', ' ', '·', '·', '.', '·', ':', ';', '+', 'o', 'O', '@', '#'];
  // Glitch / accent pool — injected at rare intervals or cursor excitation
  const GLITCH = ['|', '\\', '/', '!', '%', '$', '?', '~', '^', '<', '>', '[', ']', '_', '×', '○'];
  // Cell geometry
  const FS = 13, CW = 8, CH = 15;

  let W, H, cols, rows, raf;
  const t0 = performance.now();

  // Smooth fluid cursor tracking with lerp
  const mouse = {
    x: -9999,
    y: -9999,
    targetX: -9999,
    targetY: -9999,
    active: false,
    radius: 150,
    intensity: 0
  };

  // Deterministic per-cell hash — no per-frame jitter
  function cellHash(col, row) {
    return Math.abs(Math.sin(col * 127.1 + row * 311.7 + col * row * 0.037));
  }

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    W = canvas.offsetWidth || parent.offsetWidth;
    H = canvas.offsetHeight || parent.offsetHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / CW) + 2;
    rows = Math.ceil(H / CH) + 2;
    ctx.font = `${FS}px "IBM Plex Mono", "Geist Mono", monospace`;
    ctx.textBaseline = 'top';
  }

  // Mouse & Touch listeners for smooth cursor tracking
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    // Active when cursor is in or near the hero header viewport
    if (e.clientY >= rect.top - 40 && e.clientY <= rect.bottom + 40 &&
        e.clientX >= rect.left - 40 && e.clientX <= rect.right + 40) {
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    } else {
      mouse.active = false;
    }
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  window.addEventListener('touchmove', e => {
    if (e.touches && e.touches[0]) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        mouse.targetX = touch.clientX - rect.left;
        mouse.targetY = touch.clientY - rect.top;
        mouse.active = true;
      }
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.active = false;
  });

  // IntersectionObserver: Pause when out of view
  let isVisible = true;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !raf) {
        raf = requestAnimationFrame(draw);
      }
    }, { threshold: 0.05 });
    observer.observe(canvas);
  }

  function draw() {
    if (!isVisible) {
      raf = null;
      return;
    }

    ctx.clearRect(0, 0, W, H);
    const t = (performance.now() - t0) * 0.001;
    // Glitch epoch: subtle periodic burst every ~5s
    const epoch = Math.floor(t / 5);

    // Smooth cursor interpolation
    if (mouse.active) {
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;
      mouse.intensity += (1 - mouse.intensity) * 0.08;
    } else {
      mouse.intensity += (0 - mouse.intensity) * 0.03;
    }

    for (let row = 0; row < rows; row++) {
      const cy = row * CH;
      const ny = row / rows;
      // Vertical fade: fades softly toward the bottom so projects stay clean
      const vFade = Math.max(0, 1 - Math.pow(ny, 1.4) * 1.3);
      if (vFade <= 0.02) continue;

      for (let col = 0; col < cols; col++) {
        const cx = col * CW;
        const nx = col / cols;

        // Base distribution with gentle side presence
        const hDist = Math.abs(nx - 0.5) * 2;
        let d = vFade * (0.16 + 0.28 * hDist);

        // Per-cell stable phase
        const phase = cellHash(col, row) * Math.PI * 6;

        // Harmonic breathing waves
        d += 0.12 * Math.sin(t * 0.38 + nx * 4.8 + ny * 3.0 + phase * 0.1);
        d += 0.07 * Math.sin(t * 0.22 + nx * 9.1 - ny * 5.8 + phase * 0.07);
        d += 0.04 * Math.cos(t * 0.16 - nx * 3.5 + ny * 5.2 + phase * 0.05);

        // Subtle periodic ripple burst
        const bx = cellHash(epoch, 7);
        const by = cellHash(3, epoch) * 0.55;
        const bd = Math.sqrt(Math.pow(nx - bx, 2) * 0.5 + Math.pow(ny - by, 2));
        const burst = Math.max(0, 0.25 - bd) * Math.sin(t * 8 - bd * 18);
        d += burst * 0.40;

        // Scanline shimmer
        d += Math.sin(row * 0.65 + t * 0.7) * 0.025;

        // Interactive cursor perturbation & ripple
        let isCursorActive = false;
        let cursorInfluence = 0;
        if (mouse.intensity > 0.01 && mouse.x > -1000) {
          const dx = cx - mouse.x;
          const dy = cy - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            cursorInfluence = (1 - dist / mouse.radius) * mouse.intensity;
            const ripple = Math.sin(dist * 0.09 - t * 5.5);
            d += cursorInfluence * 0.60 * (0.65 + 0.35 * ripple);
            isCursorActive = cursorInfluence > 0.22;
          }
        }

        d = Math.max(0, Math.min(1, d));
        if (d < 0.06) continue;

        // Pick character from density ramp
        let char = CHARS[Math.min(CHARS.length - 1, Math.floor(d * CHARS.length))];

        // Glitch swap — stable per epoch or near active cursor
        const gHash = cellHash(col + epoch * 97, row + epoch * 53);
        const isGlitch = (gHash < 0.055 && d > 0.20) || (isCursorActive && gHash < 0.18);
        if (isGlitch) {
          char = GLITCH[Math.floor(gHash * (GLITCH.length / 0.18)) % GLITCH.length];
        }
        if (!char || !char.trim()) continue;

        // Palette: light gallery gray -> rich warm charcoal
        // Refined contrast: clearly visible yet graceful
        const grayVal = Math.round(175 - d * 140);
        const baseAlpha = 0.10 + d * 0.40;
        const cursorAlpha = cursorInfluence * 0.28;
        const alpha = Math.min(0.72, isGlitch ? Math.min(0.8, 0.35 + burst * 0.3 + cursorAlpha) : (baseAlpha + cursorAlpha));

        ctx.fillStyle = `rgba(${grayVal}, ${grayVal}, ${grayVal}, ${alpha.toFixed(2)})`;
        ctx.fillText(char, cx, cy);
      }
    }

    raf = requestAnimationFrame(draw);
  }

  let debounce;
  window.addEventListener('resize', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      cancelAnimationFrame(raf);
      resize();
      draw();
    }, 150);
  });

  resize();
  draw();
}

// ==========================================================================
// NATURAL ORGANIC FOOTER: LIVING THOUGHT CAPSULE
// Smooth automatic 6s rotation + instant shuffle on click + pause on hover
// ==========================================================================

// 3D Book hover & touch toggle
function openBook() {
  const cover = document.getElementById('bookCover');
  if (cover) cover.classList.add('open');
}
function closeBook() {
  const cover = document.getElementById('bookCover');
  if (cover) cover.classList.remove('open');
}
function toggleBook() {
  const cover = document.getElementById('bookCover');
  if (cover) cover.classList.toggle('open');
}

// Curated studio thoughts & reflections (drawing from references & philosophy)
const studioThoughts = [
  {
    quote: "“The act of creating something is always more important than the result.”",
    author: "— Creative Philosophy · Studio Note"
  },
  {
    quote: "“Made with hands: it does not need to be perfect in order to qualify.”",
    author: "— Craft & Materiality"
  },
  {
    quote: "“Every 'edge case' is someone's entire lived experience. Design starts where assumptions break.”",
    author: "— Nishtha · Interaction Principle"
  },
  {
    quote: "“As long as we keep on creating and help each other along the way.”",
    author: "— Creative Kinship"
  },
  {
    quote: "“Physical computing is just teaching physical matter how to converse with humans.”",
    author: "— New Media Perspective"
  },
  {
    quote: "“Good design dissolves quietly into use; it grants agency rather than demanding attention.”",
    author: "— Interaction Design"
  }
];

let thoughtIdx = 0;
let thoughtTimer = null;

function renderThought(targetIdx) {
  const textEl = document.getElementById('thoughtText');
  const authorEl = document.getElementById('thoughtAuthor');
  const counterEl = document.getElementById('thoughtCounter');
  if (!textEl || !authorEl) return;

  textEl.style.opacity = '0';
  textEl.style.transform = 'translateY(4px)';
  authorEl.style.opacity = '0';

  setTimeout(() => {
    thoughtIdx = (targetIdx !== undefined ? targetIdx : (thoughtIdx + 1) % studioThoughts.length);
    const item = studioThoughts[thoughtIdx];
    textEl.textContent = item.quote;
    authorEl.textContent = item.author;
    if (counterEl) {
      counterEl.textContent = `Note 0${thoughtIdx + 1} of 0${studioThoughts.length}`;
    }
    textEl.style.opacity = '1';
    textEl.style.transform = 'translateY(0)';
    authorEl.style.opacity = '1';
  }, 180);
}

function shuffleThought() {
  const nextIdx = (thoughtIdx + 1) % studioThoughts.length;
  renderThought(nextIdx);
  restartThoughtTimer();
}

function startThoughtTimer() {
  if (thoughtTimer) clearInterval(thoughtTimer);
  thoughtTimer = setInterval(() => {
    renderThought((thoughtIdx + 1) % studioThoughts.length);
  }, 6000);
}

function restartThoughtTimer() {
  startThoughtTimer();
}

document.addEventListener('DOMContentLoaded', () => {
  const card = document.getElementById('thoughtCard');
  if (card) {
    card.addEventListener('mouseenter', () => {
      if (thoughtTimer) clearInterval(thoughtTimer);
    });
    card.addEventListener('mouseleave', () => {
      startThoughtTimer();
    });
  }
  startThoughtTimer();
});



