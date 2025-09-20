'use client';

import { Globe } from "@/components/ui/globe";

export function GlobeDemo() {
  return (
    <div className="relative flex w-full items-center justify-center py-4 z-10">
      <div className="relative" style={{ width: '220px', height: '220px' }}>
        <Globe className="w-full h-full" />
      </div>
    </div>
  );
}
