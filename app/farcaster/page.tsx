import NeynarStatus from '../components/NeynarStatus';

export default function FarcasterPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">JustCoinIt Farcaster Integration</h1>
      <p className="text-gray-600 mb-8 text-center">
        Connect with the Farcaster social network to enhance your experience with JustCoinIt.
      </p>
      
      <NeynarStatus />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Farcaster Features</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Receive notifications about your content coins</li>
            <li>Share your investments with your Farcaster network</li>
            <li>Discover trending content coins from your network</li>
            <li>Interact with JustCoinIt as a Farcaster Frame</li>
          </ul>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
          <p className="mb-4">
            To connect your Farcaster account, you&apos;ll need to:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Install the Warpcast app or visit warpcast.com</li>
            <li>Create a Farcaster account if you don&apos;t have one</li>
            <li>Look for JustCoinIt in the Frames/Mini Apps section</li>
            <li>Authorize the connection to access JustCoinIt</li>
          </ol>
        </div>
      </div>
      
      <div className="mt-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">Developer Resources</h2>
        <p className="mb-2">
          JustCoinIt integrates with Farcaster using the following resources:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Neynar API:</strong> For Farcaster data access and interactions</li>
          <li><strong>Frames Protocol:</strong> For creating interactive embedded experiences</li>
          <li><strong>Farcaster Auth:</strong> For secure user authentication</li>
        </ul>
        <p className="mt-4 text-sm text-gray-600">
          For more information, visit the <a href="https://docs.neynar.com/" className="text-blue-600 hover:underline">Neynar documentation</a> or <a href="https://docs.farcaster.xyz/" className="text-blue-600 hover:underline">Farcaster docs</a>.
        </p>
      </div>
    </div>
  );
} 