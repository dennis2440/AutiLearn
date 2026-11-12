const WORDS = [["🐱","CAT"],["🐶","DOG"],["☀️","SUN"],["🚌","BUS"],["🎩","HAT"],["🐟","FISH"]];

const SPELL_STAGES = [
  { name: "🔤 Stage 1: Simple 3-Letter Words", desc: "Spell easy three-letter words", words: [["🐱","CAT"],["🐶","DOG"],["☀️","SUN"],["🎩","HAT"]] },
  { name: "📝 Stage 2: 4-Letter Words", desc: "Spell four-letter words", words: [["🚌","BUS"],["🐟","FISH"],["🎁","GIFT"],["🏠","HOME"]] },
  { name: "🌟 Stage 3: Animal Names", desc: "Spell different animals", words: [["🦁","LION"],["🐘","ELEPHANT"],["🦒","GIRAFFE"],["🐢","TURTLE"]] },
  { name: "🏆 Stage 4: Mixed Challenge", desc: "Spell all kinds of words", words: [["🐱","CAT"],["🐶","DOG"],["☀️","SUN"],["🚌","BUS"],["🎩","HAT"],["🐟","FISH"]] }
];

Views.spell = (el, stageNum = 0) => {
  const stage = SPELL_STAGES[stageNum];
  let correctCount = 0, attempts = 0;
  
  const round = () => {
    const [pic, w] = pick(stage.words);
    let i = 0, miss = false, lock = false;
    const extra = shuffle("ABCDEGHIKLMNOPRTU".split("").filter(c => !w.includes(c))).slice(0, (Store.s.difficulty - 1) * 2);
    el.innerHTML = `<div style="text-align:center;margin-bottom:12px;padding:12px;background:#e8f4ff;border-radius:12px">
      <div style="font-size:0.9rem;color:#294c7b;font-weight:600">${stage.name}</div>
      <div style="font-size:0.8rem;color:#7186a1;margin-top:4px">${stage.desc}</div>
      <div style="margin-top:8px;font-weight:800;color:#0869c8">Progress: ${correctCount}/4 correct</div>
    </div>
    <div class="big pic">${pic}</div>
      <div class="row"><button class="ghost" id="say">🔊 Hear word</button></div>
      <div class="slots" aria-live="polite">${[...w].map(() => "<span></span>").join("")}</div>
      <div class="grid c4">${shuffle([...w, ...extra]).map(c => `<button class="card tile" data-c="${c}">${c}</button>`).join("")}</div>
      <div id="nextStage" style="display:none;text-align:center;margin-top:20px">
        <p style="font-size:1.2rem;margin:10px 0">🎉 Stage Complete!</p>
        ${stageNum < SPELL_STAGES.length - 1 ? 
          `<button class="card ok" id="nextBtn" style="width:100%;min-height:50px">Next Stage →</button>` :
          `<button class="card ok" id="nextBtn" style="width:100%;min-height:50px">🏆 Activity Complete!</button>`
        }
      </div>`;
    const box = el.querySelector(".slots"), slots = box.children;
    const mark = () => [...slots].forEach((s, k) => s.classList.toggle("next", k === i));
    mark();
    Tts.speak("Spell " + w.toLowerCase());
    attempts++;
    
    const nextBtn = el.querySelector("#nextBtn");
    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (stageNum < SPELL_STAGES.length - 1) {
          Views.spell(el, stageNum + 1);
        } else {
          go("guardian");
        }
      };
    }
    
    el.onclick = (e) => {
      if (e.target.id === "say") return Tts.speak(w.toLowerCase());
      if (e.target.id === "nextBtn") return; // Let the button handler deal with it
      const b = e.target.closest("[data-c]");
      if (!b || lock || b.classList.contains("soft")) return;
      Tts.speak(b.dataset.c);
      if (b.dataset.c === w[i]) {
        slots[i].textContent = w[i]; b.classList.add("soft"); i++; mark();
        if (i === w.length) {
          lock = true; box.classList.add("done");
          const correctScore = Math.max(0, 100 - (attempts - 1) * 25);
          correctCount++;
          Store.record("spell", !miss, correctScore);
          win();
          if (Store.s.tokens <= 0) {
            setTimeout(() => {
              if (el.isConnected) {
                el.querySelector("#nextStage").style.display = "block";
                el.querySelector("#nextBtn").textContent = "⚠️ Tokens Depleted - Back to Dashboard";
                toast("Tokens depleted! Return to add more tokens.");
              }
            }, 2200);
          } else if (correctCount >= 4) {
            setTimeout(() => {
              if (el.isConnected) {
                el.querySelector("#nextStage").style.display = "block";
              }
            }, 2200);
          } else {
            setTimeout(() => {
              if (el.isConnected) round();
            }, 2200);
          }
        }
      } else {
        miss = true; lock = true; slots[i].textContent = b.dataset.c; slots[i].classList.add("bad"); Fx.bad(b);
        setTimeout(() => { slots[i].textContent = ""; slots[i].classList.remove("bad"); lock = false; }, 700);
      }
    };
  };
  round();
};
