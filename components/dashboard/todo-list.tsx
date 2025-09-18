'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type Todo = Database['public']['Tables']['todos']['Row'];

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const supabase = createClientComponentClient<Database>();

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('todos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, () => {
        fetchTodos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast.error('Failed to load todos');
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const todoText = newTodo.trim();
    if (!todoText || isAdding) return;

    setIsAdding(true);
    
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ 
          task: todoText,
          is_completed: false 
        }])
        .select()
        .single();

      if (error) throw error;
      
      setTodos(prev => [data, ...prev]);
      setNewTodo('');
      toast.success('Todo added!');
      
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error('Failed to add todo');
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTodo = async (id: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_completed: !isCompleted })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, is_completed: !isCompleted } : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error('Failed to update todo');
    }
  };

  const deleteTodo = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        const { error } = await supabase
          .from('todos')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Update local state
        setTodos(todos.filter(todo => todo.id !== id));
        toast.success('Todo deleted!');
      } catch (error) {
        console.error('Error deleting todo:', error);
        toast.error('Failed to delete todo');
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Todo List</h3>
        {todos.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {todos.filter(t => t.is_completed).length} of {todos.length} completed
          </span>
        )}
      </div>
      
      <form onSubmit={addTodo} className="flex gap-2 w-full" noValidate>
        <div className="flex-1">
          <Input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="w-full"
            required
            minLength={1}
            maxLength={255}
            disabled={isAdding}
          />
        </div>
        <Button 
          type="submit"
          disabled={!newTodo.trim() || isAdding}
          className="whitespace-nowrap"
        >
          {isAdding ? 'Adding...' : 'Add Task'}
        </Button>
      </form>

      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              {supabase.auth.getUser() ? 'No tasks yet. Add one above!' : 'Sign in to manage your todos'}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence>
              {todos.map((todo) => (
                <motion.li
                  key={todo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                  className="group relative"
                >
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <Checkbox
                      id={`todo-${todo.id}`}
                      checked={todo.is_completed}
                      onCheckedChange={() => toggleTodo(todo.id, todo.is_completed)}
                      className={`mt-0.5 ${todo.is_completed ? 'opacity-50' : ''}`}
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={`todo-${todo.id}`}
                        className={`text-sm leading-snug cursor-pointer ${todo.is_completed ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {todo.task}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(todo.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1 text-red-500 rounded-full hover:bg-red-100"
                      title="Delete todo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}