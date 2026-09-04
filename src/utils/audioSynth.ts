/**
 * Web Audio API based ambient night soundscape synthesizer
 * 100% client-side, zero external asset dependencies, zero latency
 */

class NightAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  // Track nodes & gains
  private activeNodes: Record<string, { gain: GainNode; stop: () => void }> = {};

  private isMuted: boolean = false;
  private timerId: NodeJS.Timeout | null = null;
  private timerRemainingSeconds: number | null = null;
  private timerCallback?: () => void;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Create White/Pink/Brown noise buffer
  private createNoiseBuffer(type: 'white' | 'pink' | 'brown' = 'white', duration = 5): AudioBuffer {
    this.initContext();
    const bufferSize = this.ctx!.sampleRate * duration;
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain boost
      }
    }
    return buffer;
  }

  // 1. Rain Synthesizer
  private startRain(volume: number) {
    this.initContext();
    const ctx = this.ctx!;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);

    // Pink noise base for rainfall
    const noiseBuffer = this.createNoiseBuffer('pink', 4);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter for gentle rain
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1400, ctx.currentTime);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(250, ctx.currentTime);

    noiseSource.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(this.masterGain!);

    noiseSource.start();

    // Occasional gentle raindrop impacts
    let dropletTimer: number | null = null;
    const playDroplet = () => {
      if (!this.activeNodes['rain']) return;
      const dropOsc = ctx.createOscillator();
      const dropGain = ctx.createGain();
      dropOsc.type = 'sine';
      const freq = 1200 + Math.random() * 1000;
      dropOsc.frequency.setValueAtTime(freq, ctx.currentTime);
      dropOsc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);

      dropGain.gain.setValueAtTime(0.02 * volume, ctx.currentTime);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

      dropOsc.connect(dropGain);
      dropGain.connect(gainNode);
      dropOsc.start();
      dropOsc.stop(ctx.currentTime + 0.09);

      dropletTimer = window.setTimeout(playDroplet, 200 + Math.random() * 800);
    };
    playDroplet();

    return {
      gain: gainNode,
      stop: () => {
        if (dropletTimer) clearTimeout(dropletTimer);
        try {
          noiseSource.stop();
          noiseSource.disconnect();
          gainNode.disconnect();
        } catch {
          // ignore
        }
      },
    };
  }

  // 2. Ocean Waves Synthesizer
  private startWaves(volume: number) {
    this.initContext();
    const ctx = this.ctx!;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);

    const noiseBuffer = this.createNoiseBuffer('brown', 6);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter with LFO modulation to simulate ebb and flow of tidal waves
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    // LFO for wave modulation
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec wave period

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(320, ctx.currentTime);

    lfo.connect(filter.frequency);

    // Sub wave gain modulation
    const waveGainLfo = ctx.createOscillator();
    waveGainLfo.type = 'sine';
    waveGainLfo.frequency.setValueAtTime(0.12, ctx.currentTime);
    const waveAmpGain = ctx.createGain();
    waveAmpGain.gain.setValueAtTime(0.3, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain!);

    noiseSource.start();
    lfo.start();
    waveGainLfo.start();

    return {
      gain: gainNode,
      stop: () => {
        try {
          noiseSource.stop();
          lfo.stop();
          waveGainLfo.stop();
          gainNode.disconnect();
        } catch {}
      },
    };
  }

  // 3. 432Hz & 528Hz Healing Sleep Drone
  private startFrequencies(volume: number) {
    this.initContext();
    const ctx = this.ctx!;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.25, ctx.currentTime);

    const freqs = [
      { f: 432, pan: -0.3, type: 'sine' as OscillatorType },
      { f: 434, pan: 0.3, type: 'sine' as OscillatorType }, // 2Hz Delta wave binaural beat
      { f: 216, pan: 0, type: 'sine' as OscillatorType }, // Sub octave
      { f: 528, pan: 0.2, type: 'triangle' as OscillatorType }, // Solfeggio 528Hz love tone
    ];

    const oscs: OscillatorNode[] = [];

    freqs.forEach((item) => {
      const osc = ctx.createOscillator();
      osc.type = item.type;
      osc.frequency.setValueAtTime(item.f, ctx.currentTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(item.f === 528 ? 0.08 : 0.2, ctx.currentTime);

      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (panner) {
        panner.pan.setValueAtTime(item.pan, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(panner);
        panner.connect(gainNode);
      } else {
        osc.connect(oscGain);
        oscGain.connect(gainNode);
      }

      osc.start();
      oscs.push(osc);
    });

    gainNode.connect(this.masterGain!);

    return {
      gain: gainNode,
      stop: () => {
        oscs.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        gainNode.disconnect();
      },
    };
  }

  // 4. Night Forest & Crickets
  private startCrickets(volume: number) {
    this.initContext();
    const ctx = this.ctx!;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.35, ctx.currentTime);

    // Subtle night wind
    const noiseBuffer = this.createNoiseBuffer('pink', 4);
    const windSource = ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(600, ctx.currentTime);
    windFilter.Q.setValueAtTime(2.0, ctx.currentTime);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.08, ctx.currentTime);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(gainNode);
    windSource.start();

    // Rhythmic Cricket chirps
    let cricketTimer: number | null = null;
    const playCricketChirp = () => {
      if (!this.activeNodes['crickets']) return;
      const chirpCount = 3 + Math.floor(Math.random() * 4);
      const startTime = ctx.currentTime;
      const baseFreq = 4200 + Math.random() * 600;

      for (let i = 0; i < chirpCount; i++) {
        const osc = ctx.createOscillator();
        const cGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, startTime + i * 0.05);

        cGain.gain.setValueAtTime(0, startTime + i * 0.05);
        cGain.gain.linearRampToValueAtTime(0.02 * volume, startTime + i * 0.05 + 0.015);
        cGain.gain.linearRampToValueAtTime(0, startTime + i * 0.05 + 0.035);

        osc.connect(cGain);
        cGain.connect(gainNode);

        osc.start(startTime + i * 0.05);
        osc.stop(startTime + i * 0.05 + 0.04);
      }

      cricketTimer = window.setTimeout(playCricketChirp, 1000 + Math.random() * 2500);
    };
    playCricketChirp();

    gainNode.connect(this.masterGain!);

    return {
      gain: gainNode,
      stop: () => {
        if (cricketTimer) clearTimeout(cricketTimer);
        try {
          windSource.stop();
          gainNode.disconnect();
        } catch {}
      },
    };
  }

  // 5. Fireplace Crackle
  private startFireplace(volume: number) {
    this.initContext();
    const ctx = this.ctx!;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.45, ctx.currentTime);

    // Warm base rumble
    const noiseBuffer = this.createNoiseBuffer('brown', 4);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(300, ctx.currentTime);

    noiseSource.connect(lowpass);
    lowpass.connect(gainNode);
    noiseSource.start();

    // Crackle pops
    let crackleTimer: number | null = null;
    const playCrackle = () => {
      if (!this.activeNodes['fireplace']) return;
      const osc = ctx.createOscillator();
      const pGain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(300 + Math.random() * 800, ctx.currentTime);

      pGain.gain.setValueAtTime(0.04 * volume, ctx.currentTime);
      pGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

      osc.connect(pGain);
      pGain.connect(gainNode);
      osc.start();
      osc.stop(ctx.currentTime + 0.035);

      crackleTimer = window.setTimeout(playCrackle, 50 + Math.random() * 350);
    };
    playCrackle();

    gainNode.connect(this.masterGain!);

    return {
      gain: gainNode,
      stop: () => {
        if (crackleTimer) clearTimeout(crackleTimer);
        try {
          noiseSource.stop();
          gainNode.disconnect();
        } catch {}
      },
    };
  }

  // 6. Music Box / Pentatonic Chimes
  private startMusicBox(volume: number) {
    this.initContext();
    const ctx = this.ctx!;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.35, ctx.currentTime);

    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66]; // C pentatonic
    let chimeTimer: number | null = null;

    const playChimeNote = () => {
      if (!this.activeNodes['musicbox']) return;
      const note = scale[Math.floor(Math.random() * scale.length)];
      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, ctx.currentTime);
      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(note * 2, ctx.currentTime);

      noteGain.gain.setValueAtTime(0, ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.08 * volume, ctx.currentTime + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

      osc.connect(noteGain);
      oscHarmonic.connect(noteGain);
      noteGain.connect(gainNode);

      osc.start();
      oscHarmonic.start();
      osc.stop(ctx.currentTime + 2.6);
      oscHarmonic.stop(ctx.currentTime + 2.6);

      chimeTimer = window.setTimeout(playChimeNote, 1200 + Math.random() * 2200);
    };
    playChimeNote();

    gainNode.connect(this.masterGain!);

    return {
      gain: gainNode,
      stop: () => {
        if (chimeTimer) clearTimeout(chimeTimer);
        gainNode.disconnect();
      },
    };
  }

  // Public control APIs
  public toggleTrack(id: string, volume: number, play: boolean) {
    this.initContext();

    if (!play) {
      if (this.activeNodes[id]) {
        this.activeNodes[id].stop();
        delete this.activeNodes[id];
      }
      return;
    }

    if (this.activeNodes[id]) {
      this.activeNodes[id].gain.gain.setValueAtTime(volume, this.ctx!.currentTime);
      return;
    }

    let node: { gain: GainNode; stop: () => void } | null = null;
    switch (id) {
      case 'rain':
        node = this.startRain(volume);
        break;
      case 'waves':
        node = this.startWaves(volume);
        break;
      case 'frequencies':
        node = this.startFrequencies(volume);
        break;
      case 'crickets':
        node = this.startCrickets(volume);
        break;
      case 'fireplace':
        node = this.startFireplace(volume);
        break;
      case 'musicbox':
        node = this.startMusicBox(volume);
        break;
    }

    if (node) {
      this.activeNodes[id] = node;
    }
  }

  public setTrackVolume(id: string, volume: number) {
    if (this.activeNodes[id] && this.ctx) {
      this.activeNodes[id].gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }

  public setMasterVolume(vol: number) {
    this.initContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : vol, this.ctx.currentTime);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.setMasterVolume(this.isMuted ? 0 : 0.7);
    return this.isMuted;
  }

  public stopAll() {
    Object.keys(this.activeNodes).forEach((id) => {
      this.activeNodes[id].stop();
      delete this.activeNodes[id];
    });
  }

  // Play a gentle magical bell chime (for ritual release)
  public playReleaseBell(type: 'stardust' | 'lantern' | 'waves' | 'candle' | 'bubbles' = 'stardust') {
    this.initContext();
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    const chords = [523.25, 659.25, 783.99, 1046.5]; // C major celestial
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 2.8);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 3.0);
    });
  }

  // Play a warm, peaceful wish chime for tomorrow's hope (528Hz Solfeggio / warm bell)
  public playWishChime() {
    this.initContext();
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    // Harmonic frequencies: 528Hz (transformation/peace), 660Hz (E5), 792Hz (G5), 1056Hz
    const freqs = [528, 660, 792, 1056];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.05 / (idx + 1), now + idx * 0.06 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 3.5);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 3.8);
    });
  }

  // Play gentle breathing cue sound
  public playBreathCue(type: 'inhale' | 'hold' | 'exhale') {
    this.initContext();
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'inhale') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 1.2);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    } else if (type === 'hold') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    } else {
      // Exhale
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 1.8);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.02, now + 1.0);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 2.0);
    }

    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(now);
    osc.stop(now + 2.2);
  }

  // Sleep Timer with smooth fade out
  public setSleepTimer(minutes: number, onComplete?: () => void) {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (minutes <= 0) {
      this.timerRemainingSeconds = null;
      return;
    }

    this.timerRemainingSeconds = minutes * 60;
    this.timerCallback = onComplete;

    this.timerId = setInterval(() => {
      if (this.timerRemainingSeconds !== null) {
        this.timerRemainingSeconds--;
        // If last 30 seconds, fade out master volume
        if (this.timerRemainingSeconds <= 30 && this.masterGain && this.ctx) {
          const fadeFraction = Math.max(0, this.timerRemainingSeconds / 30);
          this.masterGain.gain.setValueAtTime(0.7 * fadeFraction, this.ctx.currentTime);
        }

        if (this.timerRemainingSeconds <= 0) {
          this.stopAll();
          if (this.timerId) clearInterval(this.timerId);
          this.timerId = null;
          this.timerRemainingSeconds = null;
          if (this.timerCallback) this.timerCallback();
        }
      }
    }, 1000);
  }

  public getTimerRemaining(): number | null {
    return this.timerRemainingSeconds;
  }
}

export const audioSynth = new NightAudioSynthesizer();
