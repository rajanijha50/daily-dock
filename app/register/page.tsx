"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { userStore } from "@/store/userStore";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const { user } = userStore();

  useEffect(() => {
    if (user.email && user.email.length > 0) {
      router.push("/");
    }
  }, [user]);
  const handleSubmit = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password must be same");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        console.error("Registration failed:", data.message);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <div className="font-mono bg-foreground dark:bg-background text-primary dark:text-foreground w-full min-h-screen flex justify-center items-center">
      {/* <Header/> */}
      <div className="animate-slide-in-top border shadow-md p-5 rounded-lg min-h-100 flex flex-col justify-between w-80">
        <h1 className="text-2xl font-semibold text-center mb-5">Register</h1>
        <FieldGroup className="-space-y-3 text-secondary dark:text-foreground ">
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input
              className="placeholder:text-secondary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Enter your name"
            />
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              className="placeholder:text-secondary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
            />
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input
              className="placeholder:text-secondary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
            />
          </Field>
          <Field>
            <FieldLabel>Confirm Password</FieldLabel>
            <Input
              className="placeholder:text-secondary"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="Confirm your password"
            />
          </Field>
          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}

          <Field>
            <Button
              className="cursor-pointer text-foreground disabled:text-muted"
              type="submit"
              onClick={handleSubmit}
              disabled={!name || !email || !password || !confirmPassword}
            >
              Create Account
            </Button>
          </Field>
        </FieldGroup>
        <div className="my-5 h-0.5 bg-accent dark:bg-muted"></div>
        <div className="w-full flex justify-center items-center gap-2">
          <Button
            className="max-w-1/2 text-foreground cursor-pointer"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <Image width="15" height="15" src="/google.svg" alt="google" />
            Google
          </Button>

          <Button
            className="max-w-1/2 text-foreground cursor-pointer"
            onClick={() => signIn("azure-ad", { callbackUrl: "/" })}
          >
            <Image
              width="20"
              height="20"
              src="/microsoft.svg"
              alt="microsoft"
            />
            Microsoft
          </Button>
        </div>
        <p className="text-center text-sm mt-5">
          Already have an account?{" "}
          <Link className="text-secondary underline" href="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
