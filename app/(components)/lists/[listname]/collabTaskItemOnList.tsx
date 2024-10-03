import { CollabTasksType, TaskType } from "@/types";
import { Clock3 } from "lucide-react";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import AddListPopover from "@/components/addListPopover";
import { basicInfoUser } from "../../collaborations/page";
import TaskOptions from "@/components/TaskOptions";
import { deleteTask, useDeleteMutation, useTaskListQuery } from "@/lib/queries";
import { usePathname } from "next/navigation";

export default function Collabtasksonlist({
  tasks,
  users,
}: {
  tasks: CollabTasksType[] | undefined;
  users: basicInfoUser | null;
}) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { mutate: deleteMutation } = useDeleteMutation(
    "collabTaskList",
    queryClient,
    pathname
  );

  const deleteTaskFn = async (id: string) =>
    deleteTask(id, deleteMutation, "collabTaskList", queryClient);

  return (
    <div className="mx-8 mt-10 max-h-[520px] mb-6 overflow-y-auto w-full max-w-[680px]">
      <ul className="flex flex-col gap-5">
        {tasks?.map((task) => (
          <li
            key={task.id}
            className="min-w-min px-4 py-4 rounded-full bg-white"
          >
            <div className="flex justify-between items-center gap-2 w-full">
              <div className="flex gap-2 items-center">
                <input type="radio" name="checktask" id="" />
                <p>{task.content}</p>
              </div>

              <div className="flex gap-3 items-center">
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
                  deleteTask={() => deleteTaskFn(task.id)}
                  querykey={"collabTaskList"}
                  taskId={task.id}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
