'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Add input styles that work across browsers
const inputStyles: React.CSSProperties = {
  WebkitAppearance: 'none' as const,
  MozAppearance: 'none' as const,
  appearance: 'none' as const,
  WebkitTapHighlightColor: 'transparent',
  outline: 'none',
};

// Add button styles that work across browsers
const buttonStyles: React.CSSProperties = {
  WebkitAppearance: 'none' as const,
  MozAppearance: 'none' as const,
  appearance: 'none' as const,
  WebkitTapHighlightColor: 'transparent',
  WebkitUserSelect: 'none' as const,
  MozUserSelect: 'none' as const,
  msUserSelect: 'none' as const,
  userSelect: 'none' as const,
};

export default function LoginForm({ redirectTo = '/dashboard' }: { redirectTo?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const finalRedirectTo = redirectTo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      // Store the redirect URL in localStorage before signing in
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectAfterLogin', finalRedirectTo);
      }

      // Sign in with email and password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;
      
      if (data?.session) {
        console.log('Login successful, session:', data.session);
        // The AuthProvider will handle the redirect after successful login
      } else {
        throw new Error('No session returned after login');
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Clear the redirect URL on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('redirectAfterLogin');
      }
      
      // More specific error messages
      if (error.message?.includes?.('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (error.message?.includes?.('Email not confirmed')) {
        setError('Please verify your email before logging in.');
      } else if (error.status === 400) {
        setError('Invalid request. Please check your input and try again.');
      } else if (error.status === 0) {
        setError('Cannot connect to the server. Please check your internet connection.');
      } else {
        setError(error.error_description || error.message || 'An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add a mounted state to prevent hydration issues
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  if (!mounted) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-blue-500 spin-animation" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-lg p-8 border border-border">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold font-display tracking-tight mb-2">
              garage
            </h1>
            <p className="text-sm text-muted-foreground">the world is yours</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <form 
            onSubmit={handleSubmit} 
            className="space-y-6 max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg transform-gpu"
            style={{
              // Add transform for hardware acceleration
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              MozBackfaceVisibility: 'hidden',
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full font-display"
                required
                style={inputStyles}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full font-display"
                required
                style={inputStyles}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full transition-colors duration-200"
              disabled={loading}
              style={buttonStyles}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
