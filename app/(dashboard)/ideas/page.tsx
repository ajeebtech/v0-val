'use client';

import { NotesList } from '@/components/ideas/NotesList';

export default function IdeasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ideas</h1>
        <p className="text-muted-foreground">Your thoughts, ideas, and notes in one place</p>
      </div>
      <NotesList />
    </div>
  );
}
