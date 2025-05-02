"use client";

import { useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { Button } from "./DemoComponents";
import { type Address } from "viem";
import { base } from "wagmi/chains";
import { createPostCoin, createPostMetadata } from "@/app/utils/zoraSdk";

// Opcjonalnie ustaw klucz API, jeśli go masz
// setApiKey(process.env.NEXT_PUBLIC_ZORA_API_KEY || "");

interface SelectedImage {
  url: string;
  caption: string;
}

interface ZoraCoinProps {
  onSuccess: (coinAddress: string) => void;
  onError: (error: Error) => void;
  selectedImage?: SelectedImage | null;
}

export function ZoraCoin({ onSuccess, onError, selectedImage }: ZoraCoinProps) {
  const { address, isConnected } = useAccount();
  const [isCreating, setIsCreating] = useState(false);
  const [coinName, setCoinName] = useState("");
  const [coinSymbol, setCoinSymbol] = useState("");
  const [metadataUrl, setMetadataUrl] = useState<string | null>(null);
  const [isPreparingMetadata, setIsPreparingMetadata] = useState(false);
  
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const prepareMetadata = async () => {
    if (!selectedImage || !address) return null;
    
    try {
      setIsPreparingMetadata(true);
      
      // Create metadata JSON
      const metadata = createPostMetadata({
        username: address.substring(0, 6) + '...' + address.substring(address.length - 4),
        content: selectedImage.caption,
        imageUrl: selectedImage.url,
        authorAddress: address,
      });
      
      // Upload metadata to Vercel Blob Storage
      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: 'application/json'
      });
      
      const formData = new FormData();
      formData.append('file', metadataBlob);
      formData.append('filename', `metadata-${Date.now()}.json`);
      formData.append('contentType', 'application/json');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload metadata');
      }
      
      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error preparing metadata:', error);
      return null;
    } finally {
      setIsPreparingMetadata(false);
    }
  };

  const handleCreateCoin = async () => {
    if (!isConnected || !address || !walletClient || !publicClient) {
      onError(new Error("Wallet not connected"));
      return;
    }

    if (!coinName || !coinSymbol) {
      onError(new Error("Coin name and symbol are required"));
      return;
    }

    setIsCreating(true);

    try {
      // Prepare metadata URI if we have a selected image
      let uri = "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy"; // Fallback URI
      
      if (selectedImage) {
        const metadataUri = await prepareMetadata();
        if (metadataUri) {
          uri = metadataUri;
        }
      }
      
      // Create the coin with our utility function
      const result = await createPostCoin({
        name: coinName,
        symbol: coinSymbol,
        uri,
        payoutRecipient: address as Address,
        walletClient,
        imageUrl: selectedImage?.url,
      });
      
      console.log("Transaction hash:", result.hash);
      console.log("Coin address:", result.address);
      
      if (result && result.address) {
        onSuccess(result.address);
      } else {
        onError(new Error("Failed to create coin"));
      }
    } catch (error) {
      console.error("Error creating Zora Coin:", error);
      onError(error instanceof Error ? error : new Error("Unknown error occurred"));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-medium">Create Your Content Coin</h3>
      <p className="text-sm text-gray-600">
        Content coins let your fans support your content creation
      </p>
      
      {selectedImage && (
        <div className="rounded-lg overflow-hidden mb-4 border">
          <img 
            src={selectedImage.url} 
            alt={selectedImage.caption}
            className="w-full h-64 object-cover" 
          />
          <div className="p-3 bg-gray-50">
            <p className="text-sm">{selectedImage.caption}</p>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <div>
          <label htmlFor="coin-name" className="block text-sm font-medium mb-1">
            Coin Name
          </label>
          <input
            id="coin-name"
            type="text"
            placeholder="e.g. My Content Coin"
            value={coinName}
            onChange={(e) => setCoinName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={isCreating || isPreparingMetadata}
          />
        </div>
        
        <div>
          <label htmlFor="coin-symbol" className="block text-sm font-medium mb-1">
            Coin Symbol
          </label>
          <input
            id="coin-symbol"
            type="text"
            placeholder="e.g. MCC"
            maxLength={5}
            value={coinSymbol}
            onChange={(e) => setCoinSymbol(e.target.value.toUpperCase())}
            className="w-full p-2 border border-gray-300 rounded-md uppercase"
            disabled={isCreating || isPreparingMetadata}
          />
        </div>
      </div>
      
      <Button
        onClick={handleCreateCoin}
        disabled={isCreating || isPreparingMetadata || !coinName || !coinSymbol}
        className="w-full"
      >
        {isCreating || isPreparingMetadata ? "Creating Coin..." : "Create Content Coin"}
      </Button>
    </div>
  );
} 