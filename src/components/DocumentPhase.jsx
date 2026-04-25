import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileBadge, RotateCw, ScanLine, X } from 'lucide-react';
import AssistancePanel from './AssistancePanel.jsx';
import TokenSeal from './TokenSeal.jsx';
import { documentPieces, shuffledPieceIds } from '../puzzles.js';

const slots = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'];

export default function DocumentPhase({ state, patchNested, awardToken, requestAssistance }) {
  const [selected, setSelected] = useState('');
  const [status, setStatus] = useState('Reconstruye el documento original. El borde dorado solo pertenece al perimetro.');
  const doc = state.document;
  const token = state.tokens.laculataii;

  const pieceById = useMemo(() => Object.fromEntries(documentPieces.map((piece) => [piece.id, piece])), []);
  const placedIds = Object.values(doc.placed);
  const trayPieces = shuffledPieceIds.filter((id) => !placedIds.includes(id));

  function selectPiece(id) {
    setSelected(id);
  }

  function place(slot) {
    if (!selected || token) return;
    placePiece(selected, slot);
  }

  function placePiece(pieceId, slot) {
    if (!pieceId || token) return;
    const previousAtSlot = doc.placed[slot];
    const selectedSlot = Object.entries(doc.placed).find(([, id]) => id === pieceId)?.[0];
    const nextPlaced = { ...doc.placed };

    if (selectedSlot) delete nextPlaced[selectedSlot];
    if (previousAtSlot && previousAtSlot !== pieceId && selectedSlot) nextPlaced[selectedSlot] = previousAtSlot;
    nextPlaced[slot] = pieceId;

    setSelected(pieceId);
    setStatus(pieceById[pieceId]?.decoy ? 'Esa copia parece limpia, pero no comparte fibra ni borde del original.' : 'Fragmento colocado.');
    patchNested('document', {
      placed: nextPlaced,
      rotations: {
        ...doc.rotations,
        [pieceId]: doc.rotations[pieceId] ?? initialRotation(pieceId),
      },
    });
  }

  function dropPiece(pieceId, event, info) {
    if (token) return;
    const slot = getDropSlot(event, info);
    if (!slot) {
      setSelected(pieceId);
      setStatus('Suelta el fragmento dentro de un hueco del bastidor.');
      return;
    }
    placePiece(pieceId, slot);
  }

  function rotateSelected() {
    if (!selected || token) return;
    patchNested('document', {
      rotations: {
        ...doc.rotations,
        [selected]: ((doc.rotations[selected] ?? initialRotation(selected)) + 90) % 360,
      },
    });
  }

  function remove(slot) {
    const next = { ...doc.placed };
    delete next[slot];
    patchNested('document', { placed: next });
  }

  function verify() {
    const complete = slots.every((slot) => doc.placed[slot]);
    if (!complete) {
      setStatus('Aun faltan fragmentos.');
      return;
    }
    const correctPlacement = slots.every((slot) => pieceById[doc.placed[slot]]?.slot === slot);
    const correctRotation = slots.every((slot) => (doc.rotations[doc.placed[slot]] ?? initialRotation(doc.placed[slot])) === 0);

    if (correctPlacement && correctRotation) {
      setStatus('El documento encaja. Un sello latente aparece bajo el barniz.');
      setTimeout(() => awardToken('laculataii', 'LACULATAII', 3, 'document'), 350);
      return;
    }

    if (!correctPlacement) {
      setStatus('La lectura falla: hay lineas o bordes fuera de lugar.');
      return;
    }

    setStatus('La posicion es correcta, pero hay fragmentos girados.');
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <section className="mission-panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="kicker">Objetivo</p>
            <p className="mt-1 text-sm text-champagne">Reconstruye el original. El perimetro dorado debe cerrar sin cortes.</p>
            <p className="mt-2 min-h-6 text-sm text-brass">{status}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={rotateSelected} disabled={!selected || Boolean(token)}>
              <RotateCw className="h-4 w-4" /> Girar
            </button>
            <button className="btn-primary" onClick={verify} disabled={Boolean(token)}>
              <ScanLine className="h-4 w-4" /> Verificar
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(260px,440px)_1fr]">
          <div className="document-board relative grid grid-cols-3 border border-brass/20 bg-black/25 p-2">
            {token && (
              <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
                <div className="-rotate-6 border-2 border-ember/70 bg-[#e5d5ad]/90 px-5 py-3 text-center text-[#25190f] shadow-aureate">
                  <FileBadge className="mx-auto h-6 w-6" />
                  <p className="mt-1 font-mono text-xs uppercase tracking-[0.22em]">Ref. ID</p>
                </div>
              </div>
            )}
            {slots.map((slot) => {
              const id = doc.placed[slot];
              return (
                <button
                  key={slot}
                  data-slot={slot}
                  className="relative aspect-[1.04] border border-dashed border-brass/20 bg-black/20 p-1"
                  onClick={() => place(slot)}
                  aria-label={`Hueco ${slot}`}
                >
                  {id ? (
                    <>
                      <Piece
                        piece={pieceById[id]}
                        selected={selected === id}
                        rotation={doc.rotations[id] ?? initialRotation(id)}
                        onDragEnd={(event, info) => dropPiece(id, event, info)}
                        onClick={(event) => {
                          event.stopPropagation();
                          selectPiece(id);
                        }}
                      />
                      {!token && (
                        <span
                          className="absolute right-1 top-1 z-10 rounded-full bg-black/60 p-1 text-smoke"
                          onClick={(event) => {
                            event.stopPropagation();
                            remove(slot);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="grid h-full place-items-center text-brass/25">◆</span>
                  )}
                </button>
              );
            })}
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-brass">Bandeja de fragmentos</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
              {trayPieces.map((id) => (
                <Piece
                  key={id}
                  piece={pieceById[id]}
                  selected={selected === id}
                  rotation={doc.rotations[id] ?? initialRotation(id)}
                  onDragEnd={(event, info) => dropPiece(id, event, info)}
                  onClick={() => selectPiece(id)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <TokenSeal token={token} />
        <AssistancePanel
          id="document"
          hintCount={state.hints.document}
          helpCount={state.helps.document}
          onRequest={(kind) => requestAssistance('document', kind)}
        />
        <div className="quiet-card text-sm text-smoke">
          <p className="kicker">Control</p>
          <p className="mt-2">
            Las copias sobrantes no tienen borde dorado ni fibra envejecida. El original si.
          </p>
        </div>
      </div>
    </div>
  );
}

function Piece({ piece, selected, rotation, onClick, onDragEnd }) {
  return (
    <motion.div
      layout
      drag
      dragSnapToOrigin
      dragMomentum={false}
      whileTap={{ scale: 0.98 }}
      onDragStart={onClick}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`ticket-piece relative flex h-full min-h-[96px] cursor-pointer flex-col justify-between overflow-hidden p-3 text-left transition-shadow ${
        piece.decoy ? 'ticket-piece-decoy' : ''
      } ${
        selected ? 'ring-2 ring-brass' : 'ring-1 ring-white/10'
      }`}
      style={{ rotate: rotation }}
    >
      {piece.lines.includes('gold-top') && <span className="absolute left-0 top-0 h-1 w-full bg-brass" />}
      {piece.lines.includes('gold-bottom') && <span className="absolute bottom-0 left-0 h-1 w-full bg-brass" />}
      {piece.lines.includes('gold-left') && <span className="absolute left-0 top-0 h-full w-1 bg-brass" />}
      {piece.lines.includes('gold-right') && <span className="absolute right-0 top-0 h-full w-1 bg-brass" />}
      <span className="font-display text-2xl leading-none text-[#25190f]">{piece.text}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6b5130]">{piece.sub}</span>
      <span className="absolute inset-x-3 top-1/2 border-t border-[#9f8250]/50" />
      {piece.decoy && (
        <span className="absolute -right-8 top-6 rotate-12 border border-ember/60 px-8 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ember/80">
          anulada
        </span>
      )}
    </motion.div>
  );
}

function getDropSlot(event, info) {
  const clientX = event?.clientX ?? info?.point?.x - window.scrollX;
  const clientY = event?.clientY ?? info?.point?.y - window.scrollY;
  if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return '';

  const elements = document.elementsFromPoint(clientX, clientY);
  return elements.find((element) => element instanceof HTMLElement && element.dataset.slot)?.dataset.slot ?? '';
}

function initialRotation(id) {
  return {
    p1: 0,
    p2: 180,
    p3: 270,
    p4: 90,
    p5: 0,
    p6: 180,
    p7: 270,
    p8: 90,
    p9: 0,
    d1: 180,
    d2: 90,
  }[id] ?? 0;
}
