// Spaceship creation module for X-wing fighter
function createSpaceship(scene) {
    // Main fuselage
    const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.5, 6, 12);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        shininess: 30
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = -Math.PI / 2;
    body.rotation.y = Math.PI / 2;
    body.position.set(0,0,0);

    // Nose cone
    const noseGeometry = new THREE.ConeGeometry(0.25, 1.5, 12);
    const noseMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaFF });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 3, 0);
    body.add(nose);

    // Cockpit - more angular and prominent
    const cockpitGeometry = new THREE.SphereGeometry(0.38, 16, 1, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpitMaterial = new THREE.MeshPhongMaterial({
        color: 0x2c3e50,
        transparent: true,
        opacity: 0.9,
        shininess: 100
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(-0.3, -2, 0);
    cockpit.rotation.x = Math.PI;
    cockpit.rotation.z = Math.PI / 2;

    body.add(cockpit);

    // X-Wing configuration - 4 wings in X formation
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0xdddddd });
    const wingGeometry = new THREE.BoxGeometry(0.2, 0.4, 4);

    // Wing positions for X formation
    const wingPositions = [
        { pos: [-0.75, -3, 2], rot: [0, Math.PI*0.9, Math.PI] },     // Top right
        { pos: [0.75, -3, 2], rot: [0, Math.PI * 1.1, -Math.PI] },   // Bottom right
        { pos: [-0.75, -3, -2], rot: [0, Math.PI * 0.1, -Math.PI ] },   // Top left
        { pos: [0.75, -3, -2], rot: [0, -Math.PI * 0.1, Math.PI] }    // Bottom left
    ];

    const wings = [];
    wingPositions.forEach((wingData, index) => {
        const wing = new THREE.Mesh(wingGeometry, wingMaterial);
        wing.position.set(...wingData.pos);
        wing.rotation.set(...wingData.rot);
        
        // Add wing details - red stripes
        const stripeGeometry = new THREE.BoxGeometry(0.21, 0.1, 3.5);
        const stripeMaterial = new THREE.MeshPhongMaterial({ color: 0xff4444 });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.set(0, 0, 0);
        wing.add(stripe);

        body.add(wing);
        wings.push(wing);
    });

    // Laser cannons on wing tips
    const cannonGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1, 8);
    const cannonMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });

    wings.forEach((wing, i) => {
        // Add cannon to wing tip
        const cannon1 = new THREE.Mesh(cannonGeometry, cannonMaterial);
        cannon1.rotation.z = Math.PI;
        cannon1.position.set(0, -0.3, -2.005);
        wing.add(cannon1);

        const cannon2 = new THREE.Mesh(cannonGeometry, cannonMaterial);
        cannon2.rotation.z = Math.PI;
        cannon2.position.set(0, -0.5, 2.8);
        wing.add(cannon2);
    });

    // Engine nacelles - 4 engines at wing tips
    const engineGeometry = new THREE.CylinderGeometry(0.2, 0.15, 1.5, 8);
    const engineMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });

    const engines = [];
    wings.forEach((wing, i) => {
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.rotation.z = Math.PI * 2;
        engine.position.set(0, 0.5, 1.75);
        wing.add(engine);
        engines.push(engine);
    });

    // Engine glow effects
    const glowGeometry = new THREE.CylinderGeometry(0.15, 0.1, 0.8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });

    const engineGlows = [];
    engines.forEach((engine, i) => {
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(0, 0.5, 0);
        glow.rotation.z = Math.PI;
        engine.add(glow);
        engineGlows.push(glow);
    });

    // Astromech droid (R2 unit) behind cockpit
    // const droidGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.8, 16);
    // const droidMaterial = new THREE.MeshPhongMaterial({ color: 0x4169e1 });
    // const droid = new THREE.Mesh(droidGeometry, droidMaterial);
    // droid.position.set(0.5, 0, 0);
    // body.add(droid);

    // // R2 unit dome
    // const domeGeometry = new THREE.SphereGeometry(0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    // const domeMaterial = new THREE.MeshPhongMaterial({ color: 0x87ceeb });
    // const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    // dome.position.set(0, 0.4, 0);
    // droid.add(dome);

    // Create the spaceship group
    const spaceship = new THREE.Group();
    spaceship.add(body);
    spaceship.position.y = 100; // Start halfway up the Y axis
    spaceship.rotation.y = Math.PI; // Face forward
    scene.add(spaceship);

    // Store references to engine glows for animation
    spaceship.userData.engineGlows = engineGlows;
    spaceship.userData.enginePulse = 0;
    spaceship.userData.wings = wings;

    // Add point lights for engine glow
    const engineLights = [];
    engines.forEach((engine, i) => {
        const engineLight = new THREE.PointLight(0x00aaff, 1, 8);
        engineLight.position.set(-1, 0, 0);
        engine.add(engineLight);
        engineLights.push(engineLight);
    });
    spaceship.userData.engineLights = engineLights;

    return spaceship;
}
