const WORDS = [["🐱","CAT"],["🐶","DOG"],["☀️","SUN"],["🚌","BUS"],["🎩","HAT"],["🐟","FISH"]];
Views.spell = (el) => {
  const [pic, w] = pick(WORDS);
  let i = 0, miss = false;
  const extra = shuffle("ABCDEGHIKLMNOPRTU".split("").filter(c => !w.includes(c))).slice(0, (Store.s.difficulty - 1) * 2);
  el.innerHTML = `<div class="big pic">${pic}</div>
    <div class="row"><button class="ghost" id="say">🔊 Hear word</button></div>
    <div class="slots">${[...w].map(() => "<span></span>").join("")}</div>
    <div class="grid c4">${shuffle([...w, ...extra]).map(c => `<button class="card tile" data-c="${c}">${c}</button>`).join("")}</div>`;
  Tts.speak("Spell " + w.toLowerCase());
  const slots = el.querySelectorAll(".slots span");
  el.onclick = (e) => {
    if (e.target.id === "say") return Tts.speak(w.toLowerCase());
    const b = e.target.closest("[data-c]");
    if (!b) return;
    Tts.speak(b.dataset.c);
    if (b.dataset.c === w[i]) {
      slots[i++].textContent = b.dataset.c; b.classList.add("soft");
      if (i === w.length) { Store.record("spell", !miss); win(); setTimeout(() => Views.spell(el), 2000); }
    } else { miss = true; b.classList.add("soft"); }
  };
};
