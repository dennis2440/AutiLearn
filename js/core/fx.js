// Shared, sensory-friendly feedback. Visual-first; never a buzzer, never red, never flashing.
const Fx = {
  say(t) { const m = $("#msg"); m.textContent = t; m.className = "show"; clearTimeout(Fx.mt); Fx.mt = setTimeout(() => (m.className = ""), 1600); },
  good(el) {
    if (el) el.classList.add("glow");
    Fx.say("🌟 Great job!");
    if (!matchMedia("(prefers-reduced-motion:reduce)").matches) Fx.confetti();
  },
  bad(el) {
    if (el) { el.classList.add("nope"); setTimeout(() => el.classList.remove("nope"), 900); }
    Fx.say("Let's try again 🙂");
  },
  confetti() {
    const c = $("#fx"), x = c.getContext("2d");
    c.width = innerWidth; c.height = innerHeight;
    const cols = ["#9db9e6", "#f6d28b", "#a8d8c0", "#f4b6c8", "#c9b8f0"];
    const ps = Array.from({ length: 50 }, () => ({ x: Math.random() * c.width, y: -Math.random() * c.height * 0.3, v: 1.5 + Math.random() * 2, r: 4 + Math.random() * 5, c: pick(cols), s: Math.random() * 6 }));
    let f = 0;
    (function loop() {
      x.clearRect(0, 0, c.width, c.height);
      ps.forEach(p => { p.y += p.v; p.x += Math.sin((f + p.s * 20) / 30) * 0.8; x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill(); });
      if (++f < 110) requestAnimationFrame(loop); else x.clearRect(0, 0, c.width, c.height);
    })();
  },
};
