"use server";

import React from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SignIn() {
  return (
    <button
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
  );
}
