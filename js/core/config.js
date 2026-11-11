// The ONE place that decides where the API lives.
// Served by Flask in dev -> same origin. Inside Capacitor -> must be a full URL.
window.AUTILEARN_CONFIG = {
  API_BASE: window.location.protocol.startsWith("http") && window.location.port === "5000"
    ? ""                          // served by Flask in dev
    : "http://10.0.2.2:5000",     // Android emulator -> host machine. Use your deployed URL in production.
};
