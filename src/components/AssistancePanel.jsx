import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle, LifeBuoy, X } from 'lucide-react';
import { helps, hints } from '../puzzles.js';

const copy = {
  hint: {
    title: 'Solicitar pista.',
    text: 'Esta accion quedara reflejada en el expediente de la mision. ¿Deseas continuar?',
    cancel: 'Cancelar',
    confirm: 'Ver pista',
    icon: HelpCircle,
  },
  help: {
    title: 'Solicitar ayuda.',
    text: 'Esta intervencion quedara registrada de forma permanente en el expediente. ¿Deseas continuar?',
    cancel: 'Cancelar',
    confirm: 'Solicitar ayuda',
    icon: LifeBuoy,
  },
};

export default function AssistancePanel({ id, hintCount, helpCount, onRequest }) {
  const [pending, setPending] = useState(null);
  const visibleHints = hints[id].slice(0, hintCount);
  const visibleHelps = helps[id].slice(0, helpCount);
  const hasHint = hintCount < hints[id].length;
  const hasHelp = helpCount < helps[id].length;

  function confirm() {
    onRequest(pending);
    setPending(null);
  }

  return (
    <aside className="side-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="kicker">Expediente</p>
          <p className="mt-1 text-sm text-smoke">Pistas {hintCount} · Ayudas {helpCount}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="btn-ghost text-xs" onClick={() => setPending('hint')} disabled={!hasHint}>
          <HelpCircle className="h-4 w-4" /> Pista
        </button>
        <button className="btn-ghost text-xs" onClick={() => setPending('help')} disabled={!hasHelp}>
          <LifeBuoy className="h-4 w-4" /> Ayuda
        </button>
      </div>

      <div className="mt-4 space-y-3 text-sm text-smoke">
        {visibleHints.map((item, index) => (
          <div key={`hint-${item}`} className="border border-white/10 bg-white/[0.035] p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-brass">Pista {index + 1}</p>
            <p className="mt-1">{item}</p>
          </div>
        ))}
        {visibleHelps.map((item, index) => (
          <div key={`help-${item}`} className="border border-ember/30 bg-ember/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-ember">Ayuda {index + 1}</p>
            <p className="mt-1 text-champagne/90">{item}</p>
          </div>
        ))}
        {visibleHints.length === 0 && visibleHelps.length === 0 && (
          <p>Expediente limpio.</p>
        )}
      </div>

      <AnimatePresence>
        {pending && (
          <ConfirmModal
            kind={pending}
            onCancel={() => setPending(null)}
            onConfirm={confirm}
          />
        )}
      </AnimatePresence>
    </aside>
  );
}

function ConfirmModal({ kind, onCancel, onConfirm }) {
  const data = copy[kind];
  const Icon = data.icon;

  return (
    <motion.div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md border border-brass/30 bg-obsidian p-5 shadow-aureate"
        initial={{ y: 12, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 12, scale: 0.96 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="grid h-10 w-10 place-items-center border border-brass/30 bg-brass/10 text-brass">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-2xl text-champagne">{data.title}</h3>
              <p className="mt-2 text-sm text-smoke">{data.text}</p>
            </div>
          </div>
          <button className="btn-ghost h-9 w-9 px-0" onClick={onCancel} aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 grid gap-2 sm:flex sm:justify-end">
          <button className="btn-ghost" onClick={onCancel}>{data.cancel}</button>
          <button className={kind === 'help' ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>
            {data.confirm}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
