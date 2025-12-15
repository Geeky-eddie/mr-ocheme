import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mr ocheme's Flow Diagram Generator",
  description: "Create and export professional PRISMA flow diagrams for Mr ocheme. Edit text directly, export to PNG, SVG, PDF, or HTML.",
  keywords: ["PRISMA", "flow diagram", "systematic review", "research", "meta-analysis", "literature review"],
  authors: [{ name: "Mr ocheme's Diagram Generator" }],
  openGraph: {
    title: "Mr ocheme's Flow Diagram Generator",
    description: "Create and export professional PRISMA flow diagrams for Mr ocheme",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; 
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
