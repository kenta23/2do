import React from "react";
import Image from "next/image";
import { EllipsisVertical, Plus } from "lucide-react";
import AddNewTaskBtn from "@/components/addNewTaskBtn";
import dateNow from "@/lib/date";
import { createClient } from "@/utils/supabase/client";

export default function page() {
  return (
    <div className="bg-backgroundColor relative w-full overflow-x-hidden min-h-screen py-8 px-4">
      <header className="mx-8">
        <h2 className="text-2xl font-medium">My Day</h2>
        <p>{dateNow()}</p>
      </header>

      {/* IF THERE IS EXISTED TASKS */}
      <div className="mx-8 mt-20 max-h-[700px] overflow-y-clip max-w-[680px]">
        <ul className="flex flex-col gap-5">
          <li className="min-w-min px-4 py-4 rounded-full bg-white">
            <div className="flex justify-between items-center gap-2 w-full">
              <div className="flex gap-2 items-center">
                <input type="radio" name="" id="" />
                <p>tasks</p>
              </div>

              {/* FOOTLONG OPTIONS */}
              <EllipsisVertical size={20} className="cursor-pointer" />
            </div>
          </li>

          <li className="min-w-min px-4 py-4 rounded-full bg-white">
            <div className="flex justify-between items-center gap-2 w-full">
              <div className="flex gap-2 items-center">
                <input type="radio" name="" id="" />
                <p>tasks</p>
              </div>

              {/* FOOTLONG OPTIONS */}
              <EllipsisVertical size={20} className="cursor-pointer" />
            </div>
          </li>
          <li className="min-w-min px-4 py-4 rounded-full bg-white">
            <div className="flex justify-between items-center gap-2 w-full">
              <div className="flex gap-2 items-center">
                <input type="radio" name="" id="" />
                <p>tasks</p>
              </div>

              {/* FOOTLONG OPTIONS */}
              <EllipsisVertical size={20} className="cursor-pointer" />
            </div>
          </li>
        </ul>
      </div>

      <div className="text-center mx-auto mt-[75px] w-auto px-4">
        {/* <div className="flex flex-col gap-6 items-center">
          <Image
            src={"/note.png"}
            height={400}
            width={170}
            alt="Note png"
            quality={100}
          />

           <div className="space-y-3">
            <h3 className="font-semibold text-2xl">Your day task is empty</h3>
            <p className="text-sm">
              Get things done by adding a new task to your day
            </p>
          </div> 
        </div> */}
      </div>

      {/* FLOATING MODAL BUTTON */}
      <AddNewTaskBtn />
    </div>
  );
}
