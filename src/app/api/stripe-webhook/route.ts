import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature") || "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle successful checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const plan = session.mode === "subscription" ? "monthly" : "onetime";
      const stripeCustomerId = session.customer as string;

      if (!userId) {
        return NextResponse.json({ message: "No userId in metadata" });
      }

      // Store payment info in Clerk private metadata
      const clerkRes = await fetch(
        `https://api.clerk.com/v1/users/${userId}/metadata`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            private_metadata: {
              plan,
              stripeCustomerId,
              paidAt: new Date().toISOString(),
              ...(plan === "monthly" ? {} : { resumesLeft: 1 }),
            },
          }),
        }
      );

      if (!clerkRes.ok) {
        console.error("Failed to update Clerk metadata:", await clerkRes.text());
      }
    }

    // Handle subscription renewal
    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeCustomerId = invoice.customer as string;

      // Find user by Stripe customer ID (iterate through affected users)
      // For now, we just acknowledge — the monthly plan stays active via Stripe
      console.log(`Invoice paid for customer ${stripeCustomerId}`);
    }

    // Handle subscription cancellation
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = subscription.customer as string;

      // We'd need to look up the user and update their metadata to "cancelled"
      console.log(`Subscription cancelled for customer ${stripeCustomerId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { message: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
