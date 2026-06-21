import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function LandingPage() {
  return (
    <section className="animate-slide-in-top flex flex-col items-start max-w-4xl mx-auto px-6 py-24 transition-all duration-200">
      
      <Badge variant="outline" className="mb-8 uppercase tracking-widest text-xs font-medium text-secondary dark:text-muted-foreground rounded-full px-4 py-1.5">
        <span className="mr-2 inline-block w-1.5 h-1.5 rounded-full bg-primary dark:bg-foreground opacity-100 animate-pulse" />
        Your productivity hub
      </Badge>

      <h1 className="text-5xl sm:text-6xl font-semibold leading-[1.1] tracking-tight mb-5 text-primary dark:text-foreground">
        <span className="bg-linear-to-r from-accent to-muted-foreground bg-clip-text text-transparent">Daily Dock:{" "}</span>
         Everything you need,{" "}
        <span className="">right where you left it.</span>
      </h1>

      <p className="text-lg leading-relaxed text-secondary dark:text-muted-foreground max-w-xl mb-10">
        Your Daily Dock brings your tasks, habits, and goals into one calm,
        organized space — so you can stop managing your tools and start living
        your day.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/login" className="text-white bg-primary rounded-lg px-8 py-3 hover:scale-105 transition-transform duration-200">
          Get started — it's free
        </Link>
      </div>



    </section>
  );
}