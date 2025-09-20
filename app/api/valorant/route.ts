import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || 'upcoming';
  
  try {
    const response = await fetch(`https://vlrggapi.vercel.app/match?q=${q}`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch match data' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; // Ensure we don't cache API responses
