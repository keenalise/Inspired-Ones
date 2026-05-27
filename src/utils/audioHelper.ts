/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private fluteOsc: OscillatorNode | null = null;
  private fluteGain: GainNode | null = null;
  private fluteFilter: BiquadFilterNode | null = null;
  private fluteNoiseGain: GainNode | null = null;
  private sarangiOsc: OscillatorNode | null = null;
  private sarangiGain: GainNode | null = null;
  private sarangiFilter: BiquadFilterNode | null = null;

  constructor() {
    // Lazy initialized on user gesture to obey browser security rules
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  getAudioContext(): AudioContext | null {
    this.init();
    return this.ctx;
  }

  /**
   * Procedural synthesis of a Madal Dhum strike (Deep Bass Boom)
   */
  playMadalDhum() {
    // Try playing a sample from the assets folder first (falls back to synth)
    try {
      // Map to left-side bols: Ghin (dhing) and Kha/naa as fallback
      const candidates = [
        "../../assets/536027__pbimal__maadal-02-dhing.wav", // dhing ~= ghin (resonant open left)
        "../../assets/536025__pbimal__maadal-02-naa.wav",  // naa ~= closed left (kha)
      ];
      for (const rel of candidates) {
        try {
          const url = new URL(rel, import.meta.url).href;
          const audio = new Audio(url);
          audio.preload = "auto";
          const p = audio.play();
          if (p && typeof p.then === "function") p.catch(() => {});
          return;
        } catch (e) {
          // ignore and try next candidate
        }
      }
    } catch (e) {
      // continue to synth fallback
    }

    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Sub-bass oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sine";
    // Pitch sweep downwards mimicking structural tension slide
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(1.0, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    // Dynamic lowpass filter to add warm rounded punch
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    // Subtle noise slap for the leather strike transient
    const noiseNode = this.createNoiseNode();
    const noiseGain = this.ctx.createGain();
    const noiseFilter = this.ctx.createBiquadFilter();

    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(300, now);
    noiseFilter.Q.setValueAtTime(3, now);

    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    if (noiseNode) {
      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noiseNode.start(now);
      noiseNode.stop(now + 0.05);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /**
   * Procedural synthesis of a Madal Tehel strike (Sharp Metallic Ring)
   */
  playMadalTehel() {
    // Try playing a sample from the assets folder first (falls back to synth)
    try {
      // Map to right-side bols: Taang (open right) and Taak (closed right)
      const candidates = [
        "../../assets/536028__pbimal__maadal-02-taang.wav", // taang (sharp open right)
        "../../assets/536024__pbimal__maadal-02-taak.wav",  // taak (closed right)
        "../../assets/536026__pbimal__maadal-02-khat.wav",  // khat (alternate)
      ];
      for (const rel of candidates) {
        try {
          const url = new URL(rel, import.meta.url).href;
          const audio = new Audio(url);
          audio.preload = "auto";
          const p = audio.play();
          if (p && typeof p.then === "function") p.catch(() => {});
          return;
        } catch (e) {
          // ignore and try next candidate
        }
      }
    } catch (e) {
      // continue to synth fallback
    }

    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Treble tone oscillator (ringing high frequency)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(420, now + 0.04);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.7, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    // Over-ring harmoniser for Khari paste chime
    const resonanceOsc = this.ctx.createOscillator();
    const resonanceGain = this.ctx.createGain();
    resonanceOsc.type = "sine";
    resonanceOsc.frequency.setValueAtTime(1185, now); // Metallic dish harmonic
    resonanceGain.gain.setValueAtTime(0.001, now);
    resonanceGain.gain.linearRampToValueAtTime(0.35, now + 0.005);
    resonanceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    // Mid-high snap noise frame
    const noiseNode = this.createNoiseNode();
    const noiseFilter = this.ctx.createBiquadFilter();
    const noiseGain = this.ctx.createGain();

    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(2200, now);
    noiseFilter.Q.setValueAtTime(5, now);
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    if (noiseNode) {
      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noiseNode.start(now);
      noiseNode.stop(now + 0.04);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    resonanceOsc.connect(resonanceGain);
    resonanceGain.connect(this.ctx.destination);

    osc.start(now);
    resonanceOsc.start(now);

    osc.stop(now + 0.25);
    resonanceOsc.stop(now + 0.25);
  }

  /**
   * Start flute sound generation
   */
  startFlute() {
    this.init();
    if (!this.ctx || this.fluteOsc) return;

    const now = this.ctx.currentTime;

    // Flute tone oscillator
    this.fluteOsc = this.ctx.createOscillator();
    // Warm round triangle combined with soft lowpass
    this.fluteOsc.type = "triangle";
    this.fluteOsc.frequency.setValueAtTime(587.33, now); // Default D5

    // Multi-staged vibrato parameters
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    vibrato.frequency.setValueAtTime(5.8, now); // Vocal tremble rate
    vibratoGain.gain.setValueAtTime(5.2, now); // Tone width deflection

    vibrato.connect(vibratoGain);
    vibratoGain.connect(this.fluteOsc.frequency);
    vibrato.start(now);

    // Flute gain node
    this.fluteGain = this.ctx.createGain();
    this.fluteGain.gain.setValueAtTime(0.0, now);

    // Warm wood body low-pass filter
    this.fluteFilter = this.ctx.createBiquadFilter();
    this.fluteFilter.type = "lowpass";
    this.fluteFilter.frequency.setValueAtTime(1400, now);

    // Soft breath noise overlay
    const noiseNode = this.createNoiseNode();
    const breathFilter = this.ctx.createBiquadFilter();
    this.fluteNoiseGain = this.ctx.createGain();

    breathFilter.type = "bandpass";
    breathFilter.frequency.setValueAtTime(1800, now);
    breathFilter.Q.setValueAtTime(1.5, now);
    this.fluteNoiseGain.gain.setValueAtTime(0.0, now);

    if (noiseNode) {
      noiseNode.connect(breathFilter);
      breathFilter.connect(this.fluteNoiseGain);
      this.fluteNoiseGain.connect(this.ctx.destination);
      noiseNode.start(now);
      // Continuous noise node, won't stop until voice shuts down mapping
    }

    this.fluteOsc.connect(this.fluteFilter);
    this.fluteFilter.connect(this.fluteGain);
    this.fluteGain.connect(this.ctx.destination);

    this.fluteOsc.start(now);
  }

  setFluteFrequency(freq: number) {
    if (this.ctx && this.fluteOsc) {
      this.fluteOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
    }
  }

  setFluteIntensity(intensity: number) {
    if (!this.ctx || !this.fluteGain || !this.fluteNoiseGain) return;
    const now = this.ctx.currentTime;
    
    // Smooth transition to avoid audible pops and crackles
    const baseGain = intensity * 0.45;
    const noiseGainVal = intensity * 0.06;

    this.fluteGain.gain.setTargetAtTime(baseGain, now, 0.08);
    this.fluteNoiseGain.gain.setTargetAtTime(noiseGainVal, now, 0.08);
  }

  stopFlute() {
    try {
      if (this.fluteOsc) {
        this.fluteOsc.stop();
        this.fluteOsc.disconnect();
        this.fluteOsc = null;
      }
      if (this.fluteGain) {
        this.fluteGain.disconnect();
        this.fluteGain = null;
      }
      if (this.fluteFilter) {
        this.fluteFilter.disconnect();
        this.fluteFilter = null;
      }
      if (this.fluteNoiseGain) {
        this.fluteNoiseGain.disconnect();
        this.fluteNoiseGain = null;
      }
    } catch (e) {
      console.log("Ignored audio teardown fault", e);
    }
  }

  /**
   * Start Sarangi bowed sound simulation
   */
  startSarangi() {
    this.init();
    if (!this.ctx || this.sarangiOsc) return;

    const now = this.ctx.currentTime;

    // Bowing friction produces a rich buzzy Sawtooth wave
    this.sarangiOsc = this.ctx.createOscillator();
    this.sarangiOsc.type = "sawtooth";
    this.sarangiOsc.frequency.setValueAtTime(220, now); // Base tone A3

    // Bow tremble LFO (subtle jitter)
    const tremolo = this.ctx.createOscillator();
    const tremoloGain = this.ctx.createGain();
    tremolo.type = "sine";
    tremolo.frequency.setValueAtTime(5.2, now);
    tremoloGain.gain.setValueAtTime(3.4, now);
    tremolo.connect(tremoloGain);
    tremoloGain.connect(this.sarangiOsc.frequency);
    tremolo.start(now);

    this.sarangiGain = this.ctx.createGain();
    this.sarangiGain.gain.setValueAtTime(0.0, now);

    // Warm wooden resonant box simulation (notch or resonant bandpass)
    this.sarangiFilter = this.ctx.createBiquadFilter();
    this.sarangiFilter.type = "bandpass";
    this.sarangiFilter.frequency.setValueAtTime(450, now);
    this.sarangiFilter.Q.setValueAtTime(1.8, now);

    this.sarangiOsc.connect(this.sarangiFilter);
    this.sarangiFilter.connect(this.sarangiGain);
    this.sarangiGain.connect(this.ctx.destination);

    this.sarangiOsc.start(now);
  }

  setSarangiFrequency(freq: number) {
    if (this.ctx && this.sarangiOsc) {
      this.sarangiOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
    }
  }

  setSarangiIntensity(level: number) {
    if (this.ctx && this.sarangiGain) {
      this.sarangiGain.gain.setTargetAtTime(level * 0.45, this.ctx.currentTime, 0.1);
    }
  }

  stopSarangi() {
    try {
      if (this.sarangiOsc) {
        this.sarangiOsc.stop();
        this.sarangiOsc.disconnect();
        this.sarangiOsc = null;
      }
      if (this.sarangiGain) {
        this.sarangiGain.disconnect();
        this.sarangiGain = null;
      }
      if (this.sarangiFilter) {
        this.sarangiFilter.disconnect();
        this.sarangiFilter = null;
      }
    } catch (e) {
      console.log("Sarangi teardown ignore", e);
    }
  }

  /**
   * Play Murchunga (Jaw Harp) pluck with throat/jaw cavity filtering logic
   * @param resonanceHarmonic value from 0 to 1 mapping mouth opening size
   */
  playMurchunga(resonanceHarmonic: number) {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Jaw harp fundamental (Low metal buzzing harmonic)
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(85, now); // Drone fundamental key F2

    subOsc.type = "square";
    subOsc.frequency.setValueAtTime(170, now); // Double octave resonance

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.6, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.84);

    // Highly critical mouth resonator filter modeling (Wah-wah vocal effect!)
    // Vary resonance frequency between 350Hz (closed mouth) and 1900Hz (wide open jaw)
    const bandpassFilter = this.ctx.createBiquadFilter();
    bandpassFilter.type = "bandpass";
    const mappedFreq = 380 + resonanceHarmonic * 1620;
    bandpassFilter.frequency.setValueAtTime(mappedFreq, now);
    // Exponential ramp down representing dampening mouth shape during decay
    bandpassFilter.frequency.exponentialRampToValueAtTime(mappedFreq * 0.75, now + 0.5);
    bandpassFilter.Q.setValueAtTime(14, now); // Extremely high resonance for metallic twang

    // Combine tone structure
    const mixer = this.ctx.createGain();
    osc.connect(mixer);
    subOsc.connect(mixer);
    
    mixer.connect(bandpassFilter);
    bandpassFilter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    subOsc.start(now);

    osc.stop(now + 0.9);
    subOsc.stop(now + 0.9);
  }

  /**
   * Play named Madal bols (higher-level helpers)
   * Dha: both left (dhum) and right (tehel) together for deep bass open stroke
   * Ti: closed right-side tap
   * Na: open ringing stroke on the right edge
   * Ta: sharp high-pitched solo strike on the right side
   */
  playDha() {
    // Try playing right + left assets simultaneously
    try {
      const left = new URL("../../assets/536027__pbimal__maadal-02-dhing.wav", import.meta.url).href; // ghin/dhing (left open)
      const right = new URL("../../assets/536028__pbimal__maadal-02-taang.wav", import.meta.url).href; // taang (right open)
      const a1 = new Audio(left);
      const a2 = new Audio(right);
      a1.preload = "auto";
      a2.preload = "auto";
      // start both; browsers may require gesture — callers should call from user action
      a1.play().catch(() => {});
      a2.play().catch(() => {});
      return;
    } catch (e) {
      // fallback to synth combination
    }

    // fallback: trigger procedural variants together
    this.playMadalDhum();
    setTimeout(() => this.playMadalTehel(), 30);
  }

  playTi() {
    try {
      const rightClosed = new URL("../../assets/536024__pbimal__maadal-02-taak.wav", import.meta.url).href; // taak (closed right)
      const a = new Audio(rightClosed);
      a.preload = "auto";
      a.play().catch(() => {});
      return;
    } catch (e) {
      // fallback
    }
    // closed right can be rendered by tehel synth with shorter envelope
    this.playMadalTehel();
  }

  playNa() {
    try {
      const rightOpen = new URL("../../assets/536028__pbimal__maadal-02-taang.wav", import.meta.url).href; // taang (open right)
      const a = new Audio(rightOpen);
      a.preload = "auto";
      a.play().catch(() => {});
      return;
    } catch (e) {
      // fallback
    }
    // fall back to tehel synth for open ringing
    this.playMadalTehel();
  }

  playTa() {
    try {
      const high = new URL("../../assets/536026__pbimal__maadal-02-khat.wav", import.meta.url).href; // khat (sharp/high)
      const a = new Audio(high);
      a.preload = "auto";
      a.play().catch(() => {});
      return;
    } catch (e) {
      // fallback
    }
    // high solo: use tehel synth but with brighter envelope
    this.playMadalTehel();
  }

  /**
   * Helper utility to design real-time white noise buffer sources
   */
  private createNoiseNode(): AudioBufferSourceNode | null {
    if (!this.ctx) return null;
    try {
      const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of buffer
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      return noise;
    } catch (e) {
      console.error("White noise synthesizer buffer fault", e);
      return null;
    }
  }
}

export const synths = new AudioSynthesizer();
