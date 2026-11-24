/**
 * VIBE PlayTop Magic - Spatial D-Pad Navigation Engine
 * Emulates Android TV remote control, focus lifecycle, audio-visual feedback, and backstack
 */

class TVNavigationEngine {
  constructor() {
    this.currentFocus = null;
    this.activeScope = "body";
    this.backStack = [];
    this.isVirtualRemoteVisible = true;
    this.soundEnabled = true;

    this.initAudio();
    this.initKeyboardListeners();
  }

  initAudio() {
    // Web Audio API synthesized subtle TV click sounds without external mp3 dependencies
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    } catch (e) {
      this.audioCtx = null;
    }
  }

  playBeep(type = "focus") {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      if (type === "focus") {
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === "click") {
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.07);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === "back") {
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.06);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch (e) {
      // Audio playback failsafe
    }
  }

  initKeyboardListeners() {
    window.addEventListener("keydown", (e) => {
      // Holding an arrow key: step at a steady, readable pace instead of the
      // OS auto-repeat rate (which made focus race across the rails)
      if (e.repeat && /^Arrow/.test(e.key)) {
        const now = performance.now();
        if (now - (this._lastRepeat || 0) < 190) { e.preventDefault(); return; }
        this._lastRepeat = now;
      }
      // Ignore navigation keys if an active text input is being edited manually
      if (document.activeElement && document.activeElement.tagName === "INPUT" && !e.target.classList.contains("tv-keyboard-key")) {
        if (e.key === "Escape") {
          e.preventDefault();
          this.handleBack();
        }
        return;
      }

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          this.move("UP");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          this.move("DOWN");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          this.move("LEFT");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          this.move("RIGHT");
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          this.handleEnter();
          break;
        case "Escape":
        case "Backspace":
          e.preventDefault();
          this.handleBack();
          break;
        case "r":
        case "R":
          if (e.ctrlKey || e.metaKey) return;
          this.toggleVirtualRemote();
          break;
        case "h":
        case "H":
          if (!e.ctrlKey && !e.metaKey) {
            window.app && window.app.showScreen("home");
          }
          break;
      }
    });
  }

  setScope(selector) {
    this.activeScope = selector || "body";
  }

  getFocusableElements() {
    const root = document.querySelector(this.activeScope) || document.body;
    const candidates = Array.from(root.querySelectorAll(".focusable, button, a[href], [tabindex='0']"));
    
    // Filter visible elements
    return candidates.filter((el) => {
      if (el.disabled || el.getAttribute("aria-hidden") === "true") return false;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" && rect.width > 0 && rect.height > 0;
    });
  }

  focus(element, preventScroll = false) {
    if (!element) return;

    if (this.currentFocus && this.currentFocus !== element) {
      this.currentFocus.classList.remove("tv-focused", "focused");
      this.currentFocus.blur();
    }

    this.currentFocus = element;
    element.classList.add("tv-focused", "focused");
    element.focus({ preventScroll: true });

    this.playBeep("focus");

    // Manage dynamic left sidebar auto-expansion (Wireframe: media_1794041586089_3f180628.png)
    const navBar = document.querySelector(".side-navigation");
    if (navBar) {
      if (element.closest(".side-navigation")) {
        navBar.classList.add("nav-expanded");
      } else {
        navBar.classList.remove("nav-expanded");
      }
    }

    // Smooth horizontal rail and vertical page scrolling
    if (!preventScroll) {
      this.scrollIntoViewSmart(element);
    }

    // Trigger custom event for apps to hook into focus changes (e.g., updating hero background)
    const evt = new CustomEvent("tv-focus-change", { detail: { element } });
    element.dispatchEvent(evt);
    document.dispatchEvent(evt);
  }

  /**
   * Eased scroll for rails and pages (replaces the browser's quick native
   * smooth scroll). A new call on the same element/axis retargets the
   * running animation from where it is, so fast key presses stay fluid.
   */
  easeScroll(el, axis, target, duration) {
    const prop = axis === "x" ? "scrollLeft" : "scrollTop";
    const max = axis === "x" ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
    const to = Math.max(0, Math.min(max, Math.round(target)));
    const st = el._tvEase || (el._tvEase = {});
    if (st[axis]) cancelAnimationFrame(st[axis]);
    const from = el[prop];
    if (Math.abs(to - from) < 1) { st[axis] = 0; return; }
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el[prop] = to; st[axis] = 0; return;
    }
    // easeInOutCubic: soft start, glide, soft landing
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el[prop] = from + (to - from) * ease(t);
      st[axis] = t < 1 ? requestAnimationFrame(step) : 0;
    };
    st[axis] = requestAnimationFrame(step);
  }

  scrollIntoViewSmart(element) {
    // 0. FAQ Modal items: use nearest block to prevent jumpy offset
    if (element.closest(".help-faq-scroll, .acc-info-body")) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }

    // 1. Check if inside horizontal rail
    const rail = element.closest(".horizontal-rail, .rail-scroll, .keyboard-row, .epg-timeline-row");
    if (rail) {
      const railRect = rail.getBoundingClientRect();
      const elRect = element.getBoundingClientRect();
      const offset = (elRect.left + elRect.width / 2) - (railRect.left + railRect.width / 2);
      this.easeScroll(rail, "x", rail.scrollLeft + offset, 520);
    }

    // 2. Vertical container scroll
    const verticalContainer = element.closest(".scrollable-content, .screen-container, .epg-channels-container");
    if (verticalContainer) {
      // Special smart scrolling for Home Screen and SITI OTT Screen when Dynamic Preview is active
      const isOttMain = verticalContainer.id === "vott-main";
      const isHomeMain = verticalContainer.id === "home-main";

      if (isHomeMain || isOttMain) {
        const dynPreview = document.getElementById(isOttMain ? "vott-dynamic-preview" : "home-dynamic-preview");
        const previewBar = document.getElementById(isOttMain ? "vott-sticky-preview-bar" : "home-sticky-preview-bar") || dynPreview;
        const heroBanner = isOttMain ? document.getElementById("vott-hero") : document.querySelector(".hero-banner-section");
        const isPreviewActive = previewBar && !previewBar.hidden && 
                                heroBanner && heroBanner.classList.contains("hero-banner-collapsed");

        if (isPreviewActive) {
          const topRailSelector = isOttMain ? "#vott-rails .content-rail:first-of-type" : "#section-recently-watched, .content-rail:first-of-type";
          // If focusing top rail, always lock scrollTop to 0 so preview & top rail are 100% visible
          if (element.closest(topRailSelector)) {
            this.easeScroll(verticalContainer, "y", 0, 560);
            return;
          }

          // For lower rails, scroll so the rail is nicely centered in the visible area below the fixed top preview bar
          const previewRect = previewBar.getBoundingClientRect();
          const previewBottom = previewRect.bottom;
          const availableHeight = window.innerHeight - previewBottom;
          const targetCenterY = previewBottom + availableHeight / 2;
          const elRect = element.getBoundingClientRect();
          const elCenterY = elRect.top + elRect.height / 2;
          const verticalOffset = elCenterY - targetCenterY;
          this.easeScroll(verticalContainer, "y", verticalContainer.scrollTop + verticalOffset, 560);
          return;
        }
      }

      const containerRect = verticalContainer.getBoundingClientRect();
      const elRect = element.getBoundingClientRect();
      const verticalOffset = (elRect.top + elRect.height / 2) - (containerRect.top + containerRect.height / 2);
      this.easeScroll(verticalContainer, "y", verticalContainer.scrollTop + verticalOffset, 560);
    } else {
      element.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }

  move(direction) {
    // Let the app consume directional keys first (e.g. hero slide Left/Right)
    if (window.app && typeof window.app.handleDirectionalKey === "function" && window.app.handleDirectionalKey(direction)) return;

    const focusables = this.getFocusableElements();
    if (!focusables.length) return;

    if (!this.currentFocus || !document.contains(this.currentFocus) || !focusables.includes(this.currentFocus)) {
      this.focus(focusables[0]);
      return;
    }

    const currentRect = this.currentFocus.getBoundingClientRect();
    const currentCenter = {
      x: currentRect.left + currentRect.width / 2,
      y: currentRect.top + currentRect.height / 2
    };

    let bestCandidate = null;
    let minDistance = Infinity;
    // Full-width blocks (e.g. promo banners) are "nav-wide": horizontal distance
    // is measured to their edges, not their centre, so they are reachable from
    // any tile above/below them, and leaving one lands on the nearest visible tile.
    const curWide = this.currentFocus.classList.contains("nav-wide");
    const clampX = (x, r) => Math.min(Math.max(x, r.left), r.right);

    for (const candidate of focusables) {
      if (candidate === this.currentFocus) continue;

      const rect = candidate.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };

      let dx = center.x - currentCenter.x;
      if (direction === "UP" || direction === "DOWN") {
        if (candidate.classList.contains("nav-wide")) dx = clampX(currentCenter.x, rect) - currentCenter.x;
        else if (curWide) dx = center.x - clampX(center.x, currentRect);
      }
      const dy = center.y - currentCenter.y;

      let isCandidate = false;
      let primaryDist = 0;
      let secondaryDist = 0;

      if (direction === "RIGHT" && dx > 8) {
        isCandidate = true;
        primaryDist = dx;
        secondaryDist = Math.abs(dy);
      } else if (direction === "LEFT" && dx < -8) {
        isCandidate = true;
        primaryDist = Math.abs(dx);
        secondaryDist = Math.abs(dy);
      } else if (direction === "DOWN" && dy > 8) {
        isCandidate = true;
        primaryDist = dy;
        secondaryDist = Math.abs(dx);
      } else if (direction === "UP" && dy < -8) {
        isCandidate = true;
        primaryDist = Math.abs(dy);
        secondaryDist = Math.abs(dx);
      }

      if (isCandidate) {
        // Spatial distance weighting: Heavily penalize off-axis deviation
        const weightedScore = (primaryDist * 1.0) + (secondaryDist * 2.8);
        if (weightedScore < minDistance) {
          minDistance = weightedScore;
          bestCandidate = candidate;
        }
      }
    }

    if (bestCandidate) {
      this.focus(bestCandidate);
    } else {
      // Provide bounce feedback at boundary
      this.currentFocus.classList.add("edge-bounce");
      setTimeout(() => this.currentFocus && this.currentFocus.classList.remove("edge-bounce"), 200);
    }
  }

  handleEnter() {
    // Let the app consume OK first (e.g. live player: OK brings up the controls)
    if (window.app && typeof window.app.handleEnterKey === "function" && window.app.handleEnterKey()) return;
    if (!this.currentFocus) return;
    this.playBeep("click");
    this.currentFocus.classList.add("tv-pressed");
    setTimeout(() => this.currentFocus && this.currentFocus.classList.remove("tv-pressed"), 180);
    this.currentFocus.click();
  }

  handleBack() {
    this.playBeep("back");
    if (window.app && typeof window.app.handleBackKey === "function") {
      window.app.handleBackKey();
    }
  }

  toggleVirtualRemote() {
    const remoteEl = document.getElementById("virtual-remote-widget");
    if (remoteEl) {
      this.isVirtualRemoteVisible = !this.isVirtualRemoteVisible;
      remoteEl.classList.toggle("remote-minimized", !this.isVirtualRemoteVisible);
    }
  }
}

// Global instance
window.tvEngine = new TVNavigationEngine();
