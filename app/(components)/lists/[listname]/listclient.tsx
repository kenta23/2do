"use client";

import { CollabTasksType, singleList } from "@/types";
import React from "react";
import Image from "next/image";
import TaskList from "@/components/TaskList";
import dateNow from "@/lib/date";
import AssignedTask from "../../collaborations/assignedTask";
import YourTasks from "../../collaborations/yourTasks";
import { basicInfoUser } from "../../collaborations/page";

export default function Listclient({
  list,
  listName,
  users,
  acceptedTasks,
}: {
  list: singleList | null | undefined;
  listName: string;
  users: basicInfoUser;
  acceptedTasks: CollabTasksType[] | undefined;
}) {
  const myCollabTasks = list?.collabTasks?.filter(
    (collabtask) => collabtask.userId === list.userId
  );

  return (
    <div className="w-full flex flex-col sm:flex-row">
      <div className="w-full max-w-[680px] h-full bg-gray-400">
        <header className="mx-8">
          <h2 className="text-2xl font-medium">{list?.name}</h2>
          <p>{dateNow()}</p>
        </header>

        <div className="mx-8 mt-10 max-h-[520px] mb-6 overflow-y-auto max-w-[680px]">
          <div className="relative max-h-[600px] h-full">
            <h2>Tasks</h2>

            {/* IF THERE IS EXISTED TASKS */}
            {list?.tasks?.length ? (
              <TaskList data={list.tasks} />
            ) : (
              <div className="text-center my-auto h-[500px] mx-auto mt-[20px] w-auto px-4">
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
            )}
          </div>
        </div>
      </div>

      {/* FOR COLLABTASKS  */}

      <div>
        <h2 className="text-2xl font-medium">Collaborations</h2>

        <div className="h-full min-h-screen max-h-screen overflow-y-auto">
          <div className="bg-backgroundColor relative w-full h-full min-h-screen overflow-x-hidden max-h-auto overflow-y-hidden py-8 px-4">
            <header className="mx-8">
              <h2 className="text-2xl font-medium">Your Tasks</h2>
              <p>{dateNow()}</p>
            </header>

            {!list?.collabTasks?.length && !list?.collabTasks ? (
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
              <div className="h-full w-full max-w-[700px] min-w-auto min-h-full">
                {/* YOUR OWNED TASKS HERE */}

                <YourTasks tasks={list?.collabTasks} users={users} />

                <header className="mx-8 mt-10">
                  <h2 className="text-2xl font-medium">Assigned Tasks</h2>
                  <p>{dateNow()}</p>
                </header>

                {/* TASKS ASSIGNED TO YOU */}
                <AssignedTask tasks={acceptedTasks} users={users} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
