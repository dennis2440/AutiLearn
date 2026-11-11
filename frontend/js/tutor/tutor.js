Views.tutor = (el) => {
  const s = Store.s;
  const days = Store.has("analytics")
    ? `<h3>Last 7 days</h3><div class="row">${[...Array(7)].map((_, i) => {
        const d = new Date(Date.now() - (6 - i) * 864e5).toDateString();
        return `<div class="day"><b>${s.log.filter(l => new Date(l.t).toDateString() === d).length}</b><small>${d.slice(0, 3)}</small></div>`;
      }).join("")}</div>`
    : `<p>🔒 Daily activity chart is available when the guardian unlocks “Advanced tutor analytics”.</p>`;
  el.innerHTML = `<section class="dashboard-intro"><h2>Teacher activity overview 👩‍🏫</h2><p>Review learner practice, celebrate progress and identify activities that may need more support.</p></section>
    <section class="section-card"><div class="section-title">📊 Accuracy by activity</div>${bars()}</section>
    <section class="section-card">${days}</section>
    <section class="section-card"><div class="section-title">🏅 Learning milestones</div>${s.notes.slice(0, 8).map(n => `<div class="note">🎉 ${n.msg}<small>${new Date(n.t).toLocaleString()}</small></div>`).join("") || "<p>No milestones yet. A new milestone will appear as the learner practises.</p>"}</section>
    <section class="section-card"><div class="section-title">🕒 Recent activity</div>${s.log.slice(0, 8).map(l => `<div class="row sp"><span>${l.m}</span><span>${l.ok ? "✅ Completed" : "↻ Practise again"}</span></div>`).join("") || "<p>No activity has been recorded yet.</p>"}</section>`;
};
