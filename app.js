const cartDrawer = document.querySelector("#cart-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const toast = document.querySelector("#toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
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
  button.addEventListener("click", () => {
    showToast("The shop owner’s WhatsApp contact will be added here before launch.");
  });
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((chip) => chip.classList.remove("is-active"));
    button.classList.add("is-active");
    const category = button.dataset.filter;
    const label = category === "all" ? "the full collection" : category.replace("-", " ");
    showToast(`The ${label} collection will appear here once products are added.`);
  });
});

document.querySelectorAll("[data-category-link]").forEach((link) => {
  link.addEventListener("click", () => {
    const category = link.dataset.categoryLink;
    document.querySelectorAll("[data-filter]").forEach((chip) => {
      const isActive = chip.dataset.filter === category;
      chip.classList.toggle("is-active", isActive);
    });
  });
});

document.querySelector("#product-search").addEventListener("input", (event) => {
  const hasQuery = event.currentTarget.value.trim().length > 0;
  document.querySelector("#results-count").textContent = hasQuery ? "No products to match yet" : "Collection coming soon";
  if (hasQuery) {
    document.querySelector("#product-grid h3").textContent = "We haven’t added products yet.";
    document.querySelector("#product-grid > p:not(.eyebrow)").textContent = "Try again when the MahMah Naturals collection is ready, or ask the owner about a product.";
  } else {
    document.querySelector("#product-grid h3").textContent = "We’re getting the shelves ready.";
    document.querySelector("#product-grid > p:not(.eyebrow)").textContent = "Product names, photos, sizes, and prices will appear here as the collection is added.";
  }
});

document.querySelector("#year").textContent = new Date().getFullYear();
