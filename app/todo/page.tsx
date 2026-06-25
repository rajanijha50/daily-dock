"use client";
import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import { TodoContainer, TodoStatus } from "@/features/todo/TodoContainer";
import { userStore } from "@/store/userStore";

export type ITodo = {
  _id?: string;
  content?: string;
  status: string;
  createdAt?: Date;
  modifiedAt?: Date;
};

const COLUMNS: TodoStatus[] = ["not-started", "in-progress", "completed"];

export default function TodoPage() {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [activeTodo, setActiveTodo] = useState<ITodo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = userStore();

  useEffect(() => {
    if (user?.email) {
      fetchTodos();
    }
  }, [user?.email]);

  const fetchTodos = async () => {
    try {
      const res = await fetch(`/api/dock/todo?user_email=${user?.email}`);
      const data = await res.json();
      if (res.ok) {
        setTodos(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleNewTodo = async (content: string, status: string) => {
    try {
      const res = await fetch(`/api/dock/todo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          status,
          user_email: user?.email,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTodos([data.todo, ...todos]);
        setActiveTodo(data.todo);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleUpdateTodo = async (updatedTodo: ITodo) => {
    setTodos((prev) =>
      prev.map((t) => (t._id === updatedTodo._id ? updatedTodo : t)),
    );
    try {
      await fetch(`/api/dock/todo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTodo),
      });
    } catch (error) {
      console.error(error);
    }
  };
  const handleDeleteTodo = async (todoId: string) => {
    try {
      await fetch(`/api/dock/todo?id=${todoId}`, { method: "DELETE" });
      setTodos((prev) => prev.filter((t) => t._id !== todoId));
    } catch (error) {
      console.error(error);
    }
  };

  //Require a small drag distance before activating — prevents accidental drags on click
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const dragged = todos.find((t) => t._id === event.active.id);
    setActiveTodo(dragged ?? null);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTodo(null);

    if (!over) return;

    const draggedId = active.id as string;
    const targetStatus = over.id as TodoStatus;
    const draggedTodo = todos.find((todo) => todo._id === draggedId);
    handleUpdateTodo({ ...draggedTodo, status: targetStatus });
  };
  const handleDragCancel = () => setActiveTodo(null);

  const filterTodoByStatus = (status: TodoStatus) =>
    todos?.filter((t) => t.status === status);

  return (
    <div className="page-layout handle-scroll">
      <Header />
      <div className="h-full">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">My Todos</h1>
            <p className="text-sm mt-1">Track your progress by making todos.</p>
          </div>

          {/* Kanban Board */}
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {isLoading ? (
                <div className="w-full flex items-center justify-center py-32">
                  <LoadingSpinner text="Todos" />
                </div>
              ) : (
                COLUMNS.map((status) => (
                  <div
                    key={status}
                    className="w-full flex justify-center items-center gap-10"
                  >
                    <TodoContainer
                      status={status}
                      todos={filterTodoByStatus(status)}
                      onNew={handleNewTodo}
                      onUpdate={handleUpdateTodo}
                      onDelete={handleDeleteTodo}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Drag Overlay — renders a floating copy of the card while dragging */}
            <DragOverlay>
              {activeTodo ? (
                <div className="px-4 py-3 rounded-lg text-sm font-medium text-foreground bg-accent dark:bg-primary border border-border shadow-xl opacity-95 cursor-grabbing scale-105">
                  {activeTodo.content}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
      <Footer />
    </div>
  );
}
