'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';

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

  const fetchTodos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast.error('Failed to load todos');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

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
          is_completed: false,
          position: todos.length + 1
        }])
        .select()
        .single();

      if (error) throw error;
      
      setTodos(prev => [...prev, data]);
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
        
        // Update local state and reorder positions
        const newTodos = todos.filter(todo => todo.id !== id);
        await updateTodosOrder(newTodos);
        
        toast.success('Todo deleted!');
      } catch (error) {
        console.error('Error deleting todo:', error);
        toast.error('Failed to delete todo');
      }
    }
  };

  const updateTodosOrder = async (reorderedTodos: Todo[]) => {
    try {
      // Prepare updates for all todos with their new positions
      const updates = reorderedTodos.map((todo, index) => ({
        id: todo.id,
        position: index + 1, // 1-based index
        updated_at: new Date().toISOString() // Ensure updated_at is set
      }));
  
      // Update todos
      const { error } = await supabase
        .from('todos')
        .upsert(updates, { onConflict: 'id' });
  
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Update local state with new positions
      setTodos(prev => 
        prev
          .map(todo => {
            const updatedTodo = updates.find(u => u.id === todo.id);
            return updatedTodo ? { ...todo, position: updatedTodo.position } : todo;
          })
          .sort((a, b) => (a.position || 0) - (b.position || 0))
      );
    } catch (error) {
      console.error('Error updating todo order:', error);
      throw error;
    }
  };

  // Handle drag end event
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex(todo => todo.id === active.id);
    const newIndex = todos.findIndex(todo => todo.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder todos locally
    const newTodos = arrayMove(todos, oldIndex, newIndex);
    
    // Update the order in the database
    try {
      await updateTodosOrder(newTodos);
    } catch (error) {
      console.error('Error updating todo order:', error);
      toast.error('Failed to update todo order');
    }
  };

  // Sortable Item Component
  const SortableItem = ({ todo }: { todo: Todo }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: todo.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 'auto',
    };

    return (
      <motion.li
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.2 }}
        className="relative group"
      >
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
          <div 
            {...attributes}
            {...listeners}
            className="flex items-center justify-center p-1 -ml-1 rounded-md cursor-grab active:cursor-grabbing text-muted-foreground hover:bg-accent"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <Checkbox
            id={`todo-${todo.id}`}
            checked={todo.is_completed}
            onCheckedChange={() => toggleTodo(todo.id, todo.is_completed)}
            className={`mt-0.5 ${todo.is_completed ? 'opacity-50' : ''}`}
          />
          <div className="flex-1 min-w-0">
            <label
              htmlFor={`todo-${todo.id}`}
              className={`text-sm leading-tight cursor-pointer ${todo.is_completed ? 'line-through text-muted-foreground' : ''}`}
            >
              {todo.task}
            </label>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              deleteTodo(todo.id);
            }}
          >
            ×
          </Button>
        </div>
      </motion.li>
    );
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
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={todos.map(todo => todo.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2">
                <AnimatePresence>
                  {todos.map((todo) => (
                    <SortableItem key={todo.id} todo={todo} />
                  ))}
                </AnimatePresence>
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}