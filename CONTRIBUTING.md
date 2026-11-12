# Contributing to MahMah Naturals

Thank you for your interest in improving MahMah Naturals.

## Before you start

1. Read the project [README](README.md) to understand the current storefront and order flow.
2. Check existing issues and pull requests before starting work.
3. For a significant feature or change, open an issue first so the maintainers can discuss the approach.

## Development setup

The customer-facing storefront uses HTML, CSS, and JavaScript. The current WhatsApp order flow does not require a backend service.

1. Fork the repository.
2. Clone your fork.
3. Open the project with a local static server. For example, run `python -m http.server 8000` from the project directory.
4. Visit `http://localhost:8000` in your browser.

Do not add real customer information, credentials, or payment secrets to test files or commits.

## Making changes

- Keep changes focused and explain the user problem they solve.
- Preserve the existing mobile-friendly layout.
- Keep product names, prices, delivery fees, and order details consistent across the interface.
- Do not claim that online payment is active unless a complete, tested payment flow has been implemented.
- Do not commit generated output, local databases, or private environment files.
- Use clear, descriptive commit messages.

## Automated checks

Run the checkout tests before submitting changes:

```bash
python -m unittest discover -s tests -v
```

Check the static storefront build:

```bash
python build_static.py
```

GitHub Actions runs these checks automatically for pushes and pull requests targeting `main`.

## Before opening a pull request

- Test the changed pages in a browser.
- Check the layout at mobile and desktop widths.
- Test cart quantities, totals, delivery selection, and the WhatsApp order message when those areas change.
- Check browser developer tools for errors.
- Describe what changed, why it changed, and how you tested it.

## Pull requests

Submit a pull request against the `main` branch. Link the related issue when one exists and include screenshots for visible interface changes.
