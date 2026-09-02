/**
 * Sentinel - Chart Management
 */

class SentinelChartManager {
    constructor() {
        this.charts = [];
        this.colors = {
            primary: '#e83e8c',
            secondary: '#6c3cb0',
            success: '#00e676',
            warning: '#ffab00',
            danger: '#ff1744'
        };
    }

    createBarChart(canvasId, labels, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: options.label || 'Value',
                    data: data,
                    backgroundColor: options.backgroundColor || 'rgba(232, 62, 140, 0.3)',
                    borderColor: options.borderColor || '#e83e8c',
                    borderWidth: 1,
                    borderRadius: 3,
                    barPercentage: options.barPercentage || 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: options.showLegend || false },
                    tooltip: {
                        backgroundColor: 'rgba(10, 6, 24, 0.9)',
                        titleColor: '#f0e6ff',
                        bodyColor: '#c9b0e6',
                        borderColor: 'rgba(108, 60, 176, 0.3)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(108, 60, 176, 0.1)' },
                        ticks: { color: '#8a6ea8' }
                    },
                    y: {
                        grid: { color: 'rgba(108, 60, 176, 0.1)' },
                        ticks: { color: '#8a6ea8' },
                        beginAtZero: true
                    }
                },
                animation: {
                    duration: 500,
                    easing: 'easeOutQuart'
                }
            }
        });

        this.charts.push(chart);
        return chart;
    }

    createLineChart(canvasId, labels, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: options.label || 'Value',
                    data: data,
                    borderColor: options.borderColor || '#e83e8c',
                    backgroundColor: options.backgroundColor || 'rgba(232, 62, 140, 0.1)',
                    fill: options.fill || true,
                    tension: 0.4,
                    pointBackgroundColor: options.pointColor || '#e83e8c',
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: options.showLegend || false },
                    tooltip: {
                        backgroundColor: 'rgba(10, 6, 24, 0.9)',
                        titleColor: '#f0e6ff',
                        bodyColor: '#c9b0e6'
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(108, 60, 176, 0.1)' },
                        ticks: { color: '#8a6ea8' }
                    },
                    y: {
                        grid: { color: 'rgba(108, 60, 176, 0.1)' },
                        ticks: { color: '#8a6ea8' },
                        beginAtZero: true
                    }
                },
                animation: {
                    duration: 500
                }
            }
        });

        this.charts.push(chart);
        return chart;
    }

    createDoughnutChart(canvasId, labels, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const colors = options.colors || [
            '#e83e8c', '#6c3cb0', '#00e676', '#ffab00', '#ff1744',
            '#00bcd4', '#7c4dff', '#ff6d00', '#26c6da', '#66bb6a'
        ];

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, data.length),
                    borderColor: 'rgba(10, 6, 24, 0.8)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: options.showLegend || true,
                        position: 'bottom',
                        labels: {
                            color: '#c9b0e6',
                            boxWidth: 12,
                            padding: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 6, 24, 0.9)',
                        titleColor: '#f0e6ff',
                        bodyColor: '#c9b0e6'
                    }
                },
                cutout: options.cutout || '60%',
                animation: {
                    animateRotate: true,
                    duration: 500
                }
            }
        });

        this.charts.push(chart);
        return chart;
    }

    updateChart(chart, newData) {
        if (chart) {
            chart.data.datasets[0].data = newData;
            chart.update();
        }
    }

    destroyAll() {
        this.charts.forEach(chart => chart.destroy());
        this.charts = [];
    }
}

const chartManager = new SentinelChartManager();
