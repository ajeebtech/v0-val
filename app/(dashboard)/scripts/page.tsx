'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Script } from '@/types/script';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Typewriter } from '@/components/ui/typewriter';

type ScriptWithId = Script & { id: string };

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<ScriptWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [editingScript, setEditingScript] = useState<ScriptWithId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  // Fetch scripts on component mount
  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/scripts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch scripts');
      }
      
      const data = await response.json();
      setScripts(data);
    } catch (err) {
      console.error('Error in fetchScripts:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while loading scripts');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const scriptData = {
        title,
        content,
        is_public: isPublic,
      };
      
      const response = await fetch('/api/scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scriptData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create script');
      }
      
      const result = await response.json();
      
      // Add the new script to the list
      setScripts(prevScripts => [result, ...prevScripts]);
      
      // Reset form
      setTitle('');
      setContent('');
      setIsPublic(false);
      setEditingScript(null);
      
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Failed to save script');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (script: ScriptWithId) => {
    setEditingScript(script);
    setTitle(script.title);
    setContent(script.content);
    setIsPublic(script.is_public);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this script?')) return;
    
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('scripts')
        .delete()
        .eq('id', id);
        
      if (deleteError) {
        console.error('Supabase delete error:', deleteError);
        throw new Error(`Failed to delete script: ${deleteError.message}`);
      }
      
      setScripts(scripts.filter(script => script.id !== id));
    } catch (err) {
      console.error('Error in handleDelete:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete script');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <Typewriter text="Script Editor" />
        </h1>
        <p className="text-muted-foreground">
          Create, edit, and manage your code snippets and scripts
        </p>
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Script Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <Textarea
                placeholder="Enter your script/code here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="font-mono text-sm w-full"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">Make public</span>
              </label>
              <div className="space-x-2">
                {editingScript && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingScript(null);
                      setTitle('');
                      setContent('');
                      setIsPublic(false);
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingScript ? 'Update Script' : 'Save Script'}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Your Scripts</h2>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted/50 animate-pulse rounded" />
                ))}
              </div>
            ) : scripts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No scripts yet. Create your first one!</p>
            ) : (
              <div className="space-y-2">
                {scripts.map((script) => (
                  <div
                    key={script.id}
                    className="p-3 border rounded hover:bg-accent/50 transition-colors cursor-pointer group"
                    onClick={() => handleEdit(script)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm">{script.title}</h3>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(script.id);
                          }}
                          className="text-destructive hover:text-destructive/80 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {script.content.substring(0, 100)}
                      {script.content.length > 100 ? '...' : ''}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(script.updated_at).toLocaleDateString()}
                      </span>
                      {script.is_public && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
