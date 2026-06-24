"use client";
import { useState } from "react";
import { LuPlus, LuCircle, LuClock, LuCircleCheck, LuPencil, LuTrash2 } from "react-icons/lu";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { ITodo } from "../todo/page";

export type TodoStatus = "not-started" | "in-progress" | "completed";

interface StatusConfig {
  label: string;
  icon: React.ReactNode;
  badgeClass: string;
  cardClass: string;
  addBtnClass: string;
  overClass: string;
}

const STATUS_CONFIG: Record<TodoStatus, StatusConfig> = {
  "not-started": {
    label: "Not started",
    icon: <LuCircle className="w-3 h-3" />,
    badgeClass:
      "bg-muted text-popover dark:bg-zinc-600 dark:text-white border border-border",
    cardClass:
      "text-white bg-muted dark:bg-popover border border-border hover:border-muted-foreground/40 hover:bg-accent dark:hover:bg-secondary",
    addBtnClass:
      "text-primary/70 hover:text-primary dark:text-muted-foreground cursor-pointer hover:bg-white/20",
    overClass: "ring-1 ring-border bg-muted/20",
  },
  "in-progress": {
    label: "In progress",
    icon: <LuClock className="w-3 h-3" />,
    badgeClass:
      "bg-accent text-muted-foreground dark:bg-blue-600 dark:text-white border border-primary/30",
    cardClass:
      "text-white bg-muted dark:bg-popover border border-border hover:border-muted-foreground/40 hover:bg-accent dark:hover:bg-secondary",
    addBtnClass:
      "text-primary/70 hover:text-primary dark:text-muted-foreground cursor-pointer hover:bg-white/20",
    overClass: "ring-1 ring-primary/40 bg-primary/5",
  },
  completed: {
    label: "Completed",
    icon: <LuCircleCheck className="w-3 h-3" />,
    badgeClass:
      "bg-primary text-white dark:bg-green-600 dark:text-white border border-secondary/30",
    cardClass:
      "text-white bg-muted dark:bg-popover border border-border hover:border-muted-foreground/40 hover:bg-accent dark:hover:bg-secondary",
    addBtnClass:
      "text-primary/70 hover:text-primary dark:text-muted-foreground cursor-pointer hover:bg-white/20",
    overClass: "ring-1 ring-secondary/40 bg-secondary/5",
  },
};

// ─── 1.Draggable Card ───────────────────────────────────────────────────────────
interface DraggableCardProps {
  cardClass: string;
  todo: ITodo;
  onUpdate: (todo: ITodo) => void;
  onDelete: (id: string) => void;
}

function DraggableCard({
  todo,
  cardClass,
  onUpdate,
  onDelete,
}: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: todo._id! });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const [hover, sethover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(todo.content);

  if (editing)
    return (
      <div className="mt-1 flex gap-2">
        <input
          autoFocus
          value={newTitle}
          onChange={(e) => {
            setNewTitle(e.target.value);
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              setEditing(false);
              if (newTitle) {
                onUpdate({ ...todo, content: newTitle });
              } else {
                alert("field can't be empty");
              }
            }
          }}
          className={cn(
            "w-full px-4 py-3 rounded-lg text-sm font-medium bg-muted/50 border border-border",
            "text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring",
          )}
        />
        <button
          className="p-2 bg-accent rounded-md text-sm hover:bg-muted"
          onClick={() => setEditing(false)}
        >
          Cancel
        </button>
      </div>
    );
  else
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={cn(
          "relative flex justify-between items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 select-none text-wrap",
          cardClass,
          isDragging && "opacity-40 scale-95",
        )}
        onMouseEnter={() => sethover(true)}
        onMouseLeave={() => sethover(false)}
      >
        <div className="w-4/5">{todo.content}</div>
        {hover && !editing && (
          <div className="absolute right-1 z-50 gap-5">
            <button
              onClick={() => setEditing(true)}
              className="p-2 text-white hover:bg-white/20 rounded-md"
            >
              <LuPencil size={15} />
            </button>
            <button
              onClick={() => onDelete(todo._id!)}
              className="p-2 text-red-500 hover:bg-red-500/20 rounded-md"
            >
              <LuTrash2 size={15} />
            </button>
          </div>
        )}
      </div>
    );
}

// ─── 2.TodoContainer ────────────────────────────────────────────────────────────

interface TodoContainerProps {
  status: TodoStatus;
  todos: ITodo[];
  onNew: (content: string, status: TodoStatus) => void;
  onUpdate: (todo: ITodo) => void;
  onDelete: (id: string) => void;
}

export function TodoContainer({
  status,
  todos,
  onNew,
  onUpdate,
  onDelete,
}: TodoContainerProps) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const config = STATUS_CONFIG[status];

  const { setNodeRef, isOver } = useDroppable({ id: status });

  const handleAdd = () => {
    const trimmed = newTitle.trim();
    if (trimmed) {
      onNew(trimmed, status);
      setNewTitle("");
      setAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") {
      setAdding(false);
      setNewTitle("");
    }
  };

  return (
    <div className="p-2 border border-popover dark:border-accent flex flex-col gap-2 min-w-75 max-w-85 bg-accent/30 dark:bg-popover/25 rounded-xl">
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-1 px-1">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            config.badgeClass,
          )}
        >
          {config.icon}
          {config.label}
        </span>
        <span className="text-sm font-mono">{todos?.length}</span>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 rounded-xl p-1 transition-all duration-150",
          isOver && config.overClass,
        )}
      >
        {todos?.length !== 0 &&
          todos?.map((todo) => (
            <DraggableCard
              key={todo._id}
              todo={todo}
              cardClass={config.cardClass}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
      </div>

      {/* Add new page */}
      {adding ? (
        <div className="mt-1 flex gap-2">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAdd}
            placeholder="Page content..."
            className={cn(
              "w-full px-4 py-3 rounded-lg text-sm font-medium bg-muted/50 border border-border",
              "text-foreground placeholder:text-foreground focus:outline-none focus:ring-1 focus:ring-ring",
            )}
          />
          <button
            className="p-2 bg-accent rounded-md text-sm hover:bg-muted text-white"
            onClick={() => setAdding(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          title="New page"
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 mt-1 text-sm rounded-lg transition-colors duration-150 w-full",
            config.addBtnClass,
          )}
        >
          <LuPlus className="w-4 h-4" />
          <span>New page</span>
        </button>
      )}
    </div>
  );
}
