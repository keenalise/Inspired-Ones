import React, { useState, useEffect, useRef, useCallback } from "react";
import { synths } from "../utils/audioHelper";

// ── Types ────────────────────────────────────────────────────────────────────

interface SarangiString {
  id: number;
  label: string;
  sargam: string;
  note: string;
  baseFreq: number;
  color: string;
  glowColor: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const SARANGI_STRINGS: SarangiString[] = [
  {
    id: 1,
    label: "Sa",
    sargam: "𝄞 Sa",
    note: "G3",
    baseFreq: 196.0,
    color: "#d97706",
    glowColor: "rgba(217,119,6,0.7)",
  },
  {
    id: 2,
    label: "Pa",
    sargam: "𝄞 Pa",
    note: "C4",
    baseFreq: 261.63,
    color: "#b45309",
    glowColor: "rgba(180,83,9,0.7)",
  },
  {
    id: 3,
    label: "Ma",
    sargam: "𝄞 Ma",
    note: "E4",
    baseFreq: 329.63,
    color: "#92400e",
    glowColor: "rgba(146,64,14,0.7)",
  },
  {
    id: 4,
    label: "Sa′",
    sargam: "𝄞 Sa′",
    note: "G4",
    baseFreq: 392.0,
    color: "#78350f",
    glowColor: "rgba(120,53,15,0.7)",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export function PlaySarangi() {
  const [activeStringId, setActiveStringId] = useState<number | null>(null);
  const [bowSpeed, setBowSpeed] = useState(0);
  const [pitchBend, setPitchBend] = useState(0); // -1 to 1
  const [ripples, setRipples] = useState<{ id: number; strId: number }[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const rippleCount = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => { synths.stopSarangi(); };
  }, []);

  // Add vibration ripple effect
  const addRipple = useCallback((strId: number) => {
    const id = rippleCount.current++;
    setRipples((prev) => [...prev.slice(-6), { id, strId }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }, []);

  const handleStartBowing = useCallback(
    (str: SarangiString, e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setHasInteracted(true);
      setActiveStringId(str.id);
      addRipple(str.id);

      // FIX: startSarangi now calls stopSarangi() internally, no double-start bug
      synths.startSarangi();
      synths.setSarangiFrequency(str.baseFreq);
      synths.setSarangiIntensity(0.6);
      setBowSpeed(60);
      setPitchBend(0);
    },
    [addRipple]
  );

  const handlePointerMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (activeStringId === null || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX =
        "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY =
        "touches" in e ? e.touches[0].clientY : e.clientY;

      // Vertical → volume (top = louder)
      const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      const volume = 1.0 - relY;

      // Horizontal → pitch bend (-1 to +1)
      const relX = (clientX - rect.left) / rect.width;
      const bend = (relX - 0.5) * 2;
      setPitchBend(bend);

      const str = SARANGI_STRINGS.find((s) => s.id === activeStringId);
      if (str) {
        const factor = Math.pow(2, (bend * 1.5) / 12);
        synths.setSarangiFrequency(str.baseFreq * factor);
      }

      setBowSpeed(Math.round(volume * 100));
      synths.setSarangiIntensity(0.1 + volume * 0.85);
    },
    [activeStringId]
  );

  const handleStopBowing = useCallback(() => {
    setActiveStringId(null);
    setBowSpeed(0);
    setPitchBend(0);
    synths.stopSarangi();
  }, []);

  return (
    <div
      style={{
        background: "linear-gradient(160deg, #1c1107 0%, #0f0a04 60%, #1a0f06 100%)",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        borderRadius: "20px",
        border: "1px solid #3d2a10",
        padding: "28px",
        maxWidth: "560px",
        margin: "0 auto",
        boxShadow:
          "0 0 0 1px #2a1a08, 0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,200,80,0.08)",
        userSelect: "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grain texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 1, marginBottom: "22px" }}>
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#b45309",
            fontFamily: "monospace",
            marginBottom: "6px",
          }}
        >
          ◈ Nepali Sarangi — Synthesized Fiddle ◈
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: 700,
            color: "#fef3c7",
            letterSpacing: "0.02em",
            textShadow: "0 0 30px rgba(217,119,6,0.4)",
          }}
        >
          Bow the Strings
        </h2>

        {/* Instruction hint */}
        <p
          style={{
            margin: "8px 0 0",
            fontSize: "11.5px",
            color: "#78716c",
            lineHeight: 1.5,
          }}
        >
          {hasInteracted
            ? "↕ Drag vertically for bow pressure · ↔ Slide horizontally to bend pitch"
            : "Click & hold a string to begin playing"}
        </p>
      </div>

      {/* Main fingerboard area */}
      <div
        ref={containerRef}
        onMouseMove={handlePointerMove}
        onMouseUp={handleStopBowing}
        onMouseLeave={handleStopBowing}
        onTouchMove={handlePointerMove}
        onTouchEnd={handleStopBowing}
        style={{
          position: "relative",
          zIndex: 1,
          background:
            "linear-gradient(180deg, #1a0f04 0%, #120b02 40%, #1a0f04 100%)",
          border: "1px solid #3d2510",
          borderRadius: "14px",
          height: "280px",
          cursor: activeStringId ? "crosshair" : "default",
          overflow: "hidden",
          boxShadow: "inset 0 2px 12px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(255,200,80,0.05)",
        }}
      >
        {/* Wood grain lines */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${8 + i * 12}%`,
              width: "1px",
              background: "rgba(255,200,80,0.025)",
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Nut at the top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "10px",
            background: "linear-gradient(180deg, #5c3d1a 0%, #3d2810 100%)",
            borderBottom: "1px solid #7c5a2a",
            zIndex: 3,
          }}
        />

        {/* Bridge at the bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "10px",
            background: "linear-gradient(0deg, #5c3d1a 0%, #3d2810 100%)",
            borderTop: "1px solid #7c5a2a",
            zIndex: 3,
          }}
        />

        {/* Strings */}
        <div
          style={{
            position: "absolute",
            inset: "10px 0",
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
            gap: "0px",
            padding: "0 40px",
          }}
        >
          {SARANGI_STRINGS.map((str, idx) => {
            const isActive = activeStringId === str.id;
            // String thickness increases from high to low
            const thickness = 1.5 + (SARANGI_STRINGS.length - 1 - idx) * 0.7;

            return (
              <div
                key={str.id}
                onMouseDown={(e) => handleStartBowing(str, e)}
                onTouchStart={(e) => handleStartBowing(str, e)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "stretch",
                  cursor: "pointer",
                  position: "relative",
                  padding: "0 12px",
                }}
              >
                {/* Glow halo behind active string */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      inset: "0 -8px",
                      background: `radial-gradient(ellipse 30px 100% at 50% 50%, ${str.glowColor} 0%, transparent 70%)`,
                      pointerEvents: "none",
                      animation: "pulse 0.3s ease-in-out infinite alternate",
                    }}
                  />
                )}

                {/* The string */}
                <div
                  style={{
                    width: `${thickness}px`,
                    flex: 1,
                    borderRadius: `${thickness}px`,
                    background: isActive
                      ? `linear-gradient(180deg, ${str.color} 0%, #fbbf24 50%, ${str.color} 100%)`
                      : `linear-gradient(180deg, #57534e 0%, #a8a29e 40%, #78716c 70%, #57534e 100%)`,
                    boxShadow: isActive
                      ? `0 0 8px 2px ${str.glowColor}, 0 0 20px ${str.glowColor}`
                      : "none",
                    transition: "background 0.08s, box-shadow 0.08s",
                    transform: isActive ? `scaleX(${1 + 0.5 / thickness})` : "scaleX(1)",
                    position: "relative",
                    zIndex: 2,
                  }}
                />

                {/* String label below bridge */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "-24px",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    color: isActive ? str.color : "#57534e",
                    letterSpacing: "0.05em",
                    transition: "color 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {str.label}
                </div>

                {/* Note label above nut */}
                <div
                  style={{
                    position: "absolute",
                    top: "-22px",
                    fontSize: "9px",
                    fontFamily: "monospace",
                    color: isActive ? "#fbbf24" : "#44403c",
                    transition: "color 0.15s",
                  }}
                >
                  {str.note}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ripple effects */}
        {ripples.map((ripple) => {
          const str = SARANGI_STRINGS.find((s) => s.id === ripple.strId);
          if (!str) return null;
          const strIdx = SARANGI_STRINGS.indexOf(str);
          const xPct = 40 + (strIdx / (SARANGI_STRINGS.length - 1)) * 20;
          return (
            <div
              key={ripple.id}
              style={{
                position: "absolute",
                top: "50%",
                left: `${xPct}%`,
                transform: "translate(-50%, -50%)",
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: str.color,
                animation: "rippleOut 0.6s ease-out forwards",
                pointerEvents: "none",
                zIndex: 4,
              }}
            />
          );
        })}

        {/* No-interaction hint overlay */}
        {!hasInteracted && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <div
              style={{
                background: "rgba(15,10,4,0.75)",
                border: "1px solid #3d2510",
                borderRadius: "10px",
                padding: "10px 18px",
                fontSize: "12px",
                color: "#a8a29e",
                letterSpacing: "0.05em",
                backdropFilter: "blur(4px)",
              }}
            >
              ↓ Press a string to play
            </div>
          </div>
        )}
      </div>

      {/* String labels row */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "0 40px",
          marginTop: "28px",
          gap: "0px",
        }}
      >
        {SARANGI_STRINGS.map((str) => {
          const isActive = activeStringId === str.id;
          return (
            <div
              key={str.id}
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: "10px",
                fontFamily: "monospace",
                letterSpacing: "0.04em",
                color: isActive ? str.color : "#44403c",
                transition: "color 0.15s",
              }}
            >
              {str.sargam}
            </div>
          );
        })}
      </div>

      {/* Meters */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
          marginTop: "20px",
        }}
      >
        {/* Bow Speed */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid #2a1a08",
            borderRadius: "10px",
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              fontFamily: "monospace",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#78716c",
              marginBottom: "8px",
            }}
          >
            Bow Pressure
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                flex: 1,
                height: "4px",
                background: "#1c1107",
                borderRadius: "2px",
                overflow: "hidden",
                border: "1px solid #2a1a08",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${bowSpeed}%`,
                  background:
                    bowSpeed > 70
                      ? "linear-gradient(90deg, #b45309, #fbbf24)"
                      : bowSpeed > 30
                      ? "linear-gradient(90deg, #92400e, #b45309)"
                      : "#78350f",
                  borderRadius: "2px",
                  transition: "width 0.06s linear",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "monospace",
                color: "#a8a29e",
                minWidth: "30px",
                textAlign: "right",
              }}
            >
              {bowSpeed}%
            </span>
          </div>
        </div>

        {/* Pitch Bend */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid #2a1a08",
            borderRadius: "10px",
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              fontFamily: "monospace",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#78716c",
              marginBottom: "8px",
            }}
          >
            Pitch Slide
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "9px", color: "#44403c", fontFamily: "monospace" }}>♭</span>
            <div
              style={{
                flex: 1,
                height: "4px",
                background: "#1c1107",
                borderRadius: "2px",
                overflow: "visible",
                border: "1px solid #2a1a08",
                position: "relative",
              }}
            >
              {/* Center line */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "-2px",
                  bottom: "-2px",
                  width: "1px",
                  background: "#3d2510",
                }}
              />
              {/* Bend fill */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: pitchBend >= 0 ? "50%" : `${50 + pitchBend * 50}%`,
                  right: pitchBend >= 0 ? `${50 - pitchBend * 50}%` : "50%",
                  background: "linear-gradient(90deg, #b45309, #fbbf24)",
                  borderRadius: "2px",
                  transition: "left 0.05s, right 0.05s",
                }}
              />
            </div>
            <span style={{ fontSize: "9px", color: "#44403c", fontFamily: "monospace" }}>♯</span>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "monospace",
                color: "#a8a29e",
                minWidth: "34px",
                textAlign: "right",
              }}
            >
              {pitchBend > 0 ? "+" : ""}
              {(pitchBend * 150).toFixed(0)}c
            </span>
          </div>
        </div>
      </div>

      {/* Active string info bar */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: "14px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {activeStringId ? (
          () => {
            const str = SARANGI_STRINGS.find((s) => s.id === activeStringId)!;
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: str.color,
                  background: "rgba(255,200,80,0.04)",
                  border: `1px solid ${str.color}40`,
                  borderRadius: "20px",
                  padding: "5px 16px",
                  letterSpacing: "0.08em",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: str.color,
                    boxShadow: `0 0 6px ${str.glowColor}`,
                    animation: "pulse 0.5s ease-in-out infinite alternate",
                  }}
                />
                {str.sargam} · {str.note} · {str.baseFreq} Hz
              </div>
            );
          }
        )() : (
          <div
            style={{
              fontSize: "10px",
              fontFamily: "monospace",
              color: "#2a1a08",
              letterSpacing: "0.1em",
            }}
          >
            — no string active —
          </div>
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          from { opacity: 0.7; }
          to   { opacity: 1; }
        }
        @keyframes rippleOut {
          0%   { transform: translate(-50%,-50%) scale(1); opacity: 0.9; }
          100% { transform: translate(-50%,-50%) scale(18); opacity: 0; }
        }
      `}</style>
    </div>
  );
}