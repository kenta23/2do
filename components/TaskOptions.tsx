"use client";

import {
  Bell,
  EllipsisVertical,
  Pencil,
  Plus,
  Star,
  Trash,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import AddListPopover from "./addListPopover";
import { listStyles } from "@/lib/utils";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useImportantTaskToggle, useTaskListQuery } from "@/lib/queries";
import { isTaskImportant, markAsImportant } from "@/app/actions/important";

export default function TaskOptions({
  taskId,
  deleteTask,
  querykey,
  pathname,
}: {
  taskId: string;
  deleteTask: (id: string) => void;
  pathname: string;
  querykey: string;
}) {
  const [open, setOpen] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const { data: queryLists, refetch } = useTaskListQuery(open, taskId);

  const { data: IsInImportant, refetch: refetchImportant } = useQuery({
    queryFn: async () => await isTaskImportant(taskId, pathname),
    queryKey: ["important", taskId],
    enabled: open,
  });

  const { mutate: mutateTask, reset } = useImportantTaskToggle(
    taskId,
    pathname
  );

  useEffect(() => {
    if (open) {
      refetch();
      refetchImportant();
    }
  }, [open, refetch, refetchImportant]);

  function handleImportantTasks(id: string) {
    mutateTask(id, {
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["tasklists"],
          type: "active",
        });

        refetchImportant();
      },
      onError: (error) => {
        console.log(error);
      },
    });
  }

  return (
    <Popover onOpenChange={() => setOpen((prev) => !prev)} open={open}>
      <PopoverTrigger onClick={(e) => e.stopPropagation()} asChild>
        <EllipsisVertical
          onClick={async () =>
            await queryClient.prefetchQuery({
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
        <div onClick={(e) => e.stopPropagation()} className="bg-white">
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
                  {/* TODO TASKS */}
                  <EditTaskPopover taskId={taskId} querykey={querykey} />

                  {/* COLLAB TASKS */}
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

            <li
              className={listStyles}
              onClick={() => handleImportantTasks(taskId)}
            >
              <Star
                fill={IsInImportant?.important === true ? "#eec043" : "none"} // Use "none" when not important
                stroke={
                  IsInImportant?.important === true ? "#eec043" : "currentColor"
                } // Stroke for the border
                className={`${
                  IsInImportant?.important === true ? "text-[#eec043]" : ""
                }`}
                size={22}
              />
              <p
                className={`${
                  IsInImportant?.important === true ? "text-[#eec043]" : ""
                }`}
              >
                Mark as Important
              </p>
            </li>

            <li className={listStyles}>
              <Popover>
                <PopoverTrigger
                  onClick={(e) => e.stopPropagation()}
                  className="w-full border-none outline-none"
                >
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
                    lists={queryLists?.data}
                    alreadyInList={queryLists?.alreadyInList}
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
