const { app, BrowserWindow } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800
  });

  win.loadURL("http://localhost:3000/host-listener.html");
}

app.whenReady().then(createWindow);
