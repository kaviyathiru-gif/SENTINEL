/**
 * Sentinel - Swiper Controller
 * Manages website navigation and swiping
 */

class SentinelSwiperController {
    constructor() {
        this.currentIndex = 0;
        this.totalSites = 10;
        this.siteNames = [];
        this.onSiteChange = null;
        this.isAnimating = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
    }

    /**
     * Initialize swiper
     */
    initialize(siteNames, onSiteChange) {
        this.siteNames = siteNames || [];
        this.totalSites = this.siteNames.length;
        this.onSiteChange = onSiteChange || function() {};
        
        this.setupEventListeners();
        this.setupTouchEvents();
        this.updateUI();
        
        console.log('✅ Swiper initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Previous button
        const prevBtn = document.getElementById('prevSiteBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previous());
        }
        
        // Next button
        const nextBtn = document.getElementById('nextSiteBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.next());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previous();
            } else if (e.key === 'ArrowRight') {
                this.next();
            }
        });
    }

    /**
     * Setup touch events for swiping
     */
    setupTouchEvents() {
        const swiperSection = document.querySelector('.swiper-section');
        if (!swiperSection) return;
        
        swiperSection.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        swiperSection.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
        
        // Mouse swipe support
        let isMouseDown = false;
        let mouseStartX = 0;
        
        swiperSection.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            mouseStartX = e.screenX;
        });
        
        swiperSection.addEventListener('mouseup', (e) => {
            if (isMouseDown) {
                const mouseEndX = e.screenX;
                const diff = mouseStartX - mouseEndX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) this.next();
                    else this.previous();
                }
                isMouseDown = false;
            }
        });
        
        swiperSection.addEventListener('mouseleave', () => {
            isMouseDown = false;
        });
    }

    /**
     * Handle swipe gesture
     */
    handleSwipe() {
        const diff = this.touchStartX - this.touchEndX;
        const threshold = 50;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.previous();
            }
        }
    }

    /**
     * Go to next site
     */
    next() {
        if (this.isAnimating) return;
        this.currentIndex = (this.currentIndex + 1) % this.totalSites;
        this.updateUI();
        this.onSiteChange(this.currentIndex);
    }

    /**
     * Go to previous site
     */
    previous() {
        if (this.isAnimating) return;
        this.currentIndex = (this.currentIndex - 1 + this.totalSites) % this.totalSites;
        this.updateUI();
        this.onSiteChange(this.currentIndex);
    }

    /**
     * Go to specific site
     */
    goTo(index) {
        if (this.isAnimating || index < 0 || index >= this.totalSites) return;
        this.currentIndex = index;
        this.updateUI();
        this.onSiteChange(this.currentIndex);
    }

    /**
     * Update UI
     */
    updateUI() {
        const siteName = document.getElementById('currentSiteName');
        const siteCounter = document.getElementById('siteCounter');
        const statusDot = document.getElementById('siteStatusDot');
        const threatLevel = document.getElementById('threatLevel');
        
        if (siteName && this.siteNames[this.currentIndex]) {
            siteName.textContent = this.siteNames[this.currentIndex];
        }
        
        if (siteCounter) {
            siteCounter.textContent = `${this.currentIndex + 1} / ${this.totalSites}`;
        }
        
        // Update status dot (random for demo)
        if (statusDot) {
            const statuses = ['online', 'online', 'online', 'warning', 'online'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            statusDot.style.background = status === 'online' ? '#00e676' : '#ffab00';
            statusDot.style.boxShadow = status === 'online' ? 
                '0 0 12px rgba(0, 230, 118, 0.3)' : 
                '0 0 12px rgba(255, 171, 0, 0.3)';
        }
        
        // Update threat level (random for demo)
        if (threatLevel) {
            const levels = ['🟢 Low Risk', '🟡 Medium Risk', '🔴 High Risk', '🟢 Low Risk', '🟢 Low Risk'];
            const level = levels[Math.floor(Math.random() * levels.length)];
            threatLevel.textContent = level;
            
            // Update color
            const colors = {
                '🟢': 'rgba(0, 230, 118, 0.1)',
                '🟡': 'rgba(255, 171, 0, 0.1)',
                '🔴': 'rgba(255, 23, 68, 0.1)'
            };
            const color = colors[level.charAt(0)] || 'rgba(0, 230, 118, 0.1)';
            threatLevel.style.background = color;
            threatLevel.style.borderColor = color.replace('0.1', '0.2');
        }
    }

    /**
     * Get current site index
     */
    getCurrentIndex() {
        return this.currentIndex;
    }

    /**
     * Get current site name
     */
    getCurrentSite() {
        return this.siteNames[this.currentIndex] || null;
    }

    /**
     * Get total sites
     */
    getTotalSites() {
        return this.totalSites;
    }

    /**
     * Set animation state
     */
    setAnimating(state) {
        this.isAnimating = state;
        const buttons = document.querySelectorAll('.swiper-nav button');
        buttons.forEach(btn => {
            btn.disabled = state;
            btn.style.opacity = state ? '0.6' : '1';
        });
    }
}

// Create singleton instance
const swiperController = new SentinelSwiperController();

// Export
window.SentinelSwiper = {
    controller: swiperController,
    init: (sites, callback) => swiperController.initialize(sites, callback),
    next: () => swiperController.next(),
    previous: () => swiperController.previous(),
    goTo: (index) => swiperController.goTo(index),
    getCurrent: () => swiperController.getCurrentIndex(),
    getSite: () => swiperController.getCurrentSite()
};
