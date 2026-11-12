const cartDrawer = document.querySelector("#cart-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const toast = document.querySelector("#toast");
const whatsappNumber = "2348133666348";
const products = [
  { id: "black-soap", name: "Homemade Black Soap", category: "soaps", price: 5000, image: "assets/mahmah-homemade-black-soap.jpeg" },
  { id: "body-scrub", name: "Body Scrub", category: "body-care", price: 5000, image: "assets/mahmah-body-scrub.jpeg" },
];
const deliveryZones = {
  kaduna: { name: "Kaduna State (all areas, including Zaria)", fee: 1000 },
  kano: { name: "Kano State", fee: 1500 },
  katsina: { name: "Katsina State", fee: 2500 },
  abuja: { name: "Abuja (FCT)", fee: 2000 },
};
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("mahmah-cart") || "[]");
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

function saveCart() {
  try {
    localStorage.setItem("mahmah-cart", JSON.stringify(cart));
  } catch {
    showToast("Your bag is available for this visit, but could not be saved on this device.");
  }
}

let cart = loadCart();
let deliveryZone = "";
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function formatNaira(amount) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function openWhatsApp(message) {
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function cartSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function selectedDelivery() {
  return deliveryZones[deliveryZone] || null;
}

function orderMessage() {
  const lines = cart.map((item) => `• ${item.name} × ${item.quantity} — ${formatNaira(item.price * item.quantity)}`);
  const delivery = selectedDelivery();
  const subtotal = cartSubtotal();
  return `Hello MahMah Naturals, I’d like to confirm this order:\n${lines.join("\n")}\nDelivery location: ${delivery.name}\nSubtotal: ${formatNaira(subtotal)}\nDelivery fee: ${formatNaira(delivery.fee)}\nEstimated total: ${formatNaira(subtotal + delivery.fee)}\n\nPlease confirm product availability. My full delivery address (area/LGA, street and landmark) is: `;
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartSubtotal();
  const delivery = selectedDelivery();
  document.querySelector("#cart-count").textContent = count;
  document.querySelector("#drawer-cart-count").textContent = `(${count})`;
  document.querySelector("#cart-subtotal").textContent = formatNaira(subtotal);
  document.querySelector("#cart-delivery").textContent = count && delivery ? formatNaira(delivery.fee) : "Choose a location";
  document.querySelector("#cart-total").textContent = formatNaira(subtotal + (count && delivery ? delivery.fee : 0));
  document.querySelector("#cart-items").innerHTML = cart.map((item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="" />
      <div class="cart-item-copy"><strong>${item.name}</strong><span>${formatNaira(item.price)}</span>
        <div class="quantity-control"><button type="button" data-quantity="-1" data-item-id="${item.id}" aria-label="Remove one ${item.name}">−</button><span>${item.quantity}</span><button type="button" data-quantity="1" data-item-id="${item.id}" aria-label="Add one ${item.name}">＋</button></div>
      </div>
      <button class="remove-item" type="button" data-remove="${item.id}" aria-label="Remove ${item.name}">×</button>
    </div>`).join("");
  document.querySelector(".drawer-empty").hidden = count > 0;
  document.querySelector("#cart-items").hidden = count === 0;
  localStorage.setItem("mahmah-cart", JSON.stringify(cart));
}

function openCart() {
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartDrawer.inert = false;
  drawerBackdrop.hidden = false;
  requestAnimationFrame(() => drawerBackdrop.classList.add("is-open"));
  document.body.classList.add("drawer-open");
  document.querySelector("#close-cart").focus();
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartDrawer.inert = true;
  drawerBackdrop.classList.remove("is-open");
  document.body.classList.remove("drawer-open");
  window.setTimeout(() => { drawerBackdrop.hidden = true; }, 260);
  document.querySelector("#open-cart").focus();
}

document.querySelector("#open-cart").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
document.querySelector("#continue-shopping").addEventListener("click", closeCart);
drawerBackdrop.addEventListener("click", closeCart);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) closeCart();
});

document.querySelectorAll(".chat-trigger").forEach((button) => {
  button.addEventListener("click", () => openWhatsApp("Hello MahMah Naturals, I’d like to ask about your products and availability."));
});

document.querySelector("#checkout-button").addEventListener("click", () => {
  if (!cart.length) {
    showToast("Add a product to your bag first.");
    return;
  }
  if (!selectedDelivery()) {
    showToast("Choose an available delivery location first.");
    document.querySelector("#delivery-zone").focus();
    return;
  }
  openWhatsApp(orderMessage());
});

document.querySelector("#delivery-zone").addEventListener("change", (event) => {
  deliveryZone = event.target.value;
  renderCart();
});

document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
  button.addEventListener("click", () => {
    const product = products.find((item) => item.id === button.dataset.addToCart);
    const existing = cart.find((item) => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    renderCart();
    showToast(`${product.name} added to your bag.`);
  });
});

document.querySelector("#cart-items").addEventListener("click", (event) => {
  const removeId = event.target.dataset.remove;
  const quantityChange = Number(event.target.dataset.quantity);
  if (removeId) cart = cart.filter((item) => item.id !== removeId);
  else if (quantityChange) {
    const itemId = event.target.dataset.itemId;
    const item = cart.find((entry) => entry.id === itemId);
    if (item) item.quantity += quantityChange;
    cart = cart.filter((entry) => entry.quantity > 0);
  } else return;
  renderCart();
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((chip) => chip.classList.remove("is-active"));
    button.classList.add("is-active");
    updateProducts();
  });
});

document.querySelectorAll("[data-category-link]").forEach((link) => {
  link.addEventListener("click", () => {
    const category = link.dataset.categoryLink;
    document.querySelectorAll("[data-filter]").forEach((chip) => chip.classList.toggle("is-active", chip.dataset.filter === category));
    updateProducts();
  });
});

function updateProducts() {
  const activeFilter = document.querySelector(".filter-chip.is-active")?.dataset.filter || "all";
  const query = document.querySelector("#product-search").value.trim().toLowerCase();
  const matches = products.filter((product) => (activeFilter === "all" || product.category === activeFilter) && `${product.name} ${product.category} mahmah`.toLowerCase().includes(query));
  document.querySelectorAll("[data-product-card]").forEach((card) => {
    const text = `${card.dataset.name} ${card.dataset.category} mahmah`.toLowerCase();
    card.hidden = !(text.includes(query) && (activeFilter === "all" || card.dataset.category === activeFilter));
  });
  document.querySelector("#results-count").textContent = matches.length ? `${matches.length} ${matches.length === 1 ? "product" : "products"}` : "No products found";
  const grid = document.querySelector("#product-grid");
  let empty = grid.querySelector(".no-results");
  if (!matches.length && !empty) {
    empty = document.createElement("p");
    empty.className = "no-results";
    empty.textContent = "No products match this search yet.";
    grid.append(empty);
  } else if (matches.length && empty) empty.remove();
}

document.querySelector("#product-search").addEventListener("input", updateProducts);
document.querySelector("#year").textContent = new Date().getFullYear();
renderCart();
