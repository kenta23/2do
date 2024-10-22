"use client";

import { Bell, CalendarClock, Files, Paperclip, Plus, X } from "lucide-react";
import React, { ReactElement, useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMyTask, suggestedUsers } from "@/app/actions/data";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { FormData, Taskschema } from "@/lib/schema";
import { useDebounce } from "use-debounce";
import { TaskType } from "@/types";
import AddcollabUsers from "./AddcollabUsers";
import { useFetchUserIds } from "@/lib/queries";
import { ErrorMessage } from "@hookform/error-message";
import { createClient } from "@supabase/supabase-js";
import { storeFiles } from "@/app/actions/files";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AddNewTaskBtn() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listFiles, setListFiles] = useState<File[] | null>([]);
  const [storeDueDate, setStoreDueDate] = useState<Date | null>(null);
  const [storeRemindMe, setStoreRemindMe] = useState<Date | null>(null);
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [text, setText] = useState<string>("");
  const [debouncedText] = useDebounce(text, 1000);
  const [userIds, setUserIds] = useState<
    { id: string; image: string | null; name: string | null }[]
  >([]);
  // const [displayUser, setDisplayUser] = useState<boolean>(false);
  // const containerUsers = useRef<HTMLDivElement>(null);

  // //real time user suggestion searching
  const { data: users } = useFetchUserIds(debouncedText);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset: resetValues,
  } = useForm<FormData>({
    resolver: zodResolver(Taskschema),
    defaultValues: {
      content: "",
      duedate: null,
      remindme: null,
    },
  });

  //api call for post request to server
  const {
    error,
    data: mutationData,
    mutate,
    isPending,
    isSuccess,
    reset,
  } = useMutation({
    mutationFn: async (datas: FormData) =>
      await createMyTask(datas, pathname, users),
    mutationKey: ["addNewTodo"],
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // if (pathname === "/collaborations") {
      //   await queryClient.cancelQueries({ queryKey: ["yourTasks"] });
      //   await queryClient.cancelQueries({ queryKey: ["assignedTasks"] });
      // }

      //snapshot the prev value
      const previousTodos = queryClient.getQueryData(["todos"]);

      // Optimistically update to the new value
      if (previousTodos) {
        queryClient.setQueryData(["todos"], (old: TaskType[]) => [
          ...old,
          newTodo,
        ]);
      }
      // Return a context object with the snapshotted value
      return { previousTodos };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["todos"], context?.previousTodos);
    },
    onSettled: (newTodo) => {
      queryClient.invalidateQueries({
        queryKey: ["todos"],
      });
    },
  });

  async function uploadFile(taskId = mutationData?.id, file = listFiles) {
    if (file) {
      file.forEach(async (f, i) => {
        const { data, error } = await supabase.storage
          .from("2do files")
          .upload(`${taskId}/${f.name}`, f, {
            upsert: false,
            headers: { "x-goog-acl": "public-read" },
          });

        //save it to the database
        if (!error && data) {
          const { data: filename } = supabase.storage
            .from("2do files")
            .getPublicUrl(`${data.fullPath}`);
          const store = storeFiles(taskId as string, [...filename.publicUrl]);
        }
      });
    }
  }

  const onSubmit: SubmitHandler<FormData> = (data: FormData) => {
    console.log("SUBMITTED DATA", data);

    mutate(data, {
      onSuccess: () => {
        console.log("SUCCESSFULLY SAVED DATA");
        resetValues();
        setUserIds([]);

        setTimeout(() => {
          reset(); //mutation reset.
        }, 2000);

        if (listFiles) {
          uploadFile(mutationData?.id);
        }
      },
      onError: (err) => console.log(err),
    });
  };

  // const onError = (errors: any) => {
  //   console.log("FORM ERRORS:", errors);
  // };

  console.log(errors);

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
    <div className="mx-auto flex items-center justify-center">
      {/* DIALOG BTN */}
      <Popover>
        <PopoverTrigger>
          <div className="w-[300px] text-center  md:w-[550px] flex items-center justify-center rounded-full bg-primaryColor text-white hover:bg-orange-300 transition-all duration-150 ease-linear  h-[60px]">
            <div className="flex gap-2">
              <Plus />
              <span className="text-md">Add new Task</span>
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-[300px] md:w-[500px] min-h-max max-h-min">
          {isSuccess && (
            <p className="text-green-500">Successfully created task</p>
          )}

          {errors.content && (
            <ErrorMessage
              errors={errors}
              name="content"
              render={({ message }) => (
                <p className="text-red-500">{message}</p>
              )}
            />
          )}

          {errors.duedate && (
            <ErrorMessage
              errors={errors.duedate}
              name="duedate"
              render={({ message }) => (
                <p className="text-red-500">{message}</p>
              )}
            />
          )}

          {errors.remindme && (
            <ErrorMessage
              errors={errors.remindme}
              name="remindme"
              render={({ message }) => (
                <p className="text-red-500">{message}</p>
              )}
            />
          )}
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

            {/* IF ITS IN THE COLLABORATION PAGE THEN DISPLAY THIS FORM */}
            <AddcollabUsers
              users={users}
              userIds={userIds}
              setUserIds={setUserIds}
              text={text}
              setText={setText}
              debouncedText={debouncedText}
            />

            <Button
              type="submit"
              disabled={isPending}
              className="w-full cursor-pointer h-[45px] px-4 py-2 text-white  rounded-md flex items-center justify-center mt-[55px]"
            >
              <span>{isPending ? "Saving..." : "Save Changes"}</span>
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
