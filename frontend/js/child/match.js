const ITEMS = [["🍎","apple"],["🐶","dog"],["🚗","car"],["🍌","banana"],["😊","happy"],["😢","sad"],["😠","angry"],["🪥","brush your teeth"],["🍽️","eat"],["🛏️","sleep"],["🐱","cat"],["⚽","ball"]];

const MATCH_STAGES = [
  { name: "🎯 Stage 1: Basic Matching", desc: "Match simple everyday objects", items: [["🍎","apple"],["🐶","dog"],["🚗","car"],["🍌","banana"]] },
  { name: "😊 Stage 2: Emotions", desc: "Match faces to feelings", items: [["😊","happy"],["😢","sad"],["😠","angry"],["😴","sleepy"]] },
  { name: "🏠 Stage 3: Daily Activities", desc: "Match actions to activities", items: [["🪥","brush your teeth"],["🍽️","eat"],["🛏️","sleep"],["🚿","take a shower"]] },
  { name: "🌟 Stage 4: Mixed Challenge", desc: "Match all items together", items: ITEMS }
];

Views.match = (el, stageNum = 0) => {
  const n = Store.s.difficulty + 1; // 2-4 choices
  const stage = MATCH_STAGES[stageNum];
  let correctCount = 0, attempts = 0;
  
  const round = () => {
    const opts = shuffle(stage.items).slice(0, n), ans = pick(opts);
    el.innerHTML = `<div style="text-align:center;margin-bottom:12px;padding:12px;background:#e8f4ff;border-radius:12px">
      <div style="font-size:0.9rem;color:#294c7b;font-weight:600">${stage.name}</div>
      <div style="font-size:0.8rem;color:#7186a1;margin-top:4px">${stage.desc}</div>
      <div style="margin-top:8px;font-weight:800;color:#0869c8">Progress: ${correctCount}/4 correct</div>
    </div>
    <p class="q">Find: <b>${ans[1]}</b></p>
      <div class="row"><button class="ghost" id="say">🔊 Hear again</button></div>
      <div class="grid">${opts.map(o => `<button class="card" data-k="${o[1]}"><span class="big">${o[0]}</span></button>`).join("")}</div>
      <div id="nextStage" style="display:none;text-align:center;margin-top:20px">
        <p style="font-size:1.2rem;margin:10px 0">🎉 Stage Complete!</p>
        ${stageNum < MATCH_STAGES.length - 1 ? 
          `<button class="card ok" id="nextBtn" style="width:100%;min-height:50px">Next Stage →</button>` :
          `<button class="card ok" id="nextBtn" style="width:100%;min-height:50px">🏆 Activity Complete!</button>`
        }
      </div>`;
    Tts.speak("Find " + ans[1]);
    attempts++;
    
    const nextBtn = el.querySelector("#nextBtn");
    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (stageNum < MATCH_STAGES.length - 1) {
          Views.match(el, stageNum + 1);
        } else {
          go("guardian");
        }
      };
    }
    
    el.onclick = (e) => {
      if (e.target.id === "say") return Tts.speak("Find " + ans[1]);
      if (e.target.id === "nextBtn") return; // Let the button handler deal with it
      const b = e.target.closest("[data-k]");
      if (!b || b.classList.contains("soft")) return;
      if (b.dataset.k === ans[1]) {
        el.onclick = null;
        correctCount++;
        const correctScore = Math.max(0, 100 - (attempts - 1) * 25);
        Store.record("match", true, correctScore);
        if (Store.s.tokens <= 0) {
          el.querySelector("#nextStage").style.display = "block";
          el.querySelector("#nextBtn").textContent = "⚠️ Tokens Depleted - Back to Dashboard";
          el.querySelector("#nextBtn").onclick = () => go("guardian");
          toast("Tokens depleted! Return to add more tokens.");
          return;
        }
        win(b);
        
        if (correctCount >= 4) {
          setTimeout(() => {
            if (el.isConnected) {
              el.querySelector("#nextStage").style.display = "block";
            }
          }, 1800);
        } else {
          setTimeout(() => {
            if (el.isConnected) round();
          }, 1800);
        }
      } else {
        Store.record("match", false); Fx.bad(b);
        setTimeout(() => b.classList.add("soft"), 900);
      }
    };
  };
  round();
};
