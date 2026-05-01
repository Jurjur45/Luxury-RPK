import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./app/globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Luxury RPK | Tienda Exclusiva",
  description: "Moda de lujo y accesorios premium",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white`}>
        <Header />
        <main>
          {children}
        </main>
        {/* 2. Borra la etiqueta <DarkModeToggle /> de aquí */}
      </body>
    </html>
  );
}