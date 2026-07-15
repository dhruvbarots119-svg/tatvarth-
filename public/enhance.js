/* ═══════════════════════════════════════════════════════════
   enhance.js — Premium front-end behavior layer (ES module)
   ═══════════════════════════════════════════════════════════ */

import Lenis from "https://cdn.jsdelivr.net/npm/lenis@1.1.13/+esm";

(() => {
  "use strict";

  /* ── Clean up existing instances to prevent ghost trails ── */
  if (window.__enh_cancel_rafs) {
    window.__enh_cancel_rafs();
  }

  const activeRafIds = [];
  function registerRaf(fn) {
    let id;
    const loop = (time) => {
      fn(time);
      id = requestAnimationFrame(loop);
      const idx = activeRafIds.indexOf(id - 1);
      if (idx !== -1) activeRafIds[idx] = id;
    };
    id = requestAnimationFrame(loop);
    activeRafIds.push(id);
    return id;
  }

  window.__enh_cancel_rafs = () => {
    activeRafIds.forEach(id => cancelAnimationFrame(id));
    activeRafIds.length = 0;
  };

  /* ── Preferences ─────────────────────────────────────── */
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarse = window.matchMedia("(hover:none),(pointer:coarse)").matches;

  /* ── Lenis smooth scroll ─────────────────────────────── */
  const lenis = new Lenis({
    lerp: 0.08,
    wheelMultiplier: 1,
    smoothWheel: true,
    smoothTouch: false,
  });

  window.lenis = lenis;

  let scrollY = 0;
  lenis.on("scroll", (e) => {
    scrollY = e.scroll;
  });  registerRaf((time) => {
    lenis.raf(time);
  });
  /* ── Add html.enh class ──────────────────────────────── */
  document.documentElement.classList.add("enh");

  /* ═══════════════════════════════════════════════════════
     Custom cursor + Text Badge (skip on coarse)
     ═══════════════════════════════════════════════════════ */
  let badge, cursorSvg;
  if (!isCoarse) {
    document.querySelectorAll(".enh-cursor-badge, .enh-smooth-cursor").forEach(e => e.remove());

    cursorSvg = document.createElement("div");
    cursorSvg.className = "enh-smooth-cursor";
    // Clean filterless SVG mapped slightly smaller so it doesn't get pixelated
    cursorSvg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="34" viewBox="0 0 50 54" fill="none"><path d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z" fill="black"/><path d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z" stroke="white" strokeWidth="2.25"/></svg>`;
    document.body.appendChild(cursorSvg);

    badge = document.createElement("div");
    badge.className = "enh-cursor-badge";
    document.body.appendChild(badge);

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let dx = mx, dy = my;
    let prevAngle = 0;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (cursorSvg.style.opacity !== "1") cursorSvg.style.opacity = "1";
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
      cursorSvg.style.opacity = "0";
      badge.style.opacity = "0";
    }, { passive: true });

    const hoverSelector = "a,button,[role='button'],input,textarea,select,.enh-card,.enh-magnet,[data-cursor]";

    document.addEventListener("mouseover", (e) => {
      const target = e.target.closest ? e.target.closest(hoverSelector) : null;
      if (target) {
        document.documentElement.classList.add("enh-hover");

        // Custom cursor badges
        const cursorType = target.getAttribute("data-cursor");
        if (cursorType) {
          if (cursorType === "view") {
            badge.textContent = "VIEW ↗";
            badge.classList.add("visible");
          } else if (cursorType === "drag") {
            badge.textContent = "DRAG ↔";
            badge.classList.add("visible");
          } else if (cursorType === "external") {
            badge.textContent = "VISIT ↗";
            badge.classList.add("visible");
          } else {
            badge.textContent = cursorType;
            badge.classList.add("visible");
          }
        }
      }
    }, { passive: true });

    document.addEventListener("mouseout", (e) => {
      const target = e.target.closest ? e.target.closest(hoverSelector) : null;
      if (target) {
        document.documentElement.classList.remove("enh-hover");
        badge.classList.remove("visible");
      }
    }, { passive: true });

    document.addEventListener("mousedown", () => {
      document.documentElement.classList.add("enh-down");
    }, { passive: true });

    document.addEventListener("mouseup", () => {
      document.documentElement.classList.remove("enh-down");
    }, { passive: true });

    registerRaf(() => {
      // Smooth physics (lerp)
      const vx = (mx - dx);
      const vy = (my - dy);
      dx += vx * 0.45;
      dy += vy * 0.45;

      let rot = prevAngle;
      const speed = Math.sqrt(vx * vx + vy * vy);
      
      if (speed > 1.5) {
        const targetAngle = Math.atan2(vy, vx) * (180 / Math.PI) + 90;
        
        // Correct angle wrapping to find the shortest path
        let diff = targetAngle - prevAngle;
        diff = ((diff + 180) % 360 + 360) % 360 - 180;
        
        // Apply smooth rotation (lerping the angle)
        rot = prevAngle + diff * 0.15;
        prevAngle = rot;
      }

      cursorSvg.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%) rotate(${rot}deg)`;
      badge.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    });
  }

  /* ═══════════════════════════════════════════════════════
     Scroll progress bar (skip on mobile < 768)
     ═══════════════════════════════════════════════════════ */
  const progressBar = document.createElement("div");
  progressBar.className = "enh-progress";
  document.body.appendChild(progressBar);

  /* ═══════════════════════════════════════════════════════
     Section indicator pill
     ═══════════════════════════════════════════════════════ */
  const indicator = document.createElement("div");
  indicator.className = "enh-section-indicator hidden";
  document.body.appendChild(indicator);

  let lastIndicatorLabel = "";

  /* ═══════════════════════════════════════════════════════
     DOM instrumentation — runs once on load
     ═══════════════════════════════════════════════════════ */
  function instrumentDOM() {
    /* ── Wrap images (SVG overlay + Ken Burns setup) ──── */
    document.querySelectorAll("img").forEach((img) => {
      if (img.parentElement && img.parentElement.classList.contains("enh-img")) return;
      if (img.closest(".enh-img")) return;

      const wrapper = document.createElement("span");
      wrapper.className = "enh-img";

      // Copy layout/positioning classes from img to wrapper
      const layoutClasses = [
        "absolute", "relative", "inset-0", "top-0", "left-0", "right-0", "bottom-0",
        "w-full", "h-full", "min-h-0", "min-h-full", "max-w-full"
      ];
      layoutClasses.forEach(cls => {
        if (img.classList.contains(cls)) {
          wrapper.classList.add(cls);
          if (cls === "absolute" || cls === "relative" || cls === "inset-0") {
            img.classList.remove(cls);
          }
        }
      });

      // Add view cursor support to image cards
      if (!img.hasAttribute("data-cursor") && (img.closest("a") || img.closest(".enh-card") || img.classList.contains("object-cover"))) {
        wrapper.setAttribute("data-cursor", "view");
      }

      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      img.loading = "lazy";
    });

    /* ── Sections: fade + numbering ──────────────────── */
    const topLevel = document.querySelectorAll("body > section, body > header, body > footer");
    topLevel.forEach((el, i) => {
      el.classList.add("enh-fade", "enh-section");

      // Skip adding section num if already exists
      if (!el.querySelector(".enh-section-num")) {
        const num = document.createElement("span");
        num.className = "enh-section-num";
        num.textContent = String(i + 1).padStart(2, "0");
        el.prepend(num);
      }

      /* Grid children stagger */
      const grid = el.querySelector(".grid, .architectural-grid");
      if (grid) {
        const children = Array.from(grid.children);
        children.forEach((child, ci) => {
          child.classList.add("enh-fade");
          child.classList.add(ci % 2 === 0 ? "enh-fade-l" : "enh-fade-r");
          child.style.transitionDelay = `${ci * 100}ms`;
        });
      }
    });
    /* ── Headline split (skips complex markup / icons) ── */
    const headlineSelector = "h1, h2, .headline-lg, .headline-lg-mobile, .display-xl";
    document.querySelectorAll(headlineSelector).forEach((h) => {
      if (h.querySelector(".enh-line-wrap")) return;

      // Skip if contains complex HTML (like spans, svg, links, buttons, etc.)
      const hasComplexChildren = Array.from(h.children).some(child =>
        child.tagName !== "BR" && child.tagName !== "SPAN"
      );
      if (hasComplexChildren) return;

      const html = h.innerHTML;
      const parts = html.split(/<br\s*\/?>/i);
      if (parts.length < 1) return;

      h.innerHTML = parts
        .map((part) => {
          // If part is empty or just whitespace, keep as-is
          if (!part.trim()) return "";
          return `<span class="enh-line-wrap"><span class="enh-line">${part}</span></span>`;
        })
        .join("");
    });


    /* ── Cards ───────────────────────────────────────── */
    document.querySelectorAll(".grid > div, article, .card").forEach((el) => {
      if (el.querySelector("img")) {
        el.classList.add("enh-card");
        if (!el.hasAttribute("data-cursor")) {
        }
      }
    });

    /* ── Nav links ───────────────────────────────────── */
    document.querySelectorAll("nav a").forEach((a) => {
      a.classList.add("enh-nav-link");
      if (a.hostname && a.hostname !== window.location.hostname) {
        a.setAttribute("data-cursor", "external");
      }
    });

  }
  /* ═══════════════════════════════════════════════════════
     Parallax & Ken Burns Viewport Trigger
     ═══════════════════════════════════════════════════════ */
  function setupParallaxAndKenBurns() {
    const vh = window.innerHeight;
    const images = Array.from(document.querySelectorAll("header img, section img"));

    // Set initial parallax speed values
    let speedIdx = 0;
    const speeds = [0.15, 0.2, 0.25, 0.3];
    images.forEach((img) => {
      if (!img.dataset.speed) {
        img.dataset.speed = speeds[speedIdx % speeds.length];
        speedIdx++;
      }
    });

    // Run initial positioning immediately to avoid jump on first scroll
    function updatePositions() {
      images.forEach((img) => {
        const rect = img.getBoundingClientRect();
        const rectMid = rect.top + rect.height / 2;
        const viewportMid = vh / 2;
        const speed = parseFloat(img.dataset.speed) || 0.2;
        const y = (rectMid - viewportMid) * -speed;

        // Apply immediately
        if (!prefersReduced && !isCoarse) {
          img.style.transform = `translate3d(0, ${y}px, 0) scale(1.08)`;
        }
      });
    }
    updatePositions();

    // IntersectionObserver to add class for Ken Burns & parallax state
    const imgObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const imgWrapper = entry.target;
        if (entry.isIntersecting) {
          if (!prefersReduced) {
            imgWrapper.classList.add("enh-kb");
          }
        } else {
          imgWrapper.classList.remove("enh-kb");
        }
      });
    }, { threshold: 0.01 });

    document.querySelectorAll(".enh-img").forEach(el => imgObs.observe(el));

    // Tick layout positioning on loop
    registerRaf(() => {
      updatePositions();
    });
  }

  /* ═══════════════════════════════════════════════════════
     IntersectionObserver — reveal elements
     ═══════════════════════════════════════════════════════ */
  function setupObservers() {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("enh-in");

            // Stagger child .enh-line elements
            const lines = entry.target.querySelectorAll(".enh-line");
            lines.forEach((line, i) => {
              line.style.transitionDelay = `${i * 120}ms`;
              requestAnimationFrame(() => {
                line.classList.add("enh-in");
              });
            });

            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );

    document
      .querySelectorAll(".enh-fade, .enh-fade-l, .enh-fade-r, .enh-img, .enh-section, h1, h2")
      .forEach((el) => revealObs.observe(el));
  }

  /* ═══════════════════════════════════════════════════════
     Section indicator pill via IntersectionObserver
     ═══════════════════════════════════════════════════════ */
  function setupSectionIndicatorObserver() {
    const sectionObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sec = entry.target;
          // Try data-section, then heading text, then tag name
          const label =
            sec.getAttribute("data-section") ||
            (sec.querySelector("h1, h2, h3, h4") || {}).textContent ||
            sec.tagName.toLowerCase();

          const trimmed = label.trim().substring(0, 40);

          if (trimmed !== lastIndicatorLabel) {
            indicator.classList.add("hidden");
            setTimeout(() => {
              indicator.textContent = trimmed;
              indicator.classList.remove("hidden");
              lastIndicatorLabel = trimmed;
            }, 180);
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "-20% 0px -40% 0px" // Focus on center/top quadrant
    });    document.querySelectorAll("section, header, footer").forEach(el => sectionObs.observe(el));
  }

  /* ═══════════════════════════════════════════════════════
     Editorial Intro Scroll Fade
     ═══════════════════════════════════════════════════════ */
  function setupEditorialScrollFade() {
    const text = document.getElementById("editorial-intro-text");
    if (!text || prefersReduced) return;

    registerRaf(() => {
      const rect = text.getBoundingClientRect();
      const vh = window.innerHeight;

      const textCenter = rect.top + rect.height / 2;
      const viewCenter = vh / 2;
      const distance = Math.abs(viewCenter - textCenter);
      const maxDistance = vh / 1.2;

      let opacity = 1 - (distance / maxDistance);
      opacity = Math.max(0, Math.min(1, opacity));

      // Slight vertical drift to complement the fade
      const yOffset = (textCenter - viewCenter) * 0.15;

      text.style.opacity = opacity.toFixed(3);
      text.style.transform = `translate3d(0, ${yOffset}px, 0)`;
      // Override intersection observer styles just in case
      text.style.willChange = "opacity, transform";
    });
  }

  /* ═══════════════════════════════════════════════════════
     Refinements Slider (Manual Infinite Scroll)
     ═══════════════════════════════════════════════════════ */
  function setupRefinementsSlider() {
    const scrollContainer = document.getElementById("refinements-scroll");
    const wrapper = document.getElementById("refinements-wrapper");
    if (!scrollContainer || !wrapper) return;

    const children = Array.from(scrollContainer.children);
    
    // Add snap alignment to original items
    children.forEach(child => child.classList.add("snap-center", "shrink-0"));

    // Clone items twice to create 3 identical sets for seamless looping
    for (let i = 0; i < 2; i++) {
      children.forEach(child => {
        const clone = child.cloneNode(true);
        scrollContainer.appendChild(clone);
      });
    }

    // Handle seamless looping on scroll
    wrapper.addEventListener('scroll', () => {
      const setWidth = scrollContainer.scrollWidth / 3;
      
      // If user scrolls into the 3rd set, jump back exactly 1 set
      if (wrapper.scrollLeft >= setWidth * 2 - 10) {
        wrapper.style.scrollBehavior = 'auto'; // Disable smooth scroll
        wrapper.scrollLeft -= setWidth;
        requestAnimationFrame(() => wrapper.style.scrollBehavior = '');
      }
      // If user scrolls before the 1st set (at the very start), jump forward 1 set
      else if (wrapper.scrollLeft <= 10) {
        wrapper.style.scrollBehavior = 'auto';
        wrapper.scrollLeft += setWidth;
        requestAnimationFrame(() => wrapper.style.scrollBehavior = '');
      }
    });

    // After layout, set initial scroll to the start of the middle set
    setTimeout(() => {
      const setWidth = scrollContainer.scrollWidth / 3;
      wrapper.style.scrollBehavior = 'auto';
      wrapper.scrollLeft = setWidth;
      requestAnimationFrame(() => wrapper.style.scrollBehavior = '');
    }, 100);

    // Optional pointer drag-to-scroll functionality for desktop
    let isDown = false;
    let startX;
    let scrollLeft;

    wrapper.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - wrapper.offsetLeft;
      scrollLeft = wrapper.scrollLeft;
      // Temporarily disable snap and smooth scrolling while dragging
      wrapper.style.scrollSnapType = 'none';
      wrapper.style.scrollBehavior = 'auto';
    });

    wrapper.addEventListener('mouseleave', () => {
      if (!isDown) return;
      isDown = false;
      wrapper.style.scrollSnapType = '';
      wrapper.style.scrollBehavior = '';
    });

    wrapper.addEventListener('mouseup', () => {
      isDown = false;
      wrapper.style.scrollSnapType = '';
      wrapper.style.scrollBehavior = '';
    });

    wrapper.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - wrapper.offsetLeft;
      const walk = (x - startX) * 2.5; // drag speed multiplier
      wrapper.scrollLeft = scrollLeft - walk;
    });
  }

  /* ═══════════════════════════════════════════════════════
     Initialization
     ═══════════════════════════════════════════════════════ */
  function setupCounters() {
    const counterRe = /^([0-9][0-9,\.]*)\s*(.*)?$/;

    const counterObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;

          // Skip if already counted
          if (el.dataset.counted === "true") {
            counterObs.unobserve(el);
            return;
          }

          counterObs.unobserve(el);
          el.dataset.counted = "true";

          const text = el.textContent.trim();
          const match = text.match(counterRe);
          if (!match) return;

          const raw = match[1];
          const suffix = match[2] || "";
          const hasComma = raw.includes(",");
          const cleaned = raw.replace(/,/g, "");
          const decimalIdx = cleaned.indexOf(".");
          const decimals = decimalIdx >= 0 ? cleaned.length - decimalIdx - 1 : 0;
          const target = parseFloat(cleaned);

          if (target < 3) return;

          el.classList.add("enh-counting");
          const duration = 1800;
          const start = performance.now();

          function tick(now) {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
            let current = ease * target;

            let formatted;
            if (decimals > 0) {
              formatted = current.toFixed(decimals);
            } else {
              formatted = Math.round(current).toString();
            }

            if (hasComma) {
              const parts = formatted.split(".");
              parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              formatted = parts.join(".");
            }

            el.textContent = formatted + (suffix ? " " + suffix : "");

            if (t < 1) {
              requestAnimationFrame(tick);
            }
          }

          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.3 }
    );

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode(node) {
          if (node.children.length === 0 && counterRe.test(node.textContent.trim())) {
            const num = parseFloat(node.textContent.trim().replace(/,/g, ""));
            if (num >= 3) return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        },
      }
    );

    let node;
    while ((node = walker.nextNode())) {
      counterObs.observe(node);
    }
  }

  /* ═══════════════════════════════════════════════════════
     Hero stagger
     ═══════════════════════════════════════════════════════ */
  function setupHeroStagger() {
    const hero = document.querySelector("header, [class*='hero'], #hero");
    if (!hero) return;
    const children = Array.from(hero.children).slice(0, 6);
    const delays = [150, 300, 500, 650, 850, 1000];
    children.forEach((child, i) => {
      child.style.transitionDelay = `${delays[i] || 1000}ms`;
      child.classList.add("enh-fade");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          child.classList.add("enh-in");
        });
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     Nav frosted glass on scroll
     ═══════════════════════════════════════════════════════ */
  function setupNavFrost() {
    const nav = document.querySelector("nav");
    if (!nav) return;

    lenis.on("scroll", () => {
      if (scrollY > 60) {
        nav.classList.add("enh-nav-frosted");
      } else {
        nav.classList.remove("enh-nav-frosted");
      }
    });
  }

  /* ═══════════════════════════════════════════════════════
     Scroll-velocity tilt on cards
     ═══════════════════════════════════════════════════════ */
  function setupVelocityTilt() {
    if (prefersReduced || isCoarse) return;

    let lastY = 0;
    let velocity = 0;

    registerRaf(() => {
      velocity = scrollY - lastY;
      lastY = scrollY;
      velocity *= 0.9; // decay

      const cards = document.querySelectorAll(".enh-card");
      const clampedV = Math.max(-2, Math.min(2, velocity * 0.05));
      cards.forEach((card) => {
        if (Math.abs(clampedV) > 0.01) {
          card.style.transform = `perspective(900px) rotateY(${clampedV}deg)`;
        }
      });
    });  }

  /* ═══════════════════════════════════════════════════════
     Kinetic display typography (horizontal translate)
     ═══════════════════════════════════════════════════════ */
  function setupKineticTypography() {
    if (prefersReduced || isCoarse) return;

    const kineticTexts = document.querySelectorAll(".enh-kinetic-text");
    if (kineticTexts.length === 0) return;

    let timeOffset = 0;
    registerRaf(() => {
      timeOffset += 1.2; // Moderate running speed
      kineticTexts.forEach((text) => {
        // Translate based on time + page scrollY
        const offset = (timeOffset + scrollY * 0.1) % (window.innerWidth * 3);
        text.style.transform = `translate3d(${-offset}px, 0, 0)`;
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     Hero Canvas Scroll Sequence (Video 2)
     ═══════════════════════════════════════════════════════ */
  function setupHeroCanvasSequence() {
    const canvas = document.getElementById("hero-canvas");
    const container = document.getElementById("hero-scroll-container");
    if (!canvas || !container) return;
    const overlay = container.querySelector("#hero-text-overlay");

    const frameCount = 200;
    const images = [];
    let imagesLoaded = 0;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const rect = container.getBoundingClientRect();
      // Map the animation to the full container height so it continues playing WHILE the curtain slides up
      const scrollableDistance = container.offsetHeight - window.innerHeight;
      let progress = 0;
      if (rect.top <= 0) {
        progress = Math.abs(rect.top) / scrollableDistance;
      }
      progress = Math.max(0, Math.min(1, progress));
      const frameProgress = Math.max(0, (progress - 0.1) / 0.9);
      renderFrame(Math.min(frameCount - 1, Math.floor(frameProgress * frameCount)));

      const navPill = document.getElementById("main-nav-pill") || (window.parent && window.parent.document.getElementById("main-nav-pill"));
      if (navPill) {
        // Calculate when the curtain reveal starts (exactly 100vh before the container ends)
        const totalScrollableDistance = container.offsetHeight - window.innerHeight;
        const revealThreshold = totalScrollableDistance - window.innerHeight;
        
        if (rect.top > 0 || Math.abs(rect.top) < revealThreshold) {
          navPill.style.opacity = '0';
          navPill.style.setProperty('--tw-translate-y', '20px');
          navPill.style.pointerEvents = 'none';
        } else {
          navPill.style.opacity = '1';
          navPill.style.setProperty('--tw-translate-y', '0px');
          navPill.style.pointerEvents = 'auto';
        }
      }

      // Fade out blur smoothly within first ~33% of scroll
      const blurAmount = Math.max(0, 10 - progress * 3 * 10);
      canvas.style.filter = `blur(${blurAmount}px)`;

      if (overlay) {
        // Fade out smoothly within first ~33% of scroll
        const opacity = Math.max(0, 1 - progress * 3);
        overlay.style.transition = 'none'; // Prevent CSS transition from lagging the scroll-bound fade
        overlay.style.opacity = opacity;
      }
    }
    window.addEventListener('resize', resizeCanvas);

    function renderFrame(index) {
      if (!images[index] || !images[index].complete) return;
      const img = images[index];
      const ctx = canvas.getContext("2d");
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        offsetY = 0;
        offsetX = (canvas.width - drawWidth) / 2;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, "0");
      img.src = `/frames2/ezgif-frame-${frameNum}.jpg`;
      img.onload = () => {
        imagesLoaded++;
        if (i === 1) resizeCanvas();
      };
      images.push(img);
    }

    registerRaf(() => {
      const rect = container.getBoundingClientRect();
      
      // Map the animation to the full container height so it continues playing WHILE the curtain slides up
      const scrollableDistance = container.offsetHeight - window.innerHeight;

      let progress = 0;
      // If rect.top is > 0, we haven't reached the container yet (progress = 0).
      // When rect.top hits 0, it means the top of the container hit the top of the viewport.
      if (rect.top <= 0) {
        progress = Math.abs(rect.top) / scrollableDistance;
      }

      progress = Math.max(0, Math.min(1, progress));
      const frameProgress = Math.max(0, (progress - 0.1) / 0.9);
      const frameIndex = Math.min(frameCount - 1, Math.floor(frameProgress * frameCount));
      renderFrame(frameIndex);

      const navPill = document.getElementById("main-nav-pill") || (window.parent && window.parent.document.getElementById("main-nav-pill"));
      if (navPill) {
        // Calculate when the curtain reveal starts (exactly 100vh before the container ends)
        const totalScrollableDistance = container.offsetHeight - window.innerHeight;
        const revealThreshold = totalScrollableDistance - window.innerHeight;
        
        if (rect.top > 0 || Math.abs(rect.top) < revealThreshold) {
          navPill.style.opacity = '0';
          navPill.style.setProperty('--tw-translate-y', '20px');
          navPill.style.pointerEvents = 'none';
        } else {
          navPill.style.opacity = '1';
          navPill.style.setProperty('--tw-translate-y', '0px');
          navPill.style.pointerEvents = 'auto';
        }
      }

      // Fade out blur smoothly within first ~33% of scroll
      const blurAmount = Math.max(0, 10 - progress * 3 * 10);
      canvas.style.filter = `blur(${blurAmount}px)`;

      if (overlay) {
        // Fade out smoothly within first ~33% of scroll
        const opacity = Math.max(0, 1 - progress * 3);
        overlay.style.transition = 'none'; // Prevent CSS transition from lagging the scroll-bound fade
        overlay.style.opacity = opacity;
      }
    });

  }



  /* ═══════════════════════════════════════════════════════
     Second Canvas Hover Scroll Sequence
     ═══════════════════════════════════════════════════════ */
  function setupSecondCanvasSequence() {
    const canvas2 = document.getElementById("second-canvas");
    const container = document.getElementById("second-canvas-container");
    if (!canvas2 || !container) return;

    const frameCount = 151;
    const images = [];
    let imagesLoaded = 0;

    function renderFrame(index) {
      if (!images[index] || !images[index].complete) return;
      const img = images[index];
      const ctx = canvas2.getContext("2d");

      // Fix for High DPI screens
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas2.getBoundingClientRect();

      if (canvas2.width !== rect.width * dpr || canvas2.height !== rect.height * dpr) {
        canvas2.width = rect.width * dpr;
        canvas2.height = rect.height * dpr;
      }

      ctx.clearRect(0, 0, canvas2.width, canvas2.height);
      ctx.drawImage(img, 0, 0, canvas2.width, canvas2.height);
    }

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, "0");
      img.src = `/exterior frames/ezgif-frame-${frameNum}.jpg`;
      img.onload = () => {
        imagesLoaded++;
        if (i === 1) renderFrame(0);
      };
      images.push(img);
    }

    let canvas2VirtualScroll = 0;
    const canvas2MaxScroll = 1200;

    canvas2.addEventListener("mouseenter", () => {
      lenis.stop();
    });

    canvas2.addEventListener("mouseleave", () => {
      lenis.start();
    });
    canvas2.addEventListener("wheel", (e) => {
      e.preventDefault();
      canvas2VirtualScroll += e.deltaY;
      canvas2VirtualScroll = Math.max(0, Math.min(canvas2MaxScroll, canvas2VirtualScroll));

      const progress2 = canvas2VirtualScroll / canvas2MaxScroll;
      const frameIndex = Math.min(frameCount - 1, Math.floor(progress2 * frameCount));
      renderFrame(frameIndex);
    }, { passive: false });

    // Initial render call in case it's already in view on load
    renderFrame(0);
  }

  /* ═══════════════════════════════════════════════════════
     Reception Canvas Scroll Sequence (Atrium Arrival)
     ═══════════════════════════════════════════════════════ */
  function setupReceptionCanvasSequence() {
    const canvas = document.getElementById("reception-canvas");
    if (!canvas) return;

    const frameCount = 240;
    const images = [];
    let imagesLoaded = 0;

    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      updateFrame();
    }
    window.addEventListener('resize', resizeCanvas);

    function renderFrame(index) {
      if (!images[index] || !images[index].complete) return;
      const img = images[index];
      const ctx = canvas.getContext("2d");
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        offsetY = 0;
        offsetX = (canvas.width - drawWidth) / 2;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, "0");
      img.src = `/reception-frames/ezgif-frame-${frameNum}.jpg`;
      img.onload = () => {
        imagesLoaded++;
        if (i === 1) resizeCanvas();
      };
      images.push(img);
    }

    let canvasVirtualScroll = 0;
    const canvasMaxScroll = frameCount * 15; // sensitivity

    canvas.addEventListener("mouseenter", () => {
      lenis.stop();
    });

    canvas.addEventListener("mouseleave", () => {
      lenis.start();
    });
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      canvasVirtualScroll += e.deltaY;
      canvasVirtualScroll = Math.max(0, Math.min(canvasMaxScroll, canvasVirtualScroll));

      const progress = canvasVirtualScroll / canvasMaxScroll;
      const frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount));
      renderFrame(frameIndex);
    }, { passive: false });
  }

  /* ═══════════════════════════════════════════════════════
     Construction Canvas Scroll Sequence (Project Evolution)
     ═══════════════════════════════════════════════════════ */
  function setupConstructionCanvasSequence() {
    const canvas = document.getElementById("construction-canvas");
    const section = document.getElementById("construction-section");
    if (!canvas || !section) return;

    if (!isCoarse) {
      section.addEventListener("mouseenter", () => {
        document.documentElement.classList.add("enh-cursor-light");
      });

      section.addEventListener("mouseleave", () => {
        document.documentElement.classList.remove("enh-cursor-light");
      });
    }

    const frameCount = 300;
    const images = [];
    let imagesLoaded = 0;

    function updateFrame() {
      const rect = section.getBoundingClientRect();
      const scrollableDistance = section.offsetHeight - window.innerHeight;
      let progress = 0;

      if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
        progress = Math.abs(rect.top) / scrollableDistance;
      } else if (rect.bottom < window.innerHeight) {
        progress = 1;
      }

      progress = Math.max(0, Math.min(1, progress));
      const frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount));
      renderFrame(frameIndex);
    }

    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      updateFrame();
    }
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', updateFrame);
    if (typeof lenis !== 'undefined') {
      lenis.on('scroll', updateFrame);
    }

    function renderFrame(index) {
      if (!images[index] || !images[index].complete) return;
      const img = images[index];
      const ctx = canvas.getContext("2d");
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        offsetY = 0;
        offsetX = (canvas.width - drawWidth) / 2;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, "0");
      img.src = `/new construction/ezgif-frame-${frameNum}.jpg`;
      img.onload = () => {
        imagesLoaded++;
        if (i === 1) resizeCanvas();
      };
      images.push(img);
    }
  }

  /* ═══════════════════════════════════════════════════════
     Scroll updates (progress bar)
     ═══════════════════════════════════════════════════════ */
  function setupProgressScroll() {
    lenis.on("scroll", () => {
      if (window.innerWidth < 768) return;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const max = docH - winH;
      const pct = max > 0 ? (scrollY / max) * 100 : 0;
      progressBar.style.height = `${pct}%`;
    });
  }

  /* ═══════════════════════════════════════════════════════
     Init everything on DOM ready
     ═══════════════════════════════════════════════════════ */
  function init() {
    instrumentDOM();
    setupObservers();
    setupCounters();
    setupHeroStagger();
    setupNavFrost();
    setupProgressScroll();
    setupParallaxAndKenBurns();
    setupSectionIndicatorObserver();
    
    setupVelocityTilt();
    setupKineticTypography();
    setupEditorialScrollFade();
    setupRefinementsSlider();
    setupHeroCanvasSequence();
    setupSecondCanvasSequence();
    setupReceptionCanvasSequence();
    setupConstructionCanvasSequence();
    setupFloorTabs();
  }

  /* ═══════════════════════════════════════════════════════
     Interactive Floor Tabs Logic
     ═══════════════════════════════════════════════════════ */
  function setupFloorTabs() {
    const tabsContainer = document.getElementById("floor-tabs");
    if (!tabsContainer) return;

    const floorImage = document.getElementById("floor-image");
    const textContainer = document.getElementById("floor-text-container");
    const titleEl = document.getElementById("floor-title");
    const descEl = document.getElementById("floor-desc");
    const featuresEl = document.getElementById("floor-features");

    const floorData = {
      "7": {
        title: "Diagnostic Core",
        desc: "The seventh level is engineered to support advanced imaging and diagnostics, featuring structural reinforcements and specialized acoustic damping to isolate sensitive equipment.",
        features: [
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> 1.5T MRI Suite</li>',
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> High-Resolution CT</li>',
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Pathology Laboratory</li>'
        ],
        image: "/images/level_07_bw_1784138300684.png"
      },
      "6": {
        title: "General Wards",
        desc: "The sixth level offers premium general wards designed for patient comfort and continuous monitoring. Optimized for natural light and rapid nursing response.",
        features: [
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Private Recovery Rooms</li>',
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Centralized Nursing Station</li>',
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Patient Lounge Area</li>'
        ],
        image: "/images/level_06_bw_1784138140906.png"
      },
      "5": {
        title: "Maternity & Pediatrics",
        desc: "A specialized wing dedicated to maternal and pediatric care, featuring family-friendly spaces and neonatal intensive care support.",
        features: [
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Labor & Delivery Suites</li>',
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Level III NICU</li>',
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Pediatric Play Area</li>'
        ],
        image: "/images/level_05_bw_1784138126610.png"
      },
      "4": {
        title: "Intensive Care Unit (ICU)",
        desc: "Level four houses the high-acuity Intensive Care Unit, equipped with life-support technologies and advanced monitoring for critical patients.",
        features: [
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Isolation Rooms</li>',
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Advanced Telemetry</li>',
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Family Consultation Pods</li>'
        ],
        image: "/images/level_04_bw_1784138113549.png"
      },
      "3": {
        title: "Cardiology & Diagnostics",
        desc: "Dedicated to cardiovascular care, this floor features specialized cath labs and non-invasive cardiac diagnostic equipment.",
        features: [
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Cardiac Catheterization Lab</li>',
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Echo & Stress Test Rooms</li>',
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Cardiac Rehabilitation Center</li>'
        ],
        image: "/images/level_03_bw_1784138091576.png"
      },
      "2": {
        title: "Outpatient Clinics",
        desc: "Designed for high throughput, the second level hosts multiple specialist consultation suites and minor procedure rooms.",
        features: [
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Multi-Specialty Consultation</li>',
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Minor Procedure Rooms</li>',
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Express Pharmacy</li>'
        ],
        image: "/images/level_02_bw_1784138077192.png"
      },
      "1": {
        title: "Emergency & Trauma",
        desc: "The ground floor provides rapid access for emergency and trauma cases, featuring specialized resuscitation bays and immediate triage zones.",
        features: [
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> 24/7 Trauma Bay</li>',
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Ambulance Drop-off Access</li>',
          '<li class="flex items-center gap-4"><span class="w-2 h-2 bg-primary"></span> Fast-Track Triage</li>'
        ],
        image: "/images/level_01_bw_1784138063902.png"
      }
    };

    let isAnimating = false;

    tabsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest("button.floor-tab");
      if (!btn || isAnimating) return;

      const level = btn.getAttribute("data-level");
      const data = floorData[level];
      if (!data) return;

      // Update button styles
      tabsContainer.querySelectorAll("button.floor-tab").forEach(b => {
        b.className = "floor-tab text-on-surface-variant hover:text-primary transition-colors";
      });
      btn.className = "floor-tab border-b-2 border-primary pb-2 -mb-[18px] transition-colors";

      // Animate out
      isAnimating = true;
      floorImage.style.opacity = "0";
      textContainer.style.opacity = "0";

      setTimeout(() => {
        // Swap content
        floorImage.style.backgroundImage = `url('${data.image}')`;
        titleEl.textContent = data.title;
        descEl.textContent = data.desc;
        featuresEl.innerHTML = data.features.join("");

        // Animate in
        floorImage.style.opacity = "0.9";
        textContainer.style.opacity = "1";

        setTimeout(() => {
          isAnimating = false;
        }, 500);
      }, 500);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
