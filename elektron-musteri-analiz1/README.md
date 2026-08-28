# Musteri Analiz & Segmentasyon Motoru (Electron)

Bu proje, Electron ile bir masaustu uygulamasi olarak calisir. Su an tum
veriler **sentetik** (src/syntheticData.js icinde uretiliyor). Ileride
gercek endpoint'lere baglanmak icin sadece `main.js` icindeki
`get-dashboard-data` islevindeki tek bir satiri degistirmek yeterli olacak.

## Kurulum

```bash
npm install
```

Bu komut Electron'u indirir.

## Calistirma

```bash
npm start
```

Bir masaustu penceresi acilacak ve icinde iki sekme gorunecek:

1. **Motor 1 — Analiz Paneli**: toplam musteri/ciro, harcama yuzdelik
   dilimleri (P25/P50/P75/P90), siparis sikligi dagilim grafigi, urun
   bazinda tekrar alim orani tablosu.
2. **Motor 2 — Segmentasyon**: tek seferlik musteriler (geri kazanma
   mesaji adaylari) ve surekli/sadik musteriler (indirim mesaji
   adaylari), onerilen mesaj metinleriyle birlikte.

## Klasor yapisi ve neyin nerede degistirileceği

| Dosya | Ne ise yarar | Gercek sisteme geciste ne olur |
|---|---|---|
| `main.js` | Pencereyi acar, IPC uzerinden veriyi renderer'a verir | `generateSyntheticDataset()` cagrisi yerine gercek API/DB sorgusu gelir |
| `preload.js` | main ↔ renderer guvenli koprusu | degismez |
| `src/syntheticData.js` | Sahte musteri/siparis verisi uretir | proje olgunlasinca kaldirilir |
| `src/analytics.js` | Motor 1: yuzdelik dilim, siklik, urun tekrar analizi | degismez (veri sekli aynı kaldigi surece) |
| `src/segmentation.js` | Motor 2: segment kurallari + mesaj metinleri | kurallar (RULES) is ihtiyacina gore ayarlanir |
| `index.html`, `styles.css`, `renderer.js` | Arayuz | web surumune tasinirken buyuk olcude aynen kullanilabilir |

## Web surumune gecis notu

Renderer tarafi (`index.html`, `renderer.js`, `styles.css`) zaten sade
HTML/CSS/JS oldugu icin bir web sunucusunun (Express/Next.js vb.)
statik dosyalari olarak da servis edilebilir. Tek degisecek yer,
`renderer.js` icindeki `window.api.getDashboardData()` cagrisinin
`fetch('/api/dashboard')` ile degistirilmesidir. `analytics.js` ve
`segmentation.js` sunucu tarafinda (Node/Express) aynen calismaya
devam eder.

## Paketleme (opsiyonel, .exe/.app uretmek icin)

```bash
npm run dist
```

Bu komut `electron-builder` ile isletim sistemine uygun bir kurulum
dosyasi (.exe / .dmg / .AppImage) uretir.
