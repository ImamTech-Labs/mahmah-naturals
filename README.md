# MahMah Naturals

An online storefront for MahMah Naturals, featuring skincare, body care, soaps, and oils.

## Current customer order flow

The storefront currently lists MahMah Naturals' homemade black soap and body scrub, each at ₦5,000. Customers can add either product to their bag, choose a supported delivery location, review the product subtotal, delivery fee, and estimated total, then send the order details to the shop owner through WhatsApp. The owner confirms availability and delivery details directly with the customer.

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
