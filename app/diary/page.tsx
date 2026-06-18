"use client";
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import DiarySidebar from "@/app/components/DiarySidebar";
import DiaryEditor from "@/app/components/DiaryEditor";
import Footer from "../components/Footer";
import { userStore } from "../store/userStore";

export type IDiary = {
  _id?: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: Date;
  modifiedAt: Date;
};

const DiaryApp = () => {
  const [diaries, setDiaries] = useState<IDiary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { user } = userStore();

  useEffect(() => {
    fetchDiaries();
  }, []);

  // Fetch Diaries
  const fetchDiaries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dock/diary?user_email=${user?.email}`);
      const data = await res.json();
      if (res.ok) {
        setDiaries(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create New Diary
  const handleNewDiary = async () => {
    try {
      const res = await fetch("/api/dock/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: user?.email,
          title: "",
          content: "",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDiaries([data.diary, ...diaries]);
        setSelectedId(data.diary._id);
      }
    } catch (error) {
      console.error("Failed to create diary", error);
    }
  };

  // Update Diary
  const handleUpdateDiary = async (updatedDiary: IDiary) => {
    setIsSaving(true)
    setDiaries((prev) =>
      prev.map((d) => (d._id === updatedDiary._id ? updatedDiary : d)),
    );

    try {
      await fetch(`/api/dock/diary`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDiary),
      });
    } catch (error) {
      console.error("Failed to update diary", error);
    }
    setIsSaving(false)
  };

  // Delete Diary
  const handleDeleteDiary = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    try {
      await fetch(`/api/dock/diary?id=${id}`, { method: "DELETE" });
      setDiaries((prev) => prev.filter((d) => d._id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (error) {
      console.error("Failed to delete diary", error);
    }
  };

  const selectedDiary = diaries?.find((d) => d._id === selectedId);

  return (
    <div className="page-layout">
      <Header />
      <div className="flex items-start border-0 h-screen">
        <DiarySidebar
          isLoading={isLoading}
          isSaving={isSaving}
          diaries={diaries}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onNew={handleNewDiary}
          onUpdate={handleUpdateDiary}
          onDelete={handleDeleteDiary}
        />

        <main className="h-full flex-1 flex-col overflow-hidden">
          {selectedDiary ? (
            <DiaryEditor
              diary={selectedDiary} 
              onUpdate={handleUpdateDiary} 
              isSaving={isSaving} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <h1 className="text-3xl font-semibold tracking-tight mb-4">
                My Diary
              </h1>
              <p className="text-sm mt-1">
                Select a diary or create a new one.
              </p>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DiaryApp;
