/**
 * Sentinel - Chart Manager
 * Manages all Chart.js visualizations
 */

class SentinelChartManager {
    constructor() {
        this.charts = [];
        this.chartInstances = [];
        this.colors = {
            primary: '#00d4ff',
            secondary: '#7c4dff',
            success: '#00e676',
            warning: '#ffab00',
            danger: '#ff1744',
            background: 'rgba(0, 212, 255, 0.1)',
            border: 'rgba(0, 212, 255, 0.2)'
        };
    }

    /**
     * Render 12 graphs
     */
    renderGraphs(logs, containerId = 'graphsContainer') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        this.chartInstances = [];
        this.charts = [];
        
        // Get attack statistics
        const stats = this.getAttackStats(logs);
        
        // Create 12 graph items
        const graphItems = this.prepareGraphItems(stats, logs);
        
        // Render each graph
        graphItems.forEach((item, index) => {
            const card = this.createGraphCard(item, index);
            container.appendChild(card);
            
            // Create chart
            const canvas = card.querySelector('canvas');
            if (canvas) {
                const chart = this.createChart(canvas, item);
                this.chartInstances.push(chart);
                this.charts.push(chart);
            }
        });
    }

    /**
     * Get attack statistics from logs
     */
    getAttackStats(logs) {
        const stats = {
            attackCounts: {},
            severityCounts: { safe: 0, low: 0, medium: 0, high: 0, critical: 0 },
            dailyDistribution: Array(7).fill(0),
            hourlyDistribution: Array(24).fill(0),
            protocolDistribution: {},
            portDistribution: {},
            confidenceDistribution: { low: 0, medium: 0, high: 0 }
        };
        
        logs.forEach(log => {
            // Count attack types
            if (log.attackType) {
                stats.attackCounts[log.attackType] = (stats.attackCounts[log.attackType] || 0) + 1;
            }
            
            // Count severity
            if (log.severity) {
                stats.severityCounts[log.severity] = (stats.severityCounts[log.severity] || 0) + 1;
            }
            
            // Daily distribution
            if (log.timestamp instanceof Date) {
                const day = log.timestamp.getDay();
                stats.dailyDistribution[day] = (stats.dailyDistribution[day] || 0) + 1;
                
                const hour = log.timestamp.getHours();
                stats.hourlyDistribution[hour] = (stats.hourlyDistribution[hour] || 0) + 1;
            }
            
            // Protocol distribution
            if (log.protocol) {
                const protoName = this.getProtocolName(log.protocol);
                stats.protocolDistribution[protoName] = (stats.protocolDistribution[protoName] || 0) + 1;
            }
            
            // Port distribution
            if (log.port) {
                const portRange = this.getPortRange(log.port);
                stats.portDistribution[portRange] = (stats.portDistribution[portRange] || 0) + 1;
            }
            
            // Confidence distribution
            if (log.confidence) {
                if (log.confidence > 0.7) stats.confidenceDistribution.high++;
                else if (log.confidence > 0.4) stats.confidenceDistribution.medium++;
                else stats.confidenceDistribution.low++;
            }
        });
        
        return stats;
    }

    /**
     * Prepare graph items
     */
    prepareGraphItems(stats, logs) {
        const items = [];
        const attackTypes = Object.keys(stats.attackCounts).sort((a, b) => 
            stats.attackCounts[b] - stats.attackCounts[a]
        );
        
        // Top 8 attack types
        attackTypes.slice(0, 8).forEach(type => {
            items.push({
                title: type,
                value: stats.attackCounts[type] || 0,
                data: this.generateDayData(logs, type),
                type: 'attack',
                color: this.getColorForAttack(type)
            });
        });
        
        // Add 4 additional metrics
        const extraMetrics = [
            {
                title: 'Total Attacks',
                value: logs.filter(l => l.isAttack).length,
                data: stats.dailyDistribution,
                type: 'total'
            },
            {
                title: 'Severity: Critical',
                value: stats.severityCounts.critical || 0,
                data: this.generateSeverityData(logs, 'critical'),
                type: 'severity'
            },
            {
                title: 'Unique Sources',
                value: new Set(logs.map(l => l.sourceIP)).size,
                data: this.generateSourceData(logs),
                type: 'source'
            },
            {
                title: 'Avg Confidence',
                value: Math.round((logs.reduce((sum, l) => sum + (l.confidence || 0), 0) / (logs.length || 1)) * 100),
                data: this.generateConfidenceData(logs),
                type: 'confidence'
            }
        ];
        
        extraMetrics.forEach(metric => items.push(metric));
        
        // Ensure exactly 12 items
        while (items.length < 12) {
            items.push({
                title: 'Other',
                value: 0,
                data: Array(7).fill(0),
                type: 'other'
            });
        }
        
        return items.slice(0, 12);
    }

    /**
     * Create graph card element
     */
    createGraphCard(item, index) {
        const card = document.createElement('div');
        card.className = 'graph-card';
        card.style.animationDelay = `${0.05 * index}s`;
        
        const header = document.createElement('div');
        header.className = 'graph-header';
        
        const title = document.createElement('span');
        title.className = 'graph-title';
        title.textContent = this.truncateText(item.title, 20);
        
        const value = document.createElement('span');
        value.className = 'graph-value';
        value.textContent = typeof item.value === 'number' ? item.value : item.value || '0';
        
        header.appendChild(title);
        header.appendChild(value);
        
        const canvas = document.createElement('canvas');
        canvas.id = `graph-${index}`;
        
        card.appendChild(header);
        card.appendChild(canvas);
        
        return card;
    }

    /**
     * Create Chart.js chart
     */
    createChart(canvas, item) {
        const ctx = canvas.getContext('2d');
        const colors = this.getChartColors(item.type);
        
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    data: item.data || Array(7).fill(0),
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 3,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        enabled: false,
                        backgroundColor: 'rgba(10, 22, 40, 0.9)',
                        titleColor: '#e8edf5',
                        bodyColor: '#8aa8c9'
                    }
                },
                scales: {
                    x: { 
                        display: false,
                        grid: { display: false }
                    },
                    y: { 
                        display: false,
                        beginAtZero: true,
                        grid: { display: false }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    /**
     * Generate daily distribution data for specific attack type
     */
    generateDayData(logs, attackType) {
        const days = Array(7).fill(0);
        logs.filter(l => l.attackType === attackType).forEach(log => {
            if (log.timestamp instanceof Date) {
                const day = log.timestamp.getDay();
                days[day] = (days[day] || 0) + 1;
            }
        });
        return days;
    }

    /**
     * Generate severity data
     */
    generateSeverityData(logs, severity) {
        const days = Array(7).fill(0);
        logs.filter(l => l.severity === severity).forEach(log => {
            if (log.timestamp instanceof Date) {
                const day = log.timestamp.getDay();
                days[day] = (days[day] || 0) + 1;
            }
        });
        return days;
    }

    /**
     * Generate source data
     */
    generateSourceData(logs) {
        const days = Array(7).fill(0);
        const sources = new Set();
        logs.forEach(log => {
            if (log.sourceIP && !sources.has(log.sourceIP)) {
                sources.add(log.sourceIP);
                if (log.timestamp instanceof Date) {
                    const day = log.timestamp.getDay();
                    days[day] = (days[day] || 0) + 1;
                }
            }
        });
        return days;
    }

    /**
     * Generate confidence data
     */
    generateConfidenceData(logs) {
        const days = Array(7).fill(0);
        logs.forEach(log => {
            if (log.confidence && log.timestamp instanceof Date) {
                const day = log.timestamp.getDay();
                days[day] = (days[day] || 0) + (log.confidence || 0);
            }
        });
        return days.map(d => Math.round(d / (logs.length / 7) * 100) || 0);
    }

    /**
     * Get chart colors based on type
     */
    getChartColors(type) {
        const colors = {
            attack: {
                background: 'rgba(255, 23, 68, 0.2)',
                border: 'rgba(255, 23, 68, 0.5)'
            },
            total: {
                background: 'rgba(0, 212, 255, 0.2)',
                border: 'rgba(0, 212, 255, 0.5)'
            },
            severity: {
                background: 'rgba(255, 171, 0, 0.2)',
                border: 'rgba(255, 171, 0, 0.5)'
            },
            source: {
                background: 'rgba(0, 230, 118, 0.2)',
                border: 'rgba(0, 230, 118, 0.5)'
            },
            confidence: {
                background: 'rgba(124, 77, 255, 0.2)',
                border: 'rgba(124, 77, 255, 0.5)'
            },
            other: {
                background: 'rgba(138, 168, 201, 0.2)',
                border: 'rgba(138, 168, 201, 0.5)'
            }
        };
        return colors[type] || colors.other;
    }

    /**
     * Get color for attack type
     */
    getColorForAttack(type) {
        const colors = {
            'SQL Injection': '#ff1744',
            'XSS': '#ffab00',
            'DDoS': '#ff6d00',
            'Brute Force': '#d500f9',
            'CSRF': '#00bcd4',
            'File Inclusion': '#ff4081',
            'RCE': '#f44336',
            'Path Traversal': '#ff9100'
        };
        return colors[type] || '#8aa8c9';
    }

    /**
     * Get protocol name
     */
    getProtocolName(protocol) {
        const map = { 6: 'TCP', 17: 'UDP', 1: 'ICMP' };
        return map[protocol] || `Protocol-${protocol}`;
    }

    /**
     * Get port range
     */
    getPortRange(port) {
        if (port < 1024) return 'Well-known (0-1023)';
        if (port < 49152) return 'Registered (1024-49151)';
        return 'Dynamic (49152-65535)';
    }

    /**
     * Truncate text
     */
    truncateText(text, maxLen) {
        if (!text) return '';
        return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
    }

    /**
     * Update charts with new data
     */
    updateCharts(logs) {
        const stats = this.getAttackStats(logs);
        const items = this.prepareGraphItems(stats, logs);
        
        this.chartInstances.forEach((chart, index) => {
            if (index < items.length) {
                chart.data.datasets[0].data = items[index].data || Array(7).fill(0);
                chart.update();
            }
        });
    }

    /**
     * Destroy all charts
     */
    destroyCharts() {
        this.chartInstances.forEach(chart => {
            if (chart) chart.destroy();
        });
        this.chartInstances = [];
        this.charts = [];
    }
}

// Create singleton instance
const chartManager = new SentinelChartManager();

// Export
window.SentinelCharts = {
    manager: chartManager,
    render: (logs, container) => chartManager.renderGraphs(logs, container),
    update: (logs) => chartManager.updateCharts(logs),
    destroy: () => chartManager.destroyCharts()
};
