# MahMah Naturals

An online storefront for MahMah Naturals, featuring skincare, body care, soaps, and oils.

## Current customer catalogue and order flow

The storefront currently lists 16 products across four collections, with at least four products in each collection:

- **Skincare:** Gentle Face Cleanser, Face Moisturiser, Facial Toner, Face Serum
- **Body care:** Body Scrub, Body Lotion, Body Butter, Body Scrub — Large
- **Soaps:** Homemade Black Soap, Shea Black Soap, Herbal Black Soap, Homemade Black Soap — Large
- **Oils:** Nourishing Face Oil, Body Oil, Shea Oil, Body Oil — Large

New standard-size listings are priced at ₦6,000 and selected large-size listings at ₦8,500. The two previously listed handmade products retain their existing ₦5,000 prices. These are proposed catalogue prices; **only the two previously listed handmade products are initially marked available. All newly suggested listings start unavailable until the shop owner verifies the real product, size, photo, price, and stock in the owner dashboard.** The shop owner confirms actual stock and order acceptance on WhatsApp. Customers can search, filter, and sort the catalogue, add listed products to their bag, choose a supported delivery location, review the estimate, and send the order details to the owner for confirmation.

Product descriptions are intentionally general. The shop owner should verify each product's actual name, ingredients, size, photo, and price before treating the listing as a final product specification. No skincare results or medical benefits are promised.

Current delivery fees:

- Kaduna State, including Zaria: ₦1,000
- Kano State: ₦1,500
- Abuja (FCT): ₦2,000
- Katsina State: ₦2,500

Other locations are not available until their delivery fees are supplied.

Online Paystack checkout is currently disconnected from the storefront. The earlier Python payment server is retained for future development, but it is not needed for the WhatsApp order flow.

## Automated checks

GitHub Actions runs the storefront cart-restoration tests, Python checkout validation tests, and static build on pushes and pull requests to `main`.

To run the tests locally:

```bash
python -m unittest discover -s tests -v
```

To verify the static hosting output:

```bash
python build_static.py
```

The automated JavaScript tests cover malformed and outdated saved shopping-bag data, catalogue-based product details, and invalid quantities. The Python checkout tests cover the product catalogue, server-calculated totals, supported delivery zones, and invalid cart input. The browser loads `cart-storage.js` before `app.js`, and the static build includes both files.

## Contributing and security

- Read [CONTRIBUTING.md](CONTRIBUTING.md) before proposing code changes.
- Read [SECURITY.md](SECURITY.md) to report a suspected vulnerability privately.

## Prepare a static website for hosting

The customer-facing site is static HTML, CSS, and JavaScript. Run `python build_static.py` to copy only the storefront files and product/logo images into the `dist` folder. Use `dist` as the output folder when setting up static hosting. This keeps the Python payment server, local environment file, and order database out of the published website.

The `.env` file and local `orders.sqlite3` database are excluded from Git. Never commit a Paystack secret key or paste it into chat.

## Main files

- `index.html`, `styles.css`, `app.js`: storefront, product display, cart totals, delivery choices, and WhatsApp order message.
- `assets/`: MahMah Naturals logo and product photos.
- `build_static.py`: prepares the public static hosting folder.
- `server.py`, `payment-return.html`, `payment-return.js`: retained local Test Mode payment work; not part of the static customer site.
- `.env.example`: safe settings template for future local Test Mode work.

### WhatsApp checkout details

The shopping bag includes quantity controls, remove-item actions, a delivery-zone selector, customer name and phone fields, a delivery address, and an optional note. The checkout validates the required details before opening WhatsApp with an itemised order, subtotal, delivery fee, and estimated total. The customer is asked to wait for the owner to confirm stock and the final amount. No payment is collected by the website.

## Owner dashboard (Supabase setup required)

The private owner dashboard is at `admin.html`. It supports owner sign-in, listing products, adding/editing products, changing prices, marking products available/unavailable, and deleting listings. It also displays customer orders, lets the owner filter them by status, update their status (Pending, Confirmed, Processing, Dispatched, Delivered, or Cancelled), and contact customers on WhatsApp. The public storefront reads the shared catalogue from Supabase when configured and falls back to the bundled catalogue if the service is not configured or is temporarily unavailable. When the order table is configured, customer checkout saves an order record before the owner confirms the order on WhatsApp.

To activate shared management:

1. Create a Supabase project and open its SQL Editor.
2. Run the complete `supabase-schema.sql` script.
3. In Supabase Authentication, create the owner's email/password account. Keep public sign-ups disabled.
4. Copy the owner's Auth user UUID and run the admin-membership INSERT shown at the end of the SQL script, replacing the placeholder with that UUID.
5. In Supabase Project Settings > API, copy the Project URL and anon/public key into `supabase-config.js`. Never use a service-role or secret key in website files.
6. Deploy the updated site. Open `/admin.html` and sign in with the owner's account.

The database enforces row-level security: visitors can read the product catalogue and submit new orders, but only the UUID explicitly added to `store_admins` can create, edit, or delete products or read and update customer orders. The dashboard checks this membership before showing the management workspace. Newly suggested products start unavailable until the owner verifies them. The dashboard and order-management features are not fully active until the Supabase project, owner account, updated SQL setup, and public client settings have been configured. The website does not collect online payments; WhatsApp remains the order-confirmation channel.
