import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const cairo = localFont({
  variable: "--font-cairo",
  src: "../../public/fonts/cairo-arabic-latin.woff2",
  weight: "200 1000",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cyber-nexus-one.vercel.app"),
  title: "Cyber Nexus - منصة تعلم الأمن السيبراني",
  description:
    "منصة شاملة لتعلم الأمن السيبراني لطلاب الجامعات والمبتدئين. تعلم القرصنة الأخلاقية وأمن الشبكات والتشفير والمزيد.",
  keywords: [
    "أمن سيبراني",
    "تعلم",
    "قرصنة أخلاقية",
    "أمن الشبكات",
    "تشفير",
    "تحديات أمنية",
    "دورات أمنية",
  ],
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/apple-icon",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
