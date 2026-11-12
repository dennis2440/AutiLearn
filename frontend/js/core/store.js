// On-device state (localStorage). Swap internals for Api calls / Capacitor SQLite later; keep the interface.
const Views = {};
const Store = (() => {
  const K = "autilearn_state";
  const def = { difficulty: 1, tokens: 20.0, maxTokens: 100.0, stars: 0, stats: { match: [0, 0], spell: [0, 0], trace: [0, 0] }, scores: { match: [], spell: [], trace: [] }, log: [], notes: [], unlocked: [], mute: false, voice: "default" };
  let s;
  try { s = { ...def, ...JSON.parse(localStorage.getItem(K)) }; } catch { s = { ...def }; }
  const save = () => {
    try { localStorage.setItem(K, JSON.stringify(s)); } catch {}
    document.getElementById("stars").textContent = "⭐ " + s.tokens;
  };
  const getAverageScore = () => {
    const allScores = [...(s.scores.match || []), ...(s.scores.spell || []), ...(s.scores.trace || [])];
    return allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
  };
  const deductTokens = (attempts = 1) => {
    s.tokens = Math.max(0.0, s.tokens - 0.25);
    save();
    return s.tokens <= 0;
  };
  const record = (mod, ok, sessionScore = null, task = null, skipped = false) => {
    const st = s.stats[mod];
    st[1]++;
    deductTokens();  // Deduct 0.25 tokens for every attempt (correct or incorrect)
    if (ok) {
      st[0]++;
      if (sessionScore !== null) {
        if (!s.scores[mod]) s.scores[mod] = [];
        s.scores[mod].push(sessionScore);
      }
      if ([5, 10, 25].includes(st[0])) s.notes.unshift({ t: Date.now(), msg: `${st[0]} correct in ${mod}` });
    }
    s.log.unshift({ m: mod, ok, t: Date.now(), task, skipped });
    s.log.length = Math.min(s.log.length, 200);
    save();
  };
  return { s, save, record, has: (k) => s.unlocked.includes(k), getAverageScore, deductTokens };
})();
