// src/lib/payments/gateway.js
//
// Simulated EFT gateway.
//
// This module exists so that swapping in a real sandbox later (PayFast,
// Yoco, Ozow, etc.) is a single-file change. The shape of the return
// value mirrors what those APIs return.
//
// To go live: replace the body of `chargePayment` with the real API call,
// keep the return contract identical, and nothing downstream needs to
// change.

export async function chargePayment({ amount, reference, method = "eft" }) {
  // Simulate network latency so the UI's loading state is visible.
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Simulate a small failure rate so the error path is exercisable.
  // Comment this block out if you want 100% success during a demo.
  if (Math.random() < 0.05) {
    return {
      ok: false,
      error: "Simulated gateway failure - please try again.",
    };
  }

  return {
    ok: true,
    provider: "simulated-eft",
    method,
    transactionId: `SIM-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
  };
}