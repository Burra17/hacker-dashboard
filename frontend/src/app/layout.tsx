import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import DashboardConnection from "@/components/DashboardConnection";
import QueryProvider from "@/components/QueryProvider";
import ThemeSync from "@/components/ThemeSync";
import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hacker Dashboard",
  description: "Live terminal-style dashboard streaming real-time data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="matrix"
      className={`${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-mono">
        <ThemeSync />
        <DashboardConnection />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
