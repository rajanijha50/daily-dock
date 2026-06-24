import React, { useState, useEffect, useRef } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuCalendar as CalendarIcon,
} from "react-icons/lu";
import { IDiary } from "../diary/page";

interface DatePickerProps {
  diary: IDiary;
  onUpdate: (updated: IDiary) => void;
}

export default function DiaryDatePicker({ diary, onUpdate }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    new Date(diary.createdAt) || null,
  );
  const [viewDate, setViewDate] = useState<Date>(
    new Date(diary.createdAt) || new Date(),
  );
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false)
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

  useEffect(() => {
    if (diary.createdAt) {
      setSelectedDate(new Date(diary.createdAt));
      setViewDate(new Date(diary.createdAt));
    }
  }, [diary]);

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(newDate);
    onUpdate({ ...diary, createdAt: newDate, modifiedAt: new Date() });
    setIsOpen(false);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const toggleCalendar = () => setIsOpen(!isOpen);

  // Calendar Logic
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun

  // Adjust for Monday start (Mon=0, ..., Sun=6)
  const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = [];
  for (let i = 0; i < startDayIndex; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div ref={containerRef} className="relative max-w-75" title="Date Created">
      <div
        className="flex justify-center items-center rounded-lg border text-muted px-3 py-2 shadow-sm cursor-pointer border-muted/50 hover:border-muted transition-colors"
        onClick={toggleCalendar}
      >
        <CalendarIcon size={18} className="mr-2 text-primary dark:text-foreground" />
        <span className="w-full text-nowrap text-primary dark:text-foreground">
          {selectedDate
            ? selectedDate.toLocaleDateString("en-IN", {
                dateStyle: "medium",
              })
            : "Pick a date"}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-70 rounded-lg text-muted border border-muted backdrop-blur-2xl p-4 shadow-xl z-50 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-muted/20 transition-colors"
            >
              <LuChevronLeft size={20} />
            </button>
            <span className="font-semibold">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-muted/20 transition-colors"
            >
              <LuChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2 text-center">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <span key={d} className="text-xs font-medium text-muted/50">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => {
              if (!day) return <div key={i} />;
              const isSelected =
                selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;

              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <button
                  key={i}
                  onClick={() => handleDateClick(day)}
                  title={
                    isToday ? "Today" : String(day) + " " + monthNames[month]
                  }
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${
                      isSelected
                        ? "bg-primary text-white shadow-md"
                        : "text-muted hover:bg-muted/30"
                    }
                    ${
                      !isSelected && isToday
                        ? "border border-primary-foreground"
                        : ""
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
