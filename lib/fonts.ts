import { Kanit, Noto_Sans_Thai, Thasadith } from "next/font/google";

export const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const kanit = Kanit({
  subsets: ["thai", "latin"],
  variable: "--font-kanit",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const thasadith = Thasadith({
  subsets: ["thai", "latin"],
  variable: "--font-thasadith",
  weight: ["400", "700"],
  display: "swap",
});
