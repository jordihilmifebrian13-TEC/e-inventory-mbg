import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { APP_NAME } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Pengelolaan inventori Program Makan Bergizi Gratis (MBG) untuk lingkungan SPPG.",
  icons: {
    icon: "/logo-mbg.svg",
    shortcut: "/logo-mbg.svg",
    apple: "/logo-mbg.svg",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-dvh font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
