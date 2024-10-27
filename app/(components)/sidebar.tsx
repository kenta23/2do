"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Menu,
  NotepadText,
  Plus,
  Star,
  Sun,
  UsersRound,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddNewList from "./addNewList";
import Lists from "./lists";

export const listItems: Array<{
  id: number;
  url: string;
  label: string;
  icon: JSX.Element;
}> = [
  {
    id: 1,
    label: "My day",
    url: "/todo",
    icon: <Sun size={26} />,
  },
  {
    id: 2,
    label: "Planned",
    url: "/planned",
    icon: <NotepadText size={26} />,
  },
  {
    id: 3,
    label: "Important",
    url: "/important",
    icon: <Star size={26} />,
  },
  {
    id: 4,
    label: "Collaborations",
    url: "/collaborations",
    icon: <UsersRound size={26} />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [toggle, setToggle] = useState<boolean>(false);

  return (
    <>
      <Menu
        className="block cursor-pointer relative top-4 left-6 md:hidden"
        size={26}
        onClick={() => setToggle((prev) => !prev)}
      />

      <div
        className={cn(
          "absolute transition-all ease-in-out duration-150 left-[-400px] md:left-0 md:relative z-30 bg-white md:w-[265px] min-h-screen max-h-screen h-full border-r-[#F1D7B0] border-r py-2",
          {
            "left-0": toggle,
          }
        )}
      >
        {/* LOGO */}
        <div className="flex justify-between items-center md:justify-center p-2 w-full text-center mx-auto">
          <Image
            className="self-center justify-self-center"
            src={"/Logo.png"}
            alt="2Do Logo"
            width={60}
            height={500}
            quality={100}
          />
          <X
            className={"md:hidden block"}
            size={22}
            onClick={() => setToggle((prev) => !prev)}
          />
        </div>

        {/* TODO MENU LISTS */}
        <div className="w-full mt-8">
          <ul className="flex gap-3 flex-col items-start">
            {listItems.map((list) => (
              <Link
                key={list.id}
                href={list.url}
                className={cn("flex gap-2 items-center w-full h-[45px] px-3", {
                  "bg-secondaryColor text-white": pathname === list.url,
                })}
              >
                {list.icon}
                <li className="text-md">{list.label}</li>
              </Link>
            ))}

            <hr className="w-full" />
          </ul>

          {/** ADD NEW TASKS */}

          <div>
            {/* ADD NEW LIST BUTTON */}
            <AddNewList />
          </div>

          <hr className="w-full border-b-[1px]" />
          {/* LISTS */}
          <div>
            <Lists />
          </div>
        </div>
      </div>
    </>
  );
}
