'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: { data: { [key: string]: any } }) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  updateProfile: async () => ({ error: new Error('AuthContext not initialized') }),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Handle user sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.push('/login');
  };

  useEffect(() => {
    // Set initial loading state
    setLoading(true);

    // Check active sessions and sets the user
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session);
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle specific auth events
        if (event === 'SIGNED_IN') {
          // Get the redirect URL from localStorage or use the default
          const redirectTo = localStorage.getItem('redirectAfterLogin') || '/dashboard';
          localStorage.removeItem('redirectAfterLogin');
          
          // Wait a moment for the session to be fully set
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          window.location.href = '/login';
        }
      }
    );

    // Get the initial session
    getInitialSession();

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Function to update user profile
  const updateProfile = async (updates: { data: { [key: string]: any } }) => {
    const { data, error } = await supabase.auth.updateUser(updates);
    
    if (!error && data?.user) {
      setUser(data.user);
    }
    
    return { error };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading,
      signOut: handleSignOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
