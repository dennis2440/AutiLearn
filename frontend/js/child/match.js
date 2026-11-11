const ITEMS = [["🍎","apple"],["🐶","dog"],["🚗","car"],["🍌","banana"],["😊","happy"],["😢","sad"],["😠","angry"],["🪥","brush your teeth"],["🍽️","eat"],["🛏️","sleep"],["🐱","cat"],["⚽","ball"]];
Views.match = (el) => {
  const n = Store.s.difficulty + 1; // 2-4 choices
  const round = () => {
    const opts = shuffle(ITEMS).slice(0, n), ans = pick(opts);
    el.innerHTML = `<p class="q">Find: <b>${ans[1]}</b></p>
      <div class="row"><button class="ghost" id="say">🔊 Hear again</button></div>
      <div class="grid">${opts.map(o => `<button class="card" data-k="${o[1]}"><span class="big">${o[0]}</span></button>`).join("")}</div>`;
    Tts.speak("Find " + ans[1]);
    el.onclick = (e) => {
      if (e.target.id === "say") return Tts.speak("Find " + ans[1]);
      const b = e.target.closest("[data-k]");
      if (!b || b.classList.contains("soft")) return;
      if (b.dataset.k === ans[1]) {
        el.onclick = null; Store.record("match", true); win(b);
        setTimeout(() => el.isConnected && round(), 1800);
      } else {
        Store.record("match", false); Fx.bad(b);
        setTimeout(() => b.classList.add("soft"), 900); // gently fades the wrong choice
      }
    };
  };
  round();
};
