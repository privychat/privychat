"use client";

import {PrivyProvider} from "@privy-io/react-auth";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {createConfig, WagmiProvider} from "@privy-io/wagmi";
import {mainnet, polygon, base} from "viem/chains";
import {http} from "wagmi";
import {useEffect} from "react";
import {createPublicClient} from "viem";

export const config = createConfig({
  chains: [mainnet, polygon, base],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
  },
});
export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});
export default function PrivyWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        appearance: {
          theme: "light",
        },
        loginMethods: ["email", "wallet"],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
