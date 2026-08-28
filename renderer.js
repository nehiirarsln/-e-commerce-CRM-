// renderer.js — RENDERER PROCESS (arayuz tarafi)
// Burasi neredeyse SIRADAN BIR WEB SAYFASI JS'I gibi calisir.
// Node.js'e dogrudan erisimi yoktur — sadece preload.js'in actigi
// window.api.getDashboardData() fonksiyonunu cagirabilir.
//
// ONEMLI: Web sürümüne geçtiğinizde bu dosyanın büyük kısmı AYNEN kalır.
// Tek fark: window.api.getDashboardData() yerine
// fetch('/api/dashboard').then(r => r.json()) gibi bir cagri koyarsiniz.

function formatCurrency(n) {
  return n.toLocaleString("tr-TR") + " TL";
}

async function loadDashboard() {
  const { analytics, segments } = await window.api.getDashboardData();
  renderKpis(analytics);
  renderPercentileChart(analytics);
  renderFrequencyChart(analytics);
  renderProductTable(analytics);
  renderSegments(segments);
}

// ---------- MOTOR 1: ANALIZ PANELI ----------

function renderKpis(analytics) {
  document.getElementById("kpi-total-customers").textContent =
    analytics.totalCustomers;
  document.getElementById("kpi-total-revenue").textContent = formatCurrency(
    analytics.totalRevenue
  );
  document.getElementById("kpi-avg-spent").textContent = formatCurrency(
    analytics.avgSpentPerCustomer
  );
}

function renderPercentileChart(analytics) {
  const ctx = document.getElementById("chart-percentiles");
  const p = analytics.spendingPercentiles;
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["P25", "P50 (medyan)", "P75", "P90"],
      datasets: [
        {
          label: "Musteri harcamasi (TL)",
          data: [p.p25, p.p50, p.p75, p.p90],
          backgroundColor: "#873850",
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  });
}

function renderFrequencyChart(analytics) {
  const ctx = document.getElementById("chart-frequency");
  const entries = Object.entries(analytics.orderCountFrequency).sort(
    (a, b) => Number(a[0]) - Number(b[0])
  );
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: entries.map(([orderCount]) => `${orderCount} siparis`),
      datasets: [
        {
          label: "Musteri sayisi",
          data: entries.map(([, count]) => count),
          backgroundColor: "#e89785",
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  });
}

function renderProductTable(analytics) {
  const tbody = document.querySelector("#table-products tbody");
  tbody.innerHTML = "";
  analytics.topProducts.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.product}</td>
      <td>${p.totalBuyers}</td>
      <td>${p.repeatBuyers}</td>
      <td>%${p.repeatRatePct}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ---------- MOTOR 2: SEGMENTASYON ----------

function renderSegments(segments) {
  document.getElementById("badge-onetime").textContent =
    segments.oneTimeBuyers.length;
  document.getElementById("badge-loyal").textContent =
    segments.loyalCustomers.length;

  const oneTimeBody = document.querySelector("#table-onetime tbody");
  oneTimeBody.innerHTML = "";
  segments.oneTimeBuyers.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>${c.lastOrderDaysAgo} gun once</td>
      <td>${formatCurrency(c.totalSpent)}</td>
      <td>${c.suggestedMessage}</td>
    `;
    oneTimeBody.appendChild(tr);
  });

  const loyalBody = document.querySelector("#table-loyal tbody");
  loyalBody.innerHTML = "";
  segments.loyalCustomers.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>${c.orderCount}</td>
      <td>${formatCurrency(c.totalSpent)}</td>
      <td>${c.suggestedMessage}</td>
    `;
    loyalBody.appendChild(tr);
  });
}

// ---------- SEKME (TAB) GECISLERI ----------

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((s) => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// ---------- MESAJ GONDERME SIMULASYONU ----------
// Gercek sisteme baglaninca burasi SMS/e-posta/WhatsApp API cagrisi
// yapan gercek bir fonksiyona donusecek. Simdilik sadece ekrana yaziyor.

document.getElementById("btn-send-onetime").addEventListener("click", () => {
  const result = document.getElementById("send-result");
  result.textContent =
    "Simulasyon: tek seferlik musterilere geri kazanma mesaji 'gonderildi'.";
});

document.getElementById("btn-send-loyal").addEventListener("click", () => {
  const result = document.getElementById("send-result");
  result.textContent =
    "Simulasyon: sadik musterilere indirim mesaji 'gonderildi'.";
});

loadDashboard();
