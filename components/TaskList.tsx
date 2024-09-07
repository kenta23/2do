"use client";

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
import EditTaskPopover from "./editTaskPopover";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import TaskItem from "@/app/(components)/taskItem";

export const listStyles = `flex gap-3 cursor-pointer hover:bg-secondaryColor 
       rounded-md hover:text-white duration-200 ease-in-out active:bg-secondaryColor w-full p-1 items-center`;

export default function TaskList({ data }: { data: TaskType[] }) {
  const queryClient = new QueryClient();

  return (
    <div className="mx-8 mt-10  max-h-[600px] mb-6 overflow-y-auto max-w-[680px]">
      <ul className="flex flex-col gap-5">
        {!data ? (
          <p>Loading</p>
        ) : (
          data
            .slice()
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
            .map((item) => <TaskItem task={item} key={item.id} />)
        )}
      </ul>
    </div>
  );
}
