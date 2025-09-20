'use client';

import { NotesList } from '@/components/ideas/NotesList';
import { ChatBot } from '@/components/ideas/ChatBot';

export default function IdeasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ideas</h1>
        <p className="text-muted-foreground">Your thoughts, ideas, and notes in one place</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NotesList />
        </div>
        <div className="lg:col-span-1">
          <ChatBot />
        </div>
      </div>
    </div>
  );
}
