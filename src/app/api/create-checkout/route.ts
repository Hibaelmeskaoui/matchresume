import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createCheckoutSession, PRICES } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: "Please sign in first" },
        { status: 401 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { message: "Stripe is not configured" },
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

    // Get user email from Clerk
    const userRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });
    const userData = await userRes.json();
    const email = userData.email_addresses?.[0]?.email_address || "no-email@example.com";

    const session = await createCheckoutSession(
      priceId,
      userId,
      email
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { message: "Failed to start checkout" },
      { status: 500 }
    );
  }
}
