const SHOP = [["trace", "✏️ Extra tracing shapes", 15], ["voice", "🔊 Calm slow voice", 10], ["analytics", "📊 Advanced tutor analytics", 20], ["rewards", "🏆 Sticker reward tier", 15]];
const MODS = [["match", "🧩", "Match pairs", "Find the picture"], ["spell", "🔤", "Spell and learn", "Build simple words"], ["trace", "✍️", "Trace letters", "Follow the dotted path"]];
let lastMod = "match";
let childrenList = [];

Views.guardian = async (el) => {
  const s = Store.s;
  let children = [];
  let summary = { children_count: 0, activities_completed: 0, average_score: 0 };
  
  // Fetch children from backend
  try {
    const response = await Api.get("/api/parent/children");
    children = response.children || [];
    childrenList = children;
    console.log("Fetched children from API:", children);
  } catch (e) {
    console.error("Failed to fetch children:", e.message);
    toast("Could not load children from backend. Using local data.");
  }
  
  // Fetch dashboard summary from backend
  try {
    const response = await Api.get("/api/parent/summary");
    summary = response.summary || summary;
    console.log("Fetched summary from API:", summary);
  } catch (e) {
    console.error("Failed to fetch summary:", e.message);
  }
  
  // Set first child as active if not already set
  if (!window.AUTILEARN_CONTEXT) {
    window.AUTILEARN_CONTEXT = { child_id: null, activity_start_time: null, duration: 0 };
  }
  if (!window.AUTILEARN_CONTEXT.child_id && children.length > 0) {
    window.AUTILEARN_CONTEXT.child_id = children[0].id;
  }
  
  const draw = () => {
    const avgScore = Math.round(summary.average_score || 0);
    const tokenPercent = (s.tokens / s.maxTokens) * 100;
    const displayTokens = Math.round(s.tokens * 4);
    
    el.innerHTML = `<section class="dashboard-intro"><h2>Welcome back! 👋</h2><p>Choose a learning activity, adjust the experience, and celebrate every small achievement.</p></section>
      ${s.tokens < 10 ? `<div class="warn">⭐ Your AutiTokens balance is getting low (${displayTokens} tokens remaining).</div>` : ""}
      ${s.tokens <= 0 ? `<div class="warn" style="background:#ffebee;border-color:#ff6b6b"><strong>⚠️ Tokens Depleted!</strong><br>Your learner has used all available tokens. Add more tokens to continue learning.</div>` : ""}
      
      <section class="section-card">
        <div class="section-title">👶 Select Learner</div>
        ${children.length === 0 ? `
          <p>No learner profiles yet. Create one to get started.</p>
          <form id="createChildForm" style="margin-top:16px">
            <label for="childName">Learner's name <input id="childName" placeholder="e.g., Emma" required></label>
            <label for="childAge">Age <input id="childAge" type="number" min="2" max="18" required></label>
            <label for="childLevel">Learning level 
              <select id="childLevel" required>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <button type="submit" class="card ok" style="width:100%;min-height:48px">+ Create Profile</button>
          </form>
        ` : `
          <select id="childSelect" style="width:100%;padding:8px;margin-bottom:16px;border-radius:8px;border:1px solid #ccc;font-size:1rem">
            ${children.map(c => `<option value="${c.id}" ${c.id === window.AUTILEARN_CONTEXT.child_id ? 'selected' : ''}>${c.full_name} (age ${c.age})</option>`).join('')}
          </select>
        `}
      </section>
      
      <section class="section-card"><div class="section-title">🎮 Choose a play activity</div>
        <p>Choose one activity, then select <b>Start Play Mode</b> to hand the device to your learner.</p>
        <div class="grid">${MODS.map(([k, e, l, sub]) => `<button class="card ${lastMod === k ? "ok" : ""}" data-m="${k}" aria-pressed="${lastMod === k}" ${s.tokens <= 0 ? "disabled" : ""}><span class="big">${e}</span><span>${l}</span><small>${sub}</small></button>`).join("")}</div>
        <div class="row"><button class="card ok" data-play style="width:100%;min-height:60px" ${s.tokens <= 0 ? "disabled" : ""}>▶ Start Play Mode</button></div>
      </section>
      
      <section class="section-card"><div class="section-title">⚙️ Learning preferences</div>
        <div class="row sp"><span><b>Sound and voice guidance</b><br><small>Use spoken instructions and feedback</small></span><button class="ghost" data-mute aria-pressed="${!s.mute}">${s.mute ? "🔇 Sound off" : "🔊 Sound on"}</button></div>
        <h3>Voice preference</h3><p>Choose a voice for spoken feedback</p>
        <div class="row" style="flex-wrap:wrap;gap:8px">${[
          { id: "default", name: "👨 Male Voice", desc: "Calm male voice" },
          { id: "female", name: "👩 Female Voice", desc: "Friendly female voice" },
          { id: "child", name: "👧 Child Voice", desc: "Playful child voice" },
          { id: "calm", name: "🧘 Calm Voice", desc: "Slow & clear voice" }
        ].map(v => `<button class="ghost ${s.voice === v.id ? "ok" : ""}" data-voice="${v.id}" title="${v.desc}" style="flex:1;min-width:120px">${v.name}</button>`).join("")}</div>
        <h3 style="margin-top:16px">Activity difficulty</h3><p>Start with a level that feels comfortable. You can change it at any time.</p>
        <div class="row">${["Easy", "Medium", "Hard"].map((t, i) => `<button class="ghost ${s.difficulty === i + 1 ? "ok" : ""}" data-d="${i + 1}" aria-pressed="${s.difficulty === i + 1}">${t}</button>`).join("")}</div>
      </section>
      
      <section class="section-card"><div class="section-title">📈 Learning progress</div>${bars()}</section>
      
      <section class="section-card"><div class="section-title">🏆 Learner Award</div>
        <div style="text-align:center;padding:16px;background:linear-gradient(120deg,#fff9e6,#fffbf0);border-radius:16px;border:2px solid #ffd56b">
          <div style="font-size:3rem;margin-bottom:8px">🌟</div>
          <div style="font-size:2rem;font-weight:900;color:#ff9d25">${avgScore} pts</div>
          <small style="color:#78540a">Average Points Across All Activities</small>
        </div>
      </section>
      
      <section class="section-card"><div class="section-title">⭐ AutiTokens and rewards</div>
        <div style="margin:16px 0;padding:14px;background:#f1f8ff;border-radius:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-weight:800">
            <span>${displayTokens} / ${Math.round(s.maxTokens * 4)} tokens</span>
            <span>${Math.round(tokenPercent)}%</span>
          </div>
          <div style="width:100%;height:14px;background:#e4f1ff;border-radius:8px;overflow:hidden">
            <div style="width:${tokenPercent}%;height:100%;background:linear-gradient(90deg,#37c96f,#159d55);transition:width 0.3s ease"></div>
          </div>
        </div>
        <div class="row">${[10, 25, 50, 100, 200].map(n => `<button class="ghost" data-buy="${n}">＋${n} demo tokens</button>`).join("")}</div><small>Demo balance only. Connect a payment provider through the backend for real purchases.</small></section>
      
      <section class="section-card"><div class="section-title">🎁 Optional learning extras</div>${SHOP.map(([k, l, c]) => `<div class="row sp"><span>${l}</span>${Store.has(k) ? `<b style="color:#229b59">✓ Unlocked</b>` : `<button class="ghost" data-u="${k}">${c} ⭐</button>`}</div>`).join("")}</section>`;
    
    // Attach event listeners
    const createForm = el.querySelector("#createChildForm");
    if (createForm) {
      createForm.onsubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await Api.post("/api/parent/children", {
            full_name: el.querySelector("#childName").value,
            age: parseInt(el.querySelector("#childAge").value),
            learning_level: el.querySelector("#childLevel").value
          });
          console.log("Child created:", response);
          toast("Child profile created!");
          go("guardian");  // Refresh
        } catch (err) {
          toast("Error: " + err.message);
        }
      };
    }
    
    const childSelect = el.querySelector("#childSelect");
    if (childSelect) {
      childSelect.addEventListener("change", (e) => {
        window.AUTILEARN_CONTEXT.child_id = parseInt(e.target.value);
        console.log("Selected child:", window.AUTILEARN_CONTEXT.child_id);
      });
    }
  };
  
  el.onclick = (e) => {
    const b = e.target.closest("[data-m],[data-play],[data-mute],[data-buy],[data-d],[data-u],[data-voice]");
    if (!b || b.disabled) return;
    const d = b.dataset;
    if ("play" in d) {
      if (s.tokens <= 0) return toast("⚠️ Tokens depleted. Add more tokens to continue.");
      return go("play", lastMod);
    }
    if (d.m) { lastMod = d.m; return go("guardian"); }
    if ("mute" in d) { s.mute = !s.mute; Store.save(); return go("guardian"); }
    else if ("voice" in d) { s.voice = d.voice; Store.save(); return go("guardian"); }
    else if (d.buy) { 
      s.tokens += +d.buy / 4;
      if (s.tokens > s.maxTokens) s.maxTokens = s.tokens;
      Store.save();
      go("guardian");
      return;
    }
    else if (d.d) { s.difficulty = +d.d; Store.save(); return go("guardian"); }
    else if (d.u) {
      const it = SHOP.find(x => x[0] === d.u);
      if (s.tokens < it[2]) return toast("You need more tokens for this extra.");
      s.tokens -= it[2]; s.unlocked.push(d.u);
      Store.save(); return go("guardian");
    }
    Store.save(); draw();
  };
  
  draw();
};
