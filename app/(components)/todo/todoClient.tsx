"use client";

import { getTask } from "@/app/actions/data";
import AddNewTaskBtn from "@/components/addNewTaskBtn";
import TaskList from "@/components/TaskList";
import { useMutationState, useQuery } from "@tanstack/react-query";
import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CollabTasksType, TaskType } from "@/types";
import { useTasksQuery } from "@/lib/queries";

export default function TodoClient({ queryKey }: { queryKey: string }) {
  const pathName = usePathname();
  const { data, error, isSuccess, isPending } = useTasksQuery(
    queryKey,
    pathName
  );

  // console.log("data todos", data);

  return (
    <div className="relative max-h-[600px] h-full">
      {/* IF THERE IS EXISTED TASKS */}
      {data ? (
        <TaskList data={data} users={null} querykey={queryKey} />
      ) : (
        <div className="text-center my-auto h-[500px] mx-auto mt-[20px] w-auto px-4">
          <div className="flex flex-col gap-6 items-center">
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
          </div>
        </div>
      )}
    </div>
  );
}
