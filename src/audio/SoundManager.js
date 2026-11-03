const AUDIO_FILES = {
  engine: '/audio/engine-loop.wav',
  countdown: '/audio/countdown.wav',
  lap: '/audio/lap-chime.wav',
  finish: '/audio/finish-fanfare.wav',
  collision: '/audio/collision.wav',
};

const EFFECT_VOLUME = {
  countdown: 0.42,
  lap: 0.48,
  finish: 0.5,
  collision: 0.36,
};

export class SoundManager {
  constructor() {
    this.initialized = false;
    this.engineAudio = null;
    this.effects = {};
    this.engineVolume = 0;
    this.lastCollisionAt = -Infinity;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    if (typeof Audio === 'undefined') return;

    this.engineAudio = new Audio(AUDIO_FILES.engine);
    this.engineAudio.loop = true;
    this.engineAudio.preload = 'auto';
    this.engineAudio.volume = 0;

    for (const [name, source] of Object.entries(AUDIO_FILES)) {
      if (name === 'engine') continue;

      const audio = new Audio(source);
      audio.preload = 'auto';
      audio.volume = EFFECT_VOLUME[name];
      this.effects[name] = audio;
    }
  }

  ensureReady() {
    if (!this.initialized) this.init();
    if (!this.engineAudio || !this.engineAudio.paused) return;

    this.engineAudio.play().catch(error => {
      console.warn('Unable to start the VELOCITY engine sound:', error);
    });
  }

  playEffect(name) {
    const audio = this.effects[name];
    if (!audio) return;

    audio.currentTime = 0;
    audio.play().catch(error => {
      console.warn(`Unable to play the VELOCITY ${name} sound:`, error);
    });
  }

  playCountdownTone() {
    this.playEffect('countdown');
  }

  playLapTone() {
    this.playEffect('lap');
  }

  playFinishTone() {
    this.playEffect('finish');
  }

  playCollisionTone() {
    const now = performance.now();
    if (now - this.lastCollisionAt < 350) return;

    this.lastCollisionAt = now;
    this.playEffect('collision');
  }

  setEngineState(speed = 0, throttle = false, active = true) {
    if (!this.engineAudio) return;

    const speedRatio = Math.min(Math.abs(speed) / 42, 1);
    const targetVolume = active
      ? 0.08 + speedRatio * 0.13 + (throttle ? 0.12 : 0)
      : 0;

    this.engineVolume += (targetVolume - this.engineVolume) * 0.12;
    this.engineAudio.volume = Math.min(this.engineVolume, 0.36);
    this.engineAudio.playbackRate = 0.82 + speedRatio * 0.72;
  }

  dispose() {
    const sounds = [this.engineAudio, ...Object.values(this.effects)];

    sounds.forEach(audio => {
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    });
  }
}
