import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Crosshair, Goal, Undo2 } from 'lucide-react';
import AssistancePanel from './AssistancePanel.jsx';
import TokenSeal from './TokenSeal.jsx';
import { blockedCells, chessMarks } from '../puzzles.js';

const boardSize = 6;
const expected = 'NOAH';

export default function ChessPhase({ state, patchNested, awardToken, requestAssistance }) {
  const [message, setMessage] = useState('El tablero esta sellado: una sola pieza, cuatro marcas, un cierre.');
  const chess = state.chess;
  const token = state.tokens.noah;

  const legalMoves = useMemo(() => {
    const deltas = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];
    return new Set(
      deltas
        .map(([dr, dc]) => ({ r: chess.knight.r + dr, c: chess.knight.c + dc }))
        .filter(({ r, c }) => r >= 0 && c >= 0 && r < boardSize && c < boardSize)
        .filter(({ r, c }) => !blockedCells.has(`${r}-${c}`))
        .map(({ r, c }) => `${r}-${c}`),
    );
  }, [chess.knight]);

  function moveTo(r, c) {
    if (token) return;
    const key = `${r}-${c}`;
    if (blockedCells.has(key)) {
      setMessage('Casilla sellada. El caballo debe saltarla.');
      return;
    }
    if (!legalMoves.has(key)) {
      setMessage('Movimiento invalido. Solo se aceptan saltos de caballo.');
      return;
    }

    const mark = chessMarks[key];
    let nextCollected = chess.collected;
    if (mark) {
      const wanted = expected[nextCollected.length];
      if (mark === wanted) {
        nextCollected += mark;
        setMessage(`Marca ${mark} recuperada.`);
      } else if (!nextCollected.includes(mark)) {
        setMessage(`La marca ${mark} aun no encaja. Vuelve a leer la ruta.`);
      }
    } else {
      setMessage('Silencio. El salto es valido, pero aqui no hay memoria.');
    }

    const next = {
      knight: { r, c },
      collected: nextCollected,
      route: [...chess.route, key],
    };
    patchNested('chess', next);

    if (nextCollected === expected && key === '0-5') {
      setTimeout(() => awardToken('noah', 'NOAH', 1, 'chess'), 350);
    }
  }

  function resetBoard() {
    patchNested('chess', {
      knight: { r: 5, c: 0 },
      collected: '',
      route: ['5-0'],
    });
    setMessage('Tablero reiniciado.');
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="mission-panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="kicker">Objetivo</p>
            <p className="mt-1 text-sm text-champagne">Recupera cuatro marcas sin aterrizar en sellos negros.</p>
            <div className="mt-2 flex items-center gap-2 font-mono text-sm">
              <span className="text-smoke">registro</span>
              <span className="rounded-full border border-brass/30 px-3 py-1 text-brass">
                {chess.collected.padEnd(4, '·')}
              </span>
            </div>
          </div>
          <button className="btn-ghost" onClick={resetBoard}>
            <Undo2 className="h-4 w-4" /> Reiniciar tablero
          </button>
        </div>

        <div className="mx-auto grid max-w-[620px] grid-cols-6 overflow-hidden border border-brass/25 bg-black/30 p-1 shadow-aureate">
          {Array.from({ length: boardSize * boardSize }).map((_, index) => {
            const r = Math.floor(index / boardSize);
            const c = index % boardSize;
            const key = `${r}-${c}`;
            const isDark = (r + c) % 2 === 0;
            const isKnight = chess.knight.r === r && chess.knight.c === c;
            const mark = chessMarks[key];
            const isLegal = legalMoves.has(key);
            const blocked = blockedCells.has(key);
            const visited = chess.route.includes(key);

            return (
              <button
                key={key}
                className={`relative aspect-square border border-black/30 text-left transition duration-200 active:scale-[0.97] ${
                  isDark ? 'bg-[#17130f]' : 'bg-[#2a2119]'
                } ${isLegal && !token ? 'ring-1 ring-inset ring-brass/45' : ''}`}
                onClick={() => moveTo(r, c)}
                aria-label={`Casilla ${r + 1}-${c + 1}`}
              >
                {visited && <span className="absolute inset-2 border border-brass/10" />}
                {blocked && (
                  <span className="absolute inset-0 grid place-items-center bg-black/35 text-velvet">
                    <Crosshair className="h-5 w-5" />
                  </span>
                )}
                {mark && (
                  <span className="absolute right-2 top-2 font-display text-xl text-brass/80 sm:text-3xl">
                    {mark}
                  </span>
                )}
                {isLegal && !blocked && !isKnight && !token && (
                  <span className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-brass/70" />
                )}
                {isKnight && (
                  <motion.span
                    layoutId="knight"
                    className="absolute inset-0 grid place-items-center text-4xl sm:text-6xl"
                    transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                  >
                    ♞
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <p className="min-h-6 text-sm text-smoke">{message}</p>
          <div className="flex items-center gap-2 border border-brass/20 bg-brass/[0.06] px-3 py-2 text-xs uppercase tracking-[0.18em] text-brass">
            <Crown className="h-4 w-4" />
            <span>Dama</span>
            <Goal className="h-4 w-4" />
            <span>Rey</span>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <TokenSeal token={token} />
        <AssistancePanel
          id="chess"
          hintCount={state.hints.chess}
          helpCount={state.helps.chess}
          onRequest={(kind) => requestAssistance('chess', kind)}
        />
        <div className="quiet-card text-sm text-smoke">
          <p className="kicker">Lectura</p>
          <p className="mt-2">
            Los dos observadores no son destino. Solo certifican que la ruta ha cerrado correctamente.
          </p>
        </div>
      </div>
    </div>
  );
}
