// Game variables
let scene, camera, renderer, controls;
let plane, rings = [];
let score = 0;
let gameStarted = false;
let gameOver = false;
let clock = new THREE.Clock();

// Movement variables
const movement = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    speed: 0.2,
    rotationSpeed: 0.03
};

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    scene.fog = new THREE.Fog(0x87CEEB, 50, 1000);

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

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3a5f0b,
        side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create plane
    createPlane();

    // Add event listeners
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', restartGame);
    window.addEventListener('resize', onWindowResize);

    // Start the game loop
    animate();
}

function createPlane() {
    // Simple plane model
    const bodyGeometry = new THREE.BoxGeometry(3, 0.5, 5);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x156289 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;

    const wingGeometry = new THREE.BoxGeometry(6, 0.2, 2);
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x1e90ff });
    const wing = new THREE.Mesh(wingGeometry, wingMaterial);
    wing.position.y = 0.1;
    wing.castShadow = true;
    wing.receiveShadow = true;

    const tailGeometry = new THREE.BoxGeometry(1.5, 0.8, 1);
    const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x1e90ff });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 0.25, -1.5);
    tail.castShadow = true;
    tail.receiveShadow = true;

    plane = new THREE.Group();
    plane.add(body);
    plane.add(wing);
    plane.add(tail);
    plane.position.y = 10;
    scene.add(plane);

    // Add camera to the plane
    camera.lookAt(plane.position);
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
    
    // Simple distance-based collision detection with rings
    for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        const distance = plane.position.distanceTo(ring.position);
        
        if (distance < 6) { // Collision detected
            scene.remove(ring);
            rings.splice(i, 1);
            score += 10;
            document.getElementById('score').textContent = `Score: ${score}`;
            
            // Create a new ring
            createRing();
        }
    }
    
    // Check for ground collision
    if (plane.position.y < 1) {
        endGame();
    }
}

function updatePlane() {
    if (!gameStarted || gameOver) return;
    
    const delta = clock.getDelta();
    
    // Move plane based on input
    if (movement.forward) {
        plane.translateZ(-movement.speed * 2);
    }
    if (movement.backward) {
        plane.translateZ(movement.speed);
    }
    if (movement.left) {
        plane.rotation.z = Math.min(plane.rotation.z + movement.rotationSpeed, 0.3);
        plane.rotation.y += movement.rotationSpeed * 0.5;
    } else if (movement.right) {
        plane.rotation.z = Math.max(plane.rotation.z - movement.rotationSpeed, -0.3);
        plane.rotation.y -= movement.rotationSpeed * 0.5;
    } else {
        // Auto-level the plane
        plane.rotation.z *= 0.95;
    }
    
    if (movement.up) {
        plane.position.y += movement.speed * 2;
    }
    if (movement.down) {
        plane.position.y -= movement.speed * 2;
    }
    
    // Gravity
    plane.position.y -= 0.05;
    
    // Keep plane within bounds
    plane.position.x = THREE.MathUtils.clamp(plane.position.x, -500, 500);
    plane.position.y = Math.max(plane.position.y, 1);
    plane.position.z = THREE.MathUtils.clamp(plane.position.z, -500, 500);
    
    // Update camera position behind the plane
    const cameraOffset = new THREE.Vector3(0, 2, 10);
    cameraOffset.applyQuaternion(plane.quaternion);
    camera.position.copy(plane.position).add(cameraOffset);
    camera.lookAt(plane.position);
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
    // Reset plane position
    plane.position.set(0, 10, 0);
    plane.rotation.set(0, 0, 0);
    
    // Remove all rings
    rings.forEach(ring => scene.remove(ring));
    rings = [];
    
    // Reset game state
    gameOver = false;
    document.getElementById('gameOver').style.display = 'none';
    
    // Start a new game
    startGame();
}

function animate() {
    requestAnimationFrame(animate);
    
    updatePlane();
    checkCollisions();
    
    // Rotate rings for visual effect
    rings.forEach(ring => {
        ring.rotation.z += 0.02;
    });
    
    renderer.render(scene, camera);
}

// Start the game
init();
