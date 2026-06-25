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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const { user } = userStore();

  useEffect(() => {
    if (user.email && user.email.length > 0) {
      router.push("/");
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("All fields are required!");
      setTimeout(() => {
        setError("");
      }, 3000);
      return;
    }
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email,
        password: password,
      });

      if (res?.error) {
        setError(res.error);
        console.error("Login error: ", res.error);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="font-mono bg-foreground dark:bg-background text-primary dark:text-foreground w-full min-h-screen flex justify-center items-center">
      {/* <Header/> */}
      <div className="animate-slide-in-top border shadow-md p-5 rounded-lg min-h-100 flex flex-col justify-between w-80">
        <h1 className="text-2xl font-semibold text-center mb-5">Login</h1>
        <FieldGroup className="text-secondary dark:text-foreground ">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              className="placeholder:text-secondary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
            ></Input>
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input
              className="placeholder:text-secondary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
            ></Input>
          </Field>
          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}
          <Field>
            <Button
              className="cursor-pointer text-foreground disabled:text-muted"
              type="submit"
              onClick={handleSubmit}
              disabled={!email || !password}
            >
              Login
            </Button>
          </Field>
        </FieldGroup>
        <div className="my-5 h-0.5 bg-accent dark:bg-muted"></div>
        <FieldGroup className="-space-y-3">
          <Field>
            <Button
              className="text-foreground cursor-pointer"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              <Image width="15" height="15" src="/google.svg" alt="google" />
              Login with Google
            </Button>
          </Field>
          <Field>
            <Button
              className="text-foreground cursor-pointer"
              onClick={() => signIn("azure-ad", { callbackUrl: "/" })}
            >
              <Image
                width="20"
                height="20"
                src="/microsoft.svg"
                alt="microsoft"
              />
              Login with Microsoft
            </Button>
          </Field>
        </FieldGroup>
        <p className="text-center text-sm mt-5">
          Don't have an account?{" "}
          <Link className="text-secondary underline" href="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
