"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";

const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .regex(/@gmail\.com$/i, "Only @gmail.com addresses are allowed"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const { login, isLoading } = useAuth();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = React.useState(false);
  const [mfaRequired, setMfaRequired] = React.useState(false);
  const [totpCode, setTotpCode] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const auth = await login(
        mfaRequired ? { ...values, totpCode: totpCode.trim() } : values
      );
      if (auth.mfaRequired) {
        // Credentials valid — backend wants a TOTP code to finish
        setMfaRequired(true);
        return;
      }
      const redirect = search.get("from") ?? "/dashboard";
      router.replace(redirect);
    } catch (err) {
      dispatch(
        pushToast({
          title: mfaRequired ? "Verification failed" : "Sign in failed",
          description: (err as Error).message ?? "Please check your credentials.",
          variant: "destructive",
        })
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@gmail.com"
          leftIcon={<Mail />}
          error={!!errors.email}
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
          leftIcon={<Lock />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          }
          error={!!errors.password}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      {mfaRequired ? (
        <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <Label htmlFor="totp" className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            Two-factor code
          </Label>
          <Input
            id="totp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code from your authenticator"
            maxLength={6}
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Open Google or Microsoft Authenticator and enter the current code.
            Lost your device? Use one of your 4-digit recovery codes.
          </p>
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={isLoading}
        disabled={mfaRequired && totpCode.length < 4}
      >
        {mfaRequired ? "Verify code" : "Sign in"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Only Exterro employees with a verified <span className="font-medium">@gmail.com</span> address can sign in.
      </p>
    </form>
  );
}
