"use client";
import { useEffect, useState } from "react";
import { LuPlus, LuFileText, LuTrash2, LuPin, LuPinOff } from "react-icons/lu";
import { Card } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NoteEditor from "@/features/note/NoteEditor";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import { userStore } from "@/store/userStore";

export type INote = {
  _id?: string;
  title: string;
  content: string;
  category?: string;
  pinned?: boolean;
  createdAt: Date;
  modifiedAt: Date;
};

export default function NotePage() {
  const [notes, setNotes] = useState<INote[]>([]);
  const [activeNote, setActiveNote] = useState<INote | null>();
  const [openEditor, setOpenEditor] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { user } = userStore();

  useEffect(() => {
    if (user?.email) {
      fetchNotes();
    }
  }, [user?.email]);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/dock/note?user_email=${user?.email}`);
      const data = await res.json();
      if (res.ok) {
        setNotes(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleNewNote = async () => {
    try {
      const res = await fetch(`/api/dock/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: user?.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotes([data.note, ...notes]);
        setActiveNote(data.note);
        setOpenEditor(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleUpdateNote = async (updatedNote: INote) => {
    setIsSaving(true);
    setNotes((prev) =>
      prev.map((n) => (n._id === updatedNote._id ? updatedNote : n)),
    );
    try {
      await fetch(`/api/dock/note`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedNote),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  const handleDeleteNote = async (noteId: string) => {
    try {
      await fetch(`/api/dock/note?id=${noteId}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      setOpenEditor(false);
    } catch (error) {
      console.error(error);
    }
  };

  const excerpt = (content: string) =>
    content?.slice(0, 120).replace(/\n/g, " ").trim() || "No content yet.";

  return (
    <div className="page-layout">
      <Header />
      <div className="min-h-screen">
        <div>
          <h1 className="text-center text-4xl font-semibold tracking-tight mt-10">
            My Notes
          </h1>
          <p className="text-center text-sm mt-3">
            Note things happening in your life.
          </p>
        </div>

        {/* Notes container */}
        <main className="max-w-5xl mx-auto px-6 py-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <LoadingSpinner text="Notes" />
            </div>
          ) : notes?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <LuFileText size={40} className="mb-4 opacity-40" />
              <p className="text-lg">No notes yet.</p>
              <p className="text-sm mt-1">Click "+" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes?.map((note) => (
                <Card
                  key={note._id}
                  className="h-64 text-primary bg-muted/50 dark:bg-accent/50 hover:dark:bg-accent dark:text-foreground border border-border rounded-lg p-4 hover:shadow-md hover:bg-accent/40 transition-all delay-100 duration-200 group hover:scale-102 flex flex-col justify-start"
                  onClick={() => {
                    setActiveNote(note);
                    setOpenEditor(true);
                  }}
                >
                  <h2 className="font-semibold text-base leading-snug line-clamp-1">
                    {note.title || "Untitled"}
                  </h2>
                  <p className="h-1/2 text-sm leading-relaxed line-clamp-4">
                    {excerpt(note.content)}
                  </p>
                  <div className="justify-self-end border-t pt-3 flex justify-between items-center">
                    <span className="text-xs font-mono tracking-wide">
                      {new Date(note.modifiedAt).toLocaleDateString("en-IN", {
                        dateStyle: "medium",
                      })}
                    </span>
                    {note.category && (
                      <span className="min-w-20 text-center capitalize p-2 bg-muted/50 dark:bg-white/20 rounded-md">
                        {note.category}
                      </span>
                    )}
                    <div>
                      <button
                        className="p-1.5 transition-all hover:bg-white/20 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateNote({ ...note, pinned: !note.pinned });
                        }}
                      >
                        {note.pinned ? (
                          <LuPinOff size={20} />
                        ) : (
                          <LuPin size={20} />
                        )}
                      </button>
                      <button
                        className="p-1.5 transition-all hover:bg-destructive/20 text-destructive rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note._id!);
                        }}
                      >
                        <LuTrash2 size={20} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <div className="fixed bottom-10 right-10 z-10">
            <button
              title="New Note"
              onClick={handleNewNote}
              className="p-5 rounded-full text-4xl bg-muted text-primary-foreground dark:bg-primary dark:text-white hover:bg-accent hover:dark:bg-primary/80 cursor-default"
            >
              <LuPlus size={35} />
            </button>
          </div>
        </main>

        {/* Editor slide-over panel */}
        {openEditor && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 backdrop-blur-lg flex justify-center items-center z-80"
              onClick={() => !isSaving && setOpenEditor(false)}
              aria-hidden="true"
            >
              <NoteEditor
                note={activeNote!}
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
                onClose={() => !isSaving && setOpenEditor(false)}
                isSaving={isSaving}
              />
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
