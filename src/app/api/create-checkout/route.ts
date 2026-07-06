import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createCheckout, PRODUCTS } from "@/lib/lemonsqueezy";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: "Please sign in first" },
        { status: 401 }
      );
    }

    if (!process.env.LEMONSQUEEZY_API_KEY) {
      return NextResponse.json(
        { message: "Payment is not configured yet" },
        { status: 500 }
      );
    }

    const { variantKey } = await req.json();

    // Map frontend plan key to actual variant ID
    const validKeys: Record<string, string> = {
      singleResume: PRODUCTS.singleResume.variantId,
      unlimitedMonthly: PRODUCTS.unlimitedMonthly.variantId,
    };

    const variantId = validKeys[variantKey];
    if (!variantId) {
      return NextResponse.json(
        { message: "Invalid product variant" },
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

    const checkout = await createCheckout(variantId, userId, email);

    return NextResponse.json({ url: checkout.attributes.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { message: "Failed to start checkout" },
      { status: 500 }
    );
  }
}
