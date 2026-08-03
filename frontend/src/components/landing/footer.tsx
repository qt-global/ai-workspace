"use client";

import Image from "next/image";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

export type FooterProps = {
  className?: string;
};

export function Footer({ className }: FooterProps) {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <footer
      className={cn(
        "container-md mx-auto mt-24 flex flex-col items-center justify-center pb-8",
        className,
      )}
    >
      <hr className="m-0 h-px w-full border-none bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      <div className="container flex flex-col items-center justify-center gap-3 pt-8 pb-4">
        <div className="relative h-7 w-28 opacity-90">
          <Image
            src="/images/qtgo-logo.png"
            alt="QTGO Logo"
            width={110}
            height={28}
            className="object-contain"
          />
        </div>
        <p className="text-center text-sm text-gray-400 max-w-md font-light">
          Nền tảng Trợ lý AI Thông minh & Hệ sinh thái Đặt vé - Tự động hóa Doanh nghiệp QTGO
        </p>
      </div>
      <div className="text-gray-500 container flex flex-col items-center justify-center text-xs gap-1">
        <p>&copy; {year} QTGO - QT Global. All rights reserved.</p>
      </div>
    </footer>
  );
}
