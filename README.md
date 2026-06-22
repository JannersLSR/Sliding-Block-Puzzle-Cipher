# Sliding Block Puzzle Cipher

A toy cryptography tool that uses a **sliding tile puzzle as its key**. The
sequence of moves (`WASD` / arrow keys) applied to a solved grid produces a
byte permutation, which shuffles the bytes of your message in ECB mode.

React + Vite single-page app.

**Live demo:** https://sliding-block-puzzle-cipher.vercel.app/

> ⚠️ **Educational toy, not real crypto.** A byte permutation is trivially
> breakable (frequency analysis, known-plaintext). Do not protect anything
> real with this.

## How it works

1. Start from a solved `n×n` grid: `1, 2, …, n²−1, blank`.
2. Apply a move sequence — each `W/A/S/D` slides the blank tile up/left/down/right.
   Moves into a wall are ignored.
3. The shuffled tile order (blank dropped) is a **permutation** of `0…n²−2`.
   Block size = `n²−1` bytes.
4. **Encrypt:** UTF-8 → PKCS#7 pad → permute each block → Base64.
   **Decrypt:** Base64 → inverse-permute → unpad → UTF-8.

Same move sequence = same key. Share the key string (e.g. `WWADSSD…`) to let
someone decrypt.

## Scripts

```bash
npm install      # one time
npm run dev      # dev server (http://localhost:5173)
npm run build    # production build → dist/
npm run preview  # serve the built dist/ locally
npm run check    # headless cipher roundtrip check (CI / pre-deploy gate)
npm run bench    # encrypt/decrypt timing benchmark (prints the table below)
```

## Performance

Median of 30 runs per cell (Node, single thread). Each row also asserts a
correct roundtrip, so the benchmark doubles as a correctness test. Reproduce
with `npm run bench` — absolute numbers vary by machine.

| Grid | Block (B) | Payload | Encrypt (ms) | Decrypt (ms) | Throughput (MB/s) |
| --- | --- | --- | --- | --- | --- |
| 5×5 | 24 | 1 KB | 0.020 | 0.069 | 49.0 |
| 5×5 | 24 | 10 KB | 0.093 | 0.595 | 107.1 |
| 5×5 | 24 | 100 KB | 1.515 | 6.675 | 66.0 |
| 5×5 | 24 | 1 MB | 14.118 | 70.290 | 70.8 |
| 8×8 | 63 | 1 KB | 0.010 | 0.059 | 101.0 |
| 8×8 | 63 | 10 KB | 0.086 | 0.579 | 116.3 |
| 8×8 | 63 | 100 KB | 1.001 | 6.750 | 99.9 |
| 8×8 | 63 | 1 MB | 12.582 | 68.989 | 79.5 |
| 10×10 | 99 | 1 KB | 0.016 | 0.086 | 61.0 |
| 10×10 | 99 | 10 KB | 0.095 | 0.608 | 105.7 |
| 10×10 | 99 | 100 KB | 1.224 | 6.405 | 81.7 |
| 10×10 | 99 | 1 MB | 13.556 | 69.494 | 73.8 |

Linear in payload size, near-flat across grid size. Decrypt is ~5× encrypt
(Base64 decode + UTF-8 decode + per-block inverse dominate).

## Files

```
index.html      # Vite entry, mounts #root
vite.config.js  # Vite + React plugin
check.mjs        # headless deploy check
src/
├── main.jsx    # React bootstrap
├── App.jsx     # UI: puzzle, controls, encrypt/decrypt
├── cipher.js   # pure cipher core (no DOM, no deps)
└── index.css   # dark cyberpunk theme
```

## Deploy to Vercel

Vercel auto-detects Vite — no config needed.

1. Push to a Git repo (GitHub/GitLab/Bitbucket).
2. Import in Vercel. It detects **Vite**: build `npm run build`, output `dist`.
3. Deploy.

CLI alternative:

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

## Deployment check

`npm run check` runs an `assert`-based roundtrip (`encrypt` → `decrypt` over
empty, unicode, and multi-block messages across several grid sizes). It throws
on any mismatch, so wire it into CI or a pre-deploy gate:

```bash
npm run check   # "cipher self-check OK", exit 0 = safe to deploy
```
