import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// Create a single supabase client for client-side usage
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  // Return existing client if it exists
  if (supabaseClient) {
    return supabaseClient;
  }

  // Debug log the environment variables (don't log the full key in production)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }

  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  // Create and store the client with simplified cookie handling
  supabaseClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'sb-auth-token',
        storage: {
          getItem: (key) => {
            if (typeof window === 'undefined') return null;
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
          },
          setItem: (key, value) => {
            if (typeof window === 'undefined') return;
            localStorage.setItem(key, JSON.stringify(value));
          },
          removeItem: (key) => {
            if (typeof window === 'undefined') return;
            localStorage.removeItem(key);
          },
        },
      },
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return null;
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) {
            const cookieValue = parts.pop()?.split(';').shift();
            return cookieValue ? decodeURIComponent(cookieValue) : null;
          }
          return null;
        },
        set(name: string, value: string, options: any = {}) {
          if (typeof document === 'undefined') return;
          
          const cookieOptions = {
            path: '/',
            sameSite: 'Lax', // or 'Strict' or 'None'
            secure: process.env.NODE_ENV === 'production',
            ...options,
          };
          
          // In development, we need to set domain to localhost
          if (process.env.NODE_ENV !== 'production') {
            cookieOptions.domain = 'localhost';
          }
          
          // Convert options to cookie string
          let cookieString = `${name}=${encodeURIComponent(value)}`;
          
          for (const [key, val] of Object.entries(cookieOptions)) {
            if (val === true) {
              cookieString += `; ${key}`;
            } else if (val !== false && val !== undefined && val !== null) {
              cookieString += `; ${key}=${val}`;
            }
          }
          
          document.cookie = cookieString;
        },
        remove(name: string, options: any = {}) {
          if (typeof document === 'undefined') return;
          
          // Set the expiration date in the past to delete the cookie
          document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
          
          // Also clear any options that were set
          if (options.domain) {
            document.cookie = `${name}=; Path=/; Domain=${options.domain}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
          }
        },
      },
    }
  );

  return supabaseClient;
}

export const supabase = createClient();
