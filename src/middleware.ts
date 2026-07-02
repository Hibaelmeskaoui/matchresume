import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that don't require auth
const publicRoutes = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!publicRoutes(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next/static|_next/image|favicon\\.ico|pdf\\.worker\\.min\\.mjs).*)",
  ],
};
