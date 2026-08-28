// preload.js — GUVENLIK KOPRUSU
// Renderer (arayuz) tarafinin Node.js'e veya dosya sistemine dogrudan
// erismesini ISTEMEYIZ (bir web sayfasi gibi davransin, guvenli kalsin).
// Bu dosya, renderer'a SADECE izin verdigimiz fonksiyonlari acar.
// window.api.getDashboardData() dedigimizde aslinda main.js'teki
// ipcMain.handle("get-dashboard-data") calisir.

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getDashboardData: () => ipcRenderer.invoke("get-dashboard-data"),
});
