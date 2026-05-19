import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aequalis-gamma.vercel.app"),
  title: "aequalis | the essence of equality",
  description:
    "Aequalis is a collaborative design platform for artisans, brands, retailers, and communities.",
  openGraph: {
    title: "aequalis | the essence of equality",
    description:
      "Aequalis is a collaborative design platform for artisans, brands, retailers, and communities.",
    url: "https://aequalis-gamma.vercel.app",
    siteName: "aequalis",
    images: [
      {
        url: "/images/aequalis/og-preview.png",
        width: 1200,
        height: 630,
        alt: "aequalis",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "aequalis | the essence of equality",
    description:
      "Aequalis is a collaborative design platform for artisans, brands, retailers, and communities.",
    images: ["/images/aequalis/og-preview.png"],
  },
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
