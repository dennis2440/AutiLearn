const PATHS = {
  I: [[[.5,.15],[.5,.85]]], L: [[[.3,.15],[.3,.85],[.7,.85]]], T: [[[.2,.15],[.8,.15]],[[.5,.15],[.5,.85]]],
  V: [[[.25,.15],[.5,.85],[.75,.15]]], 1: [[[.35,.3],[.55,.15],[.55,.85]]], 7: [[[.25,.15],[.75,.15],[.4,.85]]],
  O: [Array.from({ length: 25 }, (_, i) => [.5 + .32 * Math.cos(i / 24 * 6.2832 - 1.5708), .5 + .32 * Math.sin(i / 24 * 6.2832 - 1.5708)])],
  A: [[[.2,.85],[.5,.15],[.8,.85]],[[.32,.6],[.68,.6]]], H: [[[.28,.15],[.28,.85]],[[.72,.15],[.72,.85]],[[.28,.5],[.72,.5]]],
  E: [[[.72,.15],[.3,.15],[.3,.85],[.72,.85]],[[.3,.5],[.65,.5]]], Z: [[[.25,.15],[.75,.15],[.25,.85],[.75,.85]]],
  "□": [[[.25,.25],[.75,.25],[.75,.75],[.25,.75],[.25,.25]]], "△": [[[.5,.2],[.8,.8],[.2,.8],[.5,.2]]],
};
const BASIC = ["I","L","T","V","O","1","7"], EXTRA = ["A","H","E","Z","□","△"];

const TRACE_STAGES = [
  { name: "✏️ Stage 1: Basic Lines", desc: "Trace simple straight lines", pool: ["I","L","T"] },
  { name: "🔺 Stage 2: Shapes", desc: "Trace geometric shapes", pool: ["V","O","1"] },
  { name: "🔤 Stage 3: Letters", desc: "Trace letter shapes", pool: ["A","H","E"] },
  { name: "🌟 Stage 4: Mixed Challenge", desc: "Trace all kinds of shapes", pool: ["I","L","V","O","A","H"] }
];

Views.trace = (el, stageNum = 0) => {
  const d = Store.s.difficulty, S = Math.max(220, Math.min(el.clientWidth - 32, innerHeight - 240, 380));
  const stage = TRACE_STAGES[stageNum];
  const pool = stage.pool.concat(Store.has("trace") ? EXTRA : []);
  let stageScore = 0, attempts = 0, correctCount = 0, skippedCount = 0;
  el.innerHTML = `<div style="text-align:center;margin-bottom:12px;padding:12px;background:#e8f4ff;border-radius:12px">
    <div style="font-size:0.9rem;color:#294c7b;font-weight:600">${stage.name}</div>
    <div style="font-size:0.8rem;color:#7186a1;margin-top:4px">${stage.desc}</div>
    <div style="margin-top:8px;font-weight:800;color:#0869c8">Progress: ${correctCount}/4 correct | ⏭️ ${skippedCount}/4 skipped</div>
  </div>
  <p class="q" id="tq"></p><div class="cv" style="width:${S}px;height:${S}px">
    <canvas id="g" width="${S}" height="${S}"></canvas><canvas id="d" width="${S}" height="${S}"></canvas><i class="hand" hidden>👆</i></div>
    <div class="row"><button class="ghost" id="clr">Clear</button><button class="ghost" id="skip" style="background:#fff;border-color:#ff9d25;color:#ff9d25;margin-left:auto">⏭️ Skip</button></div>
    <div id="nextStage" style="display:none;text-align:center;margin-top:20px">
      <p style="font-size:1.2rem;margin:10px 0">🎉 Stage Complete!</p>
      ${stageNum < TRACE_STAGES.length - 1 ? 
        `<button class="card ok" id="nextBtn" style="width:100%;min-height:50px">Next Stage →</button>` :
        `<button class="card ok" id="nextBtn" style="width:100%;min-height:50px">🏆 Activity Complete!</button>`
      }
    </div>
    <div id="stageFailed" style="display:none;text-align:center;margin-top:20px">
      <p style="font-size:1.2rem;margin:10px 0;color:#ff6b6b">⚠️ Need More Practice</p>
      <p style="color:#7186a1;margin-bottom:16px">You need 3 or more correct answers. Let's try again!</p>
      <button class="card ok" id="retryBtn" style="width:100%;min-height:50px">Try Again</button>
    </div>`;
  const q = (s) => el.querySelector(s), G = q("#g"), D = q("#d"), hand = q(".hand"), gc = G.getContext("2d"), c = D.getContext("2d");
  const W = S * (0.14 - 0.02 * d);
  let t = { g: pick(pool), ok: 0 }, mask, pts = [], busy = false, on = false, timer;
  const inShape = (x, y) => x >= 0 && y >= 0 && x < S && y < S && mask[((y | 0) * S + (x | 0)) * 4 + 3] > 40;
  const seg = (a, b, col) => { c.strokeStyle = col; c.lineWidth = S / 16; c.lineCap = "round"; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); };
  const frame = () => new Promise(r => requestAnimationFrame(r));

  const start = () => {
    const mem = t.ok >= 2;
    pts = []; busy = false; c.clearRect(0, 0, S, S); gc.clearRect(0, 0, S, S);
    gc.strokeStyle = "#cfd8e8"; gc.lineWidth = W; gc.lineCap = gc.lineJoin = "round";
    PATHS[t.g].forEach(st => { gc.beginPath(); st.forEach(([x, y], i) => i ? gc.lineTo(x * S, y * S) : gc.moveTo(x * S, y * S)); gc.stroke(); });
    mask = gc.getImageData(0, 0, S, S).data;
    G.style.opacity = mem ? 0 : 1;
    if (!mem) { const [x, y] = PATHS[t.g][0][0]; c.fillStyle = "#3f8f6b"; c.beginPath(); c.arc(x * S, y * S, W * 0.4, 0, 7); c.fill(); }
    q("#tq").innerHTML = mem ? `Draw <b>${t.g}</b> from memory 🧠` : `Trace: <b>${t.g}</b>`;
    q(".cv").parentElement.querySelector("#nextStage").style.display = "none";
  };

  const demo = async () => {
    c.clearRect(0, 0, S, S); G.style.opacity = 1; hand.hidden = false;
    c.strokeStyle = "#3f8f6b"; c.lineWidth = S / 16; c.lineCap = "round";
    for (const st of PATHS[t.g]) {
      let px = st[0][0] * S, py = st[0][1] * S;
      for (let i = 1; i < st.length; i++) {
        const [x0, y0] = st[i - 1], [x1, y1] = st[i], n = Math.ceil(Math.hypot((x1 - x0) * S, (y1 - y0) * S) / 5);
        for (let k = 1; k <= n; k++) {
          if (!el.isConnected) return;
          const x = (x0 + (x1 - x0) * k / n) * S, y = (y0 + (y1 - y0) * k / n) * S;
          c.beginPath(); c.moveTo(px, py); c.lineTo(x, y); c.stroke(); px = x; py = y;
          hand.style.transform = `translate(${x}px,${y}px)`; await frame();
        }
      }
    }
    hand.hidden = true; await sleep(700);
  };

  const grade = async () => {
    if (pts.length < 12 || busy) return;
    busy = true;
    const acc = pts.filter(p => inShape(p.x, p.y)).length / pts.length, cells = [];
    for (let y = 0; y < S; y += 6) for (let x = 0; x < S; x += 6) if (inShape(x, y)) cells.push([x, y, pts.some(p => Math.abs(p.x - x) < S * .06 && Math.abs(p.y - y) < S * .06)]);
    const cov = cells.filter(k => k[2]).length / cells.length;
    const ok = acc >= 0.75 + 0.05 * d && cov >= 0.65 + 0.05 * d;
    c.clearRect(0, 0, S, S); G.style.opacity = 1;
    c.fillStyle = "rgba(224,160,48,.45)"; cells.filter(k => !k[2]).forEach(k => c.fillRect(k[0] - 3, k[1] - 3, 6, 6));
    for (let i = 1; i < pts.length; i++) if (!pts[i].b) seg(pts[i - 1], pts[i], inShape(pts[i].x, pts[i].y) ? "#3f8f6b" : "#e0a030");
    
    attempts++;
    if (ok) {
      const correctScore = Math.max(0, 100 - (attempts - 1) * 25);
      stageScore = (stageScore + correctScore) / 2;
      correctCount++;
      Store.record("trace", true, correctScore, t.g);
    } else {
      Store.record("trace", false, null, t.g);
    }

    if (ok) win(); else Fx.bad();
    await sleep(1600); if (!el.isConnected) return;
    
    if (Store.s.tokens <= 0) {
      q("#nextStage").style.display = "block";
      q("#nextBtn").textContent = "⚠️ Tokens Depleted - Back to Dashboard";
      toast("Tokens depleted! Return to add more tokens.");
      q("#nextBtn").onclick = () => go("guardian");
      return;
    }
    
    if (correctCount >= 3) {
      q("#nextStage").style.display = "block";
      q("#nextBtn").onclick = () => {
        if (stageNum < TRACE_STAGES.length - 1) {
          Views.trace(el, stageNum + 1);
        } else {
          go("guardian");
        }
      };
      return;
    }
    
    if (skippedCount >= 2 || (correctCount + skippedCount >= 4 && correctCount < 3)) {
      q("#stageFailed").style.display = "block";
      q("#retryBtn").onclick = () => {
        correctCount = 0;
        skippedCount = 0;
        attempts = 0;
        round();
      };
      return;
    }
    
    if (ok) t = t.ok >= 2 ? { g: pick(pool.filter(x => x !== t.g)), ok: 0 } : { g: t.g, ok: t.ok + 1 };
    else { await demo(); if (!el.isConnected) return; if (t.ok >= 2) t.ok = 1; }
    
    q(".cv").parentElement.querySelector("#tq").parentElement.parentElement.innerHTML = `<div style="text-align:center;margin-bottom:12px;padding:12px;background:#e8f4ff;border-radius:12px">
      <div style="font-size:0.9rem;color:#294c7b;font-weight:600">${stage.name}</div>
      <div style="font-size:0.8rem;color:#7186a1;margin-top:4px">${stage.desc}</div>
      <div style="margin-top:8px;font-weight:800;color:#0869c8">Progress: ${correctCount}/4 correct | ⏭️ ${skippedCount}/4 skipped</div>
    </div>`;
    
    start();
  };

  const xy = (e) => { const r = D.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  D.onpointerdown = (e) => { if (busy) return; clearTimeout(timer); on = true; D.setPointerCapture(e.pointerId); const p = { ...xy(e), b: 1 }; pts.push(p); seg(p, p, "#2e5597"); };
  D.onpointermove = (e) => {
    if (!on) return;
    const { x, y } = xy(e), p = pts[pts.length - 1], n0 = pts.length, n = Math.ceil(Math.hypot(x - p.x, y - p.y) / 4);
    for (let i = 1; i <= n; i++) pts.push({ x: p.x + (x - p.x) * i / n, y: p.y + (y - p.y) * i / n });
    for (let i = n0; i < pts.length; i++) seg(pts[i - 1], pts[i], "#2e5597");
  };
  D.onpointerup = D.onpointercancel = () => { if (on) { on = false; timer = setTimeout(grade, 1000); } };
  q("#clr").onclick = () => { if (!busy) { clearTimeout(timer); start(); } };
  
  const skipBtn = q("#skip");
  if (skipBtn) {
    skipBtn.onclick = () => {
      skippedCount++;
      Store.record("trace", false, null, t.g, true);
      if (skippedCount >= 2 || (correctCount + skippedCount >= 4 && correctCount < 3)) {
        q("#stageFailed").style.display = "block";
        q("#retryBtn").onclick = () => {
          correctCount = 0;
          skippedCount = 0;
          attempts = 0;
          round();
        };
      } else if (correctCount + skippedCount < 4) {
        clearTimeout(timer);
        busy = false;
        if (t.ok >= 2) t = { g: pick(pool.filter(x => x !== t.g)), ok: 0 };
        start();
      }
    };
  }
  
  start();
};
