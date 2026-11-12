const SHOP = [["trace", "✏️ Extra tracing shapes", 15], ["voice", "🔊 Calm slow voice", 10], ["analytics", "📊 Advanced tutor analytics", 20], ["rewards", "🏆 Sticker reward tier", 15]];
const MODS = [["match", "🧩", "Match pairs", "Find the picture"], ["spell", "🔤", "Spell and learn", "Build simple words"], ["trace", "✍️", "Trace letters", "Follow the dotted path"]];
let lastMod = "match";
Views.guardian = (el) => {
  const s = Store.s;
  const draw = () => {
    const avgScore = Store.getAverageScore();
    const tokenPercent = (s.tokens / s.maxTokens) * 100;
    el.innerHTML = `<section class="dashboard-intro"><h2>Welcome back! 👋</h2><p>Choose a learning activity, adjust the experience, and celebrate every small achievement.</p></section>
      ${s.tokens < 10 ? `<div class="warn">⭐ Your AutiTokens balance is getting low (${Math.round(s.tokens * 4)} tokens remaining).</div>` : ""}
      ${s.tokens <= 0 ? `<div class="warn" style="background:#ffebee;border-color:#ff6b6b"><strong>⚠️ Tokens Depleted!</strong><br>Your learner has used all available tokens. Add more tokens to continue learning.</div>` : ""}
      <section class="section-card"><div class="section-title">🎮 Choose a play activity</div>
        <p>Choose one activity, then select <b>Start Play Mode</b> to hand the device to your learner.</p>
        <div class="grid">${MODS.map(([k, e, l, sub]) => `<button class="card ${lastMod === k ? "ok" : ""}" data-m="${k}" aria-pressed="${lastMod === k}" ${s.tokens <= 0 ? "disabled" : ""}><span class="big">${e}</span><span>${l}</span><small>${sub}</small></button>`).join("")}</div>
        <div class="row"><button class="card ok" data-play style="width:100%;min-height:60px" ${s.tokens <= 0 ? "disabled" : ""}>▶ Start Play Mode</button></div>
      </section>
      <section class="section-card"><div class="section-title">⚙️ Learning preferences</div>
        <div class="row sp"><span><b>Sound and voice guidance</b><br><small>Use spoken instructions and feedback</small></span><button class="ghost" data-mute aria-pressed="${!s.mute}">${s.mute ? "🔇 Sound off" : "🔊 Sound on"}</button></div>
        <h3>Activity difficulty</h3><p>Start with a level that feels comfortable. You can change it at any time.</p>
        <div class="row">${["Easy", "Medium", "Hard"].map((t, i) => `<button class="ghost ${s.difficulty === i + 1 ? "ok" : ""}" data-d="${i + 1}" aria-pressed="${s.difficulty === i + 1}">${t}</button>`).join("")}</div>
      </section>
      <section class="section-card"><div class="section-title">📈 Learning progress</div>${bars()}</section>
      <section class="section-card"><div class="section-title">🏆 Learner Award</div>
        <div style="text-align:center;padding:16px;background:linear-gradient(120deg,#fff9e6,#fffbf0);border-radius:16px;border:2px solid #ffd56b">
          <div style="font-size:3rem;margin-bottom:8px">🌟</div>
          <div style="font-size:2rem;font-weight:900;color:#ff9d25">${avgScore} pts</div>
          <small style="color:#78540a">Average Points Across All Activities</small>
        </div>
      </section>
      <section class="section-card"><div class="section-title">⭐ AutiTokens and rewards</div>
        <div style="margin:16px 0;padding:14px;background:#f1f8ff;border-radius:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-weight:800">
            <span>${Math.round(s.tokens * 4)} / ${Math.round(s.maxTokens * 4)} tokens</span>
            <span>${Math.round(tokenPercent)}%</span>
          </div>
          <div style="width:100%;height:14px;background:#e4f1ff;border-radius:8px;overflow:hidden">
            <div style="width:${tokenPercent}%;height:100%;background:linear-gradient(90deg,#37c96f,#159d55);transition:width 0.3s ease"></div>
          </div>
        </div>
        <div class="row">${[10, 25, 50, 100, 200].map(n => `<button class="ghost" data-buy="${n}">＋${n} demo tokens</button>`).join("")}</div><small>Demo balance only. Connect a payment provider through the backend for real purchases.</small></section>
      <section class="section-card"><div class="section-title">🎁 Optional learning extras</div>${SHOP.map(([k, l, c]) => `<div class="row sp"><span>${l}</span>${Store.has(k) ? `<b style="color:#229b59">✓ Unlocked</b>` : `<button class="ghost" data-u="${k}">${c} ⭐</button>`}</div>`).join("")}</section>`;
  };
  el.onclick = (e) => {
    const b = e.target.closest("[data-m],[data-play],[data-mute],[data-buy],[data-d],[data-u]");
    if (!b || b.disabled) return;
    const d = b.dataset;
    if ("play" in d) {
      if (s.tokens <= 0) return toast("⚠️ Tokens depleted. Add more tokens to continue.");
      return go("play", lastMod);
    }
    if (d.m) { lastMod = d.m; return draw(); }
    if ("mute" in d) { s.mute = !s.mute; Store.save(); return go("guardian"); }
    else if (d.buy) { 
      s.tokens += +d.buy / 4;  // Convert demo tokens to internal token units (4 tries = 1 token)
      if (s.tokens > s.maxTokens) s.maxTokens = s.tokens;
      Store.save();
      go("guardian");  // Refresh to update header without full redraw
      return;
    }
    else if (d.d) { s.difficulty = +d.d; Store.save(); return draw(); }
    else if (d.u) {
      const it = SHOP.find(x => x[0] === d.u);
      if (s.tokens < it[2]) return toast("You need more tokens for this extra.");
      s.tokens -= it[2]; s.unlocked.push(d.u);
      Store.save(); return draw();
    }
    Store.save(); draw();
  };
  draw();
};
