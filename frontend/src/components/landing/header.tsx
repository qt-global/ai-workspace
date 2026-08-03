import Image from "next/image";
import Link from "next/link";
import { SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEFAULT_LOCALE, type Locale } from "@/core/i18n/locale";
import { getI18n } from "@/core/i18n/server";
import { cn } from "@/lib/utils";

import { MobileNav } from "./mobile-nav";

export type HeaderProps = {
  className?: string;
  homeURL?: string;
  locale?: Locale;
};

export async function Header({ className, homeURL, locale }: HeaderProps) {
  const { locale: resolvedLocale, t } = await getI18n(locale ?? DEFAULT_LOCALE);
  const lang = resolvedLocale.substring(0, 2);
  return (
    <header
      className={cn(
        "container-md fixed top-0 right-0 left-0 z-20 mx-auto flex h-16 items-center justify-between gap-3 px-4 backdrop-blur-md bg-black/40 border-b border-white/10",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-6">
        <Link
          href={homeURL ?? "/"}
          className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-white transition-opacity hover:opacity-90"
        >
          <div className="relative h-8 w-28 flex items-center">
            <Image
              src="/images/qtgo-logo.png"
              alt="QTGO Logo"
              width={110}
              height={32}
              className="object-contain max-h-8"
              priority
            />
          </div>
          <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            AI WORKSPACE
          </span>
        </Link>
      </div>
      <nav className="ml-auto hidden items-center gap-6 text-sm font-medium sm:flex md:mr-6">
        <Link
          href="/"
          className="text-gray-300 hover:text-white transition-colors"
        >
          Trang chủ
        </Link>
        <Link
          href="/workspace"
          className="text-gray-300 hover:text-white transition-colors"
        >
          Workspace
        </Link>
        <Link
          href={`/${lang}/docs`}
          className="text-gray-300 hover:text-white transition-colors"
        >
          {t.home.docs}
        </Link>
      </nav>
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 z-0 h-full w-full rounded-full opacity-40 blur-xl"
          style={{
            background: "linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)",
          }}
        />
        <Button
          asChild
          size="sm"
          className="relative z-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/25 border border-cyan-400/30"
        >
          <Link href="/workspace">
            <SparklesIcon className="size-4 mr-1.5" />
            <span>Mở Workspace</span>
          </Link>
        </Button>
      </div>
      <MobileNav
        links={[
          { href: "/", label: "Trang chủ" },
          { href: "/workspace", label: "Workspace" },
          { href: `/${lang}/docs`, label: t.home.docs },
        ]}
      />
    </header>
  );
}
