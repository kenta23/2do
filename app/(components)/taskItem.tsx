import EditTaskPopover from "@/components/editTaskPopover";
import { listStyles, TaskOrCollabTask } from "@/components/TaskList";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CollabTasksType, TaskType } from "@/types";
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
import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import AddListPopover from "@/components/addListPopover";
import { getLists } from "../actions/lists";

export default function TaskItem({ task }: { task: TaskOrCollabTask }) {
  const [open, setOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const { data: queryLists } = useQuery({
    queryKey: ["tasklists"],
    queryFn: async () => await getLists(),
    enabled: open,
  });
  const { mutate: deleteMutation, isSuccess } = useMutation({
    mutationFn: async (id: string) => await deleteSingleTask(id),
    mutationKey: ["deleteTask"],
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] }); //cancel incoming query

      //snapshot prev items
      const prevTodos = queryClient.getQueryData(["todos"]); //get the cache query

      //optimistic updates
      //set the query data and update to the newest
      queryClient.setQueryData(["todos"], (oldTodos: TaskOrCollabTask[]) =>
        oldTodos.filter((todo) => todo.id !== taskId)
      );

      // Return a context object with the snapshotted value
      return { prevTodos };
    },
  });

  const deleteTask = async (id: string) => {
    try {
      deleteMutation(id, {
        onSettled: () => {
          console.log("deleting task");
          queryClient.invalidateQueries({
            queryKey: ["todos", "assignedTasks", "yourTasks"],
          });
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <li className="min-w-min px-4 py-4 rounded-full bg-white">
        <div className="flex justify-between items-center gap-2 w-full">
          <div className="flex gap-2 items-center">
            <input type="radio" name="checktask" id="" />
            <p>{task.content}</p>
          </div>

          <div className="flex gap-3 items-center">
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
            <Popover>
              <PopoverTrigger asChild>
                <EllipsisVertical
                  onClick={async () =>
                    await queryClient.refetchQueries({
                      queryKey: ["singleTask", task.id],
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
                    <li className={listStyles}>
                      <Popover>
                        <PopoverTrigger className="w-full border-none outline-none">
                          <div className="flex gap-2">
                            <Pencil size={22} />
                            <p>Edit</p>
                          </div>
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
                    </li>

                    <li className={listStyles}>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div className="flex gap-2">
                            <Trash size={22} />
                            <p>Delete</p>
                          </div>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure you want to delete this
                              task?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteTask(task.id)}
                            >
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </li>

                    <li className={listStyles}>
                      <Star size={22} />
                      <p>Mark as Important</p>
                    </li>

                    <li className={listStyles}>
                      <Popover
                        onOpenChange={() => setOpen((prev) => !prev)}
                        open={open}
                      >
                        <PopoverTrigger className="w-full border-none outline-none">
                          <div className="flex gap-2">
                            <Plus size={22} />
                            <p>Add to</p>
                          </div>
                        </PopoverTrigger>

                        <PopoverContent
                          side="right"
                          sideOffset={20}
                          align="start"
                          className="w-full"
                        >
                          <AddListPopover
                            lists={queryLists}
                            taskID={task.id}
                            setOpen={setOpen}
                          />
                        </PopoverContent>
                      </Popover>
                    </li>

                    <li className={listStyles}>
                      <Bell size={22} />
                      <p>Remind me</p>
                    </li>
                  </ul>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </li>
    </>
  );
}
