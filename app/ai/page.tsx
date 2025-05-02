import GroqAIChat from '../components/GroqAIChat';

export default function AIPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">JustCoinIt AI Assistant</h1>
      <p className="text-gray-600 mb-8 text-center">
        Powered by Groq&apos;s Llama 3.3 70B model to help you understand content coins and crypto concepts.
      </p>
      
      <GroqAIChat />
      
      <div className="mt-12 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">About This AI Assistant</h2>
        <p className="mb-2">
          This assistant uses Groq&apos;s Llama 3.3 70B model to provide helpful information about:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>Content coins and their use cases</li>
          <li>Cryptocurrency concepts and terminology</li>
          <li>Blockchain technology</li>
          <li>Base network features</li>
          <li>Web3 development</li>
        </ul>
        <p className="text-sm text-gray-600">
          Note: While the AI strives to provide accurate information, always verify important details from official sources.
        </p>
      </div>
    </div>
  );
} 