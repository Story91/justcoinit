import { NextRequest, NextResponse } from 'next/server';
import { getCachedCoin } from '@/app/utils/zoraSdk';
import { Address } from 'viem';

// Zapobiega statycznemu generowaniu tego endpointu API
export const dynamic = 'force-dynamic';

// In a production app, use a database or indexer to track created coins
// For now, we'll use localStorage in the client and this API will 
// just fetch details for a given address

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const coinAddress = searchParams.get('address');
    
    if (!coinAddress) {
      return NextResponse.json(
        { error: 'Coin address is required' },
        { status: 400 }
      );
    }
    
    // Fetch coin details
    const coinData = await getCachedCoin(coinAddress as Address);
    
    if (!coinData) {
      return NextResponse.json(
        { error: 'Coin not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ coin: coinData });
  } catch (error) {
    console.error('Error fetching coin data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch coin data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 