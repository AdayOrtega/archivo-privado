import { useMemo, useState } from 'react';
import { ArrowRight, ClipboardCheck, RotateCcw, X, FolderKanban } from 'lucide-react';
import AssistancePanel from './AssistancePanel.jsx';
import TokenSeal from './TokenSeal.jsx';
import { routeDossiers, routeSlots, routeSolution } from '../puzzles.js';

export default function RoutePhase({
  state,
  patchNested,
  awardToken,
  requestAssistance,
}) {
  const [selected, setSelected] = useState('');
  const [status, setStatus] = useState(
    'Ordena la terna válida. La copia anulada queda fuera de la matriz.'
  );

  const route = state.route;
  const token = state.tokens.traza;

  const dossierById = useMemo(
    () => Object.fromEntries(routeDossiers.map((item) => [item.id, item])),
    []
  );

  const placedIds = Object.values(route.placed);
  const tray = routeDossiers.filter((item) => !placedIds.includes(item.id));

  const placedCount = routeSlots.filter((slot) => route.placed[slot]).length;

  function select(id) {
    if (token) return;
    setSelected((prev) => (prev === id ? '' : id));
  }

  function place(slot) {
    if (!selected || token) return;

    const previousSlot = Object.entries(route.placed).find(
      ([, id]) => id === selected
    )?.[0];

    const previousAtSlot = route.placed[slot];
    const next = { ...route.placed };

    if (previousSlot) delete next[previousSlot];

    if (previousAtSlot && previousSlot) {
      next[previousSlot] = previousAtSlot;
    }

    next[slot] = selected;

    patchNested('route', { placed: next });
    setStatus('Expediente colocado. Verifica solo cuando los cuatro turnos estén ocupados.');
  }

  function removeFromSlot(slot) {
    if (token || !route.placed[slot]) return;

    const next = { ...route.placed };
    delete next[slot];
    patchNested('route', { placed: next });

    setStatus('Expediente retirado. La matriz sigue incompleta.');
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

    const correct = routeSlots.every(
      (slot) => route.placed[slot] === routeSolution[slot]
    );

    if (!correct) {
      setStatus(
        'Contradicción detectada. Revisa apertura, testigo, cierre y descarte.'
      );
      return;
    }

    setStatus('Ruta certificada. La secuencia operativa queda sellada.');
    setTimeout(() => awardToken('traza', 'TRAZA', 4, 'route'), 350);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section className="mission-panel bg-[#18130f]">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="kicker">Objetivo</p>
            <p className="mt-1 text-sm text-champagne">
              Certifica el orden operativo antes de abrir la terminal.
            </p>
            <p className="mt-2 max-w-xl text-sm text-smoke">
              La mesa ya está montada. Solo importa la secuencia correcta de expedientes.
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div className="rounded-full border border-brass/25 bg-brass/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-brass">
                Expedientes colocados: {placedCount}/4
              </div>

              {selected ? (
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-smoke">
                  Seleccionado: {dossierById[selected]?.title}
                </div>
              ) : (
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-smoke">
                  Ningún expediente seleccionado
                </div>
              )}
            </div>

            <p className="mt-3 min-h-5 text-sm text-brass">{status}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-ghost"
              onClick={clear}
              disabled={Boolean(token)}
            >
              <RotateCcw className="h-4 w-4" /> Limpiar
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={verify}
              disabled={Boolean(token)}
            >
              <ClipboardCheck className="h-4 w-4" /> Certificar
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
          <div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {routeSlots.map((slot, index) => {
                const dossier = dossierById[route.placed[slot]];

                return (
                  <div
                    key={slot}
                    className="rounded-[24px] border border-brass/20 bg-white/[0.04] p-3"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-brass">
                        Turno {index + 1}
                      </p>

                      {dossier && !token ? (
                        <button
                          type="button"
                          className="rounded-full border border-white/10 p-1 text-smoke transition hover:border-red-400/30 hover:text-red-300"
                          onClick={() => removeFromSlot(slot)}
                          aria-label={`Quitar expediente del turno ${index + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>

                    {dossier ? (
                      <button
                        type="button"
                        className="block w-full text-left"
                        onClick={() => select(dossier.id)}
                      >
                        <DossierCard
                          dossier={dossier}
                          selected={selected === dossier.id}
                          compact
                        />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`mt-2 grid h-24 w-full place-items-center rounded-[20px] border border-dashed transition ${
                          selected
                            ? 'border-brass/40 bg-brass/5 text-brass hover:bg-brass/10'
                            : 'border-brass/20 bg-black/10 text-brass/30'
                        }`}
                        onClick={() => place(slot)}
                        disabled={!selected || Boolean(token)}
                      >
                        <div className="grid place-items-center gap-2">
                          <ArrowRight className="h-5 w-5" />
                          <span className="text-[11px] uppercase tracking-[0.18em]">
                            {selected ? 'Colocar aquí' : 'Vacío'}
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                'Una copia anulada nunca toca la terna: solo se guarda cuando el orden ya respira.',
                'Un anclaje fija el inicio porque impide que la ruta se mueva después.',
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
            <div className="mb-3 flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-brass" />
              <p className="text-xs uppercase tracking-[0.22em] text-brass">
                Expedientes
              </p>
            </div>

            <div className="grid gap-3">
              {tray.length > 0 ? (
                tray.map((dossier) => (
                  <button
                    key={dossier.id}
                    type="button"
                    className="block w-full text-left"
                    onClick={() => select(dossier.id)}
                  >
                    <DossierCard
                      dossier={dossier}
                      selected={selected === dossier.id}
                    />
                  </button>
                ))
              ) : (
                <div className="quiet-card text-sm text-smoke">
                  Todos los expedientes están sobre la mesa.
                </div>
              )}
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
          <p className="mt-2">
            Esta fase no aporta letras. Aporta el orden que la terminal aceptará
            como matriz.
          </p>
        </div>
      </div>
    </div>
  );
}

function DossierCard({ dossier, selected, compact = false }) {
  return (
    <div
      className={`route-card rounded-[22px] border p-3 transition ${
        selected
          ? 'border-brass bg-brass/15 shadow-[0_0_24px_rgba(212,184,122,0.12)]'
          : 'border-white/10 bg-white/[0.04] hover:border-brass/20 hover:bg-white/[0.06]'
      } ${compact ? 'min-h-[96px]' : ''}`}
    >
      <p className="font-display text-xl leading-none text-champagne">
        {dossier.title}
      </p>

      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-smoke">
        {dossier.subtitle}
      </p>

      <p className="mt-3 inline-flex rounded-full border border-brass/20 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-brass">
        {dossier.kind}
      </p>
    </div>
  );
}
