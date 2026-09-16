/**
 * SENTINEL - Power BI Analytics Panel Engine (13 Visualizations)
 * Core Engine: Chart.js
 */

(function () {
  'use strict';

  class SentinelPowerBIAnalytics {
    constructor() {
      this.charts = {};
      this.init();
    }

    init() {
      window.addEventListener('load', () => {
        this.renderAllCharts();
      });
    }

    /**
     * Color Gradient Helper Utilities
     */
    createPurpleGradient(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, 150);
      g.addColorStop(0, 'rgba(147, 51, 234, 0.6)');
      g.addColorStop(1, 'rgba(147, 51, 234, 0.0)');
      return g;
    }

    createCyanGradient(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, 150);
      g.addColorStop(0, 'rgba(6, 182, 212, 0.6)');
      g.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
      return g;
    }

    renderAllCharts() {
      const defaultOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#64748b', font: { family: 'Fira Code', size: 9 } }, grid: { display: false } },
          y: { ticks: { color: '#64748b', font: { family: 'Fira Code', size: 9 } }, grid: { color: 'rgba(255,255,255,0.03)' } }
        }
      };

      // 1. Threat Intensity Area Chart
      const el1 = document.getElementById('pbiChart1');
      if (el1) {
        this.charts.chart1 = new Chart(el1, {
          type: 'line',
          data: {
            labels: ['12k', '13k', '14k', '15k', '16k'],
            datasets: [{
              data: [30, 65, 45, 85, 50],
              borderColor: '#9333ea',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              backgroundColor: (ctx) => this.createPurpleGradient(ctx.chart.ctx)
            }]
          },
          options: defaultOpts
        });
      }

      // 2. Network Traffic Live Stream
      const el2 = document.getElementById('pbiChart2');
      if (el2) {
        this.charts.chart2 = new Chart(el2, {
          type: 'line',
          data: {
            labels: ['10s', '20s', '30s', '40s', '50s'],
            datasets: [{
              data: [20, 80, 50, 90, 60],
              borderColor: '#06b6d4',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              backgroundColor: (ctx) => this.createCyanGradient(ctx.chart.ctx)
            }]
          },
          options: defaultOpts
        });
      }

      // 3. Attack Origins Scatter Vector Plot
      const el3 = document.getElementById('pbiChart3');
      if (el3) {
        this.charts.chart3 = new Chart(el3, {
          type: 'scatter',
          data: {
            datasets: [{
              data: [{ x: 10, y: 20 }, { x: 25, y: 45 }, { x: 40, y: 80 }, { x: 70, y: 30 }],
              backgroundColor: '#ec4899',
              pointRadius: 4
            }]
          },
          options: defaultOpts
        });
      }

      // 4. Protocol Activity Distribution Bar Chart
      const el4 = document.getElementById('pbiChart4');
      if (el4) {
        this.charts.chart4 = new Chart(el4, {
          type: 'bar',
          data: {
            labels: ['HTTP', 'DNS', 'SSH', 'FTP'],
            datasets: [{
              data: [85, 60, 40, 25],
              backgroundColor: ['#c084fc', '#06b6d4', '#ec4899', '#3b82f6'],
              borderRadius: 4
            }]
          },
          options: defaultOpts
        });
      }

      // 5. Detections by Severity Doughnut
      const el5 = document.getElementById('pbiChart5');
      if (el5) {
        this.charts.chart5 = new Chart(el5, {
          type: 'pie',
          data: {
            labels: ['Low', 'Med', 'High', 'Critical'],
            datasets: [{
              data: [40, 30, 20, 10],
              backgroundColor: ['#06b6d4', '#3b82f6', '#9333ea', '#ec4899'],
              borderWidth: 0
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
      }

      // 6. Security Events Timeline
      const el6 = document.getElementById('pbiChart6');
      if (el6) {
        this.charts.chart6 = new Chart(el6, {
          type: 'line',
          data: {
            labels: ['01:00', '02:00', '03:00', '04:00'],
            datasets: [{
              data: [12, 19, 3, 15],
              borderColor: '#10b981',
              borderWidth: 2,
              tension: 0.3
            }]
          },
          options: defaultOpts
        });
      }

      // 7. Bandwidth Usage Radial Gauge
      const el7 = document.getElementById('pbiChart7');
      if (el7) {
        this.charts.chart7 = new Chart(el7, {
          type: 'doughnut',
          data: {
            datasets: [{
              data: [75, 25],
              backgroundColor: ['#06b6d4', '#141026'],
              borderWidth: 0
            }]
          },
          options: { cutout: '75%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
      }

      // 8. Port Scanning Status Matrix
      const el8 = document.getElementById('pbiChart8');
      if (el8) {
        this.charts.chart8 = new Chart(el8, {
          type: 'bar',
          data: {
            labels: ['P80', 'P443', 'P22', 'P8080'],
            datasets: [{
              data: [300, 450, 120, 80],
              backgroundColor: '#ec4899',
              borderRadius: 4
            }]
          },
          options: defaultOpts
        });
      }

      // 9. API Request Load Rate
      const el9 = document.getElementById('pbiChart9');
      if (el9) {
        this.charts.chart9 = new Chart(el9, {
          type: 'line',
          data: {
            labels: ['M', 'T', 'W', 'T', 'F'],
            datasets: [{
              data: [50, 80, 45, 90, 70],
              borderColor: '#c084fc',
              borderWidth: 2,
              tension: 0.3
            }]
          },
          options: defaultOpts
        });
      }

      // 10. Malware Analysis Polar Distribution
      const el10 = document.getElementById('pbiChart10');
      if (el10) {
        this.charts.chart10 = new Chart(el10, {
          type: 'polarArea',
          data: {
            labels: ['Trojan', 'Ransomware', 'Spyware'],
            datasets: [{
              data: [11, 16, 7],
              backgroundColor: ['#9333ea', '#ec4899', '#06b6d4']
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
      }

      // 11. Endpoint Health Monitoring Bar
      const el11 = document.getElementById('pbiChart11');
      if (el11) {
        this.charts.chart11 = new Chart(el11, {
          type: 'bar',
          data: {
            labels: ['Server A', 'Server B', 'Server C'],
            datasets: [{
              data: [99, 95, 92],
              backgroundColor: '#10b981',
              borderRadius: 4
            }]
          },
          options: defaultOpts
        });
      }

      // 12. Authentication Logs Timeline
      const el12 = document.getElementById('pbiChart12');
      if (el12) {
        this.charts.chart12 = new Chart(el12, {
          type: 'line',
          data: {
            labels: ['1', '2', '3', '4', '5'],
            datasets: [{
              data: [5, 12, 8, 24, 15],
              borderColor: '#38bdf8',
              borderWidth: 2,
              tension: 0.4
            }]
          },
          options: defaultOpts
        });
      }

      // 13. KDD-Cup Deep Neural Net (DNN) & LSTM Model Precision Matrix (Large Banner Panel)
      const el13 = document.getElementById('pbiChart13');
      if (el13) {
        this.charts.chart13 = new Chart(el13, {
          type: 'bar',
          data: {
            labels: ['DDoS Syn-Flood', 'SQL Injection', 'Brute Force SSH', 'Port Scanning', 'Ransomware Payload', 'XSS Vectors'],
            datasets: [
              {
                label: 'Random Forest Precision (%)',
                data: [98.5, 97.2, 99.1, 96.8, 98.0, 95.4],
                backgroundColor: '#9333ea',
                borderRadius: 4
              },
              {
                label: 'LSTM Deep RNN Precision (%)',
                data: [99.4, 98.9, 99.6, 98.2, 99.1, 97.8],
                backgroundColor: '#06b6d4',
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                labels: { color: '#e2e8f0', font: { family: 'Fira Code', size: 10 } }
              }
            },
            scales: {
              x: { ticks: { color: '#94a3b8', font: { family: 'Fira Code', size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
              y: { ticks: { color: '#94a3b8', font: { family: 'Fira Code', size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } }
            }
          }
        });
      }
    }
  }

  // Attach instance globally to window
  window.SentinelAnalytics = new SentinelPowerBIAnalytics();
})();
