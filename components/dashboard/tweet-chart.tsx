"use client";

import * as React from "react";
import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bullet } from "@/components/ui/bullet";

type TweetChartDataPoint = {
  date: string;
  tweets: number;
  reels: number;
};

const chartConfig = {
  tweets: {
    label: "Tweets",
    color: "var(--chart-1)",
  },
  reels: {
    label: "Reels",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

// Generate date range from October 12 to November 1, 2024
const generateDateRange = () => {
  const dates = [];
  const startDate = new Date('2024-10-12');
  const endDate = new Date('2024-11-01');
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push({
      date: d.toISOString().split('T')[0],
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tweets: 0,
      reels: 0
    });
  }
  
  return dates;
};

interface TweetChartProps {
  refreshTrigger?: number;
  onRefresh?: () => void;
}

export default function TweetChart({ refreshTrigger, onRefresh }: TweetChartProps) {
  const [chartData, setChartData] = useState<TweetChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  console.log('TweetChart render:', { refreshTrigger, hasUser: !!user });

  // Manual refresh function
  const refreshData = useCallback(async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    try {
      // Fetch tweets data - get all records to calculate daily increments
      const { data: tweetsData, error: tweetsError } = await supabase
        .from('tweets')
        .select('date, count')
        .eq('user_id', user.id)
        .gte('date', '2024-10-12')
        .lte('date', '2024-11-01')
        .order('date', { ascending: true });

      if (tweetsError) {
        console.error('Error fetching tweet data:', tweetsError);
      } else {
        console.log('Tweets data fetched:', tweetsData);
      }

      // Fetch reels data - get all records to calculate daily increments
      const { data: reelsData, error: reelsError } = await supabase
        .from('reels')
        .select('date, count')
        .eq('user_id', user.id)
        .gte('date', '2024-10-12')
        .lte('date', '2024-11-01')
        .order('date', { ascending: true });

      if (reelsError) {
        console.error('Error fetching reels data:', reelsError);
      } else {
        console.log('Reels data fetched:', reelsData);
      }

      // Generate base date range
      const baseDates = generateDateRange();
      
      // For now, let's just show the raw counts to test if data is being fetched
      const mergedData = baseDates.map(dateObj => {
        const tweetData = tweetsData?.find(item => item.date === dateObj.date);
        const reelsDataItem = reelsData?.find(item => item.date === dateObj.date);
        return {
          date: dateObj.displayDate,
          tweets: tweetData?.count || 0,
          reels: reelsDataItem?.count || 0
        };
      });

      console.log('Final chart data:', mergedData);
      setChartData(mergedData);
    } catch (error) {
      console.error('Error refreshing chart data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [user, supabase]);

  // Fetch tweet and reels data from Supabase
  useEffect(() => {
    console.log('Chart useEffect triggered:', { user: !!user, refreshTrigger, timestamp: new Date().toISOString() });
    const fetchData = async () => {
      if (!user) {
        console.log('No user, skipping fetch');
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch tweets data - get all records to calculate daily increments
        const { data: tweetsData, error: tweetsError } = await supabase
          .from('tweets')
          .select('date, count')
          .eq('user_id', user.id)
          .gte('date', '2024-10-12')
          .lte('date', '2024-11-01')
          .order('date', { ascending: true });

        if (tweetsError) {
          console.error('Error fetching tweet data:', tweetsError);
        } else {
          console.log('Tweets data fetched:', tweetsData);
        }

        // Fetch reels data - get all records to calculate daily increments
        const { data: reelsData, error: reelsError } = await supabase
          .from('reels')
          .select('date, count')
          .eq('user_id', user.id)
          .gte('date', '2024-10-12')
          .lte('date', '2024-11-01')
          .order('date', { ascending: true });

        if (reelsError) {
          console.error('Error fetching reels data:', reelsError);
        } else {
          console.log('Reels data fetched:', reelsData);
        }

        // Generate base date range
        const baseDates = generateDateRange();
        
        // For now, let's just show the raw counts to test if data is being fetched
        const mergedData = baseDates.map(dateObj => {
          const tweetData = tweetsData?.find(item => item.date === dateObj.date);
          const reelsDataItem = reelsData?.find(item => item.date === dateObj.date);
          return {
            date: dateObj.displayDate,
            tweets: tweetData?.count || 0,
            reels: reelsDataItem?.count || 0
          };
        });

        console.log('Final chart data:', mergedData);
        setChartData(mergedData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, refreshTrigger, supabase]);

  const formatYAxisValue = (value: number) => {
    if (value === 0) {
      return "";
    }
    return value.toString();
  };

  const renderChart = (data: TweetChartDataPoint[]) => {
    return (
      <div className="bg-accent rounded-lg p-3">
        <ChartContainer className="md:aspect-[3/1] w-full" config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: -12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <defs>
              <linearGradient id="fillTweets" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-tweets)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-tweets)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillReels" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-reels)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-reels)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              horizontal={false}
              strokeDasharray="8 8"
              strokeWidth={2}
              stroke="var(--muted-foreground)"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={12}
              strokeWidth={1.5}
              className="uppercase text-sm fill-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={0}
              tickCount={6}
              className="text-sm fill-muted-foreground"
              tickFormatter={formatYAxisValue}
              domain={[0, "dataMax"]}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  className="min-w-[200px] px-4 py-3"
                />
              }
            />
            <Area
              dataKey="tweets"
              type="linear"
              fill="url(#fillTweets)"
              fillOpacity={0.4}
              stroke="var(--color-tweets)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              dataKey="reels"
              type="linear"
              fill="url(#fillReels)"
              fillOpacity={0.4}
              stroke="var(--color-reels)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-accent rounded-lg p-3">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Daily Increments (Oct 12 - Nov 1)</h3>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => {
              console.log('Manual refresh button clicked');
              refreshData();
              onRefresh?.();
            }}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            <RotateCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <div className="flex items-center gap-6">
            {Object.entries(chartConfig).map(([key, value]) => (
              <ChartLegend key={key} label={value.label} color={value.color} />
            ))}
          </div>
        </div>
      </div>
      {renderChart(chartData)}
    </div>
  );
}

export const ChartLegend = ({
  label,
  color,
}: {
  label: string;
  color: string;
}) => {
  return (
    <div className="flex items-center gap-2 uppercase">
      <Bullet style={{ backgroundColor: color }} className="rotate-45" />
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
};
