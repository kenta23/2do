"use client";

import React, { useEffect, useRef, useState } from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, z } from "zod";
import dayjs, { Dayjs } from "dayjs";
import { Paperclip, X } from "lucide-react";
import { Button } from "./ui/button";
import { editTask, getSingleTask } from "@/app/actions/data";
import { usePathname } from "next/navigation";
import { editFormData, editSchemawithID } from "@/lib/schema";

export default function EditTaskPopover({ taskId }: { taskId: string }) {
  const { data: taskValue } = useQuery({
    queryKey: ["singleTask", taskId],
    queryFn: () => getSingleTask(taskId),
  });
  const dueDate = dayjs(taskValue?.duedate);

  const {
    register,
    handleSubmit: submit,
    formState: { errors },
    reset,
    getValues,
    watch,
    setValue,
  } = useForm<editFormData>({
    resolver: zodResolver(editSchemawithID),
    defaultValues: {
      id: taskId,
      content: taskValue?.content,
      duedate: new Date(dueDate.format("MM/DD/YYYY hh:mm aa")) || new Date(),
    },
  });

  const queryClient = new QueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listFiles, setListFiles] = useState<File[] | null>([]);
  const [storeDueDate, setStoreDueDate] = useState<Date | Dayjs | null>(null);
  const pathName = usePathname();
  const [status, setStatus] = useState<boolean>(false);

  useEffect(() => {
    let timeoutId: number | NodeJS.Timeout;

    if (status) {
      timeoutId = setTimeout(() => {
        setStatus(false);
      }, 1000);
    }

    return () => clearTimeout(timeoutId);
  }, [status]);

  useEffect(() => {
    if (taskValue) {
      reset({ content: taskValue?.content, duedate: taskValue.duedate });
    }

    if (taskValue?.duedate) {
      setStoreDueDate(dayjs(taskValue.duedate));
    }

    if (taskValue?.id) {
      setValue("id", taskValue?.id);
    }
  }, [taskId, reset, taskValue, setValue]);

  //api call for post request to server
  const {
    data,
    error,
    mutate,
    isPending,
    isSuccess,
    reset: mutateReset,
  } = useMutation({
    mutationFn: async (data: z.infer<typeof editSchemawithID>) =>
      await editTask(data, pathName),
  });

  console.log("ERRORS", errors);
  console.log("MY task id", watch("id"));

  const submitData: SubmitHandler<editFormData> = (data: editFormData) => {
    console.log("clicked submit"); // This should log when submit is clicked
    console.log(data); // Log form data to verify what's being captured

    const validatedData = editSchemawithID.safeParse(data);

    if (!validatedData.success) {
      console.log("Something error");
      setStatus(true);

      return validatedData.error;
    }

    try {
      mutate(validatedData.data, {
        onSuccess: () => {
          console.log("SUCCESSFULLY SAVED DATA", data);
          queryClient.invalidateQueries({
            queryKey: ["tasklist"],
            exact: true,
            type: "active",
          });
          reset();
        },
        onError: () => {
          console.log("Error updating data");
        },
      });
    } catch (error) {
      console.log(error);
    }
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
    <form className="h-full w-full" onSubmit={submit(submitData)}>
      {isSuccess && (
        <p className="text-green-500 text-sm">Successfully Edited Task</p>
      )}
      <div className="flex h-full mt-[10px] gap-3 items-start flex-col w-full ">
        <input
          type="text"
          className="border-b w-full border-b-lightColor flex-1 focus:ring-0 focus:outline-none"
          placeholder="Edit Task"
          defaultValue={taskValue?.content ?? ""}
          {...register("content")}
        />
        {errors.content && (
          <p className="text-red-500 text-sm">{errors.content.message}</p>
        )}

        {/* icons */}
        <div className="flex flex-col  w-full gap-3 space-y-3 items-start">
          {/**DUE DATE */}
          <DateTimePicker
            label="Due"
            className="h-10 w-full"
            {...register("duedate")}
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
          {errors.duedate && (
            <p className="text-red-500 text-sm mt-2">
              {errors.duedate.message}
            </p>
          )}
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

      <Button
        type="submit"
        disabled={isPending}
        className="w-full cursor-pointer h-[45px] px-4 py-2 text-white  rounded-md flex items-center justify-center mt-[55px]"
      >
        <span>Save Changes</span>
      </Button>
    </form>
  );
}
