// Encryption/decryption timing benchmark. Run: npm run bench
import assert from 'node:assert/strict';
import { applyMoves, permutation, encrypt, decrypt, randomMoves } from './src/cipher.js';

const GRIDS = [5, 8, 10];                 // block size = n²-1 bytes
const SIZES = [1e3, 1e4, 1e5, 1e6];       // plaintext bytes
const ITERS = 30;

const fmt = (n) => n.toLocaleString();
const kb = (n) => (n >= 1e6 ? `${n / 1e6} MB` : `${n / 1e3} KB`);

// median of timed runs (ms)
function timeMs(fn) {
  const t = [];
  for (let i = 0; i < ITERS; i++) { const s = performance.now(); fn(); t.push(performance.now() - s); }
  t.sort((a, b) => a - b);
  return t[t.length >> 1];
}

const rows = [];
for (const n of GRIDS) {
  const perm = permutation(applyMoves(n, randomMoves(n, 50)));
  for (const bytes of SIZES) {
    const text = 'x'.repeat(bytes);
    const ct = encrypt(text, perm);
    assert.equal(decrypt(ct, perm), text); // correctness gate
    const enc = timeMs(() => encrypt(text, perm));
    const dec = timeMs(() => decrypt(ct, perm));
    const mbps = (bytes / 1e6) / (enc / 1e3);
    rows.push({ grid: `${n}×${n}`, block: n * n - 1, size: kb(bytes), enc, dec, mbps });
  }
}

// markdown table
const head = ['Grid', 'Block (B)', 'Payload', 'Encrypt (ms)', 'Decrypt (ms)', 'Throughput (MB/s)'];
const line = (c) => `| ${c.join(' | ')} |`;
console.log(line(head));
console.log(line(head.map(() => '---')));
for (const r of rows)
  console.log(line([r.grid, fmt(r.block), r.size, r.enc.toFixed(3), r.dec.toFixed(3), r.mbps.toFixed(1)]));
