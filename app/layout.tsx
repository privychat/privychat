import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/providers/theme-provider";
import PrivyWalletProvider from "@/providers/privy-wallet-provider";
import AppProvider from "@/providers/push-provider";
import {Toaster} from "@/components/ui/toaster";

const inter = Inter({subsets: ["latin"]});

export const metadata = {
  title: "PrivyChat",
  description: "text any wallet address with PrivyChat",

  generator: "Next.js",
  manifest: "/manifest.json",

  icons: [
    {rel: "apple-touch-icon", url: "privychat.png"},
    {rel: "icon", url: "/privychat.png"},
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <PrivyWalletProvider>
            <AppProvider>{children}</AppProvider>
          </PrivyWalletProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
