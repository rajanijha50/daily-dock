"use client";

import { LuMoon, LuSun } from "react-icons/lu";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-9 w-9 rounded-md text-primary dark:text-white hover:text-white"
      aria-label="Toggle theme"
    >
      {theme == "dark" ? <LuSun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" /> : <LuMoon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />}
    </Button>
  );
}