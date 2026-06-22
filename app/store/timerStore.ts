import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { syncTabs } from 'zustand-sync-tabs'
import { SendNotification } from '../components/SendNotification'
import { userStore } from './userStore'

interface TimerState {
    timeLeft: number;
    isActive: boolean;
    mode: "pomodoro" | "break";
    pomodoroTime: number;
    breakTime: number;
    numberOfCycles: number;
    currentCycle: number;
    endTime: number | null; // The exact timestamp when the timer should end
    updateTime: (time: number) => void;
    toggleTimer: () => Promise<void>;
    resetTimer: () => Promise<void>;
    setMode: (mode: "pomodoro" | "break") => Promise<void>;
    setPomodoroTime: (time: number) => void;
    setBreakTime: (time: number) => void;
    setNumberOfCycles: (numberOfCycles: number) => void;
    setCurrentCycle: (currentCycle: number) => void;
    setIsActive: (isActive: boolean) => void;
    tick: () => Promise<void>;
    syncWithDB: (email: string) => Promise<void>;
    startPolling: (email: string) => void;
    stopPolling: () => void;
    updateTimerInDB: (status: string, duration: number, startedAt: Date, pausedAt: Date | null, maxCycles?: number, currentCycle?: number) => Promise<void>;
}

let pollingInterval: NodeJS.Timeout | null = null;

export const timerStore = create<TimerState>()(
    persist(
        syncTabs(
            (set, get) => ({
                timeLeft: 25 * 60,
                isActive: false,
                mode: "pomodoro",
                pomodoroTime: 25 * 60,
                breakTime: 5 * 60,
                numberOfCycles: 1,
                currentCycle: 1,
                endTime: null,

                updateTime: (time: number) => set({ timeLeft: time }),

                updateTimerInDB: async (status: string, duration: number, startedAt: Date, pausedAt: Date | null, maxCycles?: number, currentCycle?: number) => {
                    const email = userStore.getState().user?.email;
                    if (!email) return;
                    const state = get();
                    const finalMaxCycles = maxCycles !== undefined ? maxCycles : state.numberOfCycles;
                    const finalCurrentCycle = currentCycle !== undefined ? currentCycle : state.currentCycle;
                    console.log("Updating timer in DB:", status, duration, startedAt, pausedAt, finalMaxCycles, finalCurrentCycle);
                    try {
                        await fetch("/api/dock/timer/sync", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                user_email: email,
                                status,
                                started_at: startedAt,
                                duration,
                                paused_at: pausedAt,
                                maxCycles: finalMaxCycles,
                                currentCycle: finalCurrentCycle
                            })
                        });
                    } catch (error) {
                        console.error("Failed to update timer in DB:", error);
                    }
                },

                syncWithDB: async (email: string) => {
                    if (!email) return;
                    try {
                        const res = await fetch(`/api/dock/timer/sync?user_email=${encodeURIComponent(email)}`);
                        if (res.ok) {
                            const timer = await res.json();
                            if (timer) {
                                const now = Date.now();
                                if (timer.status === "running") {
                                    const startedAt = new Date(timer.started_at).getTime();
                                    const elapsed = Math.floor((now - startedAt) / 1000);
                                    const remaining = Math.max(0, timer.duration - elapsed);
                                    if (remaining > 0) {
                                        set({
                                            isActive: true,
                                            endTime: startedAt + timer.duration * 1000,
                                            timeLeft: remaining,
                                            currentCycle: timer.currentCycle || 1,
                                            numberOfCycles: timer.maxCycles || 1
                                        });
                                    } else {
                                        set({
                                            isActive: false,
                                            endTime: null,
                                            timeLeft: 0,
                                            currentCycle: timer.currentCycle || 1,
                                            numberOfCycles: timer.maxCycles || 1
                                        });
                                    }
                                } else if (timer.status === "paused" || timer.status === "not-started") {
                                    set({
                                        isActive: false,
                                        endTime: null,
                                        timeLeft: timer.duration,
                                        currentCycle: timer.currentCycle || 1,
                                        numberOfCycles: timer.maxCycles || 1
                                    });
                                }
                            }
                        }
                    } catch (error) {
                        console.error("Failed to sync timer with DB:", error);
                    }
                },

                startPolling: (email: string) => {
                    if (pollingInterval) clearInterval(pollingInterval);
                    pollingInterval = setInterval(async () => {
                        const state = get();
                        try {
                            const res = await fetch(`/api/dock/timer/sync?user_email=${encodeURIComponent(email)}`);
                            if (res.ok) {
                                const timer = await res.json();
                                if (timer) {
                                    const now = Date.now();
                                    if (timer.status === "running") {
                                        const startedAt = new Date(timer.started_at).getTime();
                                        const elapsed = Math.floor((now - startedAt) / 1000);
                                        const remaining = Math.max(0, timer.duration - elapsed);
                                        
                                        const timeDiff = Math.abs(state.timeLeft - remaining);
                                        if (!state.isActive || timeDiff > 2 || state.currentCycle !== timer.currentCycle || state.numberOfCycles !== timer.maxCycles) {
                                            if (remaining > 0) {
                                                set({
                                                    isActive: true,
                                                    endTime: startedAt + timer.duration * 1000,
                                                    timeLeft: remaining,
                                                    currentCycle: timer.currentCycle || 1,
                                                    numberOfCycles: timer.maxCycles || 1
                                                });
                                            } else {
                                                set({
                                                    isActive: false,
                                                    endTime: null,
                                                    timeLeft: 0,
                                                    currentCycle: timer.currentCycle || 1,
                                                    numberOfCycles: timer.maxCycles || 1
                                                });
                                            }
                                        }
                                    } else {
                                        if (state.isActive || Math.abs(state.timeLeft - timer.duration) > 2 || state.currentCycle !== timer.currentCycle || state.numberOfCycles !== timer.maxCycles) {
                                            set({
                                                isActive: false,
                                                endTime: null,
                                                timeLeft: timer.duration,
                                                currentCycle: timer.currentCycle || 1,
                                                numberOfCycles: timer.maxCycles || 1
                                            });
                                        }
                                    }
                                }
                            }
                        } catch (error) {
                            console.error("Polling timer status failed:", error);
                        }
                    }, 5000);
                },

                stopPolling: () => {
                    if (pollingInterval) {
                        clearInterval(pollingInterval);
                        pollingInterval = null;
                    }
                },

                toggleTimer: async () => {
                    const state = get();
                    const now = Date.now();
                    
                    if (!state.isActive) {
                         const newEndTime = now + state.timeLeft * 1000;
                        set({ isActive: true, endTime: newEndTime });
                        await state.updateTimerInDB("running", state.timeLeft, new Date(now), null);
                    } else {
                        const remaining = state.endTime ? Math.max(0, Math.floor((state.endTime - now) / 1000)) : state.timeLeft;
                        set({ isActive: false, endTime: null, timeLeft: remaining });
                        await state.updateTimerInDB("paused", remaining, new Date(), new Date());
                    }
                },

                resetTimer: async () => {
                    const state = get();
                    const newTime = state.mode === "pomodoro" ? state.pomodoroTime : state.breakTime;
                    set({ timeLeft: newTime, isActive: false, endTime: null, currentCycle: 1 });
                    await state.updateTimerInDB("not-started", newTime, new Date(), null, state.numberOfCycles, 1);
                },

                setMode: async (mode: "pomodoro" | "break") => {
                    const state = get();
                    const newTime = mode === "pomodoro" ? state.pomodoroTime : state.breakTime;
                    set({ mode, timeLeft: newTime, isActive: false, endTime: null });
                    await state.updateTimerInDB("not-started", newTime, new Date(), null);
                },

                setPomodoroTime: (time: number) => set({ pomodoroTime: time }),
                setBreakTime: (time: number) => set({ breakTime: time }),
                setNumberOfCycles: (numberOfCycles: number) => set({ numberOfCycles }),
                setCurrentCycle: (currentCycle: number) => set({ currentCycle }),
                setIsActive: (isActive: boolean) => set({ isActive }),

                tick: async () => {
                    const state = get();
                    if (state.isActive && state.endTime) {
                        const now = Date.now();
                        const remaining = Math.max(0, Math.floor((state.endTime - now) / 1000));
                        // Break session completed = 1 Cycle completed!
                        const nextCycle = state.currentCycle + 1;
                        
                        if (remaining <= 0) {
                            if (state.mode === "pomodoro") {
                                const nextTime = state.breakTime;
                                SendNotification(`CYCLE ${state.currentCycle}/${state.numberOfCycles}: Focus session completed! Switching to Break.`, { type: "success", position: "bottom-right" });
                                const newEndTime = Date.now() + nextTime * 1000;
                                set({ 
                                    mode: "break", 
                                    timeLeft: nextTime, 
                                    isActive: true, 
                                    endTime: newEndTime 
                                });
                                await state.updateTimerInDB("running", nextTime, new Date(), null, state.numberOfCycles, state.currentCycle);
                            } else {
                                if (nextCycle <= state.numberOfCycles) {
                                    const nextTime = state.pomodoroTime;
                                    SendNotification(`CYCLE ${state.currentCycle}/${state.numberOfCycles}: Break session completed! Starting Cycle ${nextCycle} Focus.`, { type: "success", position: "bottom-right" });
                                    const newEndTime = Date.now() + nextTime * 1000;
                                    set({ 
                                        currentCycle: nextCycle, 
                                        mode: "pomodoro", 
                                        timeLeft: nextTime, 
                                        isActive: true, 
                                        endTime: newEndTime 
                                    });
                                    // Update the same active timer document to run the next cycle
                                    await state.updateTimerInDB("running", nextTime, new Date(), null, state.numberOfCycles, nextCycle);
                                } else {
                                    // All cycles completed!
                                    // 1. Mark the active timer document as completed in the DB
                                    await state.updateTimerInDB("completed", state.pomodoroTime * state.numberOfCycles, new Date(), null, state.numberOfCycles, state.numberOfCycles);

                                    SendNotification("All pomodoro cycles completed! Great job!", { type: "success", position: "bottom-right" });
                                    set({ 
                                        currentCycle: 1, 
                                        mode: "pomodoro", 
                                        timeLeft: state.pomodoroTime, 
                                        isActive: false, 
                                        endTime: null 
                                    });
                                    // 2. Automatically initialize a new active timer with "not-started" status
                                    await state.updateTimerInDB("not-started", state.pomodoroTime, new Date(), null, state.numberOfCycles, 1);
                                }
                            }
                        } else if (remaining !== state.timeLeft) {
                            set({ timeLeft: remaining });
                        }
                    }
                }
            }),
            { name: 'timer-sync' }
        ),
        {
            name: 'timer-storage',
            storage: createJSONStorage(() => sessionStorage),
            // Only persist relevant state
            partialize: (state) => ({
                timeLeft: state.timeLeft,
                isActive: state.isActive,
                mode: state.mode,
                pomodoroTime: state.pomodoroTime,
                breakTime: state.breakTime,
                numberOfCycles: state.numberOfCycles,
                currentCycle: state.currentCycle,
                endTime: state.endTime,
            }),
        }
    )
)