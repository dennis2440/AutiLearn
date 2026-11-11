// Web Speech API wrapper (works offline on most Android devices with a voice installed).
const Tts = {
  speak(text) {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = Store.has("voice") ? 0.7 : 0.85; // "Calm voice" premium unlock
      u.pitch = 1.05;
      speechSynthesis.speak(u);
    } catch {}
  },
};
