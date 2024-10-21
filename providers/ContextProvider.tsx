import { basicInfoUser } from "@/app/(components)/collaborations/page";
import { TaskOrCollabTask } from "@/types";
import React, { createContext } from "react";

export interface ContextValueType {
  tasks: TaskOrCollabTask[] | undefined;
  queryKey: string;
  pathname: string;
  users?: basicInfoUser | null;
}

export const ContextProvider = createContext<ContextValueType | null>(null);
