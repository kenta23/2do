"use client";

import dateNow from "@/lib/date";
import React from "react";
import Image from "next/image";
import { fetchAssignedTasks, fetchYourTasksTodos } from "@/app/actions/data";
import { Metadata } from "next";
import TaskList from "@/components/TaskList";
import { useTasksQuery } from "@/lib/queries";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import CollabTaskList from "./collabTaskList";

export default function CollabTaskClient() {
  const { data } = useQuery({
    queryKey: ["yourTasks"],
    queryFn: async () => await fetchYourTasksTodos(),
  });

  const { data: assignedTasks } = useQuery({
    queryKey: ["assignedTasks"],
    queryFn: async () => await fetchAssignedTasks(),
  });

  return (
    <div>
      {!data?.yourTasks && !assignedTasks ? (
        <>
          <div className="text-center my-auto h-[500px] mx-auto mt-[40px] w-auto px-4">
            <div className="flex flex-col gap-6 items-center">
              <Image
                src={"/note.png"}
                height={400}
                width={170}
                alt="Note png"
                quality={100}
              />

              <div className="space-y-3">
                <h3 className="font-semibold text-2xl">
                  Your day task is empty
                </h3>
                <p className="text-sm">
                  Get things done by adding a new task to your day
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        data?.yourTasks &&
        assignedTasks && (
          <div className="h-full w-full max-w-[700px] min-w-auto min-h-full">
            {/* YOUR OWNED TASKS HERE */}

            {/* <YourTasks tasks={tasks?.yourTasks} users={tasks?.users} /> */}
            <CollabTaskList
              data={data?.yourTasks}
              users={data?.users}
              querykey="yourTasks"
            />

            <header className="mx-8 mt-10">
              <h2 className="text-2xl font-medium">Assigned Tasks</h2>
            </header>

            {/* TASKS ASSIGNED TO YOU */}
            <CollabTaskList
              data={assignedTasks}
              users={data?.users}
              querykey="assignedTasks"
            />
          </div>
        )
      )}
    </div>
  );
}
