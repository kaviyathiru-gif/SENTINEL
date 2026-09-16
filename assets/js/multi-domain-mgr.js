/**
 * SENTINEL - Multi-Domain Slot Manager & Touch Gesture Switcher
 * Supports up to 10 concurrent monitored website profiles and
 * 10-workspace mobile horizontal swipe gestures.
 */

(function () {
  'use strict';

  class SentinelMultiDomainManager {
    constructor() {
      this.maxSlots = 10;
      this.currentSlotCount = 1;
      this.activeWorkspaceIndex = 0;
      this.touchStartX = 0;
      this.touchEndX = 0;

      this.init();
    }

    /**
     * Initialize DOM Slot Listeners & Mobile Touch Swipe Gesture Observers
     */
    init() {
      window.addEventListener('load', () => {
        this.updateSlotBadge();
        this.setupMobileGestureListeners();
      });
    }

    /**
     * Dynamically Add a New Monitored Domain Input Slot (Up to 10)
     */
    addDomainSlot() {
      if (this.currentSlotCount >= this.maxSlots) {
        alert('Maximum limit of 10 concurrent monitored domains reached.');
        return;
      }

      this.currentSlotCount++;
      const slotContainer = document.getElementById('domainSlotsContainer');
      if (!slotContainer) return;

      const slotElement = document.createElement('div');
      slotElement.className = 'flex items-center space-x-1.5 bg-slate-900/90 border border-cyber-border rounded-xl p-2 transition-all hover:border-purple-500/50';
      slotElement.id = `domain-slot-${this.currentSlotCount}`;
      slotElement.innerHTML = `
        <span class="text-[10px] font-mono text-cyan-400 font-bold">#${this.currentSlotCount}</span>
        <input 
          type="url" 
          id="url-input-${this.currentSlotCount}" 
          placeholder="https://site-${this.currentSlotCount}.org" 
          class="w-full bg-transparent border-none text-[11px] text-white focus:outline-none font-mono"
          onchange="SentinelDomainMgr.validateSlotUrl(${this.currentSlotCount})"
        >
        <button 
          onclick="SentinelDomainMgr.removeDomainSlot(${this.currentSlotCount})" 
          class="text-slate-500 hover:text-rose-400 text-xs px-1"
          title="Remove Slot"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;

      slotContainer.appendChild(slotElement);
      this.updateSlotBadge();
    }

    /**
     * Remove a Specific Domain Slot
     */
    removeDomainSlot(slotIndex) {
      if (this.currentSlotCount <= 1) {
        alert('At least 1 monitored slot must remain active.');
        return;
      }

      const slotElement = document.getElementById(`domain-slot-${slotIndex}`);
      if (slotElement) {
        slotElement.remove();
        this.currentSlotCount--;
        this.updateSlotBadge();
      }
    }

    /**
     * Validate Entered URL in Real-Time
     */
    validateSlotUrl(slotIndex) {
      const input = document.getElementById(`url-input-${slotIndex}`);
      if (!input) return;

      const urlValue = input.value.trim();
      const urlPattern = /^(https?:\/\/)?([\w.-]+)+[\w\-_~:/?#[\]@!$&'()*+,;=.]+$/i;

      if (urlValue && !urlPattern.test(urlValue)) {
        input.classList.add('text-rose-400');
        console.warn(`[SENTINEL DOMAIN MGR] Invalid URL format in slot #${slotIndex}: ${urlValue}`);
      } else {
        input.classList.remove('text-rose-400');
        console.log(`[SENTINEL DOMAIN MGR] Active slot #${slotIndex} updated to: ${urlValue}`);
      }
    }

    /**
     * Update Active Slot Counter Badge in Header
     */
    updateSlotBadge() {
      const badge = document.getElementById('slotCountBadge');
      if (badge) {
        badge.innerText = `${this.currentSlotCount} / ${this.maxSlots} Active Slots`;
      }
    }

    /**
     * Mobile Gesture Handler: Right/Left Touch Swiping across 10 Workspaces
     */
    setupMobileGestureListeners() {
      const wrapper = document.getElementById('mobileWorkspaceWrapper');
      const track = document.getElementById('workspaceTrack');
      if (!wrapper || !track) return;

      wrapper.addEventListener('touchstart', (e) => {
        this.touchStartX = e.touches[0].clientX;
      }, { passive: true });

      wrapper.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].clientX;
        this.handleSwipeGesture(track);
      }, { passive: true });
    }

    handleSwipeGesture(track) {
      const swipeDistance = this.touchStartX - this.touchEndX;
      const swipeThreshold = 50; // Minimum swipe distance in px

      // Swipe Right -> Next Workspace Slot
      if (swipeDistance > swipeThreshold && this.activeWorkspaceIndex < this.currentSlotCount - 1) {
        this.activeWorkspaceIndex++;
        this.updateWorkspacePosition(track);
      }
      // Swipe Left -> Previous Workspace Slot
      else if (swipeDistance < -swipeThreshold && this.activeWorkspaceIndex > 0) {
        this.activeWorkspaceIndex--;
        this.updateWorkspacePosition(track);
      }
    }

    updateWorkspacePosition(track) {
      const offset = this.activeWorkspaceIndex * (100 / this.maxSlots);
      track.style.transform = `translateX(-${offset}%)`;
      console.log(`[SENTINEL DOMAIN MGR] Swiped to Workspace #${this.activeWorkspaceIndex + 1}`);
    }
  }

  // Attach instance globally to window
  window.SentinelDomainMgr = new SentinelMultiDomainManager();
  
  // Shortcut function bindings for DOM onclick handlers
  window.addDomainSlot = () => window.SentinelDomainMgr.addDomainSlot();
})();
