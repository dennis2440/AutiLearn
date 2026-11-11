// Tiny fetch wrapper used by every view. Handles base URL + JWT header.
const Api = {
  token: () => localStorage.getItem("autilearn_token"),
  setToken: (t) => localStorage.setItem("autilearn_token", t),

  async request(path, { method = "GET", body } = {}) {
    const headers = { "Content-Type": "application/json" };
    const t = Api.token();
    if (t) headers.Authorization = `Bearer ${t}`;
    const res = await fetch(window.AUTILEARN_CONFIG.API_BASE + path, {
      method, headers, body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || res.statusText), { status: res.status });
    return data;
  },
  get: (p) => Api.request(p),
  post: (p, body) => Api.request(p, { method: "POST", body }),
};
