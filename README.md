# E-Commerce CRM — Musteri Analiz & Segmentasyon Motoru

**Bir e-ticaret magazasinin siparis verisini analiz eden, musterileri davranislarina gore segmentlere ayiran ve hedefli mesaj listeleri cikaran, Electron tabanli masaustu uygulamasi.**

![platform](https://img.shields.io/badge/platform-Electron-2b2e3b)
![status](https://img.shields.io/badge/status-gelisim%20asamasinda-yellow)
![data](https://img.shields.io/badge/veri-sentetik-orange)
![license](https://img.shields.io/badge/license-MIT-blue)

---

## Problem

Bir e-ticaret magazasinin siparis geçmisinde iki soru genelde cevapsiz kalir:

- **Hangi musteriler kaybediliyor?** Bir kere alisveris yapip bir daha donmeyen musteriler fark edilmeden birikir, hicbir geri kazanma aksiyonu alinmaz.
- **Hangi musteriler sadik?** Duzenli alisveris yapan musteriler, ozel bir indirim veya tesekkur mesaji olmadan diger musterilerle ayni muameleyi gorur.

Bu proje, ham siparis verisinden bu iki grubu otomatik cikartip, her biri icin somut bir aksiyon (mesaj metni) onerir — ayni zamanda bunu once bir **masaustu uygulamasi** olarak, Electron'un main/renderer mimarisini gercekten anlayarak kurmayi hedefler.

## Iki motor, tek panel

| | Motor 1 — Analiz Paneli | Motor 2 — Segmentasyon |
|---|---|---|
| **Girdi** | Musteri + siparis verisi | Ayni veri seti |
| **Hesaplar** | Harcama yuzdelik dilimleri (P25/P50/P75/P90), siparis siklik dagilimi, urun bazinda tekrar alim orani | Tek seferlik vs sadik musteri ayrimi (kural bazli) |
| **Cikti** | Grafik + tablo (dashboard) | Musteri listesi + onerilen mesaj metni |
| **Kod** | [`src/analytics.js`](src/analytics.js) | [`src/segmentation.js`](src/segmentation.js) |

## Hizli baslangic

```bash
git clone https://github.com/nehiirarsln/-e-commerce-CRM-.git
cd -e-commerce-CRM-
npm install
npm start
```

`npm install` Electron'u indirir (ilk seferde ~100-200 MB). `npm start`
masaustu penceresini acar, iki sekmeli bir dashboard karsilar.

## Mimari

```
┌──────────────────────┐        IPC         ┌───────────────────────┐
│   Renderer Process    │ <────────────────> │     Main Process       │
│  index.html / css /   │    preload.js      │   main.js (Node.js)    │
│     renderer.js       │   guvenli kopru    │                        │
└──────────────────────┘                     └────────────┬───────────┘
                                                            │
                                             ┌──────────────┴──────────────┐
                                             │                             │
                                    syntheticData.js              analytics.js
                                    (sentetik veri katmani)       segmentation.js
                                                                  (Motor 1 & 2)
```

Renderer surecinin Node.js'e veya dosya sistemine dogrudan erisimi yoktur
(`contextIsolation: true`) — tum veri akisi `preload.js` uzerinden kontrollu
IPC ile gecer. Bu ayrim, ileride ayni arayuzu bir web sunucusuna baglarken
(`main.js` yerine bir API endpoint'i) renderer katmanina hemen hic
dokunmamayi mumkun kilar.

## Klasor yapisi

```
├── main.js              # Electron ana surec — pencere + IPC handler
├── preload.js            # main <-> renderer guvenli koprusu
├── index.html             # arayuz
├── renderer.js             # arayuz mantigi (grafik, tablo)
├── styles.css
└── src/
    ├── syntheticData.js    # sahte musteri/siparis verisi
    ├── analytics.js         # Motor 1
    └── segmentation.js      # Motor 2 + mesaj onerileri
```

## Segmentasyon kurallari

`src/segmentation.js` icinde tek bir objeden yonetiliyor, is ihtiyacina gore
kolayca degistirilebilir:

```js
const RULES = {
  oneTimeBuyerMinDaysAgo: 45,   // son siparisten bu yana kac gun gecmis olmali
  loyalCustomerMinOrders: 4,    // en az kac siparis "sadik" sayilir
};
```

## Gercek veriye gecis

Sentetik veri katmani tek bir noktadan degistirilecek sekilde izole edildi —
`main.js` icindeki `get-dashboard-data` handler'i:

```js
// su an:
const dataset = generateSyntheticDataset({ customerCount: 250 });

// gercek sisteme geciste:
const dataset = await fetchCustomerDataFromApi();
```

`analytics.js` ve `segmentation.js`, veri sekli (`{ customers: [...] }`) ayni
kaldigi surece hic degismeden calismaya devam eder.

## Bilinen sinirlamalar

- Veri sentetik; gercek magaza verisiyle henuz dogrulanmadi
- Mesaj gonderme su an **simulasyon** — gercek SMS/e-posta/WhatsApp entegrasyonu yok
- Web surumune tasima henuz yapilmadi (renderer katmani buna hazir tasarlandi)

## Yol haritasi

- [ ] Gercek siparis verisine (CSV/API) baglanma
- [ ] Gercek mesaj gonderim entegrasyonu (SMS/e-posta)
- [ ] Web servisi olarak yeniden servis etme (Express/Next.js)
- [ ] Segmentasyon kurallarini arayuzden ayarlanabilir hale getirme
- [ ] Musteri detay sayfasi (siparis gecmisi timeline'i)

## Lisans

MIT
