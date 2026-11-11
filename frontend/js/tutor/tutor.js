Views.tutor = (el) => {
  const s = Store.s;
  const days = Store.has("analytics")
    ? `<h2>Last 7 days</h2><div class="row">${[...Array(7)].map((_, i) => {
        const d = new Date(Date.now() - (6 - i) * 864e5).toDateString();
        return `<div class="day"><b>${s.log.filter(l => new Date(l.t).toDateString() === d).length}</b><small>${d.slice(0, 3)}</small></div>`;
      }).join("")}</div>`
    : `<p>🔒 Daily activity chart: ask the guardian to unlock "Advanced tutor analytics".</p>`;
  el.innerHTML = `<h2>Accuracy</h2>${bars()}${days}
    <h2>🔔 Milestones</h2>${s.notes.slice(0, 8).map(n => `<div class="note">🎉 ${n.msg}<small>${new Date(n.t).toLocaleString()}</small></div>`).join("") || "<p>No milestones yet.</p>"}
    <h2>Recent activity</h2>${s.log.slice(0, 8).map(l => `<div class="row sp"><span>${l.m}</span><span>${l.ok ? "✅" : "❌"}</span></div>`).join("") || "<p>No activity yet.</p>"}`;
};
