"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { RememberSessionOption } from "@/components/auth/remember-session-option";
import { Button } from "@/components/ui/button";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
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
  const { theme, resolvedTheme } = useTheme();
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

  const actualTheme = theme === "system" ? resolvedTheme : theme;

  if (mode === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      </div>
    );
  }

  if (mode === "unavailable") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <div>
            <h1 className="text-xl font-semibold">
              {t.login.serviceUnavailableTitle}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {t.login.serviceUnavailableDescription}
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button
              type="button"
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
      <div className="bg-background relative flex min-h-screen items-center justify-center">
        <FlickeringGrid
          className="absolute inset-0 z-0 opacity-40"
          squareSize={4}
          gridGap={4}
          color={actualTheme === "dark" ? "cyan" : "black"}
          maxOpacity={0.2}
          flickerChance={0.2}
        />
        <div className="relative z-10 border-white/10 bg-black/60 w-full max-w-md space-y-6 rounded-3xl border p-8 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
          <div className="text-center flex flex-col items-center gap-2">
            <div className="relative h-10 w-36 mb-1 flex items-center justify-center">
              <Image
                src="/images/qtgo-logo.png"
                alt="QTGO Logo"
                width={144}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">QTGO AI Workspace</h1>
            <p className="text-muted-foreground text-sm font-medium">Khởi tạo Tài khoản Quản trị viên (Admin)</p>
            <p className="text-muted-foreground text-xs font-light">
              Thiết lập tài khoản admin để bắt đầu quản trị hệ thống QTGO AI.
            </p>
          </div>
          <form onSubmit={handleInitAdmin} className="space-y-3">
            <div className="flex flex-col space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-200">
                Email quản trị
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@qtgo.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-200">
                Mật khẩu
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Mật khẩu (tối thiểu 8 ký tự)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-200">
                Xác nhận Mật khẩu
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <RememberSessionOption
              checked={rememberMe}
              onCheckedChange={setRememberMe}
            />
            {error && <p className="ms-1 text-sm text-red-500">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 border border-cyan-400/30 h-10 mt-2 rounded-xl"
              disabled={loading}
            >
              {loading ? "Đang khởi tạo tài khoản…" : "Tạo Tài Khoản Admin QTGO"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // ── Change-password form (needs_setup after login) ─────────────────
  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center">
      <FlickeringGrid
        className="absolute inset-0 z-0 opacity-40"
        squareSize={4}
        gridGap={4}
        color={actualTheme === "dark" ? "cyan" : "black"}
        maxOpacity={0.2}
        flickerChance={0.2}
      />
      <div className="relative z-10 border-white/10 bg-black/60 w-full max-w-md space-y-6 rounded-3xl border p-8 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
        <div className="text-center flex flex-col items-center gap-2">
          <div className="relative h-10 w-36 mb-1 flex items-center justify-center">
            <Image
              src="/images/qtgo-logo.png"
              alt="QTGO Logo"
              width={144}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">QTGO AI Workspace</h1>
          <p className="text-muted-foreground text-sm font-medium">
            Hoàn tất Cấu hình Tài khoản Admin
          </p>
          <p className="text-muted-foreground text-xs font-light">
            Cập nhật email chính thức và mật khẩu mới cho quản trị viên.
          </p>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            type="email"
            placeholder="Email của bạn (ví dụ: admin@qtgo.vn)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Mật khẩu hiện tại"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          <Input
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
          <RememberSessionOption
            checked={rememberMe}
            onCheckedChange={setRememberMe}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 border border-cyan-400/30 h-10 rounded-xl"
            disabled={loading}
          >
            {loading ? "Đang cập nhật…" : "Hoàn Tất Cấu Hình"}
          </Button>
        </form>
      </div>
    </div>
  );
}
