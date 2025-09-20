// components/dashboard/sidebar/index.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Bullet } from "@/components/ui/bullet";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, 
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader, 
  SidebarMenu, SidebarMenuBadge, SidebarMenuButton, 
  SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import LockIcon from "@/components/icons/lock";
import MonkeyIcon from "@/components/icons/monkey";
import BracketsIcon from "@/components/icons/brackets";
import AtomIcon from "@/components/icons/atom";
import ProcessorIcon from "@/components/icons/proccesor";
import CuteRobotIcon from "@/components/icons/cute-robot";
import EmailIcon from "@/components/icons/email";
import GearIcon from "@/components/icons/gear";
import { Gamepad2 } from 'lucide-react';
import UserMenu from "@/components/auth/UserMenu";
import { GlobeDemo } from "../globe-demo";

const sidebarItems = [
  {
    title: "Overview",
    url: "/",
    icon: BracketsIcon,
  },
  {
    title: "Ideas",
    url: "/ideas",
    icon: AtomIcon,
  },
  {
    title: "Laboratory",
    url: "/laboratory",
    icon: AtomIcon,
  },
  {
    title: "Devices",
    url: "/devices",
    icon: ProcessorIcon,
  },
  {
    title: "Security",
    url: "/security",
    icon: CuteRobotIcon,
  },
  {
    title: "Communication",
    url: "/communication",
    icon: EmailIcon,
  },
  {
    title: "Valorant Matches",
    url: "/valorant",
    icon: Gamepad2,
  },
  {
    title: "Admin Settings",
    url: "/admin",
    icon: GearIcon,
    locked: true,
  },
];

export function DashboardSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props} className={cn("py-sides", className)}>
      <SidebarHeader className="rounded-t-lg flex gap-3 flex-row rounded-b-none">
        <div className="flex overflow-clip size-12 shrink-0 items-center justify-center rounded bg-sidebar-primary-foreground/10 transition-colors group-hover:bg-sidebar-primary text-sidebar-primary-foreground">
          <MonkeyIcon className="size-10 group-hover:scale-[1.7] origin-top-left transition-transform" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="text-2xl font-display">garage</span>
          <span className="text-xs uppercase">the world is yours</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="rounded-t-none">
          <SidebarGroupLabel>
            <Bullet className="mr-2" />
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const isActive = pathname === item.url || 
                  (item.url !== '/' && pathname?.startsWith(item.url));
                
                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={item.locked ? "pointer-events-none opacity-50" : ""}
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      disabled={item.locked}
                      className={item.locked ? "pointer-events-none" : ""}
                    >
                      <Link href={item.url} className="flex items-center gap-3 w-full">
                        <item.icon className="size-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.locked && (
                      <SidebarMenuBadge>
                        <LockIcon className="size-5 block" />
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Globe Component */}
        <div className="py-4">
          <GlobeDemo />
        </div>
      </SidebarContent>

      <SidebarFooter className="p-0 mt-auto">
        <SidebarGroup>
          <SidebarGroupLabel>
            <Bullet className="mr-2" />
            User
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2">
              <UserMenu />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}