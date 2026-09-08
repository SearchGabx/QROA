import type { Metadata } from "next";
import { Red_Hat_Display } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Attendance QR",
  description: "QR-based attendance tracking",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${redHatDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}