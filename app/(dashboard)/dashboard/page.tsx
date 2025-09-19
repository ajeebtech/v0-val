"use client";

import DashboardPageLayout from "@/components/dashboard/layout";
import DashboardStat from "@/components/dashboard/stat";
import DashboardChart from "@/components/dashboard/chart";
import RebelsRanking from "@/components/dashboard/rebels-ranking";
import SecurityStatus from "@/components/dashboard/security-status";
import TodoList from "@/components/dashboard/todo-list";
import BracketsIcon from "@/components/icons/brackets";
import GearIcon from "@/components/icons/gear";
import ProcessorIcon from "@/components/icons/proccesor";
import BoomIcon from "@/components/icons/boom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelRightClose, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import mockDataJson from "@/mock.json";
import type { MockData } from "@/types/dashboard";
import NextClass from "@/components/dashboard/next-class";

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

  useEffect(() => {
    // Check if mobile on mount and on resize
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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
        {/* Main Content */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <NextClass />
            {mockData.dashboardStats.slice(1).map((stat, index) => (
              <DashboardStat
                key={index}
                label={stat.label}
                value={stat.value}
                description={stat.description}
                icon={iconMap[stat.icon as keyof typeof iconMap]}
                tag={stat.tag}
                intent={stat.intent}
                direction={stat.direction}
              />
            ))}
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
