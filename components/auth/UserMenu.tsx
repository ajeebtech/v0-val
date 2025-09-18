'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SignOutButton from './SignOutButton';

export default function UserMenu() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userInitials = getInitials(displayName);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={displayName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span>{userInitials}</span>
          )}
        </div>
        <span className="hidden md:inline text-sm font-medium text-gray-300">
          {displayName}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
              <p className="font-medium">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <div className="px-2 py-1">
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
