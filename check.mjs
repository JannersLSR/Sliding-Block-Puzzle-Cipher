// Headless roundtrip check. Run: npm run check  (exit 0 = safe to deploy).
import assert from 'node:assert/strict';
import { applyMoves, permutation, encrypt, decrypt, randomMoves } from './src/cipher.js';

for (const n of [5, 6, 8]) {
  const perm = permutation(applyMoves(n, randomMoves(n, 50)));
  for (const msg of ['', 'A', 'Hello, World!', 'x'.repeat(200), 'üñîçödé 🎲']) {
    assert.equal(decrypt(encrypt(msg, perm), perm), msg, `roundtrip failed n=${n} msg=${JSON.stringify(msg)}`);
  }
}
console.log('cipher self-check OK');
