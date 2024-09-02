"use client";

import { getTask } from "@/app/actions/data";
import AddNewTaskBtn from "@/components/addNewTaskBtn";
import TaskList from "@/components/TaskList";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import Image from "next/image";

export default function TodoClient() {
  const { data, error, isSuccess } = useQuery({
    queryKey: ["tasklist"],
    queryFn: async () => await getTask(),
    staleTime: 1000 * 60,
  });

  console.log("data", data);

  return (
    <>
      {/* IF THERE IS EXISTED TASKS */}

      {data ? (
        <TaskList data={data} />
      ) : (
        <div className="text-center mx-auto mt-[75px] w-auto px-4">
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
    </>
  );
}
