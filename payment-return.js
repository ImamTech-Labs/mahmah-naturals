const title = document.querySelector("#payment-title");
const message = document.querySelector("#payment-message");
const reference = new URLSearchParams(window.location.search).get("reference");

async function confirmPayment() {
  if (!reference) {
    title.textContent = "Payment not confirmed yet";
    message.textContent = "We couldn’t find a payment reference. Please contact MahMah Naturals before trying to pay again.";
    return;
  }

  try {
    const response = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Payment verification is temporarily unavailable.");
    if (result.paid) {
      title.textContent = "Your payment is confirmed";
      message.textContent = "Thank you for ordering from MahMah Naturals. The shop owner will contact you about delivery.";
      localStorage.removeItem("mahmah-cart");
      return;
    }
    title.textContent = "Payment not completed";
    message.textContent = "Paystack did not confirm a successful payment. Your bag is still saved; contact the shop owner if you need help.";
  } catch (error) {
    title.textContent = "We couldn’t confirm payment";
    message.textContent = `${error.message} Please contact the shop owner before paying again.`;
  }
}

confirmPayment();
