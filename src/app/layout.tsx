import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { DarkModeProvider } from "@/contexts/DarkModeContext";

const inter = Inter({ subsets: ["latin"] });

const dentonCondensed = localFont({
  src: "../../public/fonts/DentonCondensedTest-RegularItalic.otf",
  variable: "--font-denton-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Acliptic",
  description: "Acliptic - Your Content Creation Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${dentonCondensed.variable}`}>
        <DarkModeProvider>
          {children}
        </DarkModeProvider>
      </body>
    </html>
  );
}