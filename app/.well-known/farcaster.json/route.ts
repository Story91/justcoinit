/// <reference types="node" />

// In Next.js, process.env is automatically included
// No need for explicit import
export async function GET() {
  return Response.json({
    "accountAssociation": {
      "header": "eyJmaWQiOjkxNTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMmVmNzkwRGQ3OTkzQTM1ZkQ4NDdDMDUzRURkQUU5NDBEMDU1NTk2In0",
      "payload": "eyJkb21haW4iOiJqdXN0Y29pbml0LnZlcmNlbC5hcHAifQ==",
      "signature": "MHgxMGQwZGU4ZGYwZDUwZTdmMGIxN2YxMTU2NDI1MjRmZTY0MTUyZGU4ZGU1MWU0MThiYjU4ZjVmZmQxYjRjNDBiNGVlZTRhNDcwNmVmNjhlMzQ0ZGQ5MDBkYmQyMmNlMmVlZGY5ZGQ0N2JlNWRmNzMwYzUxNjE4OWVjZDJjY2Y0MDFj"
    },
    "frame": {
      "version": "1",
      "name": "JustCoinIt",
      "iconUrl": "https://justcoinit.vercel.app/app.png",
      "splashImageUrl": "https://justcoinit.vercel.app/logo.png",
      "splashBackgroundColor": "#000000",
      "homeUrl": "https://justcoinit.vercel.app",
      "webhookUrl": "https://api.neynar.com/f/app/16e285ae-0ada-4f7b-b1f7-2742d15cdde8/event",
      "subtitle": "JustCoinIt - Base Builder Quest 4",
      "description": "Aplikacja do zarządzania kryptowalutami w ekosystemie Base.",
      "screenshotUrls": [
        "https://justcoinit.vercel.app/screenshot1.png",
        "https://justcoinit.vercel.app/screenshot2.png",
        "https://justcoinit.vercel.app/screenshot3.png"
      ],
      "primaryCategory": "finance",
      "tags": [
        "crypto",
        "miniapp",
        "coinbasewallet",
        "base"
      ],
      "heroImageUrl": "https://justcoinit.vercel.app/og.png",
      "tagline": "Zarządzaj kryptowalutami łatwo",
      "ogTitle": "JustCoinIt",
      "ogDescription": "Aplikacja do zarządzania kryptowalutami w ekosystemie Base",
      "ogImageUrl": "https://justcoinit.vercel.app/og.png"
    }
  });
}