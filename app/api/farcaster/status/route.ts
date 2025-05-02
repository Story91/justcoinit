import { NextResponse } from 'next/server';
import { getFrameStatus } from '@/lib/neynar-client';

export async function GET() {
  try {
    // Test the Neynar API connection
    const status = await getFrameStatus();
    
    return NextResponse.json({
      status: 'success',
      message: 'Neynar API connection successful',
      details: status
    });
  } catch (error) {
    console.error('Neynar API connection failed:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Neynar API connection failed',
        error: (error instanceof Error) ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 