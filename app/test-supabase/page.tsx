'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function TestSupabase() {
  useEffect(() => {
    async function test() {
      console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...');
      
      const supabase = createClientComponentClient();
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('User:', user);
        
        if (user) {
          const { data, error } = await supabase.from('todos').select('*').limit(1);
          console.log('Todos test:', { data, error });
        }
      } catch (error) {
        console.error('Test error:', error);
      }
    }
    
    test();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Test</h1>
      <p>Check the browser console for test results.</p>
    </div>
  );
}
