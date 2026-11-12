"use strict";

function restoreCart(savedValue, products) {
  try {
    const saved = JSON.parse(savedValue || "[]");
    if (!Array.isArray(saved)) return [];

    return saved
      .filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry))
      .map((entry) => {
        const product = products.find((item) => item.id === entry.id);
        const quantity = entry.quantity;
        if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null;
        return { ...product, quantity };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { restoreCart };
} else {
  window.MahMahCartStorage = { restoreCart };
}
