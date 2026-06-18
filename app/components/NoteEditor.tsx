"use client";
import { useEffect, useRef, useState } from "react";
import { INote } from "@/app/note/page";
import { Button } from "@/components/ui/button";
import { X, Trash2, PinOff, Pin } from "lucide-react";

interface NoteEditorProps {
  note: INote;
  onUpdate: (note: INote) => void;
  onDelete: (_id: string) => void;
  onClose: () => void;
  isSaving: boolean
}

export default function NoteEditor({
  note,
  onUpdate,
  onDelete,
  onClose,
  isSaving
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [pinned, setPinned] = useState(note.pinned);
  const [category, setCategory] = useState(note.category);
  const [allowedCategories, setAllowedCategories] = useState<string[]>([
    "travel",
    "productivity",
    "study",
    "fun",
  ]);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setPinned(note.pinned);
    setCategory(note.category);
  }, [note._id]);

  useEffect(() => {
    titleRef.current?.focus();
  }, [note._id]);


  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content || pinned !== note.pinned || category !== note.category) {
        onUpdate({ ...note, title, content, pinned, category });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [title, content, pinned, category, onClose]);

  return (
    <div
      className="w-200 h-full flex flex-col bg-primary-foregroud border border-border rounded-2xl text-pimary dark:text-foreground"
      onClick={(e)=> e.stopPropagation()}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <span className="text-xs font-mono tracking-widest uppercase">
          {note.modifiedAt
            ? new Date(note.modifiedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "New note"}
        </span>
        <div className="flex items-center gap-2">
          <select className="p-2 border outline-none rounded-md" name="category" id="category" 
          onChange={(e) => {
            setCategory(e.target.value)
            }
          }
          >
            <option className="bg-secondary text-primary-foreground dark:bg-primary dark:text-white hover:bg-red-100" value={`${category || "default"}`}>
              {category || "select category"}
            </option>
            {allowedCategories.map((cat, idx) => {
              if (cat != category) return <option className="bg-secondary text-primary-foreground dark:bg-primary dark:text-white hover:bg-red-100" key={idx} value={cat}>{cat}</option>;
            })}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="capitalize mr-2">{isSaving ? 'saving...' : 'saved'}</span>
          <Button
            variant="default"
            size="icon"
            onClick={() => {setPinned(!pinned)}}
            className={`bg-transparent text-foreground hover:bg-white/20`}
          >
            {pinned ? <PinOff size={16} /> : <Pin size={16} />}
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={() => onDelete(note._id!)}
            className="text-red-600 bg-transparent hover:bg-red-500/10"
          >
            <Trash2 size={16} />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={onClose}
            className="bg-transparent text-foreground hover:bg-red-500/20"
          >
            <X size={18} />
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 px-5 py-0 md:px-16 md:py-12">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="w-full bg-transparent text-3xl font-bold leading-snug outline-none mb-6 resize-none"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your thoughts..."
          className="w-full h-full bg-transparent text-base leading-relaxed outline-none resize-none border-t pt-6 pb-10"
        />
      </div>
    </div>
  );
}
