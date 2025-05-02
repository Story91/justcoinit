import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

// Initialize Neynar client with API key
const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || '',
});

const neynarClient = new NeynarAPIClient(config);

export async function getFrameStatus() {
  try {
    const url = "https://snapchain-api.neynar.com/v1/info";
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Neynar API info:', error);
    throw error;
  }
}

export default neynarClient; 