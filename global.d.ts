declare namespace NodeJS {
  interface ProcessEnv {
    REDIS_URL?: string;
    REDIS_TOKEN?: string;
    NEXT_PUBLIC_URL?: string;
    NEXT_PUBLIC_ONCHAINKIT_API_KEY?: string;
    NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME?: string;
    NEXT_PUBLIC_ICON_URL?: string;
    NEXT_PUBLIC_IMAGE_URL?: string;
    NEXT_PUBLIC_VERSION?: string;
    NEXT_PUBLIC_SPLASH_IMAGE_URL?: string;
    NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR?: string;
    FARCASTER_HEADER?: string;
    FARCASTER_PAYLOAD?: string;
    FARCASTER_SIGNATURE?: string;
  }
} 