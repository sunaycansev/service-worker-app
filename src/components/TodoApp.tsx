"use client";

import { useEffect, useState } from "react";
import { TodoItem } from "@/components/TodoItem";
import { Todo, TodoInput } from "@/types/todo";
import {
  addTodo,
  getAllTodos,
  updateTodo,
  deleteTodo,
  resetDB,
} from "@/utils/db";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const isOnline = useOnlineStatus();
  const isServiceWorkerReady = useServiceWorker();

  useEffect(() => {
    if (isServiceWorkerReady) {
      loadTodos();
    }
  }, [isServiceWorkerReady]);

  const loadTodos = async () => {
    setIsLoading(true);
    try {
      const loadedTodos = await getAllTodos();
      setTodos(loadedTodos);
    } catch (error) {
      console.error("Error loading todos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      const newTodo: TodoInput = {
        title: newTodoTitle.trim(),
        completed: false,
      };
      await addTodo(newTodo);
      await loadTodos();
      setNewTodoTitle("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      const todo = todos.find((t) => t.id === id);
      if (todo) {
        await updateTodo(id, { completed: !todo.completed });
        await loadTodos();
      }
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id);
      await loadTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleResetDB = async () => {
    try {
      await resetDB();
      await loadTodos();
    } catch (error) {
      console.error("Error resetting database:", error);
    }
  };

  if (!isServiceWorkerReady) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <p className="text-center text-gray-500 dark:text-gray-400">
              Initializing app...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Todo App with Service Workers
            </h1>
            <button
              onClick={handleResetDB}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Reset database"
            >
              Reset DB
            </button>
          </div>

          {!isOnline && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
              You are currently offline. Changes will be synced when you&apos;re
              back online.
            </div>
          )}

          <form onSubmit={handleAddTodo} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder="Add a new todo..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add
              </button>
            </div>
          </form>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {todos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggleTodo}
                    onDelete={handleDeleteTodo}
                  />
                ))}
              </div>

              {todos.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
                  No todos yet. Add one above!
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
