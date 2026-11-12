// Web Speech API wrapper. Audio is optional: every cue also has a visual (see Fx).
const Tts = {
  speak(text) {
    if (Store.s.mute) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      
      // Get available voices
      const voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        speechSynthesis.speak(u);
        return;
      }
      
      // Voice selection based on user preference
      let selectedVoice = voices[0]; // default
      
      switch(Store.s.voice) {
        case "female":
          // Find female voice (look for female/woman/woman keywords)
          const femaleVoice = voices.find(v => 
            v.name.toLowerCase().includes("female") || 
            v.name.toLowerCase().includes("woman") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("victoria") ||
            v.name.toLowerCase().includes("karen")
          );
          if (femaleVoice) selectedVoice = femaleVoice;
          u.pitch = 1.3;
          u.rate = 0.85;
          break;
          
        case "child":
          // Find child/young voice (look for child/young keywords)
          const childVoice = voices.find(v => 
            v.name.toLowerCase().includes("child") || 
            v.name.toLowerCase().includes("young") ||
            v.name.toLowerCase().includes("junior") ||
            v.name.toLowerCase().includes("boy") ||
            v.name.toLowerCase().includes("girl")
          );
          if (childVoice) {
            selectedVoice = childVoice;
            u.pitch = 1.2;
            u.rate = 0.9;
          } else {
            // Fallback: use highest pitch available to mimic child voice
            u.pitch = 1.8;
            u.rate = 1.0;
          }
          break;
          
        case "calm":
          // Use default but with slow, clear settings
          u.pitch = 0.9;
          u.rate = 0.65;
          break;
          
        default: // "default"
          u.pitch = 1.0;
          u.rate = 0.85;
      }
      
      u.voice = selectedVoice;
      speechSynthesis.speak(u);
    } catch {}
  },
};
