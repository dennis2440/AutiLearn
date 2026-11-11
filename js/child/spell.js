const WORDS = [["🐱","CAT"],["🐶","DOG"],["☀️","SUN"],["🚌","BUS"],["🎩","HAT"],["🐟","FISH"]];
Views.spell = (el) => {
  const [pic, w] = pick(WORDS);
  let i = 0, miss = false, lock = false;
  const extra = shuffle("ABCDEGHIKLMNOPRTU".split("").filter(c => !w.includes(c))).slice(0, (Store.s.difficulty - 1) * 2);
  el.innerHTML = `<div class="big pic">${pic}</div>
    <div class="row"><button class="ghost" id="say">🔊 Hear word</button></div>
    <div class="slots" aria-live="polite">${[...w].map(() => "<span></span>").join("")}</div>
    <div class="grid c4">${shuffle([...w, ...extra]).map(c => `<button class="card tile" data-c="${c}">${c}</button>`).join("")}</div>`;
  const box = el.querySelector(".slots"), slots = box.children;
  const mark = () => [...slots].forEach((s, k) => s.classList.toggle("next", k === i)); // custom "next letter" highlight
  mark();
  Tts.speak("Spell " + w.toLowerCase());
  el.onclick = (e) => {
    if (e.target.id === "say") return Tts.speak(w.toLowerCase());
    const b = e.target.closest("[data-c]");
    if (!b || lock || b.classList.contains("soft")) return;
    Tts.speak(b.dataset.c);
    if (b.dataset.c === w[i]) {
      slots[i].textContent = w[i]; b.classList.add("soft"); i++; mark();
      if (i === w.length) {
        lock = true; box.classList.add("done"); Store.record("spell", !miss); win();
        setTimeout(() => el.isConnected && Views.spell(el), 2200);
      }
    } else { // wrong: show it briefly in the slot, then auto-clear so they can retry at once
      miss = true; lock = true; slots[i].textContent = b.dataset.c; slots[i].classList.add("bad"); Fx.bad(b);
      setTimeout(() => { slots[i].textContent = ""; slots[i].classList.remove("bad"); lock = false; }, 700);
    }
  };
};
