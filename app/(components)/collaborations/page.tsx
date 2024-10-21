import dateNow from "@/lib/date";
import React from "react";
import { Metadata } from "next";
import CollabTaskClient from "./collabTaskClient";

export const metadata: Metadata = {
  title: "Task Collaborations",
  description: "your tasks and assigned tasks",
};

export type basicInfoUser =
  | { id: string; name: string | null; image: string | null }[]
  | undefined;

export default function page() {
  return <CollabTaskClient />;
}
