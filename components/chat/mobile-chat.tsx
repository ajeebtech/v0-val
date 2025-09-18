"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileChatContent } from "./mobile-chat-content";
import { Button } from "../ui/button";
import { ChatStatusIndicator } from "./chat-status-indicator";
import { useChatState } from "./use-chat-state";
import { useIsMobile } from "@/hooks/use-mobile";

export function MobileChat() {
  const { totalUnreadCount, chatState, setChatState } = useChatState();
  const isMobile = useIsMobile();
  const hasNewMessages = totalUnreadCount > 0;

  // Sheet should be open for both "expanded" and "conversation" states
  const isOpen =
    chatState.state === "expanded" || chatState.state === "conversation";

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Only close if not in a conversation, or if we want to force close
      setChatState({ state: "collapsed" });
    } else {
      setChatState({ state: "expanded" });
    }
  };

  // Don't render on mobile
  if (isMobile) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange} defaultOpen={false}>

      {/* Chat Drawer */}
      <SheetContent
        side="bottom"
        className="h-[85vh] p-0 md:hidden"
        closeButton={false}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Chat</SheetTitle>
        </SheetHeader>

        <MobileChatContent />
      </SheetContent>
    </Sheet>
  );
}
