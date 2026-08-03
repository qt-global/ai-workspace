"use client";

import { AtSign, LockKeyhole } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { RememberSessionOption } from "@/components/auth/remember-session-option";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/core/auth/AuthProvider";
import { resolveAuthNextPath } from "@/core/auth/next-path";
import {
  loadRememberLoginPreference,
  saveRememberLoginPreference,
} from "@/core/auth/remember-login";
import {
  canCreateRegularAccount,
  fetchSetupStatus,
  type SetupStatusResponse,
} from "@/core/auth/setup";
import { parseAuthError } from "@/core/auth/types";
import { useI18n } from "@/core/i18n/hooks";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [ssoProviders, setSsoProviders] = useState<
    { id: string; display_name: string; type: string }[]
  >([]);
  const [setupStatus, setSetupStatus] = useState<SetupStatusResponse | null>(
    null,
  );
  const [setupStatusPhase, setSetupStatusPhase] = useState<
    "checking" | "ready" | "unavailable"
  >("checking");
  const [setupStatusAttempt, setSetupStatusAttempt] = useState(0);

  // Extract error from query params (e.g., ?error=sso_failed)
  const errorParam = searchParams.get("error");
  const [error, setError] = useState(
    errorParam
      ? (t.login.errors[errorParam as keyof typeof t.login.errors] ??
          t.login.authFailed)
      : "",
  );
  // Soft hint shown after a failed login when SSO is configured: an SSO-only
  // account has no local password, so the backend returns a generic
  // "incorrect email or password" (deliberately, to avoid account enumeration).
  // Nudge the user toward the SSO buttons without confirming the account exists.
  const [showSsoHint, setShowSsoHint] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get next parameter for validated redirect
  const nextParam = searchParams.get("next");
  const redirectPath = resolveAuthNextPath(nextParam);
  const regularSignupAllowed = canCreateRegularAccount({
    // A failed probe must not expose registration while the system's setup
    // state is unknown. Existing users can still sign in normally.
    checked: setupStatusPhase === "ready",
    status: setupStatus,
  });
  const systemNeedsAdminSetup = setupStatus?.needs_setup === true;
  const showSetupStatusUnavailable =
    setupStatusPhase === "unavailable" ||
    (setupStatusAttempt > 0 && setupStatusPhase === "checking");

  // Redirect if already authenticated (client-side, post-login)
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router]);

  useEffect(() => {
    const preference = loadRememberLoginPreference();
    setRememberMe(preference.rememberMe);
    if (preference.email) {
      setEmail(preference.email);
    }
  }, []);

  // Fetch setup state independently so retrying a slow Gateway does not also
  // refetch unrelated auth-provider configuration.
  useEffect(() => {
    let cancelled = false;
    setSetupStatusPhase("checking");

    void fetchSetupStatus()
      .then((data) => {
        if (cancelled) return;
        setSetupStatus(data);
        setSetupStatusPhase("ready");
        if (data.needs_setup) {
          setIsLogin(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSetupStatus(null);
          setSetupStatusPhase("unavailable");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [setupStatusAttempt]);

  // SSO providers are static for the page lifetime and should not be coupled to
  // setup-status retries.
  useEffect(() => {
    let cancelled = false;

    void fetch("/api/v1/auth/providers")
      .then((r) => r.json())
      .then(
        (data: {
          providers: { id: string; display_name: string; type: string }[];
        }) => {
          if (!cancelled) {
            setSsoProviders(data.providers ?? []);
          }
        },
      )
      .catch(() => {
        // Ignore errors; no SSO providers shown
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowSsoHint(false);
    setLoading(true);

    if (!isLogin && !regularSignupAllowed) {
      setError(t.login.adminSetupRequiredDescription);
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin
        ? "/api/v1/auth/login/local"
        : "/api/v1/auth/register";
      const body = isLogin
        ? new URLSearchParams({
            password,
            remember_me: String(rememberMe),
            username: email,
          })
        : JSON.stringify({ email, password, remember_me: rememberMe });

      const headers: HeadersInit = isLogin
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : { "Content-Type": "application/json" };

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body,
        credentials: "include", // Important: include HttpOnly cookie
      });

      if (!res.ok) {
        const data = await res.json();
        const authError = parseAuthError(data);
        setError(authError.message);
        // On a failed login with SSO configured, surface a hint pointing at the
        // SSO buttons — the "wrong password" may really mean "this is an SSO account".
        if (isLogin && ssoProviders.length > 0) {
          setShowSsoHint(true);
        }
        return;
      }

      saveRememberLoginPreference({ email, rememberMe });

      // Both login and register set a cookie — redirect to workspace
      router.push(redirectPath);
    } catch {
      setError(t.login.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-[#0a0a0a] p-4 sm:p-6 text-white">
      {/* Background Glows matching homepage */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 h-[450px] w-[500px] rounded-full opacity-25 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #00c6ff 0%, #0072ff 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-10 right-1/4 z-0 h-[300px] w-[300px] rounded-full opacity-15 blur-[100px]"
        style={{
          background: "radial-gradient(circle, #7928ca 0%, #ff0080 100%)",
        }}
      />

      {/* Top Header Back to Home link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/60 px-4 py-2 text-xs font-medium text-zinc-300 backdrop-blur-md transition-all hover:border-cyan-500/40 hover:bg-zinc-800/80 hover:text-white"
        >
          <span className="text-cyan-400">←</span>
          <span>{t.login.backToHome}</span>
        </Link>
      </div>

      {/* Main Auth Card Container */}
      <div
        data-testid="auth-card"
        className="relative z-10 my-8 w-full max-w-[600px] space-y-7 rounded-2xl border border-white/10 bg-zinc-900/80 p-6 sm:p-12 text-zinc-100 shadow-[0_0_50px_rgba(0,198,255,0.08)] backdrop-blur-xl"
      >
        {/* Top Gradient Accent Line */}
        <div className="absolute top-0 right-0 left-0 h-1 rounded-t-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600" />

        <div className="flex flex-col items-center gap-3 text-center">
          <Link href="/" className="group transition-transform hover:scale-105">
            <div className="relative mb-1 flex h-14 w-44 items-center justify-center drop-shadow-[0_0_18px_rgba(0,198,255,0.35)]">
              <Image
                src="/images/qtgo-logo.png"
                alt="QTGO Logo"
                width={150}
                height={42}
                className="h-auto w-40 object-contain"
                priority
              />
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1 backdrop-blur-md">
            <span className="text-xs font-semibold tracking-wider text-cyan-300 uppercase">
              QTGO AI Workspace
            </span>
          </div>
          <p className="mt-1 text-center text-xl font-bold tracking-tight text-white sm:text-2xl">
            {isLogin ? t.login.signInTitle : t.login.createAccountTitle}
          </p>
        </div>

        {showSetupStatusUnavailable && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-200 backdrop-blur-md"
          >
            <p className="font-medium text-amber-300">{t.login.serviceUnavailableTitle}</p>
            <p className="mt-1 text-xs text-amber-200/80">
              {t.login.serviceUnavailableDescription}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 border-amber-500/40 bg-amber-950/50 text-amber-300 hover:bg-amber-900/60 hover:text-white"
              disabled={setupStatusPhase === "checking"}
              onClick={() => {
                setSetupStatusPhase("checking");
                setSetupStatusAttempt((attempt) => attempt + 1);
              }}
            >
              {setupStatusPhase === "checking"
                ? t.login.pleaseWait
                : t.login.retry}
            </Button>
          </div>
        )}

        {systemNeedsAdminSetup && (
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-4 py-3 text-sm text-cyan-200 backdrop-blur-md">
            <p className="font-medium text-cyan-300">{t.login.adminSetupRequiredTitle}</p>
            <p className="mt-1 text-xs text-cyan-200/80">
              {t.login.adminSetupRequiredDescription}
            </p>
            <Link
              href="/setup"
              className="mt-2 inline-block font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              {t.login.createAdminAccount} →
            </Link>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-[480px] space-y-4"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-zinc-300"
            >
              {t.login.email}
            </label>
            <div className="relative">
              <AtSign
                aria-hidden="true"
                className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-zinc-500"
              />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.login.emailPlaceholder}
                className="h-12 rounded-xl border-zinc-800 bg-zinc-950/90 pl-11 text-white placeholder:text-zinc-500 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-300"
            >
              {t.login.password}
            </label>
            <div className="relative">
              <LockKeyhole
                aria-hidden="true"
                className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-zinc-500"
              />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.login.passwordPlaceholder}
                className="h-12 rounded-xl border-zinc-800 bg-zinc-950/90 pl-11 text-white placeholder:text-zinc-500 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20"
                required
                minLength={isLogin ? 6 : 8}
              />
            </div>
          </div>

          <RememberSessionOption
            checked={rememberMe}
            onCheckedChange={setRememberMe}
          />

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30 transition-all duration-200 hover:from-cyan-400 hover:to-indigo-500 hover:shadow-cyan-500/30 focus-visible:ring-cyan-500/30"
            disabled={loading}
          >
            {loading
              ? t.login.pleaseWait
              : isLogin
                ? t.login.signIn
                : t.login.createAccount}
          </Button>
        </form>

        {ssoProviders.length > 0 && (
          <div className="mx-auto w-full max-w-[480px] space-y-3">
            {isLogin && (
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-900 px-3 text-zinc-500">
                    {t.login.orContinueWith}
                  </span>
                </div>
              </div>
            )}
            {showSsoHint && (
              <p className="text-center text-xs text-zinc-400">
                {t.login.ssoHint}
              </p>
            )}
            {ssoProviders.map((provider) => (
              <Button
                key={provider.id}
                type="button"
                variant="outline"
                className="h-11 w-full rounded-xl border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:bg-zinc-800 hover:text-white"
                disabled={loading}
                onClick={() => {
                  window.location.href = `/api/v1/auth/oauth/${provider.id}?next=${encodeURIComponent(redirectPath)}&remember_me=${String(rememberMe)}`;
                }}
              >
                {t.login.continueWith(provider.display_name)}
              </Button>
            ))}
          </div>
        )}

        {regularSignupAllowed && (
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setShowSsoHint(false);
              }}
              className="font-medium text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              {isLogin ? t.login.noAccountSignUp : t.login.haveAccountSignIn}
            </button>
          </div>
        )}

        <div className="text-center text-xs text-zinc-500">
          <Link href="/" className="hover:text-cyan-400 hover:underline transition-colors">
            {t.login.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
