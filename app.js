/**
 * Sentinel - Main Application
 * ML/DL Network Intrusion Detection System
 */

class SentinelApp {
    constructor() {
        this.initialized = false;
        this.currentSite = 0;
        this.logs = [];
        this.compareMode = 'yearly';
        this.updateInterval = null;
        this.isTraining = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('🚀 Starting Sentinel ML/DL Intrusion Detection System...');
        
        try {
            // Step 1: Initialize Firebase
            await this.initFirebase();
            
            // Step 2: Initialize ML Engine
            await this.initMLEngine();
            
            // Step 3: Initialize Data Manager
            await this.initDataManager();
            
            // Step 4: Initialize UI
            this.initUI();
            
            // Step 5: Initialize Swiper
            this.initSwiper();
            
            // Step 6: Load initial data
            await this.loadInitialData();
            
            // Step 7: Start auto-refresh
            this.startAutoRefresh();
            
            // Step 8: Hide flash screen
            this.hideFlashScreen();
            
            this.initialized = true;
            console.log('✅ Sentinel initialized successfully');
            
        } catch (error) {
            console.error('❌ Sentinel initialization failed:', error);
            this.showError('Failed to initialize Sentinel. Please refresh the page.');
        }
    }

    /**
     * Initialize Firebase
     */
    async initFirebase() {
        if (window.SentinelFirebase) {
            const success = window.SentinelFirebase.init();
            if (success) {
                console.log('✅ Firebase initialized');
                // Update UI
                const dot = document.getElementById('firebaseDot');
                const text = document.getElementById('firebaseStatusText');
                if (dot) dot.className = 'dot online';
                if (text) text.textContent = 'Firebase: Connected';
            }
        }
        await this.delay(500);
    }

    /**
     * Initialize ML Engine
     */
    async initMLEngine() {
        if (window.SentinelML) {
            try {
                await window.SentinelML.init();
                console.log('✅ ML Engine initialized');
                
                // Update UI
                const dot = document.getElementById('mlDot');
                const text = document.getElementById('mlModelStatus');
                const accuracy = document.getElementById('detectionAccuracy');
                const engineStatus = document.getElementById('mlEngineStatus');
                
                if (dot) dot.className = 'dot online';
                if (text) {
                    const metrics = window.SentinelML.getMetrics();
                    text.textContent = `ML Model: v2.3.1 · ${(metrics.accuracy * 100).toFixed(1)}% accuracy`;
                }
                if (accuracy) {
                    const metrics = window.SentinelML.getMetrics();
                    accuracy.textContent = `${(metrics.accuracy * 100).toFixed(1)}%`;
                }
                if (engineStatus) {
                    engineStatus.textContent = 'Active';
                    engineStatus.style.color = '#00e676';
                }
            } catch (error) {
                console.warn('ML Engine init failed, using fallback:', error);
                const text = document.getElementById('mlModelStatus');
                if (text) text.textContent = 'ML Model: Using Fallback';
            }
        }
        await this.delay(500);
    }

    /**
     * Initialize Data Manager
     */
    async initDataManager() {
        if (window.SentinelData) {
            this.logs = await window.SentinelData.init();
            console.log('✅ Data Manager initialized');
        } else {
            // Use demo data
            this.logs = this.generateDemoData();
        }
        await this.delay(300);
    }

    /**
     * Initialize UI
     */
    initUI() {
        if (window.SentinelUI) {
            window.SentinelUI.init();
            window.SentinelUI.setCompareCallback((mode) => {
                this.compareMode = mode;
                this.updateLogs();
            });
            window.SentinelUI.setRefreshCallback(() => {
                this.refreshData();
            });
            console.log('✅ UI Controller initialized');
        }
    }

    /**
     * Initialize Swiper
     */
    initSwiper() {
        if (window.SentinelSwiper) {
            const sites = this.getSiteNames();
            window.SentinelSwiper.init(sites, (index) => {
                this.currentSite = index;
                this.onSiteChange(index);
            });
            console.log('✅ Swiper Controller initialized');
        }
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        // Get logs for current site
        const logs = this.getSiteLogs(this.currentSite);
        this.logs = logs;
        
        // Render charts
        this.renderCharts(logs);
        
        // Render logs
        this.renderLogs(logs);
        
        // Update receipt
        this.updateReceipt(logs);
        
        // Update status
        this.updateStatus();
        
        console.log(`✅ Loaded data for site ${this.currentSite + 1}`);
    }

    /**
     * Handle site change
     */
    onSiteChange(index) {
        const logs = this.getSiteLogs(index);
        this.logs = logs;
        
        // Update charts
        this.renderCharts(logs);
        
        // Update logs
        this.renderLogs(logs);
        
        // Update receipt
        this.updateReceipt(logs);
        
        // Update threat level
        this.updateThreatLevel(logs);
        
        console.log(`🔄 Switched to site ${index + 1}`);
    }

    /**
     * Render charts
     */
    renderCharts(logs) {
        if (window.SentinelCharts) {
            window.SentinelCharts.render(logs);
        } else {
            console.warn('Chart manager not available');
        }
    }

    /**
     * Render logs
     */
    renderLogs(logs) {
        const tbody = document.getElementById('logBody');
        if (!tbody) return;
        
        // Filter by compare mode
        let filteredLogs = [...logs];
        if (window.SentinelData) {
            filteredLogs = window.SentinelData.filterLogs(logs, this.compareMode);
        }
        
        // Take latest 10
        filteredLogs = filteredLogs.slice(0, 10);
        
        if (filteredLogs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:30px; color: #8aa8c9;">
                        <i class="fas fa-info-circle"></i> No logs found for this period
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        filteredLogs.forEach(log => {
            const severityClass = log.severity || 'low';
            const diffClass = this.getDiffClass(log.diff);
            const confidence = (log.confidence || 0) * 100;
            
            html += `
                <tr>
                    <td>${log.timestampStr || new Date(log.rawTime).toLocaleString()}</td>
                    <td><span class="attack-tag">${log.attackType || 'Unknown'}</span></td>
                    <td>${log.sourceIP || 'N/A'}</td>
                    <td>${log.destinationIP || 'N/A'}</td>
                    <td>
                        <div class="confidence-bar">
                            <div class="fill" style="width:${confidence}%; background: ${this.getConfidenceColor(confidence)};"></div>
                        </div>
                        <span style="font-size:11px; color: #8aa8c9;">${Math.round(confidence)}%</span>
                    </td>
                    <td><span class="severity-tag ${severityClass}">${severityClass.toUpperCase()}</span></td>
                    <td><span class="diff-tag ${diffClass}">${log.diff || '0%'}</span></td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    }

    /**
     * Update logs (called when compare mode changes)
     */
    updateLogs() {
        const logs = this.getSiteLogs(this.currentSite);
        this.renderLogs(logs);
    }

    /**
     * Update receipt
     */
    updateReceipt(logs) {
        if (window.SentinelUI) {
            window.SentinelUI.updateReceipt(logs);
        }
    }

    /**
     * Update status
     */
    updateStatus() {
        if (window.SentinelUI) {
            window.SentinelUI.updateStatus(new Date().toLocaleTimeString());
        }
    }

    /**
     * Update threat level
     */
    updateThreatLevel(logs) {
        const element = document.getElementById('threatLevel');
        if (!element) return;
        
        const threats = logs.filter(l => l.isAttack);
        const critical = logs.filter(l => l.severity === 'critical');
        const high = logs.filter(l => l.severity === 'high');
        
        let level, color;
        if (critical.length > 0) {
            level = '🔴 High Risk';
            color = 'rgba(255, 23, 68, 0.1)';
        } else if (high.length > 2) {
            level = '🟡 Medium Risk';
            color = 'rgba(255, 171, 0, 0.1)';
        } else if (threats.length > 5) {
            level = '🟡 Medium Risk';
            color = 'rgba(255, 171, 0, 0.1)';
        } else {
            level = '🟢 Low Risk';
            color = 'rgba(0, 230, 118, 0.1)';
        }
        
        element.textContent = level;
        element.style.background = color;
        element.style.borderColor = color.replace('0.1', '0.2');
    }

    /**
     * Refresh data
     */
    async refreshData() {
        console.log('🔄 Refreshing data...');
        
        try {
            if (window.SentinelData) {
                await window.SentinelData.refresh();
                const logs = this.getSiteLogs(this.currentSite);
                this.logs = logs;
                
                this.renderCharts(logs);
                this.renderLogs(logs);
                this.updateReceipt(logs);
                this.updateThreatLevel(logs);
                this.updateStatus();
                
                console.log('✅ Data refreshed');
            }
        } catch (error) {
            console.error('Refresh failed:', error);
            if (window.SentinelUI) {
                window.SentinelUI.showNotification('Refresh failed: ' + error.message, 'error');
            }
        }
    }

    /**
     * Get site logs
     */
    getSiteLogs(index) {
        if (window.SentinelData) {
            return window.SentinelData.getSiteLogs(index) || [];
        }
        return this.logs[index] || [];
    }

    /**
     * Get site names
     */
    getSiteNames() {
        if (window.SentinelData) {
            return window.SentinelData.getSites();
        }
        return [
            'acme-corp.com', 'stellarglobal.io', 'fintechsolutions.net',
            'healthcareplus.org', 'edugate.academy', 'retailchain.store',
            'logistixhub.com', 'mediastream.tv', 'greenenergy.co', 'cloudnest.dev'
        ];
    }

    /**
     * Get diff class
     */
    getDiffClass(diff) {
        if (!diff) return 'neutral';
        if (diff.includes('+')) return 'positive';
        if (diff.includes('-')) return 'negative';
        return 'neutral';
    }

    /**
     * Get confidence color
     */
    getConfidenceColor(confidence) {
        if (confidence > 80) return '#00e676';
        if (confidence > 60) return '#ffab00';
        if (confidence > 40) return '#ff6d00';
        return '#ff1744';
    }

    /**
     * Start auto-refresh
     */
    startAutoRefresh() {
        // Refresh every 30 seconds
        this.updateInterval = setInterval(() => {
            this.refreshData();
        }, 30000);
    }

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Hide flash screen
     */
    hideFlashScreen() {
        const flashScreen = document.getElementById('flashScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (flashScreen) {
            flashScreen.classList.add('hidden');
            // Remove from DOM after transition
            setTimeout(() => {
                flashScreen.style.display = 'none';
            }, 800);
        }
        
        if (mainApp) {
            mainApp.classList.add('visible');
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const statusText = document.getElementById('flashStatus');
        if (statusText) {
            statusText.textContent = '❌ ' + message;
            statusText.style.color = '#ff1744';
        }
        console.error(message);
    }

    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generate demo data (fallback)
     */
    generateDemoData() {
        const sites = this.getSiteNames();
        const data = [];
        const now = Date.now();
        const attackTypes = ['SQL Injection', 'XSS', 'DDoS', 'Brute Force', 'CSRF', 'File Inclusion', 'RCE', 'Path Traversal'];
        const severityLevels = ['safe', 'low', 'medium', 'high', 'critical'];
        
        for (let siteIdx = 0; siteIdx < sites.length; siteIdx++) {
            const siteLogs = [];
            const logCount = 15 + Math.floor(Math.random() * 15);
            
            for (let i = 0; i < logCount; i++) {
                const offset = Math.floor(Math.random() * 30 * 24 * 3600000);
                const timestamp = new Date(now - offset);
                const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
                const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
                const confidence = 0.5 + Math.random() * 0.45;
                
                siteLogs.push({
                    id: `log_${siteIdx}_${i}_${Date.now()}`,
                    timestamp: timestamp,
                    timestampStr: timestamp.toLocaleString(),
                    rawTime: timestamp.getTime(),
                    attackType: attackType,
                    sourceIP: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                    destinationIP: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                    severity: severity,
                    confidence: Math.round(confidence * 1000) / 1000,
                    diff: this.generateDiff(),
                    port: 80 + Math.floor(Math.random() * 65500),
                    protocol: [6, 17, 1][Math.floor(Math.random() * 3)],
                    packetSize: 64 + Math.floor(Math.random() * 1500),
                    isAttack: severity !== 'safe',
                    sourcePort: 1024 + Math.floor(Math.random() * 64511),
                    flowPacketsPerSecond: 5 + Math.random() * 150,
                    connectionsPerMinute: 2 + Math.floor(Math.random() * 30),
                    bytesPerSecond: 1000 + Math.random() * 1000000
                });
            }
            
            siteLogs.sort((a, b) => b.rawTime - a.rawTime);
            data.push(siteLogs);
        }
        
        return data;
    }

    /**
     * Generate diff value
     */
    generateDiff() {
        const diffs = ['+12%', '-5%', '+3%', '0%', '+8%', '-2%', '+15%', '-7%', '+4%', '-3%', '+22%', '-11%'];
        return diffs[Math.floor(Math.random() * diffs.length)];
    }
}

// ================================================================
//  APPLICATION STARTUP
// ================================================================

// Create application instance
const app = new SentinelApp();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Handle errors
window.addEventListener('error', (e) => {
    console.error('Unhandled error:', e);
});

// Export for debugging
window.SentinelApp = app;
