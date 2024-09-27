import React, { use, useState } from "react";
import Image from "next/image";
import { Metadata } from "next";
import { providerMap, signIn, signOut } from "@/auth";
import { auth } from "@/auth";
import { AuthError } from "next-auth";

const initialState: any = {
  message: "",
  success: "",
};

export default async function SignIn(props: {
  searchParams: { callbackUrl: string | undefined };
}) {
  const user = await auth();

  console.log("user", user);

  async function logout() {
    await signOut();
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

      {Object.values(providerMap).map((provider) => (
        <form
          key={provider.id}
          action={async () => {
            "use server";
            try {
              await signIn(provider.id, {
                redirectTo: props.searchParams?.callbackUrl ?? "",
              });
            } catch (error) {
              if (error instanceof AuthError) {
                console.log(error.type);
              }
              throw error;
            }
          }}
        >
          <button
            className="flex items-center justify-center hover:bg-gray-200 duration-150 transition-all ease-in-out shadow-md gap-2 rounded-full border border-gray-600 px-3 w-full h-12"
            type="submit"
          >
            <Image
              width={25}
              height={200}
              alt="github logo"
              quality={100}
              src={provider.name === "GitHub" ? "/github.png" : "/google.png"}
            />
            <span className="text-center">Sign in with {provider.name}</span>
          </button>
        </form>
      ))}

      <form
        action={async () => {
          "use server";
          try {
            await signOut();
          } catch (error) {
            console.log(error);
          }
        }}
      >
        <button type="submit" className="cursor-pointer">
          Logout
        </button>
      </form>
    </div>
  );
}
