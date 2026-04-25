import { useMemo, useState } from 'react';
import { ArrowRight, ClipboardCheck, RotateCcw } from 'lucide-react';
import AssistancePanel from './AssistancePanel.jsx';
import TokenSeal from './TokenSeal.jsx';
import { routeDossiers, routeSlots, routeSolution } from '../puzzles.js';

export default function RoutePhase({ state, patchNested, awardToken, requestAssistance }) {
  const [selected, setSelected] = useState('');
  const [status, setStatus] = useState('Ordena la terna valida. La copia anulada queda fuera de la matriz.');
  const route = state.route;
  const token = state.tokens.traza;
  const dossierById = useMemo(() => Object.fromEntries(routeDossiers.map((item) => [item.id, item])), []);
  const placedIds = Object.values(route.placed);
  const tray = routeDossiers.filter((item) => !placedIds.includes(item.id));

  function select(id) {
    if (token) return;
    setSelected(id);
  }

  function place(slot) {
    if (!selected || token) return;
    const previousSlot = Object.entries(route.placed).find(([, id]) => id === selected)?.[0];
    const previousAtSlot = route.placed[slot];
    const next = { ...route.placed };

    if (previousSlot) delete next[previousSlot];
    if (previousAtSlot && previousSlot) next[previousSlot] = previousAtSlot;
    next[slot] = selected;

    patchNested('route', { placed: next });
    setStatus('Expediente colocado. Verifica solo cuando los cuatro turnos esten ocupados.');
  }

  function clear() {
    patchNested('route', { placed: {} });
    setSelected('');
    setStatus('Mesa limpia. Relee las restricciones.');
  }

  function verify() {
    const complete = routeSlots.every((slot) => route.placed[slot]);
    if (!complete) {
      setStatus('Faltan expedientes en la mesa.');
      return;
    }

    const correct = routeSlots.every((slot) => route.placed[slot] === routeSolution[slot]);
    if (!correct) {
      setStatus('Contradiccion detectada. Revisa apertura, testigo, cierre y descarte.');
      return;
    }

    setStatus('Ruta certificada. La secuencia operativa queda sellada.');
    setTimeout(() => awardToken('traza', 'TRAZA', 4, 'route'), 350);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section className="mission-panel">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="kicker">Objetivo</p>
            <p className="mt-1 text-sm text-champagne">Certifica el orden operativo antes de abrir la terminal.</p>
            <p className="mt-2 min-h-5 text-sm text-brass">{status}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={clear} disabled={Boolean(token)}>
              <RotateCcw className="h-4 w-4" /> Limpiar
            </button>
            <button className="btn-primary" onClick={verify} disabled={Boolean(token)}>
              <ClipboardCheck className="h-4 w-4" /> Certificar
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
          <div>
            <div className="grid gap-3 sm:grid-cols-4">
              {routeSlots.map((slot, index) => {
                const dossier = dossierById[route.placed[slot]];
                return (
                  <button
                    key={slot}
                    className="min-h-[150px] border border-brass/20 bg-black/20 p-3 text-left transition active:scale-[0.99]"
                    onClick={() => place(slot)}
                  >
                    <p className="text-[11px] uppercase tracking-[0.22em] text-brass">Turno {index + 1}</p>
                    {dossier ? (
                      <DossierCard dossier={dossier} selected={selected === dossier.id} onClick={() => select(dossier.id)} compact />
                    ) : (
                      <div className="mt-4 grid h-24 place-items-center border border-dashed border-brass/20 text-brass/30">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                'Una copia anulada nunca toca la terna: solo se guarda cuando el orden ya respira.',
                'Un anclaje fija el inicio porque impide que la ruta se mueva despues.',
                'Los testigos no abren ni clausuran: quedan atrapados entre origen y sello.',
                'Un sello sin testigo previo no certifica nada: solo puede cerrar.',
              ].map((rule) => (
                <div key={rule} className="quiet-card text-sm text-smoke">
                  {rule}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-brass">Expedientes</p>
            <div className="grid gap-3">
              {tray.map((dossier) => (
                <DossierCard
                  key={dossier.id}
                  dossier={dossier}
                  selected={selected === dossier.id}
                  onClick={() => select(dossier.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <TokenSeal token={token} label="Orden certificado" />
        <AssistancePanel
          id="route"
          hintCount={state.hints.route}
          helpCount={state.helps.route}
          onRequest={(kind) => requestAssistance('route', kind)}
        />
        <div className="quiet-card text-sm text-smoke">
          <p className="kicker">Lectura</p>
          <p className="mt-2">Esta fase no aporta letras. Aporta el orden que la terminal aceptara como matriz.</p>
        </div>
      </div>
    </div>
  );
}

function DossierCard({ dossier, selected, onClick, compact = false }) {
  return (
    <div
      className={`route-card mt-3 cursor-pointer border p-3 ${selected ? 'border-brass bg-brass/15' : 'border-white/10 bg-white/[0.04]'} ${compact ? 'min-h-[96px]' : ''}`}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <p className="font-display text-xl leading-none text-champagne">{dossier.title}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-smoke">{dossier.subtitle}</p>
      <p className="mt-3 inline-flex border border-brass/20 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-brass">
        {dossier.kind}
      </p>
    </div>
  );
}
