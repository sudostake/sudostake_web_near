import "./globals.css";
import type { Metadata } from "next";
import { Geist_Mono, IBM_Plex_Sans, Press_Start_2P } from "next/font/google";
import Providers from "./providers";
import { Navigation } from "./components/Navigation";
import { SkipLink } from "./components/SkipLink";
import { Footer } from "./components/Footer";

const pixelDisplay = Press_Start_2P({
  variable: "--font-pixel-display",
  weight: "400",
  subsets: ["latin"],
});

const uiSans = IBM_Plex_Sans({
  variable: "--font-ui-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SudoStake | Stake-Backed Liquidity",
  description:
    "Borrow or lend without unstaking. Unlock USDC liquidity while validator rewards keep compounding.",
  openGraph: {
    title: "SudoStake | Stake-Backed Liquidity",
    description:
      "Borrow or lend without unstaking. Unlock USDC liquidity while validator rewards keep compounding.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SudoStake | Stake-Backed Liquidity",
    description:
      "Borrow or lend without unstaking. Unlock USDC liquidity while validator rewards keep compounding.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pixelDisplay.variable} ${uiSans.variable} ${geistMono.variable}`}>
        <Providers>
          <SkipLink />
          <Navigation />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
