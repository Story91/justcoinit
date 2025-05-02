"use client";

import Link from "next/link";
import { Button } from "./DemoComponents";
import Image from "next/image";

interface CoinCardProps {
  address: string;
  name: string;
  symbol: string;
  imageUrl?: string;
  showBuyButton?: boolean;
}

export function CoinCard({ address, name, symbol, imageUrl, showBuyButton = false }: CoinCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
      <div className="p-3 border-b">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">{name}</h3>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{symbol}</span>
        </div>
      </div>
      
      {imageUrl ? (
        <div className="h-48 w-full bg-gray-100">
          {imageUrl.startsWith('ipfs://') ? (
            <div className="h-full w-full flex items-center justify-center bg-gray-100 text-sm text-gray-500">
              IPFS Image
            </div>
          ) : (
            <div className="h-full w-full relative">
              <Image 
                src={imageUrl}
                alt={name}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 w-full flex items-center justify-center bg-gray-100 text-sm text-gray-500">
          No image available
        </div>
      )}
      
      <div className="p-3">
        <p className="text-xs text-gray-500 mb-2">Token Address:</p>
        <p className="text-xs break-all bg-gray-100 p-2 rounded mb-3">
          {address}
        </p>
        
        {showBuyButton && (
          <Link 
            href={`https://zora.co/collect/base:${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button className="w-full mb-3">
              Buy Token
            </Button>
          </Link>
        )}
        
        <div className="flex items-center justify-between">
          <Link 
            href={`https://basescan.org/token/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 text-sm hover:underline"
          >
            View on BaseScan
          </Link>
          
          <Link 
            href={`https://zora.co/coin/base:${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 text-sm hover:underline"
          >
            View on Zora
          </Link>
        </div>
      </div>
    </div>
  );
} 