Views.tutor = (el) => {
  const s = Store.s;
  
  // Activity name mapping with emojis and full names
  const activityNames = {
    match: { emoji: "🧩", name: "Match Pairs" },
    spell: { emoji: "🔤", name: "Spell & Learn" },
    trace: { emoji: "✍️", name: "Trace Letters" }
  };
  
  const days = Store.has("analytics")
    ? `<h3>Last 7 days</h3><div class="row">${[...Array(7)].map((_, i) => {
        const d = new Date(Date.now() - (6 - i) * 864e5).toDateString();
        return `<div class="day"><b>${s.log.filter(l => new Date(l.t).toDateString() === d).length}</b><small>${d.slice(0, 3)}</small></div>`;
      }).join("")}</div>`
    : `<p>🔒 Daily activity chart is available when the guardian unlocks "Advanced tutor analytics".</p>`;
  
  el.innerHTML = `<section class="dashboard-intro"><h2>Teacher activity overview 👩‍🏫</h2><p>Review learner practice, celebrate progress and identify activities that may need more support.</p></section>
    <section class="section-card"><div class="section-title">📊 Accuracy by activity</div>${bars()}</section>
    <section class="section-card">${days}</section>
    <section class="section-card"><div class="section-title">🏅 Learning milestones</div>${s.notes.slice(0, 8).map(n => `<div class="note">🎉 ${n.msg}<small>${new Date(n.t).toLocaleString()}</small></div>`).join("") || "<p>No milestones yet. A new milestone will appear as the learner practises.</p>"}</section>
    <section class="section-card"><div class="section-title">🕒 Recent activity</div>
      <div style="display:grid;gap:10px">
        ${s.log.slice(0, 15).map((l, idx) => {
          const act = activityNames[l.m] || { emoji: "📚", name: l.m };
          const status = l.ok ? "✅ Correct" : "❌ Needs help";
          const time = new Date(l.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const date = new Date(l.t).toLocaleDateString();
          
          // Format task details
          let taskDetail = "";
          if (l.task) {
            if (l.m === "spell") {
              taskDetail = `Word: <strong>${l.task}</strong>`;
            } else if (l.m === "trace") {
              taskDetail = `Shape/Letter: <strong>${l.task}</strong>`;
            } else if (l.m === "match") {
              taskDetail = `Item: <strong>${l.task}</strong>`;
            }
          }
          
          return `<div class="row sp" style="padding:12px;background:#f8fbff;border-radius:12px;border-left:4px solid ${l.ok ? '#35b96b' : '#ff9d25'}">
            <div style="flex:1">
              <div style="font-weight:800;color:#176fbe;margin-bottom:4px">${act.emoji} ${act.name}</div>
              ${taskDetail ? `<div style="margin-bottom:4px;color:#294c7b">${taskDetail}</div>` : ""}
              <small style="color:#7186a1">${time} on ${date}</small>
            </div>
            <span style="font-weight:700;color:${l.ok ? '#35b96b' : '#ff9d25'};text-align:right">${status}</span>
          </div>`;
        }).join("") || "<p>No activity has been recorded yet.</p>"}
      </div>
    </section>`;
};
