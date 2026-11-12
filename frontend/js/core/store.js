// On-device state (localStorage) with backend sync.
const Views = {};
const Store = (() => {
  const K = "autilearn_state";
  const def = { difficulty: 1, tokens: 20.0, maxTokens: 100.0, stars: 0, stats: { match: [0, 0], spell: [0, 0], trace: [0, 0] }, scores: { match: [], spell: [], trace: [] }, log: [], notes: [], unlocked: [], mute: false, voice: "default" };
  let s;
  try { s = { ...def, ...JSON.parse(localStorage.getItem(K)) }; } catch { s = { ...def }; }
  
  const save = () => {
    try { localStorage.setItem(K, JSON.stringify(s)); } catch {}
    const stars = document.getElementById("stars");
    if (stars) {
      const avgScore = getAverageScore();
      const tokenPercent = (s.tokens / s.maxTokens) * 100;
      const displayTokens = Math.round(s.tokens * 4);
      stars.innerHTML = `<div style="display:flex;align-items:center;gap:8px;height:100%">
        <span>⭐ ${displayTokens}</span>
        <div style="width:60px;height:6px;background:#ffffff;border-radius:3px;overflow:hidden">
          <div style="width:${tokenPercent}%;height:100%;background:#ffca3a;transition:width 0.3s ease"></div>
        </div>
        <span title="Average Points">🏆 ${avgScore}</span>
      </div>`;
    }
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
  
  const record = async (mod, ok, sessionScore = null) => {
    const st = s.stats[mod];
    st[1]++;
    deductTokens();
    
    if (ok) {
      st[0]++;
      if (sessionScore !== null) {
        if (!s.scores[mod]) s.scores[mod] = [];
        s.scores[mod].push(sessionScore);
      }
      if ([5, 10, 25].includes(st[0])) s.notes.unshift({ t: Date.now(), msg: `${st[0]} correct in ${mod}` });
    }
    
    s.log.unshift({ m: mod, ok, t: Date.now() });
    s.log.length = Math.min(s.log.length, 200);
    save();
    
    // Sync to backend API
    if (window.AUTILEARN_CONTEXT?.child_id) {
      try {
        const activityMap = { match: "matching", spell: "spelling", trace: "tracing" };
        const duration = window.AUTILEARN_CONTEXT.duration || 30;
        
        await Api.post("/api/history", {
          child_id: window.AUTILEARN_CONTEXT.child_id,
          activity: activityMap[mod] || mod,
          score: sessionScore || 0,
          total_questions: 4,
          duration_seconds: Math.round(duration)
        });
        console.log("Activity recorded to backend:", mod, ok, sessionScore);
      } catch (e) {
        console.error("Failed to sync activity to backend:", e.message);
        // Don't throw - let local state work even if API fails
      }
    }
  };
  
  return { s, save, record, has: (k) => s.unlocked.includes(k), getAverageScore, deductTokens };
})();
