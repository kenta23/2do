"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from "lucide-react";
import React, {
  ReactElement,
  ReactHTMLElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { getPendingTasks, viewedNotifications } from "../actions/data";

import NotificationItem from "./notificationItem";
import { cn } from "@/lib/utils";

export default function Notifications() {
  const { data, error, isSuccess } = useQuery({
    queryKey: ["pendings"],
    queryFn: async () => await getPendingTasks(),
  });
  const { mutate, data: mutationData } = useMutation({
    mutationFn: (id: string) => viewedNotifications(id),
  });
  const queryClient = new QueryClient();

  const [taskIds, setTaskIds] = useState<string[]>([]);

  const handleTaskInView = (id: string) => {
    if (!taskIds.includes(id)) {
      setTaskIds((prevIds) => [...prevIds, id]); // Add task ID if not already present

      if (taskIds) {
        taskIds.map((taskId: string) => {
          mutate(taskId, {
            onSuccess: () => {
              console.log("successfully changed state notification");
              queryClient.invalidateQueries({
                exact: true,
                queryKey: ["pendings"],
                type: "active",
              });
            },
            onError: () => console.log("something went wrong"),
          });
        });
      }
    }
  };

  // console.log(taskIds);

  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer">
        <div className="relative ">
          {data?.countViewedTasks && data.countViewedTasks > 0 ? (
            <div className="flex bg-red-500 rounded-full p-1 items-center justify-center size-5 absolute bottom-2 left-[-15px]">
              <span className="text-white textm-sm">
                {data.countViewedTasks}
              </span>
            </div>
          ) : (
            ""
          )}
          <Bell />
        </div>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="center"
        className="mr-[20px] z-50 overflow-y-auto w-auto"
      >
        <div className="w-full min-w-[300px] max-w-[370px]  py-2  min-h-[400px] h-[400px] rounded-md space-y-[15px]">
          <p className="font-semibold text-xl px-2">Notifications</p>
          {error && <p>Error: {error.message}</p>}

          {/* FETCH NOTIFICATIONS HERE... */}
          <ul className="flex flex-col items-start gap-2 max-h-[350px] h-auto overflow-y-auto">
            {data?.pendingTasks && data.pendingTasks.length > 0 ? (
              data.pendingTasks.map((item) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  onTaskInView={handleTaskInView}
                  countUnreadNotification={data.countViewedTasks}
                />
              ))
            ) : !isSuccess ? (
              <p>Loading...</p>
            ) : (
              <p>No notifications</p>
            )}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
