"use strict";
const config = window.MAHMAH_SUPABASE_CONFIG;
const message = document.querySelector("#admin-message");
const loginPanel = document.querySelector("#login-panel");
const workspace = document.querySelector("#workspace");
let client;
let catalogue = [];

function notify(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("is-error", isError);
}
function configured() {
  return config?.url && config?.anonKey && window.supabase?.createClient;
}
function resetForm() {
  document.querySelector("#product-form").reset();
  document.querySelector("#product-id").value = "";
  document.querySelector("#editor-title").textContent = "Add a product";
}
function safeText(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}
function renderCatalogue() {
  const list = document.querySelector("#admin-product-list");
  list.replaceChildren();
  document.querySelector("#product-total").textContent = catalogue.length + " products";
  catalogue.forEach((product) => {
    const row = document.createElement("article");
    row.className = "admin-product-row";
    const details = document.createElement("div");
    details.append(safeText("strong", product.name), safeText("span", product.category.replace("-", " ") + " · ₦" + Number(product.price).toLocaleString("en-NG")));
    const status = safeText("span", product.status === "available" ? "Available" : "Unavailable", "admin-status " + product.status);
    const actions = document.createElement("div");
    actions.className = "admin-row-actions";
    const edit = safeText("button", "Edit", "button button-outline");
    edit.type = "button";
    edit.addEventListener("click", () => {
      document.querySelector("#product-id").value = product.id;
      document.querySelector("#product-name").value = product.name;
      document.querySelector("#product-category").value = product.category;
      document.querySelector("#product-price").value = product.price;
      document.querySelector("#product-image").value = product.image || "";
      document.querySelector("#product-description").value = product.description || "";
      document.querySelector("#product-status").value = product.status;
      document.querySelector("#editor-title").textContent = "Edit product";
      document.querySelector("#product-name").focus();
    });
    const toggle = safeText("button", product.status === "available" ? "Mark unavailable" : "Mark available", "button button-outline");
    toggle.type = "button";
    toggle.addEventListener("click", () => saveProduct({ ...product, status: product.status === "available" ? "unavailable" : "available" }));
    const remove = safeText("button", "Delete", "button button-danger");
    remove.type = "button";
    remove.addEventListener("click", async () => {
      if (!window.confirm("Delete " + product.name + " from the catalogue?")) return;
      const { error } = await client.from("products").delete().eq("id", product.id);
      if (error) notify(error.message, true);
      else { notify("Product deleted."); await loadCatalogue(); resetForm(); }
    });
    actions.append(edit, toggle, remove);
    row.append(details, status, actions);
    list.append(row);
  });
}
async function loadCatalogue() {
  const { data, error } = await client.from("products").select("*").order("sort_order");
  if (error) { notify(error.message, true); return; }
  catalogue = data || [];
  renderCatalogue();
}
async function saveProduct(overrides) {
  const product = overrides || {
    id: document.querySelector("#product-id").value.trim() || crypto.randomUUID(),
    name: document.querySelector("#product-name").value.trim(),
    category: document.querySelector("#product-category").value,
    price: Number(document.querySelector("#product-price").value),
    image: document.querySelector("#product-image").value.trim(),
    description: document.querySelector("#product-description").value.trim(),
    status: document.querySelector("#product-status").value,
    sort_order: catalogue.length + 1
  };
  if (!product.name || !Number.isSafeInteger(Number(product.price)) || Number(product.price) < 1) {
    notify("Enter a product name and a valid whole-number price.", true); return;
  }
  const { error } = await client.from("products").upsert(product);
  if (error) { notify(error.message, true); return; }
  notify("Product saved to the shared storefront.");
  resetForm();
  await loadCatalogue();
  await loadOrders();
}
document.querySelector("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!configured()) { notify("Connect Supabase first by completing supabase-config.js.", true); return; }
  client ||= window.supabase.createClient(config.url, config.anonKey);
  const { error } = await client.auth.signInWithPassword({
    email: document.querySelector("#login-email").value.trim(),
    password: document.querySelector("#login-password").value
  });
  if (error) { notify(error.message, true); return; }
  await showWorkspace();
});
async function showWorkspace() {
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user) return;
  const { data: membership, error: membershipError } = await client
    .from("store_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (membershipError || !membership) {
    await client.auth.signOut();
    workspace.hidden = true;
    loginPanel.hidden = false;
    notify("This account is not authorised to manage the store. Contact the store owner.", true);
    return;
  }
  loginPanel.hidden = true;
  workspace.hidden = false;
  document.querySelector("#session-label").textContent = "Signed in as " + user.email;
  await loadCatalogue();
}
document.querySelector("#sign-out").addEventListener("click", async () => {
  await client.auth.signOut();
  workspace.hidden = true;
  loginPanel.hidden = false;
  notify("You have signed out.");
});
document.querySelector("#product-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  await saveProduct();
});
document.querySelector("#cancel-edit").addEventListener("click", resetForm);
if (!configured()) notify("Dashboard setup required: configure the Supabase project before signing in.");
else {
  client = window.supabase.createClient(config.url, config.anonKey);
  client.auth.getSession().then(({ data }) => { if (data.session) showWorkspace(); });
}


const ORDER_STATUSES = ["pending", "confirmed", "processing", "dispatched", "delivered", "cancelled"];
function formatOrderDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}
function renderOrders(orders) {
  const list = document.querySelector("#admin-order-list");
  list.replaceChildren();
  const filter = document.querySelector("#order-status-filter").value;
  const visible = filter === "all" ? orders : orders.filter((order) => order.status === filter);
  if (!visible.length) {
    list.append(safeText("p", "No orders to show for this filter.", "admin-hint"));
    return;
  }
  visible.forEach((order) => {
    const card = document.createElement("article");
    card.className = "admin-order-card";
    const heading = document.createElement("div");
    heading.className = "admin-order-heading";
    const title = document.createElement("div");
    title.append(
      safeText("strong", "Order " + order.id.slice(0, 8).toUpperCase()),
      safeText("span", formatOrderDate(order.created_at))
    );
    const status = document.createElement("span");
    status.className = "admin-status " + order.status;
    status.textContent = order.status.charAt(0).toUpperCase() + order.status.slice(1);
    heading.append(title, status);
    const customer = document.createElement("div");
    customer.className = "admin-order-customer";
    customer.append(
      safeText("strong", order.customer_name),
      safeText("span", order.customer_phone),
      safeText("span", order.delivery_zone.toUpperCase() + " · " + order.delivery_address)
    );
    const items = document.createElement("ul");
    items.className = "admin-order-items";
    (Array.isArray(order.items) ? order.items : []).forEach((item) => {
      items.append(safeText("li", String(item.name || "Product") + " × " + Number(item.quantity || 0) + " — ₦" + Number(item.line_total || 0).toLocaleString("en-NG")));
    });
    const totals = safeText("p", "Subtotal ₦" + Number(order.subtotal).toLocaleString("en-NG") + " · Delivery ₦" + Number(order.delivery_fee).toLocaleString("en-NG") + " · Total ₦" + Number(order.total).toLocaleString("en-NG"), "admin-order-total");
    card.append(heading, customer, items, totals);
    if (order.note) card.append(safeText("p", "Customer note: " + order.note, "admin-order-note"));
    const actions = document.createElement("div");
    actions.className = "admin-order-actions";
    const label = safeText("label", "Update status");
    const select = document.createElement("select");
    select.className = "admin-order-status-select";
    select.setAttribute("aria-label", "Update status for order " + order.id.slice(0, 8));
    ORDER_STATUSES.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value.charAt(0).toUpperCase() + value.slice(1);
      option.selected = value === order.status;
      select.append(option);
    });
    select.addEventListener("change", async () => {
      select.disabled = true;
      const { error } = await client.from("orders").update({ status: select.value, updated_at: new Date().toISOString() }).eq("id", order.id);
      if (error) {
        notify("Could not update order: " + error.message, true);
        select.value = order.status;
      } else {
        notify("Order status updated.");
        order.status = select.value;
        status.className = "admin-status " + order.status;
        status.textContent = order.status.charAt(0).toUpperCase() + order.status.slice(1);
      }
      select.disabled = false;
    });
    label.append(select);
    const whatsapp = document.createElement("a");
    whatsapp.className = "button button-outline";
    whatsapp.href = "https://wa.me/" + String(order.customer_phone).replace(/\D/g, "") + "?text=" + encodeURIComponent("Hello " + order.customer_name + ", this is MahMah Naturals regarding your order " + order.id.slice(0, 8).toUpperCase() + ".");
    whatsapp.target = "_blank";
    whatsapp.rel = "noopener noreferrer";
    whatsapp.textContent = "Contact customer";
    actions.append(label, whatsapp);
    card.append(actions);
    list.append(card);
  });
}
async function loadOrders() {
  const list = document.querySelector("#admin-order-list");
  list.replaceChildren(safeText("p", "Loading orders…", "admin-hint"));
  const { data, error } = await client.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) {
    list.replaceChildren(safeText("p", "Orders are not set up yet. Run the updated supabase-schema.sql in Supabase SQL Editor. Details: " + error.message, "admin-hint"));
    return;
  }
  renderOrders(data || []);
}
document.querySelector("#refresh-orders").addEventListener("click", loadOrders);
document.querySelector("#order-status-filter").addEventListener("change", loadOrders);
