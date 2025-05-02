"use client";

import { useState, useEffect } from "react";
import { Button } from "./DemoComponents";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { CoinCard } from "./CoinCard";
import Image from "next/image";

interface Image {
  id: string;
  url: string;
  caption: string;
  author: string;
  timestamp: number;
  likes: number;
  associatedCoins?: string[];
}

interface CoinInfo {
  address: string;
  name: string;
  symbol: string;
  imageUrl?: string;
}

interface ImageGalleryProps {
  onAddNewClick: () => void;
}

export function ImageGallery({ onAddNewClick }: ImageGalleryProps) {
  const { address } = useAccount();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedImageId, setExpandedImageId] = useState<string | null>(null);
  const [coinData, setCoinData] = useState<Record<string, CoinInfo>>({});
  const router = useRouter();

  // Pobierz prawdziwe zdjęcia z Vercel Blob Storage
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/images');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch images');
        }
        
        const data = await response.json();
        if (data.images && Array.isArray(data.images)) {
          // Fetch associated coins for each image
          const imagesWithCoins = await Promise.all(
            data.images.map(async (image: Image) => {
              try {
                const coinsResponse = await fetch(`/api/coins/image?imageUrl=${encodeURIComponent(image.url)}`);
                if (coinsResponse.ok) {
                  const coinsData = await coinsResponse.json();
                  return {
                    ...image,
                    associatedCoins: coinsData.coinAddresses || []
                  };
                }
              } catch (err) {
                console.error(`Error fetching coins for image ${image.id}:`, err);
              }
              return image;
            })
          );
          
          setImages(imagesWithCoins);
        } else {
          console.error('Unexpected response format:', data);
          setImages([]);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);
  
  // Fetch coin details when an image is expanded
  useEffect(() => {
    const fetchCoinDetails = async () => {
      if (!expandedImageId) return;
      
      const expandedImage = images.find(img => img.id === expandedImageId);
      if (!expandedImage || !expandedImage.associatedCoins || expandedImage.associatedCoins.length === 0) return;
      
      // Fetch details for each coin that isn't already in state
      const newCoinData = { ...coinData };
      let dataChanged = false;
      
      await Promise.all(
        expandedImage.associatedCoins.map(async (coinAddress) => {
          if (newCoinData[coinAddress]) return; // Skip if we already have this coin's data
          
          try {
            const response = await fetch(`/api/coins/user?address=${coinAddress}`);
            if (response.ok) {
              const data = await response.json();
              const coin = data.coin;
              
              // Extract image URL from metadata if available
              let imageUrl = undefined;
              if (coin.metadata && coin.metadata.image) {
                imageUrl = coin.metadata.image;
              }
              
              newCoinData[coinAddress] = {
                address: coinAddress,
                name: coin.name || 'Unknown Token',
                symbol: coin.symbol || '???',
                imageUrl
              };
              
              dataChanged = true;
            }
          } catch (error) {
            console.error(`Error fetching details for coin ${coinAddress}:`, error);
          }
        })
      );
      
      if (dataChanged) {
        setCoinData(newCoinData);
      }
    };
    
    fetchCoinDetails();
  }, [expandedImageId, images, coinData]);

  const handleLike = (id: string) => {
    setImages(prevImages => 
      prevImages.map(img => 
        img.id === id ? { ...img, likes: img.likes + 1 } : img
      )
    );
  };

  const handleCreateCoin = (image: Image) => {
    // Store selected image data in localStorage to access it in the coin creation component
    localStorage.setItem('selectedImage', JSON.stringify({
      url: image.url,
      caption: image.caption
    }));
    
    // Navigate to the coin tab
    router.push('/?tab=coin');
  };
  
  const toggleExpandImage = (id: string) => {
    setExpandedImageId(expandedImageId === id ? null : id);
  };

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'teraz';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min temu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} godz temu`;
    return `${Math.floor(diff / 86400000)} dni temu`;
  };

  const refreshGallery = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/images');
      if (!response.ok) {
        throw new Error('Failed to refresh gallery');
      }
      
      const data = await response.json();
      if (data.images && Array.isArray(data.images)) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('Error refreshing gallery:', error);
      setError('Failed to refresh images');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Galeria zdjęć</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={refreshGallery}
            variant="secondary"
            className="text-sm"
            disabled={loading}
          >
            {loading ? 'Ładowanie...' : 'Odśwież'}
          </Button>
          <Button 
            onClick={onAddNewClick}
            variant="primary"
            className="text-sm"
          >
            Dodaj nowe zdjęcie
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-medium">Error loading images</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={refreshGallery} 
            variant="secondary"
            className="mt-2 text-sm"
          >
            Try again
          </Button>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Ładowanie galerii...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-500 mb-4">Brak zdjęć w galerii</p>
          <Button onClick={onAddNewClick}>Dodaj pierwsze zdjęcie</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {images.map(image => (
            <div key={image.id} className="border rounded-lg overflow-hidden shadow-sm bg-white">
              <div className="p-3 border-b flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center text-xs">
                    {image.author.substring(0, 2)}
                  </div>
                  <div className="text-sm font-medium truncate">
                    {image.author.substring(0, 6) + '...' + image.author.substring(image.author.length - 4)}
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(image.timestamp)}
                </span>
              </div>
              
              {/* Use div with img instead of next/image to avoid domain issues */}
              <div className="w-full aspect-square bg-gray-200 relative">
                <img 
                  src={image.url} 
                  alt={image.caption || 'Uploaded image'}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <button 
                    onClick={() => handleLike(image.id)}
                    className="mr-2 p-2 text-gray-600 hover:text-red-500"
                  >
                    ❤️ {image.likes}
                  </button>
                  
                  {/* Show coin badges */}
                  {image.associatedCoins && image.associatedCoins.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-3 py-1 ml-2">
                      {image.associatedCoins.length} 
                      <span className="hidden sm:inline">{' Content '}</span>
                      {' '}{image.associatedCoins.length === 1 ? 'Coin' : 'Coins'}
                    </span>
                  )}
                </div>
                
                <p className="text-sm mb-4">
                  <strong>{image.author}:</strong> {image.caption}
                </p>
                
                {/* Show coins when expanded */}
                {image.associatedCoins && image.associatedCoins.length > 0 && (
                  <div className="mb-4">
                    <button 
                      onClick={() => toggleExpandImage(image.id)}
                      className="text-sm text-blue-500 hover:underline mb-3"
                    >
                      {expandedImageId === image.id ? 'Hide content coins' : 'View content coins'}
                    </button>
                    
                    {expandedImageId === image.id && (
                      <div className="space-y-3 mt-3">
                        {image.associatedCoins.map(coinAddress => {
                          const coin = coinData[coinAddress];
                          return coin ? (
                            <CoinCard
                              key={coinAddress}
                              address={coinAddress}
                              name={coin.name}
                              symbol={coin.symbol}
                              imageUrl={coin.imageUrl}
                              showBuyButton={true}
                            />
                          ) : (
                            <div key={coinAddress} className="p-3 bg-gray-100 rounded-lg text-xs">
                              Loading coin {coinAddress.substring(0, 6)}...{coinAddress.substring(coinAddress.length - 4)}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                
                <Button 
                  onClick={() => handleCreateCoin(image)}
                  className="w-full"
                >
                  Create Content Coin
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 