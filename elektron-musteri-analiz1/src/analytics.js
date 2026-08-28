// analytics.js — MOTOR 1: ANALIZ / RAPORLAMA
// Girdi: syntheticData.js'in urettigi (veya ileride gercek API'nin
// donecegi) AYNI SEKILDEKI { customers: [...] } verisi.
// Cikti: arayuzun dogrudan grafik/tabloya basabilecegi hazir sayilar.
//
// Bu dosyanin veri kaynagi hakkinda HICBIR FIKRI yoktur (sentetik mi
// gercek mi bilmez) — bu yuzden endpoint degisince bu dosyaya dokunmazsiniz.

function percentile(sortedArr, p) {
  if (sortedArr.length === 0) return 0;
  const idx = (p / 100) * (sortedArr.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sortedArr[lower];
  const weight = idx - lower;
  return sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight;
}

function computeAnalytics({ customers }) {
  const totalCustomers = customers.length;

  // --- 1) Harcama yuzdelik dilimleri (P25 / P50 / P75 / P90) ---
  const spendSorted = customers.map((c) => c.totalSpent).sort((a, b) => a - b);
  const spendingPercentiles = {
    p25: Math.round(percentile(spendSorted, 25)),
    p50: Math.round(percentile(spendSorted, 50)),
    p75: Math.round(percentile(spendSorted, 75)),
    p90: Math.round(percentile(spendSorted, 90)),
  };

  // --- 2) Siparis siklik dagilimi (kac musterinin kac siparisi var) ---
  const orderCountFrequency = {}; // { 1: 87, 2: 40, 3: 22, ... }
  customers.forEach((c) => {
    const n = c.orders.length;
    orderCountFrequency[n] = (orderCountFrequency[n] || 0) + 1;
  });

  // --- 3) Urun bazinda: kac musteri o urunu birden fazla kez almis ---
  // productRepeatCounts: { "Kot Pantolon": { totalBuyers: 40, repeatBuyers: 12 } }
  const productStats = {};
  customers.forEach((c) => {
    const perCustomerProductCount = {};
    c.orders.forEach((o) =>
      o.items.forEach((it) => {
        perCustomerProductCount[it.product] =
          (perCustomerProductCount[it.product] || 0) + 1;
      })
    );
    Object.entries(perCustomerProductCount).forEach(([product, count]) => {
      if (!productStats[product]) {
        productStats[product] = { totalBuyers: 0, repeatBuyers: 0 };
      }
      productStats[product].totalBuyers += 1;
      if (count > 1) productStats[product].repeatBuyers += 1;
    });
  });

  const topProducts = Object.entries(productStats)
    .map(([product, s]) => ({
      product,
      totalBuyers: s.totalBuyers,
      repeatBuyers: s.repeatBuyers,
      repeatRatePct: Math.round((s.repeatBuyers / s.totalBuyers) * 100),
    }))
    .sort((a, b) => b.totalBuyers - a.totalBuyers);

  // --- 4) Genel ozet ---
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return {
    totalCustomers,
    totalRevenue,
    avgSpentPerCustomer: Math.round(totalRevenue / totalCustomers),
    spendingPercentiles,
    orderCountFrequency,
    topProducts,
  };
}

module.exports = { computeAnalytics };
