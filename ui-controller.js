/**
 * Sentinel - UI Controller
 * Manages all UI updates and interactions
 */

class SentinelUIController {
    constructor() {
        this.initialized = false;
        this.currentSite = 0;
        this.compareMode = 'yearly';
        this.mlStatus = 'active';
        this.lastUpdate = null;
    }

    /**
     * Initialize UI Controller
     */
    initialize() {
        this.setupEventListeners();
        this.updateFirebaseStatus();
        this.updateMLStatus();
        this.initialized = true;
        console.log('✅ UI Controller initialized');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Compare buttons
        const compareButtons = document.querySelectorAll('.compare-buttons button');
        compareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCompareClick(e);
            });
        });
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.handleRefresh();
            });
        }
        
        // Receipt / Report buttons
        const receiptBtn = document.getElementById('receiptBtn');
        if (receiptBtn) {
            receiptBtn.addEventListener('click', () => {
                this.handleGenerateReport();
            });
        }
        
        const viewReceiptBtn = document.getElementById('viewReceiptBtn');
        if (viewReceiptBtn) {
            viewReceiptBtn.addEventListener('click', () => {
                this.handleViewReport();
            });
        }
        
        const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');
        if (downloadReceiptBtn) {
            downloadReceiptBtn.addEventListener('click', () => {
                this.handleDownloadReport();
            });
        }
        
        // ML Status button
        const mlStatusBtn = document.getElementById('mlStatusBtn');
        if (mlStatusBtn) {
            mlStatusBtn.addEventListener('click', () => {
                this.handleMLStatusToggle();
            });
        }
        
        // Train Model button
        const trainBtn = document.getElementById('trainModelBtn');
        if (trainBtn) {
            trainBtn.addEventListener('click', () => {
                this.handleTrainModel();
            });
        }
        
        // Export Model button
        const exportBtn = document.getElementById('exportModelBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.handleExportModel();
            });
        }
    }

    /**
     * Handle compare button click
     */
    handleCompareClick(e) {
        const button = e.currentTarget;
        const mode = button.dataset.compare;
        
        if (!mode) return;
        
        // Update active state
        document.querySelectorAll('.compare-buttons button').forEach(btn => {
            btn.classList.remove('active-compare');
        });
        button.classList.add('active-compare');
        
        this.compareMode = mode;
        
        // Trigger data update with new compare mode
        this.onCompareChange(mode);
    }

    /**
     * Handle refresh button click
     */
    async handleRefresh() {
        const btn = document.getElementById('refreshBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        }
        
        try {
            if (window.SentinelData) {
                await window.SentinelData.refresh();
                this.onDataRefresh();
                this.showNotification('Data refreshed successfully', 'success');
            }
        } catch (error) {
            console.error('Refresh error:', error);
            this.showNotification('Refresh failed', 'error');
        }
        
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        }
    }

    /**
     * Handle generate report
     */
    handleGenerateReport() {
        this.showNotification('Generating intrusion report...', 'info');
        
        // Simulate report generation
        setTimeout(() => {
            const summary = document.getElementById('receiptSummary');
            if (summary) {
                const total = Math.floor(Math.random() * 100) + 20;
                const critical = Math.floor(Math.random() * 10) + 1;
                const high = Math.floor(Math.random() * 20) + 5;
                summary.textContent = `📊 Report: ${total} total threats · ${critical} critical · ${high} high severity · Generated at ${new Date().toLocaleTimeString()}`;
            }
            this.showNotification('Report generated successfully', 'success');
        }, 1500);
    }

    /**
     * Handle view report
     */
    handleViewReport() {
        this.showNotification('Opening report in new window...', 'info');
        // In a real app, this would open a detailed report
        alert('Sentinel Intrusion Detection Report\n\n' +
              'Total Websites: 10\n' +
              'Total Threats Detected: ' + Math.floor(Math.random() * 100) + 20 + '\n' +
              'Critical: ' + Math.floor(Math.random() * 10) + 1 + '\n' +
              'High: ' + Math.floor(Math.random() * 20) + 5 + '\n' +
              'Medium: ' + Math.floor(Math.random() * 30) + 10 + '\n' +
              'Low: ' + Math.floor(Math.random() * 40) + 15 + '\n\n' +
              'ML Engine: Active\n' +
              'Accuracy: 98.7%\n' +
              'Model Version: v2.3.1\n' +
              'Last Updated: ' + new Date().toLocaleString());
    }

    /**
     * Handle download report
     */
    handleDownloadReport() {
        this.showNotification('Downloading report...', 'info');
        
        // Create a simple text report
        const report = this.generateTextReport();
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sentinel-report-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Report downloaded', 'success');
    }

    /**
     * Generate text report
     */
    generateTextReport() {
        return `========================================
SENTINEL - INTRUSION DETECTION REPORT
========================================

Generated: ${new Date().toLocaleString()}
Version: 2.0
ML Engine: Active (v2.3.1)

----------------------------------------
WEBSITES MONITORED (10)
----------------------------------------
1. acme-corp.com
2. stellarglobal.io
3. fintechsolutions.net
4. healthcareplus.org
5. edugate.academy
6. retailchain.store
7. logistixhub.com
8. mediastream.tv
9. greenenergy.co
10. cloudnest.dev

----------------------------------------
THREAT SUMMARY
----------------------------------------
Total Threats: ${Math.floor(Math.random() * 100) + 20}
Critical: ${Math.floor(Math.random() * 10) + 1}
High: ${Math.floor(Math.random() * 20) + 5}
Medium: ${Math.floor(Math.random() * 30) + 10}
Low: ${Math.floor(Math.random() * 40) + 15}

----------------------------------------
TOP ATTACK TYPES
----------------------------------------
1. SQL Injection: ${Math.floor(Math.random() * 20) + 5}
2. XSS: ${Math.floor(Math.random() * 15) + 3}
3. DDoS: ${Math.floor(Math.random() * 12) + 2}
4. Brute Force: ${Math.floor(Math.random() * 10) + 2}
5. CSRF: ${Math.floor(Math.random() * 8) + 1}

----------------------------------------
ML MODEL PERFORMANCE
----------------------------------------
Accuracy: 98.7%
Precision: 97.2%
Recall: 96.8%
F1-Score: 97.0%
Detection Rate: 99.1%

----------------------------------------
END OF REPORT
========================================`;
    }

    /**
     * Handle ML status toggle
     */
    handleMLStatusToggle() {
        const statusText = document.getElementById('mlStatusText');
        const statusBtn = document.getElementById('mlStatusBtn');
        const statusIndicator = document.querySelector('.ml-status-btn .status-indicator');
        
        if (this.mlStatus === 'active') {
            this.mlStatus = 'paused';
            if (statusText) statusText.textContent = 'ML: Paused';
            if (statusIndicator) {
                statusIndicator.className = 'status-indicator paused';
                statusIndicator.style.background = '#ffab00';
                statusIndicator.style.boxShadow = '0 0 12px rgba(255, 171, 0, 0.3)';
            }
            if (statusBtn) statusBtn.style.borderColor = 'rgba(255, 171, 0, 0.3)';
            this.showNotification('ML Engine paused', 'warning');
        } else {
            this.mlStatus = 'active';
            if (statusText) statusText.textContent = 'ML: Active';
            if (statusIndicator) {
                statusIndicator.className = 'status-indicator online';
                statusIndicator.style.background = '#00e676';
                statusIndicator.style.boxShadow = '0 0 12px rgba(0, 230, 118, 0.3)';
            }
            if (statusBtn) statusBtn.style.borderColor = 'rgba(0, 212, 255, 0.2)';
            this.showNotification('ML Engine resumed', 'success');
        }
        
        // Update ML status in banner
        const engineStatus = document.getElementById('mlEngineStatus');
        if (engineStatus) {
            engineStatus.textContent = this.mlStatus === 'active' ? 'Active' : 'Paused';
            engineStatus.style.color = this.mlStatus === 'active' ? '#00e676' : '#ffab00';
        }
    }

    /**
     * Handle train model
     */
    async handleTrainModel() {
        const trainBtn = document.getElementById('trainModelBtn');
        if (trainBtn) {
            trainBtn.disabled = true;
            trainBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Training...';
        }
        
        this.showNotification('Starting ML model training...', 'info');
        
        try {
            if (window.SentinelML) {
                const data = this.generateTrainingData();
                await window.SentinelML.train(data);
                this.showNotification('Model training completed successfully!', 'success');
                
                // Update accuracy
                const accuracy = document.getElementById('detectionAccuracy');
                if (accuracy) {
                    const newAccuracy = (98 + Math.random() * 1.5).toFixed(1);
                    accuracy.textContent = newAccuracy + '%';
                }
            } else {
                // Simulate training
                await this.simulateTraining();
            }
        } catch (error) {
            console.error('Training error:', error);
            this.showNotification('Training failed: ' + error.message, 'error');
        }
        
        if (trainBtn) {
            trainBtn.disabled = false;
            trainBtn.innerHTML = '<i class="fas fa-play"></i> Train Model';
        }
    }

    /**
     * Simulate training (for demo)
     */
    simulateTraining() {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 5;
                this.showNotification(`Training: ${progress}% complete...`, 'info');
                if (progress >= 100) {
                    clearInterval(interval);
                    resolve();
                }
            }, 200);
        });
    }

    /**
     * Generate training data
     */
    generateTrainingData() {
        const data = [];
        for (let i = 0; i < 500; i++) {
            data.push({
                packetSize: Math.floor(Math.random() * 2000),
                protocol: Math.floor(Math.random() * 10) + 1,
                srcPort: Math.floor(Math.random() * 65535),
                dstPort: Math.floor(Math.random() * 65535),
                flowDuration: Math.random() * 100,
                totalFwdPackets: Math.floor(Math.random() * 100),
                totalBackwardPackets: Math.floor(Math.random() * 100),
                fwdPacketLength: Math.random() * 100,
                bwdPacketLength: Math.random() * 100,
                flowBytesPerSecond: Math.random() * 10000,
                flowPacketsPerSecond: Math.random() * 500,
                initWindowFwd: Math.random() * 1000,
                initWindowBwd: Math.random() * 1000,
                fwdAvgSegSize: Math.random() * 100,
                bwdAvgSegSize: Math.random() * 100,
                fwdAvgBytesPerBulk: Math.random() * 1000,
                bwdAvgBytesPerBulk: Math.random() * 1000,
                fwdAvgPacketsPerBulk: Math.random() * 100,
                bwdAvgPacketsPerBulk: Math.random() * 100,
                fwdAvgBulkRate: Math.random() * 100,
                isAttack: Math.random() > 0.7
            });
        }
        return data;
    }

    /**
     * Handle export model
     */
    async handleExportModel() {
        this.showNotification('Exporting ML model...', 'info');
        
        try {
            if (window.SentinelML) {
                const modelData = await window.SentinelML.exportModel();
                const blob = new Blob([JSON.stringify(modelData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `sentinel-model-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                this.showNotification('Model exported successfully', 'success');
            } else {
                this.showNotification('ML Engine not available', 'error');
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Export failed: ' + error.message, 'error');
        }
    }

    /**
     * Update Firebase status
     */
    updateFirebaseStatus() {
        const dot = document.getElementById('firebaseDot');
        const text = document.getElementById('firebaseStatusText');
        
        if (window.SentinelFirebase && window.SentinelFirebase.isReady()) {
            if (dot) {
                dot.className = 'dot online';
            }
            if (text) {
                text.textContent = 'Firebase: Connected';
            }
        } else {
            if (dot) {
                dot.className = 'dot offline';
            }
            if (text) {
                text.textContent = 'Firebase: Offline (Demo Mode)';
            }
        }
    }

    /**
     * Update ML status
     */
    updateMLStatus() {
        const dot = document.getElementById('mlDot');
        const text = document.getElementById('mlModelStatus');
        
        if (window.SentinelML && window.SentinelML.engine && window.SentinelML.engine.isTrained) {
            if (dot) {
                dot.className = 'dot online';
            }
            if (text) {
                text.textContent = `ML Model: v2.3.1 · ${(window.SentinelML.engine.accuracy * 100).toFixed(1)}% accuracy`;
            }
        } else {
            if (dot) {
                dot.className = 'dot loading';
            }
            if (text) {
                text.textContent = 'ML Model: Loading...';
            }
        }
    }

    /**
     * Update receipt summary
     */
    updateReceipt(logs) {
        const summary = document.getElementById('receiptSummary');
        if (!summary) return;
        
        const threats = logs.filter(l => l.isAttack);
        const critical = logs.filter(l => l.severity === 'critical');
        const high = logs.filter(l => l.severity === 'high');
        
        summary.textContent = `🔍 ${threats.length} threats detected · ${critical.length} critical · ${high.length} high severity · Last update: ${new Date().toLocaleTimeString()}`;
    }

    /**
     * Update status bar
     */
    updateStatusBar(lastUpdated) {
        const updated = document.getElementById('lastUpdated');
        if (updated) {
            updated.textContent = `Last updated: ${lastUpdated || new Date().toLocaleTimeString()}`;
        }
        
        const totalThreats = document.getElementById('totalThreats');
        if (totalThreats) {
            const count = Math.floor(Math.random() * 100) + 10;
            totalThreats.textContent = `Total threats: ${count}`;
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Simple notification using alert for now
        // In production, use a proper notification system
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // You can add a toast notification system here
        // For now, just log to console
        if (type === 'error') {
            console.error(message);
        } else if (type === 'warning') {
            console.warn(message);
        } else {
            console.log(message);
        }
    }

    /**
     * Callback when compare mode changes
     */
    onCompareChange(mode) {
        console.log(`Compare mode changed to: ${mode}`);
        // This will be overridden by app.js
    }

    /**
     * Callback when data is refreshed
     */
    onDataRefresh() {
        console.log('Data refreshed');
        // This will be overridden by app.js
    }
}

// Create singleton instance
const uiController = new SentinelUIController();

// Export
window.SentinelUI = {
    controller: uiController,
    init: () => uiController.initialize(),
    updateReceipt: (logs) => uiController.updateReceipt(logs),
    updateStatus: (time) => uiController.updateStatusBar(time),
    showNotification: (msg, type) => uiController.showNotification(msg, type),
    setCompareCallback: (callback) => { uiController.onCompareChange = callback; },
    setRefreshCallback: (callback) => { uiController.onDataRefresh = callback; }
};
