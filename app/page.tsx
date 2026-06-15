'use client'
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import { userStore } from "./store/userStore";
import { useEffect, useState } from "react";

export default function Home() {
  const {user} = userStore()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  useEffect(()=>{
    if (user.email && user.email.length > 0){
      setIsLoggedIn(true)
    }
  }, [user])
  return (
    <div className="handle-scroll font-poppins flex flex-col min-h-screen bg-foreground dark:bg-background text-primary dark:text-foreground">
      <Header />
      {isLoggedIn ? <Hero /> : <LandingPage />}
      <Footer/>
    </div>
  );
}
