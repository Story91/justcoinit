'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'AI Assistant', path: '/ai' },
    { name: 'Farcaster', path: '/farcaster' },
  ];
  
  return (
    <nav className="bg-white shadow-sm py-3 px-4 mb-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          JustCoinIt
        </Link>
        
        <ul className="flex space-x-6">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                href={item.path}
                className={`${
                  isActive(item.path) 
                    ? 'text-indigo-600 font-medium' 
                    : 'text-gray-600 hover:text-indigo-600'
                } transition-colors`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
} 