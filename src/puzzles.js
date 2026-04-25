export const phases = [
  {
    id: 'chess',
    eyebrow: 'Fase I',
    title: 'La pieza que vuelve',
    token: 'NOAH',
  },
  {
    id: 'stable',
    eyebrow: 'Fase II',
    title: 'La cuadra a oscuras',
    token: 'CUADRA',
  },
  {
    id: 'document',
    eyebrow: 'Fase III',
    title: 'El recibo roto',
    token: 'LACULATAII',
  },
  {
    id: 'route',
    eyebrow: 'Fase IV',
    title: 'Rutas cruzadas',
    token: 'TRAZA',
  },
  {
    id: 'terminal',
    eyebrow: 'Fase V',
    title: 'Terminal privado',
    token: 'DESTINO',
  },
];

export const hints = {
  chess: [
    'No estas jugando una partida. El tablero solo acepta una pieza y una ruta de archivo.',
    'Los sellos no se leen por cercania: se recuperan en el orden natural de los saltos.',
    'El ultimo salto debe cerrar ante los dos observadores tallados en el marco.',
  ],
  stable: [
    'La luz revela, pero no conserva. Memoriza el rastro antes de tocar.',
    'La placa de ronda ordena la escena por oficio: hierro, agua, registro, abrigo, cierre, altura.',
    'Si fallas, reinicia mentalmente desde la herradura.',
  ],
  document: [
    'Los bordes dorados pertenecen al exterior; las fibras grises deben continuar por dentro.',
    'Una pieza puede estar en el sitio correcto y aun asi bloquear la lectura si esta girada.',
    'Cuando el documento cierre, busca el sello que no pertenece al texto principal.',
  ],
  route: [
    'No todos los expedientes forman parte de la terna operativa.',
    'La terna valida tiene apertura, testigo y cierre. La copia anulada queda fuera.',
    'Los anclajes abren, los observadores quedan en medio y el sello cierra.',
  ],
  terminal: [
    'La terminal no resuelve fases: compara evidencias secundarias ya archivadas.',
    'La secuencia no sigue el orden de fases; fue certificada en rutas cruzadas.',
    'Anclajes de cuadra, observadores del tablero y sello documental forman la clave.',
  ],
};

export const helps = {
  chess: [
    'Usa solo movimientos de caballo. Las letras validas son N, O, A, H.',
    'Ruta de solucion: 5-0, 4-2, 2-1, 1-3, 0-5.',
  ],
  stable: [
    'Secuencia de hotspots: herradura, cubo, placa, manta, cierre, viga.',
    'La evidencia secundaria de esta fase esta en dos anclajes visuales: manta y arnes.',
  ],
  document: [
    'Orden por filas: p1 p2 p3 / p4 p5 p6 / p7 p8 p9. Todas las rotaciones deben quedar a cero.',
    'El sello documental que se usara despues aparece como referencia de archivo.',
  ],
  route: [
    'Coloca: Anclajes, Observadores, Sello, Copia anulada.',
    'La fase certifica la secuencia operativa 2-1-3 para la terminal.',
  ],
  terminal: [
    'Revisa: tablero, cuadra y archivo. Luego matriz. La matriz ensambla bloque 2, bloque 1, bloque 3.',
    'La clave se construye con iniciales de Manta-Arnes, Dama-Rey y el sello documental.',
  ],
};

export const routeDossiers = [
  {
    id: 'stable',
    title: 'Anclajes de cuadra',
    subtitle: 'Manta / Arnes',
    kind: 'anclaje',
  },
  {
    id: 'chess',
    title: 'Observadores',
    subtitle: 'Dama / Rey',
    kind: 'testigo',
  },
  {
    id: 'document',
    title: 'Sello documental',
    subtitle: 'Referencia archivistica',
    kind: 'cierre',
  },
  {
    id: 'decoy',
    title: 'Copia anulada',
    subtitle: 'No forma parte de la terna',
    kind: 'fuera',
  },
];

export const routeSlots = ['r1', 'r2', 'r3', 'r4'];
export const routeSolution = {
  r1: 'stable',
  r2: 'chess',
  r3: 'document',
  r4: 'decoy',
};

export const chessMarks = {
  '4-2': 'N',
  '2-1': 'O',
  '1-3': 'A',
  '0-5': 'H',
};

export const blockedCells = new Set(['3-1', '3-3', '2-4', '1-1', '4-4']);

export const stableHotspots = [
  { id: 'horseshoe', letter: 'C', x: 17, y: 36, label: 'herradura templada', order: 'hierro' },
  { id: 'bucket', letter: 'U', x: 78, y: 73, label: 'cubo de cobre', order: 'agua' },
  { id: 'plaque', letter: 'A', x: 49, y: 28, label: 'placa del box', order: 'registro' },
  { id: 'blanket', letter: 'D', x: 31, y: 65, label: 'manta doblada', order: 'abrigo' },
  { id: 'latch', letter: 'R', x: 87, y: 48, label: 'cierre del porton', order: 'cierre' },
  { id: 'beam', letter: 'A', x: 58, y: 15, label: 'marca en la viga', order: 'altura' },
];

export const documentPieces = [
  {
    id: 'p1',
    slot: 's1',
    text: 'RECIBO PRIVADO',
    sub: 'cabecera / ala norte',
    lines: ['gold-top', 'gold-left'],
  },
  {
    id: 'p2',
    slot: 's2',
    text: 'LA',
    sub: 'origen del registro',
    lines: ['gold-top'],
  },
  {
    id: 'p3',
    slot: 's3',
    text: 'CULATA II',
    sub: 'serie de traslado',
    lines: ['gold-top', 'gold-right'],
  },
  {
    id: 'p4',
    slot: 's4',
    text: 'BOX 07',
    sub: 'entrada de cuadra',
    lines: ['gold-left'],
  },
  {
    id: 'p5',
    slot: 's5',
    text: 'CONTROL',
    sub: 'sello partido',
    lines: [],
  },
  {
    id: 'p6',
    slot: 's6',
    text: 'ARCHIVO',
    sub: 'lateral derecho',
    lines: ['gold-right'],
  },
  {
    id: 'p7',
    slot: 's7',
    text: 'FIRMA',
    sub: 'trazo inferior',
    lines: ['gold-left', 'gold-bottom'],
  },
  {
    id: 'p8',
    slot: 's8',
    text: 'REF.',
    sub: 'validacion central',
    lines: ['gold-bottom'],
  },
  {
    id: 'p9',
    slot: 's9',
    text: 'ARCHIVO II',
    sub: 'cierre inferior',
    lines: ['gold-right', 'gold-bottom'],
  },
  {
    id: 'd1',
    slot: 'decoy',
    text: 'RECIBO SUR',
    sub: 'copia anulada',
    lines: [],
    decoy: true,
  },
  {
    id: 'd2',
    slot: 'decoy',
    text: 'COPIA 03',
    sub: 'papel incompatible',
    lines: [],
    decoy: true,
  },
];

export const shuffledPieceIds = ['p6', 'd1', 'p1', 'p8', 'p3', 'p5', 'p9', 'd2', 'p2', 'p7', 'p4'];
