'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import LoginForm from './login-form';

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
      </div>
    );
  }

  // For debugging - show auth status
  if (process.env.NODE_ENV !== 'production') {
    const AuthStatus = require('@/components/AuthStatus').default;
    return (
      <div className="space-y-8">
        <LoginForm redirectTo={redirectTo} />
        <div className="max-w-md mx-auto">
          <AuthStatus />
        </div>
      </div>
    );
  }

  // In production, just show the login form
  return <LoginForm redirectTo={redirectTo} />;
}
