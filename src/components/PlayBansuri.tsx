import React, { useState, useEffect, useRef } from "react";
import { synths } from "../utils/audioHelper";
import { Mic, MicOff, Info, Wind, Sparkles } from "lucide-react";

export function PlayBansuri() {
  const [micActive, setMicActive] = useState(false);
  const [breathVolume, setBreathVolume] = useState<number>(0);
  const [manualBlow, setManualBlow] = useState<number>(0.0);
  const [fingerHoles, setFingerHoles] = useState<boolean[]>([true, true, true, false, false, false]); // True representing closed/covered hole
  const [micError, setMicError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Map active (covered) hole count to traditional frequencies (pitch scale in D Major)
  // Closed holes count:
  // 0: High C#6 (1109 Hz)
  // 1: B5 (987 Hz)
  // 2: A5 (880 Hz)
  // 3: G5 (784 Hz)
  // 4: F#5 (740 Hz)
  // 5: E5 (659 Hz)
  // 6: D5 (587 Hz)
  const getFrequencyFromHoles = (holes: boolean[]): number => {
    const coveredCount = holes.filter(h => h).length;
    switch (coveredCount) {
      case 0: return 1109.0;
      case 1: return 987.77;
      case 2: return 880.00;
      case 3: return 783.99;
      case 4: return 739.99;
      case 5: return 659.25;
      case 6: return 587.33;
      default: return 587.33;
    }
  };

  // Start continuous tone generator when component loads
  useEffect(() => {
    synths.startFlute();
    
    // Set default base pitch
    const freq = getFrequencyFromHoles(fingerHoles);
    synths.setFluteFrequency(freq);

    return () => {
      synths.stopFlute();
      stopMicrophone();
    };
  }, []);

  // Sync pitch whenever holes configuration changes
  useEffect(() => {
    const freq = getFrequencyFromHoles(fingerHoles);
    synths.setFluteFrequency(freq);
  }, [fingerHoles]);

  // Handle manual breath level sync
  useEffect(() => {
    if (!micActive) {
      synths.setFluteIntensity(manualBlow);
    }
  }, [manualBlow, micActive]);

  // Microphone analysis looping routine
  const startMicrophone = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      source.connect(analyser);
      setMicActive(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const analyze = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(dataArray);

        // Estimate volume level via standard Root Mean Square (RMS) Calculation
        let sumSquared = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = (dataArray[i] - 128) / 128; // Normalize -1.0 to 1.0
          sumSquared += val * val;
        }
        const rms = Math.sqrt(sumSquared / bufferLength);

        // Scale RMS volume up for breath detection sensitivity
        let score = rms * 5.5;
        if (score < 0.08) score = 0; // Noise gate
        if (score > 1.0) score = 1.0;

        setBreathVolume(score);
        synths.setFluteIntensity(score);

        animationFrameRef.current = requestAnimationFrame(analyze);
      };

      analyze();
    } catch (err: any) {
      console.error("Mic access denied:", err);
      setMicError("Unable to capture microphone stream. Ensure permissions are set.");
      setMicActive(false);
    }
  };

  const stopMicrophone = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setMicActive(false);
    setBreathVolume(0);
    synths.setFluteIntensity(0);
  };

  const toggleMic = () => {
    if (micActive) {
      stopMicrophone();
    } else {
      startMicrophone();
    }
  };

  const handleHoleToggle = (idx: number) => {
    const updated = [...fingerHoles];
    updated[idx] = !updated[idx];
    setFingerHoles(updated);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 transition-all shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500">Immersive Playground</span>
          <h3 className="text-lg font-serif font-semibold text-stone-100 mt-0.5">Bansuri (Side-blown Bamboo Flute)</h3>
        </div>

        {/* Breath Mode Switch */}
        <button
          id="bansuri-mic-toggle"
          onClick={toggleMic}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all border ${
            micActive
              ? "bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse"
              : "bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700"
          }`}
        >
          {micActive ? <Mic className="w-4 h-4 text-amber-500" /> : <MicOff className="w-4 h-4 text-stone-500" />}
          {micActive ? "Microphone Input ACTIVE" : "Turn On Microphone Play"}
        </button>
      </div>

      {micError && (
        <div className="bg-amber-950/20 border border-amber-900/60 text-amber-300 text-[11px] p-3 rounded-xl mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-500" />
          <span>{micError} Fallback to the manual breath controller slider below.</span>
        </div>
      )}

      {/* Bamboo Flute Visualization Canvas */}
      <div className="bg-stone-950/80 border border-stone-800/60 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden mb-6 min-h-[180px]">
        {/* Air blow visual waves stream if producing sound */}
        {(micActive ? breathVolume : manualBlow) > 0.1 && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-20 flex gap-1 items-center opacity-70">
            <div className="w-1.5 h-6 bg-stone-100/40 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-10 bg-stone-100/50 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-14 bg-stone-100/60 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
          </div>
        )}

        {/* Flute bamboo rod body */}
        <div className="relative w-full max-w-[480px] h-[34px] bg-gradient-to-b from-amber-800 via-amber-700 to-amber-900 rounded-full border border-amber-950 shadow-2xl flex items-center px-12 z-10">
          
          {/* Node binding threads */}
          <div className="absolute left-6 inset-y-0 w-2.5 bg-red-950/80 border-x border-amber-950 flex flex-col justify-between p-0.5"><div className="w-full h-[1px] bg-amber-400"/><div className="w-full h-[1px] bg-amber-400"/></div>
          <div className="absolute right-12 inset-y-0 w-2.5 bg-red-950/80 border-x border-amber-950 flex flex-col justify-between p-0.5"><div className="w-full h-[1px] bg-amber-400"/><div className="w-full h-[1px] bg-amber-400"/></div>
          <div className="absolute right-36 inset-y-0 w-2 bg-red-950/80 border-x border-amber-950" />

          {/* Blow hole (Embouchure) */}
          <div className="absolute left-10 w-4 h-4 rounded-full bg-stone-950 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.8)] border border-amber-950 flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              (micActive ? breathVolume : manualBlow) > 0.05 ? "bg-stone-100/80 scale-110" : "bg-transparent"
            }`} />
          </div>

          {/* Six Finger Holes */}
          <div className="ml-16 w-full flex justify-between px-4">
            {fingerHoles.map((isCovered, idx) => (
              <button
                id={`bansuri-hole-${idx}`}
                key={idx}
                onClick={() => handleHoleToggle(idx)}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                  isCovered
                    ? "bg-amber-950/80 border-amber-950 shadow-[inset_1px_1px_4px_rgba(0,0,0,0.95)]"
                    : "bg-amber-600/35 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)] hover:bg-amber-500/50"
                }`}
                title={isCovered ? "Hole Covered (Lowers overall frequency)" : "Hole Open"}
              >
                {/* Visual finger skin cover */}
                <div className={`w-4 py-1.5 px-0.5 rounded-full bg-stone-200 shadow border border-stone-300 transition-all text-[8px] font-mono text-stone-900 leading-none ${
                  isCovered ? "scale-100 opacity-95" : "scale-0 opacity-0"
                }`}>
                  👇
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Manual Blow breath input simulator fallback slider */}
      <div className="bg-stone-950/50 border border-stone-850 rounded-xl p-4">
        {micActive ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-stone-300 flex items-center gap-1.5 font-mono">
                <Wind className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                Live Microphone Breath Intensity
              </span>
              <span className="text-[10px] font-mono text-stone-200">{(breathVolume * 100).toFixed(0)}%</span>
            </div>
            {/* Visual audio graph line representing breathing levels */}
            <div className="w-full h-3 bg-stone-900 border border-stone-800 rounded-full overflow-hidden flex items-center">
              <div
                className="h-full bg-gradient-to-r from-amber-800 to-amber-500 rounded-full transition-all duration-75"
                style={{ width: `${breathVolume * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-stone-500 mt-2">
              💡 Blow, murmur, or whisper directly towards your laptop/phone microphone to play realistic notes!
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-300 flex items-center gap-1 font-mono">
                <Wind className="w-3.5 h-3.5" />
                Manual Breath Controller (Slider)
              </span>
              <span className="text-xs font-mono text-stone-300">{(manualBlow * 100).toFixed(0)}% Intensity</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                id="breath-slider"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={manualBlow}
                onChange={(e) => setManualBlow(Number(e.target.value))}
                className="flex-1 accent-amber-500 bg-stone-900 h-2.5 rounded-lg cursor-pointer"
              />
              <button
                id="breath-blow-momentary"
                onMouseDown={() => setManualBlow(0.85)}
                onMouseUp={() => setManualBlow(0)}
                onTouchStart={() => setManualBlow(0.85)}
                onTouchEnd={() => setManualBlow(0)}
                className="px-4 py-2 bg-gradient-to-r from-amber-800 to-amber-700 text-stone-100 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-amber-900/60 shadow-md transform active:scale-95"
              >
                Hold to Blow
              </button>
            </div>
            <p className="text-[10px] text-stone-500 mt-2">
              💡 No mic active. Drag slider to hold notes, or tap finger holes to alter native pitch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
