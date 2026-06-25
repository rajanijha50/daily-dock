"use client";
import { useEffect, useState } from "react";
import { userStore } from "@/store/userStore";
import Header from "@/components/layout/Header";
import LandingPage from "../components/layout/LandingPage";
import Hero from "@/components/layout/Hero";
import Footer from "@/components/layout/Footer";

export default function Home() {
  const { user } = userStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (user.email && user.email.length > 0) {
      setIsLoggedIn(true);
    }
  }, [user]);
  return (
    <div className="handle-scroll font-poppins flex flex-col min-h-screen bg-foreground dark:bg-background text-primary dark:text-foreground">
      <Header />
      {isLoggedIn ? <Hero userName={user.name} /> : <LandingPage />}
      <Footer />
    </div>
  );
}
