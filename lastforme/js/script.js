/**
 * js/script.js - Interactive Cinematic Storytelling Controller
 * Implements a highly immersive, multi-page cinematic audio experience
 * using a hybrid audio engine:
 *  - Real audio files (audio/piano.mp3) for melodic elements
 *  - Real-time synthesized ambient sounds & effects using Web Audio API
 *    (rain, wind, room tone, breathing, drone, tinnitus, whoosh, typing, chimes, camera click)
 *  - Fully controllable from individual chapters via window.audioController
 */

// Initialize all common visual and audio layers on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  initGrainCanvas();
  initTransitionOverlay();
  initRainEffect();
  initAudioController();
  setupPageTransitions();
  randomizePolaroids();
  setupMemoryPhotoSounds();
});

/* ============================================================
   1. FILM GRAIN CANVAS
   Generates a continuous micro-noise overlay for a film feel.
   ============================================================ */
function initGrainCanvas() {
  const canvas = document.getElementById('grain-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  let frame = 0;
  function loop() {
    frame++;
    if (frame % 2 === 0) {
      const w = canvas.width, h = canvas.height;
      if (w > 0 && h > 0) {
        const imgData = ctx.createImageData(w, h);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const val = Math.random() * 255 | 0;
          data[i] = val;
          data[i+1] = val;
          data[i+2] = val;
          data[i+3] = Math.random() * 15 | 0; // Soft alpha
        }
        ctx.putImageData(imgData, 0, 0);
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* ============================================================
   2. CINEMATIC PAGE TRANSITIONS
   Intercepts page clicks to fade out perfectly before navigating.
   ============================================================ */
function initTransitionOverlay() {
  const overlay = document.querySelector('.transition-overlay');
  if (overlay) {
    // Fade in current page
    setTimeout(() => {
      overlay.classList.add('fade-out');
    }, 100);
  }
}

function setupPageTransitions() {
  const transitionLinks = document.querySelectorAll('a:not([target="_blank"]):not([href^="#"])');
  const overlay = document.querySelector('.transition-overlay');

  transitionLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href) return;
      
      e.preventDefault();
      
      // Trigger cinematic transition sound effects
      if (audioUnlocked && localStorage.getItem('cinema_muted') !== 'true') {
        playSynthWhoosh();
        setTimeout(() => {
          playSynthCameraClick();
        }, 150);

        // Smoothly fade out current page's audio tracks
        fadePiano(0, 1000);
        fadeTrack('rain', 0, 1000);
        fadeTrack('static', 0, 1000);
        fadeTrack('breathing', 0, 1000);
        fadeTrack('heartbeat', 0, 1000);
        fadeTrack('drone', 0, 1000);
      }
      
      if (overlay) {
        overlay.classList.remove('fade-out');
        setTimeout(() => {
          window.location.href = href;
        }, 1200); // Perfect sync with CSS transition duration
      } else {
        window.location.href = href;
      }
    });
  });
}

/* ============================================================
   3. HYBRID AUDIO SYNTHESIS & CONTROL ENGINE
   All ambient layers and UI sound effects are synthesized dynamically
   using Web Audio API to guarantee fast deployment and performance.
   ============================================================ */
let audioCtx = null;
let pianoAudio = null;
let synthNodes = {};  // rain, heartbeat, static, breathing, drone, tinnitus gain nodes
let masterGain = null;
let audioUnlocked = false;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// --- Synthesized Rain (bandpass filtered white noise) ---
function startSynthRain(volume) {
  if (synthNodes.rain) { synthNodes.rain.gain.value = volume; return; }
  const ctx = getAudioCtx();
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  // Bandpass filter to shape rain texture
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 800;
  bp.Q.value = 0.4;

  // Highpass to remove low-end rumble
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 220;

  const gain = ctx.createGain();
  gain.gain.value = volume;

  noise.connect(bp);
  bp.connect(hp);
  hp.connect(gain);
  gain.connect(masterGain);
  noise.start();

  synthNodes.rain = gain;
  synthNodes._rainSrc = noise;
}

// --- Synthesized Heartbeat (oscillators with a double-pulse rhythm) ---
function startSynthHeartbeat(volume) {
  if (synthNodes.heartbeat) { synthNodes.heartbeat.gain.value = volume; return; }
  const ctx = getAudioCtx();

  const gain = ctx.createGain();
  gain.gain.value = volume;
  gain.connect(masterGain);

  // Double-pulse heartbeat rhythm: lub-dub ... lub-dub
  function pulse() {
    if (!synthNodes.heartbeat) return;
    const now = ctx.currentTime;
    const vol = synthNodes.heartbeat.gain.value;

    // "Lub" - deeper tone
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 50;
    const g1 = ctx.createGain();
    g1.gain.setValueAtTime(0, now);
    g1.gain.linearRampToValueAtTime(vol, now + 0.04);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(g1);
    g1.connect(gain);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // "Dub" - slightly higher pitch, 0.15s later
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 65;
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0, now + 0.15);
    g2.gain.linearRampToValueAtTime(vol * 0.7, now + 0.19);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc2.connect(g2);
    g2.connect(gain);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.45);
  }

  // Repeat every ~0.85s (resting heart rate feel)
  pulse();
  const intervalId = setInterval(pulse, 850);

  synthNodes.heartbeat = gain;
  synthNodes._heartbeatInterval = intervalId;
}

function stopSynthHeartbeat() {
  if (synthNodes.heartbeat) {
    if (synthNodes._heartbeatInterval) clearInterval(synthNodes._heartbeatInterval);
    synthNodes.heartbeat.disconnect();
    delete synthNodes.heartbeat;
  }
}

// --- Synthesized VHS Static (highpass filtered noise) ---
function startSynthStatic(volume) {
  if (synthNodes.static) { synthNodes.static.gain.value = volume; return; }
  const ctx = getAudioCtx();
  const bufferSize = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 3200;

  const gain = ctx.createGain();
  gain.gain.value = volume;

  noise.connect(hp);
  hp.connect(gain);
  gain.connect(masterGain);
  noise.start();

  synthNodes.static = gain;
  synthNodes._staticSrc = noise;
}

// --- Synthesized Breathing (sine LFO modulates bandpass filters and gain) ---
function startSynthBreathing(volume) {
  if (synthNodes.breathing) { synthNodes.breathing.gain.value = volume; return; }
  const ctx = getAudioCtx();
  
  const gain = ctx.createGain();
  gain.gain.value = volume;
  gain.connect(masterGain);
  
  // Breathe cycle LFO: Inhale/Exhale cycle every ~5.5s (0.18 Hz)
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 0.18;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 1.0;
  
  // Modulate filter frequency (oscillating between 250Hz and 500Hz)
  const filterGain = ctx.createGain();
  filterGain.gain.value = 125;
  filter.frequency.value = 375;
  
  const breathGain = ctx.createGain();
  breathGain.gain.value = 0.05;
  
  // Generate noise source
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  
  // Modulate breathing filter frequency and gain using LFO
  osc.connect(filterGain);
  filterGain.connect(filter.frequency);
  
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.04;
  osc.connect(lfoGain);
  lfoGain.connect(breathGain.gain);
  
  noise.connect(filter);
  filter.connect(breathGain);
  breathGain.connect(gain);
  
  noise.start();
  osc.start();
  
  synthNodes.breathing = gain;
  synthNodes._breathingNoise = noise;
  synthNodes._breathingLfo = osc;
}

function stopSynthBreathing() {
  if (synthNodes.breathing) {
    try {
      synthNodes._breathingNoise.stop();
      synthNodes._breathingLfo.stop();
    } catch(e){}
    synthNodes.breathing.disconnect();
    delete synthNodes.breathing;
  }
}

// --- Synthesized Overthinking Low Drone (detuned low oscillators) ---
function startSynthDrone(volume) {
  if (synthNodes.drone) { synthNodes.drone.gain.value = volume; return; }
  const ctx = getAudioCtx();
  
  const gain = ctx.createGain();
  gain.gain.value = volume;
  gain.connect(masterGain);
  
  const osc1 = ctx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.value = 55; // A1
  
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = 55.4; // Detuned beat frequency
  
  const osc3 = ctx.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.value = 110; // A2 octav up
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 85; // Deep muffled tone
  
  osc1.connect(filter);
  osc2.connect(filter);
  osc3.connect(filter);
  filter.connect(gain);
  
  osc1.start();
  osc2.start();
  osc3.start();
  
  synthNodes.drone = gain;
  synthNodes._droneOscs = [osc1, osc2, osc3];
}

function stopSynthDrone() {
  if (synthNodes.drone) {
    if (synthNodes._droneOscs) {
      synthNodes._droneOscs.forEach(o => {
        try { o.stop(); } catch(e){}
      });
    }
    synthNodes.drone.disconnect();
    delete synthNodes.drone;
  }
}

// --- Synthesized Tinnitus Ringing (high-frequency sine) ---
function startSynthTinnitus(volume) {
  if (synthNodes.tinnitus) { synthNodes.tinnitus.gain.value = volume; return; }
  const ctx = getAudioCtx();
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2.0); // Slow fade-in
  gain.connect(masterGain);
  
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 8500;
  
  osc.connect(gain);
  osc.start();
  
  synthNodes.tinnitus = gain;
  synthNodes._tinnitusOsc = osc;
}

function stopSynthTinnitus() {
  if (synthNodes.tinnitus) {
    const ctx = getAudioCtx();
    const g = synthNodes.tinnitus;
    const osc = synthNodes._tinnitusOsc;
    g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.0); // Fade out over 1s
    setTimeout(() => {
      try { osc.stop(); } catch(e){}
      g.disconnect();
    }, 1100);
    delete synthNodes.tinnitus;
  }
}

// --- Synthesized Distant Thunder Rumble ---
function triggerSynthThunder() {
  if (localStorage.getItem('cinema_muted') === 'true' || !audioUnlocked) return;
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  
  const bufferSize = ctx.sampleRate * 4.0; // 4 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(60, now);
  lp.frequency.linearRampToValueAtTime(25, now + 3.5);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.04, now + 1.0); // Fade in
  gain.gain.linearRampToValueAtTime(0.04, now + 2.0);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 4.0); // Fade out
  
  src.connect(lp);
  lp.connect(gain);
  gain.connect(masterGain);
  src.start(now);
}

// Trigger ambient thunder every 25s with slight random offset
setInterval(() => {
  if (Math.random() > 0.4) triggerSynthThunder();
}, 25000);

// --- Synthesized Dynamic One-Shots ---
function playSynthWhoosh() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  
  const bufferSize = ctx.sampleRate * 1.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 1.0;
  filter.frequency.setValueAtTime(150, now);
  filter.frequency.exponentialRampToValueAtTime(900, now + 0.6);
  filter.frequency.exponentialRampToValueAtTime(100, now + 1.4);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.5);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
  
  src.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  src.start(now);
}

function playSynthCameraClick() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  
  const bufferSize = ctx.sampleRate * 0.12;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2400;
  
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.15, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(masterGain);
  noise.start(now);
  
  // Shutter mechanical tone
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(550, now + 0.04);
  osc.frequency.linearRampToValueAtTime(180, now + 0.12);
  
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0, now);
  oscGain.gain.setValueAtTime(0.03, now + 0.04);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  
  osc.connect(oscGain);
  oscGain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.16);
}

function playSynthTyping() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  
  const bufferSize = ctx.sampleRate * 0.025;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1100 + Math.random() * 500;
  filter.Q.value = 2.5;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.035 + Math.random() * 0.03, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
  
  src.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  src.start(now);
}

function playSynthChatSent() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(700, now);
  osc.frequency.exponentialRampToValueAtTime(900, now + 0.07);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.12);
}

function playSynthChatNotif() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  
  // Soft atmospheric double-tone chime
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(659.25, now); // E5
  
  const g1 = ctx.createGain();
  g1.gain.setValueAtTime(0, now);
  g1.gain.linearRampToValueAtTime(0.05, now + 0.02);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(783.99, now + 0.07); // G5
  
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0, now + 0.07);
  g2.gain.linearRampToValueAtTime(0.04, now + 0.09);
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
  
  osc1.connect(g1);
  g1.connect(masterGain);
  osc2.connect(g2);
  g2.connect(masterGain);
  
  osc1.start(now);
  osc2.start(now + 0.07);
  osc1.stop(now + 0.4);
  osc2.stop(now + 0.55);
}

function playSynthCassetteNoise() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 1200 + Math.random() * 1500;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 4000;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.008, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  
  osc.start(now);
  osc.stop(now + 0.08);
}

function playSynthSwell() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  
  // Warm atmospheric pad chord (C Major / G feel)
  const freqs = [196.00, 261.63, 329.63, 392.00]; 
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.07, now + 0.5);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
  gain.connect(masterGain);
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(220, now);
  filter.frequency.exponentialRampToValueAtTime(750, now + 0.7);
  filter.frequency.exponentialRampToValueAtTime(140, now + 2.4);
  
  freqs.forEach(f => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, now);
    osc.connect(filter);
    osc.start(now);
    osc.stop(now + 2.8);
  });
  
  filter.connect(gain);
}

// --- Fading Tracks Helpers ---
function fadeTrack(trackName, targetVol, durationMs) {
  const targetNode = synthNodes[trackName];
  if (!targetNode) {
    if (trackName === 'rain') startSynthRain(0);
    else if (trackName === 'heartbeat') startSynthHeartbeat(0);
    else if (trackName === 'static') startSynthStatic(0);
    else if (trackName === 'breathing') startSynthBreathing(0);
    else if (trackName === 'drone') startSynthDrone(0);
    else if (trackName === 'tinnitus') startSynthTinnitus(0);
    else return;
  }
  
  const ctx = getAudioCtx();
  const node = synthNodes[trackName];
  const now = ctx.currentTime;
  node.gain.setValueAtTime(node.gain.value, now);
  node.gain.linearRampToValueAtTime(targetVol, now + (durationMs / 1000));
}

function fadePiano(targetVol, durationMs) {
  if (!pianoAudio) return;
  const currentVol = pianoAudio.volume;
  const steps = 20;
  const stepTime = durationMs / steps;
  const step = (targetVol - currentVol) / steps;
  let count = 0;
  
  const iv = setInterval(() => {
    count++;
    pianoAudio.volume = Math.max(0, Math.min(1, pianoAudio.volume + step));
    if (count >= steps) {
      clearInterval(iv);
      pianoAudio.volume = targetVol;
      if (targetVol === 0) pianoAudio.pause();
    }
  }, stepTime);
}

// --- Piano Player (mp3 loader) ---
function startPiano(volume) {
  if (!pianoAudio) {
    pianoAudio = new Audio('audio/piano.mp3');
    pianoAudio.loop = true;
    const savedTime = localStorage.getItem('audio_piano_time');
    if (savedTime) pianoAudio.currentTime = parseFloat(savedTime);
  }
  pianoAudio.volume = volume;
  pianoAudio.play().then(() => {
    if (!pianoAudio._tracker) {
      pianoAudio._tracker = setInterval(() => {
        if (!pianoAudio.paused) {
          localStorage.setItem('audio_piano_time', pianoAudio.currentTime);
        }
      }, 1000);
    }
  }).catch(() => {});
}

// --- Audio Controller Global Registry ---
window.audioController = {
  getContext: () => getAudioCtx(),
  
  // Ambient synthesizers
  startRain: (vol) => startSynthRain(vol),
  startStatic: (vol) => startSynthStatic(vol),
  startHeartbeat: (vol) => startSynthHeartbeat(vol),
  startPiano: (vol) => startPiano(vol),
  startDrone: (vol) => startSynthDrone(vol),
  startBreathing: (vol) => startSynthBreathing(vol),
  startTinnitus: (vol) => startSynthTinnitus(vol),
  
  stopHeartbeat: () => stopSynthHeartbeat(),
  stopDrone: () => stopSynthDrone(),
  stopBreathing: () => stopSynthBreathing(),
  stopTinnitus: () => stopSynthTinnitus(),
  
  fadeTrack: (track, vol, dur) => fadeTrack(track, vol, dur),
  fadePiano: (vol, dur) => fadePiano(vol, dur),
  
  // One-shot effects
  playWhoosh: () => playSynthWhoosh(),
  playCameraClick: () => playSynthCameraClick(),
  playChatTyping: () => playSynthTyping(),
  playChatSent: () => playSynthChatSent(),
  playChatNotif: () => playSynthChatNotif(),
  playCassetteNoise: () => playSynthCassetteNoise(),
  playSwell: () => playSynthSwell(),
  
  // Global states
  mute: () => {
    localStorage.setItem('cinema_muted', 'true');
    muteAllTracks();
  },
  unmute: () => {
    localStorage.setItem('cinema_muted', 'false');
    unmuteAllTracks();
    unlockAndPlayTracks();
  },
  isMuted: () => localStorage.getItem('cinema_muted') === 'true',

  // Generic play/stop aliases (used by AudioManager-style calls from chapters)
  play: (key) => {
    if (key === 'rain')      startSynthRain(0.06);
    else if (key === 'heartbeat') startSynthHeartbeat(0.06);
    else if (key === 'static')    startSynthStatic(0.01);
    else if (key === 'breathing') startSynthBreathing(0.02);
    else if (key === 'drone')     startSynthDrone(0.1);
    else if (key === 'tinnitus')  startSynthTinnitus(0.01);
  },

  // Piano MP3 helpers (mirrors startPiano but named as used in chapter scripts)
  playPiano: (vol) => startPiano(vol != null ? vol : 0.12),
  stopPiano:  ()    => fadePiano(0, 2000),

  // Convenience stop aliases
  stopHeartbeat: () => stopSynthHeartbeat(),
  stopDrone:     () => stopSynthDrone(),
};

function initAudioController() {
  const controlBar = document.querySelector('.cinematic-nav');
  if (controlBar) {
    const toggleBtn = controlBar.querySelector('.audio-toggle-btn');
    const audioIcon = controlBar.querySelector('.audio-icon');

    let isMuted = localStorage.getItem('cinema_muted') === 'true';
    if (isMuted) {
      audioIcon.classList.remove('playing');
    } else {
      audioIcon.classList.add('playing');
    }

    toggleBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      localStorage.setItem('cinema_muted', isMuted ? 'true' : 'false');
      
      if (isMuted) {
        audioIcon.classList.remove('playing');
        muteAllTracks();
      } else {
        audioIcon.classList.add('playing');
        unmuteAllTracks();
        unlockAndPlayTracks();
      }
    });
  }

  window.addEventListener('click', unlockAndPlayTracks, { once: true });
}

function unlockAndPlayTracks() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  const isMuted = localStorage.getItem('cinema_muted') === 'true';
  if (isMuted) return;

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Apply visual/sound textures matching chapters
  if (currentPage === 'index.html' || currentPage === 'opening.html') {
    startSynthRain(0.08); // rain night realistis
    startSynthStatic(0.01); // vhs static tipis
    startSynthBreathing(0.02); // subtle breathing
    
    // Delayed piano entrance for intro mystery (first 3s silent piano)
    setTimeout(() => {
      const currentPos = window.location.pathname.split('/').pop() || 'index.html';
      if ((currentPos === 'index.html' || currentPos === 'opening.html') && localStorage.getItem('cinema_muted') !== 'true') {
        startPiano(0.15); // soft emotional piano
      }
    }, 3000);
  } else if (currentPage === 'chapter4.html' || currentPage === 'chapter5.html') {
    startSynthRain(0.12);
    startSynthStatic(0.02);
    startSynthBreathing(0.03);
    startPiano(0.15);
  } else if (currentPage === 'chapter6.html') {
    startSynthRain(0.14);
    startPiano(0.12);
  } else if (currentPage === 'chapter9.html') {
    // Very quiet — story controls its own ambience via timeline
    startSynthRain(0.04);
    startSynthStatic(0.004);
    startSynthBreathing(0.01);
    startPiano(0);
  } else if (currentPage === 'chapter10.html' || currentPage === 'final.html') {
    startSynthRain(0.1);
    startPiano(0.08);
  } else {
    // Standard chapters: rain + piano + faint static + breath
    startSynthRain(0.1);
    startPiano(0.2);
    startSynthStatic(0.01);
    startSynthBreathing(0.02);
  }
}

function muteAllTracks() {
  if (masterGain) masterGain.gain.value = 0;
  if (pianoAudio) pianoAudio.volume = 0;
}

function unmuteAllTracks() {
  if (masterGain) masterGain.gain.value = 1;
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (pianoAudio) {
    pianoAudio.volume = currentPage === 'final.html' ? 0.05 : 0.2;
  }
}

/* ============================================================
   4. DYNAMIC CSS RAIN GENERATION
   Creates animated rain drops randomly styled across viewport.
   ============================================================ */
function initRainEffect() {
  const rainContainer = document.querySelector('.rain-container');
  if (!rainContainer) return;

  const dropCount = window.innerWidth < 768 ? 40 : 90;
  for (let i = 0; i < dropCount; i++) {
    const drop = document.createElement('div');
    drop.classList.add('drop');
    drop.style.left = Math.random() * 100 + 'vw';
    drop.style.animationDuration = (Math.random() * 0.8 + 0.6) + 's';
    drop.style.animationDelay = (Math.random() * 2) + 's';
    drop.style.opacity = Math.random() * 0.6 + 0.1;
    drop.style.height = (Math.random() * 80 + 30) + 'px';
    rainContainer.appendChild(drop);
  }
}

/* ============================================================
   5. RANDOMIZE POLAROID ROTATION
   Adds authentic organic layouts to image memories.
   ============================================================ */
function randomizePolaroids() {
  const polaroids = document.querySelectorAll('.polaroid');
  polaroids.forEach(p => {
    const randomRot = (Math.random() * 8 - 4).toFixed(2);
    p.style.setProperty('--rot', `${randomRot}deg`);
  });
}

/* ============================================================
   6. ATTACH HOVER/CLICK EFFECT TO PHOTO GALLERIES
   ============================================================ */
function setupMemoryPhotoSounds() {
  const polaroids = document.querySelectorAll('.polaroid, .scatter-polaroid');
  polaroids.forEach(p => {
    p.addEventListener('mouseenter', () => {
      if (audioUnlocked && localStorage.getItem('cinema_muted') !== 'true') {
        playSynthCassetteNoise();
      }
    });
    
    p.addEventListener('click', () => {
      if (audioUnlocked && localStorage.getItem('cinema_muted') !== 'true') {
        playSynthCameraClick();
        playSynthSwell();
      }
    });
  });
}

/* ============================================================
   7. AUTO-TYPING & MESSAGE SIMULATION WITH INTEGRATED SOUNDS
   Simulates authentic chat typing flow with mechanical clicking.
   ============================================================ */
window.simulateTyping = function(text, inputEl, cursorEl, onComplete) {
  let index = 0;
  inputEl.textContent = '';
  
  function type() {
    if (index < text.length) {
      inputEl.textContent += text.charAt(index);
      index++;
      // Mechanical typing sound on each keypress
      if (audioUnlocked && localStorage.getItem('cinema_muted') !== 'true') {
        playSynthTyping();
      }
      setTimeout(type, Math.random() * 100 + 40);
    } else {
      // Sent message chime
      if (audioUnlocked && localStorage.getItem('cinema_muted') !== 'true') {
        playSynthChatSent();
      }
      setTimeout(onComplete, 800);
    }
  }
  type();
};

window.simulateDeleting = function(inputEl, onComplete) {
  let text = inputEl.textContent;
  
  function del() {
    if (text.length > 0) {
      text = text.substring(0, text.length - 1);
      inputEl.textContent = text;
      // Mechanical typing sound on backspace
      if (audioUnlocked && localStorage.getItem('cinema_muted') !== 'true') {
        playSynthTyping();
      }
      setTimeout(del, 30);
    } else {
      setTimeout(onComplete, 500);
    }
  }
  setTimeout(del, 400);
};

/* ============================================================
   8. DYNAMIC FLOATING THOUGHTS GENERATOR
   Creates elegant floating text nodes floating and disappearing.
   ============================================================ */
window.initOverwhelmingThoughts = function(thoughtsArray) {
  const container = document.querySelector('.overwhelming-thoughts');
  if (!container) return;

  let currentIdx = 0;

  function spawnThought() {
    if (currentIdx >= thoughtsArray.length) return;

    const thought = document.createElement('span');
    thought.classList.add('thought-item');
    thought.textContent = thoughtsArray[currentIdx];
    
    // Random position
    thought.style.top = Math.random() * 70 + 10 + '%';
    thought.style.left = Math.random() * 60 + 10 + '%';
    container.appendChild(thought);
    
    // Animate reveal
    setTimeout(() => {
      thought.classList.add('active');
    }, 100);

    currentIdx++;
    // Spawn next
    setTimeout(spawnThought, 900);
  }

  spawnThought();
};
