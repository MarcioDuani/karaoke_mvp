const { app, BrowserWindow } = require("electron");

// 🔑 LIBERA AUTOPLAY NO CHROMIUM
app.commandLine.appendSwitch(
  "autoplay-policy",
  "no-user-gesture-required"
);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      autoplayPolicy: "no-user-gesture-required"
    }
  });

  // ⚠️ TROQUE PELO ID DA SUA FESTA
  win.loadURL("http://192.168.0.143:3000/admin.html?party=8QVWHW");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
