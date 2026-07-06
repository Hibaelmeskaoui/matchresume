import { auth } from "@clerk/nextjs/server";

const LS_API_BASE = "https://api.lemonsqueezy.com/v1";

export const PRODUCTS = {
  singleResume: {
    variantId: process.env.LS_VARIANT_SINGLE_RESUME || "replace_with_your_variant_id",
    label: "Single Resume",
    description: "1 tailored resume + cover letter, one-time payment",
  },
  unlimitedMonthly: {
    variantId: process.env.LS_VARIANT_UNLIMITED_MONTHLY || "replace_with_your_variant_id",
    label: "Unlimited Monthly",
    description: "Unlimited resumes & cover letters, cancel anytime",
  },
} as const;

function getApiKey(): string {
  const key = process.env.LEMONSQUEEZY_API_KEY;
  if (!key) throw new Error("LEMONSQUEEZY_API_KEY is not set");
  return key;
}

function getStoreId(): string {
  const id = process.env.LS_STORE_ID;
  if (!id) throw new Error("LS_STORE_ID is not set");
  return id;
}

export async function createCheckout(variantId: string, userId: string, userEmail: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://matchresume.vercel.app";

  const response = await fetch(`${LS_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          product_options: {
            redirect_url: `${appUrl}/dashboard?payment=success`,
          },
          checkout_data: {
            email: userEmail,
            custom: {
              user_id: userId,
            },
          },
          expires_at: null, // never expires
          test_mode: process.env.LS_TEST_MODE === "true",
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: getStoreId(),
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId,
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Lemon Squeezy checkout error:", response.status, errorBody);
    throw new Error(`Lemon Squeezy API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}
