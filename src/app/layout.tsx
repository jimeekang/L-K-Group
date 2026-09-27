import type { Metadata } from "next";
import { siteAssets } from "@/shared/config/assets";
import { siteConfig } from "@/shared/config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: `${siteConfig.name} | Home maintenance & painting — Preview`,
  description:
    "Explore L&K Group's handyman, painting, existing kitchen cabinet repainting and product information. Website preview; contact details are being confirmed.",
  icons: {
    icon: {
      url: siteAssets.wordmark.src,
      type: "image/png",
      sizes: `${siteAssets.wordmark.width}x${siteAssets.wordmark.height}`,
    },
  },
  robots: {
    index: !siteConfig.isPrototype,
    follow: !siteConfig.isPrototype,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={siteConfig.language}>
      <body>{children}</body>
    </html>
  );
}
