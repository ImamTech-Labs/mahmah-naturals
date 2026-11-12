"""Local Test Mode checkout server for MahMah Naturals."""

from __future__ import annotations

import json
import os
import re
import sqlite3
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlsplit
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent
ENV_FILE = ROOT / ".env"
DATABASE_FILE = ROOT / "orders.sqlite3"
PORT = int(os.environ.get("PORT", "4174"))
PRODUCTS = {
    "black-soap": {"name": "Homemade Black Soap", "price": 5000},
    "body-scrub": {"name": "Body Scrub", "price": 5000},
}
DELIVERY_ZONES = {
    "kaduna": {"name": "Kaduna State (all areas, including Zaria)", "fee": 1000},
    "kano": {"name": "Kano State", "fee": 1500},
    "katsina": {"name": "Katsina State", "fee": 2500},
    "abuja": {"name": "Abuja (FCT)", "fee": 2000},
}


def load_local_environment() -> None:
    if not ENV_FILE.exists():
        return
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        os.environ.setdefault(name.strip(), value.strip().strip("\"'"))


def json_response(handler: SimpleHTTPRequestHandler, status: int, payload: dict) -> None:
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Cache-Control", "no-store")
    handler.end_headers()
    handler.wfile.write(body)


def paystack_error_message(details: dict, status_code: int | None = None) -> str:
    """Return only Paystack's short diagnostic fields, never the raw response."""
    message = str(details.get("message") or "Paystack could not process the request.").strip()[:240]
    code = str(details.get("code") or "").strip()[:80]
    error_type = str(details.get("type") or "").strip()[:80]
    meta = details.get("meta") if isinstance(details.get("meta"), dict) else {}
    next_step = str(meta.get("nextStep") or meta.get("next_step") or "").strip()[:300]

    parts = [message]
    if status_code:
        parts.append(f"Paystack response {status_code}")
    if code:
        parts.append(f"Code: {code}")
    if error_type:
        parts.append(f"Type: {error_type}")
    if next_step:
        parts.append(f"Suggested next step: {next_step}")
    return " ".join(parts)


def paystack_request(path: str, method: str, payload: dict | None = None) -> dict:
    secret = os.environ.get("PAYSTACK_SECRET_KEY", "").strip()
    if not secret.startswith("sk_test_"):
        raise RuntimeError("Add your Paystack Test Secret Key to the private .env file first.")

    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = Request(
        f"https://api.paystack.co{path}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {secret}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    try:
        with urlopen(request, timeout=20) as response:
            result = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        try:
            details = json.loads(error.read().decode("utf-8"))
            message = paystack_error_message(details, error.code)
        except Exception:
            message = f"Paystack could not process the request (response {error.code})."
        raise ValueError(message) from error
    except (URLError, TimeoutError) as error:
        raise ConnectionError("Could not reach Paystack. Check your internet connection and try again.") from error
    if not result.get("status"):
        raise ValueError(paystack_error_message(result))
    return result


def calculate_order(items: object, delivery_zone: str) -> tuple[int, list[dict], dict]:
    """Validate a checkout request and calculate its server-trusted subtotal."""
    if not isinstance(items, list) or not items or len(items) > 20:
        raise ValueError("Your bag is empty or contains too many items.")
    zone = DELIVERY_ZONES.get(delivery_zone)
    if not zone:
        raise ValueError("Choose one of the available delivery locations.")

    subtotal = 0
    summary = []
    for item in items:
        if not isinstance(item, dict):
            raise ValueError("The items in your bag could not be checked.")
        product = PRODUCTS.get(str(item.get("id", "")))
        quantity = item.get("quantity")
        if not product or isinstance(quantity, bool) or not isinstance(quantity, int) or not 1 <= quantity <= 99:
            raise ValueError("An item in your bag could not be checked. Please refresh and try again.")
        subtotal += product["price"] * quantity
        summary.append({"name": product["name"], "quantity": quantity})

    return subtotal, summary, zone


def initialise_database() -> None:
    with sqlite3.connect(DATABASE_FILE) as database:
        database.execute(
            "CREATE TABLE IF NOT EXISTS pending_payments ("
            "reference TEXT PRIMARY KEY, expected_kobo INTEGER NOT NULL, created_at TEXT NOT NULL)"
        )


class StorefrontHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format_string: str, *args) -> None:
        # Keep request logs free of query strings and customer-provided values.
        super().log_message(format_string, *args)

    def translate_path(self, path: str) -> str:
        translated = Path(super().translate_path(path)).resolve()
        try:
            relative = translated.relative_to(ROOT)
        except ValueError:
            return str(ROOT / "__not_found__")
        if ".env" in relative.parts or "orders.sqlite3" in relative.parts or ".git" in relative.parts:
            return str(ROOT / "__not_found__")
        return str(translated)

    def do_POST(self) -> None:
        if urlsplit(self.path).path != "/api/paystack/initialize":
            json_response(self, 404, {"error": "Not found."})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length < 1 or content_length > 16_384:
                raise ValueError("The checkout details are invalid. Please try again.")
            body = json.loads(self.rfile.read(content_length).decode("utf-8"))
            email = str(body.get("email", "")).strip()
            if not re.fullmatch(r"[^\\s@]+@[^\\s@]+\\.[^\\s@]+", email):
                raise ValueError("Enter a valid email address for your receipt.")
            subtotal, summary, zone = calculate_order(
                body.get("items"), str(body.get("deliveryZone", ""))
            )

            total_kobo = (subtotal + zone["fee"]) * 100
            callback_url = os.environ.get(
                "PAYSTACK_CALLBACK_URL", f"http://127.0.0.1:{PORT}/payment-return.html"
            ).strip()
            result = paystack_request(
                "/transaction/initialize",
                "POST",
                {
                    "email": email,
                    "amount": total_kobo,
                    "currency": "NGN",
                    "callback_url": callback_url,
                    "metadata": {
                        "custom_fields": [
                            {"display_name": "Items", "variable_name": "items", "value": json.dumps(summary)},
                            {"display_name": "Delivery area", "variable_name": "delivery_area", "value": zone["name"]},
                            {"display_name": "Delivery fee", "variable_name": "delivery_fee", "value": f"NGN {zone['fee']:,}"},
                        ]
                    },
                },
            )
            transaction = result.get("data", {})
            authorization_url = transaction.get("authorization_url")
            reference = transaction.get("reference")
            if not authorization_url or not reference:
                raise ValueError("Paystack did not return a checkout link. Please try again.")
            with sqlite3.connect(DATABASE_FILE) as database:
                database.execute(
                    "INSERT OR REPLACE INTO pending_payments(reference, expected_kobo, created_at) VALUES (?, ?, ?)",
                    (reference, total_kobo, datetime.now(timezone.utc).isoformat()),
                )
            json_response(self, 200, {"authorizationUrl": authorization_url})
        except RuntimeError as error:
            json_response(self, 503, {"error": str(error)})
        except (ValueError, ConnectionError) as error:
            json_response(self, 400, {"error": str(error)})
        except (json.JSONDecodeError, UnicodeDecodeError):
            json_response(self, 400, {"error": "The checkout details could not be read. Please try again."})
        except Exception:
            json_response(self, 500, {"error": "Checkout could not start. Please try again or contact the shop owner."})

    def do_GET(self) -> None:
        parsed = urlsplit(self.path)
        if parsed.path != "/api/paystack/verify":
            super().do_GET()
            return

        reference = parse_qs(parsed.query).get("reference", [""])[0].strip()
        if not re.fullmatch(r"[A-Za-z0-9_-]{6,100}", reference):
            json_response(self, 400, {"error": "The payment reference is missing or invalid."})
            return
        try:
            with sqlite3.connect(DATABASE_FILE) as database:
                row = database.execute(
                    "SELECT expected_kobo FROM pending_payments WHERE reference = ?", (reference,)
                ).fetchone()
            if not row:
                json_response(self, 404, {"error": "This payment could not be matched to an order."})
                return

            result = paystack_request(f"/transaction/verify/{reference}", "GET")
            transaction = result.get("data", {})
            paid = (
                transaction.get("status") == "success"
                and transaction.get("currency") == "NGN"
                and transaction.get("reference") == reference
                and transaction.get("amount") == row[0]
            )
            json_response(self, 200, {"paid": paid, "reference": reference})
        except RuntimeError as error:
            json_response(self, 503, {"error": str(error)})
        except (ValueError, ConnectionError) as error:
            json_response(self, 400, {"error": str(error)})
        except Exception:
            json_response(self, 500, {"error": "We could not verify payment right now. Please contact the shop owner before paying again."})


if __name__ == "__main__":
    load_local_environment()
    initialise_database()
    server = ThreadingHTTPServer(("127.0.0.1", PORT), StorefrontHandler)
    print(f"MahMah Naturals test storefront is running at http://127.0.0.1:{PORT}/")
    print("This local server accepts Test Mode keys only.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
