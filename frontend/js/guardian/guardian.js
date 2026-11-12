const SHOP = [["trace", "✏️ Extra tracing shapes", 15], ["voice", "🔊 Calm slow voice", 10], ["analytics", "📊 Advanced tutor analytics", 20], ["rewards", "🏆 Sticker reward tier", 15]];
const MODS = [["match", "🧩", "Match pairs", "Find the picture"], ["spell", "🔤", "Spell and learn", "Build simple words"], ["trace", "✍️", "Trace letters", "Follow the dotted path"]];
let lastMod = "match";
let childrenList = [];

Views.guardian = async (el) => {
  const s = Store.s;
  let children = [];
  let summary = { children_count: 0, activities_completed: 0, average_score: 0 };
  let childAssessments = {}; // Track which children need assessment
  const COST_PER_LEARNER = 5; // Cost in tokens to add new learner
  
  // Show loading state immediately
  el.innerHTML = `<section class="dashboard-intro"><h2>Loading your dashboard... 👋</h2></section>`;
  
  // Fetch children and summary in parallel
  try {
    const [childrenResp, summaryResp] = await Promise.all([
      Api.get("/api/parent/children").catch(() => ({ children: [] })),
      Api.get("/api/parent/summary").catch(() => ({ summary: { children_count: 0, activities_completed: 0, average_score: 0 } }))
    ]);
    
    children = childrenResp.children || [];
    summary = summaryResp.summary || summary;
    childrenList = children;
    console.log("Fetched children from API:", children);
    
    // Fetch assessment status for all children in parallel (only if there are children)
    if (children.length > 0) {
      const assessmentPromises = children.map(child =>
        Api.get(`/api/assessment/${child.id}`)
          .then(resp => ({ child_id: child.id, assessment: resp.assessment }))
          .catch(() => ({ child_id: child.id, assessment: null }))
      );
      
      const assessmentResults = await Promise.all(assessmentPromises);
      assessmentResults.forEach(result => {
        childAssessments[result.child_id] = result.assessment;
      });
      console.log("Fetched assessments for all children");
    }
  } catch (e) {
    console.error("Failed to fetch data:", e.message);
    toast("Could not load dashboard. Please refresh the page.");
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
          <p style="color:var(--muted);margin-bottom:20px">No learner profiles yet.</p>
          <button class="card ok" id="addFirstLearner" style="width:100%;min-height:clamp(48px,6vw,54px);font-size:clamp(0.95rem,2vw,1.05rem)">+ Add Your First Learner</button>
        ` : `
          <div style="display:grid;gap:16px">
            <!-- Learner Cards Grid -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:0">
              ${children.map(c => {
                const hasAssessment = childAssessments[c.id];
                const isSelected = c.id === window.AUTILEARN_CONTEXT.child_id;
                const assessmentStatus = hasAssessment ? "✓ Ready" : "📝 Assess";
                return `
                  <button class="learner-card" data-child-id="${c.id}" style="
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                    justify-content:center;
                    gap:8px;
                    min-height:150px;
                    padding:16px 12px;
                    border:2px solid ${isSelected ? 'var(--blue)' : '#d8e8f8'};
                    border-radius:18px;
                    background:${isSelected ? '#e8f4ff' : '#fff'};
                    color:var(--ink);
                    font-family:inherit;
                    cursor:pointer;
                    transition:all 0.2s ease;
                    box-shadow:${isSelected ? '0 4px 12px rgba(22,136,237,0.2)' : '0 2px 6px rgba(31,93,155,0.08)'};
                  ">
                    <div style="font-size:2.5rem;line-height:1">👶</div>
                    <div style="font-weight:800;font-size:1rem;text-align:center;color:var(--ink)">${c.full_name}</div>
                    <div style="font-size:0.85rem;color:#59708f;font-weight:600">${c.age} years old</div>
                    <div style="font-size:0.75rem;padding:4px 10px;background:${hasAssessment ? '#d4edda' : '#fff3cd'};border-radius:12px;color:${hasAssessment ? '#155724' : '#856404'};font-weight:700">${assessmentStatus}</div>
                  </button>
                `;
              }).join('')}
            </div>
            
            <!-- Action Buttons -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px">
              <button class="ghost" id="addNewLearner" style="width:100%;font-size:0.95rem;min-height:48px;font-weight:600">+ Add Learner</button>
              ${(() => {
                const selectedChildId = window.AUTILEARN_CONTEXT.child_id;
                const selectedChild = children.find(c => c.id === selectedChildId);
                const hasAssessment = childAssessments[selectedChildId];
                
                if (!hasAssessment && selectedChild) {
                  return `<button class="card" data-assess="${selectedChildId}" style="width:100%;background:linear-gradient(135deg,#ff9d25,#ff8a00);color:white;border:none;min-height:48px;font-size:0.95rem;font-weight:700;cursor:pointer;transition:all 0.2s ease;box-shadow:0 4px 12px rgba(255,157,37,0.3)">📝 Assess</button>`;
                }
                return `<div></div>`; // Empty spacer if no assessment needed
              })()}
            </div>
          </div>
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
      
      <section class="section-card"><div class="section-title">🎁 Optional learning extras</div>${SHOP.map(([k, l, c]) => `<div class="row sp"><span>${l}</span>${Store.has(k) ? `<b style="color:#229b59">✓ Unlocked</b>` : `<button class="ghost" data-u="${k}">${c} ⭐</button>`}</div>`).join("")}</section>
      
      <!-- Add New Learner Modal -->
      <div id="addLearnerModal" class="modal" style="display:none;z-index:25;position:fixed;inset:0;background:rgba(18,48,89,.45);overflow-y:auto;padding:20px">
        <form id="addLearnerForm" class="auth" style="max-width:480px;margin:auto;width:100%">
          <h2 style="text-align:center;margin-top:0;margin-bottom:12px;font-size:1.5rem">Add New Learner</h2>
          <p style="text-align:center;color:var(--muted);margin:0 0 20px;font-weight:600;font-size:0.95rem">Cost: <strong style="color:var(--orange)">${COST_PER_LEARNER} ⭐ AutiTokens</strong></p>
          
          <div class="auth-fields">
            <label for="newLearnerName" style="font-weight:800;color:#294c7b"><span>Learner's name</span> <span class="required">*</span><input id="newLearnerName" type="text" placeholder="e.g., Emma" required></label>
            
            <label for="newLearnerAge" style="font-weight:800;color:#294c7b"><span>Age</span> <span class="required">*</span><input id="newLearnerAge" type="number" min="2" max="18" placeholder="2-18" required></label>
            
            <label for="newLearnerLevel" style="font-weight:800;color:#294c7b"><span>Learning level</span> <span class="required">*</span><select id="newLearnerLevel" required>
              <option value="">Choose level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select></label>
          </div>
          
          <div id="learnerError" role="alert" style="color:#d64b42;min-height:1.4em;margin:0 0 12px;font-weight:600;font-size:0.95rem"></div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <button type="button" id="cancelAddLearner" class="ghost" style="width:100%;min-height:48px;cursor:pointer">Cancel</button>
            <button type="submit" class="card ok" style="width:100%;min-height:48px;cursor:pointer">Add Learner</button>
          </div>
        </form>
      </div>`;
    
    // Attach event listeners
    const addFirstLearnerBtn = el.querySelector("#addFirstLearner");
    if (addFirstLearnerBtn) {
      addFirstLearnerBtn.onclick = () => showAddLearnerModal();
    }
    
    const addNewLearnerBtn = el.querySelector("#addNewLearner");
    if (addNewLearnerBtn) {
      addNewLearnerBtn.onclick = () => showAddLearnerModal();
    }
    
    // Handle learner card clicks
    const learnerCards = el.querySelectorAll(".learner-card");
    learnerCards.forEach(card => {
      card.onclick = (e) => {
        e.preventDefault();
        const childId = parseInt(card.dataset.childId);
        window.AUTILEARN_CONTEXT.child_id = childId;
        console.log("Selected child:", childId);
        draw(); // Redraw to update selection state
      };
    });
    
    const childSelect = el.querySelector("#childSelect");
    if (childSelect) {
      childSelect.addEventListener("change", (e) => {
        window.AUTILEARN_CONTEXT.child_id = parseInt(e.target.value);
        console.log("Selected child:", window.AUTILEARN_CONTEXT.child_id);
        draw();
      });
    }
    
    // Add learner modal event listeners
    const addLearnerForm = el.querySelector("#addLearnerForm");
    const cancelBtn = el.querySelector("#cancelAddLearner");
    const modal = el.querySelector("#addLearnerModal");
    
    if (cancelBtn) {
      cancelBtn.onclick = (e) => {
        e.preventDefault();
        modal.style.display = "none";
      };
    }
    
    if (addLearnerForm) {
      addLearnerForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const name = el.querySelector("#newLearnerName").value.trim();
        const age = parseInt(el.querySelector("#newLearnerAge").value);
        const level = el.querySelector("#newLearnerLevel").value;
        const errorDiv = el.querySelector("#learnerError");
        
        // Validate
        if (!name) {
          errorDiv.textContent = "Please enter a learner name.";
          return;
        }
        if (age < 2 || age > 18 || isNaN(age)) {
          errorDiv.textContent = "Age must be between 2 and 18.";
          return;
        }
        if (!level) {
          errorDiv.textContent = "Please select a learning level.";
          return;
        }
        
        // Check tokens
        const displayTokens = Math.round(s.tokens * 4);
        if (displayTokens < COST_PER_LEARNER) {
          errorDiv.textContent = `You need ${COST_PER_LEARNER} ⭐ tokens. You have ${displayTokens}.`;
          return;
        }
        
        try {
          // Create learner first (before deducting tokens)
          const response = await Api.post("/api/parent/children", {
            full_name: name,
            age: age,
            learning_level: level
          });
          
          console.log("Learner created:", response);
          
          // Deduct tokens only after successful creation
          s.tokens -= COST_PER_LEARNER / 4;
          Store.save();
          
          toast("🎉 New learner added!");
          modal.style.display = "none";
          
          // Small delay to ensure database is updated, then refresh
          setTimeout(() => go("guardian"), 300);
        } catch (err) {
          errorDiv.textContent = err.message || "Failed to add learner. Please try again.";
          console.error("Error adding learner:", err);
        }
      };
    }
    
    // Close modal when clicking outside
    if (modal) {
      modal.onclick = (e) => {
        // Only close if clicking on the backdrop (not the form)
        if (e.target === modal) {
          modal.style.display = "none";
        }
      };
    }
  };
  
  const showAddLearnerModal = () => {
    const modal = el.querySelector("#addLearnerModal");
    if (modal) {
      modal.style.display = "grid";
      el.querySelector("#newLearnerName").focus();
      el.querySelector("#learnerError").textContent = "";
      el.querySelector("#addLearnerForm").reset();
    }
  };
  
  el.onclick = (e) => {
    const b = e.target.closest("[data-m],[data-play],[data-mute],[data-buy],[data-d],[data-u],[data-voice],[data-assess]");
    if (!b || b.disabled) return;
    const d = b.dataset;
    
    // Handle assessment button
    if ("assess" in d) {
      const childId = parseInt(d.assess);
      return go("assessment", childId);
    }
    
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
