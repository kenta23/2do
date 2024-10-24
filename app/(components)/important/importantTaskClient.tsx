"use client";

import { getTask } from "@/app/actions/data";
import FetchTasks from "@/components/FetchTasks";
import { useTasksQuery } from "@/lib/queries";
import { ContextProvider } from "@/providers/ContextProvider";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import React from "react";

export default function ImportantTaskClient() {
  const pathname = usePathname();

  const {
    data: tasks,
    error,
    isSuccess,
    isPending,
  } = useTasksQuery("important", pathname);

  if (error) {
    console.log(error);
    throw new Error();
  }

  return (
    <ContextProvider.Provider
      value={{ tasks, queryKey: "important", pathname }}
    >
      <FetchTasks />
    </ContextProvider.Provider>
  );
}
