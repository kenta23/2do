import dateNow from "@/lib/date";
import React from "react";
import CollabTaskClient from "./assignedTask";
import YourTasks from "./yourTasks";
import Image from "next/image";
import AssignedTask from "./assignedTask";
import { fetchAssignedTasks, fetchYourTasksTodos } from "@/app/actions/data";

export default async function page() {
  const tasks = await fetchYourTasksTodos();
  const assignedTasks = await fetchAssignedTasks();

  return (
    <div className="bg-backgroundColor relative w-full min-h-screen overflow-x-hidden py-8 px-4">
      <header className="mx-8">
        <h2 className="text-2xl font-medium">Your Tasks</h2>
        <p>{dateNow()}</p>
      </header>

      {!tasks?.yourTasks.length && !assignedTasks?.length ? (
        <>
          <div className="text-center my-auto h-[500px] mx-auto mt-[40px] w-auto px-4">
            <div className="flex flex-col gap-6 items-center">
              <Image
                src={"/note.png"}
                height={400}
                width={170}
                alt="Note png"
                quality={100}
              />

              <div className="space-y-3">
                <h3 className="font-semibold text-2xl">
                  Your day task is empty
                </h3>
                <p className="text-sm">
                  Get things done by adding a new task to your day
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="h-auto min-h-[500px] space-y-3">
          {/* YOUR OWNED TASKS HERE */}

          <YourTasks tasks={tasks?.yourTasks} users={tasks?.users} />

          <header className="mx-8">
            <h2 className="text-2xl font-medium">Assigned Tasks</h2>
            <p>{dateNow()}</p>
          </header>

          {/* TASKS ASSIGNED TO YOU */}
          <AssignedTask tasks={assignedTasks} users={tasks?.users} />
        </div>
      )}
    </div>
  );
}
