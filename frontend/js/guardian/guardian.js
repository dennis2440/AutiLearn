const SHOP = [["trace", "✏️ Extra tracing shapes", 15], ["voice", "🔊 Calm slow voice", 10], ["analytics", "📊 Advanced tutor analytics", 20], ["rewards", "🏆 Sticker reward tier", 15]];
const MODS = [["match", "🖼️", "Matching"], ["spell", "🔤", "Spelling"], ["trace", "✏️", "Tracing"]];
let lastMod = "match";
Views.guardian = (el) => {
  const s = Store.s;
  const draw = () => {
    el.innerHTML = `${s.tokens < 10 ? `<div class="warn">⚠️ Low AutiTokens balance (${s.tokens}). Top up soon.</div>` : ""}
      <h2>▶ Play mode</h2>
      <p>Pick a module, then hand the device to your child. Only the 🔒 gate can exit.</p>
      <div class="grid" role="radiogroup">${MODS.map(([k, e, l]) => `<button class="card ${lastMod === k ? "ok" : ""}" role="radio" aria-checked="${lastMod === k}" data-m="${k}"><span class="big">${e}</span>${l}</button>`).join("")}</div>
      <div class="row"><button class="card ok" data-play style="width:100%;min-height:60px">Start Play Mode</button></div>
      <div class="row sp"><span>Sound</span><button class="ghost" data-mute>${s.mute ? "🔇 Off" : "🔊 On"}</button></div>
      <h2>🪙 ${s.tokens} AutiTokens</h2>
      <div class="row">${[10, 25, 50].map(n => `<button class="ghost" data-buy="${n}">+${n}</button>`).join("")}</div>
      <small>Demo top-up. Connect a payment provider (e.g. M-Pesa) via the backend for real purchases.</small>
      <h2>Difficulty</h2>
      <div class="row">${["Easy", "Medium", "Hard"].map((t, i) => `<button class="ghost ${s.difficulty === i + 1 ? "ok" : ""}" data-d="${i + 1}">${t}</button>`).join("")}</div>
      <h2>Progress</h2>${bars()}
      <h2>Unlock with tokens</h2>
      ${SHOP.map(([k, l, c]) => `<div class="row sp"><span>${l}</span>${Store.has(k) ? "✅" : `<button class="ghost" data-u="${k}">${c} 🪙</button>`}</div>`).join("")}`;
  };
  el.onclick = (e) => {
    const b = e.target.closest("[data-m],[data-play],[data-mute],[data-buy],[data-d],[data-u]");
    if (!b) return;
    const d = b.dataset;
    if ("play" in d) return go("play", lastMod);
    if (d.m) { lastMod = d.m; return draw(); }
    if ("mute" in d) s.mute = !s.mute;
    else if (d.buy) s.tokens += +d.buy;
    else if (d.d) s.difficulty = +d.d;
    else if (d.u) {
      const it = SHOP.find(x => x[0] === d.u);
      if (s.tokens < it[2]) return toast("Not enough tokens");
      s.tokens -= it[2]; s.unlocked.push(d.u);
    }
    Store.save(); draw();
  };
  draw();
};
