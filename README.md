# MahMah Naturals

An online storefront for MahMah Naturals, featuring skincare, body care, soaps, and oils.

## Current customer catalogue and order flow

The storefront currently lists 16 products across four collections, with at least four products in each collection:

- **Skincare:** Gentle Face Cleanser, Face Moisturiser, Facial Toner, Face Serum
- **Body care:** Body Scrub, Body Lotion, Body Butter, Body Scrub — Large
- **Soaps:** Homemade Black Soap, Shea Black Soap, Herbal Black Soap, Homemade Black Soap — Large
- **Oils:** Nourishing Face Oil, Body Oil, Shea Oil, Body Oil — Large

New standard-size listings are priced at ₦6,000 and selected large-size listings at ₦8,500. The two previously listed handmade products retain their existing ₦5,000 prices. These are catalogue prices; **the shop owner confirms actual stock and order acceptance on WhatsApp**. Customers can search, filter, and sort the catalogue, add listed products to their bag, choose a supported delivery location, review the estimate, and send the order details to the owner for confirmation.

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
