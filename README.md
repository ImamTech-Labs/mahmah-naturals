# MahMah Naturals

An online cosmetics store for MahMah Naturals, featuring skincare, body care, soaps, and oils.

## Current storefront

The responsive storefront currently lists MahMah Naturals' homemade black soap at ₦5,000. Customers can choose one of the supported delivery locations, see the delivery fee and estimated total, chat with the owner to confirm availability, then continue to Paystack checkout.

Current delivery fees:

- Kaduna State, including Zaria: ₦1,000
- Kano State: ₦1,500
- Abuja (FCT): ₦2,000
- Katsina State: ₦2,500

Other locations are unavailable until their fees are supplied.

## Local Paystack Test Mode setup

This local server accepts **Test Mode secret keys only**. It validates product prices and delivery fees on the server, initializes Paystack checkout, and verifies the returned payment reference and amount before showing confirmation. The private key is read from `.env`, which is excluded from Git.

1. Copy `.env.example` to a new file named `.env` in this folder.
2. In `.env`, replace the sample value with the Paystack **Test Secret Key** (`sk_test_...`). Never paste the secret key into chat or commit `.env` to GitHub.
3. Start the local checkout server from this folder with `python server.py`.
4. Open `http://127.0.0.1:4174/` and try the checkout with Paystack's test payment details.

The buyer first contacts the owner in WhatsApp. After the owner confirms the product and delivery details, the buyer enters an email, confirms the conversation, and continues to Paystack's secure hosted checkout. Paystack then returns the buyer to the site's payment confirmation page.

This is a local Test Mode setup, not a production payment server. Before publishing, deploy the backend over HTTPS, configure the live key securely in the hosting provider, use a durable order store, and add Paystack webhook handling. Never put the secret key in browser JavaScript or a public repository.

## Files

- `index.html`, `styles.css`, `app.js`: storefront and customer checkout flow.
- `server.py`: local Test Mode payment initialization and verification.
- `payment-return.html`, `payment-return.js`: payment status page.
- `.env.example`: safe settings template; copy it to the ignored `.env` for local credentials.
