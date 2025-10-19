/* 
 THERE IS A LOT OF PROP DRILLING IN ALL THESE COMPONENTS + THE NAVBAR (perhaps a user context? maybe related to how user Session Management is done)

*/
'use client'
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { gsap } from "gsap";
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { SignOutAction } from '@/actions/SignOutAction';
import { useRouter } from 'next/navigation';
import SettingsModal from '@/components/Profile/SettingsModal';

interface ProfileDropdownProps {
  user: {
    id: string;
    email: string;
    username: string;
    phone_number: string;
    image: string;
    youtube_channel_id?: string;
    presets?: Record<string, unknown>;
    onBoardingCompleted?: boolean;
    plugin_active?: boolean;
  };
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!dropdownRef.current) return;
    
    if (isOpen) {
      gsap.set(dropdownRef.current, { 
        visibility: 'visible',
        pointerEvents: 'auto'
      });
      
      gsap.fromTo(dropdownRef.current, 
        { 
          opacity: 0, 
          y: -10,
          scale: 0.95
        },
        {
          duration: 0.2,
          opacity: 1,
          y: 0,
          scale: 1,
          ease: "power2.out",
          transformOrigin: "top right"
        }
      );
    } else {
      gsap.to(dropdownRef.current, {
        duration: 0.15,
        opacity: 0,
        y: -10,
        scale: 0.95,
        ease: "power2.in",
        transformOrigin: "top right",
        onComplete: () => {
          if (dropdownRef.current) {
            gsap.set(dropdownRef.current, { 
              visibility: 'hidden',
              pointerEvents: 'none'
            });
          }
        }
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        const profileButton = document.querySelector('.profile-button');
        if (profileButton && !profileButton.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManualLogout = async () => {
    try {
      await SignOutAction();
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
      router.replace('/');
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
    closeDropdown();
  };

  return (
    <>
      <div className="relative">
        {/* Profile Button */}
        <button
          onClick={toggleDropdown}
          className="profile-button flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 hover:scale-105"
          aria-label="Profile menu"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 flex-shrink-0">
            {user?.image ? (
              <Image
                src={user.image}
                alt="Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-gray-500 dark:text-gray-400" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>
          <svg 
            className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        <div 
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          style={{ 
            visibility: 'hidden', 
            pointerEvents: 'none'
          }}
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 flex-shrink-0">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <svg 
                      className="w-5 h-5 text-gray-500 dark:text-gray-400" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || 'user@example.com'}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={openSettings}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>

            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
                <DarkModeToggle />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleManualLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-400 dark:hover:bg-red-900/20 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        user={user}
      />
    </>
  );
}