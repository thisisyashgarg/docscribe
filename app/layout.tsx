import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

export const metadata = {
  title: "ScribeAI — Healthcare Dashboard",
  description:
    "AI-powered medical scribe that listens to doctor-patient conversations and generates structured clinical summaries.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${dmSerif.variable} font-sans antialiased`}>
        <Providers>
          <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
