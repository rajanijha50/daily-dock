"use client";
import React, { useState, useEffect } from "react";
import { IDiary } from "@/app/diary/page";
import DiaryDatePicker from "./DiaryDatePicker";

interface DiaryEditorProps {
  diary: IDiary;
  onUpdate: (updated: IDiary) => void;
  isSaving: Boolean;
}

const DiaryEditor: React.FC<DiaryEditorProps> = ({
  diary,
  onUpdate,
  isSaving,
}) => {
  const [title, setTitle] = useState(diary.title);
  const [content, setContent] = useState(diary.content);

  useEffect(() => {
    setTitle(diary.title);
    setContent(diary.content);
  }, [diary._id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== diary.title || content !== diary.content) {
        onUpdate({ ...diary, title, content });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [title, content]);

  return (
    <div className="handle-scroll flex-1 h-full flex flex-col p-6 border border-muted m-4 rounded-2xl shadow-lg animate-fade-in">
      <div className="flex justify-between items-center mb-4 border-b border-muted pb-2">
        <DiaryDatePicker diary={diary} onUpdate={onUpdate} />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="ml-5 text-3xl font-bold bg-transparent border-none outline-none w-full"
        />
        <div className="text-sm font-semibold opacity-50 whitespace-nowrap">
          {isSaving ? "Saving..." : "Saved"}
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing..."
        className="flex-1 w-full bg-transparent border-none outline-none resize-none text-lg leading-relaxed p-2"
        spellCheck={true}
      />

      <div className="mt-2 text-left opacity-80 text-sm">
        {content.length} characters
      </div>
    </div>
  );
};

export default DiaryEditor;
