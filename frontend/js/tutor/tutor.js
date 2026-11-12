Views.tutor = async (el) => {
  const s = Store.s;
  let children = [];
  let history = [];
  
  // Fetch assigned children from backend
  try {
    const response = await Api.get("/api/tutor/children");
    children = response.children || [];
    console.log("Fetched tutor children:", children);
  } catch (e) {
    console.error("Failed to fetch tutor children:", e.message);
    toast("Could not load learners from backend.");
  }
  
  // Fetch activity history from backend
  try {
    const response = await Api.get("/api/tutor/history");
    history = response.history || [];
    console.log("Fetched tutor history:", history);
  } catch (e) {
    console.error("Failed to fetch tutor history:", e.message);
  }
  
  // Render dashboard
  const days = Store.has("analytics")
    ? `<h3>Last 7 days</h3><div class="row">${[...Array(7)].map((_, i) => {
        const d = new Date(Date.now() - (6 - i) * 864e5).toDateString();
        return `<div class="day"><b>${s.log.filter(l => new Date(l.t).toDateString() === d).length}</b><small>${d.slice(0, 3)}</small></div>`;
      }).join("")}</div>`
    : `<p>🔒 Daily activity chart is available when the guardian unlocks "Advanced tutor analytics".</p>`;
  
  el.innerHTML = `<section class="dashboard-intro"><h2>Teacher activity overview 👩‍🏫</h2><p>Review learner practice, celebrate progress and identify activities that may need more support.</p></section>
    
    <section class="section-card"><div class="section-title">📊 Accuracy by activity</div>${bars()}</section>
    
    <section class="section-card">${days}</section>
    
    <section class="section-card">
      <div class="section-title">👶 Your Learners</div>
      ${children.length === 0 ? `<p>No learners assigned yet.</p>` : `
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse">
            <tr style="border-bottom:2px solid #ccc;font-weight:bold">
              <td style="padding:12px;text-align:left">Name</td>
              <td style="padding:12px;text-align:left">Age</td>
              <td style="padding:12px;text-align:left">Level</td>
              <td style="padding:12px;text-align:left">Parent</td>
            </tr>
            ${children.map(c => `
              <tr style="border-bottom:1px solid #eee">
                <td style="padding:12px">${c.full_name}</td>
                <td style="padding:12px">${c.age}</td>
                <td style="padding:12px;text-transform:capitalize">${c.learning_level}</td>
                <td style="padding:12px">${c.parent_name}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      `}
    </section>
    
    <section class="section-card"><div class="section-title">🏅 Learning milestones</div>${s.notes.slice(0, 8).map(n => `<div class="note">🎉 ${n.msg}<small>${new Date(n.t).toLocaleString()}</small></div>`).join("") || "<p>No milestones yet. A new milestone will appear as the learner practises.</p>"}</section>
    
    <section class="section-card">
      <div class="section-title">📊 Recent Activity</div>
      ${history.length === 0 ? `<p>No activity recorded yet.</p>` : `
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse">
            <tr style="border-bottom:2px solid #ccc;font-weight:bold">
              <td style="padding:12px;text-align:left">Learner</td>
              <td style="padding:12px;text-align:left">Activity</td>
              <td style="padding:12px;text-align:left">Score</td>
              <td style="padding:12px;text-align:left">Date</td>
            </tr>
            ${history.slice(0, 20).map(h => {
              const scorePercent = h.total_questions > 0 ? Math.round((h.score / h.total_questions) * 100) : 0;
              return `
              <tr style="border-bottom:1px solid #eee">
                <td style="padding:12px">${h.child_name}</td>
                <td style="padding:12px;text-transform:capitalize">${h.activity}</td>
                <td style="padding:12px">${h.score}/${h.total_questions} (${scorePercent}%)</td>
                <td style="padding:12px">${new Date(h.completed_at).toLocaleDateString()}</td>
              </tr>
            `;
            }).join('')}
          </table>
        </div>
      `}
    </section>`;
};
