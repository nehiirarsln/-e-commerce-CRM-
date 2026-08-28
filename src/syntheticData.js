// syntheticData.js — SAHTE VERI URETICI
// Gercek endpoint gelene kadar sistemin geri kalanini test edebilmek icin
// gercekci bir musteri + siparis veri seti uretir.
//
// ONEMLI: Bu dosya proje ilerledikce SILINECEK/DEVRE DISI KALACAK dosyadir.
// main.js icindeki tek bir satiri (generateSyntheticDataset cagrisini)
// gercek bir API/veritabani sorgusuyla degistirdiginizde tum sistem
// gercek veriyle calismaya baslar; analytics.js ve segmentation.js
// hic degismez, cunku onlar sadece "customers" dizisinin sekline bakar.

const PRODUCTS = [
  "Erkek T-Shirt",
  "Kadin Elbise",
  "Spor Ayakkabi",
  "Kot Pantolon",
  "Deri Ceket",
  "Kazak",
  "Sort",
  "Gomlek",
  "Etek",
  "Mont",
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

/**
 * customerCount kadar musteri uretir. Her musterinin gercekci bir
 * "davranis profili" vardir: bazilari tek sefer alisveris yapip gider,
 * bazilari duzenli/sadik musteridir. Bu, segmentation.js'in ayirt
 * edecegi seyin GERCEKTEN veride var olmasini saglar.
 */
function generateSyntheticDataset({ customerCount = 200 } = {}) {
  const today = new Date();
  const customers = [];

  for (let i = 1; i <= customerCount; i++) {
    // Musteri davranis profili: %35 tek seferlik, %40 ara sira, %25 sadik
    const roll = Math.random();
    let orderCount;
    let spreadDays; // siparislerin kac gunluk bir araliga yayildigi

    if (roll < 0.35) {
      orderCount = 1;
      spreadDays = 0;
    } else if (roll < 0.75) {
      orderCount = randomInt(2, 4);
      spreadDays = randomInt(60, 250);
    } else {
      orderCount = randomInt(5, 12);
      spreadDays = randomInt(90, 300);
    }

    const orders = [];
    for (let o = 0; o < orderCount; o++) {
      const daysAgo =
        orderCount === 1
          ? randomInt(1, 300)
          : Math.floor((spreadDays / orderCount) * o) + randomInt(0, 15);

      const orderDate = new Date(today);
      orderDate.setDate(orderDate.getDate() - daysAgo);

      const itemCount = randomInt(1, 3);
      const items = [];
      for (let k = 0; k < itemCount; k++) {
        items.push({
          product: randomChoice(PRODUCTS),
          price: randomInt(150, 1200),
        });
      }

      orders.push({
        date: orderDate.toISOString().slice(0, 10),
        daysAgo,
        items,
        total: items.reduce((sum, it) => sum + it.price, 0),
      });
    }

    // en yakin siparisin kac gun once oldugu (segmentasyon icin lazim)
    const lastOrderDaysAgo = Math.min(...orders.map((o) => o.daysAgo));

    customers.push({
      id: `M-${1000 + i}`,
      name: `Musteri ${i}`,
      orders,
      lastOrderDaysAgo,
      totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
    });
  }

  return { customers, generatedAt: today.toISOString() };
}

module.exports = { generateSyntheticDataset, PRODUCTS };
