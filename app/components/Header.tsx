"use client";
import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Menu, Pause, Play, RotateCcw, Timer, X, Flame, ExternalLink } from "lucide-react";
import { ModeToggle } from "@/components/ui/theme";
import { timerStore } from "../store/timerStore";
import { userStore } from "../store/userStore";


type UserType = {
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
};

const UserProfile = ({ name, email, image }: UserType) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    signOut();
    setIsDropdownOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block mr-3">
      {/* Trigger button */}
      <button
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
        className=" flex items-center justify-center transition-colors"
      >
        {image ? (
          <img className="w-10 rounded-full border" src={image} alt={"User"} />
        ) : (
          <div className="w-10 h-10 font-semibold rounded-full border flex items-center justify-center bg-muted-foreground dark:bg-popover">
            {name?.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-36 rounded-md border border-white/20 bg-neutral-900 shadow-lg z-20 overflow-hidden"
        >
          <Link
            role="menuitem"
            href="/settings"
            onClick={() => setIsDropdownOpen(false)}
            className="block px-4 py-2 text-sm capitalize hover:bg-white/20 transition-colors"
          >
            Settings
          </Link>
          <button
            role="menuitem"
            onClick={() => handleLogout()}
            className="w-full text-left px-4 py-2 text-sm capitalize hover:bg-white/20 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const TimerStatus = () => {
  const {
    timeLeft,
    isActive,
    mode,
    pomodoroTime,
    breakTime,
    toggleTimer,
    resetTimer,
    setMode,
    tick,
  } = timerStore();
  const [hovered, setHovered] = useState(false);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    alarmRef.current = new Audio('/audio/notification_sound.mp3');
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (alarmRef.current) {
        alarmRef.current.pause();
        alarmRef.current.currentTime = 0;
      }
    };
  }, [isActive, tick]);

  const prevModeRef = useRef(mode);

  useEffect(() => {
    if (prevModeRef.current !== mode) {
      // If the timer was active and the mode changed, it means a session completed
      if (isActive && alarmRef.current) {
        console.log('playing...')
        alarmRef.current.play().catch(err => {
          console.warn("Audio play blocked by browser autoplay policy:", err);
        });
      }
      prevModeRef.current = mode;
    } else if (!isActive && alarmRef.current) {
      // Pause alarm if timer is paused
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
    }
  }, [mode, isActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex flex-col items-center justify-center group inset-0 hover:bg-accent/20 rounded-full transition-transform duration-200">
        <button
          onMouseEnter={() => setHovered(true)}
          className="px-5 py-2 text-sm font-medium capitalize transition-all duration-200"
        >
          <Timer size={20} />
        </button>
        {hovered && (
          <div
            onMouseLeave={() => setHovered(false)}
            className="z-50 absolute top-10 w-40 min-h-20 p-2 bg-muted-foreground dark:bg-popover rounded-sm scale-0 transition-transform duration-200 group-hover:scale-100 border flex flex-col justify-center items-center gap-2 mx-auto"
          >
            <span className="text-2xl font-bold">{formatTime(timeLeft)}</span>
            <span
              onClick={() =>
                setMode(mode === "pomodoro" ? "break" : "pomodoro")
              }
              title="Switch Mode"
              className={`text-sm capitalize cursor-pointer ${mode === "pomodoro" ? "text-blue-500" : "text-green-500"}`}
            >
              {mode}
            </span>
            <div className="flex items-center gap-2">
              <button
                className="hover:bg-white/20 p-1.5 rounded-full"
                onClick={toggleTimer}
                title={isActive ? "Pause" : "Start"}
              >
                {isActive ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                className="hover:bg-white/20 p-1.5 rounded-full"
                onClick={resetTimer}
                title="Reset"
              >
                <RotateCcw size={20} />
              </button>
              <Link href = {'/timer'} title="Open in Page" className="hover:bg-white/20 p-1.5 rounded-full">
                <ExternalLink size={20}/>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  // console.log(session)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserType>();
  const {
    currentStreak,
    maxStreak,
    lastLoginDate,
    setUser: setStoredUser,
    clearUser
  } = userStore();

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchUserState = async (emailId: string | undefined, todayStr: string) => {
    if (!emailId) return;
    try {
      // 1. Update streak via PUT
      const updateRes = await fetch("/api/user/streak", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailId: emailId,
        }),
      });
      const updateData = await updateRes.json();

      // 2. Fetch updated streak details via GET
      const getRes = await fetch(`/api/user/streak?emailId=${emailId}`);
      const getData = await getRes.json();

      if (getData?.success) {
        setStoredUser({
          user: {
            name: session?.user?.name || "",
            email: session?.user?.email || "",
            image: session?.user?.image || "",
          },
          currentStreak: getData.data.currentStreak,
          maxStreak: getData.data.maxStreak,
          lastLoginDate: todayStr,
        });
      } else if (updateData?.success) {
        // Fallback to update response if GET fails
        setStoredUser({
          user: {
            name: session?.user?.name || "",
            email: session?.user?.email || "",
            image: session?.user?.image || "",
          },
          currentStreak: updateData.data.currentStreak,
          maxStreak: updateData.data.maxStreak,
          lastLoginDate: todayStr,
        });
      }
    } catch (error) {
      console.log("Header update/fetch user state error: ", error);
    }
  };

  useEffect(() => {
    if (session && session?.user) {
      setUser(session.user);
      setIsLoggedIn(true);

      const email = session.user.email ?? undefined;
      const todayStr = getTodayString();

      // Only call to fetch user state if the last login date is not the same as current date
      if (lastLoginDate !== todayStr) {
        fetchUserState(email, todayStr);
      }
    } else {
      setIsLoggedIn(false);
      clearUser();
    }
  }, [session, lastLoginDate]);

  const pages = [
    // { name: "home", href: "/" },
    // { name: "about", href: "/about" },
    { name: "diary", href: "/diary" },
    { name: "todos", href: "/todo" },
    { name: "notes", href: "/note" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border animate-fade-in">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-15">
            {/* Logo */}
            <Link href="/" className="group relative">
              <span className="text-2xl font-light tracking-tight transition-all duration-300 group-hover:tracking-wide">
                Daily Dock
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary dark:bg-muted-foreground transition-all duration-300 group-hover:w-full"></div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {pages.map((page) => (
                <Link
                  key={page.name}
                  href={page.href}
                  className="relative px-4 py-2 text-sm font-medium capitalize transition-all duration-200  group"
                >
                  <span className="relative z-10">{page.name}</span>
                  <div className="absolute inset-0 bg-accent/20 rounded-full scale-0 transition-transform duration-200 group-hover:scale-100"></div>
                </Link>
              ))}

              {currentStreak > 0 && (
                <div
                  className="flex items-center gap-1 px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20"
                  title={`Current Streak: ${currentStreak}`}
                >
                  <Flame size={18} className="fill-orange-500" />
                  <span className="text-xs font-bold">{currentStreak}</span>
                </div>
              )}

              <TimerStatus />

              {/* CTA Button */}
              {isLoggedIn ? (
                <UserProfile
                  name={user?.name}
                  email={user?.email}
                  image={user?.image}
                />
              ) : (
                <Link
                  href="/login"
                  className="ml-4 px-6 py-2.5 bg-secondary dark:bg-primary text-primary-foreground dark:text-white text-sm font-medium rounded-full transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:scale-105"
                >
                  Get Started
                </Link>
              )}
              <ModeToggle />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 pt-2 pb-6 bg-background border-t border-border">
            <div className="flex flex-col gap-2">
              {pages.map((page, index) => (
                <Link
                  key={page.name}
                  href={page.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-muted-foreground capitalize rounded-lg transition-all duration-200 hover:bg-accent/20 hover:text-foreground hover:pl-6"
                >
                  {page.name}
                </Link>
              ))}
              {isLoggedIn ? (
                <UserProfile
                  name={user?.name}
                  email={user?.email}
                  image={user?.image}
                />
              ) : (
                <Link
                  href="/login"
                  className="mt-2 px-4 py-3 bg-primary text-primary-foreground text-base font-medium rounded-lg transition-all duration-200 hover:bg-primary/90"
                >
                  Get Started
                </Link>
              )}
              <div className="flex justify-start mt-2">
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-15"></div>
    </>
  );
};

export default Header;
