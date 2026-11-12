// Router + shared helpers. Flow: login -> guardian | tutor. Guardian -> play (sandbox) -> gate -> guardian.
const $ = (s, r = document) => r.querySelector(s);
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const app = $("#app"), title = $("#title");

const toast = (m) => {
  const t = $("#toast"); t.textContent = m; t.className = "show";
  clearTimeout(toast.id); toast.id = setTimeout(() => (t.className = ""), 1800);
};
const win = (el) => { Fx.good(el); Tts.speak(pick(["Great job!", "Well done!", "Super!", "You did it!"])); }; // visual first, voice optional
const bars = () => ["match", "spell", "trace"].map(m => {
  const [a, b] = Store.s.stats[m], p = b ? Math.round(100 * a / b) : 0;
  return `<div class="bar"><i style="width:${p}%"></i><span>${m}</span><b>${p}%</b></div>`;
}).join("");

const TITLE = { login: "AutiLearn", guardian: "Parent / Guardian", tutor: "Teacher Portal", play: "" };
const ALLOW = { guardian: "guardian", play: "guardian", tutor: "tutor" }; // view -> required role

function go(v, arg) {
  try { speechSynthesis.cancel(); } catch {}
  if (v !== "play") { document.body.classList.remove("play"); window.onpopstate = null; }
  if (v !== "login") {
    const ses = Auth.session();
    if (!ses) return go("login");
    if (ALLOW[v] !== ses.role) return go(ses.role);
  }
  app.onclick = null; app.innerHTML = "";
  title.textContent = TITLE[v];
  const stars = $("#stars"); 
  if (stars) {
    const avgScore = Store.getAverageScore();
    const tokenPercent = (Store.s.tokens / Store.s.maxTokens) * 100;
    const displayTokens = Math.round(Store.s.tokens * 4);  // Convert to display tokens
    stars.innerHTML = `<div style="display:flex;align-items:center;gap:8px;height:100%">
      <span>⭐ ${displayTokens}</span>
      <div style="width:60px;height:6px;background:#ffffff;border-radius:3px;overflow:hidden">
        <div style="width:${tokenPercent}%;height:100%;background:#ffca3a;transition:width 0.3s ease"></div>
      </div>
      <span title="Average Points">🏆 ${avgScore}</span>
    </div>`;
  }
  $("#bar").hidden = v === "login" || v === "play";
  Views[v](app, arg);
}
$("#out").onclick = () => { Auth.logout(); go("login"); };
Store.save();
const ses = Auth.session();
go(ses ? ses.role : "login");
