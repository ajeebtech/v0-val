"use client";

import { useEffect, useState, useCallback } from 'react';
import { PanelLeftClose, PanelRightClose, Layout as LayoutDashboard } from "lucide-react";
import BracketsIcon from "@/components/icons/brackets";
import mockDataJson from "@/mock.json";
import type { MockData } from "@/types/dashboard";

// Components
import DashboardPageLayout from "@/components/dashboard/layout";
import DashboardStat from "@/components/dashboard/stat";
import TweetChart from "@/components/dashboard/tweet-chart";
import TweetCounter from "@/components/dashboard/tweet-counter";
import ReelsCounter from "@/components/dashboard/reels-counter";
import RebelsRanking from "@/components/dashboard/rebels-ranking";
import SecurityStatus from "@/components/dashboard/security-status";
import TodoList from "@/components/dashboard/todo-list";
import NextClass from "@/components/dashboard/next-class";

// Icons
import { Settings as Gear, Cpu, Bomb } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const mockData = mockDataJson as MockData;

// Memoized icon mapping
const iconMap = {
  gear: Gear,
  proccesor: Cpu,
  boom: Bomb,
} as const;

// The DashboardStat component is already memoized with proper prop comparison

function DashboardOverview() {
  const [isMobile, setIsMobile] = useState(false);
  const [showTodoPanel, setShowTodoPanel] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [chartRefreshTrigger, setChartRefreshTrigger] = useState(0);

  // Initial mount
  useEffect(() => {
    setIsMounted(true);
    setLastUpdated(new Date());
    
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Handle mobile responsiveness
  const checkIfMobile = useCallback(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 1024);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    // Initial check
    checkIfMobile();
    
    // Add event listeners
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [checkIfMobile, isMounted]);

  // Toggle todo panel visibility on mobile
  const toggleTodoPanel = () => {
    setShowTodoPanel(!showTodoPanel);
  };

  // Handle tweet count changes
  const handleTweetCountChange = (count: number, date: string) => {
    console.log('Tweet count changed:', { count, date });
    // Trigger chart refresh
    setChartRefreshTrigger(prev => prev + 1);
  };

  // Handle reels count changes
  const handleReelsCountChange = (count: number, date: string) => {
    console.log('Reels count changed:', { count, date });
    // Trigger chart refresh
    setChartRefreshTrigger(prev => prev + 1);
  };

  // Manual chart refresh function
  const handleChartRefresh = () => {
    setChartRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Overview",
        description: "Last updated 12:05",
        icon: BracketsIcon,
      }}
    >
      {/* Mobile Todo Toggle Button */}
      {isMobile && (
        <div className="fixed bottom-6 right-6 z-50 lg:hidden">
          <Button 
            onClick={toggleTodoPanel}
            size="lg"
            className="rounded-full w-14 h-14 p-0 shadow-lg"
          >
            {showTodoPanel ? (
              <PanelRightClose className="h-6 w-6" />
            ) : (
              <LayoutDashboard className="h-6 w-6" />
            )}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Main Content */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Next Class Card */}
            <div className="bg-black rounded-xl border border-gray-800 p-5">
              <NextClass lastUpdated={lastUpdated} />
            </div>
            
            {/* Tweet Counter */}
            <TweetCounter onCountChange={handleTweetCountChange} />
            
            {/* Reels Counter */}
            <ReelsCounter onCountChange={handleReelsCountChange} />
          </div>

          <div className="mb-6">
            <TweetChart 
              key={chartRefreshTrigger} 
              refreshTrigger={chartRefreshTrigger} 
              onRefresh={handleChartRefresh} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RebelsRanking rebels={mockData.rebelsRanking} />
            <SecurityStatus statuses={mockData.securityStatus} />
          </div>
        </div>

        {/* Todo List Section */}
        <div className="w-full mt-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">My Tasks</h2>
              <div className="max-h-[500px] overflow-y-auto">
                <TodoList />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardPageLayout>
  );
}

export default DashboardOverview;
