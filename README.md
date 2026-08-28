# E-Commerce CRM — Müşteri Analiz & Segmentasyon Motoru

**Bir e-ticaret mağazasının sipariş verisini analiz eden, müşterileri davranışlarına göre segmentlere ayıran ve hedefli mesaj listeleri çıkaran, Electron tabanlı masaüstü uygulaması.**

![platform](https://img.shields.io/badge/platform-Electron-2b2e3b)
![status](https://img.shields.io/badge/durum-geli%C5%9Fim%20a%C5%9Famas%C4%B1nda-yellow)
![data](https://img.shields.io/badge/veri-sentetik-orange)
![license](https://img.shields.io/badge/lisans-MIT-blue)

---

## Problem

Bir e-ticaret mağazasının sipariş geçmişinde iki soru genelde cevapsız kalır:

- **Hangi müşteriler kaybediliyor?** Bir kere alışveriş yapıp bir daha dönmeyen müşteriler fark edilmeden birikir, hiçbir geri kazanma aksiyonu alınmaz.
- **Hangi müşteriler sadık?** Düzenli alışveriş yapan müşteriler, özel bir indirim veya teşekkür mesajı olmadan diğer müşterilerle aynı muameleyi görür.

Bu proje, ham sipariş verisinden bu iki grubu otomatik çıkarıp, her biri için somut bir aksiyon (mesaj metni) önerir — aynı zamanda bunu önce bir **masaüstü uygulaması** olarak, Electron'un main/renderer mimarisini gerçekten anlayarak kurmayı hedefler.

## İki motor, tek panel

| | Motor 1 — Analiz Paneli | Motor 2 — Segmentasyon |
|---|---|---|
| **Girdi** | Müşteri + sipariş verisi | Aynı veri seti |
| **Hesaplar** | Harcama yüzdelik dilimleri (P25/P50/P75/P90), sipariş sıklık dağılımı, ürün bazında tekrar alım oranı | Tek seferlik vs sadık müşteri ayrımı (kural bazlı) |
| **Çıktı** | Grafik + tablo (dashboard) | Müşteri listesi + önerilen mesaj metni |
| **Kod** | [`src/analytics.js`](src/analytics.js) | [`src/segmentation.js`](src/segmentation.js) |

## Hızlı başlangıç

```bash
git clone https://github.com/nehiirarsln/-e-commerce-CRM-.git
cd -e-commerce-CRM-
npm install
npm start
```

`npm install` Electron'u indirir (ilk seferde ~100-200 MB). `npm start`
masaüstü penceresini açar, iki sekmeli bir dashboard karşılar.

## Mimari

```
┌──────────────────────┐        IPC         ┌───────────────────────┐
│   Renderer Process    │ <────────────────> │     Main Process       │
│  index.html / css /   │    preload.js      │   main.js (Node.js)    │
│     renderer.js       │   güvenli köprü    │                        │
└──────────────────────┘                     └────────────┬───────────┘
                                                            │
                                             ┌──────────────┴──────────────┐
                                             │                             │
                                    syntheticData.js              analytics.js
                                    (sentetik veri katmanı)       segmentation.js
                                                                  (Motor 1 & 2)
```

Renderer sürecinin Node.js'e veya dosya sistemine doğrudan erişimi yoktur
(`contextIsolation: true`) — tüm veri akışı `preload.js` üzerinden kontrollü
IPC ile geçer. Bu ayrım, ileride aynı arayüzü bir web sunucusuna bağlarken
(`main.js` yerine bir API endpoint'i) renderer katmanına hemen hiç
dokunmamayı mümkün kılar.

## Klasör yapısı

```
├── main.js              # Electron ana süreç — pencere + IPC handler
├── preload.js            # main <-> renderer güvenli köprüsü
├── index.html             # arayüz
├── renderer.js             # arayüz mantığı (grafik, tablo)
├── styles.css
└── src/
    ├── syntheticData.js    # sahte müşteri/sipariş verisi
    ├── analytics.js         # Motor 1
    └── segmentation.js      # Motor 2 + mesaj önerileri
```

## Segmentasyon kuralları

`src/segmentation.js` içinde tek bir objeden yönetiliyor, iş ihtiyacına göre
kolayca değiştirilebilir:

```js
const RULES = {
  oneTimeBuyerMinDaysAgo: 45,   // son siparişten bu yana kaç gün geçmiş olmalı
  loyalCustomerMinOrders: 4,    // en az kaç sipariş "sadık" sayılır
};
```

## Gerçek veriye geçiş

Sentetik veri katmanı tek bir noktadan değiştirilecek şekilde izole edildi —
`main.js` içindeki `get-dashboard-data` handler'ı:

```js
// şu an:
const dataset = generateSyntheticDataset({ customerCount: 250 });

// gerçek sisteme geçişte:
const dataset = await fetchCustomerDataFromApi();
```

`analytics.js` ve `segmentation.js`, veri şekli (`{ customers: [...] }`) aynı
kaldığı sürece hiç değişmeden çalışmaya devam eder.

## Bilinen sınırlamalar

- Veri sentetik; gerçek mağaza verisiyle henüz doğrulanmadı
- Mesaj gönderme şu an **simülasyon** — gerçek SMS/e-posta/WhatsApp entegrasyonu yok
- Web sürümüne taşıma henüz yapılmadı (renderer katmanı buna hazır tasarlandı)

## Yol haritası

- [ ] Gerçek sipariş verisine (CSV/API) bağlanma
- [ ] Gerçek mesaj gönderim entegrasyonu (SMS/e-posta)
- [ ] Web servisi olarak yeniden servis etme (Express/Next.js)
- [ ] Segmentasyon kurallarını arayüzden ayarlanabilir hale getirme
- [ ] Müşteri detay sayfası (sipariş geçmişi timeline'ı)

## Lisans

MIT
