import type { Metadata } from "next";
import { kanit, notoSansThai, thasadith } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carb Quiz · MWIT Biology",
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
      className={`${notoSansThai.variable} ${kanit.variable} ${thasadith.variable}`}
    >
      <body className={notoSansThai.className}>{children}</body>
    </html>
  );
}
