/**
 * SENTINEL - 3D AR Cyber Threat Globe & 8D Quantum Matrix Engine
 * Core Engine: Three.js (r128)
 */

(function () {
  'use strict';

  // Global Engine State
  const SentinelGlobe = {
    scene: null,
    camera: null,
    renderer: null,
    globeGroup: null,
    particlesMesh: null,
    attackArcsGroup: null,
    atmosphereMesh: null,
    quantumMatrixMesh: null,
    attackArcData: [],
    isMouseDown: false,
    mouseX: 0,
    mouseY: 0,
    targetRotationX: 0,
    targetRotationY: 0,
    isArActive: false,
    projectionMode: '3d', // '3d', '2d', '8d'
    nodes: []
  };

  /**
   * Target Threat Locations & Satellite Coordinates Mapping
   */
  const THREAT_NODES = [
    { id: 1, name: 'Frankfurt, Germany', lat: 50.1109, lng: 8.6821, ip: '185.220.101.4', vector: 'Ransomware Payload Injection', risk: 'CRITICAL' },
    { id: 2, name: 'New York, USA', lat: 40.7128, lng: -74.0060, ip: '192.168.104.12', vector: 'DDoS Syn-Flood Attack', risk: 'HIGH' },
    { id: 3, name: 'Beijing, China', lat: 39.9042, lng: 116.4074, ip: '114.247.50.2', vector: 'APT Zero-Day Exploit', risk: 'CRITICAL' },
    { id: 4, name: 'São Paulo, Brazil', lat: -23.5505, lng: -46.6333, ip: '177.12.89.45', vector: 'SQLi Form Manipulation', risk: 'MEDIUM' },
    { id: 5, name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, ip: '202.214.194.1', vector: 'SSH Brute-Force Probe', risk: 'HIGH' },
    { id: 6, name: 'London, UK', lat: 51.5074, lng: -0.1278, ip: '195.154.122.3', vector: 'XSS Vector Injection', risk: 'MEDIUM' }
  ];

  /**
   * Initialize 3D Scene, Camera, WebGL Renderer, and Layers
   */
  function initEngine() {
    const container = document.getElementById('globeCanvasContainer');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera Setup
    SentinelGlobe.scene = new THREE.Scene();
    SentinelGlobe.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    SentinelGlobe.camera.position.z = 210;

    // 2. WebGL Renderer
    SentinelGlobe.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    SentinelGlobe.renderer.setSize(width, height);
    SentinelGlobe.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(SentinelGlobe.renderer.domElement);

    // 3. Main Globe Group Container
    SentinelGlobe.globeGroup = new THREE.Group();
    SentinelGlobe.scene.add(SentinelGlobe.globeGroup);

    // 4. Build Layers
    createWireframeGlobe();
    createLandmassParticleMatrix();
    createAtmosphereGlow();
    createQuantumMatrixGrid();
    generateAttackArcsAndNodes();

    // 5. Setup Interaction Listeners
    setupEventListeners(container);

    // 6. Start Render Loop
    animate();
  }

  /**
   * Layer 1: Core Glowing Wireframe Sphere
   */
  function createWireframeGlobe() {
    const sphereGeo = new THREE.SphereGeometry(60, 36, 36);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireframeGlobe = new THREE.Mesh(sphereGeo, sphereMat);
    SentinelGlobe.globeGroup.add(wireframeGlobe);

    // Solid Inner Core to Block Back Arc Lines
    const innerGeo = new THREE.SphereGeometry(59.2, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x080414 });
    const innerGlobe = new THREE.Mesh(innerGeo, innerMat);
    SentinelGlobe.globeGroup.add(innerGlobe);
  }

  /**
   * Layer 2: Continental Fibonacci Particle Distribution
   */
  function createLandmassParticleMatrix() {
    const particleCount = 1800;
    const pGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPurple = new THREE.Color(0xc084fc);
    const colorCyan = new THREE.Color(0x06b6d4);

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      const radius = 60.5;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const mixedColor = i % 3 === 0 ? colorCyan : colorPurple;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    pGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMaterial = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    SentinelGlobe.particlesMesh = new THREE.Points(pGeometry, pMaterial);
    SentinelGlobe.globeGroup.add(SentinelGlobe.particlesMesh);
  }

  /**
   * Layer 3: Cyan Atmosphere Outer Shell
   */
  function createAtmosphereGlow() {
    const atmoGeo = new THREE.SphereGeometry(66, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.15
    });
    SentinelGlobe.atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat);
    SentinelGlobe.scene.add(SentinelGlobe.atmosphereMesh);
  }

  /**
   * Layer 4: 8D Quantum Matrix Icosahedron Outer Cage
   */
  function createQuantumMatrixGrid() {
    const gridGeo = new THREE.IcosahedronGeometry(90, 2);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0xec4899,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });
    SentinelGlobe.quantumMatrixMesh = new THREE.Mesh(gridGeo, gridMat);
    SentinelGlobe.scene.add(SentinelGlobe.quantumMatrixMesh);
  }

  /**
   * Lat/Lng Geographic Coordinates to 3D Sphere Vector Conversion
   */
  function latLngToVector3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  /**
   * Layer 5: Dynamic Ballistic Bezier Trajectories & Interactive Threat Pins
   */
  function generateAttackArcsAndNodes() {
    SentinelGlobe.attackArcsGroup = new THREE.Group();
    SentinelGlobe.globeGroup.add(SentinelGlobe.attackArcsGroup);

    for (let i = 0; i < THREAT_NODES.length; i++) {
      const startLoc = THREAT_NODES[i];
      const endLoc = THREAT_NODES[(i + 1) % THREAT_NODES.length];

      const startVec = latLngToVector3(startLoc.lat, startLoc.lng, 60.5);
      const endVec = latLngToVector3(endLoc.lat, endLoc.lng, 60.5);

      // Midpoint arc extension
      const midVec = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
      const distance = startVec.distanceTo(endVec);
      midVec.setLength(60.5 + distance * 0.35);

      const curve = new THREE.QuadraticBezierCurve3(startVec, midVec, endVec);
      const points = curve.getPoints(50);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

      const curveMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0x06b6d4 : 0xec4899,
        transparent: true,
        opacity: 0.75
      });

      const arcLine = new THREE.Line(curveGeo, curveMat);
      SentinelGlobe.attackArcsGroup.add(arcLine);

      // Energy Pulse Sphere Moving Along Trajectory
      const pulseGeo = new THREE.SphereGeometry(1.5, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      SentinelGlobe.attackArcsGroup.add(pulseMesh);

      // Node Pin Mesh at Origin
      const nodeGeo = new THREE.SphereGeometry(2.2, 12, 12);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(startVec);
      nodeMesh.userData = startLoc; // Attach threat payload data
      SentinelGlobe.attackArcsGroup.add(nodeMesh);
      SentinelGlobe.nodes.push(nodeMesh);

      SentinelGlobe.attackArcData.push({
        curve,
        pulseMesh,
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.008
      });
    }
  }

  /**
   * Continuous WebGL Animation Loop
   */
  function animate() {
    requestAnimationFrame(animate);

    // Auto-rotation when not dragging
    if (!SentinelGlobe.isMouseDown) {
      SentinelGlobe.targetRotationY += 0.0025;
    }

    // Smooth inertia interpolation
    SentinelGlobe.globeGroup.rotation.y += (SentinelGlobe.targetRotationY - SentinelGlobe.globeGroup.rotation.y) * 0.08;
    SentinelGlobe.globeGroup.rotation.x += (SentinelGlobe.targetRotationX - SentinelGlobe.globeGroup.rotation.x) * 0.08;

    // 8D Quantum Matrix Outer Rotation
    if (SentinelGlobe.quantumMatrixMesh) {
      SentinelGlobe.quantumMatrixMesh.rotation.y -= 0.001;
      SentinelGlobe.quantumMatrixMesh.rotation.z += 0.001;
    }

    // Advance trajectory pulses
    SentinelGlobe.attackArcData.forEach(arc => {
      arc.progress += arc.speed;
      if (arc.progress > 1) arc.progress = 0;
      const pt = arc.curve.getPoint(arc.progress);
      arc.pulseMesh.position.copy(pt);
    });

    SentinelGlobe.renderer.render(SentinelGlobe.scene, SentinelGlobe.camera);
  }

  /**
   * Mouse Drag & Raycaster Click Events
   */
  function setupEventListeners(container) {
    container.addEventListener('mousedown', (e) => {
      SentinelGlobe.isMouseDown = true;
      SentinelGlobe.mouseX = e.clientX;
      SentinelGlobe.mouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      SentinelGlobe.isMouseDown = false;
    });

    container.addEventListener('mousemove', (e) => {
      if (!SentinelGlobe.isMouseDown) return;
      const deltaX = e.clientX - SentinelGlobe.mouseX;
      const deltaY = e.clientY - SentinelGlobe.mouseY;

      SentinelGlobe.targetRotationY += deltaX * 0.008;
      SentinelGlobe.targetRotationX += deltaY * 0.008;

      SentinelGlobe.mouseX = e.clientX;
      SentinelGlobe.mouseY = e.clientY;
    });

    // Raycast Click Event to Sync with Google Satellite Map
    container.addEventListener('click', (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      const y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), SentinelGlobe.camera);

      const intersects = raycaster.intersectObjects(SentinelGlobe.nodes);
      if (intersects.length > 0) {
        const hitData = intersects[0].object.userData;
        syncGoogleSatelliteMap(hitData);
      }
    });

    // Window Resize Handling
    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      SentinelGlobe.camera.aspect = w / h;
      SentinelGlobe.camera.updateProjectionMatrix();
      SentinelGlobe.renderer.setSize(w, h);
    });
  }

  /**
   * Sync Node Telemetry to Google Satellite Frame
   */
  function syncGoogleSatelliteMap(data) {
    const frame = document.getElementById('googleSatMapFrame');
    const cityText = document.getElementById('mapCityText');
    const ipText = document.getElementById('mapIpText');
    const vectorText = document.getElementById('mapVectorText');

    if (frame) {
      frame.src = `https://maps.google.com/maps?q=${data.lat},${data.lng}&t=k&z=13&ie=UTF8&iwloc=&output=embed`;
    }
    if (cityText) cityText.innerText = data.name;
    if (ipText) ipText.innerText = data.ip;
    if (vectorText) vectorText.innerText = data.vector;
  }

  /**
   * Toggle AR HUD Scanning Overlay
   */
  window.toggleArMode = function () {
    SentinelGlobe.isArActive = !SentinelGlobe.isArActive;
    const hud = document.getElementById('arHudOverlay');
    const btn = document.getElementById('arToggleBtn');

    if (SentinelGlobe.isArActive) {
      if (hud) hud.classList.remove('hidden');
      if (btn) btn.innerText = 'AR Overlay: ON';
    } else {
      if (hud) hud.classList.add('hidden');
      if (btn) btn.innerText = 'AR Overlay: OFF';
    }
  };

  // Auto-init on page load
  window.addEventListener('load', initEngine);

})();
