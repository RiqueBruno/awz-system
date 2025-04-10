import { app, BrowserWindow } from "electron";
import path from "path";
const isDev = process.env.NODE_ENV !== "production";

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: "Academia Waleska Zanyor - Sistema de Gestão",
    transparent: true,
    backgroundColor: "#BA8F4C",
    webPreferences: {
      nodeIntegration: false, // Melhor para segurança
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000"); // Carrega o Next.js no modo dev
  } else {
    mainWindow.loadFile(path.join(__dirname, ".next", "server", "pages", "index.html")); // Para produção
  }

  mainWindow.on("closed", () => (mainWindow = null));
}

app.whenReady().then(createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
