import { Todo, TodoInput } from "@/types/todo";

const DB_NAME = "TodoDB";
const STORE_NAME = "todos";
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

export const resetDB = async (): Promise<void> => {
  const db = await initDB();
  dbInstance = null;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

export const addTodo = async (todo: TodoInput): Promise<Todo> => {
  const db = await initDB();
  const newTodo: Todo = {
    ...todo,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(newTodo);

    request.onsuccess = () => resolve(newTodo);
    request.onerror = () => reject(request.error);
  });
};

export const getAllTodos = async (): Promise<Todo[]> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const updateTodo = async (
  id: string,
  updates: Partial<Todo>
): Promise<Todo> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const todo = getRequest.result;
      if (!todo) {
        reject(new Error("Todo not found"));
        return;
      }

      const updatedTodo = {
        ...todo,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const putRequest = store.put(updatedTodo);
      putRequest.onsuccess = () => resolve(updatedTodo);
      putRequest.onerror = () => reject(putRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
};

export const deleteTodo = async (id: string): Promise<void> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
