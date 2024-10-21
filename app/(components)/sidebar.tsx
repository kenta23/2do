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

const listItems: Array<{
  id: number;
  name: string;
  icon: JSX.Element;
}> = [
  {
    id: 1,
    name: "My day",
    icon: <Sun size={26} />,
  },
  {
    id: 2,
    name: "Planned",
    icon: <NotepadText size={26} />,
  },
  {
    id: 3,
    name: "Important",
    icon: <Star size={26} />,
  },
  {
    id: 4,
    name: "Collaborative Tasks",
    icon: <UsersRound size={26} />,
  },
  {
    id: 5,
    name: "Business",
    icon: <BriefcaseBusiness size={26} />,
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
            <Link
              href={"/todo"}
              className={cn("flex gap-2 items-center w-full h-[45px] px-3", {
                "bg-secondaryColor text-white": pathname === "/todo",
              })}
            >
              <Sun size={26} />
              <li className="text-md">My day</li>
            </Link>
            <Link
              href={"/planned"}
              className={cn("flex gap-2 items-center w-full h-[45px] px-3", {
                "bg-secondaryColor text-white": pathname === "/planned",
              })}
            >
              <NotepadText size={26} />
              <li className="text-md">Planned</li>
            </Link>
            <Link
              href={"/collaborations"}
              className={cn("flex gap-2 items-center w-full h-[45px] px-3", {
                "bg-secondaryColor text-white": pathname === "/collaborations",
              })}
            >
              <UsersRound size={26} />
              <li className="text-md">Collaborative Tasks</li>
            </Link>
            <Link
              href={"/"}
              className="flex gap-2 items-center w-full h-[45px] px-3"
            >
              <BriefcaseBusiness size={26} />
              <li className="text-md">Work</li>
            </Link>
            <Link
              href={"/important"}
              className="flex gap-2 items-center w-full h-[45px] px-3"
            >
              <Star size={26} />
              <li className="text-md">Important</li>
            </Link>

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
