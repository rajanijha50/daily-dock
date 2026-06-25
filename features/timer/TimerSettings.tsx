import { useEffect, useState } from "react";
import { SendNotification } from "@/components/feedback/SendNotification";

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

export default function TimerSettings({
  showSettings,
  setShowSettings,
  configPomo,
  setConfigPomo,
  configBreak,
  setConfigBreak,
  setConfigCycles,
  saveSettings,
}: TimerSettingsProps) {
  const [totalSession, setTotalSession] = useState(60);
  const [numberOfCycles, setNumberOfCycles] = useState(
    Math.round(totalSession / (configPomo + configBreak)),
  );

  useEffect(() => {
    setNumberOfCycles(
      Math.round(totalSession / (configPomo + configBreak)) || 0,
    );
    setConfigCycles(Math.round(totalSession / (configPomo + configBreak)));
  }, [totalSession, configPomo, configBreak]);

  function ValidateAndSaveSettings() {
    if (configPomo <= 0 || configBreak <= 0) {
      SendNotification(
        "Focus and break durations must be greater than 0.",
        "error",
      );
      return;
    }
    if (configBreak > configPomo) {
      SendNotification(
        "Break duration must be less than focus duration.",
        "error",
      );
      return;
    }
    if (configPomo + configBreak > totalSession) {
      SendNotification(
        "Total session duration must be greater than sum of focus and break durations.",
        "error",
      );
      setTotalSession(configPomo + configBreak);
      return;
    }
    saveSettings();
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
            onFocus={(e) =>
              e.target.setSelectionRange(0, e.target.value.length)
            }
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
            onFocus={(e) =>
              e.target.setSelectionRange(0, e.target.value.length)
            }
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
            onFocus={(e) =>
              e.target.setSelectionRange(0, e.target.value.length)
            }
            onChange={(e) => setConfigBreak(Number(e.target.value))}
            className="w-full bg-primary/70 border border-muted focus:border-secondary focus:ring-1 focus:ring-secondary outline-none p-3 rounded-xl text-white font-mono text-lg transition-all"
          />
        </div>
        <div className="flex justify-center items-center mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider">
            Total Cycles: {numberOfCycles}
          </p>
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
}
