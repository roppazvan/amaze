import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amaze — Memory Maze Game",
  description:
    "Navigate the maze, but you can't go back. Memorize the path to escape. 10 levels of increasing difficulty.",
  openGraph: {
    title: "Amaze — Memory Maze Game",
    description: "Navigate the maze, but you can't go back. Memorize the path to escape.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0d0d1a] text-white font-sans">
        {children}
      </body>
    </html>
  );
}
