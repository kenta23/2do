"use client";

import React, { useContext } from "react";
import { usePathname } from "next/navigation";
import { CollabTasksType, TaskOrCollabTask, TaskType } from "@/types";
import { useMutationState } from "@tanstack/react-query";
import TaskItem from "@/app/(components)/taskItem";
import { basicInfoUser } from "@/app/(components)/collaborations/page";
import CollabTaskItem from "@/components/collabTaskItems";

export const listStyles = `flex gap-3 cursor-pointer hover:bg-secondaryColor 
       rounded-md hover:text-white duration-200 ease-in-out active:bg-secondaryColor w-full p-1 items-center`;

export default function TaskList<T extends TaskOrCollabTask>({
  data,
  users,
  querykey,
}: {
  data: T[] | undefined;
  users: basicInfoUser | null;
  querykey: string;
}) {
  console.log("data", data);

  const addnewTaskVariables = useMutationState({
    filters: { mutationKey: ["addNewTodo"], status: "pending" },
    select: (mutation) => mutation.state.variables as TaskOrCollabTask,
  });
  const pathname = usePathname();

  const editTaskVariables = useMutationState<TaskOrCollabTask>({
    filters: {
      mutationKey: ["editTodo"],
      status: "pending",
    },
    select: (mutation) => mutation.state.variables as TaskOrCollabTask,
  });

  const deleteTaskVariables = useMutationState({
    filters: { mutationKey: ["deleteTask"], status: "pending" },
    select: (mutation) => mutation.state.variables as { id: string },
  });

  return (
    <div className="mx-8 mt-10 max-h-[520px] mb-6 overflow-y-auto w-full max-w-[680px]">
      <ul className="flex flex-col gap-5">
        {addnewTaskVariables &&
          addnewTaskVariables.map((item) => (
            <li
              className="min-w-min px-4 py-4 rounded-full bg-white opacity-50"
              key={item.id}
            >
              <div className="flex justify-between items-center gap-2 w-full">
                <div className="flex gap-2 items-center">
                  <input type="radio" id="" />
                  <p>{item.content}</p>
                </div>
              </div>
            </li>
          ))}

        {!data ? (
          <p>Loading</p>
        ) : (
          data
            .slice()
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((item) =>
              deleteTaskVariables[0] &&
              deleteTaskVariables[0].id === item.id ? (
                <li
                  className="min-w-min px-4 py-4 rounded-full bg-white opacity-50"
                  key={deleteTaskVariables[0].id}
                >
                  <div className="flex justify-between items-center gap-2 w-full">
                    <div className="flex gap-2 items-center">
                      <input type="radio" id="" />
                      <p>deleting......</p>
                    </div>
                  </div>
                </li>
              ) : editTaskVariables.length ? (
                editTaskVariables.map((task) =>
                  task.id === item.id ? (
                    <li
                      className="min-w-min px-4 py-4 rounded-full bg-white opacity-50"
                      key={task.id}
                    >
                      <div className="flex justify-between items-center gap-2 w-full">
                        <div className="flex gap-2 items-center">
                          <input type="radio" id="" />
                          <p>{task.content}</p>
                        </div>
                      </div>
                    </li>
                  ) : pathname === "/collaborations" ? (
                    <CollabTaskItem
                      task={item as CollabTasksType}
                      key={item.id}
                      users={users}
                      querykey={querykey}
                    />
                  ) : (
                    <TaskItem
                      task={item}
                      key={item.id}
                      users={users}
                      querykey={querykey}
                    />
                  )
                )
              ) : pathname === "/collaborations" ? (
                <CollabTaskItem
                  task={item as CollabTasksType}
                  key={item.id}
                  users={users}
                  querykey={querykey}
                />
              ) : (
                <TaskItem
                  task={item}
                  key={item.id}
                  users={users}
                  querykey={querykey}
                />
              )
            )
        )}
      </ul>
    </div>
  );
}
