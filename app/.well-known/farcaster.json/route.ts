/// <reference types="node" />

// In Next.js, process.env is automatically included
// No need for explicit import
export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL;

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
      iconUrl: process.env.NEXT_PUBLIC_ICON_URL,
      imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL,
      buttonTitle: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "JustCoinIt"}`,
      splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL,
      splashBackgroundColor: `#${process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "000000"}`,
      webhookUrl: `${URL}/api/webhook`,
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
      heroImageUrl: process.env.NEXT_PUBLIC_IMAGE_URL,
      tagline: "Zarządzaj kryptowalutami łatwo",
      ogTitle: "JustCoinIt",
      ogDescription: "Prosta aplikacja do zarządzania kryptowalutami",
      ogImageUrl: process.env.NEXT_PUBLIC_IMAGE_URL
    },
  });
}