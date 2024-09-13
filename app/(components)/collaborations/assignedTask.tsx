"use client";

import TaskList from "@/components/TaskList";
import React from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getTask } from "@/app/actions/data";
import Image from "next/image";
import { CollabTasksType } from "@/types";

export default function AssignedTask({
  tasks,
}: {
  tasks: CollabTasksType[] | undefined;
}) {
  const pathName = usePathname();

  return (
    <div className="relative max-h-[600px] h-full">
      {/* IF THERE IS EXISTED TASKS */}
    </div>
  );
}
