/* ==========================================================================
   State & Configuration
   ========================================================================== */
let nameEntries = []; // Each entry: { name, image, weight, _imgCache }
let presets = {};
let activePresetName = 'Example Preset';
let settings = {
  theme: 'rainbow',
  skin: 'classic',
  customColors: ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'],
  showBoundaries: true,
  casinoTicker: true,
  soundSpinTick: true,
  soundWinnerType: 'random',
  volume: 1.0,
  timerEnabled: false,
  timerMin: 1,
  timerSec: 0,
  timerAutostart: true,
  timerSound: true,
  sidebarSections: [true, false, false, false],
  sidebarSubSections: [true, false]
};

// Default Color Themes
const THEMES = {
  neon: ['#ff007f', '#7b2cbf', '#3a0ca3', '#4361ee', '#4cc9f0', '#f72585'],
  sunset: ['#ff5e62', '#ff9966', '#ff4e50', '#f9d423', '#e100ff', '#7f00ff'],
  ocean: ['#0077b6', '#00bbf9', '#00f5d4', '#03045e', '#90e0ef', '#0096c7'],
  pastel: ['#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7', '#c7ceea', '#ffc6ff'],
  rainbow: ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#f15bb5', '#fee440', '#00f5d4', '#00bbf9'],
  classic: ['#ea4335', '#4285f4', '#fbbc05', '#33a853', '#ff6d00', '#4615b2']
};

// Default Presets (single example; entries are {name, image} objects)
const DEFAULT_PRESETS = {
  'Example Preset': [
    { name: 'Alice', image: null, weight: 1 }, { name: 'Bob', image: null, weight: 1 },
    { name: 'Charlie', image: null, weight: 1 }, { name: 'Diana', image: null, weight: 1 },
    { name: 'Ethan', image: null, weight: 1 }, { name: 'Fiona', image: null, weight: 1 }
  ]
};

// Helper: get plain name strings from nameEntries
function getNames() { return nameEntries.map(e => e.name); }

let presetModalDraftEntries = [];

function getPresetModalEntries() {
  return presetModalDraftEntries;
}

function syncPresetModalEntriesFromText() {
  const modalNamesArea = document.getElementById('modal-preset-names');
  if (!modalNamesArea) return;
  const lines = modalNamesArea.value
    .split('\n')
    .map(n => n.trim())
    .filter(n => n.length > 0);

  const existingMap = {};
  presetModalDraftEntries.forEach(entry => {
    if (!existingMap[entry.name]) {
      existingMap[entry.name] = entry;
    }
  });

  presetModalDraftEntries = lines.map((name, idx) => {
    const currentEntry = presetModalDraftEntries[idx];
    if (currentEntry && currentEntry.name === name) {
      return { ...currentEntry };
    }
    const existing = existingMap[name];
    return existing ? { ...existing } : normalizeEntry({ name });
  });
}

function getEntryWeight(entry) {
  const w = parseFloat(entry && entry.weight);
  return (w > 0 && !isNaN(w)) ? w : 1;
}

function normalizeEntry(item) {
  if (typeof item === 'string') {
    return { name: item, image: null, weight: 1, _imgCache: null };
  }
  const w = parseFloat(item.weight);
  return {
    name: item.name || '',
    image: item.image || null,
    weight: (w > 0 && !isNaN(w)) ? w : 1,
    _imgCache: null
  };
}

function getWeightedArcSizes() {
  const weights = nameEntries.map(getEntryWeight);
  const total = weights.reduce((sum, w) => sum + w, 0) || 1;
  return weights.map(w => (w / total) * Math.PI * 2);
}

function getSegmentStartAngles(arcSizes) {
  const starts = [];
  let cumulative = 0;
  arcSizes.forEach(arcSize => {
    starts.push(cumulative);
    cumulative += arcSize;
  });
  return starts;
}

function getIndexAtAngle(relativeAngle, arcSizes) {
  let cumulative = 0;
  for (let i = 0; i < arcSizes.length; i++) {
    if (relativeAngle >= cumulative && relativeAngle < cumulative + arcSizes[i]) {
      return i;
    }
    cumulative += arcSizes[i];
  }
  return Math.max(0, arcSizes.length - 1);
}

function hasCustomWeights() {
  return nameEntries.some(entry => getEntryWeight(entry) !== 1);
}

function drawWeightedWedges(ctx, center, radius, segmentStarts, arcSizes, currentAngle, colors) {
  for (let i = 0; i < arcSizes.length; i++) {
    const startAngle = segmentStarts[i] + currentAngle;
    const endAngle = startAngle + arcSizes[i];
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
  }
}

// Helper: migrate a saved array to nameEntries format (handles old plain-string saves)
function toEntries(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeEntry).filter(e => e.name.length > 0);
}

function createEntryMediaButton(entry, idx) {
  const mediaBtn = document.createElement('button');
  mediaBtn.className = 'entry-media-btn';
  mediaBtn.type = 'button';
  mediaBtn.dataset.index = idx;
  mediaBtn.dataset.action = 'media';

  const weight = getEntryWeight(entry);
  mediaBtn.title = entry.image
    ? `Photo & weight (${weight}×)`
    : `Add photo or set weight (${weight}×)`;

  const ellipse = document.createElement('span');
  ellipse.className = 'entry-media-ellipse' + (entry.image ? ' has-image' : '');
  if (entry.image) {
    ellipse.style.backgroundImage = `url(${entry.image})`;
  }
  mediaBtn.appendChild(ellipse);

  if (weight !== 1) {
    const badge = document.createElement('span');
    badge.className = 'entry-weight-badge';
    badge.textContent = Number.isInteger(weight) ? String(weight) : weight.toFixed(1);
    mediaBtn.appendChild(badge);
  }

  return mediaBtn;
}

/* ==========================================================================
   Toast Notifications
   ========================================================================== */
function showToast(message, type = 'info', duration = 3000) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

/* ==========================================================================
   Spin & Physics State
   ========================================================================== */
let currentAngle = 0; // Current rotation angle in radians
let spinSpeed = 0; // Speed of rotation in radians per frame
let isSpinning = false;
let lastTickSegmentIndex = -1; // Tracks ticks as segments pass the pointer
let pointerDeflection = 0; // Dynamic deflection angle in degrees
let pointerVelocity = 0;   // Dynamic deflection velocity
let wasInContact = false;  // Collision tracking state

// Center pin trigger and buttons
let canvas, ctx;

/* ==========================================================================
   Timer & Countdown State
   ========================================================================== */
let timerInterval = null;
let timerSecondsRemaining = 0;

/* ==========================================================================
   Audio Synthesis (Web Audio API)
   ========================================================================== */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function resumeAudioCtxOnGesture() {
  try {
    const actx = getAudioContext();
    if (actx.state === 'suspended') {
      actx.resume();
    }
    // Play a tiny silent buffer to unlock the AudioContext on all engines
    const buffer = actx.createBuffer(1, 1, 22050);
    const source = actx.createBufferSource();
    source.buffer = buffer;
    source.connect(actx.destination);
    source.start(0);
  } catch (e) {
    console.error('Failed to resume audio context:', e);
  }
}

// 1. Play realistic tick sound using audio file
function playTickSound() {
  if (!settings.soundSpinTick || settings.volume <= 0) return;
  try {
    playAudioFile('click1.wav', settings.volume * 0.5);
  } catch (e) {
    console.error('Audio playback failed:', e);
  }
}

// 2. Play Warning click for countdown using audio file
function playWarningTick(isFinal) {
  if (!settings.timerSound || settings.volume <= 0) return;
  try {
    const file = settings.timerSoundType || 'beep1.mp3';
    // Make intermediate 3-2-1 countdown ticks softer so they aren't too loud
    const vol = isFinal ? settings.volume : settings.volume * 0.4;
    playAudioFile(file, vol);
  } catch (e) {
    console.error('Audio playback failed:', e);
  }
}

// 3. Synthesize Fanfare chime melody
function playFanfareMelody() {
  const actx = getAudioContext();
  const now = actx.currentTime;
  
  // C major arpeggio sweep + chord
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    const filter = actx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(actx.destination);

    osc.type = 'sawtooth';
    const noteStart = now + i * 0.07;
    osc.frequency.setValueAtTime(freq, noteStart);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15 * settings.volume, noteStart + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.5);

    osc.start(noteStart);
    osc.stop(noteStart + 0.6);
  });
}

// 4. Synthesize Ta-Da! chime chord
function playTadaChord() {
  const actx = getAudioContext();
  const now = actx.currentTime;
  
  // Quick two-chord swell: G4-B4-D5 leading to C5-E5-G5-C6
  const chord1 = [392.00, 493.88, 587.33]; // G4, B4, D5
  const chord2 = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

  chord1.forEach(freq => {
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.connect(gain);
    gain.connect(actx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1 * settings.volume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc.start(now);
    osc.stop(now + 0.4);
  });

  chord2.forEach(freq => {
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.connect(gain);
    gain.connect(actx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + 0.25);
    gain.gain.setValueAtTime(0, now + 0.25);
    gain.gain.linearRampToValueAtTime(0.18 * settings.volume, now + 0.25 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25 + 0.9);
    
    osc.start(now + 0.25);
    osc.stop(now + 0.25 + 1.0);
  });
}

// 5. Synthesize Drumroll
function playDrumrollSynth() {
  const actx = getAudioContext();
  const now = actx.currentTime;
  
  // Generate pinkish bandpass noise buffer for drum rumble
  const bufferSize = actx.sampleRate * 1.5;
  const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = actx.createBufferSource();
  noise.buffer = buffer;

  const filter = actx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(160, now);
  filter.Q.setValueAtTime(3.5, now);

  const gain = actx.createGain();
  gain.gain.setValueAtTime(0, now);

  // Rumble modulation (fluttering the volume)
  for (let t = 0; t < 1.1; t += 0.03) {
    const modVol = 0.25 * settings.volume * (0.7 + Math.random() * 0.4);
    gain.gain.linearRampToValueAtTime(modVol, now + t);
  }
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(actx.destination);

  noise.start(now);
  noise.stop(now + 1.4);

  // Cymbal crash/synthesized gong strike at the end
  setTimeout(() => {
    if (settings.soundWinnerType === 'none' || settings.volume <= 0) return;
    try {
      const cNow = actx.currentTime;
      // High-pitched white noise for crash
      const cBuffer = actx.createBuffer(1, actx.sampleRate * 1.0, actx.sampleRate);
      const cData = cBuffer.getChannelData(0);
      for (let i = 0; i < cBuffer.length; i++) {
        cData[i] = Math.random() * 2 - 1;
      }
      
      const crashNode = actx.createBufferSource();
      crashNode.buffer = cBuffer;
      
      const crashFilter = actx.createBiquadFilter();
      crashFilter.type = 'highpass';
      crashFilter.frequency.setValueAtTime(6000, cNow);
      
      const crashGain = actx.createGain();
      crashGain.gain.setValueAtTime(0.2 * settings.volume, cNow);
      crashGain.gain.exponentialRampToValueAtTime(0.001, cNow + 0.9);
      
      crashNode.connect(crashFilter);
      crashFilter.connect(crashGain);
      crashGain.connect(actx.destination);
      
      crashNode.start(cNow);
      crashNode.stop(cNow + 1.0);

      // Low sweet frequency gong chime in background
      const chime = actx.createOscillator();
      const chimeGain = actx.createGain();
      chime.connect(chimeGain);
      chimeGain.connect(actx.destination);
      chime.type = 'sine';
      chime.frequency.setValueAtTime(329.63, cNow); // E4
      chimeGain.gain.setValueAtTime(0.2 * settings.volume, cNow);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, cNow + 1.5);
      chime.start(cNow);
      chime.stop(cNow + 1.6);
    } catch (err) {
      console.error(err);
    }
  }, 1100);
}

function playWinnerSound() {
  if (settings.soundWinnerType === 'none' || settings.volume <= 0) return;
  try {
    let type = settings.soundWinnerType;
    if (type === 'random') {
      const types = SOUND_LIST.map(s => s.id);
      type = types[Math.floor(Math.random() * types.length)];
    }
    playSynthesizedSound(type, settings.volume, getAudioContext());
  } catch (e) {
    console.error('Failed playing winner sound:', e);
  }
}

/* ==========================================================================
   Confetti Engine
   ========================================================================== */
let confettiCanvas, confettiCtx;
let confettiParticles = [];
let confettiAnimationId = null;

function initConfetti() {
  confettiCanvas = document.getElementById('confetti-canvas');
  confettiCtx = confettiCanvas.getContext('2d');
  resizeConfettiCanvas();
  window.addEventListener('resize', resizeConfettiCanvas);
}

function resizeConfettiCanvas() {
  if (confettiCanvas) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
}

class ConfettiParticle {
  constructor(x, y, isExplosion = false) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 8 + 6;
    this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    this.shape = Math.floor(Math.random() * 3); // 0: square, 1: circle, 2: triangle
    
    const angle = Math.random() * Math.PI * 2;
    const speed = isExplosion ? (Math.random() * 12 + 6) : (Math.random() * 4 + 2);
    
    this.vx = Math.cos(angle) * speed;
    this.vy = isExplosion ? (Math.sin(angle) * speed - Math.random() * 5) : (Math.random() * 3 + 2);
    
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() * 0.2 - 0.1);
    this.opacity = 1.0;
    this.decay = Math.random() * 0.01 + 0.005;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2; // Gravity
    this.vx *= 0.98; // Drag
    this.rotation += this.rotationSpeed;
    this.opacity -= this.decay;
  }

  draw() {
    confettiCtx.save();
    confettiCtx.translate(this.x, this.y);
    confettiCtx.rotate(this.rotation);
    confettiCtx.globalAlpha = Math.max(0, this.opacity);
    confettiCtx.fillStyle = this.color;
    confettiCtx.beginPath();
    
    if (this.shape === 0) {
      // Square
      confettiCtx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
    } else if (this.shape === 1) {
      // Circle
      confettiCtx.arc(0, 0, this.size/2, 0, Math.PI * 2);
      confettiCtx.fill();
    } else {
      // Triangle
      confettiCtx.moveTo(0, -this.size/2);
      confettiCtx.lineTo(this.size/2, this.size/2);
      confettiCtx.lineTo(-this.size/2, this.size/2);
      confettiCtx.closePath();
      confettiCtx.fill();
    }
    
    confettiCtx.restore();
  }
}

function startConfettiShow(type = 'explosion') {
  stopConfettiShow();
  confettiParticles = [];
  
  if (type === 'explosion') {
    const midX = window.innerWidth / 2;
    const midY = window.innerHeight / 2;
    for (let i = 0; i < 200; i++) {
      confettiParticles.push(new ConfettiParticle(midX, midY, true));
    }
  } else {
    // Shower falling from top
    for (let i = 0; i < 150; i++) {
      confettiParticles.push(new ConfettiParticle(Math.random() * window.innerWidth, -20, false));
    }
  }
  
  animateConfetti();
}

function stopConfettiShow() {
  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);
    confettiAnimationId = null;
  }
  if (confettiCtx) {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

function animateConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  
  let activeParticles = 0;
  for (let i = 0; i < confettiParticles.length; i++) {
    const p = confettiParticles[i];
    if (p.opacity > 0) {
      p.update();
      p.draw();
      activeParticles++;
    }
  }
  
  if (activeParticles > 0) {
    confettiAnimationId = requestAnimationFrame(animateConfetti);
  } else {
    stopConfettiShow();
  }
}

/* ==========================================================================
   State Persistence & Storage Sync
   ========================================================================== */
function saveState() {
  // persist only the serializable parts (name + image). Do not store _imgCache
  const serialNames = nameEntries.map(e => ({ name: e.name, image: e.image, weight: getEntryWeight(e) }));
  const serialPresets = {};
  Object.keys(presets).forEach(k => {
    serialPresets[k] = (presets[k] || []).map(p => ({
      name: p.name,
      image: p.image,
      weight: getEntryWeight(p)
    }));
  });

  const state = {
    names: serialNames,
    presets: serialPresets,
    activePresetName,
    settings,
    settingsVersion: SETTINGS_VERSION
  };
  localStorage.setItem('name_wheel_state', JSON.stringify(state));
}

const SETTINGS_VERSION = 2; // Bump this to force-reset settings to new defaults

function loadState() {
  const stored = localStorage.getItem('name_wheel_state');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      nameEntries = toEntries(data.names || []);
      presets = data.presets || { ...DEFAULT_PRESETS };

      // Purge old built-in presets that no longer exist
      const OLD_BUILTINS = ['Default Team', 'Quick Flip', 'Dinner Decisions', 'Numbers 1-10'];
      OLD_BUILTINS.forEach(k => delete presets[k]);
      // Ensure the single example preset always exists
      if (!presets['Example Preset']) presets['Example Preset'] = DEFAULT_PRESETS['Example Preset'];

      activePresetName = data.activePresetName || 'Example Preset';
      if (!presets[activePresetName]) activePresetName = Object.keys(presets)[0];
      // Only merge saved settings if they're from the current version
      if (data.settingsVersion === SETTINGS_VERSION) {
        settings = { ...settings, ...data.settings };
      }
      // (else: keep the new defaults defined at the top of the file)
      
      // Backward compatibility / defaults validation
      if (settings.timerMin === undefined && settings.timerDuration !== undefined) {
        settings.timerMin = Math.floor(settings.timerDuration / 60);
        settings.timerSec = settings.timerDuration % 60;
      }
      if (settings.timerMin === undefined) settings.timerMin = 1;
      if (settings.timerSec === undefined) settings.timerSec = 0;
      if (settings.timerAutostart === undefined) settings.timerAutostart = true;
      if (settings.skin === undefined) settings.skin = 'classic';
      if (settings.volume === undefined || settings.volume === null || isNaN(settings.volume)) settings.volume = 0.5;
      if (settings.soundSpinTick === undefined) settings.soundSpinTick = true;
      if (settings.soundWinner === false) {
        settings.soundWinnerType = 'none';
        settings.soundWinner = true;
      }
      const legacyMap = {
        fanfare: 'fanfare1',
        tada: 'fanfare2',
        drumroll: 'jingle1',
        gong: 'resonance1',
        sonar: 'chime5',
        clock_tock: 'chime2',
        phone_ring: 'alarm3',
        boing: 'slide5',
        fart: 'slide4',
        sad_trombone: 'scale3',
        slip: 'slide4',
        howl: 'whoosh2',
        meow: 'slide1',
        moo: 'slide2',
        drip: 'splash2',
        slide: 'slide2',
        siren: 'alarm1',
        buzzer: 'alarm4',
        wind: 'whoosh2',
        laser: 'beep3',
        coin: 'beep4',
        jump: 'beep5',
        power_up: 'scale2',
        game_over: 'scale3',
        alien: 'beep2',
        explosion: 'cannon1',
        whistle: 'slide1',
        whip: 'whoosh1',
        heartbeat: 'cannon2'
      };
      if (settings.soundWinnerType in legacyMap) {
        settings.soundWinnerType = legacyMap[settings.soundWinnerType];
      }
      if (settings.soundWinnerType === undefined || (settings.soundWinnerType !== 'none' && settings.soundWinnerType !== 'random' && !SOUND_LIST.some(s => s.id === settings.soundWinnerType))) {
        settings.soundWinnerType = 'fanfare1';
      }
      if (settings.timerSoundType === undefined) settings.timerSoundType = 'beep1.mp3';
      if (settings.showBoundaries === undefined) settings.showBoundaries = false;
      if (settings.casinoTicker === undefined) settings.casinoTicker = false;

      // Update custom colors input value if it was saved
      if (settings.customColors) {
        document.getElementById('custom-colors-input').value = settings.customColors.join(', ');
      }
    } catch (e) {
      console.warn('Failed to parse stored name wheel state, resetting defaults.', e);
      loadDefaults();
    }
  } else {
    loadDefaults();
  }
}

function loadDefaults() {
  presets = { ...DEFAULT_PRESETS };
  activePresetName = 'Example Preset';
  nameEntries = toEntries(presets[activePresetName]);
  saveState();
}

/* ==========================================================================
   Wheel Canvas Rendering
   ========================================================================== */
function getActiveColors() {
  if (settings.theme === 'custom') {
    return settings.customColors.length >= 2 ? settings.customColors : THEMES.neon;
  }
  return THEMES[settings.theme] || THEMES.neon;
}

function drawWheel() {
  if (!canvas) return;
  const size = Math.min(canvas.parentElement.clientWidth, 600);
  canvas.width = size;
  canvas.height = size;

  const center = size / 2;
  const radius = size / 2 - 10;
  
  ctx.clearRect(0, 0, size, size);

  if (nameEntries.length === 0) {
    // Draw an empty wheel placeholder
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    ctx.font = `600 20px ${settings.fontFamily || 'Outfit'}`;
    ctx.fillStyle = '#a397b4';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Please add some names first!', center, center);
    return;
  }

  const arcSizes = getWeightedArcSizes();
  const segmentStarts = getSegmentStartAngles(arcSizes);
  const colors = getActiveColors();

  if (hasCustomWeights()) {
    drawWeightedWedges(ctx, center, radius, segmentStarts, arcSizes, currentAngle, colors);
  } else {
    drawWheelSkin(settings.skin || 'classic', ctx, center, radius, nameEntries.length, currentAngle, colors);
  }

  // Draw segment texts
  for (let i = 0; i < nameEntries.length; i++) {
    const arcSize = arcSizes[i];
    const startAngle = segmentStarts[i] + currentAngle;

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(startAngle + arcSize / 2);
    
    // Fit font size depending on name length and segment count
    let fontSize = Math.floor(radius * 0.11);
    if (nameEntries.length > 25) fontSize = Math.floor(radius * 0.04);
    else if (nameEntries.length > 15) fontSize = Math.floor(radius * 0.06);
    else if (nameEntries.length > 8) fontSize = Math.floor(radius * 0.08);

    fontSize = Math.min(Math.max(fontSize, 10), 32);
    
    ctx.font = `800 ${fontSize}px 'Outfit', sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // Enhanced text shadow/glow for legibility on textured/dark skins
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    // Draw image for this segment (if available). Draw image first so text
    // sits on top. Maximize image size inside the wedge while preserving aspect.
    const entry = nameEntries[i];
    if (entry && entry.image) {
      try {
        if (!entry._imgCache) {
          const img = new Image();
          img.onload = function() {
            entry._imgCache = img;
            drawWheel();
          };
          img.src = entry.image;
          entry._imgCache = img;
        }

        const imgToDraw = entry._imgCache;
        if (imgToDraw && imgToDraw.complete) {
          const imgW = Math.max(1, imgToDraw.width);
          const imgH = Math.max(1, imgToDraw.height);
          const R = Math.floor(radius - 6);
          const M = Math.max(4, Math.floor(radius * 0.02));
          const T = Math.tan(arcSize / 2);

          // Binary search for max scale s so that rectangle (s*imgW × s*imgH)
          // fits inside the wedge AND stays within the wheel's circular boundary.
          // Constraints:
          //   1. Circle: outer corners sqrt(xOut² + (halfH)²) <= R
          //   2. Wedge: at inner edge, halfH <= xIn * tan(theta)
          //   3. Inner limit: xIn >= M
          let lo = 0, hi = 2 * R / Math.max(imgW, imgH);
          for (let iter = 0; iter < 40; iter++) {
            const s = (lo + hi) / 2;
            const halfH = s * imgH / 2;
            if (halfH >= R) { hi = s; continue; }
            const xOutMax = Math.sqrt(R * R - halfH * halfH);
            const xInMin = Math.max(M, halfH / T);
            const xOutNeeded = xInMin + s * imgW;
            if (xOutNeeded <= xOutMax) {
              lo = s;
            } else {
              hi = s;
            }
          }

          const s = lo;
          const drawW = Math.max(2, Math.floor(s * imgW));
          const drawH = Math.max(2, Math.floor(s * imgH));
          const halfH = drawH / 2;
          const xOut = Math.sqrt(Math.max(0, R * R - halfH * halfH));
          const imgX = xOut - drawW;
          const imgY = -halfH;

          ctx.drawImage(imgToDraw, imgX, imgY, drawW, drawH);
        }
      } catch (e) {
        console.error('Image draw failed for entry', entry, e);
      }
    }

    const rawName = nameEntries[i].name;
    const displayName = rawName.length > 18 ? rawName.substring(0, 16) + '...' : rawName;
    // Draw stroke then fill so text remains legible over images
    ctx.lineWidth = Math.max(2, Math.floor(fontSize * 0.12));
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.strokeText(displayName, radius - 25, 0);
    ctx.fillText(displayName, radius - 25, 0);
    ctx.restore();
  }

  // Draw segment boundaries if enabled
  if (settings.showBoundaries) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i < nameEntries.length; i++) {
      const angle = segmentStarts[i] + currentAngle;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center + Math.cos(angle) * radius, center + Math.sin(angle) * radius);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Draw casino pegs on the rim if enabled
  if (settings.casinoTicker) {
    const pegRadius = 5;
    const pegDist = radius - 8;
    ctx.save();
    for (let i = 0; i < nameEntries.length; i++) {
      const angle = segmentStarts[i] + currentAngle;
      const pegX = center + Math.cos(angle) * pegDist;
      const pegY = center + Math.sin(angle) * pegDist;

      // Draw a nice 3D metallic peg
      ctx.beginPath();
      ctx.arc(pegX, pegY, pegRadius, 0, Math.PI * 2);
      const pegGrad = ctx.createRadialGradient(
        pegX - 1.5, pegY - 1.5, 0.5,
        pegX, pegY, pegRadius
      );
      pegGrad.addColorStop(0, '#ffffff');
      pegGrad.addColorStop(0.4, '#d1d8e0');
      pegGrad.addColorStop(1, '#778ca3');
      ctx.fillStyle = pegGrad;
      ctx.fill();

      ctx.lineWidth = 1;
      ctx.strokeStyle = '#4b6584';
      ctx.stroke();
    }
    ctx.restore();
  }

  // Draw Center Circle (Pin)
  ctx.beginPath();
  ctx.arc(center, center, radius * 0.14, 0, Math.PI * 2);
  const pinGrad = ctx.createRadialGradient(
    center - radius * 0.04, center - radius * 0.04, 1,
    center, center, radius * 0.14
  );
  pinGrad.addColorStop(0, '#ffffff');
  pinGrad.addColorStop(0.3, '#dcdde1');
  pinGrad.addColorStop(1, '#2f3640');
  ctx.fillStyle = pinGrad;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Outer ring border
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.stroke();
}

/* ==========================================================================
   Spin Logic & Physics Loop
   ========================================================================== */
function spin() {
  if (isSpinning || nameEntries.length === 0) return;
  resumeAudioCtxOnGesture(); 
  
  isSpinning = true;
  lastTickSegmentIndex = -1;
  document.getElementById('center-spin-trigger').style.pointerEvents = 'none';

  const arcSizes = getWeightedArcSizes();

  // Uniform random angle — segment size reflects each entry's weight ratio.
  const randomTargetAngle = Math.random() * (Math.PI * 2); 
  
  // Force between 3 and 5 full revolutions before stopping
  const extraRevolutions = (3 + Math.floor(Math.random() * 3)) * Math.PI * 2;
  const startAngle = currentAngle;
  const totalRotationTarget = startAngle + extraRevolutions + randomTargetAngle;

  // 2. ANIMATION TIMING CONFIG
  let currentFrame = 0;
  const totalFrames = 1000;
  
  function animate() {
    currentFrame++;
    
    // Cubic Ease-Out curve for smooth, realistic deceleration
    const t = currentFrame / totalFrames;
    const easeOutCubic = 1 - Math.pow(1 - t, 5);
    
    // Interpolate from start angle to total target destination
    currentAngle = startAngle + (totalRotationTarget - startAngle) * easeOutCubic;
    
    // Calculate instantaneous spin speed for ticker physics
    const speedFactor = 3 * Math.pow(1 - t, 3) / totalFrames;
    spinSpeed = (totalRotationTarget - startAngle) * speedFactor;

    // Normalize angle for rendering/tracking
    currentAngle %= Math.PI * 2;
    
    const relativeAngle = (Math.PI * 2 - currentAngle) % (Math.PI * 2);
    const crossedIndex = getIndexAtAngle(relativeAngle, arcSizes);
    let activePegIdx = -1;

    if (settings.casinoTicker) {
      const size = Math.min(canvas.parentElement.clientWidth, 600);
      const radius = size / 2 - 10;
      const pegDist = radius - 8;
      
      const L = 20; 
      const r_peg = 5; 
      const L_sq_plus_r_sq = L * L + r_peg * r_peg;
      
      let maxForcedDeflection = 0;
      
      const segmentStarts = getSegmentStartAngles(arcSizes);
      for (let i = 0; i < nameEntries.length; i++) {
        const pegAngleOnWheel = segmentStarts[i] + currentAngle;
        const diff = ((pegAngleOnWheel + Math.PI) % (Math.PI * 2)) - Math.PI;
        
        const dx = pegDist * Math.cos(diff) - radius;
        const dy = pegDist * Math.sin(diff);
        const d_sq = dx * dx + dy * dy;
        
        if (d_sq < L_sq_plus_r_sq) {
          const d = Math.sqrt(d_sq);
          const pegAngle = Math.atan2(dy, -dx);
          const theta_forced = pegAngle + Math.asin(r_peg / d);
          const maxClampRad = 45 * Math.PI / 180;
          const actual_theta = Math.min(maxClampRad, theta_forced);
          
          if (dy - r_peg < -dx * Math.tan(actual_theta) && theta_forced >= 0) {
            if (theta_forced > maxForcedDeflection) {
              maxForcedDeflection = theta_forced;
              activePegIdx = i;
            }
          }
        }
      }
      
      let justReleased = false;
      if (activePegIdx !== -1) {
        // Ticker interacts with peg
        const targetDeflection = maxForcedDeflection * (180 / Math.PI);
        pointerDeflection = -Math.min(45, targetDeflection);
        pointerVelocity = -spinSpeed * (180 / Math.PI);
        wasInContact = true;
      } else {
        // Ticker swings freely
        if (wasInContact) {
          justReleased = true;
          wasInContact = false;
          playTickSound();
        }
        
        const k = 0.28; 
        const c = 0.26; 
        const accel = -k * pointerDeflection - c * pointerVelocity;
        pointerVelocity += accel;
        pointerDeflection += pointerVelocity;
        pointerDeflection = Math.max(-45, Math.min(18, pointerDeflection));
      }
      
      if (crossedIndex !== lastTickSegmentIndex) {
        if (!justReleased && !wasInContact) {
          playTickSound();
          pointerDeflection = -30;
          pointerVelocity = spinSpeed * 8;
        }
        lastTickSegmentIndex = crossedIndex;
      }
      
      const pointerEl = document.querySelector('.wheel-pointer');
      if (pointerEl) {
        pointerEl.style.transform = `translateY(-50%) rotate(${180 + pointerDeflection}deg)`;
      }
    } else {
      if (crossedIndex !== lastTickSegmentIndex) {
        playTickSound();
        lastTickSegmentIndex = crossedIndex;
      }
      pointerDeflection = 0;
      pointerVelocity = 0;
      wasInContact = false;
    }

    drawWheel();

    if (currentFrame >= totalFrames) {
      isSpinning = false;
      spinSpeed = 0;
      
      // 3. DETERMINE VISUAL WINNER
      // Instead of relying on a pre-selected index, we use your original visual logic.
      // This perfectly accounts for the needle bending into an adjacent segment.
      let finalIndex = crossedIndex;
      if (settings.casinoTicker && activePegIdx !== -1) {
        finalIndex = (activePegIdx + nameEntries.length) % nameEntries.length;
      }
      
      handleWin(nameEntries[finalIndex].name);
    } else {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

/* ==========================================================================
   Winner Selection & Flow Toggles
   ========================================================================== */
let lastWinnerSelected = '';

function handleWin(winner) {
  lastWinnerSelected = winner;
  
  // Re-enable spin controls
  document.getElementById('center-spin-trigger').style.pointerEvents = 'auto';

  // Play celebration animations & audio chimes
  playWinnerSound();
  startConfettiShow('explosion');

  if (settings.timerEnabled) {
    // If timer enabled, bypass immediate win dialog and launch timer overlay modal
    startCountdownTimer(winner);
  } else {
    // If timer disabled, show the classic winner celebration modal
    showWinnerModal(winner);
  }
}

function setModalMediaBackground(modalId, boxSelector, winner) {
  const modal = document.getElementById(modalId);
  const modalBox = modal ? modal.querySelector(boxSelector) : null;
  if (!modalBox) return;

  const entry = nameEntries.find(item => item.name === winner && item.image);
  if (entry && entry.image) {
    modalBox.style.backgroundImage = `linear-gradient(rgba(25, 14, 40, 0.55), rgba(25, 14, 40, 0.55)), url(${entry.image})`;
    modalBox.style.backgroundSize = 'contain';
    modalBox.style.backgroundPosition = 'center';
    modalBox.style.backgroundRepeat = 'no-repeat';
    modalBox.style.backgroundBlendMode = 'overlay';
    modalBox.classList.add('winner-modal-bg');

    // Size modal to exactly match the image aspect ratio within 80% viewport
    const img = new Image();
    img.onload = function () {
      const maxW = window.innerWidth * 0.8;
      const maxH = window.innerHeight * 0.8;
      const imgAspect = img.width / img.height;
      let modalWidth, modalHeight;

      if (imgAspect > (maxW / maxH)) {
        // Width-constrained
        modalWidth = maxW;
        modalHeight = maxW / imgAspect;
      } else {
        // Height-constrained
        modalHeight = maxH;
        modalWidth = maxH * imgAspect;
      }

      // Ensure minimum width so buttons always fit
      modalWidth = Math.max(modalWidth, 320);

      modalBox.style.width = modalWidth + 'px';
      modalBox.style.height = modalHeight + 'px';
    };
    img.src = entry.image;
  } else {
    modalBox.style.backgroundImage = '';
    modalBox.style.backgroundBlendMode = '';
    modalBox.style.width = '90%';
    modalBox.style.height = 'auto';
    modalBox.classList.remove('winner-modal-bg');
  }
}

function showWinnerModal(winner) {
  const winnerDisplay = document.getElementById('winner-name-display');
  if (winnerDisplay) winnerDisplay.innerText = winner;
  setModalMediaBackground('winner-modal', '.modal-box', winner);
  const modal = document.getElementById('winner-modal');
  if (modal) modal.classList.remove('hidden');
}

function hideWinnerModal() {
  const modal = document.getElementById('winner-modal');
  const modalBox = modal ? modal.querySelector('.modal-box') : null;
  if (modalBox) {
    modalBox.style.backgroundImage = '';
    modalBox.style.backgroundBlendMode = '';
    modalBox.style.width = '';
    modalBox.style.height = '';
    modalBox.classList.remove('winner-modal-bg');
  }
  if (modal) modal.classList.add('hidden');
  stopConfettiShow();
}

/* ==========================================================================
   Winner Timer Implementation
   ========================================================================== */
function startCountdownTimer(winner) {
  stopCountdownTimer(); // Clear existing timers

  document.getElementById('timer-winner-name').innerText = winner;
  
  const totalSeconds = (settings.timerMin * 60) + (settings.timerSec || 0);
  document.getElementById('timer-countdown-text').innerText = totalSeconds;
  
  // Show timer overlay modal
  const timerModal = document.getElementById('timer-modal');
  if (timerModal) {
    setModalMediaBackground('timer-modal', '.timer-overlay-box', winner);
    timerModal.classList.remove('hidden');
  }
  
  // Set circle stroke dash
  const circle = document.getElementById('timer-progress-circle');
  circle.style.strokeDashoffset = 0;
  
  timerSecondsRemaining = totalSeconds;
  const container = document.querySelector('.timer-visual-container');
  container.classList.remove('timer-warning');

  const startBtn = document.getElementById('start-timer-btn');

  if (settings.timerAutostart) {
    startBtn.style.display = 'none';
    runTimerCountdown(winner);
  } else {
    startBtn.style.display = 'inline-flex';
  }
}

function runTimerCountdown(winner) {
  const circle = document.getElementById('timer-progress-circle');
  const container = document.querySelector('.timer-visual-container');
  const totalSeconds = (settings.timerMin * 60) + (settings.timerSec || 0);

  stopCountdownTimer();

  timerInterval = setInterval(() => {
    timerSecondsRemaining--;
    
    // Update progress circle (Circumference = 282.74)
    const ratio = Math.max(0, timerSecondsRemaining / totalSeconds);
    const offset = 282.74 * (1 - ratio);
    circle.style.strokeDashoffset = offset;
    
    // Update digital text countdown
    document.getElementById('timer-countdown-text').innerText = Math.max(0, timerSecondsRemaining);
    
    // Warning state trigger (final 3 seconds)
    if (timerSecondsRemaining <= 3 && timerSecondsRemaining > 0) {
      container.classList.add('timer-warning');
      playWarningTick(timerSecondsRemaining === 1);
    }
    
    // Completion of countdown
    if (timerSecondsRemaining <= 0) {
      stopCountdownTimer();
      // Auto transition from timer to the winner celebration modal
      const timerModalEl = document.getElementById('timer-modal');
      const timerBox = timerModalEl ? timerModalEl.querySelector('.timer-overlay-box') : null;
      if (timerBox) {
        timerBox.style.backgroundImage = '';
        timerBox.style.backgroundBlendMode = '';
        timerBox.style.width = '';
        timerBox.style.height = '';
        timerBox.classList.remove('winner-modal-bg');
      }
      timerModalEl.classList.add('hidden');
      
      // Play extra final fanfare beep
      playWarningTick(true);
      showWinnerModal(winner);
    }
  }, 1000);
}

function stopCountdownTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function skipTimer() {
  stopCountdownTimer();
  const timerModalEl = document.getElementById('timer-modal');
  const timerBox = timerModalEl ? timerModalEl.querySelector('.timer-overlay-box') : null;
  if (timerBox) {
    timerBox.style.backgroundImage = '';
    timerBox.style.backgroundBlendMode = '';
    timerBox.style.width = '';
    timerBox.style.height = '';
    timerBox.classList.remove('winner-modal-bg');
  }
  timerModalEl.classList.add('hidden');
  // Transition directly to the Winner Modal
  showWinnerModal(lastWinnerSelected);
}

/* ==========================================================================
   Settings Panel Events & Presets
   ========================================================================== */
function populatePresetsDropdown() {
  const dropdown = document.getElementById('preset-select');
  dropdown.innerHTML = '';
  // Add a 'None' option so users can opt to not use any preset
  const noneOption = document.createElement('option');
  noneOption.value = '__none__';
  noneOption.innerText = 'None';
  if (!activePresetName || activePresetName === '__none__') noneOption.selected = true;
  dropdown.appendChild(noneOption);

  Object.keys(presets).forEach(presetName => {
    const option = document.createElement('option');
    option.value = presetName;
    option.innerText = presetName;
    if (presetName === activePresetName) {
      option.selected = true;
    }
    dropdown.appendChild(option);
  });
}

function updateNamesTextarea() {
  const textarea = document.getElementById('names-input');
  textarea.value = getNames().join('\n');
  document.getElementById('names-count').innerText = `${nameEntries.length} names`;
  renderNamesList();
}

// Render compact list of names with per-entry media button
function renderNamesList() {
  const container = document.getElementById('names-list');
  if (!container) return;
  container.innerHTML = '';
  nameEntries.forEach((entry, idx) => {
    const row = document.createElement('div');
    row.className = 'name-row';

    const input = document.createElement('input');
    input.className = 'name-input';
    input.value = entry.name;
    input.dataset.index = idx;
    input.addEventListener('input', (e) => {
      const i = parseInt(e.target.dataset.index, 10);
      if (isNaN(i)) return;
      nameEntries[i].name = e.target.value;
      // keep image mapping by updating key when changed
      updateNamesTextarea();
      saveState();
      drawWheel();
    });

    const mediaBtn = createEntryMediaButton(entry, idx);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-icon btn-icon-red';
    deleteBtn.type = 'button';
    deleteBtn.dataset.index = idx;
    deleteBtn.dataset.action = 'delete';
    deleteBtn.title = 'Delete this name';
    deleteBtn.innerText = '🗑';

    row.appendChild(input);
    row.appendChild(mediaBtn);
    row.appendChild(deleteBtn);

    container.appendChild(row);
  });
}

// Open media modal for a given index in either the main list or the preset draft list
function updateMediaPreview(entry) {
  const preview = document.getElementById('media-preview');
  if (!preview) return;
  preview.classList.toggle('has-image', !!entry.image);
  preview.style.backgroundImage = entry.image ? `url(${entry.image})` : '';
}

function openMediaModalForIndex(idx, listType = 'main') {
  const modal = document.getElementById('media-modal');
  const nameEl = document.getElementById('media-modal-name');
  const fileInput = document.getElementById('media-file-input');
  const weightInput = document.getElementById('media-weight-input');
  if (!modal || !nameEl || !fileInput || !weightInput) return;

  const entries = listType === 'preset' ? presetModalDraftEntries : nameEntries;
  const entry = entries[idx];
  if (!entry) return;

  modal.dataset.targetIndex = idx;
  modal.dataset.targetList = listType;
  nameEl.textContent = entry.name;
  fileInput.value = '';
  weightInput.value = getEntryWeight(entry);
  updateMediaPreview(entry);

  const delBtn = document.getElementById('media-delete-btn');
  delBtn.style.display = entry.image ? 'inline-block' : 'none';
  modal.classList.remove('hidden');
}

function closeMediaModal() {
  const modal = document.getElementById('media-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  delete modal.dataset.targetIndex;
  delete modal.dataset.targetList;
}

function applyMediaModalChanges(entries, idx, listType, imageData, weight) {
  entries[idx].weight = weight;
  if (imageData !== undefined) {
    entries[idx].image = imageData;
    entries[idx]._imgCache = null;
  }

  if (listType === 'preset') {
    presetModalDraftEntries = entries;
    renderPresetNamesList();
  } else {
    saveState();
    renderNamesList();
    drawWheel();
  }

  closeMediaModal();
  showToast('Entry updated.', 'success');
}

function saveMediaFromModal() {
  const modal = document.getElementById('media-modal');
  const fileInput = document.getElementById('media-file-input');
  const weightInput = document.getElementById('media-weight-input');
  if (!modal || !fileInput || !weightInput) return;
  const idx = parseInt(modal.dataset.targetIndex, 10);
  const listType = modal.dataset.targetList === 'preset' ? 'preset' : 'main';
  const entries = listType === 'preset' ? presetModalDraftEntries : nameEntries;
  if (isNaN(idx) || !entries[idx]) return closeMediaModal();

  const weight = parseFloat(weightInput.value);
  if (isNaN(weight) || weight <= 0) {
    showToast('Weight must be greater than 0.', 'error');
    return;
  }

  const files = fileInput.files;
  if (files && files.length > 0) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = function(evt) {
      applyMediaModalChanges(entries, idx, listType, evt.target.result, weight);
    };
    reader.readAsDataURL(file);
    return;
  }

  applyMediaModalChanges(entries, idx, listType, undefined, weight);
}

function deleteMediaFromModal() {
  const modal = document.getElementById('media-modal');
  if (!modal) return;
  const idx = parseInt(modal.dataset.targetIndex, 10);
  const listType = modal.dataset.targetList === 'preset' ? 'preset' : 'main';
  const entries = listType === 'preset' ? presetModalDraftEntries : nameEntries;
  if (isNaN(idx) || !entries[idx]) return closeMediaModal();
  entries[idx].image = null;
  entries[idx]._imgCache = null;

  if (listType === 'preset') {
    presetModalDraftEntries = entries;
    renderPresetNamesList();
  } else {
    saveState();
    renderNamesList();
    drawWheel();
  }

  closeMediaModal();
  showToast('Image removed.', 'info');
}

function handleNameInputChange(e) {
  const input = e.target.value;
  const newNames = input.split('\n').map(n => n.trim()).filter(n => n.length > 0);
  // Preserve images for names that still exist
  const oldMap = {};
  nameEntries.forEach(e => { oldMap[e.name] = e; });
  nameEntries = newNames.map(n => oldMap[n] || { name: n, image: null, weight: 1, _imgCache: null });

  document.getElementById('names-count').innerText = `${nameEntries.length} names`;
  saveState();
  renderNamesList();
  drawWheel();
}

function loadSelectedPreset() {
  const dropdown = document.getElementById('preset-select');
  const val = dropdown.value;
  if (val === '__none__') {
    activePresetName = '__none__';
    // When None selected, do not change the current names; just update UI state
    showToast('Preset set to None.', 'info');
    // disable delete button visually
    document.getElementById('delete-preset-btn').disabled = true;
    return;
  }

  activePresetName = val;
  document.getElementById('delete-preset-btn').disabled = false;
  if (presets[activePresetName]) {
    nameEntries = toEntries(presets[activePresetName]);
    updateNamesTextarea();
    saveState();
    drawWheel();
  }
}

function renderPresetNamesList() {
  const container = document.getElementById('modal-preset-names-list');
  const modalNamesArea = document.getElementById('modal-preset-names');
  if (!container || !modalNamesArea) return;

  container.innerHTML = '';
  syncPresetModalEntriesFromText();

  presetModalDraftEntries.forEach((entry, idx) => {
    const row = document.createElement('div');
    row.className = 'name-row';

    const input = document.createElement('input');
    input.className = 'name-input';
    input.value = entry.name;
    input.dataset.index = idx;
    input.addEventListener('input', (e) => {
      const i = parseInt(e.target.dataset.index, 10);
      if (isNaN(i)) return;
      presetModalDraftEntries[i].name = e.target.value;
      modalNamesArea.value = presetModalDraftEntries.map(en => en.name).join('\n');
    });

    row.appendChild(input);
    row.appendChild(createEntryMediaButton(entry, idx));

    container.appendChild(row);
  });
}

function saveNewPreset() {
  const modalNameInput = document.getElementById('modal-preset-name');
  const modalNamesArea = document.getElementById('modal-preset-names');
  if (!modalNameInput || !modalNamesArea) return;

  const newName = modalNameInput.value.trim();
  if (!newName) {
    showToast('Please enter a preset name.', 'error');
    return;
  }

  syncPresetModalEntriesFromText();
  const validEntries = presetModalDraftEntries
    .map(entry => ({ name: entry.name.trim(), image: entry.image, weight: getEntryWeight(entry) }))
    .filter(entry => entry.name.length > 0);

  if (validEntries.length === 0) {
    showToast('Add some names before saving a preset.', 'error');
    return;
  }

  presets[newName] = validEntries.map(en => ({ name: en.name, image: en.image, weight: en.weight }));
  activePresetName = newName;

  document.getElementById('save-preset-modal').classList.add('hidden');
  modalNameInput.value = '';
  modalNamesArea.value = '';
  presetModalDraftEntries = [];

  populatePresetsDropdown();
  saveState();
  showToast(`Preset "${newName}" saved!`, 'success');
}

function deletePreset() {
  const dropdown = document.getElementById('preset-select');
  const target = dropdown.value;

  if (target === '__none__') {
    showToast('Cannot delete None.', 'error');
    return;
  }

  if (Object.keys(presets).length <= 1) {
    showToast('At least one preset must remain.', 'error');
    return;
  }

  // Show custom confirmation modal
  document.getElementById('delete-preset-name-display').textContent = `"${target}"`;
  document.getElementById('delete-preset-modal').classList.remove('hidden');
}

function confirmDeletePreset() {
  const dropdown = document.getElementById('preset-select');
  const target = dropdown.value;
  document.getElementById('delete-preset-modal').classList.add('hidden');

  if (target && target !== '__none__') {
    delete presets[target];
  }

  // Choose first preset key or None
  const keys = Object.keys(presets);
  if (keys.length > 0) {
    activePresetName = keys[0];
    nameEntries = toEntries(presets[activePresetName]);
  } else {
    activePresetName = '__none__';
  }

  populatePresetsDropdown();
  updateNamesTextarea();
  saveState();
  drawWheel();
  showToast(`Preset "${target}" deleted.`, 'info');
}

/* ==========================================================================
   File Import & Export
   ========================================================================== */
function importTxtFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const text = evt.target.result;
    const importedNames = text.split(/\r?\n/)
                              .map(n => n.trim())
                              .filter(n => n.length > 0);
    
    if (importedNames.length > 0) {
      nameEntries = importedNames.map(n => ({ name: n, image: null, weight: 1, _imgCache: null }));
      updateNamesTextarea();
      saveState();
      drawWheel();
    } else {
      showToast('No valid names found in file.', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // Reset file input
}

function exportTxtFile() {
  if (nameEntries.length === 0) {
    showToast('Add some names first!', 'error');
    return;
  }
  
  const textContent = getNames().join('\n');
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${activePresetName.replace(/\s+/g, '_')}_names.txt`;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ==========================================================================
   Pointer Animation Control
   ========================================================================== */
function updatePointerWiggle() {
  const pointerEl = document.querySelector('.wheel-pointer');
  if (pointerEl) {
    if (settings.casinoTicker) {
      pointerEl.classList.remove('wiggle-active');
    } else {
      pointerEl.classList.add('wiggle-active');
    }
  }
}

function updateThemeSelectVisibility() {
  const themeContainer = document.getElementById('theme-select-container');
  const customColorsPanel = document.getElementById('custom-theme-colors');
  if (settings.skin === 'classic') {
    themeContainer.classList.remove('hidden');
    if (settings.theme === 'custom') {
      customColorsPanel.classList.remove('hidden');
    } else {
      customColorsPanel.classList.add('hidden');
    }
  } else {
    themeContainer.classList.add('hidden');
    customColorsPanel.classList.add('hidden');
  }
}

/* ==========================================================================
   Initialization & Event Setup
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('wheel-canvas');
  ctx = canvas.getContext('2d');

  // Collapsible accordion headers (with persistence)
  const sidebarSections = document.querySelectorAll('#sidebar > .sidebar-content > .settings-section');
  sidebarSections.forEach((section, idx) => {
    section.querySelector('.section-header').addEventListener('click', () => {
      section.classList.toggle('expanded');
      if (!settings.sidebarSections) settings.sidebarSections = [];
      settings.sidebarSections[idx] = section.classList.contains('expanded');
      saveState();
    });
  });

  // Collapsible sub-section headers (with persistence)
  const sidebarSubSections = document.querySelectorAll('#sidebar > .sidebar-content .sub-section');
  sidebarSubSections.forEach((section, idx) => {
    section.querySelector('.sub-section-header').addEventListener('click', () => {
      section.classList.toggle('expanded');
      if (!settings.sidebarSubSections) settings.sidebarSubSections = [];
      settings.sidebarSubSections[idx] = section.classList.contains('expanded');
      saveState();
    });
  });

  // Load state and cache resources
  loadState();

  // Restore sidebar section expand/collapse state
  if (settings.sidebarSections) {
    sidebarSections.forEach((section, idx) => {
      if (settings.sidebarSections[idx]) {
        section.classList.add('expanded');
      } else {
        section.classList.remove('expanded');
      }
    });
  }
  if (settings.sidebarSubSections) {
    sidebarSubSections.forEach((section, idx) => {
      if (settings.sidebarSubSections[idx]) {
        section.classList.add('expanded');
      } else {
        section.classList.remove('expanded');
      }
    });
  }
  populatePresetsDropdown();
  // If active preset is None, disable delete
  if (!activePresetName || activePresetName === '__none__') {
    const delBtn = document.getElementById('delete-preset-btn');
    if (delBtn) delBtn.disabled = true;
  }
  updateNamesTextarea();
  initConfetti();

  // Populate Skins Dropdown
  const skinSelect = document.getElementById('skin-select');
  skinSelect.innerHTML = '';
  
  const defaultSkin = SKIN_LIST.find(s => s.id === 'classic');
  const otherSkins = SKIN_LIST.filter(s => s.id !== 'classic');
  otherSkins.sort((a, b) => {
    const nameA = a.name.replace(/[^\w\s]/g, '').trim().toLowerCase();
    const nameB = b.name.replace(/[^\w\s]/g, '').trim().toLowerCase();
    return nameA.localeCompare(nameB);
  });
  const sortedSkins = [defaultSkin, ...otherSkins];

  sortedSkins.forEach(skin => {
    const option = document.createElement('option');
    option.value = skin.id;
    option.innerText = skin.name;
    skinSelect.appendChild(option);
  });

  // Populate Winner Sounds Dropdown
  const soundSelect = document.getElementById('sound-winner-type');
  soundSelect.innerHTML = '';
  
  const noneOpt = document.createElement('option');
  noneOpt.value = 'none';
  noneOpt.innerText = '🔇 None';
  soundSelect.appendChild(noneOpt);

  const randomOpt = document.createElement('option');
  randomOpt.value = 'random';
  randomOpt.innerText = '🔀 Random Sound';
  soundSelect.appendChild(randomOpt);

  const sortedSounds = [...SOUND_LIST].sort((a, b) => {
    const nameA = a.name.replace(/[^\w\s]/g, '').trim().toLowerCase();
    const nameB = b.name.replace(/[^\w\s]/g, '').trim().toLowerCase();
    return nameA.localeCompare(nameB);
  });

  sortedSounds.forEach(sound => {
    const option = document.createElement('option');
    option.value = sound.id;
    option.innerText = sound.name;
    soundSelect.appendChild(option);
  });

  // Resize canvas handler
  window.addEventListener('resize', () => {
    drawWheel();
  });

  // Draw initial wheel
  drawWheel();

  /* Set input UI elements according to settings */
  document.getElementById('theme-select').value = settings.theme;
  document.getElementById('skin-select').value = settings.skin || 'classic';
  updateThemeSelectVisibility();
  document.getElementById('sound-spin-tick').checked = settings.soundSpinTick;
  document.getElementById('sound-winner-type').value = settings.soundWinnerType;
  document.getElementById('volume-slider').value = settings.volume;
  document.getElementById('timer-enabled').checked = settings.timerEnabled;
  if (settings.timerEnabled) {
    document.getElementById('timer-settings-details').classList.remove('hidden');
  }
  document.getElementById('timer-min').value = String(settings.timerMin !== undefined ? settings.timerMin : 1).padStart(2, '0');
  document.getElementById('timer-sec').value = String(settings.timerSec !== undefined ? settings.timerSec : 0).padStart(2, '0');
  document.getElementById('timer-autostart').checked = settings.timerAutostart !== undefined ? settings.timerAutostart : true;
  document.getElementById('timer-sound').checked = settings.timerSound;
  document.getElementById('timer-sound-type').value = settings.timerSoundType || 'beep1.mp3';
  document.getElementById('show-boundaries').checked = settings.showBoundaries || false;
  document.getElementById('casino-ticker').checked = settings.casinoTicker || false;
  updatePointerWiggle();

  /* Core Interactive Events */
  document.getElementById('center-spin-trigger').addEventListener('click', spin);
  canvas.addEventListener('click', () => {
    if (!isSpinning) spin();
  });

  // Listen to spacebar to spin the wheel
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
      e.preventDefault();
      spin();
    }
  });

  // Names Textarea
  document.getElementById('names-input').addEventListener('input', handleNameInputChange);

  // Import / Export Name files
  document.getElementById('import-file').addEventListener('change', importTxtFile);
  document.getElementById('export-file-btn').addEventListener('click', exportTxtFile);

  // Presets load & action buttons
  document.getElementById('preset-select').addEventListener('change', loadSelectedPreset);
  // save-preset-btn opens a modal with names & media list
  document.getElementById('save-preset-btn').addEventListener('click', () => {
    const modal = document.getElementById('save-preset-modal');
    const modalNames = document.getElementById('modal-preset-names');
    const modalName = document.getElementById('modal-preset-name');
    // Prefill with current names and current media state
    presetModalDraftEntries = nameEntries.map(entry => ({
      name: entry.name,
      image: entry.image,
      weight: getEntryWeight(entry),
      _imgCache: null
    }));
    modalNames.value = getNames().join('\n');
    modalName.value = '';
    renderPresetNamesList();
    modal.classList.remove('hidden');
    setTimeout(() => modalName.focus(), 50);
  });
  document.getElementById('modal-preset-names').addEventListener('input', () => {
    syncPresetModalEntriesFromText();
    renderPresetNamesList();
  });
  document.getElementById('modal-confirm-save-preset-btn').addEventListener('click', saveNewPreset);
  document.getElementById('modal-cancel-save-preset-btn').addEventListener('click', () => {
    document.getElementById('save-preset-modal').classList.add('hidden');
  });
  document.getElementById('add-name-btn').addEventListener('click', () => {
    nameEntries.push({ name: 'New Name', image: null, weight: 1, _imgCache: null });
    updateNamesTextarea();
    saveState();
    drawWheel();
    setTimeout(() => {
      const lastInput = document.querySelector('#names-list .name-row:last-child .name-input');
      if (lastInput) lastInput.focus();
    }, 0);
  });

  // Names list actions for main entries
  document.getElementById('names-list').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const idx = parseInt(btn.dataset.index, 10);
    if (isNaN(idx)) return;

    if (action === 'delete') {
      nameEntries.splice(idx, 1);
      updateNamesTextarea();
      saveState();
      drawWheel();
      return;
    }

    if (action === 'media') {
      openMediaModalForIndex(idx, 'main');
    }
  });
  // Preset modal names list media button delegation
  document.getElementById('modal-preset-names-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.entry-media-btn');
    if (!btn) return;
    const idx = parseInt(btn.dataset.index, 10);
    if (isNaN(idx)) return;
    openMediaModalForIndex(idx, 'preset');
  });

  // Media modal buttons
  document.getElementById('media-save-btn').addEventListener('click', saveMediaFromModal);
  document.getElementById('media-delete-btn').addEventListener('click', deleteMediaFromModal);
  document.getElementById('media-cancel-btn').addEventListener('click', closeMediaModal);
  document.getElementById('media-file-input').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const preview = document.getElementById('media-preview');
      if (!preview) return;
      preview.classList.add('has-image');
      preview.style.backgroundImage = `url(${evt.target.result})`;
    };
    reader.readAsDataURL(file);
  });
  document.getElementById('delete-preset-btn').addEventListener('click', deletePreset);
  document.getElementById('confirm-delete-preset-btn').addEventListener('click', confirmDeletePreset);
  document.getElementById('cancel-delete-preset-btn').addEventListener('click', () => {
    document.getElementById('delete-preset-modal').classList.add('hidden');
  });

  // Theme dropdown select
  document.getElementById('theme-select').addEventListener('change', (e) => {
    settings.theme = e.target.value;
    updateThemeSelectVisibility();
    saveState();
    drawWheel();
  });

  // Custom colors text input
  document.getElementById('custom-colors-input').addEventListener('input', (e) => {
    const rawVal = e.target.value;
    const parsedColors = rawVal.split(',')
                               .map(c => c.trim())
                               .filter(c => /^#[0-9A-F]{6}$/i.test(c));
    
    if (parsedColors.length >= 2) {
      settings.customColors = parsedColors;
      saveState();
      drawWheel();
    }
  });

  // Show segment boundaries checkbox
  document.getElementById('show-boundaries').addEventListener('change', (e) => {
    settings.showBoundaries = e.target.checked;
    saveState();
    drawWheel();
  });

  // Casino pegs & physics checkbox
  document.getElementById('casino-ticker').addEventListener('change', (e) => {
    settings.casinoTicker = e.target.checked;
    updatePointerWiggle();
    saveState();
    drawWheel();
  });

  // Sounds settings changes
  document.getElementById('sound-spin-tick').addEventListener('change', (e) => {
    settings.soundSpinTick = e.target.checked;
    saveState();
  });
  document.getElementById('sound-winner-type').addEventListener('change', (e) => {
    settings.soundWinnerType = e.target.value;
    saveState();
    resumeAudioCtxOnGesture();
    playWinnerSound();
  });
  document.getElementById('volume-slider').addEventListener('input', (e) => {
    settings.volume = parseFloat(e.target.value);
    saveState();
  });
  document.getElementById('volume-slider').addEventListener('change', (e) => {
    resumeAudioCtxOnGesture();
    playWinnerSound();
  });

  // Skin settings changes
  document.getElementById('skin-select').addEventListener('change', (e) => {
    settings.skin = e.target.value;
    updateThemeSelectVisibility();
    saveState();
    drawWheel();
  });

  // Timer settings changes
  document.getElementById('timer-enabled').addEventListener('change', (e) => {
    settings.timerEnabled = e.target.checked;
    const details = document.getElementById('timer-settings-details');
    if (settings.timerEnabled) {
      details.classList.remove('hidden');
    } else {
      details.classList.add('hidden');
    }
    saveState();
  });
  document.getElementById('timer-min').addEventListener('change', (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 0) val = 0;
    e.target.value = String(val).padStart(2, '0');
    settings.timerMin = val;
    saveState();
  });
  document.getElementById('timer-min').addEventListener('blur', (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 0) val = 0;
    e.target.value = String(val).padStart(2, '0');
  });
  document.getElementById('timer-sec').addEventListener('change', (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 0) val = 0;
    if (val > 59) val = 59;
    e.target.value = String(val).padStart(2, '0');
    settings.timerSec = val;
    saveState();
  });
  document.getElementById('timer-sec').addEventListener('blur', (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 0) val = 0;
    if (val > 59) val = 59;
    e.target.value = String(val).padStart(2, '0');
  });
  document.getElementById('timer-autostart').addEventListener('change', (e) => {
    settings.timerAutostart = e.target.checked;
    saveState();
  });
  document.getElementById('timer-sound').addEventListener('change', (e) => {
    settings.timerSound = e.target.checked;
    saveState();
  });
  document.getElementById('timer-sound-type').addEventListener('change', (e) => {
    settings.timerSoundType = e.target.value;
    saveState();
    // Play a preview of the selected warning sound
    playAudioFile(e.target.value, settings.volume);
  });

  // Winner Modal buttons
  document.getElementById('modal-close-btn').addEventListener('click', hideWinnerModal);
  document.getElementById('modal-remove-btn').addEventListener('click', () => {
    // Remove the winner from our active list
    if (lastWinnerSelected) {
      const idx = nameEntries.findIndex(e => e.name === lastWinnerSelected);
      if (idx !== -1) {
        nameEntries.splice(idx, 1);
        updateNamesTextarea();
        saveState();
        drawWheel();
      }
    }
    hideWinnerModal();
  });

  // Timer Modal buttons
  document.getElementById('start-timer-btn').addEventListener('click', () => {
    document.getElementById('start-timer-btn').style.display = 'none';
    runTimerCountdown(lastWinnerSelected);
  });
  document.getElementById('skip-timer-btn').addEventListener('click', skipTimer);

  // Sidebar toggles for mobile view
  const sidebar = document.getElementById('sidebar');
  document.getElementById('open-sidebar-btn').addEventListener('click', () => {
    sidebar.classList.remove('collapsed');
  });
  document.getElementById('close-sidebar-btn').addEventListener('click', () => {
    sidebar.classList.add('collapsed');
  });

  // Click outside sidebar on mobile to close it
  window.addEventListener('click', (e) => {
    if (window.innerWidth <= 900) {
      const openBtn = document.getElementById('open-sidebar-btn');
      if (!sidebar.contains(e.target) && e.target !== openBtn && !sidebar.classList.contains('collapsed')) {
        sidebar.classList.add('collapsed');
      }
    }
  });

  // Keyboard shortcut listener to test audio context trigger
  window.addEventListener('click', () => {
    resumeAudioCtxOnGesture();
  }, { once: true });
});
