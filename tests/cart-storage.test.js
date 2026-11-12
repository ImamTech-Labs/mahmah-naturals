"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { restoreCart } = require("../cart-storage.js");

const products = [
  { id: "black-soap", name: "Homemade Black Soap", price: 5000, image: "assets/soap.jpeg" },
  { id: "body-scrub", name: "Body Scrub", price: 5000, image: "assets/scrub.jpeg" },
];

test("returns an empty bag for malformed JSON", () => {
  assert.deepEqual(restoreCart("{not valid JSON", products), []);
});

test("returns an empty bag when saved data is not an array", () => {
  assert.deepEqual(restoreCart('{"id":"black-soap","quantity":1}', products), []);
});

test("restores valid products using current catalogue details", () => {
  const saved = JSON.stringify([
    { id: "black-soap", name: "Old name", price: 1, image: "old.jpg", quantity: 2 },
  ]);
  assert.deepEqual(restoreCart(saved, products), [
    { ...products[0], quantity: 2 },
  ]);
});

test("discards unknown products and invalid quantities", () => {
  const saved = JSON.stringify([
    { id: "removed-product", quantity: 1 },
    { id: "black-soap", quantity: 0 },
    { id: "black-soap", quantity: 100 },
    { id: "black-soap", quantity: 1.5 },
    { id: "black-soap", quantity: "2" },
    { id: "body-scrub", quantity: 2 },
  ]);
  assert.deepEqual(restoreCart(saved, products), [
    { ...products[1], quantity: 2 },
  ]);
});

test("discards null, array, and primitive entries", () => {
  const saved = JSON.stringify([
    null, [], "black-soap", 12, { id: "black-soap", quantity: 1 },
  ]);
  assert.deepEqual(restoreCart(saved, products), [
    { ...products[0], quantity: 1 },
  ]);
});

test("treats missing saved data as an empty bag", () => {
  assert.deepEqual(restoreCart(null, products), []);
});
