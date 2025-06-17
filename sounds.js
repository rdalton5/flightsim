// Sound effects module for the space flight simulator

// Audio context for sound effects
let audioContext;

function initAudio() {
    // Audio context will be created when first sound is played
    // This avoids issues with browser autoplay policies
}

function playLaserSound() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Create oscillator for the "pew" sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure the laser sound
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(4000, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
    
    // Volume envelope for sharp attack and quick decay
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    // Play the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playExplosionSound() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Create explosion sound using white noise
    const bufferSize = audioContext.sampleRate * 0.5; // 0.5 second duration
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = buffer;
    
    // Filter for boom effect
    const lowPassFilter = audioContext.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.setValueAtTime(300, audioContext.currentTime);
    lowPassFilter.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 1);
    
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(1.0, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    // Connect nodes
    whiteNoise.connect(lowPassFilter);
    lowPassFilter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Play the sound
    whiteNoise.start(audioContext.currentTime);
    whiteNoise.stop(audioContext.currentTime + 0.5);
}
