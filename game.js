// Game variables
let scene, camera, renderer, controls;
let spaceship, rings = [];
let score = 0;
let gameStarted = false;
let gameOver = false;
let clock = new THREE.Clock();
let stars = [];
let lastPosition = new THREE.Vector3();
let velocity = new THREE.Vector3();
let lastTime = 0;

// Movement variables
const movement = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    strafeLeft: false,
    strafeRight: false,
    speed: 0.2,
    rotationSpeed: 0.03,
    strafeSpeed: 0.1
};

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000033); // Dark blue space
    
    // Add stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.1
    });
    
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 5, -10);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create a distant planet
    const planetGeometry = new THREE.SphereGeometry(200, 32, 32);
    const planetMaterial = new THREE.MeshPhongMaterial({
        color: 0x3498db,
        flatShading: true
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.set(0, -300, -500);
    scene.add(planet);

    // Create spaceship
    createSpaceship();

    // Add event listeners
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', restartGame);
    window.addEventListener('resize', onWindowResize);

    // Start the game loop
    animate();
}

function createSpaceship() {
    // Main fuselage
    const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.4, 5, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x666666,
        shininess: 30
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = -Math.PI / 2;
    body.position.x = -0.5;

    // Cockpit
    const cockpitGeometry = new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.7,
        shininess: 100
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0.8, 0.2, 0);
    body.add(cockpit);

    // Wings (4 wings in an X shape)
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const wingGeometry = new THREE.BoxGeometry(0.1, 0.5, 3);
    
    // Upper right wing
    const wingUR = new THREE.Mesh(wingGeometry, wingMaterial);
    wingUR.position.set(0, 0.1, 0);
    wingUR.rotation.z = -Math.PI / 4;
    body.add(wingUR);
    
    // Lower right wing
    const wingLR = new THREE.Mesh(wingGeometry, wingMaterial);
    wingLR.position.set(0, -0.1, 0);
    wingLR.rotation.z = -Math.PI / 4 + 0.2;
    body.add(wingLR);
    
    // Upper left wing
    const wingUL = new THREE.Mesh(wingGeometry, wingMaterial);
    wingUL.position.set(0, 0.1, 0);
    wingUL.rotation.z = Math.PI / 4;
    body.add(wingUL);
    
    // Lower left wing
    const wingLL = new THREE.Mesh(wingGeometry, wingMaterial);
    wingLL.position.set(0, -0.1, 0);
    wingLL.rotation.z = Math.PI / 4 - 0.2;
    body.add(wingLL);

    // Wing cannons
    const cannonGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
    const cannonMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    
    // Add cannons to each wing
    [wingUR, wingLR, wingUL, wingLL].forEach((wing, i) => {
        const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
        cannon.rotation.z = Math.PI / 2;
        cannon.position.z = -1.5;
        wing.add(cannon);
    });

    // Engine nozzles
    const engineGeometry = new THREE.CylinderGeometry(0.15, 0.25, 0.5, 8);
    const engineMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    
    const engine1 = new THREE.Mesh(engineGeometry, engineMaterial);
    engine1.position.set(-2.5, 0.2, 0);
    engine1.rotation.z = -Math.PI / 2;
    body.add(engine1);
    
    const engine2 = new THREE.Mesh(engineGeometry, engineMaterial);
    engine2.position.set(-2.5, -0.2, 0);
    engine2.rotation.z = -Math.PI / 2;
    body.add(engine2);

    // Engine glow
    const glowGeometry = new THREE.CylinderGeometry(0.1, 0.2, 0.8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00a8ff,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const glow1 = new THREE.Mesh(glowGeometry, glowMaterial);
    glow1.position.set(-2.7, 0.2, 0);
    glow1.rotation.z = -Math.PI / 2;
    body.add(glow1);
    
    const glow2 = new THREE.Mesh(glowGeometry, glowMaterial);
    glow2.position.set(-2.7, -0.2, 0);
    glow2.rotation.z = -Math.PI / 2;
    body.add(glow2);
    
    // Astromech droid head (R2 unit)
    const droidGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const droidMaterial = new THREE.MeshPhongMaterial({ color: 0x3366cc });
    const droid = new THREE.Mesh(droidGeometry, droidMaterial);
    droid.position.set(1.2, 0, 0);
    body.add(droid);

    // Create the spaceship group
    spaceship = new THREE.Group();
    spaceship.add(body);
    spaceship.position.y = 10;
    spaceship.rotation.y = Math.PI; // Face forward
    scene.add(spaceship);
    
    // Store references to engine glows for animation
    spaceship.userData.engineGlows = [glow1, glow2];
    spaceship.userData.enginePulse = 0;
    
    // Position camera behind the spaceship
    camera.lookAt(spaceship.position);
    
    // Add a point light for engine glow
    const engineLight = new THREE.PointLight(0x00a8ff, 1, 10);
    engineLight.position.set(-2.7, 0, 0);
    spaceship.add(engineLight);
    spaceship.userData.engineLight = engineLight;
}

function createRing() {
    const ringGeometry = new THREE.TorusGeometry(5, 0.5, 8, 32);
    const ringMaterial = new THREE.MeshPhongMaterial({ 
        color: Math.random() * 0xffffff,
        emissive: 0x444444,
        shininess: 100
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    
    // Position the ring randomly in the air
    ring.position.set(
        Math.random() * 400 - 200,
        Math.random() * 100 + 50,
        Math.random() * 400 - 200
    );
    
    // Rotate ring to be vertical
    ring.rotation.x = Math.PI / 2;
    
    // Add a collision box to the ring
    ring.userData = { isRing: true };
    
    scene.add(ring);
    rings.push(ring);
    
    return ring;
}

function checkCollisions() {
    if (!gameStarted || gameOver) return;
    
    // Check ring collisions
    const shipBox = new THREE.Box3().setFromObject(spaceship);
    for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        const ringBox = new THREE.Box3().setFromObject(ring);
        
        if (shipBox.intersectsBox(ringBox)) {
            scene.remove(ring);
            rings.splice(i, 1);
            score += 10;
            document.getElementById('score').textContent = `Score: ${score}`;
            createRing();
        }
    }

    // Check out of bounds
    if (spaceship.position.y < -100 || spaceship.position.y > 1000 ||
        Math.abs(spaceship.position.x) > 1000 || Math.abs(spaceship.position.z) > 1000) {
        endGame();
    }
}

function updatePlane() {
    const delta = clock.getDelta();
    const speed = movement.speed * 50 * delta;
    
    // Forward/backward movement
    if (movement.forward) {
        spaceship.translateZ(-speed);
    }
    if (movement.backward) {
        spaceship.translateZ(speed * 0.5);
    }
    
    // Left/right rotation (yaw)
    if (movement.left) {
        spaceship.rotation.y += movement.rotationSpeed;
    }
    if (movement.right) {
        spaceship.rotation.y -= movement.rotationSpeed;
    }
    
    // Strafing (Q/E)
    if (movement.strafeLeft) {
        spaceship.translateX(-movement.strafeSpeed);
    }
    if (movement.strafeRight) {
        spaceship.translateX(movement.strafeSpeed);
    }
    
    // Up/down movement
    if (movement.up) {
        spaceship.position.y += speed * 0.5;
    }
    if (movement.down) {
        spaceship.position.y -= speed * 0.5;
    }
    
    // Small amount of auto-leveling
    spaceship.rotation.x *= 0.98;
    spaceship.rotation.z *= 0.98;
    
    // Update camera position to follow spaceship
    const offset = new THREE.Vector3(-10, 5, 0);
    offset.applyQuaternion(spaceship.quaternion);
    camera.position.copy(spaceship.position).add(offset);
    camera.lookAt(spaceship.position);
    
    // Add engine effect when moving forward
    if (movement.forward) {
        const engineGlow = spaceship.children[0].children[3];
        engineGlow.material.opacity = 0.9;
        engineGlow.material.color.set(0xff4500); // Brighter orange/red
    } else {
        const engineGlow = spaceship.children[0].children[3];
        engineGlow.material.opacity = 0.5;
        engineGlow.material.color.set(0xff7f00); // Dimmer orange
    }
}

function onKeyDown(event) {
    if (!gameStarted) return;
    
    switch (event.key.toLowerCase()) {
        case 'w':
            movement.forward = true;
            break;
        case 's':
            movement.backward = true;
            break;
        case 'a':
            movement.left = true;
            break;
        case 'd':
            movement.right = true;
            break;
        case ' ':
            movement.up = true;
            break;
        case 'shift':
            movement.down = true;
            break;
        case 'q':
            movement.strafeLeft = true;
            break;
        case 'e':
            movement.strafeRight = true;
            break;
    }
}

function onKeyUp(event) {
    switch (event.key.toLowerCase()) {
        case 'w':
            movement.forward = false;
            break;
        case 's':
            movement.backward = false;
            break;
        case 'a':
            movement.left = false;
            break;
        case 'd':
            movement.right = false;
            break;
        case ' ':
            movement.up = false;
            break;
        case 'shift':
            movement.down = false;
            break;
        case 'q':
            movement.strafeLeft = false;
            break;
        case 'e':
            movement.strafeRight = false;
            break;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('score').style.display = 'block';
    gameStarted = true;
    score = 0;
    document.getElementById('score').textContent = `Score: ${score}`;
    
    // Create initial rings
    for (let i = 0; i < 10; i++) {
        createRing();
    }
    
    // No mouse controls enabled
}



function endGame() {
    gameOver = true;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';

}

function restartGame() {
    // Reset spaceship position and rotation
    if (spaceship) {
        spaceship.position.set(0, 10, 0);
        spaceship.rotation.set(0, 0, 0);
    }
    
    // Remove all rings
    rings.forEach(ring => scene.remove(ring));
    rings = [];
    
    // Reset game state
    gameOver = false;
    document.getElementById('gameOver').style.display = 'none';
    
    // Reset score
    score = 0;
    document.getElementById('score').textContent = `Score: ${score}`;
    
    // Start a new game
    gameStarted = true;
    
    // Create initial rings
    for (let i = 0; i < 10; i++) {
        createRing();
    }
}

function updatePositionDisplay() {
    if (!spaceship) return;
    
    const pos = spaceship.position;
    document.getElementById('posX').textContent = pos.x.toFixed(2);
    document.getElementById('posY').textContent = pos.y.toFixed(2);
    document.getElementById('posZ').textContent = pos.z.toFixed(2);
    
    // Calculate speed (magnitude of velocity vector)
    const speed = velocity.length();
    document.getElementById('speed').textContent = speed.toFixed(2);
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = performance.now();
    const deltaTime = (time - lastTime) / 1000; // Convert to seconds
    lastTime = time;
    
    // Store position before update for velocity calculation
    if (spaceship) {
        lastPosition.copy(spaceship.position);
    }
    
    updatePlane();
    checkCollisions();
    
    // Calculate velocity based on position change
    if (spaceship && deltaTime > 0) {
        velocity.subVectors(spaceship.position, lastPosition).divideScalar(deltaTime);
        
        // Update engine glow based on movement
        if (spaceship.userData.engineGlows) {
            const pulseSpeed = 0.1;
            spaceship.userData.enginePulse = (spaceship.userData.enginePulse + pulseSpeed) % (Math.PI * 2);
            
            // Pulsing effect for engine glow
            const pulseIntensity = 0.5 + Math.sin(spaceship.userData.enginePulse) * 0.5;
            const glowIntensity = 0.6 + pulseIntensity * 0.4; // 60-100% intensity
            
            spaceship.userData.engineGlows.forEach(glow => {
                glow.material.opacity = 0.5 * glowIntensity;
                glow.scale.y = 0.8 + pulseIntensity * 0.4; // Subtle scaling
            });
            
            // Update engine light
            if (spaceship.userData.engineLight) {
                spaceship.userData.engineLight.intensity = 1 + pulseIntensity * 2;
            }
            
            // Make glow more intense when accelerating
            if (movement.forward) {
                const boostFactor = 1.5;
                spaceship.userData.engineGlows.forEach(glow => {
                    glow.material.opacity *= boostFactor;
                    glow.material.color.setRGB(0, 0.8, 1); // Brighter blue when boosting
                });
                if (spaceship.userData.engineLight) {
                    spaceship.userData.engineLight.intensity *= 1.5;
                }
            } else {
                spaceship.userData.engineGlows.forEach(glow => {
                    glow.material.color.setRGB(0, 0.5, 1); // Normal blue
                });
            }
        }
    }
    
    // Update position display
    updatePositionDisplay();
    
    // Rotate rings for visual effect
    rings.forEach(ring => {
        ring.rotation.z += 0.02;
    });
    
    renderer.render(scene, camera);
}

// Start the game
init();
