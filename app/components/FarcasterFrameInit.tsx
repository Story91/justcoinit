'use client';

import { useEffect, useState } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { isFarcasterFrame } from '../../lib/farcaster';

// Typy dla SDK Farcaster
type FarcasterSDK = {
  context: Promise<any>;
  actions: {
    ready: () => void;
  };
};

// Przechowuj załadowane moduły w pamięci
let cachedSDK: FarcasterSDK | null = null;
let cachedConnector: (() => any) | null = null;

export default function FarcasterFrameInit() {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Pomiń renderowanie po stronie serwera
    if (typeof window === 'undefined') return;
    if (initialized || !isFarcasterFrame()) {
      setInitialized(true);
      return;
    }

    const initFarcaster = async () => {
      try {
        // Załaduj moduły jeśli jeszcze nie są załadowane
        if (!cachedSDK || !cachedConnector) {
          try {
            // Równoległe ładowanie zależności
            const [frameSdkModule, connectorModule] = await Promise.all([
              import('@farcaster/frame-sdk').catch(() => null),
              import('@farcaster/frame-wagmi-connector').catch(() => null)
            ]);
            
            if (frameSdkModule?.sdk) {
              cachedSDK = frameSdkModule.sdk;
            }
            
            if (connectorModule?.farcasterFrame) {
              cachedConnector = connectorModule.farcasterFrame;
            }
          } catch (error) {
            console.error("Błąd ładowania modułów Farcaster:", error);
          }
        }

        // Kontynuuj tylko jeśli oba moduły zostały poprawnie załadowane
        if (cachedSDK && cachedConnector && !isConnected) {
          try {
            // Połącz portfel automatycznie
            connect({ connector: cachedConnector() });
            
            // Ukryj ekran ładowania
            setTimeout(() => {
              if (cachedSDK?.actions?.ready) {
                cachedSDK.actions.ready();
              }
            }, 800);
          } catch (error) {
            // W przypadku błędu łączenia, próbuj użyć pierwszego dostępnego connectora
            if (connectors.length > 0 && !isConnected) {
              connect({ connector: connectors[0] });
            }
          }
        }
        
        setInitialized(true);
      } catch (error) {
        console.error("Błąd w FarcasterFrameInit:", error);
        setInitialized(true);
      }
    };

    initFarcaster();
  }, [connect, connectors, initialized, isConnected]);

  // Ten komponent nie renderuje nic widocznego
  return null;
} 