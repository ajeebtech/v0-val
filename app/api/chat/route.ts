import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { message, date } = await request.json();
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'v0-val',
      },
    });

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-oss-120b:free',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant. The current date is ${date}. Keep responses concise and helpful.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 800,  // Reasonable limit for free tier
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.5,
      presence_penalty: 0.5
    });

    return NextResponse.json(completion);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Error processing your request' },
      { status: 500 }
    );
  }
}
