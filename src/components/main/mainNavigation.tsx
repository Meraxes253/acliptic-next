'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface NavigationProps {
  user_id?: string;
  onSignOut?: () => void;
}

export default function Navigation({ user_id, onSignOut }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToComponent = (componentId: string) => {
    const element = document.getElementById(componentId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'how-it-works', label: 'Features', action: () => scrollToComponent('how-it-works') },
    { id: 'interactive-demo', label: 'Demo', action: () => scrollToComponent('interactive-demo') },
    { id: 'pricing-plans', label: 'Pricing', action: () => scrollToComponent('pricing-plans') }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-700' : 'bg-transparent'
      }`}>
        <div className="w-full px-8 pt-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={scrollToTop} className="flex items-center group">
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
              {navLinks.map((link, index) => (
                <div key={link.id} className="flex items-center">
                  <button
                    onClick={link.action}
                    className="text-3xl transition-colors relative dark:hover:text-white cursor-pointer denton-condensed font-medium"
                  >
                    {link.label}
                  </button>
                  {index < navLinks.length - 1 && (
                      <span className="ml-8 text-black dark:text-gray-500 text-lg">●</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Auth Buttons - Always visible */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {user_id ? (
                <Link
                  href="/Studio"
                  className="bg-black text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-full text-sm md:text-base font-medium hover:bg-gray-800 transition-all duration-200 transform hover:scale-105"
                >
                  Studio
                </Link>
              ) : (
                <>
                  <Link
                    href="/Login"
                    className="hidden md:block text-base font-medium text-gray-600 hover:text-black dark:hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/Signup"
                    className="bg-black text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-full text-sm md:text-base font-medium hover:bg-gray-800 transition-all duration-200 transform hover:scale-105"
                  >
                    Try Acliptic
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:bg-white dark:hover:bg-gray-200 transition-colors"
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className={`block w-5 h-0.5 bg-black transform transition-all duration-300 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
                  }`} />
                  <span className={`block w-5 h-0.5 bg-black transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`} />
                  <span className={`block w-5 h-0.5 bg-black transform transition-all duration-300 ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
                  }`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 border-b border-gray-100 dark:border-slate-700' : 'max-h-0'
        }`}>
          <div className="bg-white dark:bg-slate-800 px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  link.action();
                  setIsMobileMenuOpen(false);
                }}
                className="block text-base font-medium transition-colors text-gray-600 hover:text-black w-full text-left"
              >
                {link.label}
              </button>
            ))}

            {!user_id && (
              <div className="pt-4 border-t border-gray-100">
                <Link
                  href="/Login"
                  className="block text-base font-medium text-gray-600 hover:text-black transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {/* Spacer to prevent content overlap */}
      <div className="h-20" />
    </>
  );
}