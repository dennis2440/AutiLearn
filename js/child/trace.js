Views.trace = (el) => {
  const g = pick(("ABCDEFHILOTUV123456789" + (Store.has("trace") ? "JKMNPQRSWXYZ" : "")).split(""));
  const S = Math.min(el.clientWidth - 32, 380);
  el.innerHTML = `<p class="q">Trace: <b>${g}</b></p>
    <div class="cv" style="width:${S}px;height:${S}px"><canvas id="g" width="${S}" height="${S}"></canvas><canvas id="d" width="${S}" height="${S}"></canvas></div>
    <div class="row sp"><button class="ghost" id="clr">Clear</button><button class="card ok" id="done" style="min-height:56px">Done ✔</button></div>`;
  const G = el.querySelector("#g"), D = el.querySelector("#d"), gc = G.getContext("2d"), c = D.getContext("2d");
  gc.font = `bold ${S * 0.8}px Arial`; gc.textAlign = "center"; gc.textBaseline = "middle"; gc.fillStyle = "#cfd8e8";
  gc.fillText(g, S / 2, S * 0.53);
  c.lineWidth = S / 9; c.lineCap = c.lineJoin = "round"; c.strokeStyle = "#2e5597";
  let on = false;
  const pt = (e, start) => {
    const r = D.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (start) { c.beginPath(); c.moveTo(x, y); }
    c.lineTo(x + 0.1, y); c.stroke();
  };
  D.onpointerdown = (e) => { on = true; D.setPointerCapture(e.pointerId); pt(e, true); };
  D.onpointermove = (e) => on && pt(e);
  D.onpointerup = D.onpointercancel = () => (on = false);
  el.querySelector("#clr").onclick = () => c.clearRect(0, 0, S, S);
  el.querySelector("#done").onclick = () => {
    const gd = gc.getImageData(0, 0, S, S).data, dd = c.getImageData(0, 0, S, S).data;
    let total = 0, hit = 0, drawn = 0;
    for (let i = 3; i < gd.length; i += 4) {
      if (dd[i] > 0) drawn++;
      if (gd[i] > 128) { total++; if (dd[i] > 0) hit++; }
    }
    const ok = hit / total >= 0.4 + 0.1 * Store.s.difficulty && drawn <= total * 4; // covers the shape, not a scribble
    Store.record("trace", ok);
    if (ok) { win(); setTimeout(() => Views.trace(el), 1300); }
    else { Tts.speak("Try again"); toast("Follow the grey shape"); c.clearRect(0, 0, S, S); }
  };
};
