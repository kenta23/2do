"use client";

import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useGetSingleTask } from "@/lib/queries";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useForm } from "react-hook-form";
import { editFormData, editSchemawithID } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function ViewTask({ taskId }: { taskId: string }) {
  const { data, error, isFetching, refetch } = useGetSingleTask(taskId);
  const [storeDueDate, setStoreDueDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    refetch();
    console.log("REFETCH");
  }, [data?.data?.id, refetch]);

  const {
    handleSubmit: submit,
    formState: { errors },
  } = useForm<editFormData>({
    resolver: zodResolver(editSchemawithID),
    defaultValues: {
      id: taskId,
      content: data?.data?.content,
      duedate: (storeDueDate as unknown as Date) || null,
    },
  });

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>View Task</SheetTitle>
      </SheetHeader>

      <div className="flex flex-col items-start gap-4 py-4 mb-4">
        <div className={itemStyles}>
          <Label htmlFor="task" className="text-right">
            Task
          </Label>
          <p className="text-md text-orange-950">{data?.data?.content}</p>
        </div>

        <div className={itemStyles}>
          {/**DUE DATE */}
          <Label htmlFor="duedate" className="text-right">
            Duedate
          </Label>
          <p className="text-md text-orange-950 ">
            {data?.data?.duedate
              ? dayjs(data?.data?.duedate).format("MM/DD/YYYY")
              : "No due date"}
          </p>
        </div>

        <div className={itemStyles}>
          {/**REMIND ME */}
          <Label htmlFor="duedate" className="text-right">
            Remind me
          </Label>
          <p className="text-md text-orange-950 ">
            {data?.data?.remind_me
              ? dayjs(data?.data?.remind_me).format("MM/DD/YYYY")
              : "No Remind me date"}
          </p>
        </div>

        <div className={"flex flex-col w-full gap-2 items-start"}>
          <Label>Files</Label>

          <div className="grid grid-cols-3 gap-2">
            {data?.data?.files.map((fileUrl, _i) => {
              const fileExtension = fileUrl.split(".").pop()?.toLowerCase();
              const isImage = ["jpg", "jpeg", "png", "gif"].includes(
                fileExtension || ""
              );

              return (
                <div key={_i} className="gap-2 ">
                  {isImage ? (
                    <Image
                      loading="lazy"
                      className="border-[1px] border-gray-200 p-1"
                      src={fileUrl}
                      width={200}
                      height={400}
                      alt="Photo"
                    />
                  ) : (
                    <div className="flex cursor-pointer flex-col gap-2 items-center">
                      <Link href={fileUrl} target="_blank">
                        <Image
                          className="border-[1px] border-gray-200 p-1"
                          width={200}
                          height={400}
                          alt="Photo"
                          src={"/document-icon.png"}
                          loading="lazy"
                        />
                        <p className="text-[10px] text-start text-orange-950 ">
                          {
                            (fileUrl?.split("/")?.pop()?.substring(0, 15) +
                              "...") as string
                          }
                        </p>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={"flex mt-3 flex-col items-start gap-4"}>
            <Label htmlFor="task" className="text-right">
              Users
            </Label>

            {data?.users && data?.users.length > 0 ? (
              data.users.map((user) => (
                <div key={user.id} className="flex items-start gap-2">
                  <Image
                    src={user.image as string}
                    alt="collaborative user avatar"
                    width={30}
                    height={100}
                    className="rounded-full"
                  />
                  <p className="text-md text-orange-950">{user.name}</p>
                </div>
              ))
            ) : (
              <p className="text-md text-orange-950">No collaborative users</p>
            )}
          </div>
        </div>
      </div>
    </SheetContent>
  );
}

const itemStyles = "flex items-center gap-4";
