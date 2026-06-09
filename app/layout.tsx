import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carb Quiz · AP Review",
  description: "คาร์โบไฮเดรต quiz — glycosidic linkage, hydrolysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${GeistSans.className} ${GeistMono.variable} dark`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
