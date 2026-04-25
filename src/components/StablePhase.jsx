import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Flashlight, RotateCcw, Sparkles } from 'lucide-react';
import AssistancePanel from './AssistancePanel.jsx';
import TokenSeal from './TokenSeal.jsx';
import { stableHotspots } from '../puzzles.js';

export default function StablePhase({
  state,
  patchNested,
  awardToken,
  requestAssistance,
}) {
  const sceneRef = useRef(null);
  const [light, setLight] = useState({ x: 42, y: 46 });
  const [message, setMessage] = useState(
    'La escena ya está viva. Usa la linterna para leer el rastro, no para adivinarlo.'
  );

  const found = state.stable.found;
  const token = state.tokens.cuadra;

  const visibleIds = useMemo(() => {
    return stableHotspots
      .filter((spot) => distance(light, spot) < 18)
      .map((spot) => spot.id);
  }, [light]);

  function moveLight(event) {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;

    const point = event.touches?.[0] ?? event;

    setLight({
      x: clamp(((point.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((point.clientY - rect.top) / rect.height) * 100, 0, 100),
    });
  }

  function collect(spot) {
    if (token || !visibleIds.includes(spot.id) || found.includes(spot.id)) return;

    const expected = stableHotspots[found.length];

    if (spot.id !== expected.id) {
      patchNested('stable', {
        found: [],
        mistakes: (state.stable.mistakes ?? 0) + 1,
      });
      setMessage('Rastro roto. La ronda vuelve al primer sello.');
      return;
    }

    const next = [...found, spot.id];
    patchNested('stable', { found: next });
    setMessage(`Sello ${next.length}/6 confirmado. Memoriza el siguiente tramo.`);

    if (next.length === stableHotspots.length) {
      setTimeout(() => awardToken('cuadra', 'CUADRA', 2, 'stable'), 350);
    }
  }

  function resetSequence() {
    patchNested('stable', { found: [] });
    setMessage('Secuencia activa reiniciada.');
  }

  const darknessStyle = {
    background: `
      radial-gradient(
        circle 150px at ${light.x}% ${light.y}%,
        rgba(0, 0, 0, 0.03) 0px,
        rgba(0, 0, 0, 0.08) 50px,
        rgba(0, 0, 0, 0.20) 95px,
        rgba(0, 0, 0, 0.66) 150px,
        rgba(0, 0, 0, 0.90) 250px,
        rgba(0, 0, 0, 0.96) 100%
      )
    `,
  };

  const beamStyle = {
    background: `
      radial-gradient(
        circle 115px at ${light.x}% ${light.y}%,
        rgba(212, 184, 122, 0.22) 0px,
        rgba(212, 184, 122, 0.12) 40px,
        rgba(212, 184, 122, 0.05) 78px,
        transparent 125px
      )
    `,
    mixBlendMode: 'screen',
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="mission-panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="kicker">Objetivo</p>
            <p className="mt-1 text-sm text-champagne">
              Activa seis sellos. Un error reinicia la ronda.
            </p>

            <div className="mt-3 flex gap-1.5">
              {stableHotspots.map((spot, index) => (
                <span
                  key={spot.id}
                  className={`h-2.5 flex-1 rounded-full border ${
                    index < found.length
                      ? 'border-brass bg-brass'
                      : 'border-white/15 bg-white/5'
                  }`}
                />
              ))}
            </div>

            <p className="mt-2 min-h-5 text-sm text-smoke">{message}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 rounded-full border border-brass/25 px-3 py-2 text-xs uppercase tracking-[0.18em] text-brass">
              <Flashlight className="h-4 w-4" />
              Linterna activa
            </div>

            <button type="button" className="btn-ghost text-xs" onClick={resetSequence}>
              <RotateCcw className="h-4 w-4" /> Reiniciar
            </button>
          </div>
        </div>

        <div
          ref={sceneRef}
          className="relative min-h-[520px] overflow-hidden rounded-[28px] border border-brass/20 bg-[#110d0b] touch-none shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
          onMouseMove={moveLight}
          onTouchMove={moveLight}
          onTouchStart={moveLight}
        >
          <div className="pointer-events-none absolute left-4 top-4 z-[30] rounded-full border border-brass/20 bg-black/35 px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-brass/90 backdrop-blur-sm">
            Linterna visible
          </div>

          <div className="pointer-events-none absolute right-4 top-4 z-[30] rounded-full border border-white/10 bg-black/35 px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-white/75 backdrop-blur-sm">
            No sigas la luz. Sigue el rastro.
          </div>

          <StableArtwork />

          <div
            className="pointer-events-none absolute inset-0 z-[10]"
            style={darknessStyle}
          />

          <div
            className="pointer-events-none absolute inset-0 z-[15]"
            style={beamStyle}
          />

          <div
            className="pointer-events-none absolute z-[20] h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brass/45 shadow-[0_0_30px_rgba(212,184,122,0.18)]"
            style={{ left: `${light.x}%`, top: `${light.y}%` }}
          >
            <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brass" />
          </div>

          {stableHotspots.map((spot) => {
            const visible = visibleIds.includes(spot.id);
            const isFound = found.includes(spot.id);

            return (
              <motion.button
                key={spot.id}
                type="button"
                className={`absolute z-[25] grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border ${
                  isFound
                    ? 'border-brass/40 bg-black/35 text-brass/45'
                    : visible
                    ? 'border-brass bg-brass/20 text-brass shadow-[0_0_24px_rgba(212,184,122,0.28)]'
                    : 'pointer-events-none border-transparent text-transparent'
                }`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                animate={{
                  scale: visible ? [1, 1.08, 1] : 0.75,
                  opacity: visible ? 1 : 0,
                }}
                transition={{
                  duration: 1.2,
                  repeat: visible && !isFound ? Infinity : 0,
                }}
                onClick={() => collect(spot)}
                aria-label={spot.label}
              >
                <Sparkles className="h-5 w-5" />
              </motion.button>
            );
          })}

          <div className="pointer-events-none absolute bottom-4 left-4 z-[30] rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.22em] text-brass/90">
              Progreso de ronda
            </p>
            <div className="mt-2 flex gap-1.5">
              {stableHotspots.map((spot, index) => (
                <span
                  key={`progress-${spot.id}`}
                  className={`h-2.5 w-8 rounded-full border ${
                    index < found.length
                      ? 'border-brass bg-brass'
                      : 'border-white/15 bg-white/5'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <TokenSeal token={token} />

        <AssistancePanel
          id="stable"
          hintCount={state.hints.stable}
          helpCount={state.helps.stable}
          onRequest={(kind) => requestAssistance('stable', kind)}
        />

        <div className="quiet-card text-sm text-smoke">
          <p className="kicker">Placa de ronda</p>
          <p className="mt-2">
            Los reflejos se apagan al salir de la luz. El archivo solo cuenta la
            secuencia activa.
          </p>
          <p className="mt-2 font-mono text-xs text-brass">
            hierro {'->'} agua {'->'} registro {'->'} abrigo {'->'} cierre {'->'} altura
          </p>
        </div>
      </div>
    </div>
  );
}

function StableArtwork() {
  return (
    <svg
      className="absolute inset-0 z-0 h-full w-full"
      viewBox="0 0 1000 620"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="wood" x1="0" x2="1">
          <stop offset="0" stopColor="#1b120e" />
          <stop offset="1" stopColor="#3a2418" />
        </linearGradient>

        <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#16110e" />
          <stop offset="1" stopColor="#070706" />
        </linearGradient>
      </defs>

      <rect width="1000" height="620" fill="#12100f" />
      <rect x="0" y="0" width="1000" height="390" fill="url(#wood)" />

      {Array.from({ length: 13 }).map((_, i) => (
        <rect
          key={i}
          x={i * 82}
          y="0"
          width="7"
          height="620"
          fill="#100d0a"
          opacity=".38"
        />
      ))}

      <rect x="0" y="390" width="1000" height="230" fill="url(#floor)" />
      <path
        d="M0 392 C210 360 410 434 620 396 C800 364 930 392 1000 374 L1000 620 L0 620 Z"
        fill="#12100d"
      />

      <rect
        x="95"
        y="116"
        width="210"
        height="270"
        fill="#1d1410"
        stroke="#8b6340"
        strokeWidth="4"
      />
      <rect
        x="360"
        y="96"
        width="250"
        height="290"
        fill="#1c1410"
        stroke="#8b6340"
        strokeWidth="4"
      />
      <rect
        x="670"
        y="126"
        width="220"
        height="260"
        fill="#1c1410"
        stroke="#8b6340"
        strokeWidth="4"
      />

      <path d="M112 240 C160 190 240 190 285 250 L285 385 L112 385 Z" fill="#160f0d" />
      <path d="M385 232 C442 172 540 183 590 250 L590 386 L385 386 Z" fill="#160f0d" />
      <path d="M690 252 C740 204 830 208 874 260 L874 386 L690 386 Z" fill="#160f0d" />

      <rect x="120" y="384" width="760" height="18" fill="#9a7140" />
      <rect x="480" y="148" width="80" height="42" fill="#c8aa63" opacity=".82" />

      <path
        d="M135 238 q38 32 0 66 q-30 -34 0 -66"
        fill="none"
        stroke="#dfb464"
        strokeWidth="10"
      />

      <ellipse cx="785" cy="470" rx="58" ry="22" fill="#b28347" opacity=".95" />
      <rect x="746" y="438" width="78" height="44" rx="8" fill="#7c5430" />

      <path d="M250 410 l120 34 l-42 74 l-132 -40 z" fill="#5f252e" />

      <path
        d="M612 420 q44 -44 110 -8 q-18 18 -40 48 q-44 -20 -70 -40"
        fill="none"
        stroke="#b37a46"
        strokeWidth="12"
      />
      <path d="M650 414 l32 54" stroke="#d1ad65" strokeWidth="5" />

      <path
        d="M842 280 h54 v190 h-54 z"
        fill="#251a13"
        stroke="#9c6f41"
        strokeWidth="5"
      />
      <circle cx="872" cy="300" r="10" fill="#d1ad65" />

      <path
        d="M80 522 C230 485 380 535 530 505 C700 470 830 520 980 488"
        fill="none"
        stroke="#624126"
        strokeWidth="8"
        opacity=".75"
      />

      <rect x="20" y="70" width="960" height="18" fill="#5a3d25" />
    </svg>
  );
}

function distance(light, spot) {
  return Math.hypot(light.x - spot.x, spot.y - light.y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}