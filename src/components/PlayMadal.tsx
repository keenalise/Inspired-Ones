import React, { useState, useEffect, useRef } from "react";
import { synths } from "../utils/audioHelper";
import { Play, Square, Music, Activity, HelpCircle } from "lucide-react";

export function PlayMadal() {
  const [tempo, setTempo] = useState<number>(110);
  const [isPlayingPattern, setIsPlayingPattern] = useState(false);
  const [activePattern, setActivePattern] = useState<"khyali" | "samal" | "bols" | "khemta">("khyali");
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [lastHitType, setLastHitType] = useState<"dhum" | "tehel" | null>(null);

  const patternTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepCountRef = useRef<number>(-1);

  // ── Hit handlers ─────────────────────────────────────────────────────────
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

  const handleDha   = () => { synths.playDha();   setLastHitType("dhum");  setTimeout(() => setLastHitType(null), 140); };
  const handleTi    = () => { synths.playTi();    setLastHitType("tehel"); setTimeout(() => setLastHitType(null), 120); };
  const handleNa    = () => { synths.playNa();    setLastHitType("tehel"); setTimeout(() => setLastHitType(null), 120); };
  const handleTa    = () => { synths.playTa();    setLastHitType("tehel"); setTimeout(() => setLastHitType(null), 120); };

  // Khemta-specific bol handlers
  const handleDhing = () => { synths.playDhing(); setLastHitType("dhum");  setTimeout(() => setLastHitType(null), 140); };
  const handleNaa   = () => { synths.playNaa();   setLastHitType("dhum");  setTimeout(() => setLastHitType(null), 120); };
  const handleTaang = () => { synths.playTaang(); setLastHitType("tehel"); setTimeout(() => setLastHitType(null), 120); };
  const handleKhat  = () => { synths.playKhat();  setLastHitType("tehel"); setTimeout(() => setLastHitType(null), 120); };
  const handleTaak  = () => { synths.playTaak();  setLastHitType("tehel"); setTimeout(() => setLastHitType(null), 120); };

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      const key = e.key.toLowerCase();
      if (key === "a" || key === "s" || key === " ") { e.preventDefault(); handleHitDhum(); }
      else if (key === "l" || key === "k" || key === "d") { e.preventDefault(); handleHitTehel(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Pattern arrays ───────────────────────────────────────────────────────
  const KhyaliArr = ["dhum", "", "tehel", "tehel", "dhum", "", "tehel", ""];
  const SamalArr  = ["dhum", "tehel", "", "dhum", "tehel", "tehel", "dhum", "", "tehel", "dhum", "tehel", ""];
  // Updated Bols: Ghin • Ta • Ti • Na • Ghin • Na
  const BolsArr   = ["dhing", "ta", "ti", "na", "dhing", "na"];

  // Khemta Taal — 6 beats (3+3 grouping)
  // Bols:  Dhing  |  Naa   |  Taang  |  Dhing  |  Khat  |  Taak
  // Beat:    1         2        3         4          5        6
  // Side:  Left      Left    Right      Left       Right    Right
  const KhemtaArr = ["dhing","", "ti", "naa", "dhing", "naa"];

  const getPatternArr = (): string[] => {
    switch (activePattern) {
      case "khyali": return KhyaliArr;
      case "samal":  return SamalArr;
      case "bols":   return BolsArr;
      case "khemta": return KhemtaArr;
    }
  };

  // ── Central bol dispatcher ───────────────────────────────────────────────
  const playBol = (command: string) => {
    switch (command) {
      case "dhum":  synths.playMadalDhum();  break;
      case "tehel": synths.playMadalTehel(); break;
      case "dhing": synths.playDhing();      break;
      case "naa":   synths.playNaa();        break;
      case "taang": synths.playTaang();      break;
      case "khat":  synths.playKhat();       break;
      case "taak":  synths.playTaak();       break;
    }
  };
  
  // Extended bols mapping
  // 'ta' -> high solo/right, 'ti' -> closed quick tap, 'na' -> open right edge
  // keep existing mappings above
  const playBolExtended = (command: string) => {
    if (command === "ta") return synths.playTa();
    if (command === "ti") return synths.playTi();
    if (command === "na") return synths.playNa();
    return playBol(command);
  };

  // ── Sequencer ────────────────────────────────────────────────────────────
  const triggerStep = () => {
    const arr = getPatternArr();
    stepCountRef.current = (stepCountRef.current + 1) % arr.length;
    setCurrentStep(stepCountRef.current);
    const command = arr[stepCountRef.current];
    if (Array.isArray(command)) {
      command.forEach((c, i) => setTimeout(() => playBolExtended(c), i * 80));
    } else {
      playBolExtended(command);
    }
  };

  useEffect(() => {
    if (isPlayingPattern) {
      const intervalMs = (60 / tempo) * 500;
      patternTimerRef.current = setInterval(triggerStep, intervalMs);
    } else {
      if (patternTimerRef.current) { clearInterval(patternTimerRef.current); patternTimerRef.current = null; }
      setCurrentStep(-1);
      stepCountRef.current = -1;
    }
    return () => { if (patternTimerRef.current) clearInterval(patternTimerRef.current); };
  }, [isPlayingPattern, tempo, activePattern]);

  // ── Step grid helpers ────────────────────────────────────────────────────
  const STEP_LABELS: Record<string, string> = {
    dhum: "Dhm", tehel: "Thl", dhing: "Dhi",
    naa: "Naa", taang: "Tng", khat: "Kht", taak: "Tak",
    ta: "Ta", ti: "Ti", na: "Na",
  };
  const stepLabel = (s: string) => s ? (STEP_LABELS[s] ?? s[0]) : "•";

  const stepClass = (step: string, isActive: boolean) => {
    if (isActive) return "bg-amber-500/20 border-amber-500 text-amber-400 scale-105";
    if (!step)    return "bg-stone-950 border-stone-900 text-stone-700";
    const isBass = ["dhum", "dhing", "naa"].includes(step);
    return isBass
      ? "bg-amber-950/40 border-amber-900/60 text-amber-300"
      : "bg-stone-900/80 border-stone-800 text-stone-300";
  };

  // ── Pattern toggle config ─────────────────────────────────────────────────
  const PATTERNS = [
    { id: "khyali", label: "Khyali (8)" },
    { id: "samal",  label: "Samal (12)" },
    { id: "bols",   label: "Bols (6)"   },
    { id: "khemta", label: "Khemta (6)" },
  ] as const;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 transition-all shadow-xl">

      {/* Header */}
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

      {/* Drum Body */}
      <div className="bg-stone-950/85 border border-stone-800/60 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden mb-6 min-h-[220px]">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[70px] opacity-15 flex flex-col justify-between pointer-events-none px-12">
          <div className="w-full h-[2px] bg-amber-400 rotate-1" />
          <div className="w-full h-[2px] bg-amber-500 -rotate-1" />
          <div className="w-full h-[2px] bg-amber-600 rotate-3" />
        </div>

        <div className="relative flex items-center justify-between w-full max-w-[420px] select-none scale-105">

          {/* LEFT — Dhum (Bass) */}
          <button
            id="madal-dhum-head"
            onClick={handleHitDhum}
            className={`w-[110px] h-[160px] rounded-[50%_15%_15%_50%] border-4 border-stone-800 bg-stone-900 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative shrink-0 group ${
              lastHitType === "dhum"
                ? "bg-amber-900 border-amber-600 scale-102 ring-4 ring-amber-500/20"
                : "hover:border-stone-600 active:scale-98"
            }`}
          >
            <div className="absolute inset-2 border-2 border-dashed border-stone-950 rounded-[50%_15%_15%_50%]" />
            <div className={`w-14 h-14 rounded-full border-2 border-stone-950 transition-all ${lastHitType === "dhum" ? "bg-stone-950 scale-110" : "bg-stone-950/90"}`} />
            <span className="absolute bottom-2 text-[10px] font-mono tracking-widest font-semibold uppercase text-stone-300 pointer-events-none select-none">Dhum (Bass)</span>
          </button>

          {/* Body — Ghar */}
          <div className="flex-1 h-[110px] bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border-y border-stone-700 relative mx-0.5 flex items-center justify-center text-center">
            <div className="absolute inset-y-0 left-4 w-1 border-r border-dashed border-stone-600/50" />
            <div className="absolute inset-y-0 right-4 w-1 border-l border-dashed border-stone-600/50" />
            <div className="absolute inset-y-0 left-12 w-0.5 bg-stone-700/60" />
            <div className="absolute inset-y-0 right-12 w-0.5 bg-stone-700/60" />
            <div className="opacity-15 pointer-events-none select-none font-serif text-[42px] tracking-widest text-amber-500">मादल</div>
          </div>

          {/* RIGHT — Tehel (Treble) */}
          <button
            id="madal-tehel-head"
            onClick={handleHitTehel}
            className={`w-[95px] h-[135px] rounded-[15%_50%_50%_15%] border-4 border-stone-800 bg-stone-900 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative shrink-0 group ${
              lastHitType === "tehel"
                ? "bg-amber-900 border-amber-600 scale-102 ring-4 ring-amber-500/20"
                : "hover:border-stone-600 active:scale-98"
            }`}
          >
            <div className="absolute inset-1.5 border-2 border-dashed border-stone-950 rounded-[15%_50%_50%_15%]" />
            <div className={`w-9 h-9 rounded-full border-2 border-stone-950 transition-all ${lastHitType === "tehel" ? "bg-stone-950 scale-115" : "bg-stone-950"}`} />
            <span className="absolute bottom-2 text-[10px] font-mono tracking-widest font-semibold uppercase text-stone-300 pointer-events-none select-none">Tehel (Treble)</span>
          </button>

        </div>
      </div>

      {/* Quick bol buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {/* Original bols */}
        <button onClick={handleDha}   className="px-3 py-1 rounded bg-stone-900 border border-stone-800 text-stone-100 text-sm hover:bg-stone-800 transition-colors">Dha</button>
        <button onClick={handleTi}    className="px-3 py-1 rounded bg-stone-900 border border-stone-800 text-stone-100 text-sm hover:bg-stone-800 transition-colors">Ti</button>
        <button onClick={handleNa}    className="px-3 py-1 rounded bg-stone-900 border border-stone-800 text-stone-100 text-sm hover:bg-stone-800 transition-colors">Na</button>
        <button onClick={handleTa}    className="px-3 py-1 rounded bg-stone-900 border border-stone-800 text-stone-100 text-sm hover:bg-stone-800 transition-colors">Ta</button>

        {/* Divider */}
        <div className="w-px h-5 bg-stone-700 mx-1" />
        <span className="text-[9px] font-mono uppercase tracking-widest text-amber-600">Khemta</span>

        {/* Khemta bols — each maps to its dedicated WAV */}
        <button onClick={handleDhing} className="px-3 py-1 rounded bg-amber-950 border border-amber-800/60 text-amber-200 text-sm hover:bg-amber-900 transition-colors">Dhing</button>
        <button onClick={handleNaa}   className="px-3 py-1 rounded bg-amber-950 border border-amber-800/60 text-amber-200 text-sm hover:bg-amber-900 transition-colors">Naa</button>
        <button onClick={handleTaang} className="px-3 py-1 rounded bg-amber-950 border border-amber-800/60 text-amber-200 text-sm hover:bg-amber-900 transition-colors">Taang</button>
        <button onClick={handleKhat}  className="px-3 py-1 rounded bg-amber-950 border border-amber-800/60 text-amber-200 text-sm hover:bg-amber-900 transition-colors">Khat</button>
        <button onClick={handleTaak}  className="px-3 py-1 rounded bg-amber-950 border border-amber-800/60 text-amber-200 text-sm hover:bg-amber-900 transition-colors">Taak</button>
      </div>

      {/* Sequencer */}
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

          {/* Pattern toggles */}
          <div className="flex flex-wrap bg-stone-900 border border-stone-800 p-1 rounded-lg gap-0.5">
            {PATTERNS.map(({ id, label }) => (
              <button
                key={id}
                id={`pattern-${id}-btn`}
                onClick={() => setActivePattern(id)}
                className={`text-[10px] px-3 py-1 rounded-md font-medium tracking-wide transition-all ${
                  activePattern === id
                    ? "bg-amber-800 text-stone-100"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Khemta annotation bar */}
        {activePattern === "khemta" && (
          <div className="flex items-center gap-3 mb-3 px-1">
            <span className="text-[9px] font-mono text-amber-600 uppercase tracking-widest shrink-0">Khemta Taal · 6 beats · 3+3</span>
            <div className="flex-1 h-px bg-amber-900/40" />
            <span className="text-[9px] font-mono text-stone-500 shrink-0">Dhing · Naa · Taang ‖ Dhing · Khat · Taak</span>
          </div>
        )}

        {/* Step grid */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-4 select-none">
          {getPatternArr().map((step, idx) => (
            <div
              key={idx}
              className={`flex-1 min-w-[34px] aspect-square rounded-lg flex flex-col items-center justify-center transition-all border text-[9px] font-mono font-bold ${stepClass(step, currentStep === idx)}`}
            >
              <span className="text-[8px] opacity-40 mb-0.5">{idx + 1}</span>
              <span>{stepLabel(step)}</span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3 w-full sm:w-[220px]">
            <span className="text-[10px] font-mono text-stone-400 shrink-0">BPM: {tempo}</span>
            <input
              id="tempo-slider"
              type="range" min="80" max="160" value={tempo}
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
            {isPlayingPattern
              ? <><Square className="w-3.5 h-3.5 fill-red-200" />Stop Loop</>
              : <><Play  className="w-3.5 h-3.5 fill-stone-100" />Play Rhythm Pattern</>}
          </button>
        </div>
      </div>

    </div>
  );
}