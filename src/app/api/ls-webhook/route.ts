import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LS_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("LS_WEBHOOK_SECRET not set — skipping signature verification");
    return false;
  }

  try {
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const sig = Buffer.from(signature, "utf8");
    return crypto.timingSafeEqual(digest, sig);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const eventName = req.headers.get("x-event-name") || "";
    const signature = req.headers.get("x-signature") || "";

    // Verify signature (skip check if secret isn't configured yet)
    const secretConfigured = !!process.env.LS_WEBHOOK_SECRET;
    if (secretConfigured && !verifySignature(rawBody, signature)) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const customData = body.meta?.custom_data || {};
    const userId = customData.user_id;

    if (!userId) {
      // If no user_id in custom data, we can't update Clerk, but still ack
      console.warn("Webhook received without user_id in custom_data:", eventName);
      return NextResponse.json({ received: true });
    }

    const clerkKey = process.env.CLERK_SECRET_KEY;
    if (!clerkKey) {
      console.warn("CLERK_SECRET_KEY not set — can't update user metadata");
      return NextResponse.json({ received: true });
    }

    switch (eventName) {
      case "order_created": {
        const order = body.data?.attributes || {};
        const variantName = order.first_order_item?.variant_name || "";
        const isSubscription = !!body.data?.relationships?.subscriptions;

        const plan = isSubscription ? "monthly" : "onetime";

        // Update Clerk metadata
        await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${clerkKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            private_metadata: {
              plan,
              lsOrderId: body.data?.id,
              paidAt: new Date().toISOString(),
              ...(plan === "onetime" ? { resumesLeft: 1 } : {}),
            },
          }),
        });

        console.log(`LS webhook: order_created — user ${userId}, plan ${plan}`);
        break;
      }

      case "subscription_created": {
        const subscription = body.data?.attributes || {};
        await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${clerkKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            private_metadata: {
              plan: "monthly",
              lsSubscriptionId: body.data?.id,
              lsOrderId: subscription.order_id,
              paidAt: new Date().toISOString(),
              resumesLeft: Infinity,
            },
          }),
        });

        console.log(`LS webhook: subscription_created — user ${userId}`);
        break;
      }

      case "subscription_updated": {
        // Keep Clerk metadata in sync
        const subscription = body.data?.attributes || {};
        const subStatus = subscription.status; // active, cancelled, past_due, etc.

        if (subStatus === "cancelled" || subStatus === "expired") {
          // Don't immediately expire — let them use remaining time
          // But note the cancellation
          await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${clerkKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              private_metadata: {
                lsStatus: subStatus,
              },
            }),
          });
        }

        console.log(`LS webhook: subscription_updated — user ${userId}, status ${subStatus}`);
        break;
      }

      case "subscription_cancelled": {
        await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${clerkKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            private_metadata: {
              lsStatus: "cancelled",
            },
          }),
        });

        console.log(`LS webhook: subscription_cancelled — user ${userId}`);
        break;
      }

      case "subscription_payment_success": {
        // Renewal payment — keep subscription active
        console.log(`LS webhook: subscription_payment_success — user ${userId}`);
        break;
      }

      default:
        console.log(`LS webhook: unhandled event ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("LS webhook error:", error);
    return NextResponse.json(
      { message: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
