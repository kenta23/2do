import dateNow from "@/lib/date";
import React from "react";
import Image from "next/image";
import AddNewTaskBtn from "@/components/addNewTaskBtn";
import TodoClient from "../todo/todoClient";
import { fetchPlannedTodos } from "@/app/actions/data";
import { TaskType } from "@/types";
import PlannedTodoClient from "./plannedTodoClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planned Tasks",
};

export default async function page() {
  const data = await fetchPlannedTodos();

  return (
    <div className="bg-backgroundColor relative w-full min-h-screen overflow-x-hidden py-8 px-4">
      <header className="mx-8">
        <h2 className="text-2xl font-medium">Planned</h2>
        <p>{dateNow()}</p>
      </header>

      <PlannedTodoClient data={data} />
    </div>
  );
}
