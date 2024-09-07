import EditTaskPopover from "@/components/editTaskPopover";
import { listStyles } from "@/components/TaskList";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TaskType } from "@/types";
import { QueryClient } from "@tanstack/query-core";
import {
  Bell,
  EllipsisVertical,
  Pencil,
  Plus,
  Star,
  Trash,
} from "lucide-react";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteSingleTask } from "../actions/data";

export default function TaskItem({ task }: { task: TaskType }) {
  const queryClient = new QueryClient();

  const deleteTask = async (id: string) => {
    try {
      const response = await deleteSingleTask(id);

      if (response) {
        console.log(response);

        //refetch data
        queryClient.invalidateQueries({
          queryKey: ["tasklist", "singleTask", id],
          exact: true,
          type: "active",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <li className="min-w-min px-4 py-4 rounded-full bg-white">
      <div className="flex justify-between items-center gap-2 w-full">
        <div className="flex gap-2 items-center">
          <input type="radio" name="checktask" id="" />
          <p>{task.content}</p>
        </div>

        {/* FOOTLONG OPTIONS */}
        <Popover>
          <PopoverTrigger asChild>
            <EllipsisVertical
              onClick={async () =>
                await queryClient.refetchQueries({
                  queryKey: ["singleTask"],
                  type: "active",
                })
              }
              size={20}
              className="cursor-pointer"
            />
          </PopoverTrigger>

          <PopoverContent
            className=" px-3 py-2 max-w-[250px] border-none rounded-md"
            side="right"
            align="start"
            sideOffset={10}
          >
            <div className="bg-white">
              <ul className="flex flex-col space-y-1 items-start w-full">
                <Popover>
                  <PopoverTrigger className="w-full border-none outline-none">
                    <li className={listStyles}>
                      <Pencil size={18} />
                      <p>Edit</p>
                    </li>
                  </PopoverTrigger>

                  <PopoverContent
                    side="right"
                    sideOffset={20}
                    align="start"
                    className="w-full"
                  >
                    <EditTaskPopover taskId={task.id} />
                  </PopoverContent>
                </Popover>
                <li className={listStyles}>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <div className={listStyles}>
                        <Trash />
                        <p>Delete</p>
                      </div>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure you want to delete this task?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteTask(task.id)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
                <li className={listStyles}>
                  <Star />
                  <p>Mark as Important</p>
                </li>
                <li className={listStyles}>
                  <Plus />
                  <p>Add to</p>
                </li>
                <li className={listStyles}>
                  <Bell />
                  <p>Remind me</p>
                </li>
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </li>
  );
}
