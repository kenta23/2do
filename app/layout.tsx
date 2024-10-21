import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import ProviderLocal from "@/components/LocalizationProvider";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import Store from "@/providers/Store";
import TodoNotifyContextProvider from "@/providers/TodoNotifyContextProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "2Do",
  description: "Todo list app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <body className={inter.className}>
        <Store>
          <ReactQueryProvider>
            <ProviderLocal>
              <SessionProvider session={session}>{children}</SessionProvider>
            </ProviderLocal>
          </ReactQueryProvider>
        </Store>
      </body>
    </html>
  );
}
