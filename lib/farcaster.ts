/**
 * Utility functions for Farcaster integration
 */

// Check if the client is running in a Farcaster Frame environment
export const isFarcasterFrame = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Improved detection logic for Farcaster frames
  // Added more checks for various possible indicators
  return Boolean(
    // URL checks
    window.location.href.includes('warpcast.com') ||
    window.location.href.includes('farcaster.xyz') ||
    document.referrer.includes('warpcast.com') ||
    document.referrer.includes('farcaster.xyz') ||
    
    // URL parameters that might indicate Farcaster Frame
    new URLSearchParams(window.location.search).has('fc') ||
    new URLSearchParams(window.location.search).has('fid') ||
    
    // User agent checks (some Farcaster clients include identifiers)
    navigator.userAgent.includes('Warpcast') ||
    navigator.userAgent.includes('Farcaster') ||
    
    // Global objects that might be injected by Farcaster
    typeof (window as any).fcSdk !== 'undefined' ||
    typeof (window as any).farcaster !== 'undefined' ||
    typeof (window as any).frameContext !== 'undefined'
  );
};

// Cache for Farcaster user ID to avoid repeated calls
let cachedFarcasterUserId: string | null = null;

// Helper to get Farcaster user ID if available
export const getFarcasterUserId = async (): Promise<string | null> => {
  try {
    if (typeof window === 'undefined') {
      return null;
    }
    
    // Return cached value if available
    if (cachedFarcasterUserId) {
      return cachedFarcasterUserId;
    }
    
    // Try to access Farcaster SDK context if available
    if ((window as any).fcSdk?.context) {
      const context = await (window as any).fcSdk.context;
      if (context?.client?.clientFid) {
        cachedFarcasterUserId = context.client.clientFid;
        return cachedFarcasterUserId;
      }
    }
    
    // Try alternative ways to get FID
    const urlParams = new URLSearchParams(window.location.search);
    const fidParam = urlParams.get('fid');
    if (fidParam) {
      cachedFarcasterUserId = fidParam;
      return cachedFarcasterUserId;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting Farcaster user ID:', error);
    return null;
  }
};

// Track connection attempts to avoid multiple connections
let connectionAttempted = false;

// Auto connect wallet if in Farcaster Frame
export const autoConnectWalletInFarcasterFrame = async (
  connect: (options: any) => Promise<any>,
  connector: () => any
): Promise<boolean> => {
  try {
    // Skip if already attempted connection
    if (connectionAttempted) {
      return false;
    }
    
    // Skip if not in Farcaster frame
    if (!isFarcasterFrame()) {
      return false;
    }
    
    // Mark as attempted
    connectionAttempted = true;
    
    // Get Farcaster user ID
    const farcasterUserId = await getFarcasterUserId();
    
    if (!farcasterUserId) {
      return false;
    }
    
    // Auto-connect wallet
    await connect({ connector: connector() });
    
    return true;
  } catch (error) {
    console.error('Error auto-connecting wallet in Farcaster Frame:', error);
    return false;
  }
}; 