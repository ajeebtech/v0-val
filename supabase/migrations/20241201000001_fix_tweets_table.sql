-- Safe migration for tweets table - handles existing policies and tables
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own tweets" ON public.tweets;
DROP POLICY IF EXISTS "Users can insert their own tweets" ON public.tweets;
DROP POLICY IF EXISTS "Users can update their own tweets" ON public.tweets;
DROP POLICY IF EXISTS "Users can delete their own tweets" ON public.tweets;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_tweets_updated_at_trigger ON public.tweets;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_tweets_updated_at();

-- Create tweets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tweets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create index for efficient querying by user and date (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_tweets_user_date ON public.tweets(user_id, date);

-- Enable Row Level Security
ALTER TABLE public.tweets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own tweets" ON public.tweets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tweets" ON public.tweets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tweets" ON public.tweets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tweets" ON public.tweets
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tweets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tweets_updated_at_trigger
    BEFORE UPDATE ON public.tweets
    FOR EACH ROW
    EXECUTE FUNCTION update_tweets_updated_at();

-- Insert sample data for October 12 to November 1, 2024
-- This will create entries with 0 counts that can be updated
-- Only insert if the user doesn't already have data for these dates
INSERT INTO public.tweets (user_id, date, count)
SELECT 
    auth.uid(),
    generate_series(
        '2024-10-12'::date,
        '2024-11-01'::date,
        '1 day'::interval
    )::date,
    0
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, date) DO NOTHING;
