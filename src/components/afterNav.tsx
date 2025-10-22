'use client'
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProfileDropdown from '@/components/Profile/ProfileDropdown';

const navItems = [
  {
    name: 'LIBRARY',
    path: '/Library'
  },
  {
    name: 'STUDIO',
    path: '/Studio'
  },
];

interface NavigationProps {
  user?: any;
}

export default function Navigation({ user }: NavigationProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
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

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-700' : 'bg-transparent'
      }`}>
        <div className="w-full px-8 pt-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => router.push('/')} className="flex items-center group">
              <Image
                src="/AELogo.svg"
                alt="Logo"
                width={140}
                height={140}
                priority
                quality={100}
                className="w-auto h-[40px] md:h-[50px] object-contain dark:invert"
              />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center space-x-10 absolute left-1/2 transform -translate-x-1/2">
              {navItems.map((item, index) => (
                <div key={item.name} className="flex items-center">
                  <Link
                    href={item.path}
                    className={`relative text-3xl font-semibold tracking-wide transition-all duration-300 group denton-condensed
                      ${currentPath && currentPath === item.name.toUpperCase()
                        ? 'text-black dark:text-white'
                        : 'text-gray-600 hover:text-black dark:hover:text-white'
                      }`}
                  >
                    <span className="relative z-10">{item.name}</span>
                    {/* Animated underline */}
                    <span
                      className={`absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-gray-600 via-gray-800 to-gray-600 dark:from-gray-400 dark:via-gray-200 dark:to-gray-400 transition-all duration-300 ease-out
                        ${currentPath && currentPath === item.name.toUpperCase()
                          ? 'w-full'
                          : 'w-0 group-hover:w-full'
                        }`}
                    />
                  </Link>
                  {index < navItems.length - 1 && (
                      <span className="ml-8 text-black dark:text-gray-500 text-lg">●</span>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop - Profile */}
            <div className="hidden md:flex items-center space-x-4">
              <ProfileDropdown user={user}/>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:bg-white dark:hover:bg-gray-200 transition-colors"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-black transform transition-all duration-300 ${
                  menuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
                }`} />
                <span className={`block w-5 h-0.5 bg-black transition-all duration-300 ${
                  menuOpen ? 'opacity-0' : 'opacity-100'
                }`} />
                <span className={`block w-5 h-0.5 bg-black transform transition-all duration-300 ${
                  menuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
                }`} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        menuOpen ? 'max-h-96 border-b border-gray-100 dark:border-slate-700' : 'max-h-0'
      }`}>
        <div className="bg-white dark:bg-slate-800 px-6 py-4 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              onClick={closeMenu}
              className="block text-base font-medium transition-colors text-gray-600 hover:text-black denton-condensed"
            >
              {item.name}
            </Link>
          ))}

          <div className="pt-4 border-t border-gray-100 space-y-4">
            <ProfileDropdown user={user}/>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content overlap */}
      <div className="h-20" />

    </>
  );
}