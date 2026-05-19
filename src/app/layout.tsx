import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "aequalis | the essence of equality",
  description:
    "Aequalis is a collaborative design platform for artisans, brands, retailers, and communities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
