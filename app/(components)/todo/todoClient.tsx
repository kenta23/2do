"use client";

import React, { useContext } from "react";
import { ContextProvider } from "@/providers/ContextProvider";
import FetchTasks from "@/components/FetchTasks";
import { useTasksQuery } from "@/lib/queries";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getTask } from "@/app/actions/data";

export default function TodoClient() {
  // console.log("data todos", data);
  const pathname = usePathname();

  const { data: tasks, error } = useTasksQuery("todos", pathname);

  if (error) {
    console.log(error);
    throw new Error();
  }

  return (
    <ContextProvider.Provider value={{ tasks, queryKey: "todos", pathname }}>
      <FetchTasks />
    </ContextProvider.Provider>
  );
}
