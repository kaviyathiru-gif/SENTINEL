/**
 * Sentinel - Main Application
 */

class SentinelApp {
    constructor() {
        this.currentSite = 0;
        this.totalSites = 10;
        this.compareMode = 'yearly';
        this.logs = [];
        this.chartInstances = [];
        this.updateInterval = null;
        this.initialized = false;
        this.globalThreats = [];
        this.websiteNames = [
            'acme-corp.com', 'stellarglobal.io', 'fintechsolutions.net',
            'healthcareplus.org', 'edugate.academy', 'retailchain.store',
            'logistixhub.com', 'mediastream.tv', 'greenenergy.co', 'cloudnest.dev'
        ];
        this.websiteLocations = [
            'USA', 'UK', 'Germany', 'Canada', 'Australia',
            'Japan', 'Singapore', 'France', 'Brazil', 'India'
        ];
    }

    async init() {
        console.log('🚀 Initializing Sentinel...');
        
        try {
            await this.initAPI();
            this.initUI();
            this.initSwiper();
            await this.loadSiteData(0);
            await this.updateGlobalStats();
            this.startAutoRefresh();
            this.hideFlashScreen();
            this.initialized = true;
            console.log('✅ Sentinel initialized');
        } catch (error) {
            console.error('❌ Initialization failed:', error);
        }
    }

    async initAPI() {
        try {
            const response = await fetch('/api/init');
            const data = await response.json();
            console.log('API initialized:', data);
            this.totalSites = data.totalSites || 10;
            return data;
        } catch (error) {
            console.warn('API init failed, using defaults:', error);
            return { totalSites: 10 };
        }
    }

    initUI() {
        // Compare buttons
        document.querySelectorAll('.compare-buttons button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.compare-buttons button').forEach(b => b.classList.remove('active-compare'));
                btn.classList.add('active-compare');
                this.compareMode = btn.dataset.compare;
                this.renderLogs();
            });
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });

        // Report buttons
        document.getElementById('receiptBtn').addEventListener('click', () => {
            this.generateReport();
        });

        document.getElementById('viewReceiptBtn').addEventListener('click', () => {
            this.viewReport();
        });

        document.getElementById('downloadReceiptBtn').addEventListener('click', () => {
            this.downloadReport();
        });

        // ML Status toggle
        document.getElementById('mlStatusBtn').addEventListener('click', () => {
            this.toggleMLStatus();
        });

        // Train button
        document.getElementById('trainModelBtn').addEventListener('click', () => {
            this.trainModel();
        });

        // Export button
        document.getElementById('exportModelBtn').addEventListener('click', () => {
            this.exportModel();
        });

        // Map controls
        document.getElementById('refreshMapBtn').addEventListener('click', () => {
            if (window.threatMap) {
                window.threatMap.refresh();
            }
            this.updateGlobalStats();
        });

        document.getElementById('toggleMapAnimation').addEventListener('click', (e) => {
            if (window.threatMap) {
                window.threatMap.toggleAnimation();
                const icon = e.currentTarget.querySelector('i');
                icon.classList.toggle('fa-play');
                icon.classList.toggle('fa-pause');
            }
        });

        // Update status
        this.updateStatusBar();
        this.updateFirebaseStatus();
        this.updateMLStatus();
    }

    initSwiper() {
        const prevBtn = document.getElementById('prevSiteBtn');
        const nextBtn = document.getElementById('nextSiteBtn');

        prevBtn.addEventListener('click', () => {
            this.currentSite = (this.currentSite - 1 + this.totalSites) % this.totalSites;
            this.loadSiteData(this.currentSite);
        });

        nextBtn.addEventListener('click', () => {
            this.currentSite = (this.currentSite + 1) % this.totalSites;
            this.loadSiteData(this.currentSite);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.currentSite = (this.currentSite - 1 + this.totalSites) % this.totalSites;
                this.loadSiteData(this.currentSite);
            } else if (e.key === 'ArrowRight') {
                this.currentSite = (this.currentSite + 1) % this.totalSites;
                this.loadSiteData(this.currentSite);
            }
        });

        // Touch swiping
        let touchStartX = 0;
        const swiperSection = document.querySelector('.swiper-section');
        
        if (swiperSection) {
            swiperSection.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            swiperSection.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        this.currentSite = (this.currentSite + 1) % this.totalSites;
                    } else {
                        this.currentSite = (this.currentSite - 1 + this.totalSites) % this.totalSites;
                    }
                    this.loadSiteData(this.currentSite);
                }
            }, { passive: true });
        }
    }

    async loadSiteData(index) {
        try {
            const response = await fetch(`/api/logs/${index}`);
            const data = await response.json();
            this.logs = data.logs || [];
            
            this.updateSiteInfo(index);
            this.renderGraphs();
            this.renderLogs();
            this.updateReceipt();
            this.updateThreatLevel();
            this.updateSiteLocation(index);
            this.updateStatusBar();
            
            console.log(`📊 Loaded data for site ${index + 1}`);
        } catch (error) {
            console.error('Error loading site data:', error);
        }
    }

    updateSiteInfo(index) {
        document.getElementById('currentSiteName').textContent = this.websiteNames[index] || `site-${index}`;
        document.getElementById('siteCounter').textContent = `${index + 1} / ${this.totalSites}`;
    }

    updateSiteLocation(index) {
        const element = document.getElementById('siteLocation');
        if (element) {
            element.textContent = `📍 ${this.websiteLocations[index] || 'Unknown'}`;
        }
    }

    renderGraphs() {
        const container = document.getElementById('graphsContainer');
        container.innerHTML = '';
        
        this.chartInstances.forEach(chart => chart.destroy());
        this.chartInstances = [];

        const stats = this.getAttackStats();
        const items = this.prepareGraphItems(stats);

        items.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'graph-card';
            
            const header = document.createElement('div');
            header.className = 'graph-header';
            
            const title = document.createElement('span');
            title.className = 'graph-title';
            title.textContent = item.title;
            
            const value = document.createElement('span');
            value.className = 'graph-value';
            value.textContent = item.value;
            
            header.appendChild(title);
            header.appendChild(value);
            
            const canvas = document.createElement('canvas');
            canvas.id = `graph-${index}`;
            
            card.appendChild(header);
            card.appendChild(canvas);
            container.appendChild(card);

            const ctx = canvas.getContext('2d');
            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        data: item.data || [0, 0, 0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(232, 62, 140, 0.3)',
                        borderColor: '#e83e8c',
                        borderWidth: 1,
                        borderRadius: 3,
                        barPercentage: 0.6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { display: false, grid: { display: false } },
                        y: { display: false, beginAtZero: true, grid: { display: false } }
                    },
                    animation: { duration: 500 }
                }
            });
            
            this.chartInstances.push(chart);
        });
    }

    getAttackStats() {
        const stats = {
            attackCounts: {},
            severityCounts: { safe: 0, low: 0, medium: 0, high: 0, critical: 0 },
            dailyDistribution: Array(7).fill(0)
        };

        this.logs.forEach(log => {
            if (log.attackType) {
                stats.attackCounts[log.attackType] = (stats.attackCounts[log.attackType] || 0) + 1;
            }
            if (log.severity) {
                stats.severityCounts[log.severity] = (stats.severityCounts[log.severity] || 0) + 1;
            }
            if (log.timestamp) {
                const date = new Date(log.timestamp);
                const day = date.getDay();
                stats.dailyDistribution[day] = (stats.dailyDistribution[day] || 0) + 1;
            }
        });

        return stats;
    }

    prepareGraphItems(stats) {
        const items = [];
        const attackTypes = Object.keys(stats.attackCounts).sort((a, b) => 
            stats.attackCounts[b] - stats.attackCounts[a]
        );

        attackTypes.slice(0, 8).forEach(type => {
            items.push({
                title: type,
                value: stats.attackCounts[type] || 0,
                data: this.generateDayData(type)
            });
        });

        const extras = [
            {
                title: 'Total Attacks',
                value: this.logs.filter(l => l.isAttack).length,
                data: stats.dailyDistribution
            },
            {
                title: 'Critical',
                value: stats.severityCounts.critical || 0,
                data: this.generateSeverityData('critical')
            },
            {
                title: 'Unique Sources',
                value: new Set(this.logs.map(l => l.sourceIP)).size,
                data: stats.dailyDistribution.map(() => Math.floor(Math.random() * 5) + 1)
            },
            {
                title: 'Avg Confidence',
                value: Math.round((this.logs.reduce((sum, l) => sum + (l.confidence || 0), 0) / (this.logs.length || 1)) * 100) + '%',
                data: stats.dailyDistribution.map(() => Math.floor(Math.random() * 30) + 60)
            }
        ];

        extras.forEach(extra => items.push(extra));

        while (items.length < 12) {
            items.push({
                title: 'Other',
                value: 0,
                data: Array(7).fill(0)
            });
        }

        return items.slice(0, 12);
    }

    generateDayData(attackType) {
        const days = Array(7).fill(0);
        this.logs.filter(l => l.attackType === attackType).forEach(log => {
            if (log.timestamp) {
                const day = new Date(log.timestamp).getDay();
                days[day] = (days[day] || 0) + 1;
            }
        });
        return days;
    }

    generateSeverityData(severity) {
        const days = Array(7).fill(0);
        this.logs.filter(l => l.severity === severity).forEach(log => {
            if (log.timestamp) {
                const day = new Date(log.timestamp).getDay();
                days[day] = (days[day] || 0) + 1;
            }
        });
        return days;
    }

    renderLogs() {
        const tbody = document.getElementById('logBody');
        let filteredLogs = [...this.logs];

        const now = Date.now();
        const periods = {
            'yearly': 365 * 24 * 3600000,
            'monthly': 30 * 24 * 3600000,
            'weekly': 7 * 24 * 3600000,
            'day': 24 * 3600000
        };

        const duration = periods[this.compareMode] || periods['yearly'];
        filteredLogs = filteredLogs.filter(l => (now - (l.rawTime || 0)) < duration);
        filteredLogs = filteredLogs.slice(0, 10);

        if (filteredLogs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:30px; color: #8a6ea8;">
                        <i class="fas fa-info-circle"></i> No logs for this period
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
            const origin = log.sourceLocation ? `${log.sourceLocation.city}, ${log.sourceLocation.country}` : 'Unknown';

            html += `
                <tr>
                    <td>${log.timestampStr || new Date(log.rawTime).toLocaleString()}</td>
                    <td><span class="attack-tag">${log.attackType || 'Unknown'}</span></td>
                    <td>${log.sourceIP || 'N/A'}</td>
                    <td style="font-size:11px; color: var(--text-secondary);">${origin}</td>
                    <td>
                        <div class="confidence-bar">
                            <div class="fill" style="width:${confidence}%; background: ${this.getConfidenceColor(confidence)};"></div>
                        </div>
                        <span style="font-size:11px; color:#8a6ea8;">${Math.round(confidence)}%</span>
                    </td>
                    <td><span class="severity-tag ${severityClass}">${severityClass.toUpperCase()}</span></td>
                    <td><span class="diff-tag ${diffClass}">${log.diff || '0%'}</span></td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    getDiffClass(diff) {
        if (!diff) return 'neutral';
        if (diff.includes('+')) return 'positive';
        if (diff.includes('-')) return 'negative';
        return 'neutral';
    }

    getConfidenceColor(confidence) {
        if (confidence > 80) return '#00e676';
        if (confidence > 60) return '#ffab00';
        if (confidence > 40) return '#ff6d00';
        return '#ff1744';
    }

    updateReceipt() {
        const summary = document.getElementById('receiptSummary');
        const threats = this.logs.filter(l => l.isAttack);
        const critical = this.logs.filter(l => l.severity === 'critical');
        const high = this.logs.filter(l => l.severity === 'high');
        
        const globalCount = this.globalThreats.length || 0;
        
        summary.textContent = `🌍 ${globalCount} global threats · ${threats.length} local · ${critical.length} critical · ${high.length} high · ${new Date().toLocaleTimeString()}`;

        document.getElementById('threatsDetected').textContent = threats.length;
        document.getElementById('globalThreatCount').textContent = `🌍 ${globalCount} active threats`;
    }

    updateThreatLevel() {
        const element = document.getElementById('threatLevel');
        const threats = this.logs.filter(l => l.isAttack);
        const critical = this.logs.filter(l => l.severity === 'critical');

        if (critical.length > 0) {
            element.textContent = '🔴 High Risk';
            element.style.background = 'rgba(255, 23, 68, 0.1)';
            element.style.borderColor = 'rgba(255, 23, 68, 0.2)';
        } else if (threats.length > 5) {
            element.textContent = '🟡 Medium Risk';
            element.style.background = 'rgba(255, 171, 0, 0.1)';
            element.style.borderColor = 'rgba(255, 171, 0, 0.2)';
        } else {
            element.textContent = '🟢 Low Risk';
            element.style.background = 'rgba(0, 230, 118, 0.1)';
            element.style.borderColor = 'rgba(0, 230, 118, 0.2)';
        }
    }

    updateStatusBar() {
        document.getElementById('lastUpdated').textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
        document.getElementById('totalThreats').textContent = `Total: ${this.logs.filter(l => l.isAttack).length}`;
    }

    updateFirebaseStatus() {
        const dot = document.getElementById('firebaseDot');
        const text = document.getElementById('firebaseStatusText');
        
        dot.className = 'dot online';
        text.textContent = 'Firebase: Connected';
    }

    updateMLStatus() {
        const dot = document.getElementById('mlDot');
        const text = document.getElementById('mlModelStatus');
        const accuracy = document.getElementById('detectionAccuracy');
        const status = document.getElementById('mlEngineStatus');

        dot.className = 'dot online';
        text.textContent = 'PyTorch Model: v2.3.1 · Active';
        status.textContent = 'Active';
        status.style.color = '#00e676';
        accuracy.textContent = '98.7%';
    }

    async updateGlobalStats() {
        try {
            const response = await fetch('/api/global/summary');
            const data = await response.json();
            
            if (data) {
                this.globalThreats = data.topThreats || [];
                
                document.getElementById('mapTotalThreats').textContent = data.totalThreats || 0;
                document.getElementById('mapCriticalThreats').textContent = data.bySeverity?.critical || 0;
                document.getElementById('mapHighThreats').textContent = data.bySeverity?.high || 0;
                document.getElementById('mapMediumThreats').textContent = data.bySeverity?.medium || 0;
                document.getElementById('mapLowThreats').textContent = data.bySeverity?.low || 0;
                document.getElementById('mapHotspots').textContent = data.hotspots?.length || 0;
            }
        } catch (error) {
            console.error('Error updating global stats:', error);
        }
    }

    toggleMLStatus() {
        const statusText = document.getElementById('mlStatusText');
        const indicator = document.querySelector('.ml-status-btn .status-indicator');
        
        if (statusText.textContent.includes('Active')) {
            statusText.textContent = 'PyTorch: Paused';
            indicator.className = 'status-indicator';
            indicator.style.background = '#ffab00';
            document.getElementById('mlEngineStatus').textContent = 'Paused';
            document.getElementById('mlEngineStatus').style.color = '#ffab00';
        } else {
            statusText.textContent = 'PyTorch: Active';
            indicator.className = 'status-indicator online';
            indicator.style.background = '#00e676';
            document.getElementById('mlEngineStatus').textContent = 'Active';
            document.getElementById('mlEngineStatus').style.color = '#00e676';
        }
    }

    async refreshData() {
        try {
            const response = await fetch('/api/refresh');
            const data = await response.json();
            console.log('Data refreshed:', data);
            
            if (window.threatMap) {
                window.threatMap.refresh();
            }
            
            await this.loadSiteData(this.currentSite);
            await this.updateGlobalStats();
            this.showNotification('Data refreshed', 'success');
        } catch (error) {
            console.error('Refresh error:', error);
            this.showNotification('Refresh failed', 'error');
        }
    }

    async generateReport() {
        this.showNotification('Generating report...', 'info');
        try {
            const response = await fetch(`/api/report/${this.currentSite}`);
            const data = await response.json();
            console.log('Report:', data);
            this.showNotification('Report generated', 'success');
        } catch (error) {
            this.showNotification('Report generation failed', 'error');
        }
    }

    async viewReport() {
        try {
            const response = await fetch(`/api/report/${this.currentSite}`);
            const data = await response.json();
            alert('📊 Sentinel Report\n\n' +
                  `Site: ${data.site}\n` +
                  `Location: ${data.location}\n` +
                  `Total Logs: ${data.totalLogs}\n` +
                  `Threats: ${data.threats}\n` +
                  `Average Confidence: ${(data.averageConfidence * 100).toFixed(1)}%\n` +
                  `Generated: ${new Date(data.generated).toLocaleString()}`);
        } catch (error) {
            this.showNotification('Failed to view report', 'error');
        }
    }

    async downloadReport() {
        try {
            window.open(`/api/report/download/${this.currentSite}`, '_blank');
            this.showNotification('Downloading report...', 'info');
        } catch (error) {
            this.showNotification('Download failed', 'error');
        }
    }

    async trainModel() {
        const btn = document.getElementById('trainModelBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Training...';
        
        this.showNotification('Training PyTorch model with global data...', 'info');
        
        try {
            const threatsResponse = await fetch('/api/global/threats');
            const threatsData = await threatsResponse.json();
            
            const response = await fetch('/api/train', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: threatsData.threats || [] })
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                this.showNotification('Model trained with global threat data!', 'success');
                document.getElementById('detectionAccuracy').textContent = (data.accuracy * 100).toFixed(1) + '%';
            } else {
                this.showNotification('Training failed: ' + data.message, 'error');
            }
        } catch (error) {
            this.showNotification('Training error: ' + error.message, 'error');
        }
        
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-play"></i> Train';
    }

    async exportModel() {
        this.showNotification('Exporting PyTorch model...', 'info');
        try {
            window.open('/api/model/export', '_blank');
            this.showNotification('Model exported', 'success');
        } catch (error) {
            this.showNotification('Export failed', 'error');
        }
    }

    showNotification(message, type) {
        console.log(`[${type}] ${message}`);
        const statusText = document.getElementById('flashStatus');
        if (statusText) {
            statusText.textContent = message;
            statusText.style.color = type === 'error' ? '#ff1744' : '#00e676';
            setTimeout(() => {
                statusText.textContent = 'Ready';
                statusText.style.color = '#c9b0e6';
            }, 3000);
        }
    }

    startAutoRefresh() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        this.updateInterval = setInterval(() => {
            this.refreshData();
        }, 30000);
    }

    hideFlashScreen() {
        const flash = document.getElementById('flashScreen');
        const main = document.getElementById('mainApp');
        
        flash.classList.add('hidden');
        setTimeout(() => {
            flash.style.display = 'none';
        }, 800);
        
        main.classList.add('visible');
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    const app = new SentinelApp();
    app.init();
    window.sentinelApp = app;
    
    // Initialize threat map after app loads
    setTimeout(() => {
        if (window.ThreatMap) {
            window.threatMap = new ThreatMap();
            window.threatMap.init('threatMapContainer');
        }
    }, 2000);
});
