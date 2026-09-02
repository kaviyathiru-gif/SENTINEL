/**
 * Sentinel - Global Threat Map
 */

class ThreatMap {
    constructor() {
        this.container = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.threats = [];
        this.websiteLocations = [];
        this.hotspots = [];
        this.animating = true;
        this.animationFrame = null;
        this.particles = [];
        this.selectedThreat = null;
    }

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container not found');
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.id = 'threatMapCanvas';
        this.container.appendChild(canvas);
        this.ctx = canvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.loadData();
        this.animate();

        canvas.addEventListener('click', (e) => this.handleClick(e));
        canvas.addEventListener('mousemove', (e) => this.handleHover(e));
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width || 800;
        this.height = rect.height || 500;
        
        const canvas = document.getElementById('threatMapCanvas');
        if (canvas) {
            canvas.width = this.width;
            canvas.height = this.height;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
        }
    }

    async loadData() {
        try {
            const threatsResponse = await fetch('/api/global/threats');
            const threatsData = await threatsResponse.json();
            this.threats = threatsData.threats || [];

            const hotspotsResponse = await fetch('/api/global/hotspots');
            const hotspotsData = await hotspotsResponse.json();
            this.hotspots = hotspotsData.hotspots || [];

            this.websiteLocations = this.getWebsiteLocations();

            console.log(`✅ Loaded ${this.threats.length} threats and ${this.hotspots.length} hotspots`);
        } catch (error) {
            console.error('Error loading threat map data:', error);
            this.generateDemoData();
        }
    }

    getWebsiteLocations() {
        return [
            { name: 'acme-corp.com', lat: 37.7749, lng: -122.4194 },
            { name: 'stellarglobal.io', lat: 51.5074, lng: -0.1278 },
            { name: 'fintechsolutions.net', lat: 52.5200, lng: 13.4050 },
            { name: 'healthcareplus.org', lat: 43.6532, lng: -79.3832 },
            { name: 'edugate.academy', lat: -33.8688, lng: 151.2093 },
            { name: 'retailchain.store', lat: 35.6762, lng: 139.6503 },
            { name: 'logistixhub.com', lat: 1.3521, lng: 103.8198 },
            { name: 'mediastream.tv', lat: 48.8566, lng: 2.3522 },
            { name: 'greenenergy.co', lat: -23.5505, lng: -46.6333 },
            { name: 'cloudnest.dev', lat: 28.6139, lng: 77.2090 }
        ];
    }

    generateDemoData() {
        const cities = [
            { name: 'Moscow', lat: 55.7558, lng: 37.6173 },
            { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
            { name: 'New York', lat: 40.7128, lng: -74.0060 },
            { name: 'London', lat: 51.5074, lng: -0.1278 },
            { name: 'Tokyo', lat: 35.6762, lng: 139.6503 }
        ];

        const attackTypes = ['DDoS', 'Brute Force', 'SQL Injection', 'XSS', 'CSRF'];
        const severities = ['low', 'medium', 'high', 'critical'];

        this.threats = [];
        this.websiteLocations = this.getWebsiteLocations();

        for (let i = 0; i < 20; i++) {
            const source = cities[Math.floor(Math.random() * cities.length)];
            const target = this.websiteLocations[Math.floor(Math.random() * this.websiteLocations.length)];
            
            this.threats.push({
                id: `demo_${i}`,
                source: source,
                target: {
                    name: target.name,
                    lat: target.lat,
                    lng: target.lng
                },
                attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
                severity: severities[Math.floor(Math.random() * severities.length)],
                confidence: 0.7 + Math.random() * 0.29,
                timestamp: new Date().toISOString()
            });
        }

        this.hotspots = cities.map(city => ({
            city: city.name,
            country: 'Unknown',
            lat: city.lat,
            lng: city.lng,
            count: Math.floor(Math.random() * 10) + 1,
            severities: {
                critical: Math.floor(Math.random() * 3),
                high: Math.floor(Math.random() * 4),
                medium: Math.floor(Math.random() * 5),
                low: Math.floor(Math.random() * 5)
            }
        }));
    }

    animate() {
        if (!this.animating) return;

        this.drawMap();
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    drawMap() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.clearRect(0, 0, w, h);

        const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/1.5);
        gradient.addColorStop(0, 'rgba(20, 10, 40, 0.9)');
        gradient.addColorStop(1, 'rgba(10, 6, 24, 1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        this.drawGrid(ctx, w, h);
        this.drawWebsites(ctx, w, h);
        this.drawAttackLines(ctx, w, h);
        this.drawHotspots(ctx, w, h);
        this.drawParticles(ctx, w, h);
        this.drawLegend(ctx, w, h);
    }

    drawGrid(ctx, w, h) {
        ctx.strokeStyle = 'rgba(108, 60, 176, 0.08)';
        ctx.lineWidth = 0.5;

        for (let i = 0; i < 10; i++) {
            const y = (i / 10) * h;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        for (let i = 0; i < 10; i++) {
            const x = (i / 10) * w;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
    }

    drawWebsites(ctx, w, h) {
        this.websiteLocations.forEach((site) => {
            const x = this.lngToX(site.lng, w);
            const y = this.latToY(site.lat, h);

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
            gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#00d4ff';
            ctx.shadowColor = '#00d4ff';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '9px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(site.name.split('.')[0], x, y + 20);
        });
    }

    drawAttackLines(ctx, w, h) {
        const now = Date.now();

        this.threats.forEach((threat, index) => {
            const sourceX = this.lngToX(threat.source.lng, w);
            const sourceY = this.latToY(threat.source.lat, h);
            const targetX = this.lngToX(threat.target.lng, w);
            const targetY = this.latToY(threat.target.lat, h);

            const colors = {
                'critical': 'rgba(255, 23, 68, ',
                'high': 'rgba(255, 171, 0, ',
                'medium': 'rgba(255, 200, 0, ',
                'low': 'rgba(0, 230, 118, '
            };
            const color = colors[threat.severity] || colors.low;

            const cp1x = (sourceX + targetX) / 2;
            const cp1y = Math.min(sourceY, targetY) - 30 - Math.random() * 30;

            ctx.beginPath();
            ctx.moveTo(sourceX, sourceY);
            ctx.quadraticCurveTo(cp1x, cp1y, targetX, targetY);
            
            const dashOffset = (now / 2000 + index * 0.5) % 20;
            ctx.setLineDash([5, 15]);
            ctx.lineDashOffset = dashOffset;
            
            ctx.strokeStyle = color + '0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = color + '0.6)';
            ctx.beginPath();
            ctx.arc(sourceX, sourceY, 3, 0, Math.PI * 2);
            ctx.fill();

            const progress = ((now / 3000 + index * 0.3) % 1);
            const px = this.quadraticBezier(progress, sourceX, cp1x, targetX);
            const py = this.quadraticBezier(progress, sourceY, cp1y, targetY);

            ctx.fillStyle = color + '0.8)';
            ctx.shadowColor = color + '0.5)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    drawHotspots(ctx, w, h) {
        this.hotspots.forEach(hotspot => {
            const x = this.lngToX(hotspot.lng, w);
            const y = this.latToY(hotspot.lat, h);

            const radius = Math.min(15 + hotspot.count * 2, 40);
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
            const alpha = Math.min(0.2 + hotspot.count * 0.02, 0.4);
            gradient.addColorStop(0, `rgba(232, 62, 140, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(232, 62, 140, ${alpha * 0.5})`);
            gradient.addColorStop(1, 'rgba(232, 62, 140, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = `rgba(232, 62, 140, ${0.3 + hotspot.count * 0.02})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = `rgba(232, 62, 140, ${0.1 + hotspot.count * 0.01})`;
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${hotspot.city} (${hotspot.count})`, x, y + radius + 16);
        });
    }

    drawParticles(ctx, w, h) {
        if (this.particles.length === 0) {
            for (let i = 0; i < 30; i++) {
                this.particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: 0.5 + Math.random() * 1.5,
                    alpha: 0.1 + Math.random() * 0.3
                });
            }
        }

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;

            ctx.fillStyle = `rgba(108, 60, 176, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawLegend(ctx, w, h) {
        const legendX = w - 120;
        const legendY = 20;
        const padding = 8;

        ctx.fillStyle = 'rgba(10, 6, 24, 0.8)';
        ctx.strokeStyle = 'rgba(108, 60, 176, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(legendX, legendY, 100, 130, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Threat Severity', legendX + padding, legendY + 20);

        const items = [
            { label: 'Critical', color: '#ff1744' },
            { label: 'High', color: '#ffab00' },
            { label: 'Medium', color: '#ffc800' },
            { label: 'Low', color: '#00e676' }
        ];

        items.forEach((item, index) => {
            const y = legendY + 35 + index * 22;
            
            ctx.fillStyle = item.color;
            ctx.shadowColor = item.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(legendX + padding + 8, y + 2, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '10px sans-serif';
            ctx.fillText(item.label, legendX + padding + 18, y + 6);
        });
    }

    quadraticBezier(t, p0, p1, p2) {
        return Math.pow(1 - t, 2) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
    }

    lngToX(lng, w) {
        return (lng + 180) / 360 * w;
    }

    latToY(lat, h) {
        return (90 - lat) / 180 * h;
    }

    handleClick(e) {
        const rect = this.container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Click handling logic
    }

    handleHover(e) {
        const rect = this.container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Hover handling logic
    }

    destroy() {
        this.animating = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        const canvas = document.getElementById('threatMapCanvas');
        if (canvas) canvas.remove();
    }

    refresh() {
        this.loadData();
    }

    toggleAnimation() {
        this.animating = !this.animating;
        if (this.animating) {
            this.animate();
        }
    }
}

// Handle roundRect polyfill for older browsers
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (r > w/2) r = w/2;
        if (r > h/2) r = h/2;
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        return this;
    };
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.threatMap = new ThreatMap();
});

window.ThreatMap = ThreatMap;
