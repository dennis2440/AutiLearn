// App bootstrap. Add a router here later to switch between child / guardian / tutor views.
(async () => {
  const el = document.getElementById("status");
  try {
    const h = await Api.get("/api/health");
    el.textContent = `Server: ${h.status}`;
  } catch {
    el.textContent = "Server not reachable (check API_BASE in js/core/config.js).";
  }
})();
