/* ===================================================================
 * Milan Sherin Portfolio - Main JS
 * 3D Block Hitbox Interaction, Project Modals & Navigation
 * =================================================================== */

/* ═══════════════════════════════════════════════════════════════════
 * 3D HEADING VERTICAL ROLL CONSTANTS
 * Tweak delays, durations, and cycle periods here:
 * ═══════════════════════════════════════════════════════════════════ */
const LINE_1_START_DELAY_MS = 1000;   // Delay in ms after page load before Line 1 first rolls
const LINE_GAP_SECONDS = 10;          // Seconds gap between consecutive lines rolling (exact 10s gap)
const ROLL_DURATION_MS = 1400;        // Duration in ms of one 180° vertical roll
const CYCLE_SECONDS = 30;             // Total cycle period in seconds (Line 1: 0s, Line 2: 10s, Line 3: 20s)
const ROLL_DIRECTION = -1;            // -1 = rolls forward toward viewer (slot-machine drum), 1 = rolls bottom-up



(function () {
  'use strict';

  /* ── Dark Mode Inversion Toggle ───────────────────────── */
  const themeBtn = document.getElementById('themeToggleBtn');
  const themeText = document.getElementById('themeText');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      if (themeText) {
        themeText.textContent = isDark ? 'Light' : 'Invert';
      }
    });
  }

  /* ── Fullscreen Overlay Drawer Toggle ──────────────────── */
  const overlay = document.getElementById('studioMenuOverlay');
  const menuToggle = document.getElementById('menuOverlayToggle');
  const menuClose = document.getElementById('menuCloseBtn');
  const overlayLinks = document.querySelectorAll('.overlay-nav-link');

  function toggleOverlay(open) {
    if (!overlay) return;
    if (open) {
      overlay.classList.remove('opacity-0', 'pointer-events-none');
      overlay.classList.add('opacity-100');
      document.body.style.overflow = 'hidden';
    } else {
      overlay.classList.add('opacity-0', 'pointer-events-none');
      overlay.classList.remove('opacity-100');
      document.body.style.overflow = '';
    }
  }

  if (menuToggle) menuToggle.addEventListener('click', () => toggleOverlay(true));
  if (menuClose) menuClose.addEventListener('click', () => toggleOverlay(false));
  overlayLinks.forEach(link => link.addEventListener('click', () => toggleOverlay(false)));

  /* ═════════════════════════════════════════════════════════
     3-D MAIN HEADING VERTICAL ROLL CONTROLLER (3 Staggered Lines)
     - 3-line hero heading rolling vertically like slot-machine drums (rotateX)
     - Line 1 ("Milan Sherin") rolls FIRST at t=0 (after LINE_1_START_DELAY_MS = 1000ms)
     - Line 2 ("Security Researcher &") starts 10s after Line 1 (t=10s)
     - Line 3 ("Network Engineer") starts 10s after Line 2 (t=20s)
     - No two lines ever roll at the same time
     - Sequence repeats every CYCLE_SECONDS = 30s
     - Snappy cubic-bezier(0.65, 0, 0.35, 1) transition over ROLL_DURATION_MS = 1400ms
     - Continuous single-controller rAF clock with ZERO timing drift
     - Snaps to exact square angle at rest (no layout shift, zero blur)
     - IntersectionObserver & document.visibilitychange pauses/resumes cleanly
     - Respects prefers-reduced-motion: displays static heading
     ═════════════════════════════════════════════════════════ */
  function initHeadingRoll() {
    const heading = document.querySelector('.s-intro__content-title');
    const lineElements = [
      document.querySelector('.heading-3d-line-1'),
      document.querySelector('.heading-3d-line-2'),
      document.querySelector('.heading-3d-line-3')
    ];

    if (!heading || lineElements.some(el => !el)) return;

    const lineObjects = lineElements.map((lineEl, index) => {
      return {
        el: lineEl,
        stage: lineEl.querySelector('.heading-3d-stage'),
        cuboid: lineEl.querySelector('.heading-3d-cuboid'),
        front: lineEl.querySelector('.heading-3d-front'),
        back: lineEl.querySelector('.heading-3d-back'),
        halfHeight: 0,
        startOffsetMs: index * LINE_GAP_SECONDS * 1000
      };
    });

    // Cubic-bezier evaluator for cubic-bezier(0.65, 0, 0.35, 1)
    function createCubicBezier(x1, y1, x2, y2) {
      function sampleX(t) {
        return ((1 - 3 * x2 + 3 * x1) * t + (3 * x2 - 6 * x1)) * t * t + (3 * x1) * t;
      }
      function sampleY(t) {
        return ((1 - 3 * y2 + 3 * y1) * t + (3 * y2 - 6 * y1)) * t * t + (3 * y1) * t;
      }
      function derivativeX(t) {
        return (3 * (1 - 3 * x2 + 3 * x1) * t + 2 * (3 * x2 - 6 * x1)) * t + (3 * x1);
      }
      function solveX(x) {
        let t = x;
        for (let i = 0; i < 8; i++) {
          const xEst = sampleX(t) - x;
          if (Math.abs(xEst) < 1e-6) return t;
          const d = derivativeX(t);
          if (Math.abs(d) < 1e-6) break;
          t -= xEst / d;
        }
        let t0 = 0, t1 = 1;
        t = x;
        while (t0 < t1) {
          const xEst = sampleX(t);
          if (Math.abs(xEst - x) < 1e-6) return t;
          if (x > xEst) t0 = t;
          else t1 = t;
          t = (t1 + t0) / 2;
        }
        return t;
      }
      return function (x) {
        if (x <= 0) return 0;
        if (x >= 1) return 1;
        return sampleY(solveX(x));
      };
    }

    const easeRoll = createCubicBezier(0.65, 0, 0.35, 1);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Responsive line height measurement: recalculates translateZ on mobile wrapping / resize
    function measureHeights() {
      lineObjects.forEach(obj => {
        const h = (obj.front && obj.front.offsetHeight) || (obj.stage && obj.stage.offsetHeight) || 60;
        obj.halfHeight = Math.round(h / 2);
        if (obj.stage) obj.stage.style.setProperty('--line-half-height', `${obj.halfHeight}px`);
        if (obj.back) obj.back.style.minHeight = `${h}px`;
      });
    }

    measureHeights();
    window.addEventListener('resize', measureHeights);
    window.addEventListener('load', measureHeights);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measureHeights);
    }

    // Single animation controller state (no setTimeouts that drift)
    let accumulatedTime = 0;
    let lastTimestamp = performance.now();
    let isRunning = false;
    let isVisible = true;
    let isTabActive = !document.hidden;

    function render(timeMs) {
      if (prefersReducedMotion.matches) {
        lineObjects.forEach(obj => {
          if (!obj.cuboid) return;
          obj.cuboid.classList.add('is-at-rest');
          obj.cuboid.style.transform = `translate3d(0, 0, ${-obj.halfHeight}px) rotateX(0deg)`;
        });
        return;
      }

      if (lineObjects.some(obj => obj.halfHeight === 0)) {
        measureHeights();
      }

      // Initial pre-delay: hold all lines static at rest (0°)
      if (timeMs < LINE_1_START_DELAY_MS) {
        lineObjects.forEach(obj => {
          if (!obj.cuboid) return;
          obj.cuboid.classList.add('is-at-rest');
          obj.cuboid.style.transform = `translate3d(0, 0, ${-obj.halfHeight}px) rotateX(0deg)`;
        });
        return;
      }

      const elapsed = timeMs - LINE_1_START_DELAY_MS;
      const cycleMs = CYCLE_SECONDS * 1000;
      const cycleIndex = Math.floor(elapsed / cycleMs);
      const timeInCycle = elapsed % cycleMs;

      lineObjects.forEach(obj => {
        if (!obj.cuboid) return;
        const lineStart = obj.startOffsetMs;
        const lineEnd = lineStart + ROLL_DURATION_MS;
        let deg;
        const isRolling = timeInCycle >= lineStart && timeInCycle < lineEnd;

        if (timeInCycle < lineStart) {
          // Sits still before its roll starts in this cycle
          obj.cuboid.classList.add('is-at-rest');
          deg = ROLL_DIRECTION * cycleIndex * 180;
        } else if (isRolling) {
          // Rolling with snappy cubic-bezier easing
          obj.cuboid.classList.remove('is-at-rest');
          const p = (timeInCycle - lineStart) / ROLL_DURATION_MS;
          const e = easeRoll(p);
          deg = ROLL_DIRECTION * (cycleIndex + e) * 180;
        } else {
          // Snaps exactly to integer multiple of 180° at rest
          obj.cuboid.classList.add('is-at-rest');
          deg = ROLL_DIRECTION * (cycleIndex + 1) * 180;
        }

        const rotStr = isRolling ? deg.toFixed(3) : Math.round(deg).toString();
        obj.cuboid.style.transform = `translate3d(0, 0, ${-obj.halfHeight}px) rotateX(${rotStr}deg)`;
      });
    }


    function loop(now) {
      if (!isRunning) return;

      const dt = Math.min(now - lastTimestamp, 100);
      lastTimestamp = now;

      accumulatedTime += dt;
      render(accumulatedTime);

      if (isVisible && isTabActive) {
        requestAnimationFrame(loop);
      } else {
        isRunning = false;
      }
    }

    function startLoop() {
      if (!isRunning && isVisible && isTabActive) {
        isRunning = true;
        lastTimestamp = performance.now();
        requestAnimationFrame(loop);
      }
    }

    function checkState() {
      if (isVisible && isTabActive) {
        startLoop();
      } else {
        isRunning = false;
      }
    }

    // IntersectionObserver pauses loop when heading is scrolled out of view
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          checkState();
        });
      }, { threshold: 0.05 });
      observer.observe(heading);
    }

    // visibilitychange pauses loop when tab is hidden, resuming without timing jumps
    document.addEventListener('visibilitychange', () => {
      isTabActive = !document.hidden;
      checkState();
    });

    prefersReducedMotion.addEventListener('change', () => {
      render(accumulatedTime);
    });

    // Start sequence controller
    startLoop();
  }

  /* ═════════════════════════════════════════════════════════
     PROJECT CASE STUDY MODAL SYSTEM
     - Renders rich authentic project write-ups from projects.js
     - Two-column responsive layout with dark code blocks
     - Keyboard navigation (Esc, Left/Right arrows, Tab focus trap)
     - Prev/Next arrows with crossfade transition
     - Accessible (role="dialog", aria-modal, focus restoration)
     - Body scroll locking
     ═════════════════════════════════════════════════════════ */
  function initProjectModal() {
    const modal = document.getElementById('projectModal');
    const panel = modal ? modal.querySelector('.project-modal-panel') : null;
    const content = document.getElementById('projectModalContent');
    const scrollContainer = document.getElementById('projectModalScroll');
    const closeBtn = document.getElementById('projectModalCloseBtn');
    const prevBtn = document.getElementById('projectModalPrevBtn');
    const nextBtn = document.getElementById('projectModalNextBtn');

    if (!modal || !content || typeof PROJECTS_DATA === 'undefined') return;

    let currentProjectIndex = 0;
    let previouslyFocusedElement = null;

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderProject(project) {
      content.innerHTML = `
        <!-- Banner Image with Editorial Darkening Treatment -->
        <div class="relative w-full aspect-[21/9] sm:aspect-[24/8] overflow-hidden bg-neutral-900 border-b border-studio-lightBorder dark:border-studio-darkBorder">
          <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.imageAlt)}" class="w-full h-full object-cover filter grayscale contrast-110">
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          <div class="absolute bottom-4 left-6 sm:left-10 flex items-center space-x-3">
            <span class="inline-block px-2.5 py-1 bg-black text-white text-[10px] font-mono uppercase tracking-widest border border-white/20">
              ${escapeHtml(project.category)}
            </span>
            <span class="hidden sm:inline-block text-[11px] font-mono text-neutral-300 uppercase tracking-wider">
              Project ${currentProjectIndex + 1} of ${PROJECTS_DATA.length}
            </span>
          </div>
        </div>

        <!-- Main Body Container -->
        <div class="p-6 sm:p-10">
          
          <!-- Header: Title and One-line Summary -->
          <div class="border-b border-studio-lightBorder dark:border-studio-darkBorder pb-6 mb-8">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h2 id="projectModalTitle" class="text-2xl sm:text-4xl font-black tracking-tightest text-black dark:text-white">
                ${escapeHtml(project.title)}
              </h2>
              <span class="text-xs font-mono text-studio-muted shrink-0">
                REF: ${escapeHtml(project.id)}
              </span>
            </div>
            <p class="text-xs sm:text-sm font-mono text-studio-muted mt-2 leading-relaxed">
              ${escapeHtml(project.oneLineSummary)}
            </p>
          </div>

          <!-- Two-column Desktop Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            
            <!-- Left Main Column (Overview, Problem, How It Works, Features, Challenges, Usage) -->
            <div class="lg:col-span-8 space-y-8">
              
              <!-- Overview -->
              <section>
                <h3 class="text-xs font-mono uppercase tracking-widest text-studio-muted mb-2">Overview</h3>
                <p class="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                  ${escapeHtml(project.overview)}
                </p>
              </section>

              <!-- The Problem -->
              <section>
                <h3 class="text-xs font-mono uppercase tracking-widest text-studio-muted mb-2">The Problem</h3>
                <p class="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                  ${escapeHtml(project.problem)}
                </p>
              </section>

              <!-- How It Works (Numbered steps) -->
              <section>
                <h3 class="text-xs font-mono uppercase tracking-widest text-studio-muted mb-3">How It Works</h3>
                <div class="space-y-3">
                  ${project.howItWorks.map(step => `
                    <div class="border border-studio-lightBorder dark:border-studio-darkBorder p-4 rounded-sm bg-neutral-50/50 dark:bg-neutral-900/30">
                      <p class="text-xs font-mono text-black dark:text-white font-bold mb-1">${escapeHtml(step.step)}</p>
                      <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">${escapeHtml(step.description)}</p>
                    </div>
                  `).join('')}
                </div>
              </section>

              <!-- Key Features -->
              <section>
                <h3 class="text-xs font-mono uppercase tracking-widest text-studio-muted mb-3">Key Features</h3>
                <ul class="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                  ${project.keyFeatures.map(feat => `
                    <li class="flex items-start space-x-2">
                      <span class="text-studio-muted font-mono select-none">&bull;</span>
                      <span class="leading-relaxed">${escapeHtml(feat)}</span>
                    </li>
                  `).join('')}
                </ul>
              </section>

              <!-- Challenges & What I Learned -->
              <section>
                <h3 class="text-xs font-mono uppercase tracking-widest text-studio-muted mb-2">Challenges &amp; What I Learned</h3>
                <p class="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 italic border-l-2 border-neutral-300 dark:border-neutral-700 pl-4 py-1">
                  "${escapeHtml(project.challenges)}"
                </p>
              </section>

              <!-- Usage Code Block -->
              ${project.usage ? `
              <section>
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-xs font-mono uppercase tracking-widest text-studio-muted">Usage &amp; Terminal Verification</h3>
                  <button type="button" class="copy-code-btn text-[11px] font-mono px-2.5 py-1 border border-studio-lightBorder dark:border-studio-darkBorder rounded text-studio-muted hover:text-black dark:hover:text-white transition-colors" data-code="${encodeURIComponent(project.usage.command)}">
                    Copy Command
                  </button>
                </div>
                <div class="bg-[#09090b] text-[#f4f4f5] p-4 rounded-sm border border-neutral-800 text-xs font-mono overflow-x-auto">
                  <p class="text-neutral-500 select-none mb-1"># Command</p>
                  <pre class="text-emerald-400 mb-3 whitespace-pre-wrap">${escapeHtml(project.usage.command)}</pre>
                  <p class="text-neutral-500 select-none mb-1"># Verified Terminal Output</p>
                  <pre class="text-neutral-300 whitespace-pre">${escapeHtml(project.usage.output)}</pre>
                </div>
              </section>
              ` : ''}

            </div>

            <!-- Right Sidebar Column (Tech Stack, Links, Project Meta) -->
            <div class="lg:col-span-4 space-y-6">
              
              <!-- Source & Repository Links -->
              <div class="p-5 border border-studio-lightBorder dark:border-studio-darkBorder rounded-sm bg-neutral-50/50 dark:bg-neutral-900/20">
                <h4 class="text-xs font-mono uppercase tracking-widest text-studio-muted mb-3">Source &amp; Repository</h4>
                <a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer"
                   class="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase tracking-widest hover:opacity-85 transition-opacity rounded-sm">
                  <span>View Source on GitHub</span>
                  <span class="text-sm">&#8599;</span>
                </a>
                <div class="mt-4 pt-3 border-t border-studio-lightBorder dark:border-studio-darkBorder text-[11px] font-mono text-studio-muted flex justify-between">
                  <span>Code Verification</span>
                  <span class="text-emerald-500 font-semibold">&bull; Active Repo</span>
                </div>
              </div>

              <!-- Tech Stack Chips -->
              <div class="p-5 border border-studio-lightBorder dark:border-studio-darkBorder rounded-sm">
                <h4 class="text-xs font-mono uppercase tracking-widest text-studio-muted mb-3">Tech Stack</h4>
                <div class="flex flex-wrap gap-1.5">
                  ${project.techStack.map(tech => `
                    <span class="px-2.5 py-1 text-[11px] font-mono bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-sm">
                      ${escapeHtml(tech)}
                    </span>
                  `).join('')}
                </div>
              </div>

              <!-- Architecture Metadata Summary -->
              <div class="p-5 border border-studio-lightBorder dark:border-studio-darkBorder rounded-sm text-xs font-mono text-studio-muted space-y-2">
                <div class="flex justify-between">
                  <span>DOMAIN</span>
                  <span class="text-black dark:text-white font-medium">${escapeHtml(project.category.split('/')[0].trim())}</span>
                </div>
                <div class="flex justify-between">
                  <span>ENGINEER</span>
                  <span class="text-black dark:text-white font-medium">Milan Sherin</span>
                </div>
                <div class="flex justify-between">
                  <span>CODEBASE</span>
                  <span class="text-black dark:text-white font-medium">Production Clean</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      `;

      // Setup copy button listeners
      const copyBtns = content.querySelectorAll('.copy-code-btn');
      copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const rawCode = decodeURIComponent(btn.getAttribute('data-code') || '');
          if (navigator.clipboard && rawCode) {
            navigator.clipboard.writeText(rawCode).then(() => {
              const originalText = btn.textContent;
              btn.textContent = 'Copied!';
              btn.classList.add('text-emerald-500', 'border-emerald-500');
              setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('text-emerald-500', 'border-emerald-500');
              }, 2000);
            });
          }
        });
      });
    }

    function openModalByIndex(index) {
      if (index < 0 || index >= PROJECTS_DATA.length) return;
      currentProjectIndex = index;
      previouslyFocusedElement = document.activeElement;

      renderProject(PROJECTS_DATA[currentProjectIndex]);
      if (scrollContainer) scrollContainer.scrollTop = 0;

      modal.classList.remove('opacity-0', 'pointer-events-none');
      modal.classList.add('is-active', 'opacity-100');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove('is-active', 'opacity-100');
      modal.classList.add('opacity-0', 'pointer-events-none');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
        previouslyFocusedElement.focus();
      }
    }

    function nextProject() {
      const nextIdx = (currentProjectIndex + 1) % PROJECTS_DATA.length;
      switchProjectWithCrossfade(nextIdx);
    }

    function prevProject() {
      const prevIdx = (currentProjectIndex - 1 + PROJECTS_DATA.length) % PROJECTS_DATA.length;
      switchProjectWithCrossfade(prevIdx);
    }

    function switchProjectWithCrossfade(newIdx) {
      content.style.opacity = '0';
      setTimeout(() => {
        currentProjectIndex = newIdx;
        renderProject(PROJECTS_DATA[currentProjectIndex]);
        if (scrollContainer) scrollContainer.scrollTop = 0;
        content.style.opacity = '1';
      }, 150);
    }

    // Modal Action Buttons
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (prevBtn) prevBtn.addEventListener('click', prevProject);
    if (nextBtn) nextBtn.addEventListener('click', nextProject);

    // Click outside panel to close
    modal.addEventListener('click', (e) => {
      if (panel && !panel.contains(e.target)) {
        closeModal();
      }
    });

    // Keyboard handlers (Esc, Left/Right arrows, Tab focus trap)
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-active')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextProject();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevProject();
      } else if (e.key === 'Tab') {
        const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });

    // Project Card Click Triggers
    const triggers = document.querySelectorAll('[data-project-id], .project-card-trigger');
    triggers.forEach((elem) => {
      elem.addEventListener('click', (e) => {
        // If clicking a direct outbound GitHub link with onclick stopPropagation, ignore
        if (elem.tagName === 'A' && elem.getAttribute('target') === '_blank') return;
        
        e.preventDefault();
        e.stopPropagation();
        const pid = elem.getAttribute('data-project-id');
        const targetIndex = PROJECTS_DATA.findIndex(p => p.id === pid);
        if (targetIndex !== -1) {
          openModalByIndex(targetIndex);
        }
      });
    });

    // Global helper to open modal programmatically if desired
    window.openProjectModalById = function (id) {
      const idx = PROJECTS_DATA.findIndex(p => p.id === id);
      if (idx !== -1) openModalByIndex(idx);
    };
  }

  /* ═════════════════════════════════════════════════════════
     GLightbox Integration for Certificates & Media
     ═════════════════════════════════════════════════════════ */
  function initLightbox() {
    if (typeof GLightbox !== 'undefined') {
      GLightbox({
        selector: '.glightbox',
        touchNavigation: true,
        loop: true,
        zoomable: true
      });
    }
  }

  /* ── Keyboard Shortcuts (ESC to close overlay) ─────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleOverlay(false);
    }
  });

  /* ── DOM Ready Bootstrapper ────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initHeadingRoll();
      initProjectModal();
      initLightbox();
    });
  } else {
    initHeadingRoll();
    initProjectModal();
    initLightbox();
  }

})();
