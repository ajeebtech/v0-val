-- Safe migration for reels table - creates new table
-- Create reels table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create index for efficient querying by user and date (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_reels_user_date ON public.reels(user_id, date);

-- Enable Row Level Security
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own reels" ON public.reels
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reels" ON public.reels
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reels" ON public.reels
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reels" ON public.reels
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reels_updated_at_trigger
    BEFORE UPDATE ON public.reels
    FOR EACH ROW
    EXECUTE FUNCTION update_reels_updated_at();

-- Insert sample data for October 12 to November 1, 2024
-- This will create entries with 0 counts that can be updated
-- Only insert if the user doesn't already have data for these dates
INSERT INTO public.reels (user_id, date, count)
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
