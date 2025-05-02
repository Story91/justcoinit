'use client';

import { useState, useEffect } from 'react';

export default function NeynarStatus() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    async function checkNeynarStatus() {
      try {
        const response = await fetch('/api/farcaster/status');
        const data = await response.json();
        
        if (data.status === 'success') {
          setStatus('success');
          setMessage(data.message);
          setDetails(data.details);
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to connect to Neynar API');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to connect to Neynar API');
      }
    }
    
    checkNeynarStatus();
  }, []);
  
  return (
    <div className="my-6 p-4 rounded-lg border">
      <h2 className="text-xl font-semibold mb-2">Neynar API Status</h2>
      
      {status === 'loading' && (
        <div className="flex items-center text-gray-600">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Checking connection...</span>
        </div>
      )}
      
      {status === 'success' && (
        <div className="text-green-600">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{message}</span>
          </div>
          {details && (
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-red-600">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{message}</span>
          </div>
        </div>
      )}
    </div>
  );
} 