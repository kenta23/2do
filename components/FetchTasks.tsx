"use client";

import { ContextProvider } from "@/providers/ContextProvider";
import React, { useContext } from "react";
import { usePathname } from "next/navigation";
import { CollabTasksType, TaskOrCollabTask, TaskType } from "@/types";
import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { basicInfoUser } from "@/app/(components)/collaborations/page";
import { deleteTask, useTasksQuery } from "@/lib/queries";
import Image from "next/image";
import { deleteSingleTask } from "@/app/actions/data";
import { Clock3 } from "lucide-react";
import TaskOptions from "./TaskOptions";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export default function FetchTasks() {
  // add a data props here
  //read the value of context
  const {
    tasks: data,
    queryKey = "",
    pathname = "",
    users,
  } = useContext(ContextProvider) || {};

  if (!data && !queryKey && !pathname) {
    throw new Error("No contexts available"); //fix this logic after
  }

  //all the logic and data fetching goes here
  const addnewTaskVariables = useMutationState({
    filters: { mutationKey: ["addNewTodo"], status: "pending" },
    select: (mutation) => mutation.state.variables as TaskOrCollabTask,
  });

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
    <div className="relative max-h-[600px] h-full">
      {/* IF THERE IS EXISTED TASKS */}
      {data ? (
        <div className="mx-3 md:mx-8 mt-10 max-h-[520px] mb-6 overflow-y-auto w-full md:max-w-[680px]">
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

            {Array.isArray(data)
              ? data
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
                            querykey={queryKey}
                            pathname={pathname}
                          />
                        ) : (
                          <TaskItem
                            task={item}
                            key={item.id}
                            pathname={pathname}
                          />
                        )
                      )
                    ) : pathname === "/collaborations" ? (
                      <CollabTaskItem
                        task={item as CollabTasksType}
                        key={item.id}
                        users={users}
                        querykey={queryKey}
                        pathname={pathname}
                      />
                    ) : (
                      <TaskItem task={item} key={item.id} pathname={pathname} />
                    )
                  )
              : null}
          </ul>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-[500px]">
          <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-t-transparent border-yellow-700"></div>
        </div>
      )}
    </div>
  );
}

function TaskItem({
  task,
  pathname,
}: {
  task: TaskOrCollabTask;
  pathname: string;
}) {
  const queryClient = useQueryClient();
  const context = useContext(ContextProvider);
  const querykey = context?.queryKey as string;

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
              {/* {users?.map((user) => (
                  <Image
                    key={user.id}
                    src={user.image ?? "/Logo.png"}
                    alt="user avatar"
                    width={30}
                    height={100}
                    className="rounded-full border-yellow-500 border-[1px]"
                  />
                ))} */}
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

function CollabTaskItem({
  task,
  querykey,
  pathname,
  users,
}: {
  task: TaskOrCollabTask;
  querykey: string;
  pathname: string;
  users: basicInfoUser | null;
}) {
  const queryClient = useQueryClient();

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

  return (
    <li className="min-w-min px-4 py-4 rounded-full bg-white">
      <div className="flex justify-between items-center gap-2 w-full">
        <div className="flex gap-2 items-center">
          <input type="radio" name="checktask" id="" />
          <p>{task.content}</p>
        </div>

        <div className="max-w-[190px] w-auto">
          {users &&
            users.slice(0, 4).map((user) => (
              <TooltipProvider key={user.id}>
                <TooltipTrigger className="cursor-pointer">
                  <Image
                    key={user.id}
                    src={user.image ?? "/Logo.png"}
                    alt="user avatar"
                    width={30}
                    height={100}
                    className="rounded-full cursor-pointer border-yellow-500 border-[1px]"
                  />
                  <TooltipContent className="text-black">
                    {user.name}
                  </TooltipContent>
                </TooltipTrigger>
              </TooltipProvider>
            ))}

          {users && users?.length > 4 && (
            <div className="border-yellow-500 border-[1px] rounded-full size-[30px] flex items-center justify-center">
              +{users.length - 4}
            </div>
          )}
        </div>

        <div className="flex gap-2 items-center">
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
