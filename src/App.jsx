import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { applyMoves, permutation, encrypt, decrypt, randomMoves } from './cipher.js';

const KEYMAP = { w: 'W', s: 'S', a: 'A', d: 'D', arrowup: 'W', arrowdown: 'S', arrowleft: 'A', arrowright: 'D' };

export default function App() {
  const [n, setN] = useState(5);
  const [moves, setMoves] = useState('');
  const [plain, setPlain] = useState('');
  const [cipher, setCipher] = useState('');
  const [randLen, setRandLen] = useState(50);

  // puzzle size adapts to its container width and the viewport height
  const wrapRef = useRef(null);
  const [size, setSize] = useState(420);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    const update = () => setSize(Math.max(220, Math.min(el.clientWidth, window.innerHeight * 0.62)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  const grid = useMemo(() => applyMoves(n, moves), [n, moves]);
  const perm = useMemo(() => permutation(grid), [grid]);

  // keyboard: move blank, but not while typing in a field
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return;
      const m = KEYMAP[e.key.toLowerCase()];
      if (!m) return;
      e.preventDefault();
      setMoves((prev) => prev + m);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const px = size / n;
  // value -> flat index, for positioning tiles (blank excluded)
  const posOf = new Array(n * n);
  grid.forEach((v, idx) => { posOf[v] = idx; });

  const onEncrypt = () => {
    try { setCipher(encrypt(plain, perm)); }
    catch (err) { setCipher(`Error: ${err.message}`); }
  };
  const onDecrypt = () => {
    try { setPlain(decrypt(cipher.trim(), perm)); }
    catch (err) { setPlain(`Error: ${err.message}`); }
  };
  const sanitizeKey = (v) => setMoves(v.toUpperCase().replace(/[^WASD]/g, ''));

  return (
    <>
      <header>
        <div className="brand">
          <h1>Sliding Block Puzzle Cipher</h1>
          <p className="sub">Byte permutation keyed by a sliding-tile puzzle - John Robert Santos</p>
        </div>
        <label className="field">Grid size
          <select value={n} onChange={(e) => { setN(+e.target.value); setMoves(''); }}>
            {[5, 6, 7, 8, 9, 10].map((s) => <option key={s} value={s}>{s} × {s}</option>)}
          </select>
        </label>
      </header>

      <main>
        <div className="col-left">
          <section className="panel puzzle-card">
            <div className="puzzle-wrap" ref={wrapRef}>
              <div className="puzzle" style={{ width: size, height: size }}>
                {Array.from({ length: n * n - 1 }, (_, i) => {
                  const v = i + 1;
                  const idx = posOf[v];
                  const r = Math.floor(idx / n), c = idx % n;
                  return (
                    <div key={v} className="tile" style={{
                      width: px - 6, height: px - 6,
                      fontSize: Math.max(10, px / 3),
                      transform: `translate(${c * px + 3}px, ${r * px + 3}px)`,
                    }}>{v}</div>
                  );
                })}
              </div>
            </div>
            <div className="controls">
              <button onClick={() => setMoves('')}>Reset</button>
              <button onClick={() => setMoves((m) => m.slice(0, -1))}>Undo</button>
            </div>
            <p className="hint">WASD / arrow keys move the blank tile</p>
          </section>

          <section className="panel perm-card">
            <span className="label">Permutation map</span>
            <div className="perm-grid">
              {perm.map((v, i) => <code key={i}>{i + 1}→{v + 1}</code>)}
            </div>
          </section>
        </div>

        <section className="panel right">
          <details className="info" open>
            <summary>How to use</summary>
            <ol>
              <li>Build a <b>key</b>: slide the puzzle with WASD/arrows, type a move string, or hit <b>Randomize</b>.</li>
              <li>Share that same key string with whoever needs to decrypt.</li>
              <li>Type text and press <b>Encrypt</b> → copy the Base64 ciphertext.</li>
              <li>To read a message, paste its ciphertext, set the same key, press <b>Decrypt</b>.</li>
            </ol>
            <p className="warn">Toy cipher (byte permutation) — educational, not real security.</p>
          </details>

          <label>Key — move sequence</label>
          <div className="keyrow">
            <input type="text" placeholder="WWADSSD…" value={moves}
              onChange={(e) => sanitizeKey(e.target.value)} />
            <button className="ghost" onClick={() => navigator.clipboard.writeText(moves)}>Copy</button>
          </div>
          <div className="keygen">
            <button onClick={() => setMoves(randomMoves(n, randLen || 50))}>Randomize</button>
            <input type="number" min="1" max="500" value={randLen}
              onChange={(e) => setRandLen(+e.target.value)} title="random move count" />
          </div>

          <label>Plaintext</label>
          <textarea rows="4" placeholder="Hello, World!" value={plain}
            onChange={(e) => setPlain(e.target.value)} />

          <div className="actions">
            <button className="primary" onClick={onEncrypt}>Encrypt ↓</button>
            <button onClick={onDecrypt}>Decrypt ↑</button>
          </div>

          <label>Ciphertext — Base64</label>
          <div className="keyrow">
            <textarea rows="4" placeholder="dGhpcyBpcyBh…" value={cipher}
              onChange={(e) => setCipher(e.target.value)} />
          </div>
          <button className="ghost copy-cipher" onClick={() => navigator.clipboard.writeText(cipher)}>Copy ciphertext</button>
        </section>
      </main>

      <footer className="copyright">© 2026 John Robert Santos</footer>
    </>
  );
}
