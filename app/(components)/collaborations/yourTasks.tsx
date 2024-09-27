"use client";

import { CollabTasksType, TaskType } from "@/types";
import React from "react";
import CollabTaskItems from "./collabTaskItems";
import { PrismaClient } from "@prisma/client";
import { basicInfoUser } from "./page";

export default function YourTasks({
  tasks,
  users,
}: {
  tasks: CollabTasksType[] | undefined;
  users: basicInfoUser;
}) {
  return (
    <div className="h-auto">
      {/* IF THERE IS EXISTED TASKS */}
      <CollabTaskItems task={tasks} users={users} />
    </div>
  );
}
