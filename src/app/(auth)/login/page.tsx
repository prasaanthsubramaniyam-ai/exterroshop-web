import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to ExterroShop with your @gmail.com account.",
};

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-display-xs font-semibold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground">
          Sign in to your ExterroShop account to continue.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
