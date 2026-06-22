"use client";
import { Cog, Pause, Play, RotateCcw, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { userStore } from "../store/userStore";
import { timerStore } from "../store/timerStore";
import Footer from "../components/Footer";
import { SendNotification } from "../components/SendNotification";

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

  // Settings inputs (in minutes)
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

  // useEffect(() => {
  //    if (timeLeft === 0 && isActive) {
  //     // Timer Finished
  //     setIsActive(false);
  //     handleTimerComplete()
  //   }
  // }, [isActive, timeLeft, updateTime, setIsActive]);

  // const handleTimerComplete = () => {
  //   setTimeout(() => {
  //     if (mode === "pomodoro") {
  //       setMode("break");
  //     } else {
  //       setMode("pomodoro");
  //     }
  //   }, 500);
  // };

  const saveSettings = async () => {
    setPomodoroTime(configPomo * 60);
    setBreakTime(configBreak * 60);
    const newTime = mode === "pomodoro" ? configPomo * 60 : configBreak * 60;
    setNumberOfCycles(configCycles);
    setShowSettings(false);
    setIsActive(false);
    updateTime(newTime);
    await updateTimerInDB("not-started", newTime, new Date(), null, configCycles, 1);
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
              <Pause size={24} className="text-white" />
            ) : (
              <Play size={24} className="pl-1 text-white" />
            )}
          </button>
          <button
            className={`p-5 rounded-2xl ${mode === "pomodoro" ? "bg-blue-500 hover:bg-blue-700" : "bg-green-500 hover:bg-green-700"} hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl`}
            onClick={resetTimer}
          >
            <RotateCcw size={24} className="text-white" />
          </button>
          <button
            className={`p-5 rounded-2xl ${mode === "pomodoro" ? "bg-blue-500 hover:bg-blue-700" : "bg-green-500 hover:bg-green-700"} hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl`}
            onClick={() => setShowSettings(true)}
          >
            <Cog size={24} className="text-white" />
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
            setConfigCycles = {setConfigCycles}
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

interface TimerSettingsProps {
  showSettings: boolean;
  setShowSettings: (showSettings: boolean) => void;
  configPomo: number;
  setConfigPomo: (configPomo: number) => void;
  configBreak: number;
  setConfigCycles: (configCycles: number) => void;
  setConfigBreak: (configBreak: number) => void;
  saveSettings: () => void;
}

const TimerSettings = ({
  showSettings,
  setShowSettings,
  configPomo,
  setConfigPomo,
  configBreak,
  setConfigBreak,
  setConfigCycles,
  saveSettings,
}: TimerSettingsProps) => {

  const [totalSession, setTotalSession] = useState(60)
  const [numberOfCycles, setNumberOfCycles] = useState(Math.round(totalSession/(configPomo+configBreak)))

  useEffect(()=>{
    setNumberOfCycles(Math.round(totalSession/(configPomo+configBreak)) || 0)
    setConfigCycles(Math.round(totalSession/(configPomo+configBreak)))
  },[totalSession, configPomo, configBreak])

  function ValidateAndSaveSettings(){
    if (configPomo <= 0 || configBreak <= 0){
      SendNotification("Focus and break durations must be greater than 0.", "error")
      return
    }
    if (configBreak > configPomo){
      SendNotification("Break duration must be less than focus duration.", "error")
      return
    }
    if ((configPomo + configBreak) > totalSession){
      SendNotification("Total session duration must be greater than sum of focus and break durations.", "error")
      setTotalSession(configPomo + configBreak)
      return
    }
    saveSettings()
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="backdrop-blur-lg border border-border p-8 rounded-3xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold mb-6">Timer Settings</h2>
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
            Total Session Duration (min)
          </label>
          <input
            type="number"
            value={totalSession}
            onFocus={(e) => e.target.setSelectionRange(0, e.target.value.length)}
            onChange={(e) => setTotalSession(Number(e.target.value))}
            className="w-full bg-primary/70 border border-muted focus:border-secondary focus:ring-1 focus:ring-secondary outline-none p-3 rounded-xl text-white font-mono text-lg transition-all"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
            Focus Duration (min)
          </label>
          <input
            type="number"
            value={configPomo}
            onFocus={(e) => e.target.setSelectionRange(0, e.target.value.length)}
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
            onFocus={(e) => e.target.setSelectionRange(0, e.target.value.length)}
            onChange={(e) => setConfigBreak(Number(e.target.value))}
            className="w-full bg-primary/70 border border-muted focus:border-secondary focus:ring-1 focus:ring-secondary outline-none p-3 rounded-xl text-white font-mono text-lg transition-all"
          />
        </div>
        <div className="flex justify-center items-center mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider">Total Cycles: {numberOfCycles}</p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowSettings(false)}
            className="px-5 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-muted transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={ValidateAndSaveSettings}
            className="px-5 py-2 rounded-xl bg-secondary hover:bg-primary text-white font-bold shadow-lg shadow-blue-900/20 transition-all hover:translate-y-px"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

interface TimerHistoryProps {
  email: string | undefined;
}

const TimerHistory = ({ email }: TimerHistoryProps) => {
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    if (!email) return;
    try {
      const res = await fetch(
        `/api/dock/timer/history?user_email=${encodeURIComponent(email)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setHistory(data);
        } else {
          setHistory([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch timer history:", error);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    if (!email) return;
    try {
      const res = await fetch("/api/dock/timer/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: email, timer_id: id }),
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete timer history item:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [email]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!email) return null;

  return (
    <div className="w-full max-w-xl px-6 py-6 mt-8 rounded-3xl border border-border/40 shadow-2xl transition-all duration-300">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
        Timer History
      </h2>

      {history.length === 0 ? (
        <div className="text-center py-8 text-sm">
          No timers in history yet. Start a timer to see it here!
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {history.map((item) => {
            const dateStr = new Date(
              item.createdAt || item.started_at,
            ).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item._id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-transparent hover:border-border/30 transition-all duration-300 group bg-secondary/50"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold tracking-tight">
                      {formatTime(item.duration)}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-white/20 text-white`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <span className="text-[11px]">
                    {dateStr} • {item.maxCycles || 1} {item.maxCycles === 1 ? 'cycle' : 'cycles'}
                  </span>
                </div>

                <button
                  onClick={() => deleteHistoryItem(item._id)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
                  title="Delete from history"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Timer;
