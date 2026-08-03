"use client";

import { AtSign, LockKeyhole } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RememberSessionOption } from "@/components/auth/remember-session-option";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCsrfHeaders } from "@/core/api/fetcher";
import { useAuth } from "@/core/auth/AuthProvider";
import { loadRememberLoginPreference } from "@/core/auth/remember-login";
import {
  fetchSetupStatus,
  isSystemAlreadyInitializedError,
} from "@/core/auth/setup";
import { parseAuthError } from "@/core/auth/types";
import { useI18n } from "@/core/i18n/hooks";

type SetupMode = "loading" | "init_admin" | "change_password" | "unavailable";

export default function SetupPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [mode, setMode] = useState<SetupMode>("loading");
  const [setupStatusAttempt, setSetupStatusAttempt] = useState(0);

  // --- Shared state ---
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    () => loadRememberLoginPreference().rememberMe,
  );

  // --- Change-password mode only ---
  const [currentPassword, setCurrentPassword] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (isAuthenticated && user?.needs_setup) {
      setMode("change_password");
    } else if (!isAuthenticated) {
      // Check if the system has no users yet. A slow Gateway must not leave the
      // setup page in an infinite loading state or silently redirect away.
      setMode("loading");
      void fetchSetupStatus()
        .then((data: { needs_setup?: boolean }) => {
          if (cancelled) return;
          if (data.needs_setup) {
            setMode("init_admin");
          } else {
            // System already set up and user is not logged in — go to login
            router.replace("/login");
          }
        })
        .catch(() => {
          if (!cancelled) setMode("unavailable");
        });
    } else {
      // Authenticated but needs_setup is false — already set up
      router.replace("/workspace");
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user, router, setupStatusAttempt]);

  // ── Init-admin handler ─────────────────────────────────────────────
  const handleInitAdmin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password: newPassword,
          remember_me: rememberMe,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (isSystemAlreadyInitializedError(data)) {
          router.replace("/login");
          return;
        }
        const authError = parseAuthError(data);
        setError(authError.message);
        return;
      }

      router.push("/workspace");
    } catch {
      setError("Lỗi kết nối mạng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ── Change-password handler ────────────────────────────────────────
  const handleChangePassword = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }
    if (newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getCsrfHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_email: email || undefined,
          remember_me: rememberMe,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        const authError = parseAuthError(data);
        setError(authError.message);
        return;
      }

      router.push("/workspace");
    } catch {
      setError("Lỗi kết nối mạng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "loading") {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4 text-white">
        <div className="relative z-10 rounded-2xl border border-white/10 bg-zinc-900/80 px-8 py-10 text-center text-sm text-zinc-300 shadow-[0_0_40px_rgba(0,198,255,0.08)] backdrop-blur-xl">
          Đang tải...
        </div>
      </div>
    );
  }

  if (mode === "unavailable") {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 text-white">
        <div className="relative z-10 w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-8 text-center text-zinc-100 shadow-[0_0_40px_rgba(0,198,255,0.08)] backdrop-blur-xl">
          <div>
            <h1 className="text-xl font-bold text-white">
              {t.login.serviceUnavailableTitle}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {t.login.serviceUnavailableDescription}
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button
              type="button"
              className="h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500"
              onClick={() => {
                setMode("loading");
                setSetupStatusAttempt((attempt) => attempt + 1);
              }}
            >
              {t.login.retry}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:bg-zinc-800 hover:text-white"
              onClick={() => router.replace("/login")}
            >
              {t.login.signIn}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Admin initialization form ──────────────────────────────────────
  if (mode === "init_admin") {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-[#0a0a0a] p-4 sm:p-6 text-white">
        {/* Background Glows matching homepage */}
        <div
          className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 h-[450px] w-[500px] rounded-full opacity-25 blur-[120px]"
          style={{
            background: "radial-gradient(circle, #00c6ff 0%, #0072ff 100%)",
          }}
        />

        {/* Top Header Back to Home link */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/60 px-4 py-2 text-xs font-medium text-zinc-300 backdrop-blur-md transition-all hover:border-cyan-500/40 hover:bg-zinc-800/80 hover:text-white"
          >
            <span className="text-cyan-400">←</span>
            <span>Trang chủ</span>
          </Link>
        </div>

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
              Khởi tạo Tài khoản Quản trị viên (Admin)
            </p>
            <p className="text-xs sm:text-sm text-zinc-400">
              Thiết lập tài khoản admin để bắt đầu quản trị hệ thống QTGO AI.
            </p>
          </div>
          <form
            onSubmit={handleInitAdmin}
            className="mx-auto w-full max-w-[480px] space-y-4"
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-zinc-300"
              >
                Email quản trị
              </label>
              <div className="relative">
                <AtSign
                  aria-hidden="true"
                  className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-zinc-500"
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@qtgo.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                Mật khẩu
              </label>
              <div className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-zinc-500"
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="Mật khẩu (tối thiểu 8 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 rounded-xl border-zinc-800 bg-zinc-950/90 pl-11 text-white placeholder:text-zinc-500 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20"
                  required
                  minLength={8}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-zinc-300"
              >
                Xác nhận Mật khẩu
              </label>
              <div className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-zinc-500"
                />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-xl border-zinc-800 bg-zinc-950/90 pl-11 text-white placeholder:text-zinc-500 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20"
                  required
                  minLength={8}
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
              className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30 transition-all duration-200 hover:from-cyan-400 hover:to-indigo-500 focus-visible:ring-cyan-500/30"
              disabled={loading}
            >
              {loading
                ? "Đang khởi tạo tài khoản…"
                : "Tạo Tài Khoản Admin QTGO"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // ── Change-password form (needs_setup after login) ─────────────────
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-[#0a0a0a] p-4 sm:p-6 text-white">
      {/* Background Glows matching homepage */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 h-[450px] w-[500px] rounded-full opacity-25 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #00c6ff 0%, #0072ff 100%)",
        }}
      />

      {/* Top Header Back to Home link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/60 px-4 py-2 text-xs font-medium text-zinc-300 backdrop-blur-md transition-all hover:border-cyan-500/40 hover:bg-zinc-800/80 hover:text-white"
        >
          <span className="text-cyan-400">←</span>
          <span>Trang chủ</span>
        </Link>
      </div>

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
            Hoàn tất Cấu hình Tài khoản Admin
          </p>
          <p className="text-xs sm:text-sm text-zinc-400">
            Cập nhật email chính thức và mật khẩu mới cho quản trị viên.
          </p>
        </div>
        <form
          onSubmit={handleChangePassword}
          className="mx-auto w-full max-w-[480px] space-y-4"
        >
          <div className="relative">
            <AtSign
              aria-hidden="true"
              className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-zinc-500"
            />
            <Input
              type="email"
              placeholder="Email của bạn (ví dụ: admin@qtgo.vn)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl border-zinc-800 bg-zinc-950/90 pl-11 text-white placeholder:text-zinc-500 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20"
              required
            />
          </div>
          <div className="relative">
            <LockKeyhole
              aria-hidden="true"
              className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-zinc-500"
            />
            <Input
              type="password"
              placeholder="Mật khẩu hiện tại"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-12 rounded-xl border-zinc-800 bg-zinc-950/90 pl-11 text-white placeholder:text-zinc-500 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20"
              required
            />
          </div>
          <div className="relative">
            <LockKeyhole
              aria-hidden="true"
              className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-zinc-500"
            />
            <Input
              type="password"
              placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 rounded-xl border-zinc-800 bg-zinc-950/90 pl-11 text-white placeholder:text-zinc-500 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20"
              required
              minLength={8}
            />
          </div>
          <div className="relative">
            <LockKeyhole
              aria-hidden="true"
              className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-zinc-500"
            />
            <Input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 rounded-xl border-zinc-800 bg-zinc-950/90 pl-11 text-white placeholder:text-zinc-500 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20"
              required
              minLength={8}
            />
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
            className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30 transition-all duration-200 hover:from-cyan-400 hover:to-indigo-500 focus-visible:ring-cyan-500/30"
            disabled={loading}
          >
            {loading ? "Đang cập nhật…" : "Hoàn Tất Cấu Hình"}
          </Button>
        </form>
      </div>
    </div>
  );
}
