import { NextRequest, NextResponse } from 'next/server';

// This is a mock implementation - in a real application, you would use a database to store 
// the relationship between images and their associated coins

// In-memory store of image-to-coin mappings
const imageCoinsMap = new Map<string, string[]>();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('imageUrl');
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }
    
    // Get coins associated with this image
    const coinAddresses = imageCoinsMap.get(imageUrl) || [];
    
    return NextResponse.json({ coinAddresses });
  } catch (error) {
    console.error('Error fetching image coins:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch image coins',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, coinAddress } = body;
    
    if (!imageUrl || !coinAddress) {
      return NextResponse.json(
        { error: 'Image URL and coin address are required' },
        { status: 400 }
      );
    }
    
    // Get existing coins for this image or create new array
    let existingCoins = imageCoinsMap.get(imageUrl) || [];
    
    // Add the new coin if not already in the list
    if (!existingCoins.includes(coinAddress)) {
      existingCoins = [...existingCoins, coinAddress];
      imageCoinsMap.set(imageUrl, existingCoins);
    }
    
    return NextResponse.json({ 
      success: true, 
      imageUrl,
      coinAddresses: existingCoins
    });
  } catch (error) {
    console.error('Error associating image with coin:', error);
    return NextResponse.json(
      { 
        error: 'Failed to associate image with coin',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 