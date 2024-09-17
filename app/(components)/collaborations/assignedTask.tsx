"use client";

import TaskList from "@/components/TaskList";
import React from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getTask } from "@/app/actions/data";
import Image from "next/image";
import { CollabTasksType } from "@/types";
import CollabTaskItems from "./collabTaskItems";

export default function AssignedTask({
  tasks,
  users,
}: {
  tasks: CollabTasksType[] | undefined;
  users: { name: string; id: string; avatar: string | null }[] | undefined;
}) {
  const pathName = usePathname();

  return (
    <div className=" h-auto ">
      {/* IF THERE IS EXISTED TASKS */}
      <CollabTaskItems task={tasks} users={users} />
    </div>
  );
}
