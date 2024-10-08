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
                    .filter((task) => {
                      const now = new Date();
                      const startOfToday = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate()
                      );
                      const endOfToday = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate() + 1,
                        0,
                        0,
                        -1
                      ); // 11:59:59 PM today
                      task.duedate &&
                        task.duedate < startOfToday &&
                        task.duedate > endOfToday;
                    })
                    .map((task) => (
                      <TaskItem
                        task={task}
                        key={task.id}
                        users={null}
                        querykey="plannedTodo"
                      />
                    ))
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
                    <TaskItem
                      task={task}
                      key={task.id}
                      users={null}
                      querykey="plannedTodo"
                    />
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
                  .filter((task) => {
                    const now = new Date();
                    const formattedDate = now.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long", // Use 'short' for abbreviated month
                      day: "2-digit",
                      weekday: "long", // To include the day of the week like 'Monday'
                    });

                    const startOfTomorrow = new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate() + 1
                    );
                    const endOfTomorrow = new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate() + 2,
                      0,
                      0,
                      -1
                    ); // 11:59:59 PM tomorrow

                    return task.duedate && task.duedate > now;
                  })
                  .map((task, i) => (
                    <TaskItem
                      task={task}
                      key={task.id}
                      users={null}
                      querykey="plannedTodo"
                    />
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
    </div>
  );
}
