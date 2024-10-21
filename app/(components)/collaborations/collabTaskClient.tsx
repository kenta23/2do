"use client";

import dateNow from "@/lib/date";
import React from "react";
import Image from "next/image";
import { fetchAssignedTasks, fetchYourTasksTodos } from "@/app/actions/data";
import { Metadata } from "next";
import TaskList from "@/components/TaskList";
import {
  useFetchAssignedTask,
  useFetchYourTasks,
  useTasksQuery,
} from "@/lib/queries";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import CollabTaskList from "./collabTaskList";
import { ContextProvider } from "@/providers/ContextProvider";
import FetchTasks from "@/components/FetchTasks";

export default function CollabTaskClient() {
  const pathname = usePathname();

  const { data } = useFetchYourTasks();
  const { data: assignedTasks } = useFetchAssignedTask();

  return (
    <div>
      {data?.yourTasks && assignedTasks && (
        <div className="h-full w-full max-w-[700px] min-w-auto min-h-full">
          {/* YOUR OWNED TASKS HERE */}
 
          <ContextProvider.Provider
            value={{ tasks: data?.yourTasks, queryKey: "yourTasks", pathname, users: data?.users }}
          >
            <FetchTasks />
          </ContextProvider.Provider>

          <header className="mx-8 mt-10">
            <h2 className="text-2xl font-medium">Assigned Tasks</h2>
          </header>
 
          {/* TASKS ASSIGNED TO YOU */}
          <ContextProvider.Provider
            value={{
              tasks: assignedTasks.acceptedTasks,
              queryKey: "assignedTasks",
              pathname,
              users: assignedTasks?.users
            }}
          >
            {/* <FetchTasks data={assignedTasks.acceptedTasks} users={assignedTasks?.users} /> */}
            <FetchTasks  />
          </ContextProvider.Provider>
        </div>
      )}
    </div>
  );
}
