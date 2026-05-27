import React, { useState, useEffect, useRef } from "react";
import { synths } from "../utils/audioHelper";
import { Play, Square, Activity, Volume2 } from "lucide-react";

interface SarangiString {
  id: number;
  label: string;
  baseFreq: number;
}

const SARANGI_STRINGS: SarangiString[] = [
  { id: 1, label: "Sa (Low G3)", baseFreq: 196.00 },
  { id: 2, label: "Pa (C4)", baseFreq: 261.63 },
  { id: 3, label: "Ma (E4)", baseFreq: 329.63 },
  { id: 4, label: "Sa (High G4)", baseFreq: 392.00 }
];

export function PlaySarangi() {
  const [activeStringId, setActiveStringId] = useState<number | null>(null);
  const [bowSpeed, setBowSpeed] = useState<number>(0);
  const [pitchBendAmt, setPitchBendAmt] = useState<number>(0.0); // -1.0 to 1.0 (semitones)
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      synths.stopSarangi();
    };
  }, []);

  // Initiate continuous bowed sound when user clicks down on string frame
  const handleStartBowing = (str: SarangiString, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    setActiveStringId(str.id);
    synths.startSarangi();
    
    // Trigger audio frequency setup
    synths.setSarangiFrequency(str.baseFreq);
    synths.setSarangiIntensity(0.6); // default medium bow
    setBowSpeed(60);
    setPitchBendAmt(0);
  };

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (activeStringId === null) return;

    // Retrieve mouse positioning inside the bounds of the wooden fingerboard
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
      const clientY = "touches" in event ? event.touches[0].clientY : event.clientY;

      // Vertical position maps to bowing velocity / volume (0.0 to 1.0)
      const relativeY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      const volumeLevel = 1.0 - relativeY; // top of fingerboard is louder

      // Horizontal position maps to fine pitch scale bend (nail slide movement)
      const relativeX = (clientX - rect.left) / rect.width;
      const bendFactor = (relativeX - 0.5) * 2; // -1 to 1 semitones range
      setPitchBendAmt(bendFactor);

      const targetString = SARANGI_STRINGS.find(s => s.id === activeStringId);
      if (targetString) {
        // Apply pitch bending formulation: f * 2^(cents / 1200)
        // Let's bend up to +/- 1.5 semitones for smooth slide glides
        const factor = Math.pow(2, (bendFactor * 1.5) / 12);
        synths.setSarangiFrequency(targetString.baseFreq * factor);
      }

      setBowSpeed(Math.round(volumeLevel * 100));
      synths.setSarangiIntensity(0.1 + volumeLevel * 0.82);
    }
  };

  const handleStopBowing = () => {
    setActiveStringId(null);
    setBowSpeed(0);
    setPitchBendAmt(0);
    synths.stopSarangi();
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 transition-all shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500">Immersive Playground</span>
          <h3 className="text-lg font-serif font-semibold text-stone-100 mt-0.5">Nepali Sarangi (4-String Fiddle)</h3>
        </div>
      </div>

      {/* Playing instructional banner */}
      <div className="bg-stone-950/60 p-3 border border-stone-850 rounded-xl text-[11px] text-stone-300 flex items-center gap-2.5 mb-5 mb-6">
        <Volume2 className="w-4 h-4 text-amber-500" />
        <span>
          <strong>Gandharva Guide:</strong> Click & drag your mouse (or hold your finger) along a wire. Drag <strong>Vertically</strong> to control bowing depth and <strong>Horizontally</strong> to mimic fingernail slides (pitchbend glissando)!
        </span>
      </div>

      {/* Main Interactive Fiddle Body Canvas */}
      <div
        ref={containerRef}
        onMouseMove={handlePointerMove}
        onMouseUp={handleStopBowing}
        onMouseLeave={handleStopBowing}
        onTouchMove={handlePointerMove}
        onTouchEnd={handleStopBowing}
        className="bg-stone-950 border border-stone-800/80 rounded-xl p-6 min-h-[300px] relative select-none cursor-crosshair overflow-hidden flex justify-center"
      >
        {/* Intricate wooden carved frame outlines */}
        <div className="absolute inset-x-0 bottom-4 text-[10px] font-mono select-none tracking-widest uppercase text-stone-600/60 text-center">
          Khirra Wood Fingerboard Space
        </div>

        {/* Fretless stringboard */}
        <div className="w-[160px] h-full bg-stone-900/40 border-x border-stone-850 relative flex items-center justify-between px-6 py-6 shadow-inner z-10">
          
          {/* Peg bindings on top */}
          <div className="absolute top-0 inset-x-0 h-4 bg-stone-950 border-b border-stone-800 flex justify-between px-1">
            <div className="w-2.5 h-2.5 rounded bg-amber-900 border border-amber-950" />
            <div className="w-2.5 h-2.5 rounded bg-amber-900 border border-amber-950" />
            <div className="w-2.5 h-2.5 rounded bg-amber-900 border border-amber-950" />
            <div className="w-2.5 h-2.5 rounded bg-amber-900 border border-amber-950" />
          </div>

          {SARANGI_STRINGS.map((str) => {
            const isActive = activeStringId === str.id;
            return (
              <div
                key={str.id}
                onMouseDown={(e) => handleStartBowing(str, e)}
                onTouchStart={(e) => handleStartBowing(str, e)}
                className="relative h-full flex flex-col items-center justify-center cursor-pointer group"
                style={{ width: "30px" }}
              >
                {/* Highlight string indicator glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-amber-500/5 blur-md rounded-full pointer-events-none select-none" />
                )}

                {/* The visual string line wire */}
                <div
                  className={`w-[2.5px] h-full transition-all duration-75 relative rounded-full ${
                    isActive
                      ? "bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)] scale-y-105 scale-x-125"
                      : "bg-gradient-to-t from-stone-600 via-stone-400 to-stone-600 group-hover:bg-stone-300"
                  }`}
                />

                {/* Left/Right vibration lines */}
                {isActive && (
                  <>
                    <div className="absolute w-[1px] h-full bg-amber-500/30 -left-1 animate-ping pointer-events-none select-none" />
                    <div className="absolute w-[1px] h-full bg-amber-500/30 -right-1 animate-ping pointer-events-none select-none" />
                  </>
                )}

                <span className="absolute bottom-2 text-[9px] font-mono tracking-wider font-extrabold uppercase text-stone-500 pointer-events-none select-none">
                  {str.label.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bow and Pitch Feedback Meter */}
      <div className="bg-stone-950/50 border border-stone-850 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span className="text-[10px] font-semibold text-stone-400 block mb-1.5 font-mono uppercase">
            Bow friction speed (Velocity)
          </span>
          <div className="flex items-center gap-2">
            <div className="w-full bg-stone-900 h-2 border border-stone-800 rounded-full overflow-hidden flex items-center">
              <div
                className="h-full bg-amber-500/80"
                style={{ width: `${bowSpeed}%` }}
              />
            </div>
            <span className="text-xs font-mono text-stone-300 w-8">{bowSpeed}%</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-stone-400 block mb-1.5 font-mono uppercase">
            Finger Nail glide bending (Cents)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-stone-500 shrink-0">Flat</span>
            <div className="w-full bg-stone-900 h-2 border border-stone-800 rounded-full relative overflow-hidden">
              <div
                className="absolute top-0 bottom-0 bg-amber-500 transition-all duration-100"
                style={{
                  left: pitchBendAmt >= 0 ? "50%" : `${50 + pitchBendAmt * 50}%`,
                  right: pitchBendAmt >= 0 ? `${50 - pitchBendAmt * 50}%` : "50%"
                }}
              />
              <div className="absolute inset-y-0 left-1/2 w-[1px] bg-stone-600/80" />
            </div>
            <span className="text-xs font-mono text-stone-300 w-10">
              {pitchBendAmt > 0 ? "+" : ""}{(pitchBendAmt * 150).toFixed(0)}c
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
