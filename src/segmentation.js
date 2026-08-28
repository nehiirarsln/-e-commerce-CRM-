// segmentation.js — MOTOR 2: MUSTERI SEGMENTASYONU + MESAJ LISTELERI
// Bu motor musterileri iki gruba ayirir ve her grup icin ONERILEN
// mesaj metnini uretir. Gercek gonderim (SMS/e-posta/WhatsApp API'si)
// bu asamada YOK — o, gercek endpoint baglanma asamasinda eklenecek
// ayri bir "gonderim" katmanidir. Burada sadece KIMLERE, NE mesaji
// gidecek onu belirliyoruz.

// Kurallar disaridan degistirilebilir olsun diye sabit tanimliyoruz.
const RULES = {
  // Tek siparisi olan VE son siparisinin uzerinden bu kadar gun gecmis
  // olan musteri "kaybedilmis/tek seferlik" sayilir.
  oneTimeBuyerMinDaysAgo: 45,

  // Bu kadar veya daha fazla siparisi olan musteri "sadik/surekli" sayilir.
  loyalCustomerMinOrders: 4,
};

function segmentCustomers({ customers }) {
  const oneTimeBuyers = [];
  const loyalCustomers = [];
  const others = []; // henuz net bir gruba girmeyen (ornegin 2-3 siparisi olan, yeni musteri vb.)

  customers.forEach((c) => {
    const orderCount = c.orders.length;

    const isOneTime =
      orderCount === 1 && c.lastOrderDaysAgo >= RULES.oneTimeBuyerMinDaysAgo;

    const isLoyal = orderCount >= RULES.loyalCustomerMinOrders;

    if (isOneTime) {
      oneTimeBuyers.push({
        id: c.id,
        name: c.name,
        lastOrderDaysAgo: c.lastOrderDaysAgo,
        totalSpent: c.totalSpent,
        suggestedMessage: `Merhaba ${c.name}, sizi bir suredir aramizda gormedik! Sizi tekrar agirlamaktan mutluluk duyariz.`,
      });
    } else if (isLoyal) {
      loyalCustomers.push({
        id: c.id,
        name: c.name,
        orderCount,
        totalSpent: c.totalSpent,
        suggestedMessage: `Merhaba ${c.name}, sadik musterimiz oldugunuz icin tesekkur ederiz! Size ozel indirim kodunuz: SADIK10`,
      });
    } else {
      others.push({ id: c.id, name: c.name, orderCount });
    }
  });

  return {
    rules: RULES,
    oneTimeBuyers,
    loyalCustomers,
    othersCount: others.length,
  };
}

module.exports = { segmentCustomers };
