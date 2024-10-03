import { CollabTasksType, TaskOrCollabTask, TaskType } from "@/types";
import { QueryClient } from "@tanstack/query-core";
import {
  Bell,
  Clock3,
  EllipsisVertical,
  Pencil,
  Plus,
  Star,
  Trash,
} from "lucide-react";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { basicInfoUser } from "./collaborations/page";
import { deleteTask, useDeleteMutation, useTaskListQuery } from "@/lib/queries";
import TaskOptions from "@/components/TaskOptions";
import { deleteSingleTask } from "../actions/data";

export default function TaskItem({
  task,
  users,
  querykey,
}: {
  task: TaskOrCollabTask;
  users: basicInfoUser | null;
  querykey: string;
}) {
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const { mutate: deleteMutation, isSuccess } = useMutation({
    mutationFn: async (id: string) => await deleteSingleTask(id, pathname),
    mutationKey: ["deleteTask"],
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: [querykey] }); //cancel incoming query

      //snapshot prev items
      const prevTodos = queryClient.getQueryData([querykey]); //get the cache query

      //optimistic updates
      //set the query data and update to the newest
      queryClient.setQueryData([querykey], (oldTodos: TaskOrCollabTask[]) =>
        oldTodos.filter((todo) => todo.id !== taskId)
      );

      // Return a context object with the snapshotted value
      return { prevTodos };
    },
  });

  // const { mutate: deleteMutation } = useDeleteMutation(
  //   querykey,
  //   queryClient,
  //   pathname
  // );

  //const deleteTaskFn = () => deleteTask(task.id, deleteMutation, querykey, queryClient);
  // const deleteTaskFn = deleteTask(
  //   task.id,
  //   deleteMutation,
  //   querykey,
  //   queryClient
  // );
  // const deleteTask = async (id: string) => {
  //   try {
  //     deleteMutation(id, {
  //       onSettled: () => {
  //         console.log("deleting task");
  //         queryClient.invalidateQueries({
  //           queryKey: [querykey],
  //         });
  //       },
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  return (
    <li className="min-w-min px-4 py-4 rounded-full bg-white">
      <div className="flex justify-between items-center gap-2 w-full">
        <div className="flex gap-2 items-center">
          <input type="radio" name="checktask" id="" />
          <p>{task.content}</p>
        </div>

        <div className="flex gap-3 items-center">
          {pathname !== "/todo" && (
            <div className="max-w-[190px] w-auto">
              {users?.map((user) => (
                <Image
                  key={user.id}
                  src={user.image ?? "/Logo.png"}
                  alt="user avatar"
                  width={30}
                  height={100}
                  className="rounded-full border-yellow-500 border-[1px]"
                />
              ))}
            </div>
          )}

          {task.duedate && (
            <div className="flex border-[#B27C2A] border-[1px] p-1 rounded-full items-center gap-1">
              <Clock3 color="#B27C2A" size={14} />
              <p className="ml-1 text-[#B27C2A] text-[12px]">
                {task?.duedate
                  ? new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    }).format(new Date(task.duedate))
                  : ""}
              </p>
            </div>
          )}

          {/* FOOTLONG OPTIONS */}
          <TaskOptions
            deleteTask={() =>
              deleteTask(task.id, deleteMutation, querykey, queryClient)
            }
            querykey={querykey}
            pathname={pathname}
            taskId={task.id}
          />
        </div>
      </div>
    </li>
  );
}
