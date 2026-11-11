// Sandbox: no header, no navigation. Only exit is the Guardian Gate (faded lock, top-right).
Views.play = (el, mod) => {
  let playing = true, sum = 0;
  document.body.classList.add("play");
  el.innerHTML = `<div id="stage"></div><button id="lock" aria-label="Guardian Gate">🔒</button>
    <div id="gate" class="modal" role="dialog" aria-modal="true" aria-labelledby="gt" hidden><form>
      <h2 id="gt">Guardian Gate</h2><p>What is <b id="gq"></b> ?</p>
      <input id="ga" inputmode="numeric" autocomplete="off" aria-label="Your answer">
      <div class="row"><button type="button" class="ghost" id="gx">Cancel</button><button class="card ok" style="min-height:48px">Unlock</button></div></form></div>`;
  const gate = $("#gate", el), ga = $("#ga", el);
  const open = () => {
    const a = 2 + Math.floor(Math.random() * 8), b = 2 + Math.floor(Math.random() * 8);
    sum = a + b; $("#gq", el).textContent = `${a} + ${b}`; ga.value = ""; gate.hidden = false; ga.focus();
  };
  const close = () => (gate.hidden = true);
  const exit = () => { playing = false; window.onpopstate = null; document.body.classList.remove("play"); Native.exitPlay(); go("guardian"); };
  $("#lock", el).onclick = open;
  $("#gx", el).onclick = close;
  $("form", el).onsubmit = (e) => { e.preventDefault(); +ga.value === sum ? exit() : close(); }; // wrong -> modal closes, child stays
  history.pushState({ play: 1 }, "");
  window.onpopstate = () => { if (playing) { history.pushState({ play: 1 }, ""); open(); } }; // browser back = gate
  Native.enterPlay(open);
  Views[mod]($("#stage", el));
};
