"use client";

import { Suspense } from "react";
import { TodoApp } from "@/components/TodoApp";
import { TodoAppLoading } from "@/components/TodoAppLoading";

export default function Home() {
  return (
    <Suspense fallback={<TodoAppLoading />}>
      <TodoApp />
    </Suspense>
  );
}
