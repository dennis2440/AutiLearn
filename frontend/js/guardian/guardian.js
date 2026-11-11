const SHOP = [["trace", "✏️ Extra tracing letters", 15], ["voice", "🔊 Calm slow voice", 10], ["analytics", "📊 Advanced tutor analytics", 20], ["rewards", "🏆 Sticker reward tier", 15]];
Views.guardian = (el) => {
  const s = Store.s;
  const draw = () => {
    el.innerHTML = `${s.tokens < 10 ? `<div class="warn">⚠️ Low AutiTokens balance (${s.tokens}). Top up soon.</div>` : ""}
      <h2>🪙 ${s.tokens} AutiTokens</h2>
      <div class="row">${[10, 25, 50].map(n => `<button class="ghost" data-buy="${n}">+${n}</button>`).join("")}</div>
      <small>Demo top-up. Connect a payment provider (e.g. M-Pesa) via the backend for real purchases.</small>
      <h2>Difficulty</h2>
      <div class="row">${["Easy", "Medium", "Hard"].map((t, i) => `<button class="${s.difficulty === i + 1 ? "ghost ok" : "ghost"}" data-d="${i + 1}">${t}</button>`).join("")}</div>
      <h2>Progress</h2>${bars()}
      <h2>Unlock with tokens</h2>
      ${SHOP.map(([k, l, c]) => `<div class="row sp"><span>${l}</span>${Store.has(k) ? "✅" : `<button class="ghost" data-u="${k}">${c} 🪙</button>`}</div>`).join("")}`;
  };
  el.onclick = (e) => {
    const d = e.target.dataset;
    if (d.buy) s.tokens += +d.buy;
    else if (d.d) s.difficulty = +d.d;
    else if (d.u) {
      const it = SHOP.find(x => x[0] === d.u);
      if (s.tokens < it[2]) return toast("Not enough tokens");
      s.tokens -= it[2]; s.unlocked.push(d.u);
    } else return;
    Store.save(); draw();
  };
  draw();
};
