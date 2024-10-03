import React from "react";
import { Metadata } from "next";
import dateNow from "@/lib/date";
import TodoClient from "../todo/todoClient";

export const metadata: Metadata = {
  title: "Important Tasks",
  description: "This is the place that you can see your important tasks",
};
export default function page() {
  return (
    <div className="h-full max-h-screen overflow-y-auto">
      <div className="bg-backgroundColor relative w-full overflow-x-hidden min-h-screen h-full py-8 px-4">
        <header className="mx-8">
          <h2 className="text-2xl font-medium">My Day</h2>
          <p>{dateNow()}</p>
        </header>

        <TodoClient queryKey="important" />
      </div>
    </div>
  );
}
