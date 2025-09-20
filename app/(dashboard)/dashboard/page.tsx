"use client";

import { useEffect, useState, useCallback } from 'react';
import { PanelLeftClose, PanelRightClose, Layout as LayoutDashboard } from "lucide-react";
import BracketsIcon from "@/components/icons/brackets";
import mockDataJson from "@/mock.json";
import type { MockData } from "@/types/dashboard";
import { DashboardMatchInfo } from "@/types/valorant";
import { getUpcomingMatch, getLiveMatch } from "@/lib/valorant";

// Components
import DashboardPageLayout from "@/components/dashboard/layout";
import DashboardStat from "@/components/dashboard/stat";
import DashboardChart from "@/components/dashboard/chart";
import RebelsRanking from "@/components/dashboard/rebels-ranking";
import SecurityStatus from "@/components/dashboard/security-status";
import TodoList from "@/components/dashboard/todo-list";
import NextClass from "@/components/dashboard/next-class";

// Icons
import GearIcon from "@/components/icons/gear";
import ProcessorIcon from "@/components/icons/proccesor";
import BoomIcon from "@/components/icons/boom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const mockData = mockDataJson as MockData;

// Icon mapping
const iconMap = {
  gear: GearIcon,
  proccesor: ProcessorIcon,
  boom: BoomIcon,
};

export default function DashboardOverview() {
  const [isMobile, setIsMobile] = useState(false);
  const [showTodoPanel, setShowTodoPanel] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [matchStats, setMatchStats] = useState<{
    nextMatch: DashboardMatchInfo | null;
    followingMatch: DashboardMatchInfo | null;
    liveMatch: DashboardMatchInfo | null;
  }>({ nextMatch: null, followingMatch: null, liveMatch: null });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch match data function
  const fetchMatchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [upcomingMatches, liveMatch] = await Promise.all([
        getUpcomingMatch(),
        getLiveMatch()
      ]);
      
      setMatchStats({
        nextMatch: upcomingMatches.nextMatch,
        followingMatch: upcomingMatches.followingMatch,
        liveMatch
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching match data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    setIsMounted(true);
    fetchMatchData();
    
    return () => {
      setIsMounted(false);
    };
  }, [fetchMatchData]);

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
        {/* Manual Refresh Button */}
        <div className="flex justify-end">
          <Button 
            onClick={fetchMatchData}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <span>Refreshing...</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                <span>Refresh Data</span>
              </>
            )}
          </Button>
        </div>
        {/* Main Content */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Next Class Card */}
            <div className="bg-black rounded-xl border border-gray-800 p-5">
              <NextClass lastUpdated={lastUpdated} />
            </div>
            
            {/* Next Match */}
            {matchStats.nextMatch && (
              <DashboardStat 
                key="next-match"
                label={matchStats.nextMatch.label}
                value={matchStats.nextMatch.value}
                description={matchStats.nextMatch.description}
                intent={matchStats.nextMatch.intent === 'danger' ? 'negative' : matchStats.nextMatch.intent}
                icon={iconMap[matchStats.nextMatch.icon as keyof typeof iconMap] || BracketsIcon}
              />
            )}
            
            {/* Following Match */}
            {matchStats.followingMatch && (
              <DashboardStat 
                key="following-match"
                label={matchStats.followingMatch.label}
                value={matchStats.followingMatch.value}
                description={matchStats.followingMatch.description}
                intent={matchStats.followingMatch.intent === 'danger' ? 'negative' : matchStats.followingMatch.intent}
                icon={iconMap[matchStats.followingMatch.icon as keyof typeof iconMap] || BracketsIcon}
              />
            )}
            
            {/* Live Match */}
            {matchStats.liveMatch && (
              <DashboardStat 
                key="live-match"
                label={matchStats.liveMatch.label}
                value={matchStats.liveMatch.value}
                description={matchStats.liveMatch.description}
                intent={matchStats.liveMatch.intent === 'danger' ? 'negative' : matchStats.liveMatch.intent}
                icon={iconMap[matchStats.liveMatch.icon as keyof typeof iconMap] || BracketsIcon}
              />
            )}
          </div>

          <div className="mb-6">
            <DashboardChart />
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
