import React, { useState } from "react";
import { Navigation } from "./components/Navigation";
import { AIIdentifier } from "./components/AIIdentifier";
import { PlayMadal } from "./components/PlayMadal";
import { PlayBansuri } from "./components/PlayBansuri";
import { PlaySarangi } from "./components/PlaySarangi";
import { PlayMurchunga } from "./components/PlayMurchunga";
import { PRESET_INSTRUMENTS } from "./data/presets";
import { IdentifiedInstrument, InstrumentPreset } from "./types";
import { synths } from "./utils/audioHelper";
import {
  FileText,
  Volume2,
  BookOpen,
  HelpCircle,
  Sparkles,
  Award,
  ArrowRight,
  ShieldCheck,
  Globe
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"madal" | "bansuri" | "sarangi" | "murchunga">("madal");
  const [identifiedResult, setIdentifiedResult] = useState<IdentifiedInstrument | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

  const handleInitializeAudio = () => {
    synths.init();
    setAudioInitialized(true);
  };

  const handleInstrumentIdentified = (result: IdentifiedInstrument) => {
    setIdentifiedResult(result);
    // If the identified instrument matches one of our 4 custom virtual play versions, switch the active play tab to it!
    if (
      result.matchedInstrumentId === "madal" ||
      result.matchedInstrumentId === "bansuri" ||
      result.matchedInstrumentId === "sarangi" ||
      result.matchedInstrumentId === "murchunga"
    ) {
      setActiveTab(result.matchedInstrumentId);
    }
  };

  // Grab the details showing in the information tab (either AI-identified or preset-defined)
  const currentPreset: InstrumentPreset = PRESET_INSTRUMENTS.find((p) => p.id === activeTab)!;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-800 selection:text-white pb-16">
      
      {/* Top Navigation Row */}
      <Navigation />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Scan portal & Info blocks (5 Cols out of 12) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Audio Initializer Welcome Block for security compliance */}
          {!audioInitialized && (
            <div className="bg-gradient-to-br from-amber-950/60 via-stone-900 to-stone-950 border border-amber-800/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                <h3 className="text-sm font-semibold text-amber-500 font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Acoustic Engine Offline
                </h3>
                <p className="text-xs text-stone-300 mt-1">
                  Interact to initialize Himalayan high-fidelity physical synthesizers.
                </p>
              </div>
              <button
                id="btn-initialize-audio"
                onClick={handleInitializeAudio}
                className="w-full sm:w-auto px-4.5 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs tracking-wider transition-all shadow-lg active:scale-95"
              >
                Initalize Sound
              </button>
            </div>
          )}

          {/* AI Scanner Module */}
          <AIIdentifier onInstrumentIdentified={handleInstrumentIdentified} />

          {/* AI Scan Result Details or Preset Details Container */}
          <div className="bg-stone-900/90 border border-stone-850 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
            {/* Fine design background elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            {identifiedResult ? (
              // AI Identified Layout Block
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 bg-amber-950/40 border border-amber-800/50 rounded-full font-mono text-[9px] font-bold tracking-wider text-amber-500 uppercase">
                      AI Scan Result
                    </span>
                  </div>
                  <button
                    id="clear-scan-btn"
                    onClick={() => setIdentifiedResult(null)}
                    className="text-[10px] text-stone-400 hover:text-stone-300 font-mono uppercase underline underline-offset-4"
                  >
                    Clear Match
                  </button>
                </div>

                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-serif font-bold text-stone-100">
                    {identifiedResult.name}
                  </h3>
                  <span className="text-sm font-semibold text-amber-500 font-serif">
                    ({identifiedResult.localName})
                  </span>
                </div>
                
                <span className="text-xs font-mono text-stone-450 block mt-1 uppercase tracking-wider text-stone-400">
                  Category: {identifiedResult.category}
                </span>

                <p className="text-sm text-stone-300 mt-3.5 leading-relaxed font-sans">
                  {identifiedResult.shortDescription}
                </p>

                {/* Instrument History */}
                <div className="mt-5 pt-4 border-t border-stone-850">
                  <span className="text-xs font-semibold text-stone-400 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-2">
                     <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                     Traditional History & Context
                  </span>
                  <p className="text-xs text-stone-400 leading-relaxed font-sans">
                    {identifiedResult.history}
                  </p>
                </div>

                {/* Instrumental Facts */}
                <div className="mt-5">
                  <span className="text-xs font-semibold text-stone-400 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-2">
                     <Award className="w-3.5 h-3.5 text-amber-500" />
                     Acoustic & Cultural Facts
                  </span>
                  <ul className="space-y-2 mt-2">
                    {identifiedResult.facts.map((fact, idx) => (
                      <li key={idx} className="text-xs text-stone-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Playing advice */}
                <div className="mt-6 bg-stone-950/40 border border-stone-850 p-4 rounded-xl">
                  <span className="text-xs font-bold text-amber-500 uppercase font-mono tracking-wider block mb-1">
                    Playing Synthesis Guide
                  </span>
                  <p className="text-xs text-stone-300 leading-relaxed font-sans">
                    {identifiedResult.playingGuidance}
                  </p>
                </div>
              </div>
            ) : (
              // Default Preset Explorer Layout Block
              <div>
                <div className="flex items-center gap-2 mb-4 border-b border-stone-800 pb-3">
                  <span className="p-1 px-2.5 bg-stone-950 border border-stone-800 rounded-full font-mono text-[9px] font-bold tracking-wider text-stone-450 uppercase">
                    Showroom Catalog
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-serif font-bold text-stone-100">
                    {currentPreset.name}
                  </h3>
                  <span className="text-sm font-semibold text-amber-500 font-serif">
                    ({currentPreset.localName})
                  </span>
                </div>
                
                <span className="text-xs font-mono text-stone-450 block mt-1 uppercase tracking-wider text-stone-400">
                  {currentPreset.category}
                </span>

                <p className="text-sm text-amber-550 italic text-amber-600/90 font-medium text-xs uppercase tracking-wide mt-2">
                  &ldquo;{currentPreset.tagline}&rdquo;
                </p>

                <p className="text-sm text-stone-300 mt-3.5 leading-relaxed font-sans">
                  {currentPreset.description}
                </p>

                {/* Instrument History */}
                <div className="mt-5 pt-4 border-t border-stone-850">
                  <span className="text-xs font-semibold text-stone-400 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-2">
                     <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                     Traditional History & Context
                  </span>
                  <p className="text-xs text-stone-400 leading-relaxed font-sans">
                    {currentPreset.history}
                  </p>
                </div>

                {/* Instrumental Facts */}
                <div className="mt-5">
                  <span className="text-xs font-semibold text-stone-400 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-2">
                     <Award className="w-3.5 h-3.5 text-amber-500" />
                     Acoustic & Cultural Facts
                  </span>
                  <ul className="space-y-2 mt-2">
                    {currentPreset.facts.map((fact, idx) => (
                      <li key={idx} className="text-xs text-stone-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Side: Immersive Interactive Playground (7 Cols out of 12) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Instrument Selector Tabs Bar */}
          <div className="bg-stone-900/90 border border-stone-800/80 p-1.5 rounded-2xl shadow-xl flex flex-wrap gap-1">
            {(["madal", "bansuri", "sarangi", "murchunga"] as const).map((tabId) => {
              const metadata = PRESET_INSTRUMENTS.find((p) => p.id === tabId)!;
              const isSelected = activeTab === tabId;
              
              let Icon = "🥁";
              if (tabId === "bansuri") Icon = "🎋";
              if (tabId === "sarangi") Icon = "🎻";
              if (tabId === "murchunga") Icon = "📐";

              return (
                <button
                  id={`tab-select-${tabId}`}
                  key={tabId}
                  onClick={() => {
                    setActiveTab(tabId);
                    // Force start synth parameters if not matched to AI results
                  }}
                  className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl flex items-center gap-2.5 transition-all outline-none border focus:ring-1 focus:ring-amber-500/30 ${
                    isSelected
                      ? "bg-amber-800 border-amber-700/80 text-white shadow-lg shadow-amber-950/40"
                      : "bg-stone-950/40 border-stone-850 hover:bg-stone-850 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <span className="text-xl leading-none">{Icon}</span>
                  <div className="text-left">
                    <span className="block text-xs font-bold leading-tight">{metadata.name}</span>
                    <span className="block text-[10px] opacity-75 leading-none font-serif">{metadata.localName}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Play Workbench Frame */}
          <div className="relative">
            {activeTab === "madal" && <PlayMadal />}
            {activeTab === "bansuri" && <PlayBansuri />}
            {activeTab === "sarangi" && <PlaySarangi />}
            {activeTab === "murchunga" && <PlayMurchunga />}
          </div>

          {/* Dynamic footer credits for the hackathon */}
          <div className="bg-stone-900/40 border border-stone-850 rounded-xl p-4 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-400 select-none">
            <span className="flex items-center gap-1.5 justify-center">
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              Preserving Nepalese Himalayan Musical Ethno-Heritage
            </span>
            <span className="font-mono text-stone-500">
              Tech Stack: React • Generative AI • Web Audio API Synthesis
            </span>
          </div>

        </div>

      </main>
    </div>
  );
}
