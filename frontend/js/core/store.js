// On-device state (localStorage). Swap internals for Api calls / Capacitor SQLite later; keep the interface.
const Views = {};
const Store = (() => {
  const K = "autilearn_state";
  const def = { difficulty: 1, tokens: 20, stars: 0, stats: { match: [0, 0], spell: [0, 0], trace: [0, 0] }, log: [], notes: [], unlocked: [] };
  let s;
  try { s = { ...def, ...JSON.parse(localStorage.getItem(K)) }; } catch { s = { ...def }; }
  const save = () => {
    try { localStorage.setItem(K, JSON.stringify(s)); } catch {}
    document.getElementById("stars").textContent = "⭐ " + s.stars;
  };
  const record = (mod, ok) => {
    const st = s.stats[mod];
    st[1]++;
    if (ok) {
      st[0]++; s.stars++;
      if ([5, 10, 25].includes(st[0])) s.notes.unshift({ t: Date.now(), msg: `${st[0]} correct in ${mod}` });
    }
    s.log.unshift({ m: mod, ok, t: Date.now() });
    s.log.length = Math.min(s.log.length, 200);
    save();
  };
  return { s, save, record, has: (k) => s.unlocked.includes(k) };
})();
