// Native hooks. Web fallbacks run today; Capacitor lines are ready to uncomment.
// Setup: npm i @capacitor/app @capacitor/status-bar && npx cap sync
const Native = {
  async enterPlay(onBack) {
    document.documentElement.requestFullscreen?.().catch(() => {});
    // const { App, StatusBar } = window.Capacitor.Plugins;
    // await StatusBar.hide();
    // Native._back = await App.addListener("backButton", onBack); // hardware back opens the Guardian Gate
  },
  async exitPlay() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    // const { StatusBar } = window.Capacitor.Plugins;
    // await StatusBar.show();
    // Native._back?.remove();
  },
};
