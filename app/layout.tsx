import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { WalletProviders } from "@/components/wallet/wallet-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shingi — 真偽 · Tamper-proof memory for AI agents",
  description:
    "Hash-anchored audit trail for autonomous AI agents on Solana. Verify that an agent's recorded memory hasn't been edited since it was committed onchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <WalletProviders>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </WalletProviders>
      </body>
    </html>
  );
}
