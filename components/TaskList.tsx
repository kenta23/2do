import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Bell,
  EllipsisVertical,
  Pencil,
  Plus,
  Star,
  Trash,
} from "lucide-react";
import { TaskType } from "@/types";

const listStyles = `flex gap-3 cursor-pointer hover:bg-secondaryColor 
       rounded-md hover:text-white duration-200 ease-in-out active:bg-secondaryColor w-full p-1 items-center`;

export default function TaskList({ data }: { data: TaskType[] }) {
  return (
    <div className="mx-8 mt-20 max-h-[700px] overflow-y-clip max-w-[680px]">
      <ul className="flex flex-col gap-5">
        {data.map((item) => (
          <li
            key={item.id}
            className="min-w-min px-4 py-4 rounded-full bg-white"
          >
            <div className="flex justify-between items-center gap-2 w-full">
              <div className="flex gap-2 items-center">
                <input type="radio" name="checktask" id="" />
                <p>{item.content}</p>
              </div>

              {/* FOOTLONG OPTIONS */}
              <Popover>
                <PopoverTrigger asChild>
                  <EllipsisVertical size={20} className="cursor-pointer" />
                </PopoverTrigger>

                <PopoverContent
                  className=" px-3 py-2 max-w-[250px] border-none rounded-md"
                  side="right"
                  align="start"
                  sideOffset={10}
                >
                  <div className="bg-white">
                    <ul className="flex flex-col space-y-1 items-start w-full">
                      <Popover>
                        <PopoverTrigger className="w-full border-none outline-none">
                          <li className={listStyles}>
                            <Pencil size={18} />
                            <p>Edit</p>
                          </li>

                          <PopoverContent
                            side="right"
                            sideOffset={20}
                            align="start"
                            className="w-full"
                          >
                            <p>ANother Popover</p>
                          </PopoverContent>
                        </PopoverTrigger>
                      </Popover>
                      <li className={listStyles}>
                        <Trash />
                        <p>Delete</p>
                      </li>
                      <li className={listStyles}>
                        <Star />
                        <p>Mark as Important</p>
                      </li>
                      <li className={listStyles}>
                        <Plus />
                        <p>Add to</p>
                      </li>
                      <li className={listStyles}>
                        <Bell />
                        <p>Remind me</p>
                      </li>
                    </ul>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
