import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      <body className={`${inter.variable} antialiased font-sans`}>
        <Providers>
          <main className="mx-auto max-w-5xl px-4 py-12">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
