import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CornerDownLeft, FileBadge, Landmark, Printer, RadioTower, Route, ShieldCheck, Trophy } from 'lucide-react';
import AssistancePanel from './AssistancePanel.jsx';
import TokenSeal from './TokenSeal.jsx';

const FINAL_KEY = ['MA', 'DR', 'ID'].join('');

const boot = [
  'NODO_CIEGO :: canal privado',
  'Inventario aislado. Evidencias secundarias disponibles solo si fueron archivadas.',
  'Comandos: inventario, revisar tablero, revisar cuadra, revisar archivo, revisar traza, matriz, abrir <clave>, limpiar',
];

export default function TerminalPhase({ state, awardToken, requestAssistance }) {
  const [lines, setLines] = useState(boot);
  const [input, setInput] = useState('');
  const [boardingReady, setBoardingReady] = useState(false);
  const token = state.tokens.final;
  const hintsUsed = Object.values(state.hints).reduce((total, count) => total + count, 0);
  const helpsUsed = Object.values(state.helps).reduce((total, count) => total + count, 0);

  const inventory = useMemo(
    () => [state.tokens.noah, state.tokens.cuadra, state.tokens.laculataii].filter(Boolean),
    [state.tokens],
  );

  function submit(event) {
    event.preventDefault();
    execute(input);
    setInput('');
  }

  function execute(raw) {
    const clean = raw.trim();
    if (!clean) return;
    const output = runCommand(clean.toUpperCase(), state, token);
    setLines((current) => [...current, `> ${clean}`, ...output.lines].slice(-18));
    if (output.complete) {
      awardToken('final', FINAL_KEY, 4);
      setBoardingReady(true);
    }
  }

  function printBoardingPass() {
    setBoardingReady(true);
    requestAnimationFrame(() => window.print());
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section className="terminal-stage border border-brass/30 p-4 shadow-aureate sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="kicker">Objetivo</p>
            <p className="mt-1 text-sm text-champagne">Cruza evidencias. Abre la salida.</p>
          </div>
          <div className="grid h-12 w-12 place-items-center border border-brass/30 bg-brass/10">
            <RadioTower className="h-6 w-6 text-brass" />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <EvidenceCard
            icon={ShieldCheck}
            label="Tablero"
            value="Observadores"
            ready={state.evidence.chess}
          />
          <EvidenceCard
            icon={Landmark}
            label="Cuadra"
            value="Anclajes"
            ready={state.evidence.stable}
          />
          <EvidenceCard
            icon={FileBadge}
            label="Archivo"
            value="Sello"
            ready={state.evidence.document}
          />
          <EvidenceCard
            icon={Route}
            label="Traza"
            value="Secuencia"
            ready={state.evidence.route}
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {['inventario', 'revisar tablero', 'revisar cuadra', 'revisar archivo', 'revisar traza', 'matriz'].map((command) => (
            <button key={command} className="btn-secondary justify-start font-mono text-xs" onClick={() => execute(command)}>
              {command}
            </button>
          ))}
        </div>

        <div className="terminal-window min-h-[500px] border border-brass/40 p-0 font-mono text-sm shadow-aureate">
          <div className="flex items-center justify-between border-b border-brass/25 bg-[#3a2b1a] px-4 py-3">
            <div className="flex gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-ember" />
              <span className="h-2.5 w-2.5 rounded-full bg-brass" />
              <span className="h-2.5 w-2.5 rounded-full bg-pine" />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-brass">terminal / nodo ciego</span>
          </div>

          <div className="min-h-[320px] space-y-2 bg-[#182418] p-4 sm:min-h-[360px]">
            {lines.map((line, index) => (
              <motion.p
                key={`${line}-${index}`}
                className={line.startsWith('>') ? 'text-brass' : 'text-[#e7f7dc]'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {line}
              </motion.p>
            ))}
          </div>

          <form onSubmit={submit} className="flex items-center gap-2 border-t border-brass/25 bg-[#312414] p-4">
            <span className="text-brass">$</span>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-champagne outline-none placeholder:text-smoke"
              placeholder="abrir <clave>"
              autoCapitalize="off"
              autoComplete="off"
              spellCheck="false"
            />
            <button className="btn-ghost" type="submit" aria-label="Ejecutar comando">
              <CornerDownLeft className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      <div className="space-y-4">
        <div className="side-panel">
          <p className="kicker">Inventario</p>
          <div className="mt-3 space-y-2">
            {['NOAH', 'CUADRA', 'LACULATAII'].map((expected) => (
              <div key={expected} className="flex items-center justify-between border border-white/10 bg-black/20 px-3 py-2">
                <span className="font-mono text-sm text-champagne">{expected}</span>
                <span className={inventory.includes(expected) ? 'text-xs text-brass' : 'text-xs text-smoke'}>
                  {inventory.includes(expected) ? 'listo' : 'pendiente'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <TokenSeal token={token} label="Destino abierto" />
        {token && (
          <div className="side-panel bg-brass/10">
            <div className="flex items-center gap-3 text-brass">
              <Trophy className="h-5 w-5" />
              <p className="text-xs uppercase tracking-[0.22em]">Mision completa</p>
            </div>
            <p className="mt-3 font-display text-3xl text-champagne">{FINAL_KEY}</p>
            <button className="btn-primary mt-4 w-full" onClick={printBoardingPass}>
              <Printer className="h-4 w-4" /> Emitir tarjeta de embarque
            </button>
          </div>
        )}

        <AssistancePanel
          id="terminal"
          hintCount={state.hints.terminal}
          helpCount={state.helps.terminal}
          onRequest={(kind) => requestAssistance('terminal', kind)}
        />
      </div>

      {boardingReady && (
        <BoardingPass
          passengerName={state.config.passengerName}
          origin={state.config.origin}
          travelDate={state.config.travelDate}
          hintsUsed={hintsUsed}
          helpsUsed={helpsUsed}
          onClose={() => setBoardingReady(false)}
        />
      )}
    </div>
  );
}

function EvidenceCard({ icon: Icon, label, value, ready }) {
  return (
    <div className={`border p-3 ${ready ? 'border-brass/35 bg-brass/10' : 'border-white/10 bg-white/[0.04]'}`}>
      <div className="flex items-center gap-2">
        <Icon className={ready ? 'h-4 w-4 text-brass' : 'h-4 w-4 text-smoke'} />
        <p className="text-[11px] uppercase tracking-[0.2em] text-brass">{label}</p>
      </div>
      <p className="mt-2 text-sm text-champagne">{value}</p>
      <p className="mt-1 text-xs text-smoke">{ready ? 'archivado' : 'pendiente'}</p>
    </div>
  );
}

function runCommand(command, state, token) {
  const certified = {
    chess: state.evidence.chess || Boolean(state.tokens.noah),
    stable: state.evidence.stable || Boolean(state.tokens.cuadra),
    document: state.evidence.document || Boolean(state.tokens.laculataii),
    route: state.evidence.route || Boolean(state.tokens.traza),
  };

  if (command === 'LIMPIAR') return { lines: boot };

  if (command === 'INVENTARIO') {
    return {
      lines: [
        state.tokens.noah ? 'slot_1: NOAH' : 'slot_1: pendiente',
        state.tokens.cuadra ? 'slot_2: CUADRA' : 'slot_2: pendiente',
        state.tokens.laculataii ? 'slot_3: LACULATAII' : 'slot_3: pendiente',
      ],
    };
  }

  if (command === 'REVISAR TABLERO' || command === 'REVISAR NOAH') {
    if (!certified.chess) return { lines: ['archivo de tablero no certificado'] };
    if (command === 'REVISAR NOAH') {
      return {
        lines: [
          'NOAH :: alias de archivo de tablero',
          'TABLERO :: cierre certificado',
          'observadores del incidente: Dama y Rey',
          'bloque asociado: iniciales de observadores',
        ],
      };
    }
    return {
      lines: [
        'TABLERO :: cierre certificado',
        'observadores del incidente: Dama y Rey',
        'bloque asociado: iniciales de observadores',
      ],
    };
  }

  if (command === 'REVISAR CUADRA') {
    if (!certified.stable) return { lines: ['archivo de cuadra no certificado'] };
    return {
      lines: [
        'CUADRA :: ronda completada',
        'anclajes sellados: Manta y Arnes',
        'bloque asociado: iniciales de anclajes',
      ],
    };
  }

  if (command === 'REVISAR ARCHIVO' || command === 'REVISAR LACULATAII') {
    if (!certified.document) return { lines: ['archivo documental no certificado'] };
    return {
      lines: [
        'ARCHIVO :: documento reconstruido',
        'sello visible en documento: referencia archivistica',
        'bloque asociado: sello documental exacto',
      ],
    };
  }

  if (command === 'REVISAR TRAZA') {
    if (!certified.route) return { lines: ['traza operativa no certificada'] };
    return {
      lines: [
        'TRAZA :: rutas cruzadas certificadas',
        'orden de lectura: anclajes antes que observadores',
        'cierre de lectura: sello documental despues de observadores',
        'copia anulada: descartada de la terna',
      ],
    };
  }

  if (command === 'MATRIZ') {
    if (!certified.route) {
      return {
        lines: [
          'MATRIZ BLOQUEADA',
          'falta traza operativa certificada',
          'la terminal no acepta una secuencia deducida a mano',
        ],
      };
    }
    return {
      lines: [
        'MATRIZ DE APERTURA',
        'bloque 2 = iniciales de los anclajes',
        'bloque 1 = iniciales de los observadores',
        'bloque 3 = sello documental',
        'secuencia operativa = 2-1-3',
      ],
    };
  }

  if (command.startsWith('ABRIR')) {
    const key = command.split(/\s+/)[1] ?? '';
    if (token) return { lines: ['destino ya abierto'] };
    if (!certified.chess || !certified.stable || !certified.document || !certified.route) {
      return { lines: ['error: faltan evidencias secundarias archivadas'] };
    }
    if (key.length !== 6) return { lines: ['cerradura: la clave requiere 6 letras'] };
    if (key !== FINAL_KEY) return { lines: ['cerradura: clave rechazada'] };
    return { complete: true, lines: ['cerradura aceptada', 'tarjeta de embarque desbloqueada'] };
  }

  return { lines: ['comando no reconocido. usa inventario, revisar tablero, revisar cuadra, revisar archivo, revisar traza, matriz o abrir <clave>'] };
}

function BoardingPass({ passengerName, origin, travelDate, hintsUsed, helpsUsed, onClose }) {
  const note = getSystemNote(hintsUsed);

  return (
    <section className="boarding-pass fixed left-1/2 top-1/2 z-[70] max-h-[90vh] w-[min(92vw,760px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-brass/40 bg-[#efe1bd] p-6 text-[#21170d] shadow-aureate print:static print:w-full print:translate-x-0 print:translate-y-0 print:shadow-none">
      <div className="flex items-start justify-between gap-4 border-b border-[#21170d]/20 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em]">Private Boarding Authority</p>
          <h2 className="mt-2 font-display text-4xl">Cleared for Boarding</h2>
        </div>
        <div className="text-right font-mono text-sm">
          <p>STATUS</p>
          <p className="text-lg font-bold">CLEARED</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Field label="Passenger" value={passengerName} />
        <Field label="Origin" value={origin} />
        <Field label="Destination" value={FINAL_KEY} />
        <Field label="Travel Date" value={travelDate} />
        <Field label="Mission Result" value="DESTINO ABIERTO" />
        <Field label="Record" value={`Pistas ${hintsUsed} / Ayudas ${helpsUsed}`} />
      </div>
      <div className="mt-5 border border-[#21170d]/20 p-4">
        <p className="text-xs uppercase tracking-[0.22em]">System note</p>
        <p className="mt-2 text-sm">{note}</p>
      </div>
      <div className="mt-5 flex gap-2 print:hidden">
        <button className="flex-1 border border-[#21170d]/20 px-3 py-2 text-sm font-bold" onClick={onClose}>
          Cerrar
        </button>
        <button className="flex-1 border border-[#21170d] bg-[#21170d] px-3 py-2 text-sm font-bold text-[#efe1bd]" onClick={() => window.print()}>
          Imprimir
        </button>
      </div>
    </section>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#7b5b2c]">{label}</p>
      <p className="mt-1 font-mono text-sm font-bold">{value}</p>
    </div>
  );
}

function getSystemNote(hintsUsed) {
  if (hintsUsed === 0) return 'Resolucion limpia. El sistema no ha detectado debilidad aparente.';
  if (hintsUsed === 1) return 'Expediente casi impecable. Se registro una leve vacilacion.';
  if (hintsUsed <= 3) return 'Embarque autorizado. El archivo refleja cierta tendencia a negociar con la dificultad.';
  if (hintsUsed <= 5) return 'Acceso concedido. La pasajera completo la mision con apoyo tactico no solicitado por su orgullo.';
  return 'Embarque excepcionalmente autorizado. El expediente desaconseja afirmar en publico que esto se resolvio sin ayuda.';
}
