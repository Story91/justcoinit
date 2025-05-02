import { createCoin, getCoin, getCoinCreateFromLogs } from '@zoralabs/coins-sdk';
import { Address, createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Prosty mechanizm cachowania
const coinCache = new Map<string, any>();
const creatorCoinsCache = new Map<string, any[]>();

// Publiczny klient do odczytu danych z blockchain
export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

// Associate a coin with an image
export async function associateImageWithCoin(imageUrl: string, coinAddress: string) {
  try {
    const response = await fetch('/api/coins/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        coinAddress
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to associate image with coin');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error associating image with coin:', error);
    throw error;
  }
}

// Tworzenie monety dla posta
export async function createPostCoin({
  name,
  symbol,
  uri,
  payoutRecipient,
  walletClient,
  imageUrl,
}: {
  name: string;
  symbol: string;
  uri: string;
  payoutRecipient: Address;
  walletClient: any;
  imageUrl?: string;
}) {
  try {
    // Parametry monety
    const coinParams = {
      name: name.substring(0, 32), // Limit do 32 znaków
      symbol: symbol.substring(0, 10).toUpperCase(), // Limit do 10 znaków
      uri,
      payoutRecipient,
      initialPurchaseWei: 0n, // Bez początkowego zakupu
    };

    // Utworzenie monety
    const result = await createCoin(coinParams, walletClient, publicClient);
    
    // Oczekiwanie na potwierdzenie transakcji
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: result.hash,
    });
    
    // Wyciągnięcie adresu kontraktu monety
    const coinDeployment = getCoinCreateFromLogs(receipt);
    
    // Associate with image if provided
    if (imageUrl && coinDeployment?.coin) {
      await associateImageWithCoin(imageUrl, coinDeployment.coin);
    }
    
    return {
      hash: result.hash,
      address: coinDeployment?.coin,
    };
  } catch (error) {
    console.error('Error creating coin:', error);
    throw error;
  }
}

// Pobieranie danych monety z cache'owaniem
export async function getCachedCoin(coinAddress: Address) {
  // Sprawdź cache
  if (coinCache.has(coinAddress)) {
    return coinCache.get(coinAddress);
  }

  try {
    // Pobierz dane monety - tylko z poprawnym parametrem address
    const coin = await getCoin({ 
      address: coinAddress 
    });
    
    // Zapisz do cache
    if (coin) {
      coinCache.set(coinAddress, coin);
    }
    
    return coin;
  } catch (error) {
    console.error(`Error fetching coin data for ${coinAddress}:`, error);
    return null;
  }
}

// Pobieranie monet twórcy z cache'owaniem - bez użycia getCoinsByCreator
export async function getCachedCoins(creatorAddress: Address) {
  // Sprawdź cache
  if (creatorCoinsCache.has(creatorAddress)) {
    return creatorCoinsCache.get(creatorAddress);
  }

  try {
    // Zaimplementuj własną logikę pobierania monet twórcy 
    // - bez użycia nieistniejącej funkcji getCoinsByCreator
    const coins: any[] = [];
    
    // TODO: W przyszłości zaimplementować właściwe zapytanie do API Zora lub on-chain zapytanie
    // Można wykorzystać wydarzenie utworzenia monety, aby śledzić monety stworzone przez twórcę
    
    // Zapisz do cache
    creatorCoinsCache.set(creatorAddress, coins);
    
    return coins;
  } catch (error) {
    console.error(`Error fetching creator coins for ${creatorAddress}:`, error);
    return [];
  }
}

// Funkcja do tworzenia metadanych dla posta
export function createPostMetadata({
  username,
  content,
  imageUrl,
  videoUrl,
  authorAddress,
  tags = [],
  mentions = [],
}: {
  username: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  authorAddress: string;
  tags?: string[];
  mentions?: string[];
}) {
  // Tworzenie skróconego opisu do tytułu
  const excerpt = content.length > 50 
    ? content.substring(0, 50) + '...' 
    : content;
  
  // Bazowa struktura metadanych
  const metadata: any = {
    name: `Post by ${username}: ${excerpt}`,
    description: content,
    properties: {
      category: "social",
      author: authorAddress,
      createdAt: new Date().toISOString(),
      tags,
      mentions,
    }
  };

  // Dodanie obrazu jeśli istnieje
  if (imageUrl) {
    metadata.image = imageUrl;
  }

  // Dodanie wideo jeśli istnieje
  if (videoUrl) {
    metadata.animation_url = videoUrl;
    metadata.content = {
      mime: "video/mp4",
      uri: videoUrl
    };
  }

  return metadata;
}

// Funkcja do generowania symbolu z treści
export function generateSymbolFromContent(content: string): string {
  // Wyciągnij pierwsze słowo
  const firstWord = content.trim().split(/\s+/)[0];
  
  // Usuń znaki specjalne
  const cleanWord = firstWord.replace(/[^a-zA-Z0-9]/g, '');
  
  // Ograniczenie do 10 znaków i zamiana na wielkie litery
  return cleanWord.substring(0, 10).toUpperCase();
}

// Funkcja do ekstrakcji tagów z treści
export function extractTags(content: string): string[] {
  const tagRegex = /#(\w+)/g;
  const matches = content.match(tagRegex);
  
  if (!matches) return [];
  
  return matches.map(tag => tag.substring(1)); // Usuń # z początku
}

// Funkcja do ekstrakcji wzmianek z treści
export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = content.match(mentionRegex);
  
  if (!matches) return [];
  
  return matches.map(mention => mention.substring(1)); // Usuń @ z początku
} 