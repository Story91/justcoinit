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
import { useAccount } from "wagmi";
import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import { ImageGallery } from "./components/ImageGallery";
import { ImageUploader } from "./components/ImageUploader";
import { ZoraCoin } from "./components/ZoraCoin";
import { TokenGallery } from "./components/TokenGallery";
import { useSearchParams, useRouter } from "next/navigation";

interface SelectedImage {
  url: string;
  caption: string;
}

// Komponent opakowujący dla części używającej useSearchParams
function AppContent() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("gallery");
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [userCoinAddress, setUserCoinAddress] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address } = useAccount();

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);
  
  // Check for tab parameter in URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'gallery' || tab === 'coin' || tab === 'tokens')) {
      setActiveTab(tab);
      
      // Clear userCoinAddress when switching to coin tab for a fresh creation form
      if (tab === 'coin') {
        setUserCoinAddress(null);
      }
    }
  }, [searchParams]);
  
  // Load selected image from localStorage
  useEffect(() => {
    const storedImage = localStorage.getItem('selectedImage');
    if (storedImage) {
      try {
        const parsedImage = JSON.parse(storedImage);
        setSelectedImage(parsedImage);
      } catch (error) {
        console.error('Error parsing stored image:', error);
        localStorage.removeItem('selectedImage');
      }
    }
  }, [activeTab]);

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

  const handleImageCapture = (imageUrl: string, caption: string) => {
    // Zapisujemy URL obrazu do uzycia pozniej
    console.log("Image captured:", { imageUrl, caption });
    
    // Zamknij uploader i wróć do galerii
    setShowImageUploader(false);
    setActiveTab("gallery");
    
    // Powiadomienie o sukcesie
    alert("Zdjęcie zostało opublikowane!");
  };

  const handleCoinCreated = (coinAddress: string) => {
    console.log("Coin created:", coinAddress);
    setUserCoinAddress(coinAddress);
    
    // Store the coin address in localStorage
    if (address) {
      try {
        // Get existing tokens or create new array
        const existingTokensJSON = localStorage.getItem(`userTokens_${address}`);
        let existingTokens: string[] = [];
        
        if (existingTokensJSON) {
          existingTokens = JSON.parse(existingTokensJSON);
        }
        
        // Add new token if not already in the list
        if (!existingTokens.includes(coinAddress)) {
          existingTokens.push(coinAddress);
          localStorage.setItem(`userTokens_${address}`, JSON.stringify(existingTokens));
        }
      } catch (error) {
        console.error('Error storing token address:', error);
      }
    }
    
    // Switch to tokens gallery
    setActiveTab("tokens");
    router.push('/?tab=tokens');
    
    // Powiadomienie o sukcesie
    alert("Twoja moneta Content Coin została utworzona!");
    
    // Clear selected image from localStorage
    localStorage.removeItem('selectedImage');
    setSelectedImage(null);
  };

  const handleCoinError = (error: Error) => {
    console.error("Coin creation error:", error.message);
    alert(`Błąd podczas tworzenia monety: ${error.message}`);
  };
  
  const handleSwitchTab = (tab: string) => {
    setActiveTab(tab);
    
    // Clear userCoinAddress when manually switching to coin tab
    if (tab === 'coin') {
      setUserCoinAddress(null);
    }
    
    router.push(`/?tab=${tab}`);
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>
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
          </div>
          <div>{saveFrameButton}</div>
        </header>

        <main className="flex-1">
          {/* Nawigacja */}
          <div className="flex justify-center mb-4 border-b">
            <button 
              className={`px-4 py-2 ${activeTab === 'gallery' ? 'border-b-2 border-[var(--app-accent)] font-medium' : 'text-gray-500'}`}
              onClick={() => handleSwitchTab('gallery')}
            >
              Galeria
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === 'coin' ? 'border-b-2 border-[var(--app-accent)] font-medium' : 'text-gray-500'}`}
              onClick={() => handleSwitchTab('coin')}
            >
              Create Coin
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === 'tokens' ? 'border-b-2 border-[var(--app-accent)] font-medium' : 'text-gray-500'}`}
              onClick={() => handleSwitchTab('tokens')}
            >
              My Tokens
            </button>
          </div>

          {/* Główna zawartość */}
          {showImageUploader ? (
            <ImageUploader 
              onImageCaptured={handleImageCapture}
              onCancel={() => setShowImageUploader(false)}
            />
          ) : activeTab === 'gallery' ? (
            <ImageGallery 
              onAddNewClick={() => setShowImageUploader(true)}
            />
          ) : activeTab === 'coin' ? (
            userCoinAddress ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Twoja Content Coin</h3>
                <p className="mb-4">Adres twojej monety:</p>
                <div className="bg-gray-100 p-3 rounded-md break-all text-sm mb-4">
                  {userCoinAddress}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Użyj tego adresu, aby udostępnić swoją monetę fanom lub
                  zintegrować ją z publikowanymi treściami.
                </p>
                <Button onClick={() => handleSwitchTab('tokens')}>
                  Zobacz swoje tokeny
                </Button>
              </div>
            ) : (
              <ZoraCoin 
                onSuccess={handleCoinCreated}
                onError={handleCoinError}
                selectedImage={selectedImage}
              />
            )
          ) : (
            <TokenGallery />
          )}
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
  );
}

// Główny komponent opakowany w Suspense
export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppContent />
    </Suspense>
  );
}
