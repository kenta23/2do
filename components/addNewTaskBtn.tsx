"use client";

import { Bell, CalendarClock, Paperclip, Plus, X } from "lucide-react";
import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Link from "next/link";
import dayjs, { Dayjs } from "dayjs";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMyTask } from "@/app/actions/data";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";

const schema = z.object({
  content: z
    .string({
      message: "Content is required",
      required_error: "Content is required",
      invalid_type_error: "Invalid content",
    })
    .max(100),
  duedate: z
    .date({ invalid_type_error: "Remind me date is invalid" })
    .nullable()
    .optional()
    .refine((value) => (value ? value.getTime() >= dayjs().valueOf() : true), {
      message: "The Due Date should be in today or later",
      path: ["duedate"],
    }),

  remindme: z
    .date({
      invalid_type_error: "Remind me date is invalid",
    })
    .nullable()
    .optional()
    .refine((value) => (value ? value.getTime() >= dayjs().valueOf() : true), {
      message: "The Date should be in today or later",
      path: ["remindme"],
    }),
});

export type FormData = z.infer<typeof schema>;

export default function AddNewTaskBtn() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listFiles, setListFiles] = useState<File[] | null>([]);
  const [clickedDueDate, setClickedDueDate] = useState<boolean>(false);
  const dateTimeref = useRef<HTMLInputElement>(null);
  const [done, setDone] = useState<boolean>(false);
  const [storeDueDate, setStoreDueDate] = useState<Date | null>(null);
  const [storeRemindMe, setStoreRemindMe] = useState<Date | null>(null);
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: "",
      duedate: null,
      remindme: null,
    },
  });
  //api call for post request to server
  const {
    data: taskData,
    error,
    mutate,
    isPending,
    isSuccess,
    reset,
  } = useMutation({
    mutationFn: async (datas: FormData) => createMyTask(datas),
  });

  const onSubmit: SubmitHandler<FormData> = (data: FormData) => {
    console.log("SUBMITTED DATA", data);

    const result = schema.safeParse(data);

    if (!result.success) {
      console.log("Something error!");
      return;
    }

    mutate(result.data, {
      onSuccess: () => {
        console.log("SUCCESSFULLY SAVED DATA");
        queryClient.invalidateQueries({
          queryKey: ["tasklist"],
          stale: true,
        });
      },
      onError: (err) => console.log(err),
    });
  };

  const openFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    console.log("clicked");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const files = e.target.files;
    if (files === null) return;

    const newFiles = Array.from(files);
    setListFiles((prev) => [...(prev ?? []), ...newFiles]);
  };

  return (
    <div className="text-center mx-auto flex justify-center absolute bottom-3 w-full">
      {/* DIALOG BTN */}

      <Popover>
        <PopoverTrigger>
          <div className="w-[550px] flex items-center justify-center rounded-full text-primaryColor bg-orange-100 hover:bg-white transition-all duration-150 ease-linear border-b-primaryColor border-b h-[60px]">
            <div className="flex gap-2">
              <Plus />
              <span className="text-md">Add new Task</span>
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-[500px] min-h-max max-h-min">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex mt-[10px] gap-6 items-start flex-col w-full ">
              <input
                type="text"
                className="border-b w-full border-b-lightColor flex-1 focus:ring-0 focus:outline-none"
                placeholder="Create new Task"
                {...register("content")}
              />

              {/* icons */}
              <div className="flex gap-3 items-center">
                {/* <CalendarClock
                onClick={dueDateFn}
                className={cn("cursor-pointer", {
                  "bg-primaryColor": clickedDueDate,
                })}
              />{" "} */}

                {/**DUE DATE */}
                <DateTimePicker
                  label="Due"
                  className="h-10"
                  value={storeDueDate ? dayjs(storeDueDate) : null}
                  onChange={(newValue) => {
                    setStoreDueDate(newValue ? newValue.toDate() : null);
                    setValue("duedate", newValue ? newValue.toDate() : null);
                  }}
                  sx={(theme) => ({
                    ".MuiDialogActions-root": {
                      backgroundColor: theme.palette.background.paper,
                    },
                    ".MuiButtonBase-root": {
                      color: theme.palette.primary.main,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.light,
                      },
                    },
                  })}
                />
                {/* <Controller
                  name="duedate"
                  control={control}
                  defaultValue={null}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <DateTimePicker
                      label="Due"
                      className="h-10"
                      value={value ? dayjs(value) : null}
                      onChange={(newValue) =>
                        newValue ? newValue.toDate() : null
                      }
                      sx={(theme) => ({
                        ".MuiDialogActions-root": {
                          backgroundColor: theme.palette.background.paper,
                        },
                        ".MuiButtonBase-root": {
                          color: theme.palette.primary.main,
                          "&:hover": {
                            backgroundColor: theme.palette.primary.light,
                          },
                        },
                      })}
                      {...rest}
                    />
                  )}
                /> */}
                <DateTimePicker
                  label={"Remind me"}
                  className="h-10"
                  value={storeRemindMe ? dayjs(storeRemindMe) : null}
                  onChange={(newValue) => {
                    setStoreRemindMe(newValue ? newValue.toDate() : null);
                    setValue("remindme", newValue ? newValue.toDate() : null);
                  }}
                  sx={(theme) => ({
                    ".MuiDialogActions-root": {
                      backgroundColor: theme.palette.background.paper,
                    },
                    ".MuiButtonBase-root": {
                      color: theme.palette.primary.main,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.light,
                      },
                    },
                  })}
                />

                {/**<Bell /> {/**REMINDER TIME */}
              </div>
            </div>

            <div className="mt-8">
              <a
                type="file"
                onClick={openFile}
                className="flex gap-2 cursor-pointer w-fit items-center text-blue-500 hover:underline"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  onChange={handleFileChange}
                />
                <Paperclip size={18} />
                <p className="text-sm">Attach a File</p>
              </a>
            </div>

            {/* FILE UPLOADING LISTED */}
            <div className="mt-4 flex flex-col items-start gap-3">
              {listFiles?.map((file, i) => (
                <div key={i} className="flex items-center gap-2">
                  <p>{file?.name}</p>
                  <X
                    className="cursor-pointer"
                    onClick={() =>
                      setListFiles((prev: any) =>
                        prev?.filter((f: any) => f.name !== file.name)
                      )
                    }
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full cursor-pointer h-[45px] px-4 py-2 text-white bg-primaryColor rounded-md flex items-center justify-center mt-[55px]"
            >
              <span>Save Changes</span>
            </button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
