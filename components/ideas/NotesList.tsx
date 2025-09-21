'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, FileText, Pencil, Trash2, Loader2 } from 'lucide-react';

// Custom Textarea component since the UI component is missing
const Textarea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea 
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
    {...props}
  />
);

// Create a single supabase client for interacting with your database
const supabase = createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
});

// Log Supabase config for debugging
console.log('Supabase config:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***' : 'MISSING',
  env: process.env.NODE_ENV
});

// Debug function to log Supabase errors with more details
function logSupabaseError(operation: string, error: any) {
  console.error(`Supabase ${operation} error:`, {
    message: error?.message || 'No error message',
    details: error?.details || 'No details',
    hint: error?.hint || 'No hint',
    code: error?.code || 'No error code',
    error: error ? JSON.stringify(error) : 'No error object',
    time: new Date().toISOString()
  });
}

interface Note {
  id: string;
  title: string;
  content: string | null;
  guest_id: string;
  created_at: string;
  updated_at: string;
}

export function NotesList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<Note> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [guestId, setGuestId] = useState<string>('');

  const fetchNotes = useCallback(async (guestId: string) => {
    if (!guestId) {
      console.log('No guest ID available yet');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching notes for guest:', guestId);
      
      // First, try a direct query to get all notes
      console.log('Fetching all notes...');
      const { data, error, count } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });
        
      console.log(`Found ${data?.length || 0} total notes in database`);
      
      if (error) {
        console.error('Direct query error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // If direct query fails, try the RPC function
        console.log('Trying RPC function as fallback...');
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_guest_notes', { p_guest_id: guestId });
          
        if (rpcError) {
          console.error('RPC query failed:', {
            message: rpcError.message,
            details: rpcError.details,
            hint: rpcError.hint,
            code: rpcError.code
          });
          
          // Try a raw SQL query as a last resort
          console.log('Trying raw SQL query...');
          const { data: rawData, error: rawError } = await supabase
            .from('notes')
            .select('*')
            .or(`guest_id.eq.${guestId}`);
            
          if (rawError) {
            console.error('Raw SQL query failed:', rawError);
            throw rawError;
          }
          
          console.log(`Fetched ${rawData?.length || 0} notes via raw SQL`);
          setNotes(Array.isArray(rawData) ? rawData : []);
        } else {
          console.log(`Fetched ${rpcData?.length || 0} notes via RPC`);
          setNotes(Array.isArray(rpcData) ? rpcData : []);
        }
      } else {
        console.log(`Successfully fetched ${data?.length || 0} notes directly`);
        console.log('Sample note data:', data?.[0]);
        setNotes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error in fetchNotes:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        guestId,
        time: new Date().toISOString()
      });
      
      // Set empty array to prevent loading state from persisting
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize guest ID from localStorage or create a new one
  const initializeGuestId = useCallback(() => {
    try {
      const storedGuestId = localStorage.getItem('guest_id');
      if (storedGuestId) {
        console.log('Found existing guest ID in localStorage:', storedGuestId);
        setGuestId(storedGuestId);
        fetchNotes(storedGuestId).catch(error => {
          console.error('Error in initial notes fetch:', error);
        });
      } else {
        const newGuestId = `guest_${Math.random().toString(36).substr(2, 9)}`;
        console.log('Generated new guest ID:', newGuestId);
        try {
          localStorage.setItem('guest_id', newGuestId);
          setGuestId(newGuestId);
        } catch (error) {
          console.error('Error saving guest ID to localStorage:', error);
          // Continue with the ID even if localStorage fails
          setGuestId(newGuestId);
        }
      }
    } catch (error) {
      console.error('Error initializing guest ID:', error);
      // Fallback to a random ID if something goes wrong
      const fallbackId = `guest_${Math.random().toString(36).substr(2, 9)}`;
      setGuestId(fallbackId);
    }
  }, [fetchNotes]);

  // Initialize guest ID and fetch notes on component mount
  useEffect(() => {
    console.log('Component mounted, initializing guest ID...');
    initializeGuestId();
    
    // Set up real-time subscription
    if (guestId) {
      console.log('Setting up real-time subscription for guest:', guestId);
      
      const channel = supabase
        .channel('notes_changes')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'notes',
            filter: `guest_id=eq.${guestId}`
          }, 
          (payload) => {
            console.log('Received real-time update:', payload);
            fetchNotes(guestId).catch(error => {
              console.error('Error in real-time update handler:', error);
            });
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
          if (status === 'CHANNEL_ERROR') {
            console.error('Error in real-time channel');
            // Try to resubscribe on error
            setTimeout(() => {
              console.log('Attempting to resubscribe...');
              channel.unsubscribe().then(() => {
                channel.subscribe();
              });
            }, 1000);
          }
        });

      // Initial fetch
      console.log('Performing initial notes fetch...');
      fetchNotes(guestId).catch(error => {
        console.error('Initial notes fetch failed:', error);
      });

      return () => {
        console.log('Cleaning up real-time subscription');
        supabase.removeChannel(channel).then(() => {
          console.log('Successfully removed channel');
        }).catch(error => {
          console.error('Error removing channel:', error);
        });
      };
    }
  }, [guestId]);

  // Debug effect to log notes changes
  useEffect(() => {
    console.log('Notes updated. Count:', notes.length);
    console.log('Current notes:', notes);
  }, [notes]);

  const handleAddNote = () => {
    setCurrentNote({
      title: '',
      content: '',
    });
    setIsAdding(true);
  };

  const handleSaveNote = async () => {
    if (!currentNote?.title?.trim()) {
      console.error('Cannot save: Title is required');
      return;
    }
    if (!guestId) {
      console.error('Cannot save: No guest ID available');
      return;
    }
    
    try {
      setIsSaving(true);
      console.log('Saving note with data:', {
        title: currentNote.title.trim(),
        content: currentNote.content?.trim() || null,
        guest_id: guestId,
        isEditing,
        noteId: currentNote.id
      });

      const noteData = {
        title: currentNote.title.trim(),
        content: currentNote.content?.trim() || null,
        guest_id: guestId,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && currentNote.id) {
        // Update existing note
        console.log('Updating existing note:', currentNote.id);
        const { data, error } = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', currentNote.id)
          .select();
          
        if (error) {
          console.error('Update error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        console.log('Update successful:', data);
      } else {
        // Create new note
        console.log('Creating new note with data:', noteData);
        
        // First, try a direct insert without .select() to see if that works
        const { data, error } = await supabase
          .from('notes')
          .insert({
            title: noteData.title,
            content: noteData.content,
            guest_id: noteData.guest_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          logSupabaseError('insert', error);
          
          // Try a raw SQL query as a fallback
          try {
            console.log('Trying raw SQL insert...');
            const { data: sqlData, error: sqlError } = await supabase.rpc('insert_note', {
              p_title: noteData.title,
              p_content: noteData.content,
              p_guest_id: noteData.guest_id
            });
            
            if (sqlError) throw sqlError;
            console.log('Raw SQL insert successful:', sqlData);
          } catch (sqlError) {
            console.error('Raw SQL insert failed:', sqlError);
            throw error; // Re-throw the original error
          }
        } else {
          console.log('Insert successful, refreshing notes...');
          await fetchNotes(guestId);
        }
        console.log('Insert successful:', data);
      }

      // Refresh the notes list
      await fetchNotes(guestId);
      
      setCurrentNote(null);
      setIsAdding(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Error in handleSaveNote:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error,
        time: new Date().toISOString()
      });
      // You might want to show an error toast here
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setCurrentNote(note);
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      // Optimistically remove the note from the UI
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('guest_id', guestId);
        
      if (error) {
        // If the delete fails, revert the UI change
        await fetchNotes(guestId);
        throw error;
      }
      
      // If we get here, the delete was successful
      // The real-time subscription will handle any further updates
    } catch (error) {
      console.error('Error deleting note:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error,
        time: new Date().toISOString()
      });
      // You might want to show an error toast here
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">My Notes</h2>
        <Button 
          onClick={handleAddNote} 
          disabled={isAdding}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {isAdding && (
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              {isEditing ? 'Edit Note' : 'New Note'}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsAdding(false);
                setIsEditing(false);
                setCurrentNote(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Input
            placeholder="Note title"
            value={currentNote?.title || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCurrentNote({
                ...currentNote!,
                title: e.target.value,
              })
            }
            className="text-lg font-medium"
          />
          <Textarea
            placeholder="Start writing your note here..."
            value={currentNote?.content || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setCurrentNote({
                ...currentNote!,
                content: e.target.value,
              })
            }
            className="min-h-[200px]"
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setIsEditing(false);
                setCurrentNote(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNote} 
              disabled={!currentNote?.title || !currentNote.title.trim() || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">{note.title}</h3>
                </div>
                {note.content && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {note.content}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(note.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEditNote(note)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {!isLoading && notes.length === 0 && !isAdding && (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border-2 border-dashed border-muted">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No notes yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first note
          </p>
          <Button onClick={handleAddNote}>
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </div>
      )}
    </div>
  );
}
