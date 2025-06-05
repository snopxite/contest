import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voting System",
  description: "A modern voting system where users can vote on their favorite options",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}>
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Link 
                href="/" 
                className="text-xl font-semibold text-gray-800 hover:text-gray-600 transition-colors"
              >
                Voting System
              </Link>
              <div className="space-x-4">
                <Link 
                  href="/vote" 
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Vote Now
                </Link>
                {/* Add more navigation links here as needed */}
              </div>
            </div>
          </div>
        </nav>
        <div className="min-h-[calc(100vh-4rem)]">
          {children}
        </div>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
