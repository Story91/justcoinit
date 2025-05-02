"use client";

import { useState, useEffect } from "react";
import { Button } from "./DemoComponents";
import { useAccount } from "wagmi";
import { CoinCard } from "./CoinCard";

interface CoinToken {
  address: string;
  name: string;
  symbol: string;
  imageUrl?: string;
  metadata?: any;
}

export function TokenGallery() {
  const { address } = useAccount();
  const [tokens, setTokens] = useState<CoinToken[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tokens from localStorage
  useEffect(() => {
    if (!address) {
      setTokens([]);
      setLoading(false);
      return;
    }

    const loadTokens = async () => {
      try {
        // Get stored token addresses from localStorage
        const storedTokens = localStorage.getItem(`userTokens_${address}`);
        if (!storedTokens) {
          setTokens([]);
          setLoading(false);
          return;
        }

        const tokenAddresses = JSON.parse(storedTokens) as string[];
        const tokenPromises = tokenAddresses.map(async (tokenAddress) => {
          try {
            // Fetch token details from our API
            const response = await fetch(`/api/coins/user?address=${tokenAddress}`);
            if (!response.ok) {
              throw new Error(`Failed to fetch token ${tokenAddress}`);
            }
            const data = await response.json();
            
            // Try to parse the metadata to extract image
            let imageUrl = undefined;
            let metadata = undefined;
            
            try {
              // If the URI is a URL, try to fetch metadata
              if (data.coin.uri && data.coin.uri.startsWith('http')) {
                const metadataResponse = await fetch(data.coin.uri);
                if (metadataResponse.ok) {
                  metadata = await metadataResponse.json();
                  if (metadata.image) {
                    imageUrl = metadata.image;
                  }
                }
              } else if (data.coin.metadata && typeof data.coin.metadata === 'object') {
                metadata = data.coin.metadata;
                if (metadata.image) {
                  imageUrl = metadata.image;
                }
              }
            } catch (metadataError) {
              console.error('Error parsing token metadata:', metadataError);
            }
            
            return {
              address: tokenAddress,
              name: data.coin.name || 'Unknown Token',
              symbol: data.coin.symbol || '???',
              imageUrl,
              metadata
            };
          } catch (error) {
            console.error(`Error fetching token ${tokenAddress}:`, error);
            return {
              address: tokenAddress,
              name: 'Error Loading Token',
              symbol: 'ERR',
            };
          }
        });

        const tokenDetails = await Promise.all(tokenPromises);
        setTokens(tokenDetails);
      } catch (error) {
        console.error('Error loading tokens:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();
  }, [address]);

  if (loading) {
    return (
      <div className="w-full text-center py-12">
        <p>Loading your tokens...</p>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="w-full text-center py-12 bg-gray-100 rounded-lg">
        <p className="text-gray-500 mb-4">You haven't created any tokens yet</p>
        <Button onClick={() => window.location.href = '/?tab=coin'}>Create your first token</Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-6">Your Content Coins</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tokens.map((token) => (
          <CoinCard
            key={token.address}
            address={token.address}
            name={token.name}
            symbol={token.symbol}
            imageUrl={token.imageUrl}
            showBuyButton={true}
          />
        ))}
      </div>
    </div>
  );
} 