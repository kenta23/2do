"use client";

import React from "react";
import { CollabTasksType } from "@/types";
import { basicInfoUser } from "@/app/(components)/collaborations/page";
import FetchTasks from "@/components/FetchTasks";

export const listStyles = `flex gap-3 cursor-pointer hover:bg-secondaryColor 
       rounded-md hover:text-white duration-200 ease-in-out active:bg-secondaryColor w-full p-1 items-center`;

export default function CollabTaskList({
  data,
  users,
}: {
  data: CollabTasksType[] | undefined;
  users: basicInfoUser | null;
}) {
  return <FetchTasks data={data} users={users} />;
}
