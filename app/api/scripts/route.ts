import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

// Helper function to get Supabase client
function getSupabaseClient() {
  const cookieStore = cookies();
  return createRouteHandlerClient<Database>({ cookies: () => cookieStore });
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Fetch all public scripts
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch scripts' },
        { status: 400 }
      );
    }

    return NextResponse.json(data || []);

  } catch (error) {
    console.error('Unexpected error in GET /api/scripts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const scriptData = await request.json();
    const supabase = getSupabaseClient();
    
    // Get session if it exists, but don't require it
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    // Insert the script with created_by
    const { data, error } = await supabase
      .from('scripts')
      .insert([{
        title: scriptData.title,
        content: scriptData.content,
        is_public: scriptData.is_public || false,
        created_by: userId, // Will be null if not authenticated
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { error: error.message || 'Failed to create script' },
        { status: 400 }
      );
    }
    
    console.log('Successfully created script:', data);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Unexpected error in POST /api/scripts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}