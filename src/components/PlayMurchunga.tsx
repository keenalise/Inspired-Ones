import React, { useState } from "react";
import { synths } from "../utils/audioHelper";
import { Zap, Activity, Volume2 } from "lucide-react";

export function PlayMurchunga() {
  const [mouthResonance, setMouthResonance] = useState<number>(0.35); // mouth open ratio 0 to 1
  const [isVibrating, setIsVibrating] = useState(false);

  const handlePluck = () => {
    synths.playMurchunga(mouthResonance);
    setIsVibrating(true);
    setTimeout(() => {
      setIsVibrating(false);
    }, 550);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 transition-all shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500">Immersive Playground</span>
          <h3 className="text-lg font-serif font-semibold text-stone-100 mt-0.5">Murchunga (Iron Jaw Harp)</h3>
        </div>
      </div>

      {/* Main playing interactive area */}
      <div className="bg-stone-950 border border-stone-800/60 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden mb-6 min-h-[200px]">
        {/* Visual vibration sound waves emanating from metal jaw */}
        {isVibrating && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none select-none">
            <div className="w-[180px] h-[180px] rounded-full border border-amber-500/10 animate-ping absolute" />
            <div className="w-[260px] h-[260px] rounded-full border border-amber-600/5 animate-ping absolute" style={{ animationDelay: "150ms" }} />
          </div>
        )}

        {/* Interactive Jaw Harp reed frame */}
        <div className="relative flex flex-col items-center justify-center select-none">
          
          {/* Iron ring harness */}
          <div className="w-56 h-18 rounded-[120px/40px] border-[5px] border-stone-700 bg-transparent relative flex items-center justify-center">
            
            {/* Center vibrating metal reed */}
            <button
              id="murchunga-reed-trigger"
              onClick={handlePluck}
              className={`absolute left-0 right-12 h-[3px] bg-amber-500 rounded-full cursor-pointer transition-all border-none outline-none origin-left ${
                isVibrating
                  ? "animate-bounce shadow-[0_0_8px_rgba(245,158,11,0.9)] scale-y-125"
                  : "hover:bg-amber-400"
              }`}
              style={{
                top: "calc(50% - 1.5px)"
              }}
              title="Click or Flick to Pluck"
            >
              {/* Plucking ring tip */}
              <div className="absolute right-0 -top-1.5 w-4.5 h-4.5 rounded-full border-2 border-amber-600 bg-stone-950 shadow flex items-center justify-center hover:scale-110 active:scale-90" />
            </button>

            {/* Hold points pointers */}
            <div className="absolute -left-1.5 w-4 h-6 rounded bg-stone-800 border border-stone-700" title="Tooth rest guards" />

          </div>
          
          <span className="text-[10px] uppercase font-mono tracking-widest text-stone-500 mt-6 pointer-events-none select-none">
            Flick the center metal reed to pluck
          </span>
        </div>
      </div>

      {/* Mouth filter envelope modifier */}
      <div className="bg-stone-950/50 border border-stone-850 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5 font-mono">
            <Activity className="w-4 h-4 text-amber-500" />
            Mouth Resonator filter (Wah-wah Effect)
          </span>
          <span className="text-xs font-mono text-stone-300">
            {mouthResonance < 0.3 ? "Closed 口" : mouthResonance < 0.7 ? "Vowelled 𠮷" : "Wide Open 𠮿"}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <input
            id="mouth-resonance-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={mouthResonance}
            onChange={(e) => setMouthResonance(Number(e.target.value))}
            className="flex-1 accent-amber-500 bg-stone-900 h-2.5 rounded-lg cursor-pointer"
          />
          
          <button
            id="pluck-trigger-btn"
            onClick={handlePluck}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-600 font-bold border border-amber-950/60 shadow-xl rounded-xl text-stone-100 flex items-center justify-center gap-2 text-xs font-semibold active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            Flick Reed
          </button>
        </div>
        
        <p className="text-[10px] text-stone-500 mt-2">
          💡 Adjusting the slider changes the volume of high/low resonant frequencies. Drag the slider while plucking continuously to simulate rapid tribal jaw harp breathing loops!
        </p>
      </div>
    </div>
  );
}
