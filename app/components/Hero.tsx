"use client";
import { useSession } from "next-auth/react";
import Quote from "./Quote";
import Weather from "./Weather";

const Hero = () => {
  const {data: session} = useSession()

  return (
    <div className="flex flex-col justify-center gap-5 items-center rounded-md min-h-200">
      <h2 className="p-5 w-full text-left font-semibold font-mono text-4xl">
        Hello, {session?.user?.name ? `${session.user.name}` : 'User'}
      </h2>
      <div className="flex flex-col justify-between gap-5 items-center">
        <div className="w-full flex flex-col justify-center items-start gap-5">
          <Quote />
        </div>
        <div className="w-full flex flex-col justify-center items-center gap-5">
          <Weather />
        </div>
      </div>
    </div>
  );
};

export default Hero;
