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
  const { data: { user } } = await client.auth.getUser();
  if (!user) return;
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
