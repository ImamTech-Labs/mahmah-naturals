# Security Policy

## Supported Versions

MahMah Naturals is an actively maintained project. Security fixes are applied to the latest version on the `main` branch.

| Version | Supported |
| --- | --- |
| Latest version on `main` | Yes |
| Older revisions | No |

## Reporting a Vulnerability

Please do not publish security vulnerabilities in public issues.

Use GitHub's private vulnerability reporting feature for this repository if it is enabled. If it is unavailable, contact the repository maintainers privately through the ImamTech-Labs GitHub organization.

Include:
- A clear description of the issue and its potential impact.
- Steps to reproduce the issue, where safe to do so.
- Any relevant affected files or versions.

Please allow maintainers reasonable time to investigate and coordinate a fix before publicly disclosing the issue.

## Security Notes

- Never commit `.env` files, passwords, API tokens, or payment-provider secret keys.
- Use `.env.example` only for placeholder configuration values.
- Do not place private payment credentials in browser-side JavaScript.
- Report suspected exposure of credentials immediately so they can be revoked and rotated.
