const cartDrawer = document.querySelector("#cart-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const toast = document.querySelector("#toast");
const whatsappNumber = "2348133666348";
let products = [
  // Catalogue prices are estimates; the shop owner confirms stock on WhatsApp.
  { id: "black-soap", name: "Homemade Black Soap", category: "soaps", price: 5000, image: "assets/mahmah-homemade-black-soap.jpeg", description: "A handmade black soap from MahMah Naturals.", status: "available" },
  { id: "shea-black-soap", name: "Shea Black Soap", category: "soaps", price: 6000, image: "", description: "A black soap option for your everyday cleansing routine.", status: "unavailable" },
  { id: "herbal-black-soap", name: "Herbal Black Soap", category: "soaps", price: 6000, image: "", description: "A herbal-inspired soap option. Ask the owner about its ingredients.", status: "unavailable" },
  { id: "black-soap-large", name: "Homemade Black Soap — Large", category: "soaps", price: 8500, image: "", description: "A larger-size option for your routine.", status: "unavailable" },
  { id: "body-scrub", name: "Body Scrub", category: "body-care", price: 5000, image: "assets/mahmah-body-scrub.jpeg", description: "A handmade body scrub from MahMah Naturals.", status: "available" },
  { id: "body-lotion", name: "Body Lotion", category: "body-care", price: 6000, image: "", description: "An everyday body-care option. Ask the owner about available variants.", status: "unavailable" },
  { id: "body-butter", name: "Body Butter", category: "body-care", price: 6000, image: "", description: "A rich-feel body moisturising option.", status: "unavailable" },
  { id: "body-scrub-large", name: "Body Scrub — Large", category: "body-care", price: 8500, image: "", description: "A larger-size body scrub option.", status: "unavailable" },
  { id: "face-cleanser", name: "Gentle Face Cleanser", category: "skincare", price: 6000, image: "", description: "A gentle daily face-cleansing option. Ask the owner about its ingredients and suitability.", status: "unavailable" },
  { id: "face-moisturiser", name: "Face Moisturiser", category: "skincare", price: 6000, image: "", description: "An everyday facial moisturising option.", status: "unavailable" },
  { id: "face-toner", name: "Facial Toner", category: "skincare", price: 6000, image: "", description: "A facial-care option to ask the owner about before adding to your routine.", status: "unavailable" },
  { id: "face-serum", name: "Face Serum", category: "skincare", price: 8500, image: "", description: "A facial-care product listing. Ask the owner about ingredients and use.", status: "unavailable" },
  { id: "face-oil", name: "Nourishing Face Oil", category: "oils", price: 6000, image: "", description: "A facial oil option. Ask the owner about its ingredients and intended use.", status: "unavailable" },
  { id: "body-oil", name: "Body Oil", category: "oils", price: 6000, image: "", description: "An oil option for your body-care routine.", status: "unavailable" },
  { id: "shea-oil", name: "Shea Oil", category: "oils", price: 6000, image: "", description: "A shea-based oil listing. Confirm ingredients with the owner.", status: "unavailable" },
  { id: "body-oil-large", name: "Body Oil — Large", category: "oils", price: 8500, image: "", description: "A larger-size body oil option.", status: "unavailable" },
];
const deliveryZones = {
  kaduna: { name: "Kaduna State (all areas, including Zaria)", fee: 1000 },
  kano: { name: "Kano State", fee: 1500 },
  katsina: { name: "Katsina State", fee: 2500 },
  abuja: { name: "Abuja (FCT)", fee: 2000 },
};
function loadCart() {
  try {
    return window.MahMahCartStorage.restoreCart(localStorage.getItem("mahmah-cart"), products);
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
  const customerName = document.querySelector("#customer-name").value.trim();
  const customerPhone = document.querySelector("#customer-phone").value.trim();
  const deliveryAddress = document.querySelector("#delivery-address").value.trim();
  const orderNote = document.querySelector("#order-note").value.trim();
  return `Hello MahMah Naturals, I’d like to confirm this order:\n\nCustomer name: ${customerName}\nPhone number: ${customerPhone}\n\nORDER ITEMS\n${lines.join("\n")}\n\nDelivery location: ${delivery.name}\nDelivery address: ${deliveryAddress}\nSubtotal: ${formatNaira(subtotal)}\nDelivery fee: ${formatNaira(delivery.fee)}\nEstimated total: ${formatNaira(subtotal + delivery.fee)}\n${orderNote ? `\nAdditional note: ${orderNote}\n` : ""}\nPlease confirm product availability and the final order total before I proceed with payment.`;
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
  try {
    localStorage.setItem("mahmah-cart", JSON.stringify(cart));
  } catch {
    showToast("Your bag is available for this visit, but could not be saved on this device.");
  }
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
function getDrawerFocusableElements() {
  const selector = 'a[href], area[href], input:not([type="hidden"]), select, textarea, button, iframe, object, embed, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';
  return [...cartDrawer.querySelectorAll(selector)].filter((element) =>
    !element.disabled &&
    !element.hidden &&
    element.getAttribute("aria-hidden") !== "true" &&
    element.getClientRects().length > 0
  );
}

document.addEventListener("keydown", (event) => {
  if (!cartDrawer.classList.contains("is-open")) return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeCart();
    return;
  }

  if (event.key !== "Tab") return;

  const focusableElements = getDrawerFocusableElements();
  if (!focusableElements.length) {
    event.preventDefault();
    cartDrawer.focus();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const focusIsInsideDrawer = cartDrawer.contains(document.activeElement);

  if (event.shiftKey && (!focusIsInsideDrawer || document.activeElement === firstElement)) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && (!focusIsInsideDrawer || document.activeElement === lastElement)) {
    event.preventDefault();
    firstElement.focus();
  }
});

document.querySelectorAll(".chat-trigger").forEach((button) => {
  button.addEventListener("click", () => openWhatsApp("Hello MahMah Naturals, I’d like to ask about your products and availability."));
});

async function saveOrderToDashboard() {
  const config = window.MAHMAH_SUPABASE_CONFIG;
  if (!config?.url || !config?.anonKey || !window.supabase?.createClient) {
    return { saved: false, reason: "Order database is not configured yet." };
  }
  const client = window.supabase.createClient(config.url, config.anonKey);
  const delivery = selectedDelivery();
  const { error } = await client.from("orders").insert({
    customer_name: document.querySelector("#customer-name").value.trim(),
    customer_phone: document.querySelector("#customer-phone").value.trim(),
    delivery_zone: deliveryZone,
    delivery_address: document.querySelector("#delivery-address").value.trim(),
    items: cart.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit_price: Number(item.price),
      line_total: Number(item.price) * item.quantity
    })),
    subtotal: cartSubtotal(),
    delivery_fee: delivery.fee,
    total: cartSubtotal() + delivery.fee,
    note: document.querySelector("#order-note").value.trim(),
    status: "pending"
  });
  if (error) return { saved: false, reason: error.message };
  return { saved: true };
}

document.querySelector("#checkout-button").addEventListener("click", async () => {
  if (!cart.length) {
    showToast("Add a product to your bag first.");
    return;
  }
  const customerName = document.querySelector("#customer-name");
  const customerPhone = document.querySelector("#customer-phone");
  const deliveryAddress = document.querySelector("#delivery-address");
  if (customerName.value.trim().length < 2) {
    showToast("Enter the customer's full name.");
    customerName.focus();
    return;
  }
  const phoneDigits = customerPhone.value.replace(/\\D/g, "");
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    showToast("Enter a valid phone number, including the country code if needed.");
    customerPhone.focus();
    return;
  }
  if (!selectedDelivery()) {
    showToast("Choose an available delivery location first.");
    document.querySelector("#delivery-zone").focus();
    return;
  }
  if (deliveryAddress.value.trim().length < 8) {
    showToast("Enter a delivery address with an area and a useful landmark.");
    deliveryAddress.focus();
    return;
  }
  openWhatsApp(orderMessage());
  const result = await saveOrderToDashboard();
  if (result.saved) showToast("Order sent to WhatsApp and saved for the owner.");
  else showToast("WhatsApp opened. The order was not saved to the dashboard: " + result.reason);
});

document.querySelector("#delivery-zone").addEventListener("change", (event) => {
  deliveryZone = event.target.value;
  renderCart();
});

document.querySelector("#product-grid").addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-to-cart]");
  const enquireButton = event.target.closest("[data-enquire-product]");
  if (addButton) {
    const product = products.find((item) => item.id === addButton.dataset.addToCart && item.status === "available");
    if (!product) return;
    const existing = cart.find((item) => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    renderCart();
    showToast(product.name + " added to your bag.");
  } else if (enquireButton) {
    const product = products.find((item) => item.id === enquireButton.dataset.enquireProduct);
    if (product) openWhatsApp("Hello MahMah Naturals, please let me know whether " + product.name + " is available and its current price.");
  }
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

function renderProducts() {
  const activeFilter = document.querySelector(".filter-chip.is-active")?.dataset.filter || "all";
  const query = document.querySelector("#product-search").value.trim().toLowerCase();
  const sort = document.querySelector("#sort-products").value;
  let matches = products.filter((product) =>
    (activeFilter === "all" || product.category === activeFilter) &&
    (product.name + " " + product.category + " mahmah " + product.description).toLowerCase().includes(query)
  );

  if (sort === "name-asc") matches.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "price-asc") matches.sort((a, b) => (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY));
  if (sort === "price-desc") matches.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));

  const grid = document.querySelector("#product-grid");
  grid.replaceChildren();
  matches.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.productCard = "";
    card.dataset.category = product.category;
    card.dataset.name = product.name;

    const imageWrap = document.createElement("div");
    imageWrap.className = "product-image-wrap";
    if (product.image) {
      const image = document.createElement("img");
      image.className = "product-image";
      image.src = product.image;
      image.alt = product.name;
      imageWrap.append(image);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "product-placeholder placeholder-" + product.category;
      placeholder.setAttribute("aria-hidden", "true");
      placeholder.textContent = product.category === "skincare" ? "SKINCARE" : product.category === "oils" ? "NATURAL OILS" : "BODY CARE";
      imageWrap.append(placeholder);
    }

    const tag = document.createElement("span");
    tag.className = "product-tag";
    tag.textContent = product.status === "available" ? "CHECK STOCK ON WHATSAPP" : "CURRENTLY UNAVAILABLE";
    imageWrap.append(tag);

    const info = document.createElement("div");
    info.className = "product-info";
    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = product.category.replace("-", " ").toUpperCase();
    const name = document.createElement("h3");
    name.textContent = product.name;
    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = product.description;
    const buyRow = document.createElement("div");
    buyRow.className = "product-buy-row";
    const price = document.createElement("strong");
    price.textContent = formatNaira(product.price);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button button-dark add-to-cart";
    button.dataset.addToCart = product.id;
    button.textContent = product.status === "available" ? "Add to bag ＋" : "Unavailable";
    button.disabled = product.status !== "available";
    buyRow.append(price, button);
    info.append(category, name, description, buyRow);
    card.append(imageWrap, info);
    grid.append(card);
  });

  document.querySelector("#results-count").textContent = matches.length + " " + (matches.length === 1 ? "product" : "products");
  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "no-results";
    empty.textContent = "No products match this search yet.";
    grid.append(empty);
  }
}

function updateProducts() {
  renderProducts();
}
document.querySelector("#product-search").addEventListener("input", updateProducts);
document.querySelector("#sort-products").addEventListener("change", updateProducts);
document.querySelector("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();

async function loadSharedCatalogue() {
  const config = window.MAHMAH_SUPABASE_CONFIG;
  if (!config?.url || !config?.anonKey || !window.supabase?.createClient) return;
  try {
    const client = window.supabase.createClient(config.url, config.anonKey);
    const { data, error } = await client.from("products").select("id,name,category,price,description,image,status,sort_order").order("sort_order");
    if (error) throw error;
    if (Array.isArray(data)) {
      products = data.map((item) => ({
        id: item.id, name: item.name, category: item.category,
        price: Number(item.price), description: item.description || "",
        image: item.image || "", status: item.status || "unavailable"
      }));
      cart = cart.filter((entry) => products.some((product) => product.id === entry.id && product.status === "available"));
      renderProducts();
      renderCart();
    }
  } catch (error) {
    console.error("Shared catalogue could not be loaded; using the bundled catalogue.", error);
  }
}
loadSharedCatalogue();
