"use client";

import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Bell, LogOut, Search as SearchIcon } from "lucide-react";
import { AuthError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import Image from "next/image";
import { AuthUser } from "@/types";
import Notifications from "./notifications";
import { useSession, signOut } from "next-auth/react";
import { Session, User } from "next-auth";

export default function Search({ user }: { user: User }) {
  const router = useRouter();

  const signOutFn = () => {
    signOut({
      redirectTo: "/sign-in",
    });
    router.push("/sign-in");
  };

  return (
    <div className="w-full h-[70px] px-4 py-2">
      <nav className="w-full flex">
        <div className="w-auto text-center mx-auto relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search"
            className="pl-10 w-[200px] md:w-full outline-none border border-lightColor focus:ring-2 focus:ring-lightColor focus:border-lightColor"
            width={500}
          />
        </div>

        <ul className="flex items-center gap-3">
          {/* NOTIFICATION */}

          <Notifications />

          <li>
            <Popover>
              <PopoverTrigger>
                <Image
                  src={user?.image as string}
                  width={40}
                  height={100}
                  alt="User avatar"
                  className="rounded-full border-[#E9BB19] border-2"
                />
              </PopoverTrigger>

              <PopoverContent
                className="bg-white z-50"
                sideOffset={20}
                align="start"
                side="bottom"
              >
                <button
                  className="px-3 rounded-lg shadow-md py-1 flex gap-3 items-center"
                  onClick={signOutFn}
                >
                  <LogOut size={18} />
                  <span>Log out</span>
                </button>
              </PopoverContent>
            </Popover>
          </li>
        </ul>
      </nav>
    </div>
  );
}
