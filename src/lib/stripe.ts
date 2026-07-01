import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

export const PRICES = {
  oneTime: {
    id: process.env.STRIPE_PRICE_ONETIME_ID || "price_onetime",
    amount: 999, // $9.99
    label: "Single Resume",
  },
  monthly: {
    id: process.env.STRIPE_PRICE_MONTHLY_ID || "price_monthly",
    amount: 1900, // $19.00
    label: "Unlimited Monthly",
  },
} as const;

export async function createCheckoutSession(
  priceId: string,
  userId: string,
  userEmail: string
) {
  const session = await getStripe().checkout.sessions.create({
    mode: priceId === PRICES.oneTime.id ? "payment" : "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: userEmail,
    client_reference_id: userId,
    metadata: {
      userId,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?canceled=true`,
  });

  return session;
}

export async function getPayPalOrderId(priceId: string) {
  const price = priceId === PRICES.oneTime.id ? PRICES.oneTime : PRICES.monthly;
  const amount = (price.amount / 100).toFixed(2);

  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com"}/v2/checkout/orders`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount,
            },
            description: `MatchResume - ${price.label}`,
          },
        ],
      }),
    }
  );

  const data = await response.json();
  return data.id;
}

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !secret) {
    throw new Error("PayPal credentials not configured");
  }

  const response = await fetch(
    `${process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com"}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    }
  );

  const data = await response.json();
  return data.access_token;
}
