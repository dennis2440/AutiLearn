// Router + shared helpers. Views register themselves on `Views` (see js/<role>/*.js).
const $ = (s, r = document) => r.querySelector(s);
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const app = $("#app"), back = $("#back"), title = $("#title");

const toast = (m) => {
  const t = $("#toast"); t.textContent = m; t.className = "show";
  clearTimeout(toast.id); toast.id = setTimeout(() => (t.className = ""), 1800);
};
const win = () => {
  Tts.speak(pick(["Great job!", "Well done!", "Super!", "You did it!"]));
  toast(Store.has("rewards") ? pick(["🦄", "🚀", "🌈", "🐳"]) + " Sticker!" : "⭐ +1");
};
const bars = () => ["match", "spell", "trace"].map(m => {
  const [a, b] = Store.s.stats[m], p = b ? Math.round(100 * a / b) : 0;
  return `<div class="bar"><i style="width:${p}%"></i><span>${m}</span><b>${p}%</b></div>`;
}).join("");

const PARENT = { child: "home", guardian: "home", tutor: "home", match: "child", spell: "child", trace: "child" };
const TITLE = { home: "AutiLearn", child: "Let's learn!", match: "Match", spell: "Spell", trace: "Trace", guardian: "Guardian", tutor: "Tutor" };
const menu = (el, items) => {
  el.innerHTML = `<div class="grid">${items.map(([e, l, v]) => `<button class="card" data-v="${v}"><span class="big">${e}</span>${l}</button>`).join("")}</div>`;
  el.onclick = (ev) => { const b = ev.target.closest("[data-v]"); if (b) go(b.dataset.v); };
};
Views.home = (el) => menu(el, [["🧒", "Child", "child"], ["👨‍👩‍👧", "Guardian", "guardian"], ["📋", "Tutor", "tutor"]]);
Views.child = (el) => menu(el, [["🖼️", "Match", "match"], ["🔤", "Spell", "spell"], ["✏️", "Trace", "trace"]]);

function go(v) {
  try { speechSynthesis.cancel(); } catch {}
  app.onclick = null; app.innerHTML = "";
  title.textContent = TITLE[v]; back.hidden = !PARENT[v]; back.onclick = () => go(PARENT[v]);
  Views[v](app);
}
Store.save();
go("home");
