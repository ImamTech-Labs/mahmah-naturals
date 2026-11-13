# MahMah Naturals

**MahMah Naturals** is a small-business cosmetics storefront maintained by [ImamTech Labs](https://github.com/ImamTech-Labs). It is being developed as a practical, contributor-friendly project with a real customer-facing use case.

- **Live storefront:** https://mahmah-naturals.pages.dev
- **Source code:** https://github.com/ImamTech-Labs/mahmah-naturals
- **Current order channel:** WhatsApp, with owner confirmation
- **Current hosting:** Cloudflare Pages

## Project status

The public site is a static HTML, CSS, and JavaScript storefront. Customers can browse the catalogue, search and filter products, add items to a shopping bag, select a supported delivery area, and prepare an itemised WhatsApp order for the shop owner.

**Important current limitations**
- WhatsApp is the active order-confirmation channel. The website does not currently collect online payments.
- Product availability is controlled by the shop owner. Proposed catalogue entries remain unavailable until the owner verifies the actual product, size, image, price, and stock.
- The owner dashboard depends on Supabase configuration and an owner account. Follow the setup below before relying on shared catalogue or order management.
- Delivery is currently configured only for Kaduna State (including Zaria), Kano State, Katsina State, and Abuja (FCT). Fees are shown in the storefront and should be confirmed by the owner.
- This is an actively developed project; do not treat planned features as completed production capabilities.

See [ROADMAP.md](ROADMAP.md) for the current priorities and known boundaries.

## Customer catalogue

The bundled catalogue contains 16 proposed listings across four collections:

| Collection | Listings |
| --- | --- |
| Skincare | Gentle Face Cleanser, Face Moisturiser, Facial Toner, Face Serum |
| Body care | Body Scrub, Body Lotion, Body Butter, Body Scrub — Large |
| Soaps | Homemade Black Soap, Shea Black Soap, Herbal Black Soap, Homemade Black Soap — Large |
| Oils | Nourishing Face Oil, Body Oil, Shea Oil, Body Oil — Large |

The standard suggested price is ₦6,000 and selected larger listings are ₦8,500. Two existing handmade listings retain their previous ₦5,000 prices. These are catalogue values, not a guarantee of stock. New suggested listings start unavailable until verified by the shop owner. Product descriptions are deliberately cautious; confirm product names, ingredients, sizes, images, prices, and availability with the owner.

## Run locally

The customer storefront requires no frontend build tool or package installation.

```bash
python -m http.server 8000
```

Open http://localhost:8000 in a browser.

## Owner dashboard and Supabase

The owner dashboard is available at `/admin.html`. It is designed for owner sign-in, catalogue management, and order-status management. It is not ready for operational use until the Supabase project has the matching schema, an explicitly authorised owner account, and the public client configuration.

1. Create or open the Supabase project.
2. Run the complete `supabase-schema.sql` script in the Supabase SQL Editor.
3. Create the shop owner's account under Supabase Authentication. Keep public sign-ups disabled.
4. Add the owner's exact Auth user UUID to `public.store_admins` using the SQL comment at the end of the schema.
5. Set the project URL and publishable/anon client key in `supabase-config.js`. Never use a service-role or secret key in browser code.
6. Deploy the updated site and test owner sign-in, product edits, and order access.

Review the row-level security policies carefully before enabling customer order submission. Never put real customer data or private credentials in commits, issues, or pull requests.

## Static hosting build

Run:

```bash
python build_static.py
```

The script creates a `dist/` directory containing the public storefront files and assets. The Python payment test server, local environment file, and local database are not part of the static website.

Cloudflare Pages is configured to deploy the `dist` directory from `main`. The deployment workflow requires the repository's Cloudflare GitHub Actions secrets. Deployment status must be checked in the Actions tab; a successful code commit alone does not prove that the live site updated.

## Automated quality checks

GitHub Actions runs the JavaScript tests, Python checkout tests, and static build on pushes and pull requests to `main`.

Run the checks locally:

```bash
node --check app.js
node --check admin.js
node --check payment-return.js
node --test tests/cart-storage.test.js
python -m unittest discover -s tests -v
python build_static.py
```

The current automated tests cover defensive shopping-bag restoration and server-side checkout input validation. They do not replace browser testing, Supabase policy testing, or a real end-to-end order test.

## Contributing

We welcome focused contributions that improve customer usability, accessibility, correctness, security, documentation, and maintainability.

1. Read [CONTRIBUTING.md](CONTRIBUTING.md).
2. Check the [open issues](https://github.com/ImamTech-Labs/mahmah-naturals/issues) and existing pull requests.
3. Comment on an issue before starting substantial work so a maintainer can confirm the scope.
4. Keep changes focused and include tests or clear manual verification steps.
5. Open a pull request using the repository template.

Read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community expectations and [SECURITY.md](SECURITY.md) for responsible vulnerability reporting.

## Main files

- `index.html`, `styles.css`, `app.js`: customer storefront.
- `cart-storage.js`: safe shopping-bag restoration.
- `admin.html`, `admin.css`, `admin.js`: owner dashboard.
- `supabase-schema.sql`, `supabase-config.js`: shared catalogue and order data setup.
- `build_static.py`: static deployment output.
- `server.py`, `payment-return.html`, `payment-return.js`: retained local payment-test work; not the active customer checkout.
- `tests/`: automated tests.
- `.github/workflows/`: quality checks and Cloudflare Pages deployment.
