"use client";

import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { ArrowLeft, AtSignIcon, CircleHelp, LockIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthDivider } from "@/components/basic/auth/auth-divider";
import { GithubIcon } from "@/components/basic/auth/github-icon";
import { GoogleIcon } from "@/components/basic/auth/google-icon";
import { Logo } from "@/components/basic/auth/logo";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import {
  auth,
  githubProvider,
  googleProvider,
} from "@/scalvio/firebase/firebase";

type AuthMode = "login" | "register" | "forgot" | "resetPassword";

interface AuthPageProps {
  initialMode?: "login" | "register" | "resetPassword";
}

function AuthPageContent({ initialMode = "login" }: AuthPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [mode, setMode] = useState<AuthMode>(
    oobCode ? "resetPassword" : initialMode,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState<
    "email" | "google" | "github" | "reset" | "confirmReset" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (oobCode) {
      setMode("resetPassword");
    }
  }, [oobCode]);

  function getErrorMessage(err: unknown): string {
    if (typeof err === "object" && err !== null && "code" in err) {
      switch ((err as { code: string }).code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
          return "Invalid email or password.";
        case "auth/user-not-found":
          return "No account found with this email.";
        case "auth/email-already-in-use":
          return "Email is already registered. Please sign in.";
        case "auth/weak-password":
          return "Password should be at least 6 characters.";
        case "auth/popup-closed-by-user":
          return "Sign in was cancelled.";
        case "auth/invalid-email":
          return "Please enter a valid email address.";
        case "auth/expired-action-code":
          return "The password reset link has expired. Please request a new one.";
        case "auth/invalid-action-code":
          return "The password reset link is invalid or already used.";
        default:
          return (
            (err as { message?: string }).message || "Authentication failed."
          );
      }
    }
    return "Something went wrong. Please try again.";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // 1. Resetting password with email link code
    if (mode === "resetPassword") {
      if (!oobCode) {
        setError("Invalid or missing reset code. Please request a new link.");
        return;
      }
      if (password.length < 6) {
        setError("Password should be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      setLoading("confirmReset");
      try {
        await confirmPasswordReset(auth, oobCode, password);
        setMessage("Password updated successfully! You can now sign in.");
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(null);
      }
      return;
    }

    // 2. Requesting password reset email
    if (mode === "forgot") {
      if (!email) return;
      setLoading("reset");
      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/auth?mode=resetPassword`,
          handleCodeInApp: true,
        };
        await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings);
        setMessage(
          "Password reset link sent! Follow the link in your email to reset your password right here.",
        );
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(null);
      }
      return;
    }

    // 3. Email login or registration
    if (!email || !password) return;
    setLoading("email");
    try {
      if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      router.push("/admin");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(null);
    }
  }

  async function handleOAuth(provider: "google" | "github") {
    setError(null);
    setMessage(null);
    setLoading(provider);
    try {
      const authProvider =
        provider === "google" ? googleProvider : githubProvider;
      await signInWithPopup(auth, authProvider);
      router.push("/admin");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="relative w-full overflow-hidden md:h-screen">
      <div className="flex items-center justify-between p-4 md:absolute md:inset-x-0 md:top-0 md:p-8 md:pointer-events-none z-10">
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => router.back()}
          disabled={loading !== null}
          className="md:pointer-events-auto"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => window.open("mailto:support@scalvio.com", "_blank")}
          disabled={loading !== null}
          className="md:pointer-events-auto"
        >
          <CircleHelp className="size-4" />
          Help
        </Button>
      </div>

      <div
        className={cn(
          "relative mx-auto flex min-h-screen w-full max-w-sm flex-col justify-between p-6 md:p-8",
        )}
      >
        <div className="flex justify-center">
          <Link href="/">
            <Logo className="h-4.5" />
          </Link>
        </div>

        <div className="fade-in slide-in-from-bottom-4 w-full animate-in space-y-4 duration-600">
          <div className="flex flex-col space-y-1">
            <h1 className="font-bold text-2xl tracking-wide">
              {mode === "resetPassword"
                ? "Set New Password"
                : mode === "forgot"
                  ? "Forgot Password"
                  : mode === "register"
                    ? "Create Account"
                    : "Welcome Back"}
            </h1>
            <p className="text-base text-muted-foreground">
              {mode === "resetPassword"
                ? "Enter your new password below"
                : mode === "forgot"
                  ? "Enter your email to receive a reset link"
                  : mode === "register"
                    ? "Sign up to access your dashboard"
                    : "Sign in to access your dashboard"}
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode !== "resetPassword" && (
              <InputGroup>
                <InputGroupInput
                  placeholder="your.email@example.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading !== null}
                />
                <InputGroupAddon align="inline-start">
                  <AtSignIcon />
                </InputGroupAddon>
              </InputGroup>
            )}

            {mode !== "forgot" && (
              <InputGroup>
                <InputGroupInput
                  placeholder={
                    mode === "resetPassword" ? "New password" : "Password"
                  }
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading !== null}
                />
                <InputGroupAddon align="inline-start">
                  <LockIcon />
                </InputGroupAddon>
              </InputGroup>
            )}

            {mode === "resetPassword" && (
              <InputGroup>
                <InputGroupInput
                  placeholder="Confirm new password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading !== null}
                />
                <InputGroupAddon align="inline-start">
                  <LockIcon />
                </InputGroupAddon>
              </InputGroup>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError(null);
                    setMessage(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                  disabled={loading !== null}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              className="w-full"
              size="sm"
              type="submit"
              loading={
                loading === "email" ||
                loading === "reset" ||
                loading === "confirmReset"
              }
              disabled={loading !== null}
            >
              {mode === "resetPassword"
                ? "Update Password"
                : mode === "forgot"
                  ? "Send Reset Link"
                  : mode === "register"
                    ? "Sign Up with Email"
                    : "Sign In with Email"}
            </Button>
          </form>

          <div className="text-center text-sm">
            {mode === "forgot" || mode === "resetPassword" ? (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setMessage(null);
                }}
                className="text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                disabled={loading !== null}
              >
                Back to Sign In
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError(null);
                  setMessage(null);
                }}
                className="text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                disabled={loading !== null}
              >
                {mode === "register"
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
              </button>
            )}
          </div>

          {mode !== "forgot" && mode !== "resetPassword" && (
            <>
              <AuthDivider>OR CONTINUE WITH</AuthDivider>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  type="button"
                  variant="outline"
                  loading={loading === "google"}
                  disabled={loading !== null}
                  onClick={() => handleOAuth("google")}
                >
                  <GoogleIcon data-icon="inline-start" />
                  Google
                </Button>
                <Button
                  className="w-full"
                  type="button"
                  variant="outline"
                  loading={loading === "github"}
                  disabled={loading !== null}
                  onClick={() => handleOAuth("github")}
                >
                  <GithubIcon data-icon="inline-start" />
                  GitHub
                </Button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-muted-foreground text-sm">
          This site is protected by reCAPTCHA and the Google{" "}
          <Link
            className="underline underline-offset-4 hover:text-primary"
            href="/privacy"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            className="underline underline-offset-4 hover:text-primary"
            href="/terms"
          >
            Terms of Service
          </Link>{" "}
          apply.
        </p>
      </div>
    </div>
  );
}

export function AuthPage(props: AuthPageProps) {
  return (
    <Suspense fallback={null}>
      <AuthPageContent {...props} />
    </Suspense>
  );
}
