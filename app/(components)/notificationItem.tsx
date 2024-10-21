import React, {
  ReactElement,
  ReactHTMLElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { inView, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { PendingTaskType } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptedTask } from "../actions/data";
import { toast } from "react-toastify";
export default function NotificationItem({
  item,
  onTaskInView,
  countUnreadNotification,
}: {
  item: PendingTaskType;
  onTaskInView: () => void;
  countUnreadNotification: number;
}) {
  const itemRef = useRef<HTMLLIElement | null>(null);
  const isInView = useInView(itemRef, {
    once: true,
  });
  const queryClient = useQueryClient();

  const formatDistanceToNow = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  //mutation for accepting the task
  const { mutate, data } = useMutation({
    mutationFn: async (id: string) => acceptedTask(id),
    mutationKey: ["acceptingTask"],
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["pendings"],
      });

      toast("Successfully Accepted Task");
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

  useEffect(() => {
    console.log("Element is in view: ", isInView);
  }, [isInView]);

  useEffect(() => {
    onTaskInView(); // Call the callback to add the task ID
    console.log("Running this side effect");
  }, [isInView, item.id, onTaskInView]);

  console.log("ID", item.id);

  function handleAcceptTask() {
    if (!item.id) {
      return;
    }
    mutate(item.id, {
      onSettled: () => {
        console.log("Accepting the task");
      },
    });
  }

  return (
    <li
      key={item.id}
      ref={itemRef}
      onClick={() => console.log("item id", item.id)}
      className={cn(
        "flex items-center gap-3 hover:bg-gray-200 cursor-pointer w-full p-2 rounded-sm",
        {
          "bg-gray-200": countUnreadNotification > 0 && item.id === item.id,
        }
      )}
    >
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex items-start gap-2">
            <div className="flex min-w-[50px]">
              <div className="bg-green-600 rounded-full size-2" />
              <Image
                src={item.collabTasks.owner.image ?? "/Logo.png"}
                className="rounded-full"
                width={40}
                height={100}
                alt="Profile avatar"
              />
            </div>
            <div className="flex  items-start flex-col max-w-auto">
              <p className="text-sm font-semibold">
                {item.collabTasks.owner.name}
                <span className="font-normal text-wrap break-words break-all">
                  Invited you to their tasks{" "}
                  <span className="italic text-yellow-600 font-medium">
                    {item.collabTasks.content}
                  </span>
                </span>
              </p>
              <p className="text-[12px] font-light">
                {formatDistanceToNow(new Date(item.collabTasks.updatedAt))}
              </p>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Task Invitation</DialogTitle>
          </DialogHeader>
          <div className="w-[85%]">
            Are you sure you want to accept this task?
            <div className="flex gap-2 items-center mt-[8px]">
              <Button
                onClick={handleAcceptTask}
                type="button"
                variant={"destructive"}
              >
                Yes
              </Button>
              <Button type="button" variant={"default"}>
                No
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </li>
  );
}
