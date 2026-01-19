import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DarkModeProvider } from "@/contexts/DarkModeContext";

const helveticaNeue = localFont({
  src: "../../public/fonts/helvetica-neue-regular.ttf",
  variable: "--font-helvetica-neue",
  display: "swap",
});

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
      <body className={`${helveticaNeue.className} ${dentonCondensed.variable}`}>
        <DarkModeProvider>
          {children}
        </DarkModeProvider>
      </body>
    </html>
  );
}