// Interactive demos for the bubble acoustics keynote.
// All physics in SI units unless noted.
(function () {
  'use strict';
  const RHO = 998, P0 = 101325, GAMMA = 1.4, SIGMA = 0.0725, MU = 0.001;
  const SR = 44100;

  // ---------------------------------------------------------------- audio utils
  let ctx = null;
  const ac = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SR }); if (ctx.state === 'suspended') ctx.resume(); return ctx; };
  let current = null;
  function stopAudio() { if (current) { try { current.stop(); } catch (e) {} current = null; } }
  function playSamples(data, gain = 0.9) {
    const c = ac(); stopAudio();
    let peak = 0; for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
    const buf = c.createBuffer(1, data.length, SR); const ch = buf.getChannelData(0);
    const s = peak > 0 ? gain / peak : 0; for (let i = 0; i < data.length; i++) ch[i] = data[i] * s;
    const src = c.createBufferSource(); src.buffer = buf; src.connect(c.destination); src.start();
    current = src; return src;
  }
  window.BubbleAudio = { stop: stopAudio };

  // Minnaert frequency (Hz) for radius r (m)
  const minnaert = (r) => Math.sqrt(3 * GAMMA * P0 / RHO) / (2 * Math.PI * r);
  // van den Doel (2005) damping (1/s), r in m
  const vddDamping = (r) => 0.13 / r + 0.0072 * Math.pow(r, -1.5);

  // Mulberry32 PRNG for repeatable demos
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function setupCanvas(cv) {
    const r = cv.getBoundingClientRect();
    // logical size = CSS size in stage coordinates (stage is scaled, so use offsetWidth)
    const w = cv.offsetWidth, h = cv.offsetHeight;
    if (cv.width !== w * 2) { cv.width = w * 2; cv.height = h * 2; }
    const g = cv.getContext('2d'); g.setTransform(2, 0, 0, 2, 0, 0);
    return { g, w, h };
  }
  function loop(fn) { let id = null, alive = false; const step = (t) => { if (!alive) return; fn(t); id = requestAnimationFrame(step); }; return { start() { if (!alive) { alive = true; id = requestAnimationFrame(step); } }, stop() { alive = false; cancelAnimationFrame(id); } }; }
  const $ = (id) => document.getElementById(id);

  // ================================================================ title bubbles
  (function titleBubbles() {
    const cv = $('title-canvas'); if (!cv) return;
    const R = rng(7); let bubs = [];
    const L = loop(() => {
      const { g, w, h } = setupCanvas(cv);
      if (bubs.length === 0) for (let i = 0; i < 90; i++) bubs.push({ x: R() * w, y: R() * h, r: 3 + 22 * Math.pow(R(), 3), ph: R() * 6 });
      g.clearRect(0, 0, w, h);
      for (const b of bubs) {
        b.y -= 0.25 + b.r * 0.05; b.ph += 0.05;
        if (b.y < -40) { b.y = h + 40; b.x = R() * w; }
        const x = b.x + Math.sin(b.ph) * b.r * 0.4;
        const grd = g.createRadialGradient(x - b.r * 0.3, b.y - b.r * 0.3, 0, x, b.y, b.r);
        grd.addColorStop(0, 'rgba(255,255,255,0.22)'); grd.addColorStop(0.7, 'rgba(79,195,247,0.06)'); grd.addColorStop(1, 'rgba(79,195,247,0.35)');
        g.fillStyle = grd; g.beginPath(); g.arc(x, b.y, b.r, 0, 7); g.fill();
      }
    });
    Deck.on('s-title', L.start, L.stop);
  })();

  // ================================================================ Minnaert oscillator
  (function minnaertDemo() {
    const cv = $('minnaert-canvas'); if (!cv) return;
    const slider = $('minnaert-r'), out = $('minnaert-f'), outd = $('minnaert-d'), outr = $('minnaert-rv');
    // Slider is log10(radius in mm); snap to 2 significant figures so it lands on 0.30, 1.0, 3.0 mm.
    const rMM = () => +Math.pow(10, parseFloat(slider.value)).toPrecision(2);
    const getR = () => rMM() * 1e-3;
    function update() { const r = getR(); outr.textContent = `${rMM().toPrecision(2)} mm`; out.textContent = `${Math.round(minnaert(r))} Hz`; outd.textContent = `${(1000 / vddDamping(r)).toFixed(1)} ms`; }
    slider.addEventListener('input', update); update();
    let ping = -1e9;
    $('minnaert-play').addEventListener('click', () => {
      const r = getR(), f0 = minnaert(r), d = vddDamping(r), n = Math.floor(SR * 0.4), x = new Float32Array(n);
      for (let i = 0; i < n; i++) { const t = i / SR; x[i] = Math.sin(2 * Math.PI * f0 * t) * Math.exp(-d * t); }
      playSamples(x, 0.6); ping = performance.now();
    });
    const L = loop((now) => {
      const { g, w: W, h: H } = setupCanvas(cv); g.clearRect(0, 0, W, H);
      const r = getR(); const cx = W / 2, cy = H / 2;
      const base = 30 + 120 * Math.sqrt(r / 5e-3);
      const age = (now - ping) / 1000; const env = Math.exp(-age * 1.2);
      const visF = 1.2 * Math.sqrt(2e-3 / r); // slowed-down visual oscillation
      const s = 1 + 0.18 * env * Math.sin(2 * Math.PI * visF * age);
      // rings
      for (let k = 0; k < 8; k++) {
        const rad = base + ((age * 160 + k * 70) % 560);
        const a = env * 0.5 * (1 - (rad - base) / 560);
        if (a > 0.01) { g.strokeStyle = `rgba(79,195,247,${a})`; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, rad, 0, 7); g.stroke(); }
      }
      const rr = base * s;
      const grd = g.createRadialGradient(cx - rr * 0.3, cy - rr * 0.3, 0, cx, cy, rr);
      grd.addColorStop(0, 'rgba(255,255,255,0.55)'); grd.addColorStop(1, 'rgba(79,195,247,0.55)');
      g.fillStyle = grd; g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.fill();
      g.fillStyle = '#ffb74d'; g.font = '22px Avenir Next, Helvetica'; g.textAlign = 'center';
      g.fillText('gas = spring (stiffness)', cx, cy - base - 30);
      g.fillStyle = '#4fc3f7'; g.fillText('surrounding water = mass', cx, H - 24);
    });
    Deck.on('s-minnaert', L.start, () => { L.stop(); stopAudio(); });
  })();

  // ================================================================ Tank: frequency vs position
  (function tankDemo() {
    const cv = $('tank-canvas'); if (!cv) return;
    const rs = $('tank-r'), out = $('tank-f'), out0 = $('tank-f0');
    const tankW = 0.08, tankH = 0.10; // metres (8 cm wide, 10 cm water depth)
    let pos = { x: 0.04, y: 0.05 }; // y measured from free surface downward
    let drag = false, osc = null, gn = null;
    const getR = () => parseFloat(rs.value) * 1e-3;
    function freqAt(p) {
      const R = getR();
      const d = [p.y, p.x, tankW - p.x, tankH - p.y].map(v => Math.max(v, 1.15 * R));
      const fac = 1 - R / (2 * d[0]) + R / (2 * d[1]) + R / (2 * d[2]) + R / (2 * d[3]);
      return minnaert(R) / Math.sqrt(fac);
    }
    function geom(W, H) { const s = Math.min((W - 80) / tankW, (H - 60) / (tankH * 1.25)); const ox = (W - tankW * s) / 2, oy = 30 + tankH * 0.25 * s; return { s, ox, oy }; }
    function toWorld(e) {
      const r = cv.getBoundingClientRect(); const k = cv.offsetWidth / r.width;
      const x = (e.clientX - r.left) * k, y = (e.clientY - r.top) * k;
      const { s, ox, oy } = geom(cv.offsetWidth, cv.offsetHeight);
      const R = getR();
      return { x: Math.min(tankW - R, Math.max(R, (x - ox) / s)), y: Math.min(tankH - R, Math.max(R, (y - oy) / s)) };
    }
    function startTone() {
      const c = ac(); osc = c.createOscillator(); gn = c.createGain(); gn.gain.value = 0; osc.connect(gn).connect(c.destination);
      osc.frequency.value = freqAt(pos); osc.start(); gn.gain.setTargetAtTime(0.18, c.currentTime, 0.02);
    }
    function stopTone() { if (osc) { const c = ac(); gn.gain.setTargetAtTime(0, c.currentTime, 0.03); const o = osc; setTimeout(() => o.stop(), 200); osc = null; } }
    cv.addEventListener('pointerdown', (e) => { drag = true; pos = toWorld(e); cv.setPointerCapture(e.pointerId); startTone(); });
    cv.addEventListener('pointermove', (e) => { if (!drag) return; pos = toWorld(e); if (osc) osc.frequency.setTargetAtTime(freqAt(pos), ac().currentTime, 0.01); });
    cv.addEventListener('pointerup', () => { drag = false; stopTone(); });
    // "Bloop": rising bubble passing through the free surface region
    $('tank-bloop').addEventListener('click', () => {
      const R = getR(), n = Math.floor(SR * 0.6), x = new Float32Array(n); let ph = 0;
      const y0 = Math.max(3 * R, 0.012), v = 0.25; // m/s, exaggerated rise
      for (let i = 0; i < n; i++) { const t = i / SR; const y = Math.max(1.15 * R, y0 - v * t); const f = freqAt({ x: pos.x, y }); ph += 2 * Math.PI * f / SR; x[i] = Math.sin(ph) * Math.exp(-t * 9); }
      playSamples(x, 0.6);
    });
    const L = loop(() => {
      const { g, w: W, h: H } = setupCanvas(cv); g.clearRect(0, 0, W, H);
      const { s, ox, oy } = geom(W, H);
      // heatmap
      const R = getR(), f0 = minnaert(R), N = 48;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const p = { x: (i + 0.5) / N * tankW, y: (j + 0.5) / N * tankH };
        const rel = freqAt(p) / f0 - 1; // -0.2 .. +0.4
        const c = rel > 0 ? `rgba(229,115,115,${Math.min(0.85, rel * 3)})` : `rgba(79,195,247,${Math.min(0.85, -rel * 6)})`;
        g.fillStyle = c; g.fillRect(ox + i / N * tankW * s, oy + j / N * tankH * s, tankW * s / N + 1, tankH * s / N + 1);
      }
      g.strokeStyle = '#cfe8f5'; g.lineWidth = 4; g.beginPath(); g.moveTo(ox, oy - tankH * 0.2 * s); g.lineTo(ox, oy + tankH * s); g.lineTo(ox + tankW * s, oy + tankH * s); g.lineTo(ox + tankW * s, oy - tankH * 0.2 * s); g.stroke();
      g.strokeStyle = '#4fc3f7'; g.setLineDash([10, 8]); g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + tankW * s, oy); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#8fa9bb'; g.font = '20px Avenir Next, Helvetica'; g.textAlign = 'left';
      g.fillText('free surface (p = 0)', ox + 8, oy - 10);
      g.fillText('rigid walls (∂p/∂n = 0)', ox, oy + tankH * s + 24);
      const bx = ox + pos.x * s, by = oy + pos.y * s, br = Math.max(5, R * s);
      g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(bx, by, br, 0, 7); g.fill();
      const f = freqAt(pos); out.textContent = `${Math.round(f)} Hz`; out0.textContent = `${Math.round(f0)} Hz`;
    });
    rs.addEventListener('input', () => { if (osc) osc.frequency.value = freqAt(pos); });
    Deck.on('s-tank', L.start, () => { L.stop(); stopTone(); });
  })();

  // ================================================================ van den Doel synthesis
  function vddGenerate(p, seconds, seed) {
    // p: {rate, rmin, rmax, beta, xi, alpha}; radii in mm
    const R = rng(seed || 1), n = Math.floor(seconds * SR), x = new Float32Array(n), events = [];
    let t = 0;
    while (true) {
      t += -Math.log(1 - R()) / p.rate; if (t >= seconds) break;
      // sample r from p(r) ∝ r^-beta on [rmin, rmax]
      const a = p.rmin, b = p.rmax, u = R(); let r;
      if (Math.abs(p.beta - 1) < 1e-6) r = a * Math.pow(b / a, u);
      else { const e = 1 - p.beta; r = Math.pow(Math.pow(a, e) + u * (Math.pow(b, e) - Math.pow(a, e)), 1 / e); }
      events.push({ t, r });
    }
    for (const ev of events) {
      const r = ev.r * 1e-3, f0 = 3 / r, d = vddDamping(r), amp = Math.pow(ev.r, p.alpha) * (0.6 + 0.4 * R());
      const sigma = p.xi * d; const len = Math.min(n - Math.floor(ev.t * SR), Math.floor(SR * 6 / d));
      let ph = 0; const i0 = Math.floor(ev.t * SR);
      for (let k = 0; k < len; k++) { const tt = k / SR; ph += 2 * Math.PI * f0 * (1 + sigma * tt) / SR; x[i0 + k] += amp * Math.sin(ph) * Math.exp(-d * tt); }
    }
    return { x, events };
  }
  const VDD_PRESETS = {
    drip: { rate: 3, rmin: 2, rmax: 4.5, beta: 1.0, xi: 0.1, alpha: 1.5 },
    stream: { rate: 120, rmin: 0.5, rmax: 6, beta: 2.0, xi: 0.1, alpha: 1.5 },
    rain: { rate: 600, rmin: 0.15, rmax: 0.6, beta: 1.0, xi: 0.05, alpha: 1.5 },
    pour: { rate: 900, rmin: 0.6, rmax: 8, beta: 2.5, xi: 0.15, alpha: 1.5 },
  };
  (function vddDemo() {
    const cv = $('vdd-canvas'); if (!cv) return;
    const ids = ['rate', 'rmin', 'rmax', 'beta', 'xi'];
    const el = Object.fromEntries(ids.map(k => [k, $('vdd-' + k)]));
    let last = null, startT = 0, playing = false;
    const params = () => ({ rate: +el.rate.value, rmin: +el.rmin.value, rmax: Math.max(+el.rmax.value, +el.rmin.value + 0.05), beta: +el.beta.value, xi: +el.xi.value, alpha: 1.5 });
    function labels() { ids.forEach(k => { $('vdd-' + k + '-v').textContent = el[k].value; }); }
    ids.forEach(k => el[k].addEventListener('input', labels)); labels();
    function go() { last = vddGenerate(params(), 5, Math.floor(Math.random() * 1e9)); playSamples(last.x, 0.8); startT = performance.now(); playing = true; }
    document.querySelectorAll('[data-vdd]').forEach(b => b.addEventListener('click', () => {
      const p = VDD_PRESETS[b.dataset.vdd]; ids.forEach(k => { el[k].value = p[k]; }); labels(); go();
      document.querySelectorAll('[data-vdd]').forEach(o => o.classList.toggle('active', o === b));
    }));
    $('vdd-play').addEventListener('click', go);
    $('vdd-stop').addEventListener('click', () => { stopAudio(); playing = false; });
    const L = loop((now) => {
      const { g, w: W, h: H } = setupCanvas(cv); g.clearRect(0, 0, W, H);
      const fmin = 200, fmax = 25000, ly = (f) => H - 40 - (Math.log(f / fmin) / Math.log(fmax / fmin)) * (H - 70);
      g.strokeStyle = 'rgba(255,255,255,0.12)'; g.fillStyle = '#8fa9bb'; g.font = '18px Avenir Next, Helvetica'; g.textAlign = 'right';
      for (const f of [250, 500, 1000, 2000, 4000, 8000, 16000]) { const y = ly(f); g.beginPath(); g.moveTo(60, y); g.lineTo(W, y); g.stroke(); g.fillText(f >= 1000 ? f / 1000 + 'k' : f, 54, y + 6); }
      g.textAlign = 'left'; g.fillText('time →   (each dot = one bubble: start time, Minnaert freq.)', 70, H - 12);
      if (!last) return;
      const tnow = playing ? (now - startT) / 1000 : 5;
      for (const ev of last.events) {
        if (ev.t > tnow) continue;
        const x = 60 + (ev.t / 5) * (W - 70), y = ly(3 / (ev.r * 1e-3)); const fresh = Math.max(0, 1 - (tnow - ev.t) * 4);
        g.fillStyle = fresh > 0 ? `rgba(255,183,77,${0.5 + 0.5 * fresh})` : 'rgba(79,195,247,0.55)';
        g.beginPath(); g.arc(x, y, 2 + ev.r * 1.3 + fresh * 6, 0, 7); g.fill();
      }
      if (tnow >= 5) playing = false;
    });
    Deck.on('s-vdd', () => { if (!last) { last = vddGenerate(params(), 5, 1); playing = false; } L.start(); }, () => { L.stop(); stopAudio(); });
  })();

  // ================================================================ FFT
  function fft(re, im, inv) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = 2 * Math.PI / len * (inv ? 1 : -1), wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let j = 0; j < len / 2; j++) {
        const a = i + j, b = a + len / 2, tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti; const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr; } }
    }
    if (inv) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  }
  function welch(x, N = 4096) {
    const out = new Float64Array(N / 2); let cnt = 0; const re = new Float64Array(N), im = new Float64Array(N);
    for (let s = 0; s + N <= x.length; s += N / 2) { for (let i = 0; i < N; i++) { re[i] = x[s + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)); im[i] = 0; } fft(re, im); for (let k = 0; k < N / 2; k++) out[k] += re[k] * re[k] + im[k] * im[k]; cnt++; }
    for (let k = 0; k < N / 2; k++) out[k] = 10 * Math.log10(out[k] / cnt + 1e-20); return out;
  }

  // ================================================================ Same spectrum, different sound
  (function sameSpectrum() {
    const cv = $('ss-canvas'); if (!cv) return;
    let bubbles = null, noise = null, specA = null, specB = null, which = null;
    function build() {
      const n = 1 << 18; // ~5.9 s
      const g = vddGenerate(VDD_PRESETS.stream, n / SR, 4242).x;
      const re = new Float64Array(n), im = new Float64Array(n); for (let i = 0; i < n; i++) re[i] = g[i];
      fft(re, im); const R = rng(99);
      for (let k = 1; k < n / 2; k++) { const m = Math.hypot(re[k], im[k]), ph = 2 * Math.PI * R(); re[k] = m * Math.cos(ph); im[k] = m * Math.sin(ph); re[n - k] = re[k]; im[n - k] = -im[k]; }
      fft(re, im, true);
      bubbles = g; noise = new Float32Array(n);
      let ea = 0, eb = 0; for (let i = 0; i < n; i++) { ea += g[i] * g[i]; eb += re[i] * re[i]; }
      const s = Math.sqrt(ea / eb); for (let i = 0; i < n; i++) noise[i] = re[i] * s;
      specA = welch(bubbles); specB = welch(noise);
    }
    function play(kind) {
      if (!bubbles) build(); which = kind;
      // use common normalization so loudness (RMS) matches
      let peak = 0; for (const v of bubbles) peak = Math.max(peak, Math.abs(v));
      const src = kind === 'a' ? bubbles : noise; const y = new Float32Array(src.length); for (let i = 0; i < y.length; i++) y[i] = Math.max(-1, Math.min(1, src[i] / peak * 0.8));
      stopAudio(); const c = ac(); const buf = c.createBuffer(1, y.length, SR); buf.copyToChannel(y, 0); const s = c.createBufferSource(); s.buffer = buf; s.connect(c.destination); s.start(); current = s;
      draw();
    }
    $('ss-a').addEventListener('click', () => play('a'));
    $('ss-b').addEventListener('click', () => play('b'));
    function draw() {
      if (!bubbles) build();
      const { g, w: W, h: H } = setupCanvas(cv); g.clearRect(0, 0, W, H);
      // top: waveforms
      const wh = H * 0.36;
      const wave = (x, y0, col, label) => {
        g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); let peak = 0; for (const v of bubbles) peak = Math.max(peak, Math.abs(v));
        const n = Math.floor(SR * 1.0), step = Math.max(1, Math.floor(n / W));
        for (let px = 0; px < W; px++) { let mn = 0, mx = 0; for (let k = 0; k < step; k++) { const v = x[px * step + k] / peak; mn = Math.min(mn, v); mx = Math.max(mx, v); } g.moveTo(px, y0 - mx * wh * 0.45); g.lineTo(px, y0 - mn * wh * 0.45); }
        g.stroke(); g.fillStyle = col; g.font = '20px Avenir Next, Helvetica'; g.textAlign = 'left'; g.fillText(label, 6, y0 - wh * 0.32);
      };
      wave(bubbles, wh * 0.5, which === 'a' ? '#ffb74d' : '#4fc3f7', 'A: bubble events (1 s)');
      wave(noise, wh * 1.5 + 10, which === 'b' ? '#ffb74d' : '#e57373', 'B: same spectrum, random phase (1 s)');
      // bottom: spectra
      const top = wh * 2 + 40, ph = H - top - 30, fmin = 100, fmax = 20000;
      const lx = (f) => 60 + Math.log(f / fmin) / Math.log(fmax / fmin) * (W - 70);
      let mx = -1e9; for (const v of specA) mx = Math.max(mx, v);
      const ly = (db) => top + (mx - db) / 60 * ph;
      g.strokeStyle = 'rgba(255,255,255,0.12)'; g.fillStyle = '#8fa9bb'; g.font = '18px Avenir Next, Helvetica'; g.textAlign = 'center';
      for (const f of [200, 500, 1000, 2000, 5000, 10000]) { const x = lx(f); g.beginPath(); g.moveTo(x, top); g.lineTo(x, top + ph); g.stroke(); g.fillText(f >= 1000 ? f / 1000 + ' kHz' : f + ' Hz', x, top + ph + 22); }
      const spec = (s, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); let first = true; for (let k = 1; k < s.length; k++) { const f = k * SR / 4096; if (f < fmin || f > fmax) continue; const y = Math.min(top + ph, ly(s[k])); first ? g.moveTo(lx(f), y) : g.lineTo(lx(f), y); first = false; } g.stroke(); };
      spec(specA, '#4fc3f7', 4); spec(specB, 'rgba(229,115,115,0.9)', 2);
      g.textAlign = 'right'; g.fillStyle = '#e8f1f7'; g.font = '20px Avenir Next, Helvetica'; g.fillText('long-time average power spectrum (A blue, B red)', W - 14, top + 20);
    }
    Deck.on('s-samespec', () => setTimeout(draw, 30), stopAudio);
  })();

  // ================================================================ Coupled bubbles (pair + cloud)
  function jacobiEig(A, n) { // symmetric, A as Float64Array n*n; returns {vals, vecs(col-major)}
    const a = Float64Array.from(A), v = new Float64Array(n * n); for (let i = 0; i < n; i++) v[i * n + i] = 1;
    for (let sweep = 0; sweep < 60; sweep++) {
      let off = 0; for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p * n + q] ** 2; if (off < 1e-22) break;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
        const apq = a[p * n + q]; if (Math.abs(apq) < 1e-30) continue;
        const th = (a[q * n + q] - a[p * n + p]) / (2 * apq), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) { const akp = a[k * n + p], akq = a[k * n + q]; a[k * n + p] = c * akp - s * akq; a[k * n + q] = s * akp + c * akq; }
        for (let k = 0; k < n; k++) { const apk = a[p * n + k], aqk = a[q * n + k]; a[p * n + k] = c * apk - s * aqk; a[q * n + k] = s * apk + c * aqk; }
        for (let k = 0; k < n; k++) { const vkp = v[k * n + p], vkq = v[k * n + q]; v[k * n + p] = c * vkp - s * vkq; v[k * n + q] = s * vkp + c * vkq; }
      }
    }
    return { vals: Array.from({ length: n }, (_, i) => a[i * n + i]), vecs: v };
  }
  // Lowest coupled mode frequency (Hz): smallest ω with K φ = ω² M φ, where M_ii = ρ/(4πR_i), M_ij = ρ/(4πd_ij), K_ii = 3γP0/(4πR_i³).
  // Solved as the largest eigenvalue μ = 1/ω² of K^-1/2 M K^-1/2. bubbles: [{x,y,z,r}] metres.
  function lowestCoupledFreq(bubs) {
    const n = bubs.length, K = bubs.map(b => 3 * GAMMA * P0 / (4 * Math.PI * b.r ** 3)), A = new Float64Array(n * n);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const m = i === j ? RHO / (4 * Math.PI * bubs[i].r) : RHO / (4 * Math.PI * Math.hypot(bubs[i].x - bubs[j].x, bubs[i].y - bubs[j].y, bubs[i].z - bubs[j].z));
      A[i * n + j] = m / Math.sqrt(K[i] * K[j]);
    }
    return 1 / (2 * Math.PI * Math.sqrt(Math.max(...jacobiEig(A, n).vals)));
  }
  (function coupledDemo() {
    const cv = $('coupled-canvas'); if (!cv) return;
    const nS = $('cl-n'), spS = $('cl-spread'), rminS = $('cl-rmin'), rmaxS = $('cl-rmax');
    let bubs = [], largest = null, fU = 0, fC = 0;
    function build() {
      const N = +nS.value, spread = +spS.value * 1e-3, R = rng(11); bubs = [];
      const lo = +rminS.value * 1e-3, hi = +rmaxS.value * 1e-3;
      let tries = 0;
      while (bubs.length < N && tries < 20000) {
        tries++;
        const r = lo + (hi - lo) * R(); const u = R(), th = 2 * Math.PI * R(), cz = 2 * R() - 1, rad = spread * Math.cbrt(u), sz = Math.sqrt(1 - cz * cz);
        const b = { x: rad * sz * Math.cos(th), y: rad * sz * Math.sin(th), z: rad * cz, r };
        if (bubs.every(o => Math.hypot(o.x - b.x, o.y - b.y, o.z - b.z) > (o.r + b.r) * 1.15)) bubs.push(b);
      }
      largest = bubs.reduce((a, b) => (b.r > a.r ? b : a));
      fU = minnaert(largest.r); fC = lowestCoupledFreq(bubs); // uncoupled, the lowest mode is the largest bubble's Minnaert frequency
      $('cl-n-v').textContent = bubs.length; $('cl-spread-v').textContent = spS.value + ' mm';
      $('cl-r-v').textContent = `${(+rminS.value).toFixed(1)}–${(+rmaxS.value).toFixed(1)} mm`;
      draw();
    }
    function draw() {
      const { g, w: W, h: H } = setupCanvas(cv); g.clearRect(0, 0, W, H);
      // left: cloud (x-y projection), largest bubble outlined
      const spread = +spS.value * 1e-3, cw = Math.min(W * 0.42, H - 40), cx = cw / 2 + 10, cy = H / 2, s = (cw / 2 - 10) / Math.max(spread, 4e-3);
      g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, spread * s, 0, 7); g.stroke();
      const sorted = [...bubs].sort((a, b) => a.z - b.z);
      for (const b of sorted) { g.fillStyle = `rgba(207,232,245,${0.35 + 0.4 * (b.z / spread + 1) / 2})`; g.beginPath(); g.arc(cx + b.x * s, cy + b.y * s, Math.max(2, b.r * s), 0, 7); g.fill(); }
      g.strokeStyle = '#4fc3f7'; g.lineWidth = 3; g.beginPath(); g.arc(cx + largest.x * s, cy + largest.y * s, Math.max(2, largest.r * s) + 4, 0, 7); g.stroke();
      g.fillStyle = '#8fa9bb'; g.font = '18px Avenir Next, Helvetica'; g.textAlign = 'center'; g.fillText('bubble cloud (projection)', cx, H - 6);
      // right: the two lowest modes
      const px = cw + 70;
      const block = (y, col, label, f, note) => {
        g.textAlign = 'left';
        g.fillStyle = '#8fa9bb'; g.font = '26px Avenir Next, Helvetica'; g.fillText(label, px, y);
        g.fillStyle = col; g.font = '600 76px Avenir Next, Helvetica'; g.fillText(Math.round(f) + ' Hz', px, y + 82);
        g.fillStyle = '#8fa9bb'; g.font = '22px Avenir Next, Helvetica'; g.fillText(note, px, y + 120);
      };
      block(H * 0.2, '#4fc3f7', 'Lowest mode, uncoupled', fU, `largest bubble alone (r = ${(largest.r * 1e3).toFixed(1)} mm)`);
      const pct = Math.round(100 * (1 - fC / fU)), oct = Math.log2(fU / fC);
      block(H * 0.6, '#ffb74d', 'Lowest mode, coupled', fC, `whole cloud together · ${pct}% lower` + (oct >= 0.1 ? ` (${oct.toFixed(1)} octave)` : ''));
    }
    // Two-thumb radius slider: a thumb stops at the other one, so r_min ≤ r_max always.
    function radiusRange(moved) {
      if (+rminS.value > +rmaxS.value) moved.value = moved === rminS ? rmaxS.value : rminS.value;
      const pct = (el) => (100 * (el.value - el.min) / (el.max - el.min)) + '%', wrap = rminS.parentElement;
      wrap.style.setProperty('--lo', pct(rminS)); wrap.style.setProperty('--hi', pct(rmaxS));
    }
    rminS.addEventListener('input', () => radiusRange(rminS)); rmaxS.addEventListener('input', () => radiusRange(rmaxS)); radiusRange(rmaxS);
    // Pointer dragging is handled on the wrapper: grab the nearest thumb; if the thumbs sit together,
    // the first drag direction picks one (left = min, right = max), so neither can get stuck under the other.
    const wrap = rminS.parentElement, THUMB = 26;
    wrap.addEventListener('click', (e) => e.preventDefault()); // don't let the surrounding <label> focus an input
    wrap.addEventListener('pointerdown', (e) => {
      const r = wrap.getBoundingClientRect(), half = THUMB / 2 * r.width / wrap.offsetWidth, lo = +rminS.min, hi = +rminS.max;
      const toVal = (x) => lo + Math.min(1, Math.max(0, (x - r.left - half) / (r.width - 2 * half))) * (hi - lo);
      const v = toVal(e.clientX), dMin = Math.abs(v - rminS.value), dMax = Math.abs(v - rmaxS.value), x0 = e.clientX;
      let target = dMin < dMax ? rminS : dMax < dMin ? rmaxS : null;
      const move = (ev) => {
        if (!target) { if (Math.abs(ev.clientX - x0) < 2) return; target = ev.clientX < x0 ? rminS : rmaxS; }
        target.value = toVal(ev.clientX); target.dispatchEvent(new Event('input'));
      };
      e.preventDefault(); wrap.setPointerCapture(e.pointerId); move(e);
      wrap.onpointermove = move; wrap.onpointerup = wrap.onpointercancel = () => { wrap.onpointermove = null; };
    });
    [nS, spS, rminS, rmaxS].forEach(sl => sl.addEventListener('input', build));
    Deck.on('s-coupled-demo', () => setTimeout(build, 30));
  })();

  // generic audio buttons: <button data-audio="path">
  document.querySelectorAll('[data-audio]').forEach(b => {
    const a = new Audio(b.dataset.audio);
    b.addEventListener('click', () => { document.querySelectorAll('audio').forEach(x => x.pause()); stopAudio(); a.currentTime = 0; a.play(); });
  });
})();
