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
```

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
