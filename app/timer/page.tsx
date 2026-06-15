'use client'
import { Cog, Pause, Play, RotateCcw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { timerStore } from "../store/timerStore";
import Footer from "../components/Footer";

const Timer = () => {

  const {
    timeLeft,
    isActive,
    mode,
    pomodoroTime,
    breakTime,
    updateTime,
    toggleTimer,
    resetTimer,
    setMode,
    setPomodoroTime,
    setBreakTime,
    setIsActive
  } = timerStore();

  const [showSettings, setShowSettings] = useState(false);

  // Settings inputs (in minutes)
  const [configPomo, setConfigPomo] = useState(25);
  const [configBreak, setConfigBreak] = useState(5);

  // const timerRef = useRef<NodeJS.Timeout | null>(null);

  // useEffect(() => {
  //   // Sync time when settings change or mode switches (only if not running to avoid jumps)
  //   if (!isActive) {
  //     updateTime(mode === "pomodoro" ? pomodoroTime : breakTime);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [mode, pomodoroTime, breakTime]);

  useEffect(() => {
    // if (isActive && timeLeft > 0) {
    //   timerRef.current = setInterval(() => {
    //     updateTime(timeLeft - 1);
    //   }, 1000);
    // } else
     if (timeLeft === 0 && isActive) {
      // Timer Finished
      setIsActive(false);
      handleTimerComplete()
    }

    // return () => {
    //   if (timerRef.current) clearInterval(timerRef.current);
    // };
  }, [isActive, timeLeft, updateTime, setIsActive]);

  const handleTimerComplete = () => {
    window.alert("timer is completed")
    setTimeout(() => {
      if (mode === "pomodoro") {
        setMode("break");
      } else {
        setMode("pomodoro");
      }
    }, 500);
  };

  const saveSettings = () => {
    setPomodoroTime(configPomo * 60);
    setBreakTime(configBreak * 60);
    setShowSettings(false);
    setIsActive(false);
    updateTime(mode === "pomodoro" ? configPomo * 60 : configBreak * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const totalTime = mode === "pomodoro" ? pomodoroTime : breakTime;
  // Calculate offset. Circumference = 2 * PI * r. r=140 => ~879.6
  const circumference = 2 * Math.PI * 140;
  // Progress goes from 0 to 100%.
  // We want the stroke to SHRINK as time passes? Or FILL?
  // Usually clean looks like it shrinks.
  const progressRatio = timeLeft / totalTime;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className= 'page-layout'>
      <Header />
    <div className="flex flex-col items-center justify-center  transition-colors duration-500 font-sans select-none min-h-screen">
      <h1 className="mt-5 text-4xl font-poppins font-semibold text-center mb-8">Pomodoro Timer</h1>
      {/* Mode Indicator */}
      <div className="flex space-x-4">
        <button
          onClick={() => {
            setIsActive(false);
            setMode("pomodoro");
          }}
          className={`px-4 py-1 rounded-full text-sm font-semibold tracking-wide transition-all ${mode === "pomodoro" ? "bg-secondary text-white border border-primary/50" : "bg-muted/50 text-white hover:text-slate-300"}`}
        >
          FOCUS
        </button>
        <button
          onClick={() => {
            setIsActive(false);
            setMode("break");
          }}
          className={`px-4 py-1 rounded-full text-sm font-semibold tracking-wide transition-all ${mode === "break" ? "bg-secondary text-white border border-primary/50" : "bg-muted/50 text-white hover:text-slate-300"}`}
        >
          BREAK
        </button>
      </div>

      {/* Timer Display */}
      <div className="relative w-80 h-80 flex items-center justify-center mb-0 group cursor-default">
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-1000 ${isActive ? (mode === "pomodoro" ? "bg-secondary" : "bg-muted") : "bg-transparent"}`}
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
            className="text-slate-800"
          />
          {/* Active Progress Circle */}
          <circle
            cx="160"
            cy="160"
            r="140"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className={`${mode === "pomodoro" ? "text-secondary" : "text-muted"} transition-all duration-1000 ease-linear`}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset || 0}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span className="font-mono text-7xl font-bold tracking-tighter tabular-nums drop-shadow-lg">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm mt-2 font-medium racking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
            {isActive ? "Running" : "Paused"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-6 mb-8 z-10">
        <button
          className="p-5 rounded-2xl bg-muted hover:bg-muted/80 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/10"
          onClick={toggleTimer}
        >
          {isActive ? (
            <Pause size={24} className="text-white" />
          ) : (
            <Play size={24} className="pl-1 text-white" />
          )}
        </button>
        <button
          className="p-5 rounded-2xl bg-primary hover:bg-primary/80 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl"
          onClick={resetTimer}
        >
          <RotateCcw size={24} className="text-white" />
        </button>
        <button
          className="p-5 rounded-2xl bg-secondary hover:bg-secondary/80 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl"
          onClick={() => setShowSettings(true)}
        >
          <Cog size={24} className="text-white" />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="backdrop-blur-lg border border-border p-8 rounded-3xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6">
              Timer Settings
            </h2>
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                Focus Duration (min)
              </label>
              <input
                type="number"
                value={configPomo}
                onChange={(e) => setConfigPomo(Number(e.target.value))}
                className="w-full bg-primary/70 border border-muted focus:border-secondary focus:ring-1 focus:ring-secondary outline-none p-3 rounded-xl text-white font-mono text-lg transition-all"
              />
            </div>
            <div className="mb-8">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                Break Duration (min)
              </label>
              <input
                type="number"
                value={configBreak}
                onChange={(e) => setConfigBreak(Number(e.target.value))}
                className="w-full bg-primary/70 border border-muted focus:border-secondary focus:ring-1 focus:ring-secondary outline-none p-3 rounded-xl text-white font-mono text-lg transition-all"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-5 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-muted transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="px-5 py-2 rounded-xl bg-secondary hover:bg-primary text-white font-bold shadow-lg shadow-blue-900/20 transition-all hover:translate-y-px"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    <Footer/>
    </div>
  );
};

const TimerSettings = () => {
  return (
    <div>a separate function for timer settings</div>
  )
}

const TimerHistory = () => {
  return (
    <div>a separate function for timer history</div>
  )
}

export default Timer;
