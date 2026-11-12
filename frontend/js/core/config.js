// The ONE place that decides where the API lives.
// Automatically detects local dev vs deployed environments.

function initializeConfig() {
  // Local development: Flask serving frontend on port 5000
  if (window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "";  // Same origin
  }
  
  // Capacitor/Mobile: Android emulator
  if (window.location.hostname === "10.0.2.2") {
    return "http://10.0.2.2:5000";
  }
  
  // Production: Use injected config or infer from current origin
  if (window.AUTILEARN_API_BASE) {
    return window.AUTILEARN_API_BASE;
  }
  
  // Default: same origin (works for most deployments)
  return "";
}

if (!window.AUTILEARN_CONFIG) {
  window.AUTILEARN_CONFIG = {
    API_BASE: initializeConfig()
  };
}

// Debug info
console.log("AutiLearn initialized. API Base:", window.AUTILEARN_CONFIG.API_BASE || "(same origin - " + window.location.origin + ")");
