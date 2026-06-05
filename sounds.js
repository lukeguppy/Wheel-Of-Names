/**
 * NameWheel - Sound File Engine
 * Powered by high-quality pre-recorded audio assets.
 */

const SOUND_LIST = [
  // Normal / Classic
  { id: 'chime1', name: '✨ Sweet Chime', category: 'Normal' },
  { id: 'chime2', name: '🔔 Resonant Bell', category: 'Normal' },
  { id: 'chime3', name: '✨ Digital Chime', category: 'Normal' },
  { id: 'chime4', name: '🔔 Soft Chime', category: 'Normal' },
  { id: 'chime5', name: '🌟 Celestial Sweep', category: 'Normal' },
  { id: 'bling1', name: '💎 Classic Bling', category: 'Normal' },
  { id: 'bling2', name: '🪙 Quick Shine', category: 'Normal' },
  { id: 'bling3', name: '✨ Tiny Sparkle', category: 'Normal' },
  { id: 'bling4', name: '💎 Golden Harp', category: 'Normal' },
  { id: 'bling5', name: '🪙 Retro Ring', category: 'Normal' },
  { id: 'resonance1', name: '🏮 Deep Gong', category: 'Normal' },
  { id: 'resonance2', name: '🏮 Metallic Gong', category: 'Normal' },

  // Celebration
  { id: 'fanfare1', name: '🎺 Victory Fanfare', category: 'Celebration' },
  { id: 'fanfare2', name: '🎺 Grand Triumph', category: 'Celebration' },
  { id: 'jingle1', name: '🎉 Happy Jingle', category: 'Celebration' },
  { id: 'jingle2', name: '🎉 Celebration Up', category: 'Celebration' },
  { id: 'jingle3', name: '🏆 Ultimate Winner', category: 'Celebration' },
  { id: 'laugh1', name: '😆 Giggle Burst', category: 'Celebration' },
  { id: 'laugh2', name: '😂 Hearty Laugh', category: 'Celebration' },

  // Retro / Game
  { id: 'beep1', name: '🔌 Digital Beep', category: 'Retro' },
  { id: 'beep2', name: '🤖 Robot Pulse', category: 'Retro' },
  { id: 'beep3', name: '🔫 Laser Shot', category: 'Retro' },
  { id: 'beep4', name: '🪙 Coin Collect', category: 'Retro' },
  { id: 'beep5', name: '🏃‍♂️ Power Jump', category: 'Retro' },
  { id: 'beep6', name: '🔌 8-Bit Alert', category: 'Retro' },
  { id: 'scale1', name: '🔋 Power Up Rise', category: 'Retro' },
  { id: 'scale2', name: '🔋 Level Up', category: 'Retro' },
  { id: 'scale3', name: '💀 Game Over Slide', category: 'Retro' },
  { id: 'cannon1', name: '💥 Cannon Blast', category: 'Retro' },
  { id: 'cannon2', name: '💥 Heavy Impact', category: 'Retro' },

  // Funny
  { id: 'slide1', name: '🌀 Whistle Slide', category: 'Funny' },
  { id: 'slide2', name: '🛷 Pitch Slide Down', category: 'Funny' },
  { id: 'slide3', name: '🌀 Spiral Rise', category: 'Funny' },
  { id: 'slide4', name: '🌀 Slip & Slide', category: 'Funny' },
  { id: 'slide5', name: '🤪 Cartoon Boing', category: 'Funny' },
  { id: 'slide6', name: '🤪 Spring Bounce', category: 'Funny' },
  { id: 'punch1', name: '🥊 Comic Punch', category: 'Funny' },
  { id: 'punch2', name: '🥊 Quick Slap', category: 'Funny' },
  { id: 'punch3', name: '🥊 Heavy Smack', category: 'Funny' },
  { id: 'splash1', name: '💧 Water Splash', category: 'Funny' },
  { id: 'splash2', name: '💧 Drip Drop', category: 'Funny' },

  // Alerts
  { id: 'alarm1', name: '🚨 Modulated Siren', category: 'Alerts' },
  { id: 'alarm2', name: '⏱️ Fast Ticking', category: 'Alerts' },
  { id: 'alarm3', name: '☎️ Classic Ring', category: 'Alerts' },
  { id: 'alarm4', name: '🚨 Retro Buzzer', category: 'Alerts' },
  { id: 'error1', name: '❌ Game Buzzer', category: 'Alerts' },
  { id: 'error2', name: '❌ Error Alert', category: 'Alerts' },
  { id: 'error3', name: '⚠️ Warning Horn', category: 'Alerts' },
  { id: 'error4', name: '⚠️ Fail Sweep', category: 'Alerts' }
];

const audioCache = {};

function playAudioFile(fileName, volume) {
  const path = "sounds/" + fileName;
  if (!audioCache[path]) {
    audioCache[path] = new Audio(path);
  }
  try {
    const sound = audioCache[path].cloneNode();
    sound.volume = volume;
    sound.play().catch(err => console.warn("Audio playback blocked or failed:", err));
  } catch (e) {
    console.error("Error playing audio file:", e);
  }
}

function playSynthesizedSound(id, volume, audioCtx) {
  // Map old synthesized IDs to new high-quality files for backwards compatibility
  const map = {
    ding: 'chime3.mp3',
    chimes: 'chime1.mp3',
    gong: 'resonance1.mp3',
    double_ding: 'chime4.mp3',
    triumphant: 'scale1.mp3',
    fanfare: 'fanfare1.mp3',
    drumroll: 'jingle1.mp3',
    sonar: 'chime5.mp3',
    clock_tock: 'click1.wav',
    phone_ring: 'alarm3.mp3',
    boing: 'slide5.mp3',
    fart: 'slide4.mp3',
    sad_trombone: 'scale3.mp3',
    slip: 'slide4.mp3',
    howl: 'whoosh2.mp3',
    meow: 'slide1.mp3',
    moo: 'slide2.mp3',
    drip: 'splash2.mp3',
    slide: 'slide2.mp3',
    siren: 'alarm1.mp3',
    buzzer: 'alarm4.mp3',
    wind: 'whoosh2.mp3',
    laser: 'beep3.mp3',
    coin: 'beep4.mp3',
    jump: 'beep5.mp3',
    power_up: 'scale2.mp3',
    game_over: 'scale3.mp3',
    alien: 'beep2.mp3',
    explosion: 'cannon1.mp3',
    whistle: 'slide1.mp3',
    whip: 'whoosh1.mp3',
    heartbeat: 'cannon2.mp3'
  };

  const file = map[id] || (id.indexOf('.') !== -1 ? id : id + '.mp3');
  playAudioFile(file, volume);
}
