import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, PRICES } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { message: "Stripe is not configured. Set STRIPE_SECRET_KEY in your .env.local" },
        { status: 500 }
      );
    }

    const { priceId } = await req.json();

    if (!priceId || !Object.values(PRICES).some((p) => p.id === priceId)) {
      return NextResponse.json(
        { message: "Invalid price ID" },
        { status: 400 }
      );
    }

    // For now, create a simple redirect-based checkout
    // In production, you'd pass the authenticated user's ID and email
    const session = await createCheckoutSession(
      priceId,
      "guest-user",
      "guest@example.com"
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { message: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
