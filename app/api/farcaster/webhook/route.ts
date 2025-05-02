import { NextRequest, NextResponse } from 'next/server';
import neynarClient from '@/lib/neynar-client';

export async function POST(request: NextRequest) {
  // Get the API key from headers to validate the request
  const apiKey = request.headers.get('api_key');
  
  // Validate the API key
  if (apiKey !== process.env.NEYNAR_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const data = await request.json();
    
    // Log the event data for debugging
    console.log('Received Farcaster webhook event:', data);
    
    // Process different event types
    switch (data.type) {
      case 'frame_action':
        // Handle frame action events
        console.log('Frame action received:', data.frame_action);
        break;
        
      case 'notification':
        // Handle notification events
        console.log('Notification received:', data.notification);
        break;
        
      case 'cast':
        // Handle cast events
        console.log('Cast received:', data.cast);
        break;
        
      default:
        console.log('Unhandled event type:', data.type);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
} 