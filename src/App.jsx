import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  KeyRound,
  LifeBuoy,
  RotateCcw,
  Shield,
  Sparkles,
} from 'lucide-react';
import ChessPhase from './components/ChessPhase.jsx';
import StablePhase from './components/StablePhase.jsx';
import DocumentPhase from './components/DocumentPhase.jsx';
import RoutePhase from './components/RoutePhase.jsx';
import TerminalPhase from './components/TerminalPhase.jsx';
import { phases } from './puzzles.js';
import { initialState, loadState, saveState, STORAGE_KEY } from './storage.js';

const FINAL_KEY = ['M', 'A', 'D', 'R', 'I', 'D'].join('');

export default function App() {
  const [state, setState] = useState(loadState);
  const [hostOpen, setHostOpen] = useState(false);
  const [phaseComplete, setPhaseComplete] = useState(null);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const next = `${typed}${event.key}`.toUpperCase().slice(-4);
      setTyped(next);
      if (next === 'HOST') {
        setHostOpen(true);
        setTyped('');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [typed]);

  const activePhase = phases[state.phase] ?? phases[0];

  const completedCount = useMemo(
    () => Object.values(state.tokens).filter(Boolean).length,
    [state.tokens]
  );

  const hintTotal = Object.values(state.hints).reduce((total, count) => total + count, 0);
  const helpTotal = Object.values(state.helps).reduce((total, count) => total + count, 0);

  function patchState(patch) {
    setState((current) => ({ ...current, ...patch }));
  }

  function patchNested(key, value) {
    setState((current) => ({
      ...current,
      [key]: { ...current[key], ...value },
    }));
  }

  function awardToken(key, token, nextPhase = state.phase + 1, evidenceKey = '') {
    setState((current) => ({
      ...current,
      tokens: { ...current.tokens, [key]: token },
      evidence: evidenceKey
        ? { ...current.evidence, [evidenceKey]: true }
        : current.evidence,
    }));

    if (key !== 'final') {
      setPhaseComplete({
        key,
        token,
        nextPhase: Math.min(nextPhase, phases.length - 1),
        evidenceKey,
      });
    }
  }

  function requestAssistance(id, kind) {
    setState((current) => ({
      ...current,
      [kind === 'help' ? 'helps' : 'hints']: {
        ...current[kind === 'help' ? 'helps' : 'hints'],
        [id]: Math.min(
          (current[kind === 'help' ? 'helps' : 'hints'][id] ?? 0) + 1,
          kind === 'help' ? 2 : 3
        ),
      },
      assistanceLog: [
        ...current.assistanceLog,
        { id, kind, at: new Date().toISOString() },
      ],
    }));
  }

  function continueAfterSuccess() {
    if (!phaseComplete) return;

    const nextPhase = phaseComplete.nextPhase;

    // Cambiamos primero la fase para que no quede un hueco entre pantallas.
    setState((current) => ({ ...current, phase: nextPhase }));
    setPhaseComplete(null);
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('archivo-privado-state-v2');
    localStorage.removeItem('archivo-privado-state-v1');
    setState(initialState);
    setPhaseComplete(null);
    setHostOpen(false);
    setTyped('');
  }

  const phaseProps = {
    state,
    patchState,
    patchNested,
    awardToken,
    requestAssistance,
  };

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-champagne">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(183,86,58,.18),transparent_28%),radial-gradient(circle_at_78%_20%,rgba(22,58,50,.24),transparent_32%),linear-gradient(135deg,#080807_0%,#11100e_55%,#1a1111_100%)]" />
        <div className="absolute inset-0 opacity-[0.09] luxury-grid" />
      </div>

      <header className="sticky top-0 z-30 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 backdrop-blur-md sm:px-6">
        <button
          type="button"
          className="group flex items-center gap-3 text-left"
          aria-label="Marca privada"
          onDoubleClick={() => setHostOpen(true)}
        >
          <span className="grid h-10 w-10 place-items-center border border-brass/30 bg-brass/10 font-display text-xl text-brass shadow-aureate">
            A
          </span>
          <span>
            <span className="block font-display text-xl leading-none tracking-normal text-champagne">
              Archivo
            </span>
            <span className="block text-[11px] uppercase tracking-[0.24em] text-smoke">
              Operación privada
            </span>
          </span>
        </button>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#11100e]/80 px-3 py-2 text-xs text-smoke">
          <Shield className="h-4 w-4 text-brass" />
          <span>
            {completedCount}/5 sellos · P{hintTotal} A{helpTotal}
          </span>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6">
        <div className="mb-5 grid gap-3 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-brass">
              {activePhase.eyebrow}
            </p>
            <h1 className="mt-1 font-display text-3xl leading-tight text-champagne sm:text-5xl">
              {activePhase.title}
            </h1>
          </div>
          <PhaseRail phase={state.phase} tokens={state.tokens} />
        </div>

        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={`${activePhase.id}-${state.phase}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="min-h-[72vh]">
              {activePhase.id === 'chess' && <ChessPhase {...phaseProps} />}
              {activePhase.id === 'stable' && <StablePhase {...phaseProps} />}
              {activePhase.id === 'document' && <DocumentPhase {...phaseProps} />}
              {activePhase.id === 'route' && <RoutePhase {...phaseProps} />}
              {activePhase.id === 'terminal' && <TerminalPhase {...phaseProps} />}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      <button
        type="button"
        className="fixed bottom-2 right-2 h-8 w-8 opacity-0"
        aria-label="Panel reservado"
        onClick={() => setHostOpen(true)}
      />

      <AnimatePresence initial={false}>
        {phaseComplete && (
          <SuccessModal
            key={`success-${phaseComplete.key}-${phaseComplete.token}`}
            phase={activePhase}
            token={phaseComplete.token}
            evidenceKey={phaseComplete.evidenceKey}
            onContinue={continueAfterSuccess}
          />
        )}

        {hostOpen && (
          <HostPanel
            state={state}
            setState={setState}
            resetAll={resetAll}
            close={() => setHostOpen(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function SuccessModal({ phase, token, evidenceKey, onContinue }) {
  const evidenceCopy = {
    chess: 'Evidencia secundaria archivada: dos observadores tallados en el marco.',
    stable: 'Evidencia secundaria archivada: dos anclajes de cuadra registrados.',
    document: 'Evidencia secundaria archivada: sello documental conservado.',
    route: 'Orden operativo certificado. La terminal queda preparada.',
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-lg border border-brass/35 bg-[#15110d] p-6 text-center shadow-aureate"
        initial={{ y: 18, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 18, scale: 0.96 }}
      >
        <p className="text-xs uppercase tracking-[0.28em] text-brass">
          {phase.eyebrow} cerrada
        </p>

        <div className="mx-auto mt-4 grid h-16 w-16 place-items-center border border-brass/30 bg-brass/10 text-brass">
          <BadgeCheck className="h-8 w-8" />
        </div>

        <h2 className="mt-4 font-display text-4xl text-champagne">
          Token recuperado
        </h2>

        <p className="mt-2 font-mono text-2xl text-brass">{token}</p>

        <p className="mx-auto mt-4 max-w-sm text-sm text-smoke">
          {evidenceCopy[evidenceKey] ?? 'El expediente queda actualizado.'}
        </p>

        <button type="button" className="btn-primary mt-6 w-full" onClick={onContinue}>
          Continuar
        </button>
      </motion.div>
    </motion.div>
  );
}

function PhaseRail({ phase, tokens }) {
  const tokenList = [
    tokens.noah,
    tokens.cuadra,
    tokens.laculataii,
    tokens.traza,
    tokens.final,
  ];

  return (
    <div className="flex items-center gap-2">
      {phases.map((item, index) => (
        <div
          key={item.id}
          className={`h-2.5 flex-1 rounded-full border sm:w-10 sm:flex-none ${
            index === phase
              ? 'border-brass bg-brass'
              : tokenList[index]
              ? 'border-pine bg-pine'
              : 'border-white/15 bg-white/5'
          }`}
        />
      ))}
    </div>
  );
}

function HostPanel({ state, setState, resetAll, close }) {
  const answers = [
    ['Fase I', 'NOAH', 'Caballo: 5-0 -> 4-2 -> 2-1 -> 1-3 -> 0-5'],
    ['Fase II', 'CUADRA', 'Orden: herradura, cubo, placa, manta, cierre, viga'],
    ['Fase III', 'LACULATAII', 'Piezas por filas: p1 p2 p3 / p4 p5 p6 / p7 p8 p9'],
    ['Fase IV', 'TRAZA', 'Orden correcto: anclajes, observadores, sello, copia anulada'],
    [
      'Fase V',
      FINAL_KEY,
      'revisar cuadra; revisar tablero; revisar archivo; revisar traza; matriz; abrir <clave>',
    ],
  ];

  function grantAll() {
    setState((current) => ({
      ...current,
      tokens: {
        noah: 'NOAH',
        cuadra: 'CUADRA',
        laculataii: 'LACULATAII',
        traza: 'TRAZA',
        final: FINAL_KEY,
      },
      evidence: { chess: true, stable: true, document: true, route: true },
      phase: 4,
    }));
  }

  function grantAssistance(kind) {
    const active = phases[state.phase]?.id ?? 'chess';
    const key = kind === 'help' ? 'helps' : 'hints';

    setState((current) => ({
      ...current,
      [key]: { ...current[key], [active]: (current[key][active] ?? 0) + 1 },
      assistanceLog: [
        ...current.assistanceLog,
        { id: active, kind, at: new Date().toISOString(), host: true },
      ],
    }));
  }

  function updateConfig(key, value) {
    setState((current) => ({
      ...current,
      config: { ...current.config, [key]: value },
    }));
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto border border-brass/30 bg-obsidian p-5 shadow-aureate"
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 12 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-brass">
              Modo host
            </p>
            <h2 className="mt-1 font-display text-3xl">Control de misión</h2>
          </div>

          <button type="button" className="btn-ghost" onClick={close}>
            Cerrar
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              setState((current) => ({
                ...current,
                phase: Math.max(0, current.phase - 1),
              }))
            }
          >
            <ChevronLeft className="h-4 w-4" /> Fase anterior
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              setState((current) => ({
                ...current,
                phase: Math.min(phases.length - 1, current.phase + 1),
              }))
            }
          >
            Fase siguiente <ChevronRight className="h-4 w-4" />
          </button>

          <button type="button" className="btn-secondary" onClick={grantAll}>
            <KeyRound className="h-4 w-4" /> Conceder tokens
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => grantAssistance('hint')}
          >
            <FileText className="h-4 w-4" /> Activar pista
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => grantAssistance('help')}
          >
            <LifeBuoy className="h-4 w-4" /> Desbloquear ayuda
          </button>

          <button type="button" className="btn-danger" onClick={resetAll}>
            <RotateCcw className="h-4 w-4" /> Resetear
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {Object.entries(state.evidence).map(([key, value]) => (
            <div key={key} className="border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-brass">
                {key}
              </p>
              <p className="mt-1 text-sm text-smoke">
                {value ? 'archivada' : 'pendiente'}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ['passengerName', 'Pasajera'],
            ['origin', 'Origen'],
            ['travelDate', 'Fecha'],
          ].map(([key, label]) => (
            <label
              key={key}
              className="text-xs uppercase tracking-[0.18em] text-brass"
            >
              {label}
              <input
                className="mt-2 w-full border border-white/10 bg-black/30 px-3 py-2 text-sm normal-case tracking-normal text-champagne outline-none"
                value={state.config[key]}
                onChange={(event) => updateConfig(key, event.target.value)}
              />
            </label>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {answers.map(([phase, token, detail]) => (
            <div key={phase} className="border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center gap-2 text-brass">
                <Eye className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.2em]">{phase}</span>
              </div>
              <p className="mt-2 font-mono text-sm text-champagne">{token}</p>
              <p className="mt-1 text-sm text-smoke">{detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-smoke">
          <Sparkles className="h-4 w-4 text-brass" />
          <span>Estado actual: fase {state.phase + 1}</span>
          <span>· Pistas {Object.values(state.hints).reduce((a, b) => a + b, 0)}</span>
          <span>· Ayudas {Object.values(state.helps).reduce((a, b) => a + b, 0)}</span>
          {Object.values(state.tokens).filter(Boolean).length === phases.length && (
            <>
              <BadgeCheck className="h-4 w-4 text-pine" />
              <span>completa</span>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
