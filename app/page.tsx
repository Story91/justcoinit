"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import { Home } from "./components/DemoComponents";
import { Features } from "./components/DemoComponents";
import dynamic from "next/dynamic";
import { useConnect, useAccount } from "wagmi";
import { isFarcasterFrame, getFarcasterUserId } from "../lib/farcaster";

// Import FarcasterFrameInit z dynamicznym ładowaniem (bez SSR)
const FarcasterFrameInit = dynamic(
  () => import("./components/FarcasterFrameInit"),
  { ssr: false }
);

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isFarcasterEnvironment, setIsFarcasterEnvironment] = useState(false);
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  // Funkcja do połączenia portfela
  const handleConnectWallet = useCallback(() => {
    try {
      // Znajdź pierwszy dostępny connector
      const connector = connectors[0];
      if (connector) {
        connect({ connector });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }, [connect, connectors]);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }

    // Sprawdź, czy jesteśmy w środowisku Farcaster
    const checkFarcasterFrame = async () => {
      try {
        if (typeof window !== 'undefined') {
          const detected = isFarcasterFrame();
          
          if (detected) {
            setIsFarcasterEnvironment(true);
            
            // Automatycznie połącz portfel, jeśli jesteśmy w Farcaster
            if (connectors.length > 0 && !isConnected) {
              handleConnectWallet();
            }
          }
        }
      } catch (error) {
        console.error("Error checking Farcaster Frame:", error);
      }
    };

    checkFarcasterFrame();
  }, [setFrameReady, isFrameReady, connectors, handleConnectWallet, isConnected]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <>
      {/* Inicjalizacja Farcaster Frame */}
      <FarcasterFrameInit />
      
      <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
        <div className="w-full max-w-md mx-auto px-4 py-3">
          <header className="flex justify-between items-center mb-3 h-11">
            <div>
              {isConnected ? (
                <div className="flex items-center space-x-2">
                  <Wallet className="z-10">
                    <ConnectWallet>
                      <Name className="text-inherit" />
                    </ConnectWallet>
                    <WalletDropdown>
                      <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                        <Avatar />
                        <Name />
                        <Address />
                        <EthBalance />
                      </Identity>
                      <WalletDropdownDisconnect />
                    </WalletDropdown>
                  </Wallet>
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleConnectWallet}
                  className="animate-pulse"
                >
                  Connect Wallet
                </Button>
              )}
            </div>
            <div>{saveFrameButton}</div>
          </header>

          <main className="flex-1">
            {activeTab === "home" && <Home setActiveTab={setActiveTab} />}
            {activeTab === "features" && <Features setActiveTab={setActiveTab} />}
          </main>

          <footer className="mt-2 pt-4 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-[var(--ock-text-foreground-muted)] text-xs"
              onClick={() => openUrl("https://base.org/builders/minikit")}
            >
              Built on Base with MiniKit
            </Button>
          </footer>
        </div>
      </div>
    </>
  );
}
