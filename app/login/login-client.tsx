'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import LoginForm from './login-form';

// Add global styles for better cross-browser compatibility
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .spin-animation {
    animation: spin 1s linear infinite;
    -webkit-animation: spin 1s linear infinite;
    -moz-animation: spin 1s linear infinite;
    -ms-animation: spin 1s linear infinite;
  }
`;

export default function LoginClient() {
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectedFrom') || '/dashboard';

  // Check if user is already logged in - let middleware handle the redirect
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        // If user is already logged in, the middleware will handle the redirect
        if (session?.user) {
          return;
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <style jsx global>{globalStyles}</style>
        <div className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-blue-500 spin-animation" />
      </div>
    );
  }

  // Wrap in a container with hardware acceleration
  return (
    <div className="transform-gpu">
      <style jsx global>{globalStyles}</style>
      {process.env.NODE_ENV !== 'production' ? (
        <div className="space-y-8">
          <LoginForm redirectTo={redirectTo} />
          <div className="max-w-md mx-auto">
            {require('@/components/AuthStatus').default}
          </div>
        </div>
      ) : (
        <LoginForm redirectTo={redirectTo} />
      )}
    </div>
  );
}
