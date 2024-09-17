"use client";

import React, { use, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { signInWithEmail, VerifyAuth } from "@/app/actions/login";
import { useFormState, useFormStatus } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { PrismaClient } from "@prisma/client";
import { User } from "@/types";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Metadata } from "next";
import Link from "next/link";

const initialState: any = {
  error: "",
  success: "",
};

export default function VerifyOtp() {
  const [state, emailAction] = useFormState(VerifyAuth, initialState);
  const { pending, data } = useFormStatus();

  console.log("FORMSTATE DATA", data);

  return (
    <div className="min-h-screen w-full gap-4 flex flex-col justify-center items-center">
      <form className="btn space-y-4" action={emailAction}>
        {/* Email otp */}
        {state.error && <p className="text-red-500">{state.error}</p>}

        {state.success && (
          <p className="text-green-500 transition-all duration-150">
            {state.message}
          </p>
        )}

        <p className="text-green-500 transition-all duration-150">
          OTP sent to your email
        </p>

        <Input
          placeholder="Enter OTP code"
          type="text"
          className="focus:border-primaryColor focus:border w-80 h-12"
          name="code"
        />

        <button
          type="submit"
          disabled={pending}
          className=" w-full gap-3 items-center rounded-full px-3 border bg-secondaryColor active:bg-blue-500 text-white h-12"
        >
          {pending ? (
            <span>Signing in....</span>
          ) : (
            <span className="text-center">Verify</span>
          )}
        </button>
      </form>
    </div>
  );
}
