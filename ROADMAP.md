# MahMah Naturals — Project Roadmap

This roadmap separates current capabilities from proposed work. Priorities may change after testing and feedback from the shop owner and contributors.

## Current baseline

- Static customer storefront hosted on Cloudflare Pages.
- Product catalogue with category filters, search, sorting, and a persistent shopping bag.
- WhatsApp order handoff with delivery-area estimates and owner confirmation.
- Supabase-backed owner dashboard implementation and SQL schema, pending complete live configuration and verification.
- Automated shopping-bag restoration tests, Python checkout validation tests, and static build checks.

## Priority 1 — Trustworthy catalogue and order flow

- [ ] Verify every product's real name, ingredients, size, image, price, and availability with the shop owner.
- [ ] Confirm delivery fees and service coverage with the shop owner.
- [ ] Verify that cart totals and WhatsApp order summaries always match the displayed catalogue and delivery selection.
- [ ] Complete an end-to-end test of order submission and owner confirmation.
- [ ] Review Supabase order-submission policies so customers cannot submit inconsistent prices or totals.

## Priority 2 — Owner dashboard readiness

- [ ] Confirm the production Supabase schema matches the repository schema.
- [ ] Verify owner-only access with an authorised account.
- [ ] Verify that unauthorised visitors cannot read customer orders or change catalogue data.
- [ ] Test product availability changes and order status updates.
- [ ] Document a safe backup and recovery procedure for operational data.

## Priority 3 — Accessibility and customer experience

- [ ] Keep keyboard focus inside the open shopping-bag drawer.
- [ ] Verify keyboard navigation, visible focus, labels, and screen-reader announcements.
- [ ] Test the storefront on narrow mobile screens and slower connections.
- [ ] Add clear empty, loading, and error states for catalogue and order operations.

## Priority 4 — Engineering quality and contributor readiness

- [ ] Expand automated tests for catalogue filtering, cart totals, and delivery calculations.
- [ ] Add repeatable browser-level smoke tests.
- [ ] Keep deployment checks separate from application quality checks.
- [ ] Add screenshots and reproducible test instructions to meaningful UI pull requests.

## Not currently active

- Online payment collection is not active on the customer storefront.
- No product is guaranteed to be in stock solely because it appears in the bundled catalogue.
- Features listed above as unchecked are proposals, not completed capabilities.

## How priorities are selected

Correctness, customer privacy, security, accessibility, and reliable order handling take precedence over cosmetic changes. New work should solve a specific user or maintainer problem and include testable acceptance criteria.
