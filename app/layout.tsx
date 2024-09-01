import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import ProviderLocal from "@/components/LocalizationProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "2Do",
  description: "Todo list app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          <ProviderLocal>{children}</ProviderLocal>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
