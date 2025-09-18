"use client";

import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bullet } from "@/components/ui/bullet";
import type { Notification } from "@/types/dashboard";

interface NotificationsProps {
  initialNotifications: Notification[];
}

function calculateDaysLeftInYear() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const endOfYear = new Date(currentYear, 11, 31); // December 31st of current year
  
  // Calculate difference in days
  const diffTime = endOfYear.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export default function Notifications() {

  const daysLeft = useMemo(() => calculateDaysLeftInYear(), []);
  const currentYear = new Date().getFullYear();

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between pl-3 pr-1">
        <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
          <Bullet />
          Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">{daysLeft}</p>
            <p className="text-sm text-muted-foreground">
              days left in {currentYear}
            </p>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out"
              style={{
                width: `${((365 - daysLeft) / 365 * 100).toFixed(2)}%`
              }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {((365 - daysLeft) / 365 * 100).toFixed(1)}% of year completed
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
