// main.js
// Entry point for "Whispers in Dane County" — browser Three.js prototype

import { initPlayer, updatePlayer } from './player.js';
import { spawnGhost, updateGhost } from './ghost.js';
import { logMessage, logError, downloadLogs } from './logger.js';
import { loadLevel } from './levelLoader.js';

let scene, camera, renderer, clock;
let ghost, player;
let started = false;

// --- INITIAL SETUP ---
async function init() {
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js');
    window.THREE = THREE;

    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.08);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    // Lighting
    const ambient = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambient);

    const flashlight = new THREE.SpotLight(0xffffff, 2);
    flashlight.angle = Math.PI / 6;
    flashlight.distance = 25;
    flashlight.castShadow = true;
    camera.add(flashlight);
    flashlight.position.set(0, 0, 0);
    flashlight.target.position.set(0, 0, -1);
    scene.add(camera);

    player = initPlayer(camera);

    // load a simple building / ground
    await loadLevel(scene);

    // ghostly entity
    ghost = spawnGhost(scene);

    logMessage('Initialization complete.');
    animate();
  } catch (err) {
    logError('Init failed: ' + err.message);
  }
}

// --- GAME LOOP ---
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (started) {
    updatePlayer(delta, scene);
    updateGhost(delta, ghost, player, scene);
  }

  renderer.render(scene, camera);
}

// --- START GAME ---
function startGame() {
  document.getElementById('loadingScreen').style.display = 'none';
  started = true;
  logMessage('Game started.');
}

// --- RESIZE ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- LOG DOWNLOAD BUTTON ---
document.getElementById('downloadLog').addEventListener('click', downloadLogs);
document.getElementById('loadingScreen').addEventListener('click', startGame);

// Run init after page load
window.addEventListener('load', init);
