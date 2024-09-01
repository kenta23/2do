"use client";

import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Bell, Search as SearchIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { AuthError, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function Search({ user }: { user: User | null }) {
  const supabase = createClient();
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };
  return (
    <div className="w-full  h-[70px] px-4 py-2">
      <nav className="w-full flex">
        <div className="w-auto text-center mx-auto relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search"
            className="pl-10 w-[536px] outline-none border border-lightColor focus:ring-2 focus:ring-lightColor focus:border-lightColor"
            width={500}
          />
        </div>

        <ul className="flex items-center gap-3">
          <li>
            <Bell />
          </li>

          <li>{user?.email}</li>
          <li>
            <button onClick={signOut}>Log out</button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
