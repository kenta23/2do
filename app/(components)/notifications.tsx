"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from "lucide-react";
import React from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getPendingTasks } from "../actions/data";

export default function Notifications() {
  const { data, error, isSuccess } = useQuery({
    queryKey: ["pendings"],
    queryFn: async () => await getPendingTasks(),
  });

  console.log("TASK PENDINGS", data);

  const formatDistanceToNow = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer">
        <Bell />
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="center"
        className="mr-[20px] z-50 overflow-y-auto w-auto"
      >
        <div className="w-full min-w-[300px] max-w-[370px]  py-2  min-h-[400px] h-[400px] rounded-md space-y-[15px]">
          <p className="font-semibold text-xl px-2">Notifications</p>
          {error && <p>Error: {error.message}</p>}

          {!isSuccess && <p>Loading...</p>}

          {/* FETCH NOTIFICATIONS HERE... */}
          <ul className="flex flex-col items-start gap-2 max-h-[350px] h-auto overflow-y-auto">
            {data && data.length > 0 ? (
              data.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 hover:bg-gray-200 cursor-pointer w-full p-2 rounded-sm"
                >
                  {/* IF THE NOTIFICATION NOT YET READ */}
                  <div className="flex min-w-[50px]">
                    <div className="bg-green-600 rounded-full size-2" />
                    <Image
                      src={item.task.owner.avatar ?? "/Logo.png"}
                      className="rounded-full"
                      width={40}
                      height={100}
                      alt="Profile avatar"
                    />
                  </div>

                  <div className="flex items-start flex-col max-w-auto">
                    <p className="text-sm font-semibold">
                      {item.task.owner.name}
                      <span className="font-normal break-words break-all">
                        Invited you to their tasks{" "}
                        <span className="italic text-yellow-600 font-medium">
                          "{item.task.content}"
                        </span>
                      </span>
                    </p>
                    <p className="text-[12px] font-light">
                      {formatDistanceToNow(new Date(item.task.createdAt))}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <p>No notifications</p>
            )}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
