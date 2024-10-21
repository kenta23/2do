"use client";

import { TaskOrCollabTask } from "@/types";
import dayjs from "dayjs";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";
import { ContextProvider, ContextValueType } from "./ContextProvider";

export const ContextTaskDue = createContext<string | null>(null); //for highlighting the tasks overdue
export const ContextRemindmeDue = createContext<string | null>(null); //for highlighting the tasks overdue

export default function TodoNotifyContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const tasks = useContext(ContextProvider);
  const [dueContext, setDueContext] = useState<string[]>();
  const [remindmeContext, setStoreRemindMe] = useState<string[]>();

  const tasksMemoized = useMemo(() => tasks?.tasks || [], [tasks?.tasks]);

  useEffect(() => {
    if (!tasks?.tasks) return;
    const now = dayjs();
    // Function to check and notify overdue tasks
    const checkOverdueTasks = () => {
      tasksMemoized.forEach((task) => {
        const taskDueDate = dayjs(task.duedate);
        if (taskDueDate.isBefore(now)) {
          toast.error(`Task "${task.content}" is overdue!`);
        }
      });

      console.log("checkOverdueTasks rendered");
    };

    //check the remind date
    const checkRemindDate = () => {
      tasksMemoized.forEach((task) => {
        const tastkRemindMe = dayjs(task.remind_me);
        if (tastkRemindMe.isBefore(now)) {
          toast.success(`Your task ${task.content} is due today!`);
        }
      });

      console.log("checkRemindDate rendered");
    };

    checkOverdueTasks();
    checkRemindDate();

    // Set up an interval to keep checking every minute
    const interval = setInterval(() => {
      checkOverdueTasks();
      checkRemindDate();
    }, 60000); // 1 minute

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [tasks?.tasks, tasksMemoized]);

  return (
    <ContextTaskDue.Provider value={null}>
      <ContextRemindmeDue.Provider value={null}>
        {children}
      </ContextRemindmeDue.Provider>
    </ContextTaskDue.Provider>
  );
}
