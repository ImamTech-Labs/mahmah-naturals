import unittest

from server import DELIVERY_ZONES, PRODUCTS, calculate_order


class CalculateOrderTests(unittest.TestCase):
    def test_both_storefront_products_are_supported(self):
        self.assertIn("black-soap", PRODUCTS)
        self.assertIn("body-scrub", PRODUCTS)

    def test_calculates_subtotal_and_delivery_from_server_catalogue(self):
        subtotal, summary, zone = calculate_order(
            [
                {"id": "black-soap", "quantity": 2},
                {"id": "body-scrub", "quantity": 1},
            ],
            "kaduna",
        )

        self.assertEqual(subtotal, 15000)
        self.assertEqual(
            summary,
            [
                {"name": "Homemade Black Soap", "quantity": 2},
                {"name": "Body Scrub", "quantity": 1},
            ],
        )
        self.assertEqual(zone["fee"], DELIVERY_ZONES["kaduna"]["fee"])

    def test_rejects_unknown_products(self):
        with self.assertRaises(ValueError):
            calculate_order([{"id": "unknown", "quantity": 1}], "kaduna")

    def test_rejects_invalid_quantities(self):
        for quantity in (0, -1, 100, True, 1.5, "2", None):
            with self.subTest(quantity=quantity):
                with self.assertRaises(ValueError):
                    calculate_order([{"id": "black-soap", "quantity": quantity}], "kaduna")

    def test_rejects_missing_or_unsupported_delivery_zone(self):
        for zone in ("", "lagos", "unknown"):
            with self.subTest(zone=zone):
                with self.assertRaises(ValueError):
                    calculate_order([{"id": "black-soap", "quantity": 1}], zone)

    def test_rejects_empty_or_oversized_bags(self):
        with self.assertRaises(ValueError):
            calculate_order([], "kaduna")
        with self.assertRaises(ValueError):
            calculate_order([{"id": "black-soap", "quantity": 1}] * 21, "kaduna")

    def test_rejects_non_object_cart_items(self):
        with self.assertRaises(ValueError):
            calculate_order(["black-soap"], "kaduna")


if __name__ == "__main__":
    unittest.main()
