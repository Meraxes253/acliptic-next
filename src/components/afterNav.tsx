'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProfileDropdown from '@/components/Profile/ProfileDropdown';

const navItems = [
  // {
  //   name: 'LIBRARY',
  //   path: '/Library'
  // },
  {
    name: 'Studio',
    path: '/Studio'
  },
];

interface NavigationProps {
  user?: any;
  externalSettingsOpen?: boolean;
  externalSettingsTab?: string;
  onExternalSettingsClose?: () => void;
}

export default function Navigation({
  user,
  externalSettingsOpen = false,
  externalSettingsTab = 'profile',
  onExternalSettingsClose
}: NavigationProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Helper function to determine if a path matches a nav item
  const isPathActive = (itemName: string, pathname: string) => {
    const upperName = itemName.toUpperCase();
    const upperPath = pathname.toUpperCase();

    // Direct match
    if (upperPath.startsWith(`/${upperName}`)) {
      return true;
    }

    // Check for Library-related paths (clips pages from Library)
    if (upperName === 'LIBRARY' && upperPath.includes('/LIBRARY/')) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    // Set the current path immediately without any delay
    const pathname = window.location.pathname;
    const matchedItem = navItems.find(item => isPathActive(item.name, pathname));
    const path = matchedItem ? matchedItem.name.toUpperCase() : pathname.slice(1).toUpperCase() || 'LIBRARY';
    setCurrentPath(path);
  }, []);

  // Listen for route changes to update currentPath
  useEffect(() => {
    const handleRouteChange = () => {
      const pathname = window.location.pathname;
      const matchedItem = navItems.find(item => isPathActive(item.name, pathname));
      const path = matchedItem ? matchedItem.name.toUpperCase() : pathname.slice(1).toUpperCase() || 'LIBRARY';
      setCurrentPath(path);
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-700' : 'bg-transparent'
      }`}>
        <div className="w-full px-4 md:px-8 pt-3 md:pt-4">
          <div className="flex items-center justify-between h-12 md:h-16">
            {/* Logo */}
            <button onClick={() => router.push('/')} className="flex items-center group">
              <Image
                src="/AELogo.svg"
                alt="Logo"
                width={140}
                height={140}
                priority
                quality={100}
                className="w-auto h-[30px] md:h-[50px] object-contain dark:invert"
              />
            </button>

            {/* Navigation - Always visible */}
            <div className="flex items-center justify-center space-x-4 md:space-x-10 absolute left-1/2 transform -translate-x-1/2">
              {navItems.map((item, index) => (
                <div key={item.name} className="flex items-center">
                  <Link
                    href={item.path}
                    className={`relative text-3xl md:text-5xl tracking-wide transition-all duration-300 group denton-condensed
                      ${currentPath && currentPath === item.name.toUpperCase()
                        ? 'text-black dark:text-white'
                        : 'text-gray-600 hover:text-black dark:hover:text-white'
                      }`}
                  >
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                </div>
              ))}
            </div>

            {/* Profile - Always visible */}
            <div className="flex items-center space-x-2 md:space-x-4 scale-75 md:scale-100 origin-right">
              <ProfileDropdown
                user={user}
                externalSettingsOpen={externalSettingsOpen}
                externalSettingsTab={externalSettingsTab}
                onExternalSettingsClose={onExternalSettingsClose}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content overlap */}
      <div className="h-16 md:h-20" />

    </>
  );
}