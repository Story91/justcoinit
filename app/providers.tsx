"use client";

import { type ReactNode } from "react";
import { base } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import dynamic from "next/dynamic";

// Dynamiczny import FarcasterFrameProvider (bez SSR)
const FarcasterFrameProvider = dynamic(
  () => import("./components/FarcasterFrameProvider").then(mod => ({default: mod.FarcasterFrameProvider})),
  { ssr: false }
);

export function Providers(props: { children: ReactNode }) {
  return (
    <MiniKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          mode: "auto",
          theme: "mini-app-theme",
          name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
          logo: process.env.NEXT_PUBLIC_ICON_URL,
        },
        wallet: {
          // Enable wallet modal in mini-app
          display: "modal",
          // Set supported wallets
          supportedWallets: {
            rabby: true,
            trust: true,
            frame: true
          }
        },
      }}
    >
      <FarcasterFrameProvider>
        {props.children}
      </FarcasterFrameProvider>
    </MiniKitProvider>
  );
}
