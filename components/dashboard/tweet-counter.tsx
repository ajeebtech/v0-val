"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Custom Tweet Icon Component
const TweetIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 256 256" 
    className={className}
  >
    <rect width="256" height="256" fill="none"/>
    <polygon 
      points="48 40 96 40 208 216 160 216 48 40" 
      fill="none" 
      stroke="currentColor" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="16"
    />
    <line 
      x1="113.88" 
      y1="143.53" 
      x2="48" 
      y2="216" 
      fill="none" 
      stroke="currentColor" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="16"
    />
    <line 
      x1="208" 
      y1="40" 
      x2="142.12" 
      y2="112.47" 
      fill="none" 
      stroke="currentColor" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="16"
    />
  </svg>
);

interface TweetCounterProps {
  onCountChange?: (count: number, date: string) => void;
}

export default function TweetCounter({ onCountChange }: TweetCounterProps) {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  // Get today's date in YYYY-MM-DD format (memoized)
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Fetch today's tweet count
  useEffect(() => {
    const fetchTweetCount = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Test basic table access
        const { data: testData, error: testError } = await supabase
          .from('tweets')
          .select('*')
          .limit(1);

        if (testError) {
          console.error('Table access test failed:', testError);
          setIsLoading(false);
          return;
        }
        
        // Get the latest count for today (not resetting daily)
        const { data, error } = await supabase
          .from('tweets')
          .select('count')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error fetching tweet count:', error);
          return;
        }

        // If no record exists for today, get the last count from previous days
        if (error && error.code === 'PGRST116') {
          const { data: lastData, error: lastError } = await supabase
            .from('tweets')
            .select('count')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(1)
            .single();

          if (lastError && lastError.code !== 'PGRST116') {
            console.error('Error fetching last tweet count:', lastError);
            setCount(0);
            onCountChange?.(0, today);
            return;
          }

          const lastCount = lastData?.count || 0;
          setCount(lastCount);
          onCountChange?.(lastCount, today);
        } else {
          setCount(data?.count || 0);
          onCountChange?.(data?.count || 0, today);
        }
      } catch (error) {
        console.error('Unexpected error fetching tweet count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTweetCount();
  }, [user, today]);

  const updateTweetCount = async (newCount: number) => {
    if (!user || isUpdating || newCount < 0) {
      return;
    }

    setIsUpdating(true);
    try {
      // Use a simpler approach - try to update first, if no rows affected, then insert
      const { data: updateData, error: updateError } = await supabase
        .from('tweets')
        .update({ count: newCount })
        .eq('user_id', user.id)
        .eq('date', today)
        .select();

      if (updateError) {
        console.error('Update error:', updateError);
        
        // If update failed, try to insert
        const { data: insertData, error: insertError } = await supabase
          .from('tweets')
          .insert({
            user_id: user.id,
            date: today,
            count: newCount,
          })
          .select();
        
        if (insertError) {
          console.error('Both update and insert failed:', insertError);
          return;
        }
      } else if (!updateData || updateData.length === 0) {
        // No rows were updated, try to insert
        const { data: insertData, error: insertError } = await supabase
          .from('tweets')
          .insert({
            user_id: user.id,
            date: today,
            count: newCount,
          })
          .select();
        
        if (insertError) {
          console.error('Insert failed:', insertError);
          return;
        }
      }

        setCount(newCount);
        onCountChange?.(newCount, today);
        console.log('Tweet count updated:', { newCount, today });
    } catch (error) {
      console.error('Unexpected error updating tweet count:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const incrementCount = () => {
    updateTweetCount(count + 1);
  };

  const decrementCount = () => {
    updateTweetCount(Math.max(0, count - 1));
  };

  if (isLoading) {
    return (
      <div className="bg-black rounded-xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
            <span className="text-white font-medium uppercase text-sm">TWEET COUNTER</span>
          </div>
          <TweetIcon className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-center justify-center h-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-xl border border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
          <span className="text-white font-medium uppercase text-sm">TWEET COUNTER</span>
        </div>
        <TweetIcon className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {/* Count Display */}
        <div className="text-3xl font-bold text-white uppercase">
          {count}
        </div>
        
        {/* Date Display */}
        <div className="text-sm text-gray-400">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={decrementCount}
            disabled={isUpdating || count === 0}
            variant="outline"
            size="sm"
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={incrementCount}
            disabled={isUpdating}
            variant="outline"
            size="sm"
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        {/* Status */}
        {isUpdating && (
          <div className="text-xs text-gray-500">
            Updating...
          </div>
        )}
      </div>
    </div>
  );
}
