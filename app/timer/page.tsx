"use client";
import { useState, useEffect } from "react";
import { LuCog, LuPause, LuPlay, LuRotateCcw } from "react-icons/lu";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TimerSettings from "@/features/timer/TimerSettings";
import TimerHistory from "@/features/timer/TimerHistory";
import { userStore } from "@/store/userStore";
import { timerStore } from "@/store/timerStore";

const Timer = () => {
  const {
    timeLeft,
    isActive,
    mode,
    pomodoroTime,
    breakTime,
    numberOfCycles,
    currentCycle,
    updateTime,
    toggleTimer,
    resetTimer,
    setMode,
    setPomodoroTime,
    setBreakTime,
    setNumberOfCycles,
    setIsActive,
    syncWithDB,
    startPolling,
    stopPolling,
    updateTimerInDB,
  } = timerStore();

  const { user } = userStore();

  const [showSettings, setShowSettings] = useState(false);

  const [configPomo, setConfigPomo] = useState(25);
  const [configBreak, setConfigBreak] = useState(5);
  const [configCycles, setConfigCycles] = useState(1);

  useEffect(() => {
    if (user?.email) {
      syncWithDB(user.email);
      startPolling(user.email);
    }
    return () => {
      stopPolling();
    };
  }, [user?.email, syncWithDB, startPolling, stopPolling]);

  const saveSettings = async () => {
    setPomodoroTime(configPomo * 60);
    setBreakTime(configBreak * 60);
    const newTime = mode === "pomodoro" ? configPomo * 60 : configBreak * 60;
    setNumberOfCycles(configCycles);
    setShowSettings(false);
    setIsActive(false);
    updateTime(newTime);
    await updateTimerInDB(
      "not-started",
      newTime,
      new Date(),
      null,
      configCycles,
      1,
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const totalTime = mode === "pomodoro" ? pomodoroTime : breakTime;
  const circumference = 2 * Math.PI * 140;
  const progressRatio = timeLeft / totalTime;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="page-layout">
      <Header />
      <div className="flex flex-col items-center justify-center transition-colors duration-500 font-sans select-none min-h-screen">
        <h1 className="mt-5 text-5xl font-poppins font-semibold text-center mb-2">
          Pomodoro Timer
        </h1>
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-6">
          Cycle {currentCycle} of {numberOfCycles}
        </p>
        {/* Mode Indicator */}
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setIsActive(false);
              setMode("pomodoro");
            }}
            className={`px-4 py-1 rounded-full text-sm font-semibold tracking-wide transition-all ${mode === "pomodoro" ? "bg-blue-500 text-white scale-105" : "bg-blue-500 text-white hover:text-slate-300 hover:scale-105"}`}
          >
            FOCUS
          </button>
          <button
            onClick={() => {
              setIsActive(false);
              setMode("break");
            }}
            className={`px-4 py-1 rounded-full text-sm font-semibold tracking-wide transition-all ${mode === "break" ? "bg-green-500 text-white scale-105" : "bg-green-500 text-white hover:text-slate-300 hover:scale-105"}`}
          >
            BREAK
          </button>
        </div>

        {/* Timer Display */}
        <div className="relative w-80 h-80 flex items-center justify-center mb-0 group cursor-default">
          {/* Glow effect */}
          <div
            className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-1000 ${isActive ? (mode === "pomodoro" ? "bg-blue-500" : "bg-green-500") : "bg-transparent"}`}
          ></div>

          {/* Progress Circle (SVG) */}
          <svg className="w-full h-full transform -rotate-90 relative z-10 drop-shadow-xl">
            {/* Background Circle */}
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className={`${mode === "pomodoro" ? "text-blue-800" : "text-green-800"}`}
            />
            {/* Active Progress Circle */}
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className={`${mode === "pomodoro" ? "text-blue-500" : "text-green-500"} transition-all duration-1000 ease-linear`}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset || 0}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <span
              className={`${mode === "pomodoro" ? "text-blue-500" : "text-green-500"} font-mono text-7xl font-bold tracking-tighter tabular-nums drop-shadow-lg`}
            >
              {formatTime(timeLeft)}
            </span>
            <span
              className={`${mode === "pomodoro" ? "text-blue-500" : "text-green-500"} text-sm mt-2 font-medium racking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity`}
            >
              {isActive ? "Running" : "Paused"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex space-x-6 mb-8 z-10">
          <button
            className={`p-5 rounded-2xl ${mode === "pomodoro" ? "bg-blue-500 hover:bg-blue-700" : "bg-green-500 hover:bg-green-700"} hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/10`}
            onClick={toggleTimer}
          >
            {isActive ? (
              <LuPause size={24} className="text-white" />
            ) : (
              <LuPlay size={24} className="pl-1 text-white" />
            )}
          </button>
          <button
            className={`p-5 rounded-2xl ${mode === "pomodoro" ? "bg-blue-500 hover:bg-blue-700" : "bg-green-500 hover:bg-green-700"} hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl`}
            onClick={resetTimer}
          >
            <LuRotateCcw size={24} className="text-white" />
          </button>
          <button
            className={`p-5 rounded-2xl ${mode === "pomodoro" ? "bg-blue-500 hover:bg-blue-700" : "bg-green-500 hover:bg-green-700"} hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl`}
            onClick={() => setShowSettings(true)}
          >
            <LuCog size={24} className="text-white" />
          </button>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <TimerSettings
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            configPomo={configPomo}
            setConfigPomo={setConfigPomo}
            configBreak={configBreak}
            setConfigBreak={setConfigBreak}
            setConfigCycles={setConfigCycles}
            saveSettings={saveSettings}
          />
        )}

        {/* Timer History */}
        {user?.email && <TimerHistory email={user.email} />}
      </div>
      <Footer />
    </div>
  );
};





export default Timer;
