"use client";
import React, { useEffect, useState } from "react";
import {
  LuDownload,
  LuPanelRightClose,
  LuPin,
  LuPinOff,
  LuPlus,
  LuTrash2,
  LuX,
} from "react-icons/lu";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import { SendNotification } from "@/components/feedback/SendNotification";
import { IDiary } from "@/app/diary/page";
import { userStore } from "@/store/userStore";

interface SidebarProps {
  isLoading: Boolean;
  isSaving: Boolean;
  diaries: IDiary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onUpdate: (updatedDiary: IDiary) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

const DiarySidebar: React.FC<SidebarProps> = ({
  isLoading,
  isSaving,
  diaries,
  selectedId,
  onSelect,
  onNew,
  onUpdate,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [displayedDiaries, setDisplayedDiaries] = useState(diaries);
  const { user } = userStore();

  useEffect(() => {
    setDisplayedDiaries(diaries);
  }, [diaries]);

  const handleSortDiaries = (value: string) => {
    if (!value) {
      return;
    }
    const sorted = [...displayedDiaries].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      if (a.pinned && b.pinned) {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      switch (value) {
        case "date-down": //new to old
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "date-up": // old to new
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "length-down":
          return b.content.length - a.content.length;
        case "length-up":
          return a.content.length - b.content.length;
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
    setDisplayedDiaries(sorted);
  };

  const handleExportDiaries = () => {
    if (!displayedDiaries || displayedDiaries.length === 0) {
      SendNotification("No diaries to export", "error");
      return;
    }

    const filteredDiaries = displayedDiaries.map((diary) => ({
      title: diary.title,
      content: diary.content,
      pinned: diary.pinned,
      createdAt: diary.createdAt,
    }));

    const blob = new Blob([JSON.stringify(filteredDiaries, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${user?.name}-${new Date().toLocaleDateString("en-IN", { dateStyle: "short" })}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDiaryChange = (
    e: React.MouseEvent,
    oldId: string | null,
    newId: string,
  ) => {
    if (!isSaving) {
      const OldDiary = diaries.find((d) => d._id === oldId);
      if (OldDiary && !OldDiary?.content && !OldDiary?.title) {
        onDelete(e, oldId!);
      }
      onSelect(newId);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="border-0 mt-4 ml-4 p-3 rounded-full bg-(--muted)/15 hover:bg-(--muted)/20 cursor-pointer"
        title="Open DiarySidebar"
      >
        <LuPanelRightClose size={24} />
      </button>
    );
  }

  return (
    <div
      id="diary_H"
      className="sidebar-animation w-80 h-full flex flex-col border-r border-(--muted)/50 transition-all duration-300 ease-in-out"
    >
      <div className="p-4 border-b-2 border-(--muted)/50 flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Diaries</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 rounded-full hover:bg-(--muted)/20 transition-colors cursor-pointer"
          title="Close DiarySidebar"
        >
          <LuX size={25} />
        </button>
      </div>
      {isLoading ? (
        <div className="h-full flex justify-center items-center">
          <LoadingSpinner text="Diaries" />
        </div>
      ) : (
        <>
          <div className="p-4 border-b-2 border-(--muted)/50 flex justify-between items-center">
            <select
              onChange={(e) => {
                handleSortDiaries(e.target.value);
              }}
              className="p-2 border outline-none rounded-md"
              name="sort"
              defaultValue="date-down"
              id="sort-by"
            >
              <option
                className="bg-black text-white"
                value="date-down"
                title="Date: New-Old"
              >
                Date Created ↓
              </option>
              <option
                className="bg-black text-white"
                value="date-up"
                title="Date: Old-New"
              >
                Date Created ↑
              </option>
              <option
                className="bg-black text-white"
                value="length-down"
                title="Length: Long-Short"
              >
                Length ↓
              </option>
              <option
                className="bg-black text-white"
                value="length-up"
                title="Length: Short-Long"
              >
                Length ↑
              </option>
            </select>
            <div>
              <button
                onClick={handleExportDiaries}
                className="p-2 rounded-full hover:bg-(--muted)/20 transition-colors cursor-pointer"
                title="Export"
              >
                <LuDownload size={25} />
              </button>
              <button
                onClick={onNew}
                className="p-2 rounded-full hover:bg-(--muted)/20 transition-colors cursor-pointer"
                title="New Entry"
              >
                <LuPlus size={25} />
              </button>
            </div>
          </div>

          <div className="p-2 pt-5 overflow-y-auto flex-1 sidebar-scroll ">
            {displayedDiaries && displayedDiaries?.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center p-4 opacity-50 text-md">
                No entries yet. Click + to start.
              </div>
            ) : (
              displayedDiaries?.map((diary) => (
                <div
                  key={diary._id}
                  id={`H-${diary._id}`}
                  onClick={(e) => handleDiaryChange(e, selectedId, diary._id!)}
                  className={`bg-(--muted)/10 p-3 mb-2 rounded-lg cursor-pointer transition-all hover:bg-(--muted)/15 group flex justify-between items-center ${
                    selectedId == diary._id
                      ? "bg-(--muted)/40 hover:bg-(--muted)/40 font-medium"
                      : ""
                  }`}
                >
                  <div className="flex-1 truncate">
                    <h3 className="truncate text-sm font-semibold">
                      {diary.title || "Untitled Entry"}
                    </h3>
                    <p className="text-xs opacity-60 truncate">
                      {new Date(diary.createdAt).toLocaleDateString("en-IN", {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate({ ...diary, pinned: !diary.pinned });
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 transition-all hover:bg-white/20 rounded"
                    title={diary.pinned ? "Unpin" : "Pin"}
                  >
                    {diary.pinned ? (
                      <LuPinOff size={20} />
                    ) : (
                      <LuPin size={20} />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(e, diary._id!);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded text-red-500 transition-all"
                    title="Delete"
                  >
                    <LuTrash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DiarySidebar;
