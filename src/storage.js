export const STORAGE_KEY = 'archivo-privado-state-v3';
const LEGACY_KEYS = ['archivo-privado-state-v2', 'archivo-privado-state-v1'];

export const initialState = {
  phase: 0,
  tokens: {
    noah: '',
    cuadra: '',
    laculataii: '',
    traza: '',
    final: '',
  },
  hints: {
    chess: 0,
    stable: 0,
    document: 0,
    route: 0,
    terminal: 0,
  },
  helps: {
    chess: 0,
    stable: 0,
    document: 0,
    route: 0,
    terminal: 0,
  },
  assistanceLog: [],
  evidence: {
    chess: false,
    stable: false,
    document: false,
    route: false,
  },
  config: {
    passengerName: 'PASAJERA CLASIFICADA',
    origin: 'ORIGEN RESERVADO',
    travelDate: 'FECHA ABIERTA',
  },
  chess: {
    knight: { r: 5, c: 0 },
    collected: '',
    route: ['5-0'],
  },
  stable: {
    found: [],
    mistakes: 0,
  },
  document: {
    placed: {},
    rotations: {},
  },
  route: {
    placed: {},
  },
};

export function loadState() {
  try {
    const stored =
      localStorage.getItem(STORAGE_KEY) ??
      LEGACY_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
    if (!stored) return initialState;
    return mergeState(initialState, JSON.parse(stored));
  } catch {
    return initialState;
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function mergeState(base, patch) {
  const tokens = { ...base.tokens, ...patch.tokens };
  if (!tokens.final && patch.tokens?.madrid) tokens.final = patch.tokens.madrid;
  const evidence = { ...base.evidence, ...patch.evidence };

  if (tokens.noah) evidence.chess = true;
  if (tokens.cuadra) evidence.stable = true;
  if (tokens.laculataii) evidence.document = true;
  if (tokens.traza) evidence.route = true;

  return {
    ...base,
    ...patch,
    tokens,
    hints: { ...base.hints, ...patch.hints },
    helps: { ...base.helps, ...patch.helps },
    assistanceLog: patch.assistanceLog ?? base.assistanceLog,
    evidence,
    config: { ...base.config, ...patch.config },
    chess: { ...base.chess, ...patch.chess },
    stable: { ...base.stable, ...patch.stable },
    document: { ...base.document, ...patch.document },
    route: { ...base.route, ...patch.route },
  };
}
