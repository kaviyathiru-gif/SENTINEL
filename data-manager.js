/**
 * Sentinel - Data Manager
 * Manages data from Firebase and local storage
 */

class SentinelDataManager {
    constructor() {
        this.attackTypes = [
            'SQL Injection', 'XSS', 'DDoS', 'Brute Force', 'CSRF',
            'File Inclusion', 'RCE', 'Path Traversal', 'Man-in-the-Middle',
            'DNS Spoofing', 'ARP Spoofing', 'SSL Stripping'
        ];
        this.severityLevels = ['safe', 'low', 'medium', 'high', 'critical'];
        this.websiteNames = [
            'acme-corp.com', 'stellarglobal.io', 'fintechsolutions.net',
            'healthcareplus.org', 'edugate.academy', 'retailchain.store',
            'logistixhub.com', 'mediastream.tv', 'greenenergy.co', 'cloudnest.dev'
        ];
        this.allLogs = [];
        this.currentData = null;
        this.lastUpdate = null;
        this.firebaseListeners = [];
    }

    /**
     * Initialize data manager
     */
    async initialize() {
        try {
            // Try to load from Firebase first
            const firebaseData = await this.loadFromFirebase();
            if (firebaseData) {
                this.allLogs = firebaseData;
                this.lastUpdate = new Date();
                console.log('✅ Data loaded from Firebase');
                return this.allLogs;
            }
            
            // Fallback to local storage
            const localData = this.loadFromLocalStorage();
            if (localData) {
                this.allLogs = localData;
                console.log('✅ Data loaded from local storage');
                return this.allLogs;
            }
            
            // Generate demo data
            this.allLogs = this.generateDemoData();
            this.saveToLocalStorage(this.allLogs);
            console.log('📌 Generated demo data');
            return this.allLogs;
            
        } catch (error) {
            console.error('❌ Data initialization failed:', error);
            this.allLogs = this.generateDemoData();
            return this.allLogs;
        }
    }

    /**
     * Load data from Firebase
     */
    async loadFromFirebase() {
        if (!window.SentinelFirebase || !window.SentinelFirebase.isReady()) {
            return null;
        }
        
        try {
            const data = await window.SentinelFirebase.load('sentinelData', 'intrusionLogs');
            if (data && data.logs) {
                return data.logs;
            }
            return null;
        } catch (error) {
            console.error('❌ Firebase load error:', error);
            return null;
        }
    }

    /**
     * Save data to Firebase
     */
    async saveToFirebase(logs) {
        if (!window.SentinelFirebase || !window.SentinelFirebase.isReady()) {
            return false;
        }
        
        try {
            await window.SentinelFirebase.save('sentinelData', 'intrusionLogs', {
                logs: logs,
                lastUpdated: new Date().toISOString(),
                totalSites: this.websiteNames.length,
                version: '2.0'
            });
            return true;
        } catch (error) {
            console.error('❌ Firebase save error:', error);
            return false;
        }
    }

    /**
     * Load from local storage
     */
    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('sentinel_logs');
            if (data) {
                const parsed = JSON.parse(data);
                // Convert timestamps back to Date objects
                parsed.forEach(siteLogs => {
                    siteLogs.forEach(log => {
                        if (log.timestamp) {
                            log.timestamp = new Date(log.timestamp);
                            log.rawTime = log.timestamp.getTime();
                        }
                    });
                });
                return parsed;
            }
            return null;
        } catch (error) {
            console.error('❌ Local storage load error:', error);
            return null;
        }
    }

    /**
     * Save to local storage
     */
    saveToLocalStorage(logs) {
        try {
            // Convert Date objects to strings for JSON
            const dataToSave = logs.map(siteLogs => 
                siteLogs.map(log => ({
                    ...log,
                    timestamp: log.timestamp instanceof Date ? log.timestamp.toISOString() : log.timestamp
                }))
            );
            localStorage.setItem('sentinel_logs', JSON.stringify(dataToSave));
            return true;
        } catch (error) {
            console.error('❌ Local storage save error:', error);
            return false;
        }
    }

    /**
     * Generate demo data
     */
    generateDemoData() {
        const data = [];
        const now = Date.now();
        
        for (let siteIdx = 0; siteIdx < this.websiteNames.length; siteIdx++) {
            const siteLogs = [];
            const logCount = 15 + Math.floor(Math.random() * 15);
            
            for (let i = 0; i < logCount; i++) {
                const offset = Math.floor(Math.random() * 30 * 24 * 3600000);
                const timestamp = new Date(now - offset);
                const attackType = this.attackTypes[Math.floor(Math.random() * this.attackTypes.length)];
                const severity = this.severityLevels[Math.floor(Math.random() * this.severityLevels.length)];
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
            
            // Sort by time descending
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

    /**
     * Get logs for a specific site
     */
    getSiteLogs(siteIndex) {
        if (siteIndex >= 0 && siteIndex < this.allLogs.length) {
            return this.allLogs[siteIndex] || [];
        }
        return [];
    }

    /**
     * Get all sites
     */
    getSites() {
        return this.websiteNames;
    }

    /**
     * Get site count
     */
    getSiteCount() {
        return this.websiteNames.length;
    }

    /**
     * Add new log entry
     */
    async addLog(siteIndex, logData) {
        if (siteIndex < 0 || siteIndex >= this.allLogs.length) {
            return false;
        }
        
        const newLog = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            timestamp: new Date(),
            timestampStr: new Date().toLocaleString(),
            rawTime: Date.now(),
            ...logData
        };
        
        this.allLogs[siteIndex].unshift(newLog);
        await this.saveData();
        return true;
    }

    /**
     * Save data to all storage backends
     */
    async saveData() {
        // Save to local storage
        this.saveToLocalStorage(this.allLogs);
        
        // Save to Firebase
        await this.saveToFirebase(this.allLogs);
        
        this.lastUpdate = new Date();
        return true;
    }

    /**
     * Refresh data
     */
    async refreshData() {
        // Add some new random logs
        this.allLogs = this.allLogs.map((siteLogs, idx) => {
            const newLogs = this.generateDemoData()[idx] || [];
            // Keep existing logs and add some new ones
            const combined = [...siteLogs, ...newLogs.slice(0, 3)];
            combined.sort((a, b) => b.rawTime - a.rawTime);
            return combined.slice(0, 30); // Keep latest 30
        });
        
        await this.saveData();
        return this.allLogs;
    }

    /**
     * Get statistics for a site
     */
    getStatistics(siteIndex) {
        const logs = this.getSiteLogs(siteIndex);
        const stats = {
            totalLogs: logs.length,
            attacks: logs.filter(l => l.isAttack).length,
            attackTypes: {},
            severityDistribution: {},
            topSources: {},
            averageConfidence: 0
        };
        
        logs.forEach(log => {
            // Count attack types
            if (log.attackType) {
                stats.attackTypes[log.attackType] = (stats.attackTypes[log.attackType] || 0) + 1;
            }
            
            // Count severity
            if (log.severity) {
                stats.severityDistribution[log.severity] = (stats.severityDistribution[log.severity] || 0) + 1;
            }
            
            // Count sources
            if (log.sourceIP) {
                stats.topSources[log.sourceIP] = (stats.topSources[log.sourceIP] || 0) + 1;
            }
            
            // Sum confidence
            if (log.confidence) {
                stats.averageConfidence += log.confidence;
            }
        });
        
        stats.averageConfidence = stats.totalLogs > 0 ? stats.averageConfidence / stats.totalLogs : 0;
        stats.attackRate = stats.totalLogs > 0 ? stats.attacks / stats.totalLogs : 0;
        stats.topSourcesList = Object.entries(stats.topSources)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([ip, count]) => ({ ip, count }));
        
        return stats;
    }

    /**
     * Get threat summary
     */
    getThreatSummary(siteIndex) {
        const logs = this.getSiteLogs(siteIndex);
        const recent = logs.slice(0, 20);
        const threats = recent.filter(l => l.isAttack);
        const critical = recent.filter(l => l.severity === 'critical');
        const high = recent.filter(l => l.severity === 'high');
        
        return {
            total: logs.length,
            recentTotal: recent.length,
            threatCount: threats.length,
            criticalCount: critical.length,
            highCount: high.length,
            threatRate: recent.length > 0 ? threats.length / recent.length : 0,
            mostCommonAttack: this.getMostCommonAttack(logs),
            highestSeverity: critical.length > 0 ? 'critical' : (high.length > 0 ? 'high' : 'medium')
        };
    }

    /**
     * Get most common attack type
     */
    getMostCommonAttack(logs) {
        const counts = {};
        logs.forEach(log => {
            if (log.attackType) {
                counts[log.attackType] = (counts[log.attackType] || 0) + 1;
            }
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0][0] : 'None';
    }

    /**
     * Filter logs by time period
     */
    filterLogsByPeriod(logs, period) {
        const now = Date.now();
        const periods = {
            'hourly': 3600000,
            'day': 86400000,
            'weekly': 604800000,
            'monthly': 2592000000,
            'yearly': 31536000000
        };
        
        const duration = periods[period] || periods['day'];
        return logs.filter(log => (now - log.rawTime) < duration);
    }

    /**
     * Export data
     */
    exportData() {
        return {
            logs: this.allLogs,
            sites: this.websiteNames,
            lastUpdate: this.lastUpdate,
            exportTime: new Date().toISOString(),
            version: '2.0',
            totalLogs: this.allLogs.reduce((sum, siteLogs) => sum + siteLogs.length, 0)
        };
    }

    /**
     * Clear all data
     */
    clearData() {
        this.allLogs = [];
        this.saveToLocalStorage([]);
        return true;
    }
}

// Create singleton instance
const dataManager = new SentinelDataManager();

// Export
window.SentinelData = {
    manager: dataManager,
    init: () => dataManager.initialize(),
    getSiteLogs: (idx) => dataManager.getSiteLogs(idx),
    getSites: () => dataManager.getSites(),
    refresh: () => dataManager.refreshData(),
    addLog: (idx, log) => dataManager.addLog(idx, log),
    getStats: (idx) => dataManager.getStatistics(idx),
    getSummary: (idx) => dataManager.getThreatSummary(idx),
    filterLogs: (logs, period) => dataManager.filterLogsByPeriod(logs, period)
};
