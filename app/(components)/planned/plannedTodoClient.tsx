"use client";

import AddNewTaskBtn from "@/components/addNewTaskBtn";
import React from "react";
import Image from "next/image";
import { TaskType } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AccordionItem } from "@radix-ui/react-accordion";

import {
  Bell,
  EllipsisVertical,
  Pencil,
  Plus,
  Star,
  Trash,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EditTaskPopover from "@/components/editTaskPopover";
import { listStyles } from "@/components/TaskList";
import { QueryClient } from "@tanstack/react-query";
import TaskItem from "../taskItem";

const isTodayTask = (taskDueDate: Date) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); // Set to today's 00:00:00

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999); // Set to today's 23:59:59

  const dueDate = new Date(taskDueDate); // Convert the task's duedate to a Date object

  // Compare if the duedate is between todayStart and todayEnd
  return (
    dueDate.getTime() >= todayStart.getTime() &&
    dueDate.getTime() <= todayEnd.getTime()
  );
};

export default function PlannedTodoClient({
  data,
}: {
  data: TaskType[] | undefined;
}) {
  console.log("My tasks in planned", data);

  return (
    <div className="relative max-h-[600px] h-full">
      {/* IF THERE IS EXISTED TASKS */}

      {data ? (
        <Accordion
          className="mx-8 mt-10  max-h-[600px] mb-6 overflow-y-auto overflow-x-hidden max-w-[680px]"
          type="single"
          collapsible
        >
          <AccordionItem value="earlier">
            <AccordionTrigger className="">
              <span>Earlier</span>
            </AccordionTrigger>
            <AccordionContent>
              {/* if the due date is before today */}
              <ul className={"flex flex-col gap-5"}>
                {data ? (
                  data
                    ?.slice()
                    .sort(
                      (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                    )
                    .filter(
                      (task) =>
                        task.duedate &&
                        new Date(task?.duedate).getTime() < new Date().getTime()
                    )
                    .map((task, i) => <TaskItem task={task} key={task.id} />)
                ) : (
                  <p className="text-start text-black text-sm">Task is Empty</p>
                )}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="today">
            <AccordionTrigger>
              <span>Today</span>
            </AccordionTrigger>

            <AccordionContent>
              <ul className={"flex flex-col gap-5"}>
                {data
                  ?.slice()
                  .sort(
                    (a, b) =>
                      new Date(a.createdAt).getTime() -
                      new Date(b.createdAt).getTime()
                  )
                  .filter((task) => task.duedate && isTodayTask(task.duedate))
                  .map((task, i) => (
                    <TaskItem task={task} key={task.id} />
                  ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="Tommorrow">
            <AccordionTrigger>
              <span>Tommorrow</span>
            </AccordionTrigger>

            <AccordionContent>
              <ul className={"flex flex-col gap-5"}>
                {data
                  ?.slice()
                  .sort(
                    (a, b) =>
                      new Date(a.createdAt).getTime() -
                      new Date(b.createdAt).getTime()
                  )
                  .filter(
                    (task) =>
                      task.duedate &&
                      new Date(task.duedate).getTime() > new Date().getTime()
                  )
                  .map((task, i) => (
                    <TaskItem task={task} key={task.id} />
                  ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <div className="text-center my-auto   h-[500px] mx-auto mt-[20px] w-auto px-4">
          <div className="flex flex-col gap-6 items-center">
            <Image
              src={"/note.png"}
              height={400}
              width={170}
              alt="Note png"
              quality={100}
            />

            <div className="space-y-3">
              <h3 className="font-semibold text-2xl">Your day task is empty</h3>
              <p className="text-sm">
                Get things done by adding a new task to your day
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING MODAL BUTTON */}
      <AddNewTaskBtn />
    </div>
  );
}
