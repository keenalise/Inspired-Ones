import React from "react";
import { Sparkles, Music } from "lucide-react";

export function Navigation() {
  return (
    <nav className="border-b border-stone-800 bg-stone-950/60 backdrop-blur-md px-6 py-4 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between ">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-900/40 rounded-lg border border-amber-800/60 text-amber-500">
            <Music className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-100 flex items-center gap-1.5 font-serif">
              नेपाल <span className="text-amber-500 font-sans font-light">Dhwani</span>
            </h1>
            <p className="text-[10px] text-stone-400 font-mono tracking-widest uppercase">
              Nepali Traditional Instruments AI Portal
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 bg-stone-900 border border-stone-800 rounded-full px-3 py-1 font-mono text-[11px] text-stone-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            <span>AI Showroom</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
