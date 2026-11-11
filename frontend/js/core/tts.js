// Web Speech API wrapper. Audio is optional: every cue also has a visual (see Fx).
const Tts = {
  speak(text) {
    if (Store.s.mute) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = Store.has("voice") ? 0.7 : 0.85;
      u.pitch = 1.05;
      speechSynthesis.speak(u);
    } catch {}
  },
};
