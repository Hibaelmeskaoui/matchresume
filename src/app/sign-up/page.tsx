import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl rounded-2xl border border-gray-100",
            formButtonPrimary:
              "bg-primary-600 hover:bg-primary-700 text-sm normal-case",
            headerTitle: "text-2xl font-bold text-gray-900",
            headerSubtitle: "text-sm text-gray-600",
            footer: "hidden",
          },
        }}
        signInUrl="/sign-in"
      />
    </div>
  );
}
