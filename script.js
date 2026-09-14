// Flash Screen Timeout
window.addEventListener('load', () => {
  setTimeout(() => {
    const flashScreen = document.getElementById('flash-screen');
    const dashboard = document.getElementById('dashboard');
    
    flashScreen.style.opacity = '0';
    setTimeout(() => {
      flashScreen.style.display = 'none';
      dashboard.classList.remove('hidden');
      initThreeJS();
    }, 1000);
  }, 2000);
});

// Helper for Copy-Paste
async function pasteURL() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('url-input').value = text;
  } catch (err) {
    alert('Clipboard access denied or unsupported.');
  }
}

// Three.js 3D Globe Implementation
function initThreeJS() {
  const container = document.getElementById('globe-container');

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
  );
  camera.position.z = 250;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Orbit Controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Globe Setup (Sphere with Wireframe overlay for Enterprise/Tech look)
  const globeGeometry = new THREE.SphereGeometry(60, 64, 64);
  
  // Solid Base Material
  const globeMaterial = new THREE.MeshPhongMaterial({
    color: 0x0a192f,
    emissive: 0x020c1b,
    shininess: 10
  });
  const globe = new THREE.Mesh(globeGeometry, globeMaterial);
  scene.add(globe);

  // Outer Tech Grid Wireframe
  const gridGeometry = new THREE.SphereGeometry(60.5, 32, 32);
  const gridMaterial = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.15
  });
  const wireframeGlobe = new THREE.Mesh(gridGeometry, gridMaterial);
  scene.add(wireframeGlobe);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0x00f0ff, 1.5);
  pointLight.position.set(200, 100, 150);
  scene.add(pointLight);

  // Window Resize Listener
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Slow Rotation
    globe.rotation.y += 0.0015;
    wireframeGlobe.rotation.y += 0.0015;

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}
