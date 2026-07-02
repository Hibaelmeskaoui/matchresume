import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ subscribed: false, plan: "none" });
  }

  try {
    // Get user's private metadata from Clerk
    const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ subscribed: false, plan: "none" });
    }

    const user = await res.json();
    const metadata = user.private_metadata || {};
    const plan = metadata.plan || "none";

    // Check if plan is still valid
    if (plan === "none") {
      return NextResponse.json({ subscribed: false, plan: "none" });
    }

    if (plan === "onetime") {
      const resumesLeft = metadata.resumesLeft ?? 1;
      return NextResponse.json({
        subscribed: resumesLeft > 0,
        plan: "onetime",
        resumesLeft,
      });
    }

    if (plan === "monthly") {
      return NextResponse.json({
        subscribed: true,
        plan: "monthly",
        resumesLeft: Infinity,
      });
    }

    return NextResponse.json({ subscribed: false, plan: "none" });
  } catch {
    return NextResponse.json({ subscribed: false, plan: "none" });
  }
}
