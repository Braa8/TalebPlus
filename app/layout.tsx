import type { Metadata } from "next";
import { Readex_Pro, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "../lib/utils";
import { NextAuthProvider } from "./providers/NextAuthProviders";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const readexPro = Readex_Pro({
  variable: "--font-readex-pro",
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "طالب بلس",
  description: "المنصّة التي تمنح الطلاب حلولاً أكاديمية احترافية تصنع الفارق",
  icons:{
    icon: "/MainLogo.png",
  } ,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cn("font-sans", geist.variable)}>
      <body
        className={`${readexPro.variable} antialiased`}
      >
        <NextAuthProvider>
           {children}
        </NextAuthProvider>
       
      </body>
    </html>
  );
}
