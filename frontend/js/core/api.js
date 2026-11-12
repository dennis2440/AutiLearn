// Tiny fetch wrapper used by every view. Handles base URL + JWT header.
const Api = {
  token: () => localStorage.getItem("autilearn_token"),
  setToken: (t) => localStorage.setItem("autilearn_token", t),

  async request(path, { method = "GET", body } = {}) {
    // Ensure config exists
    if (!window.AUTILEARN_CONFIG) {
      console.error("AUTILEARN_CONFIG not initialized!");
      throw new Error("Configuration not loaded. Please refresh the page.");
    }

    const headers = { "Content-Type": "application/json" };
    const t = Api.token();
    if (t) headers.Authorization = `Bearer ${t}`;
    
    const baseUrl = window.AUTILEARN_CONFIG.API_BASE || "";
    const fullUrl = baseUrl + path;
    
    console.log("API Request:", method, fullUrl);
    
    try {
      const res = await fetch(fullUrl, {
        method, 
        headers, 
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        console.error("API Error:", res.status, data.error || res.statusText);
        throw Object.assign(new Error(data.error || res.statusText), { status: res.status });
      }
      
      console.log("API Response:", data);
      return data;
    } catch (error) {
      console.error("API Request Failed:", error.message);
      throw error;
    }
  },
  get: (p) => Api.request(p),
  post: (p, body) => Api.request(p, { method: "POST", body }),
};
