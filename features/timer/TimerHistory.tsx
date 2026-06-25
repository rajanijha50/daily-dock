import { useEffect, useState } from "react";
import { LuTrash2 } from "react-icons/lu";

interface TimerHistoryProps {
  email: string | undefined;
}
export default function TimerHistory({ email }: TimerHistoryProps) {
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
                    {dateStr} • {item.maxCycles || 1}{" "}
                    {item.maxCycles === 1 ? "cycle" : "cycles"}
                  </span>
                </div>

                <button
                  onClick={() => deleteHistoryItem(item._id)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
                  title="Delete from history"
                >
                  <LuTrash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
