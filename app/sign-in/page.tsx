"use client";

import React, { use } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { signInWithEmail } from "../actions/login";
import { useFormState, useFormStatus } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { PrismaClient } from "@prisma/client";
import { User } from "@/types";
import { withAccelerate } from "@prisma/extension-accelerate";

const initialState: any = {
  message: "",
  success: "",
};

export default function SignIn() {
  const [state, magicEmailAction] = useFormState(signInWithEmail, initialState);
  const { pending } = useFormStatus();
  const supabase = createClient();

  async function signInWithGithub() {
    try {
      const user = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: "http://localhost:3000/auth/callback",
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="min-h-screen w-full gap-4 flex flex-col justify-center items-center">
      <div className="space-y-4 flex items-center flex-col mx-auto">
        {/* LOGO */}
        <Image
          src={"/Logo.png"}
          alt="2Do Logo"
          width={100}
          height={500}
          quality={100}
        />
        <h1 className="font-semibold text-[32px]">Be Productive Today</h1>
        <p className="text-md font-light">Please sign in to continue</p>
      </div>

      <form className="btn space-y-4">
        {/* Email Magic Link */}
        <p aria-live="polite" className="text-red-500">
          {state?.message as string}
        </p>
        {state?.success && (
          <p className="text-green-500 transition-all duration-150">
            Confirmation sent to your email.
          </p>
        )}
        <Input
          placeholder="Enter your Email"
          type="email"
          className="focus:border-primaryColor focus:border w-80 h-12"
          name="email"
        />

        <button
          formAction={magicEmailAction}
          disabled={pending}
          className=" w-full gap-3 items-center rounded-full px-3 border bg-secondaryColor active:bg-blue-500 text-white h-12"
        >
          {pending ? (
            <span>Signing in....</span>
          ) : (
            <span className="text-center">Sign in</span>
          )}
        </button>

        <hr className="w-full" />

        <button
          onClick={signInWithGithub}
          type="button"
          className="flex items-center justify-center hover:bg-gray-200 duration-150 transition-all ease-in-out shadow-md gap-2 rounded-full border border-gray-600 px-3 w-full h-12"
        >
          <Image
            width={25}
            height={200}
            alt="github logo"
            quality={100}
            src={"/github.png"}
          />
          <span className="text-center">Sign in with Github</span>
        </button>
      </form>
    </div>
  );
}
