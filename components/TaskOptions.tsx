"use client";

import {
  Bell,
  EllipsisVertical,
  Pencil,
  Plus,
  Star,
  Trash,
} from "lucide-react";
import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import AddListPopover from "./addListPopover";
import { listStyles } from "./TaskList";
import EditTaskPopover from "./editTaskPopover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useTaskListQuery } from "@/lib/queries";

export default function TaskOptions({
  taskId,
  deleteTask,
  querykey,
}: {
  taskId: string;
  deleteTask: (id: string) => void;
  querykey: string;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { data: queryLists } = useTaskListQuery(open);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <EllipsisVertical
          onClick={async () =>
            await queryClient.refetchQueries({
              queryKey: ["singleTask", taskId],
            })
          }
          size={20}
          className="cursor-pointer"
        />
      </PopoverTrigger>

      <PopoverContent
        className=" px-3 py-2 max-w-[250px] border-none rounded-md"
        side="right"
        align="start"
        sideOffset={10}
      >
        <div className="bg-white">
          <ul className="flex flex-col space-y-1 items-start w-full">
            <li className={listStyles}>
              <Popover>
                <PopoverTrigger className="w-full border-none outline-none">
                  <div className="flex gap-2">
                    <Pencil size={22} />
                    <p>Edit</p>
                  </div>
                </PopoverTrigger>

                <PopoverContent
                  side="right"
                  sideOffset={20}
                  align="start"
                  className="w-full"
                >
                  <EditTaskPopover taskId={taskId} querykey={querykey} />
                </PopoverContent>
              </Popover>
            </li>

            <li className={listStyles}>
              <AlertDialog>
                <AlertDialogTrigger className="w-full" asChild>
                  <div className="flex gap-2">
                    <Trash size={22} />
                    <p>Delete</p>
                  </div>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure you want to delete this task?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteTask(taskId)}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>

            <li className={listStyles}>
              <Star size={22} />
              <p>Mark as Important</p>
            </li>

            <li className={listStyles}>
              <Popover
                onOpenChange={() => setOpen((prev) => !prev)}
                open={open}
              >
                <PopoverTrigger className="w-full border-none outline-none">
                  <div className="flex gap-2">
                    <Plus size={22} />
                    <p>Add to</p>
                  </div>
                </PopoverTrigger>

                <PopoverContent
                  side="right"
                  sideOffset={20}
                  align="start"
                  className="w-full"
                >
                  <AddListPopover
                    lists={queryLists}
                    taskID={taskId}
                    setOpen={setOpen}
                  />
                </PopoverContent>
              </Popover>
            </li>

            <li className={listStyles}>
              <Bell size={22} />
              <p>Remind me</p>
            </li>
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
