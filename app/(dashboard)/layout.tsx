import { ReactNode } from 'react';
import { Metadata } from 'next';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MobileHeader } from '@/components/dashboard/mobile-header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import mockDataJson from '@/mock.json';
import type { MockData } from '@/types/dashboard';
import { LocationWidget } from '@/components/dashboard/LocationWidget';
import Notifications from '@/components/dashboard/notifications';
import { MobileChat } from '@/components/chat/mobile-chat';
import Chat from '@/components/chat';
import SignOutButton from '@/components/auth/SignOutButton';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const mockData = mockDataJson as MockData;

// Create a custom mobile header that includes the sign-out button
function CustomMobileHeader() {
  return (
    <div className="lg:hidden flex items-center justify-between w-full px-4">
      <MobileHeader mockData={mockData} />
      <SignOutButton />
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Dashboard - L.I.F.E OS',
  description: 'Your personal dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        {/* Mobile Header - only visible on mobile */}
        <CustomMobileHeader />

        {/* Desktop Layout */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-gap lg:px-sides">
          <div className="hidden lg:block col-span-2 top-0 relative">
            <div className="flex flex-col h-full">
              <DashboardSidebar />
              <div className="mt-auto p-4">
                <SignOutButton />
              </div>
            </div>
          </div>
          <div className="col-span-1 lg:col-span-7">{children}</div>
          <div className="col-span-3 hidden lg:block">
            <div className="sticky top-4 space-y-4">
              <LocationWidget defaultData={mockData.widgetData} />
              <Notifications initialNotifications={mockData.notifications} />
              <Chat />
            </div>
          </div>
        </div>

        {/* Mobile Chat - floating CTA with drawer */}
        <MobileChat />
      </SidebarProvider>
    </ProtectedRoute>
  );
}
