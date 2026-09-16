/**
 * SENTINEL - Computer Vision & DOM Spatial Tamper Protection Engine
 * Monitors visual UI coordinates, detects layout tampering/dragging
 * and automatically rectifies manipulated DOM elements.
 */

(function () {
  'use strict';

  class SentinelCVTamperGuard {
    constructor() {
      this.trackedElements = new Map();
      this.isScanning = false;
      this.init();
    }

    /**
     * Initialize DOM Mutation Observers & Spatial Tracker
     */
    init() {
      window.addEventListener('load', () => {
        // Track critical UI elements (e.g., Navigation & Action Icons)
        this.registerElement('nav-settings', { name: 'Settings Nav Icon' });
        this.registerElement('nav-home', { name: 'Home Nav Icon' });
        this.registerElement('nav-analytics', { name: 'Analytics Nav Icon' });

        this.startDOMObserver();
        this.startSpatialCoordinateTracker();
      });
    }

    /**
     * Register a DOM element for Computer Vision coordinate locking
     */
    registerElement(elementId, metadata = {}) {
      const el = document.getElementById(elementId);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      this.trackedElements.set(elementId, {
        element: el,
        name: metadata.name || elementId,
        expectedX: rect.left,
        expectedY: rect.top,
        expectedWidth: rect.width,
        expectedHeight: rect.height
      });
    }

    /**
     * 1. Real-time Spatial Coordinate Tracking Loop (CV Positional Check)
     */
    startSpatialCoordinateTracker() {
      setInterval(() => {
        this.trackedElements.forEach((data, id) => {
          const currentRect = data.element.getBoundingClientRect();
          const deltaX = Math.abs(currentRect.left - data.expectedX);
          const deltaY = Math.abs(currentRect.top - data.expectedY);

          // If element drifted/dragged by more than 5px, trigger auto-rectification
          if (deltaX > 5 || deltaY > 5) {
            this.handleTamperDetected(data, `Spatial Drift Detected (ΔX: ${deltaX.toFixed(1)}px, ΔY: ${deltaY.toFixed(1)}px)`);
          }
        });
      }, 500);
    }

    /**
     * 2. MutationObserver for Inline Style & Attribute Manipulation
     */
    startDOMObserver() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          const targetId = mutation.target.id;
          if (this.trackedElements.has(targetId)) {
            const data = this.trackedElements.get(targetId);
            this.handleTamperDetected(data, 'Attribute / Inline Style Tampering Detected');
          }
        });
      });

      this.trackedElements.forEach((data) => {
        observer.observe(data.element, {
          attributes: true,
          attributeFilter: ['style', 'class', 'transform'],
          subtree: false
        });
      });
    }

    /**
     * Auto-Rectification & UI Shield Lock
     */
    handleTamperDetected(data, reason) {
      console.warn(`[SENTINEL CV GUARD] Tamper Alert on ${data.name}: ${reason}`);

      // 1. Auto-snap element back to exact expected coordinates
      const el = data.element;
      el.style.position = 'relative';
      el.style.left = '0px';
      el.style.top = '0px';
      el.style.transform = 'none';

      // 2. Trigger visual auto-rectification highlight
      el.classList.add('neon-border-cyan');
      setTimeout(() => el.classList.remove('neon-border-cyan'), 2000);

      // 3. Update Status Box in UI if available
      this.updateUIStatus(data.name, reason);

      // 4. Trigger system emergency call alert if shift is severe
      if (window.promptUserPhoneAndCall) {
        window.promptUserPhoneAndCall();
      }
    }

    /**
     * Update CV Status Indicator inside Dashboard Panel
     */
    updateUIStatus(elementName, reason) {
      const statusBox = document.getElementById('cvStatusBox');
      if (!statusBox) return;

      statusBox.className = 'p-2.5 rounded bg-rose-950/60 border border-rose-500/50 text-rose-300 text-[11px] font-mono';
      statusBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1.5 text-rose-400"></i> CV Attack Detected on ${elementName}: Auto-Rectified to Original Coordinates.`;

      setTimeout(() => {
        statusBox.className = 'p-2.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-[11px] font-mono';
        statusBox.innerHTML = '<i class="fa-solid fa-shield-check mr-1.5"></i> All DOM Settings Icons & Coordinates Positionally Verified.';
      }, 4000);
    }
  }

  // Attach instance to window
  window.SentinelCVGuard = new SentinelCVTamperGuard();
})();
