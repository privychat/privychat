import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import PrivyWalletProvider from "@/providers/privy-provider";
import {cn} from "@/lib/utils";
import {ThemeProvider} from "@/providers/theme-provider";
import PushUserProvider from "@/providers/push-provider";
import {Toaster} from "@/components/ui/toaster";
import GoogleAnalytics from "@/components/google-analytics";

const inter = Inter({subsets: ["latin"], variable: "--font-sans"});

export const metadata: Metadata = {
  title: "PrivyChat",
  description: "Native web3 chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleAnalytics />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PrivyWalletProvider>
            <PushUserProvider>{children}</PushUserProvider>
          </PrivyWalletProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
