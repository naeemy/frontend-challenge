import React from "react";
import type { Metadata } from "next";

import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/sections";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Weather App",
  description: "Multi-city weather tracking application",
  keywords: ["weather", "forecast", "temperature", "cities"],
  authors: [{ name: "Weather App Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3b82f6",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta charSet="utf-8" />

        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
