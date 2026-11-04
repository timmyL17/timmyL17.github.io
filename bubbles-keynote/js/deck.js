// reveal.js glue: per-slide demo hooks, pacing from data-time, notes overlay, video keys.
(function () {
  const hooks = {}; // id -> {enter, leave}
  window.Deck = {
    on(id, enter, leave) { hooks[id] = { enter, leave }; },
    get current() { return Reveal.getCurrentSlide(); },
  };
  const enter = (sl) => { const h = sl && hooks[sl.id]; if (h && h.enter) h.enter(sl); };
  const leave = (sl) => { const h = sl && hooks[sl.id]; if (h && h.leave) h.leave(sl); };

  // Inside the speaker view's preview iframes, video keys should act on the projector window.
  const receiver = /receiver/i.test(location.search);
  function videoAction(action) {
    if (receiver) {
      try { window.parent.opener.postMessage(JSON.stringify({ namespace: 'bubbles', action }), '*'); } catch (e) {}
      return;
    }
    const v = Reveal.getCurrentSlide().querySelector('video'); if (!v) return;
    if (action === 'toggle') v.paused ? v.play() : v.pause();
    else { v.currentTime = 0; v.play(); }
  }
  window.addEventListener('message', (e) => {
    let d; try { d = JSON.parse(e.data); } catch (err) { return; }
    if (d && d.namespace === 'bubbles') videoAction(d.action);
  });

  // data-time holds each slide's target start ("m:ss"): show it in the notes, and give the
  // speaker view's pacing timer the gap to the next timed slide (60 s for the last one).
  function setupTiming() {
    const slides = Array.from(document.querySelectorAll('.reveal .slides > section'));
    const secs = (s) => { const m = /^(\d+):(\d\d)$/.exec(s || ''); return m ? 60 * m[1] + +m[2] : null; };
    slides.forEach((sl, i) => {
      const t = secs(sl.dataset.time);
      if (t !== null) {
        const next = slides.slice(i + 1).map(s => secs(s.dataset.time)).find(x => x !== null);
        if (next !== undefined) sl.dataset.timing = next - t;
      }
      const n = sl.querySelector('aside.notes');
      if (n && sl.dataset.time) n.insertAdjacentHTML('afterbegin', `<p class="target">Target ${sl.dataset.time}</p>`);
    });
  }

  // In-window notes overlay (N), handy for rehearsing without the speaker view.
  const notesEl = document.getElementById('notes');
  function updateNotes() {
    const sl = Reveal.getCurrentSlide();
    const n = sl.querySelector('aside.notes');
    const title = sl.querySelector('h1,h2')?.firstChild?.textContent?.trim() ?? '';
    notesEl.innerHTML = `<div class="meta">Slide ${Reveal.getIndices().h + 1}/${Reveal.getTotalSlides()} — ${title}</div>` + (n ? n.innerHTML : '<i>(no notes)</i>');
  }

  function setupInputs() {
    // reveal ignores keys while an input has focus, so a clicked slider would swallow the arrows.
    // Blur it (and keep its value) before the event bubbles to reveal's document handler.
    document.querySelectorAll('input[type=range]').forEach(r => r.addEventListener('keydown', e => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) { e.preventDefault(); r.blur(); }
    }));
    document.querySelectorAll('button').forEach(b => b.addEventListener('mouseup', () => b.blur()));

    // Missing-media placeholders: replace video that fails to load with a dashed box.
    document.querySelectorAll('video').forEach(v => {
      const fail = () => {
        if (v.dataset.failed) return; v.dataset.failed = 1;
        const d = document.createElement('div'); d.className = 'placeholder';
        d.innerHTML = `Video not found<br><code style="font-size:22px">${v.getAttribute('src') || v.dataset.src}</code>`;
        v.replaceWith(d);
      };
      v.addEventListener('error', fail);
    });
  }

  // Initialize after all scripts have run, so demos.js has registered its hooks before 'ready'.
  document.addEventListener('DOMContentLoaded', () => {
    if (window.renderMathInElement) renderMathInElement(document.body, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '\\(', right: '\\)', display: false }] });
    setupTiming();
    setupInputs();

    Reveal.initialize({
      width: 1920, height: 1080, margin: 0, minScale: 0.1, maxScale: 4,
      center: false, display: 'flex',
      controls: false, progress: true, slideNumber: 'c/t',
      // URLs use slide ids (#/s-tank). hashOneBasedIndex would put the speaker view off by one.
      hash: true, respondToHashChanges: true,
      transition: 'none', backgroundTransition: 'none',
      navigationMode: 'linear',
      defaultTiming: 60,
      plugins: [RevealNotes],
    });
    Reveal.addKeyBinding({ keyCode: 80, key: 'P', description: 'Play / pause video on slide' }, () => videoAction('toggle'));
    Reveal.addKeyBinding({ keyCode: 82, key: 'R', description: 'Restart video on slide' }, () => videoAction('restart'));
    Reveal.addKeyBinding({ keyCode: 78, key: 'N', description: 'Notes overlay in this window' }, () => notesEl.classList.toggle('on'));

    Reveal.on('ready', (e) => { updateNotes(); enter(e.currentSlide); });
    Reveal.on('slidechanged', (e) => { leave(e.previousSlide); updateNotes(); enter(e.currentSlide); });
  });
})();
