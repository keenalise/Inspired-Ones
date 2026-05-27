import React, { useState, useEffect, useRef } from "react";
import { synths } from "../utils/audioHelper";
import { Play, Square, Music, Activity, HelpCircle } from "lucide-react";

export function PlayMadal() {
  const [tempo, setTempo] = useState<number>(110);
  const [isPlayingPattern, setIsPlayingPattern] = useState(false);
  const [activePattern, setActivePattern] = useState<"khyali" | "samal" | "bols">("khyali");
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [lastHitType, setLastHitType] = useState<"dhum" | "tehel" | null>(null);

  const patternTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepCountRef = useRef<number>(-1);

  const handleHitDhum = () => {
    synths.playMadalDhum();
    setLastHitType("dhum");
    setTimeout(() => setLastHitType(null), 120);
  };

  const handleHitTehel = () => {
    synths.playMadalTehel();
    setLastHitType("tehel");
    setTimeout(() => setLastHitType(null), 120);
  };

  // Additional named bols
  const handleDha = () => {
    synths.playDha();
    setLastHitType("dhum");
    setTimeout(() => setLastHitType(null), 140);
  };

  const handleTi = () => {
    synths.playTi();
    setLastHitType("tehel");
    setTimeout(() => setLastHitType(null), 120);
  };

  const handleNa = () => {
    synths.playNa();
    setLastHitType("tehel");
    setTimeout(() => setLastHitType(null), 120);
  };

  const handleTa = () => {
    synths.playTa();
    setLastHitType("tehel");
    setTimeout(() => setLastHitType(null), 120);
  };

  // Keyboard shortcut bounds
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === "a" || key === "s" || key === " ") {
        e.preventDefault();
        handleHitDhum();
      } else if (key === "l" || key === "k" || key === "d") {
        e.preventDefault();
        handleHitTehel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Rhythm Sequencer Logic
  // Khyali 8 beats rhythm: Dhum(0) -> - -> Tehel(2) -> Tehel(3) -> Dhum(4) -> - -> Tehel(6) -> - 
  const KhyaliArr = ["dhum", "", "tehel", "tehel", "dhum", "", "tehel", ""];
  // Samal 12 beats simple loop: Dhum -> Tehel -> Tehel -> Dhum -> Tehel -> - -> Dhum -> Dhum -> Tehel
  const SamalArr = ["dhum", "tehel", "", "dhum", "tehel", "tehel", "dhum", "", "tehel", "dhum", "tehel", ""];

  // Custom bols sequence requested: Ghin. Kha-Taang. Taak-Ghin. Ghin-Taang
  // Map: Ghin/Kha -> "dhum" (left), Taang/Taak -> "tehel" (right)
  const BolsArr: Array<string | string[]> = [
    "dhum", // Ghin
    ["dhum", "tehel"], // Kha-Taang
    ["tehel", "dhum"], // Taak-Ghin
    ["dhum", "tehel"], // Ghin-Taang
  ];

  const triggerStep = () => {
    const arr = activePattern === "khyali" ? KhyaliArr : activePattern === "samal" ? SamalArr : BolsArr;
    stepCountRef.current = (stepCountRef.current + 1) % arr.length;
    setCurrentStep(stepCountRef.current);

    const command = arr[stepCountRef.current];
    // handle single or multi-hit steps
    if (Array.isArray(command)) {
      // play hits with small stagger for clarity
      command.forEach((c, i) => {
        const delay = i * 80; // ms
        setTimeout(() => {
          if (c === "dhum") synths.playMadalDhum();
          else if (c === "tehel") synths.playMadalTehel();
        }, delay);
      });
    } else {
      if (command === "dhum") {
        synths.playMadalDhum();
      } else if (command === "tehel") {
        synths.playMadalTehel();
      }
    }
  };

  useEffect(() => {
    if (isPlayingPattern) {
      const intervalMs = (60 / tempo) * 500; // Half beats or full beats based on aesthetic speed
      patternTimerRef.current = setInterval(triggerStep, intervalMs);
    } else {
      if (patternTimerRef.current) {
        clearInterval(patternTimerRef.current);
        patternTimerRef.current = null;
      }
      setCurrentStep(-1);
      stepCountRef.current = -1;
    }

    return () => {
      if (patternTimerRef.current) {
        clearInterval(patternTimerRef.current);
      }
    };
  }, [isPlayingPattern, tempo, activePattern]);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 transition-all shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500">Immersive Playground</span>
          <h3 className="text-lg font-serif font-semibold text-stone-100 mt-0.5">Dual-Head Hand Drum</h3>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-0.5 bg-stone-950 border border-stone-800 rounded text-stone-400 text-[10px] font-mono shadow">A / SPACE: Left</kbd>
          <kbd className="px-2 py-0.5 bg-stone-950 border border-stone-800 rounded text-stone-400 text-[10px] font-mono shadow">D / L: Right</kbd>
        </div>
      </div>

      {/* Playable Drum Body Layout */}
      <div className="bg-stone-950/85 border border-stone-800/60 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden mb-6 min-h-[220px]">
        {/* Aesthetic background strings reflecting tension chords of Madal */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[70px] opacity-15 flex flex-col justify-between pointer-events-none px-12">
          <div className="w-full h-[2px] bg-amber-400 rotate-1" />
          <div className="w-full h-[2px] bg-amber-500 -rotate-1" />
          <div className="w-full h-[2px] bg-amber-600 rotate-3" />
        </div>

        {/* The Madal Body */}
        <div className="relative flex items-center justify-between w-full max-w-[420px] select-none scale-105">
          
          {/* LEFT OUTER HEAD - DHUM (Deep Bass) */}
          <button
            id="madal-dhum-head"
            onClick={handleHitDhum}
            className={`w-[110px] h-[160px] rounded-[50%_15%_15%_50%] border-4 border-stone-800 bg-stone-900 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative shrink-0 group ${
              lastHitType === "dhum"
                ? "bg-amber-900 border-amber-600 scale-102 ring-4 ring-amber-500/20"
                : "hover:border-stone-600 active:scale-98"
            }`}
          >
            {/* Leather texture rim */}
            <div className="absolute inset-2 border-2 border-dashed border-stone-950 rounded-[50%_15%_15%_50%]" />
            {/* The circular black spot (Khari / Syahi equivalent for bass face to stabilize sound) */}
            <div className={`w-14 h-14 rounded-full border-2 border-stone-950 transition-all ${
              lastHitType === "dhum" ? "bg-stone-950 scale-110" : "bg-stone-950/90"
            }`} />
            
            <span className="absolute bottom-2 text-[10px] font-mono tracking-widest font-semibold uppercase text-stone-300 pointer-events-none select-none">
              Dhum (Bass)
            </span>
          </button>

          {/* WOODEN CYLINDRICAL HARNESS ('Ghar') */}
          <div className="flex-1 h-[110px] bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border-y border-stone-700 relative mx-0.5 flex items-center justify-center text-center">
            {/* Decorative brass ring patterns represent mountain markings */}
            <div className="absolute inset-y-0 left-4 w-1 border-r border-dashed border-stone-600/50" />
            <div className="absolute inset-y-0 right-4 w-1 border-l border-dashed border-stone-600/50" />
            <div className="absolute inset-y-0 left-12 w-0.5 bg-stone-700/60" />
            <div className="absolute inset-y-0 right-12 w-0.5 bg-stone-700/60" />
            
            <div className="opacity-15 pointer-events-none select-none font-serif text-[42px] tracking-widest text-amber-500">
              मादल
            </div>
          </div>

          {/* RIGHT OUTER HEAD - TEHEL (Ringing Treble Slap) */}
          <button
            id="madal-tehel-head"
            onClick={handleHitTehel}
            className={`w-[95px] h-[135px] rounded-[15%_50%_50%_15%] border-4 border-stone-800 bg-stone-900 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative shrink-0 group ${
              lastHitType === "tehel"
                ? "bg-amber-900 border-amber-600 scale-102 ring-4 ring-amber-500/20"
                : "hover:border-stone-600 active:scale-98"
            }`}
          >
            {/* Leather texture rim */}
            <div className="absolute inset-1.5 border-2 border-dashed border-stone-950 rounded-[15%_50%_50%_15%]" />
            {/* Solid Black Khari spot - larger on treble for metallic pitch */}
            <div className={`w-9 h-9 rounded-full border-2 border-stone-950 transition-all ${
              lastHitType === "tehel" ? "bg-stone-950 scale-115" : "bg-stone-950"
            }`} />

            <span className="absolute bottom-2 text-[10px] font-mono tracking-widest font-semibold uppercase text-stone-300 pointer-events-none select-none">
              Tehel (Treble)
            </span>
          </button>

        </div>
      </div>

      {/* Quick bol buttons */}
      <div className="flex gap-2 mb-6">
        <button onClick={handleDha} className="px-3 py-1 rounded bg-stone-900 border border-stone-800 text-stone-100 text-sm">Dha</button>
        <button onClick={handleTi} className="px-3 py-1 rounded bg-stone-900 border border-stone-800 text-stone-100 text-sm">Ti</button>
        <button onClick={handleNa} className="px-3 py-1 rounded bg-stone-900 border border-stone-800 text-stone-100 text-sm">Na</button>
        <button onClick={handleTa} className="px-3 py-1 rounded bg-stone-900 border border-stone-800 text-stone-100 text-sm">Ta</button>
      </div>

      {/* Traditional Folk Autoplay Sequencer */}
      <div className="bg-stone-950/50 border border-stone-850 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-stone-900 border border-stone-800 rounded text-amber-500">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-stone-200 uppercase font-mono">Traditional Rhythm Sequencer</h4>
              <p className="text-[10px] text-stone-500">Trigger folk time-signatures looped by procedural hits</p>
            </div>
          </div>

          {/* Pattern Type Toggle */}
          <div className="flex bg-stone-900 border border-stone-800 p-1 rounded-lg">
            <button
              id="pattern-khyali-btn"
              onClick={() => setActivePattern("khyali")}
              className={`text-[10px] px-3 py-1 rounded-md font-medium tracking-wide transition-all ${
                activePattern === "khyali"
                  ? "bg-amber-800 text-stone-100"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Khyali (8 Beats)
            </button>
            <button
              id="pattern-samal-btn"
              onClick={() => setActivePattern("samal")}
              className={`text-[10px] px-3 py-1 rounded-md font-medium tracking-wide transition-all ${
                activePattern === "samal"
                  ? "bg-amber-800 text-stone-100"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Samal (12 Beats)
            </button>
            <button
              id="pattern-bols-btn"
              onClick={() => setActivePattern("bols")}
              className={`text-[10px] px-3 py-1 rounded-md font-medium tracking-wide transition-all ${
                activePattern === "bols"
                  ? "bg-amber-800 text-stone-100"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Bols Sequence
            </button>
          </div>
        </div>

        {/* Visualizer Step Sequence Grid */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-4 select-none">
          {(activePattern === "khyali" ? KhyaliArr : SamalArr).map((step, idx) => (
            <div
              key={idx}
              className={`flex-1 min-w-[34px] aspect-square rounded-lg flex flex-col items-center justify-center transition-all border text-[9px] font-mono font-bold ${
                currentStep === idx
                  ? "bg-amber-500/20 border-amber-500 text-amber-400 font-extrabold scale-105"
                  : step === ""
                  ? "bg-stone-950 border-stone-900 text-stone-700"
                  : "bg-stone-900/80 border-stone-800 text-stone-300"
              }`}
            >
              <span className="text-[8px] opacity-40 mb-0.5">{idx + 1}</span>
              <span className="capitalize">{step ? step[0] : "•"}</span>
            </div>
          ))}
        </div>

        {/* Controls block */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          {/* Tempo slider */}
          <div className="flex items-center gap-3 w-full sm:w-[220px]">
            <span className="text-[10px] font-mono text-stone-400 shrink-0">BPM: {tempo}</span>
            <input
              id="tempo-slider"
              type="range"
              min="80"
              max="160"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="w-full accent-amber-500 bg-stone-900 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          <button
            id="start-sequencer-btn"
            onClick={() => setIsPlayingPattern(!isPlayingPattern)}
            className={`w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
              isPlayingPattern
                ? "bg-red-950 border border-red-800 text-red-200 hover:bg-red-900"
                : "bg-amber-800 hover:bg-amber-700 text-stone-100 shadow-lg shadow-amber-950/40"
            }`}
          >
            {isPlayingPattern ? (
              <>
                <Square className="w-3.5 h-3.5 fill-red-200" />
                Stop Loop
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-stone-100" />
                Play Rhythm Pattern
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
