import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Sparkles, Image as ImageIcon, CheckCircle, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";
import { IdentifiedInstrument } from "../types";

interface AIIdentifierProps {
  onInstrumentIdentified: (result: IdentifiedInstrument) => void;
}

// Sample mock base64 images corresponding to traditional instruments to let hackathon judges try it instantly!
import { SAMPLES } from "./sampleImages";

export function AIIdentifier({ onInstrumentIdentified }: AIIdentifierProps) {
  const [mode, setMode] = useState<"upload" | "camera">("upload");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream when component is unmounted or when camera mode changes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setError("Unable to access camera. Please double check permission blocks or try file upload instead!");
      setMode("upload");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleModeChange = (newMode: "upload" | "camera") => {
    setMode(newMode);
    setError(null);
    if (newMode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImagePreview(dataUrl);
        stopCamera();
        handleAnalyze(dataUrl);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        setImagePreview(resultStr);
        handleAnalyze(resultStr);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const loadSample = (sampleId: "madal" | "bansuri" | "sarangi" | "murchunga") => {
    const base64Data = SAMPLES[sampleId];
    setImagePreview(base64Data);
    handleAnalyze(base64Data);
  };

  const handleAnalyze = async (base64Image: string) => {
    setAnalyzing(true);
    setError(null);
    try {
      const response = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server responded with an identification fault");
      }

      const parsedData: IdentifiedInstrument = await response.json();
      onInstrumentIdentified(parsedData);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err?.message || "Failed to parse instrument image. Verify internet connectivity.");
    } finally {
      setAnalyzing(false);
    }
  };

  const resetSelection = () => {
    setImagePreview(null);
    setError(null);
    if (mode === "camera") {
      startCamera();
    }
  };

  return (
    <div id="ai-capture-panel" className="bg-stone-900/90 border border-stone-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-stone-800">
        <div>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2 font-serif">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            AI Instrument Scan
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Snap a picture or upload an instrument to unlock its digital playable twin instantly
          </p>
        </div>
        
        {/* Mode Selector */}
        <div className="flex gap-1.5 bg-stone-950 p-1 rounded-lg mt-3 md:mt-0 max-w-[280px]">
          <button
            id="mode-upload-btn"
            onClick={() => handleModeChange("upload")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3.5 rounded-md text-xs font-medium tracking-wide transition-all ${
              mode === "upload"
                ? "bg-amber-800 text-stone-100 font-semibold"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
          <button
            id="mode-camera-btn"
            onClick={() => handleModeChange("camera")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3.5 rounded-md text-xs font-medium tracking-wide transition-all ${
              mode === "camera"
                ? "bg-amber-800 text-stone-100 font-semibold"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Live Camera
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-4 mb-5 text-red-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Identification Alert</span>
            {error}
          </div>
        </div>
      )}

      {/* Primary Display Area */}
      <div className="relative aspect-video rounded-xl bg-stone-950/60 border border-stone-800 overflow-hidden flex flex-col items-center justify-center transition-all">
        {imagePreview ? (
          // Preview state
          <div className="relative w-full h-full flex items-center justify-center bg-stone-950">
            <img
              src={imagePreview}
              alt="Uploaded scanner workspace"
              className="w-full h-full object-contain"
            />
            
            {/* Analyzer Overlay */}
            {analyzing ? (
              <div className="absolute inset-0 bg-stone-950/80 flex flex-col items-center justify-center backdrop-blur-sm">
                <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
                <div className="relative">
                  <span className="text-sm font-semibold tracking-wide text-amber-500 animate-pulse">
                    Spectral AI Analyzing...
                  </span>
                  <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent absolute -bottom-1 left-1/2 -translate-x-1/2 animate-bounce" />
                </div>
                <p className="text-[10px] uppercase font-mono tracking-widest text-stone-400 mt-2">
                  Matching Nepali acoustic structures
                </p>
              </div>
            ) : (
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button
                  id="reset-preview-btn"
                  onClick={resetSelection}
                  className="bg-stone-900/90 hover:bg-stone-800 border border-stone-700/60 text-stone-200 text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow-lg font-mono"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Scan New
                </button>
              </div>
            )}
          </div>
        ) : mode === "camera" ? (
          // Camera active workspace
          <div className="relative w-full h-full flex items-center justify-center bg-stone-950">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            {/* Hidden canvas for snapshot capturing */}
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
              <button
                id="capture-photo-btn"
                onClick={capturePhoto}
                className="w-12 h-12 rounded-full border-4 border-stone-800 bg-amber-600 hover:bg-amber-500 active:scale-95 flex items-center justify-center shadow-xl transition-all"
                title="Capture Picture"
              >
                <div className="w-4 h-4 rounded-full bg-stone-950" />
              </button>
            </div>
          </div>
        ) : (
          // Drag and Drop view
          <div
            onClick={triggerFileSelect}
            className="w-full h-full flex flex-col items-center justify-center text-center p-8 cursor-pointer group hover:bg-stone-850/30 transition-all border-2 border-dashed border-stone-800 hover:border-amber-800"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="p-4 bg-stone-900/80 border border-stone-850 rounded-2xl text-stone-400 group-hover:text-amber-500 group-hover:bg-amber-950/20 group-hover:border-amber-900/50 transition-all mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-stone-300">
              Drag and drop instrument picture here
            </p>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">
              Supports JPEG, PNG, or WEBP photos taken on your smartphone or webcam
            </p>
            <span className="text-xs font-semibold uppercase font-mono tracking-widest text-amber-600 mt-4 group-hover:text-amber-500">
              or Browse Files
            </span>
          </div>
        )}
      </div>

      {/* AI Demo Sample Presets */}
      <div className="mt-6">
        <div className="flex items-center gap-1.5 mb-3">
          <HelpCircle className="w-4 h-4 text-stone-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 font-mono">
            No physical instrument? Try high-fidelity test samples!
          </h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            id="sample-madal-btn"
            disabled={analyzing}
            onClick={() => loadSample("madal")}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-950 hover:bg-amber-950/20 hover:border-amber-900 border border-stone-800 transition-all group duration-300 text-left"
          >
            <div className="w-full h-14 rounded-lg bg-stone-900 overflow-hidden mb-2 flex items-center justify-center text-3xl font-serif">
              🥁
            </div>
            <span className="text-[11px] font-semibold text-stone-300 group-hover:text-amber-500">Madal Sample</span>
          </button>
          
          <button
            id="sample-bansuri-btn"
            disabled={analyzing}
            onClick={() => loadSample("bansuri")}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-950 hover:bg-amber-950/20 hover:border-amber-900 border border-stone-800 transition-all group duration-300 text-left"
          >
            <div className="w-full h-14 rounded-lg bg-stone-900 overflow-hidden mb-2 flex items-center justify-center text-3xl font-serif">
              🎋
            </div>
            <span className="text-[11px] font-semibold text-stone-300 group-hover:text-amber-500">Flute Sample</span>
          </button>

          <button
            id="sample-sarangi-btn"
            disabled={analyzing}
            onClick={() => loadSample("sarangi")}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-950 hover:bg-amber-950/20 hover:border-amber-900 border border-stone-800 transition-all group duration-300 text-left"
          >
            <div className="w-full h-14 rounded-lg bg-stone-900 overflow-hidden mb-2 flex items-center justify-center text-3xl font-serif">
              🎻
            </div>
            <span className="text-[11px] font-semibold text-stone-300 group-hover:text-amber-500">Sarangi Sample</span>
          </button>

          <button
            id="sample-murchunga-btn"
            disabled={analyzing}
            onClick={() => loadSample("murchunga")}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-950 hover:bg-amber-950/20 hover:border-amber-900 border border-stone-800 transition-all group duration-300 text-left"
          >
            <div className="w-full h-14 rounded-lg bg-stone-900 overflow-hidden mb-2 flex items-center justify-center text-3xl font-serif">
              📐
            </div>
            <span className="text-[11px] font-semibold text-stone-300 group-hover:text-amber-500">Murchunga Sample</span>
          </button>
        </div>
      </div>
    </div>
  );
}
