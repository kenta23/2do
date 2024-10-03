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
  return (
    <div className="h-full min-h-screen max-h-screen overflow-y-auto">
      <div className="bg-backgroundColor relative w-full h-full min-h-screen overflow-x-hidden max-h-auto overflow-y-hidden py-8 px-4">
        <header className="mx-8">
          <h2 className="text-2xl font-medium">Your Tasks</h2>
          <p>{dateNow()}</p>
        </header>

        <CollabTaskClient />
      </div>
    </div>
  );
}
