import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { WalletProviders } from "@/components/wallet/wallet-providers";

const inter = Inter({
  variable: "--font-sans-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jbMono = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Shingi — Tamper-proof memory for AI agents",
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
      className={`${inter.variable} ${jbMono.variable} h-full antialiased`}
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
