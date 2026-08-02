import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SIPANDU",
    template: "%s | SIPANDU",
  },
  description: "Sistem Informasi Posyandu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}

        <Toaster
          position="top-right"
          richColors
          closeButton
          expand={false}
          theme="light"
          duration={3000}
          toastOptions={{
            classNames: {
              toast: "rounded-xl border shadow-lg",
              title: "font-semibold",
              description: "text-sm",
            },
          }}
        />
      </body>
    </html>
  );
}