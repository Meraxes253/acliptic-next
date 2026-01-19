'use client';

import { useDarkMode } from '@/contexts/DarkModeContext';
import { Moon, Sun } from 'lucide-react';

export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="w-full flex items-center justify-between text-sm text-gray-700 transition-colors duration-200"
    >
      <div className="flex items-center">
        {isDarkMode ? (
          <Moon className="w-4 h-4 mr-3" />
        ) : (
          <Sun className="w-4 h-4 mr-3" />
        )}
        <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
      </div>

      {/* Toggle Switch */}
      {/* <div
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            isDarkMode ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div> */}
    </button>
  );
} 

