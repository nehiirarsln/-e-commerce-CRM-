// main.js — ELECTRON'UN "MAIN PROCESS" TARAFI
// Bu dosya Node.js ortamında çalışır. Görevi:
//   1) Isletim sisteminde bir pencere acmak
//   2) O pencerenin icine bizim index.html'imizi yuklemek
//   3) Ileride: gercek API/veritabani baglantilarini burada kurmak
//      (renderer tarafi guvenlik geregi dogrudan internete/dosya sistemine erisemez)

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// Sentetik veri ve motorlarimizi burada, Node tarafinda calistiriyoruz.
// Boylece renderer (arayuz) sadece "veriyi goster" ile ugrasiyor,
// "veriyi nereden aliyorum" sorusuna hic karismiyor.
// ---> Gercek sisteme gecince degisecek TEK yer burasi: generateSyntheticDataset()
//      yerine fetch('https://api.firma.com/musteriler') gibi gercek bir cagri gelecek.
const { generateSyntheticDataset } = require("./src/syntheticData");
const { computeAnalytics } = require("./src/analytics");
const { segmentCustomers } = require("./src/segmentation");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // preload.js: main ve renderer arasindaki GUVENLI koprudur.
      // renderer.js icinden dogrudan Node/require kullanamayiz (guvenlik),
      // sadece preload'un izin verdigi fonksiyonlari cagirabiliriz.
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ---- IPC (Inter-Process Communication) ----
// Renderer taraf "veri istiyorum" dedigi zaman buraya dusuyor.
// Simdilik sentetik veri uretip motorlardan geciriyoruz.
// Gercek sisteme geciste burasi degisecek: generateSyntheticDataset() yerine
// bir HTTP istegi / veritabani sorgusu koyacaksiniz, geri kalan (analytics,
// segmentation, arayuz) AYNEN kalabilir.
ipcMain.handle("get-dashboard-data", async () => {
  const dataset = generateSyntheticDataset({ customerCount: 250 });
  const analytics = computeAnalytics(dataset);
  const segments = segmentCustomers(dataset);

  return { analytics, segments };
});
