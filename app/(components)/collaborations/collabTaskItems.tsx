"use client";

import React from "react";
import EditTaskPopover from "@/components/editTaskPopover";
import { listStyles } from "@/components/TaskList";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CollabTasksType, TaskType } from "@/types";
import { QueryClient } from "@tanstack/query-core";
import {
  Bell,
  Clock3,
  EllipsisVertical,
  Pencil,
  Plus,
  Star,
  Trash,
} from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

export default function CollabTaskItems({
  task,
  users,
}: {
  task: CollabTasksType[] | undefined;
  users: { name: string; id: string; avatar: string | null }[] | undefined;
}) {
  const queryClient = new QueryClient();

  return (
    <div className="mx-8 mt-10 max-h-[600px] mb-6 overflow-y-auto max-w-[680px]">
      <ul className="flex flex-col gap-5">
        {!task ? (
          <p>Loading</p>
        ) : (
          task
            .slice()
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((item) => (
              <li
                key={item.id}
                className="min-w-min px-4 py-4 rounded-full bg-white"
              >
                <div className="flex justify-between items-center gap-2 w-full">
                  <div className="flex gap-2 items-center">
                    <input type="radio" name="checktask" id="" />
                    <p>{item.content}</p>
                  </div>

                  <div className="max-w-[190px] w-auto">
                    {users?.map((user) => (
                      <Image
                        key={user.id}
                        src={user.avatar ?? "/Logo.png"}
                        alt="user avatar"
                        width={30}
                        height={100}
                        className="rounded-full border-yellow-500 border-[1px]"
                      />
                    ))}
                  </div>

                  <div className="flex gap-3 items-center">
                    {item.duedate && (
                      <div className="flex border-[#B27C2A] border-[1px] p-1 rounded-full items-center gap-1">
                        <Clock3 color="#B27C2A" size={14} />
                        <p className="ml-1 text-[#B27C2A] text-[12px]">
                          {item?.duedate
                            ? new Intl.DateTimeFormat("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                              }).format(new Date(item.duedate))
                            : ""}
                        </p>
                      </div>
                    )}
                    {/* FOOTLONG OPTIONS */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <EllipsisVertical
                          onClick={async () =>
                            await queryClient.refetchQueries({
                              queryKey: ["singleTask"],
                              type: "active",
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
                            <Popover>
                              <PopoverTrigger className="w-full border-none outline-none">
                                <li className={listStyles}>
                                  <Pencil size={18} />
                                  <p>Edit</p>
                                </li>
                              </PopoverTrigger>

                              <PopoverContent
                                side="right"
                                sideOffset={20}
                                align="start"
                                className="w-full"
                              >
                                <EditTaskPopover taskId={item.id} />
                              </PopoverContent>
                            </Popover>
                            <li className={listStyles}>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <div className={listStyles}>
                                    <Trash />
                                    <p>Delete</p>
                                  </div>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you absolutely sure you want to delete
                                      this task?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction>
                                      Continue
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
                </div>
              </li>
            ))
        )}
      </ul>
    </div>
  );
}