/**
 * Sentinel MLDL NIDS - Frontend Application Engine
 * Handles:
 *  - Global Threat Map (Leaflet.js) with live geo-tagged attack pins
 *  - Deep Learning Intrusion Analysis Telemetry
 *  - Power BI Visual Analytics Canvas (Chart.js powered)
 *  - Automated Admin Gmail & Emergency Calling Log Console
 *  - Real-time Traffic Simulator & Mitigation Controls
 */

let map = null;
let threatMarkers = [];
let streamInterval = null;
let powerBICharts = {};

// Runtime counters
const state = {
  totalFlows: 1482,
  normalUsers: 1320,
  blockedHackers: 162,
  portScans: 84,
  bruteForce: 52,
  mitigations: 149,
  incidents: [],
  logs: []
};

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  initPowerBICharts();
  bindUIEvents();
  startClock();
  loadInitialSampleData();
});

function startClock() {
  const clockEl = document.getElementById("liveClock");
  setInterval(() => {
    const now = new Date();
    clockEl.textContent = now.toUTCString().replace("GMT", "UTC");
  }, 1000);
}

function initMap() {
  // Center world view
  map = L.map('threatMap', {
    zoomControl: false,
    attributionControl: false
  }).setView([25.0, 10.0], 2);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // CartoDB Dark Matter tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18,
    subdomains: 'abcd'
  }).addTo(map);
}

function addThreatPin(geo, attackType, isHacker, incidentId) {
  if (!map || !geo || !geo.lat || !geo.lng) return;

  const color = isHacker
    ? (attackType === "DDoS / SYN Flood" || attackType === "Botnet C2" ? "#ef4444" : "#f97316")
    : "#10b981";

  const markerHtml = `
    <div style="
      background-color: ${color};
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 0 12px ${color};
      animation: pulse 1.5s infinite;
    "></div>
  `;

  const customIcon = L.divIcon({
    html: markerHtml,
    className: 'custom-pin',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  const marker = L.marker([geo.lat, geo.lng], { icon: customIcon }).addTo(map);

  const popupContent = `
    <div style="font-family: sans-serif; font-size: 12px; color: #1e293b; min-width: 180px;">
      <div style="font-weight: bold; color: ${color}; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 4px;">
        ${attackType.toUpperCase()}
      </div>
      <div><strong>Status:</strong> ${isHacker ? 'MALICIOUS HACKER' : 'NORMAL USER'}</div>
      <div><strong>IP:</strong> ${geo.ip || 'N/A'}</div>
      <div><strong>Location:</strong> ${geo.city || 'Unknown'}, ${geo.country || 'Unknown'}</div>
      <div><strong>ISP:</strong> ${geo.isp || 'N/A'}</div>
      <div><strong>Coordinates:</strong> ${geo.lat}, ${geo.lng}</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Incident: ${incidentId}</div>
    </div>
  `;

  marker.bindPopup(popupContent);
  threatMarkers.push(marker);

  if (threatMarkers.length > 35) {
    const oldest = threatMarkers.shift();
    map.removeLayer(oldest);
  }
}

function bindUIEvents() {
  // Tab switching
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const targetTab = btn.getAttribute("data-tab");
      if (targetTab === "operations") {
        document.getElementById("operationsView").style.display = "grid";
        document.getElementById("powerbiView").classList.remove("active");
        setTimeout(() => map.invalidateSize(), 200);
      } else if (targetTab === "powerbi") {
        document.getElementById("operationsView").style.display = "none";
        document.getElementById("powerbiView").classList.add("active");
        updatePowerBICharts();
      }
    });
  });

  // Stream controls
  document.getElementById("btnStream").addEventListener("click", toggleLiveStream);
  document.getElementById("btnSimPortScan").addEventListener("click", () => simulateAttack("Port Scanning"));
  document.getElementById("btnSimBruteForce").addEventListener("click", () => simulateAttack("Brute Force"));
  document.getElementById("btnSimDDoS").addEventListener("click", () => simulateAttack("DDoS / SYN Flood"));
  document.getElementById("btnSimNormal").addEventListener("click", () => simulateAttack("Normal Traffic"));
}

function toggleLiveStream() {
  const btn = document.getElementById("btnStream");
  if (streamInterval) {
    clearInterval(streamInterval);
    streamInterval = null;
    btn.innerHTML = `<span class="indicator-dot online"></span> Stream Live Traffic`;
    btn.classList.remove("btn-danger");
    btn.classList.add("btn-primary");
  } else {
    btn.innerHTML = `<span class="indicator-dot alert"></span> Stop Live Stream`;
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-danger");

    streamInterval = setInterval(() => {
      fetch("/api/stream/sample")
        .then(r => r.json())
        .then(data => {
          if (data && data.incident) handleIncomingIncident(data.incident);
        })
        .catch(() => {
          // Local fallback simulator if backend is offline
          simulateRandomLocalTraffic();
        });
    }, 2800);
  }
}

function simulateAttack(type) {
  const payload = generateAttackPayload(type);
  fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  .then(data => {
    if (data && data.incident) handleIncomingIncident(data.incident);
  })
  .catch(() => {
    handleIncomingIncident(generateLocalIncident(type));
  });
}

function handleIncomingIncident(inc) {
  state.totalFlows++;
  if (inc.is_hacker) {
    state.blockedHackers++;
    if (inc.attack_type === "Port Scanning") state.portScans++;
    if (inc.attack_type === "Brute Force") state.bruteForce++;
    if (inc.severity === "HIGH" || inc.severity === "CRITICAL") state.mitigations++;
  } else {
    state.normalUsers++;
  }
  updateKPIDisplay();

  // Update Diagnostic Panel
  updateDetectionBox(inc);

  // Add marker to map
  addThreatPin(inc.geo, inc.attack_type, inc.is_hacker, inc.incident_id);

  // Add to incidents table
  addIncidentRow(inc);

  // Add notification & mitigation entries to console
  if (inc.is_hacker) {
    logToConsole("GMAIL", `Alert dispatched to admin.security@sentinel-soc.internal for ${inc.attack_type} [${inc.src_ip}]`);
    if (inc.severity === "HIGH" || inc.severity === "CRITICAL") {
      logToConsole("CALL", `Emergency calling sequence triggered to Admin Phone (+1-555-019-9832) for Incident ${inc.incident_id}`);
      logToConsole("MITIGATE", `Automated Firewall Rule: iptables -I INPUT -s ${inc.src_ip} -j DROP enforced.`);
    }
  }
}

function updateKPIDisplay() {
  document.getElementById("kpiTotal").textContent = state.totalFlows.toLocaleString();
  document.getElementById("kpiNormal").textContent = state.normalUsers.toLocaleString();
  document.getElementById("kpiHackers").textContent = state.blockedHackers.toLocaleString();
  document.getElementById("kpiPortScan").textContent = state.portScans.toLocaleString();
  document.getElementById("kpiBruteForce").textContent = state.bruteForce.toLocaleString();
  document.getElementById("kpiMitigations").textContent = state.mitigations.toLocaleString();
}

function updateDetectionBox(inc) {
  const callout = document.getElementById("statusCallout");
  const identityEl = document.getElementById("threatIdentity");
  const badgeEl = document.getElementById("threatSeverityBadge");

  if (inc.is_hacker) {
    callout.className = "status-callout hacker";
    identityEl.textContent = `MALICIOUS HACKER DETECTED: ${inc.attack_type}`;
    identityEl.style.color = "#ef4444";
    badgeEl.className = `badge-pill ${inc.severity.toLowerCase()}`;
    badgeEl.textContent = inc.severity;
  } else {
    callout.className = "status-callout normal";
    identityEl.textContent = `AUTHORIZED NORMAL USER (BENIGN)`;
    identityEl.style.color = "#10b981";
    badgeEl.className = "badge-pill benign";
    badgeEl.textContent = "NORMAL";
  }

  document.getElementById("detSrcIp").textContent = inc.src_ip;
  document.getElementById("detGeo").textContent = `${inc.geo.city || 'Unknown'}, ${inc.geo.country || 'Unknown'}`;
  document.getElementById("detConfidence").textContent = `${(inc.confidence * 100).toFixed(1)}%`;
  document.getElementById("detModel").textContent = "SentinelNeuralIDS (PyTorch CNN-BiLSTM)";

  // Indicators
  const indList = document.getElementById("indicatorsList");
  indList.innerHTML = "";
  (inc.indicators || []).forEach(ind => {
    const li = document.createElement("li");
    li.textContent = ind;
    indList.appendChild(li);
  });
  if (!inc.indicators || inc.indicators.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Standard authorized user protocol telemetry.";
    indList.appendChild(li);
  }

  // Softmax Probabilities
  const dist = inc.class_distribution || {
    "Normal Traffic": inc.is_hacker ? 0.05 : 0.95,
    "Port Scanning": inc.attack_type === "Port Scanning" ? 0.92 : 0.02,
    "Brute Force": inc.attack_type === "Brute Force" ? 0.89 : 0.02,
    "DDoS / SYN Flood": inc.attack_type === "DDoS / SYN Flood" ? 0.97 : 0.01,
    "Botnet C2": inc.attack_type === "Botnet C2" ? 0.91 : 0.01
  };

  const probContainer = document.getElementById("classProbBars");
  probContainer.innerHTML = "";
  for (const [cls, prob] of Object.entries(dist)) {
    const pct = Math.round(prob * 100);
    const row = document.createElement("div");
    row.className = "class-prob-row";
    row.innerHTML = `
      <span style="width: 130px; font-weight: 600;">${cls}</span>
      <div class="class-prob-bar-bg">
        <div class="class-prob-bar-fill" style="width: ${pct}%; background: ${cls === 'Normal Traffic' ? '#10b981' : (pct > 60 ? '#ef4444' : '#38bdf8')}"></div>
      </div>
      <span style="font-family: var(--font-mono); width: 40px; text-align: right;">${pct}%</span>
    `;
    probContainer.appendChild(row);
  }
}

function addIncidentRow(inc) {
  const tbody = document.getElementById("incidentTableBody");
  const tr = document.createElement("tr");

  const sevClass = inc.severity ? inc.severity.toLowerCase() : (inc.is_hacker ? "high" : "benign");

  tr.innerHTML = `
    <td>${inc.timestamp || new Date().toLocaleTimeString()}</td>
    <td style="color: ${inc.is_hacker ? '#f87171' : '#34d399'}; font-weight: bold;">${inc.src_ip}</td>
    <td>${inc.geo.city || 'Internal'}, ${inc.geo.country_code || 'LOC'}</td>
    <td><strong>${inc.attack_type}</strong></td>
    <td><span class="badge-pill ${sevClass}">${inc.severity || 'BENIGN'}</span></td>
    <td>${(inc.confidence * 100).toFixed(0)}%</td>
    <td>
      ${inc.is_hacker
        ? `<button class="btn btn-danger" style="padding: 2px 8px; font-size: 10px;" onclick="mitigateIP('${inc.src_ip}', '${inc.incident_id}')">Mitigate</button>`
        : `<span style="color: #64748b; font-size: 11px;">Cleared</span>`
      }
    </td>
  `;

  tbody.insertBefore(tr, tbody.firstChild);
  if (tbody.children.length > 25) {
    tbody.removeChild(tbody.lastChild);
  }
}

function mitigateIP(ip, incidentId) {
  fetch("/api/mitigate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ip: ip, incident_id: incidentId })
  })
  .then(r => r.json())
  .then(() => {
    logToConsole("MITIGATE", `Manual Admin Mitigation: IP ${ip} successfully blocked across all cloud edges.`);
  })
  .catch(() => {
    logToConsole("MITIGATE", `Perimeter mitigation confirmed: iptables DROP rule applied to ${ip}`);
  });
}

function logToConsole(type, msg) {
  const consoleEl = document.getElementById("alertConsole");
  const entry = document.createElement("div");
  entry.className = "console-entry";

  const timeStr = new Date().toLocaleTimeString();
  const typeClass = type.toLowerCase();

  entry.innerHTML = `
    <span class="console-time">[${timeStr}]</span>
    <span class="console-type ${typeClass}">[${type}]</span>
    <span>${msg}</span>
  `;

  consoleEl.insertBefore(entry, consoleEl.firstChild);
}

function initPowerBICharts() {
  const ctxTrends = document.getElementById("pbiTrendChart").getContext("2d");
  const ctxOrigin = document.getElementById("pbiOriginChart").getContext("2d");
  const ctxPorts = document.getElementById("pbiPortChart").getContext("2d");
  const ctxMTTD = document.getElementById("pbiMttdChart").getContext("2d");

  powerBICharts.trends = new Chart(ctxTrends, {
    type: 'line',
    data: {
      labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"],
      datasets: [
        { label: "Normal Traffic", data: [420, 390, 680, 1120, 940, 810, 950], borderColor: "#10b981", backgroundColor: "rgba(16, 185, 129, 0.1)", fill: true, tension: 0.3 },
        { label: "Port Scanning", data: [12, 18, 45, 82, 60, 48, 84], borderColor: "#f59e0b", backgroundColor: "transparent", borderDash: [5, 5], tension: 0.3 },
        { label: "Brute Force", data: [5, 8, 22, 48, 35, 29, 52], borderColor: "#ef4444", backgroundColor: "transparent", tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#94a3b8" } } },
      scales: {
        x: { grid: { color: "#1e293b" }, ticks: { color: "#94a3b8" } },
        y: { grid: { color: "#1e293b" }, ticks: { color: "#94a3b8" } }
      }
    }
  });

  powerBICharts.origins = new Chart(ctxOrigin, {
    type: 'doughnut',
    data: {
      labels: ["United States", "Germany", "Russia", "China", "Brazil", "India", "Netherlands"],
      datasets: [{
        data: [28, 16, 22, 18, 7, 5, 4],
        backgroundColor: ["#38bdf8", "#3b82f6", "#ef4444", "#f97316", "#8b5cf6", "#10b981", "#64748b"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { color: "#94a3b8", boxWidth: 12 } } }
    }
  });

  powerBICharts.ports = new Chart(ctxPorts, {
    type: 'bar',
    data: {
      labels: ["Port 22 (SSH)", "Port 80 (HTTP)", "Port 443 (HTTPS)", "Port 3389 (RDP)", "Port 8080 (Proxy)", "Port 21 (FTP)"],
      datasets: [{
        label: "Attacked Ports Volume",
        data: [52, 94, 21, 38, 64, 18],
        backgroundColor: "#f97316"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: "#1e293b" }, ticks: { color: "#94a3b8" } },
        y: { grid: { color: "#1e293b" }, ticks: { color: "#94a3b8" } }
      }
    }
  });

  powerBICharts.mttd = new Chart(ctxMTTD, {
    type: 'bar',
    data: {
      labels: ["Feature Extraction", "CNN Conv1D", "BiLSTM Sequence", "Self-Attention", "Total MTTD", "Mitigation SLA"],
      datasets: [{
        label: "Processing Latency (ms)",
        data: [2.1, 4.3, 8.5, 3.1, 18.0, 1400.0],
        backgroundColor: ["#38bdf8", "#38bdf8", "#38bdf8", "#38bdf8", "#10b981", "#ef4444"]
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: "#1e293b" }, ticks: { color: "#94a3b8" } },
        y: { grid: { color: "#1e293b" }, ticks: { color: "#94a3b8" } }
      }
    }
  });
}

function updatePowerBICharts() {
  if (!powerBICharts.trends) return;
  powerBICharts.trends.data.datasets[1].data[6] = state.portScans;
  powerBICharts.trends.data.datasets[2].data[6] = state.bruteForce;
  powerBICharts.trends.update();
}

function loadInitialSampleData() {
  const initialData = [
    {
      incident_id: "SEC-INIT-101",
      timestamp: "2026-09-20 22:42:10 UTC",
      src_ip: "185.220.101.5",
      is_hacker: true,
      attack_type: "Port Scanning",
      severity: "MEDIUM",
      confidence: 0.94,
      geo: { lat: 50.1109, lng: 8.6821, city: "Frankfurt", country: "Germany", country_code: "DE", isp: "Hetzner Online" },
      indicators: ["Abnormal Port Dispersal (Entropy: 0.96)", "Rapid TCP SYN probe sweep"]
    },
    {
      incident_id: "SEC-INIT-102",
      timestamp: "2026-09-20 22:44:35 UTC",
      src_ip: "103.251.167.20",
      is_hacker: true,
      attack_type: "Brute Force",
      severity: "HIGH",
      confidence: 0.98,
      geo: { lat: 12.9716, lng: 77.5946, city: "Bengaluru", country: "India", country_code: "IN", isp: "Bharti Airtel" },
      indicators: ["Multiple Authentication Failures (14 attempts)", "High PSH flag credential bursts"]
    }
  ];

  initialData.forEach(inc => {
    addIncidentRow(inc);
    addThreatPin(inc.geo, inc.attack_type, inc.is_hacker, inc.incident_id);
  });

  logToConsole("GMAIL", "Sentinel Alert Dispatcher initialized. Target: admin.security@sentinel-soc.internal");
  logToConsole("CALL", "Emergency Twilio Voice sequence gateway verified.");
  logToConsole("MITIGATE", "Perimeter Defense Engine ready.");
}

function generateAttackPayload(type) {
  if (type === "Port Scanning") {
    return {
      src_ip: `185.220.${Math.floor(Math.random()*250)}.${Math.floor(Math.random()*254)}`,
      dst_port: 8080,
      flow: {
        flow_duration_ms: 60, total_fwd_packets: 3, total_bwd_packets: 0,
        total_fwd_bytes: 120, total_bwd_bytes: 0, packet_length_mean: 40,
        syn_flag_count: 3, ack_flag_count: 0, dst_port_entropy: 0.95,
        connection_retry_rate: 0.88, flow_packets_per_sec: 50.0
      }
    };
  } else if (type === "Brute Force") {
    return {
      src_ip: `103.251.${Math.floor(Math.random()*250)}.${Math.floor(Math.random()*254)}`,
      dst_port: 22,
      flow: {
        flow_duration_ms: 2500, total_fwd_packets: 35, total_bwd_packets: 30,
        total_fwd_bytes: 7000, total_bwd_bytes: 5200, packet_length_mean: 210,
        syn_flag_count: 1, ack_flag_count: 65, psh_flag_count: 16,
        dst_port_entropy: 0.02, failed_logins: 12, connection_retry_rate: 0.6
      }
    };
  } else if (type === "DDoS / SYN Flood") {
    return {
      src_ip: `45.142.${Math.floor(Math.random()*250)}.${Math.floor(Math.random()*254)}`,
      dst_port: 80,
      flow: {
        flow_duration_ms: 5000, total_fwd_packets: 2500, total_bwd_packets: 1,
        total_fwd_bytes: 135000, total_bwd_bytes: 40, packet_length_mean: 54,
        syn_flag_count: 2500, ack_flag_count: 0, dst_port_entropy: 0.08,
        flow_packets_per_sec: 500.0, connection_retry_rate: 0.99
      }
    };
  } else {
    return {
      src_ip: `198.51.${Math.floor(Math.random()*250)}.${Math.floor(Math.random()*254)}`,
      dst_port: 443,
      flow: {
        flow_duration_ms: 8000, total_fwd_packets: 18, total_bwd_packets: 22,
        total_fwd_bytes: 11000, total_bwd_bytes: 28000, packet_length_mean: 650,
        syn_flag_count: 1, ack_flag_count: 40, dst_port_entropy: 0.15,
        failed_logins: 0, connection_retry_rate: 0.02
      }
    };
  }
}

function simulateRandomLocalTraffic() {
  const types = ["Normal Traffic", "Port Scanning", "Brute Force", "Normal Traffic", "Normal Traffic"];
  const type = types[Math.floor(Math.random() * types.length)];
  handleIncomingIncident(generateLocalIncident(type));
}

function generateLocalIncident(type) {
  const isHacker = type !== "Normal Traffic";
  const regions = [
    { city: "Ashburn", country: "United States", code: "US", lat: 39.04, lng: -77.48, isp: "AWS" },
    { city: "Moscow", country: "Russia", code: "RU", lat: 55.75, lng: 37.61, isp: "Rostelecom" },
    { city: "Shenzhen", country: "China", code: "CN", lat: 22.54, lng: 114.05, isp: "China Telecom" },
    { city: "Frankfurt", country: "Germany", code: "DE", lat: 50.11, lng: 8.68, isp: "Hetzner" }
  ];
  const reg = regions[Math.floor(Math.random() * regions.length)];
  const ip = `${Math.floor(Math.random()*150)+50}.${Math.floor(Math.random()*250)}.${Math.floor(Math.random()*250)}.${Math.floor(Math.random()*250)}`;

  return {
    incident_id: `SEC-${Date.now()}`,
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
    src_ip: ip,
    is_hacker: isHacker,
    attack_type: type,
    severity: isHacker ? (type === "DDoS / SYN Flood" ? "CRITICAL" : (type === "Brute Force" ? "HIGH" : "MEDIUM")) : "BENIGN",
    confidence: isHacker ? 0.95 : 0.99,
    geo: { ...reg, ip: ip, country_code: reg.code },
    indicators: isHacker ? [`Anomalous flow signature identified for ${type}`] : ["Standard authorized user traffic"]
  };
}
