# Contributing to MahMah Naturals

Thank you for helping improve MahMah Naturals, a real-world cosmetics storefront maintained by ImamTech Labs.

## Before starting

1. Read the [README](README.md) and [project roadmap](ROADMAP.md).
2. Check existing issues and pull requests.
3. Comment on an issue before starting substantial work so a maintainer can confirm the scope.
4. For a new feature, explain the customer, shop-owner, or contributor problem before proposing implementation details.

## Development setup

The customer storefront uses HTML, CSS, and JavaScript and does not require a frontend package installation.

```bash
python -m http.server 8000
```

Open http://localhost:8000 in your browser. The owner dashboard and shared data features require a correctly configured Supabase project; do not add real customer information or credentials to local test data or commits.

## Project boundaries

- Preserve the current WhatsApp order-confirmation flow unless a reviewed issue explicitly changes it.
- Do not claim online payments are active. The customer storefront does not currently collect payments.
- Do not invent product ingredients, health benefits, sizes, prices, photos, or stock status. Product facts must be confirmed by the shop owner.
- Keep delivery areas and fees consistent with the verified configuration.
- Never expose customer orders or owner-only controls to unauthorised visitors.
- Never commit `.env` files, private keys, service-role keys, tokens, local databases, or generated deployment output.

## Automated checks

Run the checks relevant to your change:

```bash
node --check app.js
node --check admin.js
node --check payment-return.js
node --test tests/cart-storage.test.js
python -m unittest discover -s tests -v
python build_static.py
```

GitHub Actions runs the automated checks for pushes and pull requests targeting `main`.

## Manual verification

For storefront changes, test search, category filters, sorting, product availability, bag quantities, totals, delivery selection, and the WhatsApp order summary.

For dashboard or Supabase changes, verify both authorised and unauthorised access. Do not use real customer data in screenshots or test reports.

Check mobile and desktop layouts, keyboard navigation, visible focus, and browser-console errors when relevant.

## Pull requests

Use the repository pull request template. Include:
- The problem and the change made.
- The related issue, if one exists.
- Automated checks and manual verification performed.
- Screenshots for visible interface changes.
- Any limitations or follow-up work.

Keep pull requests focused and small enough to review.
