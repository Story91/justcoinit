/// <reference types="node" />

// In Next.js, process.env is automatically included
// No need for explicit import
export async function GET() {
  // Set default URL for local development if NEXT_PUBLIC_URL is not defined
  const URL = process.env.NEXT_PUBLIC_URL || "https://justcoinit.vercel.app";
  
  // Use the specific Neynar webhook URL provided in your Neynar dashboard
  const webhookUrl = "https://api.neynar.com/f/app/16e285ae-0ada-4f7b-b1f7-2742d15cdde8/event";

  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: {
      version: process.env.NEXT_PUBLIC_VERSION || "next",
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "JustCoinIt",
      homeUrl: URL,
      iconUrl: process.env.NEXT_PUBLIC_ICON_URL || `${URL}/icon.png`,
      imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL || `${URL}/image.png`,
      buttonTitle: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "JustCoinIt"}`,
      splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL || `${URL}/splash.png`,
      splashBackgroundColor: `#${process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "000000"}`,
      webhookUrl: webhookUrl,
      // Dodatkowe pola zgodne z nową specyfikacją
      subtitle: "JustCoinIt subtitle",
      description: "JustCoinIt - Twoja aplikacja do zarządzania kryptowalutami",
      screenshotUrls: [
        `${URL}/screenshot1.png`,
        `${URL}/screenshot2.png`,
        `${URL}/screenshot3.png`
      ],
      primaryCategory: "finance",
      tags: [
        "crypto",
        "miniapp",
        "coinbasewallet"
      ],
      heroImageUrl: process.env.NEXT_PUBLIC_IMAGE_URL || `${URL}/image.png`,
      tagline: "Zarządzaj kryptowalutami łatwo",
      ogTitle: "JustCoinIt",
      ogDescription: "Prosta aplikacja do zarządzania kryptowalutami",
      ogImageUrl: process.env.NEXT_PUBLIC_IMAGE_URL || `${URL}/image.png`
    },
  });
}