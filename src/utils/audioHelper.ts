/**
 * audioHelper.ts
 * Web Audio API synthesizer for Nepali instruments.
 * Fixes: sarangiOsc guard bug, AudioContext resume on gesture, clean teardown.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;

  // Flute nodes
  private fluteOsc: OscillatorNode | null = null;
  private fluteGain: GainNode | null = null;
  private fluteFilter: BiquadFilterNode | null = null;
  private fluteNoiseGain: GainNode | null = null;
  private fluteVibrato: OscillatorNode | null = null;

  // Sarangi nodes
  private sarangiOsc: OscillatorNode | null = null;
  private sarangiGain: GainNode | null = null;
  private sarangiFilter: BiquadFilterNode | null = null;
  private sarangiTremolo: OscillatorNode | null = null;

  constructor() {}

  /** Ensure AudioContext exists and is running. Must be called inside a user gesture. */
  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  getAudioContext(): AudioContext | null {
    return this.ctx;
  }

  // ── Noise utility ────────────────────────────────────────────────────────

  private createNoiseNode(): AudioBufferSourceNode | null {
    if (!this.ctx) return null;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      return noise;
    } catch (e) {
      console.error("Noise buffer error", e);
      return null;
    }
  }

  // ── Asset loader (Vite-compatible) ──────────────────────────────────────

  private playAsset(path: string): boolean {
    try {
      const audio = new Audio(path);
      audio.preload = "auto";
      const p = audio.play();
      if (p && typeof p.then === "function") p.catch(() => {});
      return true;
    } catch {
      return false;
    }
  }

  // ── Madal ────────────────────────────────────────────────────────────────

  /** Left-side deep bass stroke — Dhing / Ghin (WAV first, synth fallback) */
  playMadalDhum() {
    if (this.playAsset("/assets/536027__pbimal__maadal-02-dhing.wav")) return;
    if (this.playAsset("/assets/536025__pbimal__maadal-02-naa.wav")) return;

    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.12);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(1.0, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    const noiseNode = this.createNoiseNode();
    if (noiseNode) {
      const noiseGain = this.ctx.createGain();
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(300, now);
      noiseFilter.Q.setValueAtTime(3, now);
      noiseGain.gain.setValueAtTime(0.12, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
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

  /** Right-side sharp treble slap — Taak / Taang (WAV first, synth fallback) */
  playMadalTehel() {
    if (this.playAsset("/assets/536028__pbimal__maadal-02-taang.wav")) return;
    if (this.playAsset("/assets/536024__pbimal__maadal-02-taak.wav")) return;
    if (this.playAsset("/assets/536026__pbimal__maadal-02-khat.wav")) return;

    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(420, now + 0.04);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.7, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    const resonanceOsc = this.ctx.createOscillator();
    const resonanceGain = this.ctx.createGain();
    resonanceOsc.type = "sine";
    resonanceOsc.frequency.setValueAtTime(1185, now);
    resonanceGain.gain.setValueAtTime(0.001, now);
    resonanceGain.gain.linearRampToValueAtTime(0.35, now + 0.005);
    resonanceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    const noiseNode = this.createNoiseNode();
    if (noiseNode) {
      const noiseFilter = this.ctx.createBiquadFilter();
      const noiseGain = this.ctx.createGain();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(2200, now);
      noiseFilter.Q.setValueAtTime(5, now);
      noiseGain.gain.setValueAtTime(0.18, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
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

  // ── Named bol methods ────────────────────────────────────────────────────

  playDhing() {
    if (this.playAsset("/assets/536027__pbimal__maadal-02-dhing.wav")) return;
    this.playMadalDhum();
  }

  playNaa() {
    if (this.playAsset("/assets/536025__pbimal__maadal-02-naa.wav")) return;
    this.playMadalDhum();
  }

  playTaang() {
    if (this.playAsset("/assets/536028__pbimal__maadal-02-taang.wav")) return;
    this.playMadalTehel();
  }

  playTaak() {
    if (this.playAsset("/assets/536024__pbimal__maadal-02-taak.wav")) return;
    this.playMadalTehel();
  }

  playKhat() {
    if (this.playAsset("/assets/536026__pbimal__maadal-02-khat.wav")) return;

    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.linearRampToValueAtTime(480, now + 0.02);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playDha() {
    try {
      const a1 = new Audio("/assets/536027__pbimal__maadal-02-dhing.wav");
      const a2 = new Audio("/assets/536028__pbimal__maadal-02-taang.wav");
      a1.preload = "auto"; a2.preload = "auto";
      a1.play().catch(() => {}); a2.play().catch(() => {});
      return;
    } catch { /* fallback */ }
    this.playMadalDhum();
    setTimeout(() => this.playMadalTehel(), 30);
  }

  playTi() {
    if (this.playAsset("/assets/536024__pbimal__maadal-02-taak.wav")) return;
    this.playMadalTehel();
  }

  playNa() {
    if (this.playAsset("/assets/536028__pbimal__maadal-02-taang.wav")) return;
    this.playMadalTehel();
  }

  playTa() {
    if (this.playAsset("/assets/536026__pbimal__maadal-02-khat.wav")) return;
    this.playMadalTehel();
  }

  // ── Flute (Bansuri) ──────────────────────────────────────────────────────

  startFlute() {
    this.stopFlute(); // always clean up first
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    this.fluteOsc = this.ctx.createOscillator();
    this.fluteOsc.type = "triangle";
    this.fluteOsc.frequency.setValueAtTime(587.33, now);

    this.fluteVibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    this.fluteVibrato.frequency.setValueAtTime(5.8, now);
    vibratoGain.gain.setValueAtTime(5.2, now);
    this.fluteVibrato.connect(vibratoGain);
    vibratoGain.connect(this.fluteOsc.frequency);
    this.fluteVibrato.start(now);

    this.fluteGain = this.ctx.createGain();
    this.fluteGain.gain.setValueAtTime(0.0, now);

    this.fluteFilter = this.ctx.createBiquadFilter();
    this.fluteFilter.type = "lowpass";
    this.fluteFilter.frequency.setValueAtTime(1400, now);

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
    }

    this.fluteOsc.connect(this.fluteFilter);
    this.fluteFilter.connect(this.fluteGain);
    this.fluteGain.connect(this.ctx.destination);
    this.fluteOsc.start(now);
  }

  setFluteFrequency(freq: number) {
    if (this.ctx && this.fluteOsc)
      this.fluteOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
  }

  setFluteIntensity(intensity: number) {
    if (!this.ctx || !this.fluteGain || !this.fluteNoiseGain) return;
    const now = this.ctx.currentTime;
    this.fluteGain.gain.setTargetAtTime(intensity * 0.45, now, 0.08);
    this.fluteNoiseGain.gain.setTargetAtTime(intensity * 0.06, now, 0.08);
  }

  stopFlute() {
    try { this.fluteOsc?.stop(); } catch {}
    try { this.fluteVibrato?.stop(); } catch {}
    this.fluteOsc?.disconnect();       this.fluteOsc = null;
    this.fluteVibrato?.disconnect();   this.fluteVibrato = null;
    this.fluteGain?.disconnect();      this.fluteGain = null;
    this.fluteFilter?.disconnect();    this.fluteFilter = null;
    this.fluteNoiseGain?.disconnect(); this.fluteNoiseGain = null;
  }

  // ── Sarangi ──────────────────────────────────────────────────────────────

  startSarangi() {
    this.stopSarangi(); // FIX: always clean up — prevents the guard bug
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    this.sarangiOsc = this.ctx.createOscillator();
    this.sarangiOsc.type = "sawtooth";
    this.sarangiOsc.frequency.setValueAtTime(220, now);

    this.sarangiTremolo = this.ctx.createOscillator();
    const tremoloGain = this.ctx.createGain();
    this.sarangiTremolo.type = "sine";
    this.sarangiTremolo.frequency.setValueAtTime(5.2, now);
    tremoloGain.gain.setValueAtTime(3.4, now);
    this.sarangiTremolo.connect(tremoloGain);
    tremoloGain.connect(this.sarangiOsc.frequency);
    this.sarangiTremolo.start(now);

    this.sarangiGain = this.ctx.createGain();
    this.sarangiGain.gain.setValueAtTime(0.0, now);

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
    if (this.ctx && this.sarangiOsc)
      this.sarangiOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.08);
  }

  setSarangiIntensity(level: number) {
    if (this.ctx && this.sarangiGain)
      this.sarangiGain.gain.setTargetAtTime(level * 0.45, this.ctx.currentTime, 0.08);
  }

  stopSarangi() {
    try { this.sarangiOsc?.stop(); } catch {}
    try { this.sarangiTremolo?.stop(); } catch {}
    this.sarangiOsc?.disconnect();     this.sarangiOsc = null;
    this.sarangiTremolo?.disconnect(); this.sarangiTremolo = null;
    this.sarangiGain?.disconnect();    this.sarangiGain = null;
    this.sarangiFilter?.disconnect();  this.sarangiFilter = null;
  }

  // ── Murchunga ────────────────────────────────────────────────────────────

  playMurchunga(resonanceHarmonic: number) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(85, now);
    subOsc.type = "square";
    subOsc.frequency.setValueAtTime(170, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.6, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.84);

    const bandpassFilter = this.ctx.createBiquadFilter();
    bandpassFilter.type = "bandpass";
    const mappedFreq = 380 + resonanceHarmonic * 1620;
    bandpassFilter.frequency.setValueAtTime(mappedFreq, now);
    bandpassFilter.frequency.exponentialRampToValueAtTime(mappedFreq * 0.75, now + 0.5);
    bandpassFilter.Q.setValueAtTime(14, now);

    const mixer = this.ctx.createGain();
    osc.connect(mixer);
    subOsc.connect(mixer);
    mixer.connect(bandpassFilter);
    bandpassFilter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now); subOsc.start(now);
    osc.stop(now + 0.9); subOsc.stop(now + 0.9);
  }
}

export const synths = new AudioSynthesizer();