// Cipher core — pure functions, no DOM, no deps. Used by the React UI and check.mjs.
// Byte-level permutation (ECB) keyed by a sliding-puzzle move sequence.

// Solved n×n grid as a flat array: [1,2,...,n²-1, 0]. 0 = blank.
export const solvedGrid = (n) => {
  const a = Array.from({ length: n * n }, (_, i) => i + 1);
  a[n * n - 1] = 0;
  return a;
};

// Apply WASD move string to a fresh solved grid. W=blank up, S=down, A=left, D=right.
// Invalid moves (blank at edge) silently ignored. Returns final flat grid.
export function applyMoves(n, moves) {
  const g = solvedGrid(n);
  let bi = g.indexOf(0);
  for (const ch of moves.toUpperCase()) {
    const r = Math.floor(bi / n), c = bi % n;
    let t = -1;
    if (ch === 'W' && r > 0) t = bi - n;
    else if (ch === 'S' && r < n - 1) t = bi + n;
    else if (ch === 'A' && c > 0) t = bi - 1;
    else if (ch === 'D' && c < n - 1) t = bi + 1;
    if (t >= 0) { g[bi] = g[t]; g[t] = 0; bi = t; }
  }
  return g;
}

// Permutation of 0..bs-1 read from the shuffled grid (blank dropped). bs = n²-1.
export const permutation = (grid) => grid.filter((v) => v !== 0).map((v) => v - 1);

export const inverse = (p) => {
  const inv = new Array(p.length);
  p.forEach((v, i) => { inv[v] = i; });
  return inv;
};

// PKCS#7 over a Uint8Array. Always adds 1..bs bytes.
function pad(bytes, bs) {
  const padLen = bs - (bytes.length % bs); // mod 0 → bs (full block)
  const out = new Uint8Array(bytes.length + padLen);
  out.set(bytes);
  out.fill(padLen, bytes.length);
  return out;
}

function unpad(bytes) {
  const padLen = bytes[bytes.length - 1];
  if (padLen < 1 || padLen > bytes.length) throw new Error('bad padding');
  return bytes.slice(0, bytes.length - padLen);
}

// One block loop, both directions. encrypt: perm; decrypt: inverse(perm).
function permuteBlocks(bytes, perm) {
  const bs = perm.length;
  const out = new Uint8Array(bytes.length);
  for (let b = 0; b < bytes.length; b += bs)
    for (let i = 0; i < bs; i++) out[b + i] = bytes[b + perm[i]];
  return out;
}

// loop, not spread — String.fromCharCode(...bytes) overflows the stack on large inputs.
function b64encode(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
const b64decode = (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0));

export function encrypt(text, perm) {
  const data = pad(new TextEncoder().encode(text), perm.length);
  return b64encode(permuteBlocks(data, perm));
}

export function decrypt(b64, perm) {
  const data = permuteBlocks(b64decode(b64), inverse(perm));
  return new TextDecoder().decode(unpad(data));
}

// Random valid move sequence of given length (for the Randomize button).
export function randomMoves(n, len) {
  let m = '';
  const g = solvedGrid(n);
  let bi = g.indexOf(0);
  for (let k = 0; k < len; k++) {
    const r = Math.floor(bi / n), c = bi % n, opts = [];
    if (r > 0) opts.push(['W', bi - n]);
    if (r < n - 1) opts.push(['S', bi + n]);
    if (c > 0) opts.push(['A', bi - 1]);
    if (c < n - 1) opts.push(['D', bi + 1]);
    const [ch, t] = opts[Math.floor(Math.random() * opts.length)];
    m += ch; g[bi] = g[t]; g[t] = 0; bi = t;
  }
  return m;
}
