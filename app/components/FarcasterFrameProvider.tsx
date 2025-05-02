'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { isFarcasterFrame } from '../../lib/farcaster';

// Przechowujemy załadowane moduły globalnie
let farcasterSDK: any = null;
let farcasterConnector: any = null;

// Funkcja ładująca zależności dynamicznie
const loadDependencies = async () => {
  try {
    if (farcasterSDK && farcasterConnector) {
      return true;
    }
    
    // Ładuj równolegle oba moduły
    const [frameSDK, frameConnector] = await Promise.all([
      import('@farcaster/frame-sdk').catch(() => null),
      import('@farcaster/frame-wagmi-connector').catch(() => null)
    ]);
    
    if (frameSDK?.sdk) {
      farcasterSDK = frameSDK.sdk;
    }
    
    if (frameConnector?.farcasterFrame) {
      farcasterConnector = frameConnector.farcasterFrame;
    }
    
    return Boolean(farcasterSDK && farcasterConnector);
  } catch (error) {
    console.error('Błąd ładowania zależności Farcaster:', error);
    return false;
  }
};

export function FarcasterFrameProvider({ children }: PropsWithChildren) {
  const { connect } = useConnect();
  const { isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !isFarcasterFrame()) return;
    
    let mounted = true;

    const init = async () => {
      try {
        // Załaduj zależności jeśli jeszcze nie są załadowane
        const loaded = await loadDependencies();
        if (!loaded || !mounted) return;

        // Próbuj uzyskać kontekst Farcaster
        if (farcasterSDK && !isConnected) {
          try {
            const context = await farcasterSDK.context;
            
            if (!mounted) return;
            
            // Automatycznie połącz portfel jeśli w ramce Farcaster
            if (context?.client?.clientFid) {
              connect({ connector: farcasterConnector() });
            }
            
            // Ukryj ekran ładowania
            setTimeout(() => {
              if (mounted && farcasterSDK?.actions?.ready) {
                farcasterSDK.actions.ready();
              }
            }, 800);
          } catch (error) {
            // Cichy błąd - brak kontekstu Farcaster
          }
        }
      } catch (error) {
        console.error('Błąd inicjalizacji Farcaster Frame:', error);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [connect, isMounted, isConnected]);

  return <>{children}</>;
} 