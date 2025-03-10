export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TodoInput = Omit<Todo, "id" | "createdAt" | "updatedAt">;

export interface TodoStore {
  todos: Todo[];
  addTodo: (todo: TodoInput) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  loadTodos: () => Promise<void>;
}
