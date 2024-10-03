"use client";

import { CollabTasksType, singleList } from "@/types";
import React from "react";
import Image from "next/image";
import TaskList from "@/components/TaskList";
import dateNow from "@/lib/date";
import { basicInfoUser } from "../../collaborations/page";
import Collabtasksonlist from "./collabTaskItemOnList";
import { useQuery } from "@tanstack/react-query";
import { getCollabtaskOnList, getTaskOnList } from "@/app/actions/lists";

export default function Listclient({ params }: { params: string }) {
  const { data: tasks } = useQuery({
    queryKey: ["taskOnList"],
    queryFn: async () => await getTaskOnList(params),
  });
  const { data: collabTasks } = useQuery({
    queryKey: ["collabTaskOnList"],
    queryFn: async () => await getCollabtaskOnList(params),
  });

  return (
    <div className="h-full w-full flex flex-col items-center space-y-6">
      <header className="text-center mx-auto">
        <h2 className="text-2xl font-medium">{params}</h2>
        <p>{dateNow()}</p>
      </header>

      {!tasks && !collabTasks ? (
        <div className="text-center flex my-auto full mx-auto mt-[20px] w-auto px-4 h-[350px] items-center">
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
      ) : (
        <div className="w-full px-4 flex flex-col sm:flex-row gap-[25px]">
          <div className="w-full h-full border-r-[1px] border-r-[#C0741A]">
            <h2 className="font-medium text-xl ml-8">Day Tasks</h2>

            <div className="h-full w-full max-w-[500px] max-h-[600px] min-w-auto min-h-full">
              {/* IF THERE IS EXISTED TASKS */}
              {tasks?.tasks ? (
                <TaskList
                  data={tasks.tasks}
                  users={null}
                  querykey="taskOnList"
                />
              ) : (
                <p>Loading</p>
              )}
            </div>
          </div>

          {/* FOR COLLABTASKS  */}
          <div className="w-full h-full">
            <header className="ml-8">
              <h2 className="text-xl font-medium">Collaborations</h2>
            </header>

            <div className="h-full w-full  max-w-[500px] min-w-auto min-h-full">
              {/* YOUR COLLAB TASKS HERE */}
              <Collabtasksonlist
                tasks={collabTasks?.data?.collabTasks}
                users={collabTasks?.users}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
