import "@/styles/globals.css";

import { type Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";
import { DEFAULT_LOCALE } from "@/core/i18n/locale";

export const metadata: Metadata = {
  metadataBase: new URL("https://qtgo.vn"),
  title: {
    default: "QTGO AI Workspace | Nền tảng Trợ lý AI Thông minh & Tự động hóa",
    template: "%s | QTGO AI Workspace",
  },
  description:
    "Nền tảng Trợ lý AI thế hệ mới cho QTGO: Tra cứu vé máy bay, lập lịch trình du lịch, phân tích dữ liệu CRM/CMS & tự động hóa CSKH.",
  keywords: [
    "QTGO",
    "QTGO AI",
    "QTGO AI Workspace",
    "Vé máy bay",
    "Săn vé máy bay",
    "Trợ lý AI",
    "AI Agent",
    "Tự động hóa CSKH",
    "Phân tích dữ liệu CRM",
  ],
  authors: [{ name: "QTGO", url: "https://qtgo.vn" }],
  creator: "QTGO",
  publisher: "QTGO - QT Global",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png" }],
  },
  openGraph: {
    title: "QTGO AI Workspace | Nền tảng Trợ lý AI Thông minh & Tự động hóa",
    description:
      "Nền tảng Trợ lý AI thế hệ mới cho QTGO: Tra cứu vé máy bay, lập lịch trình du lịch, phân tích dữ liệu CRM/CMS & tự động hóa CSKH.",
    url: "https://qtgo.vn",
    siteName: "QTGO AI Workspace",
    images: [
      {
        url: "/images/qtgo-logo.png",
        width: 800,
        height: 600,
        alt: "QTGO AI Workspace Logo",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QTGO AI Workspace | Nền tảng Trợ lý AI Thông minh & Tự động hóa",
    description:
      "Nền tảng Trợ lý AI thế hệ mới cho QTGO: Tra cứu vé máy bay, lập lịch trình du lịch, phân tích dữ liệu CRM/CMS & tự động hóa CSKH.",
    images: ["/images/qtgo-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      suppressContentEditableWarning
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
