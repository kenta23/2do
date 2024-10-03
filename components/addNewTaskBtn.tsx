"use client";

import { Bell, CalendarClock, Paperclip, Plus, X } from "lucide-react";
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
import { Input } from "./ui/input";
import Link from "next/link";
import Image from "next/image";
import { useDebounce } from "use-debounce";
import { TaskType } from "@/types";

export default function AddNewTaskBtn() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listFiles, setListFiles] = useState<File[] | null>([]);
  const [done, setDone] = useState<boolean>(false);
  const [storeDueDate, setStoreDueDate] = useState<Date | null>(null);
  const [storeRemindMe, setStoreRemindMe] = useState<Date | null>(null);
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [text, setText] = useState<string>("");
  const [debouncedText] = useDebounce(text, 1000);
  const [userIds, setUserIds] = useState<
    { id: string; image: string | null; name: string | null }[]
  >([]);
  const [displayUser, setDisplayUser] = useState<boolean>(false);
  const containerUsers = useRef<HTMLDivElement>(null);

  //real time user suggestion searching
  const {
    data: users,
    isLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["usersearch"],
    queryFn: async () => await suggestedUsers(debouncedText),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (users && users.length && text.length) {
      setDisplayUser(true);
    } else {
      setDisplayUser(false);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerUsers.current &&
        !containerUsers.current.contains(event.target as Node) &&
        users &&
        text.length
      ) {
        setDisplayUser(false);
        console.log("clicked outside the container");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    console.log("display user state", displayUser);
    //cleanup function
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, users?.length, containerUsers]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    getValues,
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
    data: taskData,
    error,
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

  const onSubmit: SubmitHandler<FormData> = (data: FormData) => {
    console.log("SUBMITTED DATA", data);

    const result = Taskschema.safeParse(data);

    if (!result.success) {
      console.log("Something error!");

      return;
    }
    mutate(result.data, {
      onSuccess: () => {
        console.log("SUCCESSFULLY SAVED DATA");
        resetValues();
        setUserIds([]);

        setTimeout(() => {
          reset(); //mutation reset.
        }, 2000);
      },
      onError: (err) => console.log(err),
    });
  };

  console.log("invited users", userIds);

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
    <div className="">
      {/* DIALOG BTN */}

      <Popover>
        <PopoverTrigger>
          <div className="w-[550px] flex items-center justify-center rounded-full bg-primaryColor text-white hover:bg-orange-300 transition-all duration-150 ease-linear  h-[60px]">
            <div className="flex gap-2">
              <Plus />
              <span className="text-md">Add new Task</span>
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-[500px] min-h-max max-h-min">
          {isSuccess && (
            <p className="text-green-500">Successfully created task</p>
          )}
          {error && <p className="text-red-500">Error creating task</p>}
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
            {pathname === "/collaborations" && (
              <div className="w-full  mt-4 space-y-3">
                <p className="text-md font-medium">Assigned To</p>

                <div className="relative h-auto" ref={containerUsers}>
                  <Input
                    placeholder="Enter Username or Email"
                    value={text}
                    type="text"
                    onChange={(e) => {
                      setText(e.target.value);

                      if (debouncedText) {
                        queryClient.refetchQueries({
                          queryKey: ["usersearch"],
                          exact: true,
                          type: "active",
                        });
                      }
                    }}
                    className="h-[45px] border rounded-lg border-secondaryColor"
                    onFocus={() => setDisplayUser(true)}
                  />

                  {/* SUGGESTED USERS */}
                  {users && users.length > 0 && displayUser && (
                    <div
                      className={`bg-slate-100 ${
                        displayUser ? "block" : "hidden"
                      } z-50 shadow-md rounded-md absolute h-auto w-full px-3 py-2`}
                    >
                      <ul className="flex flex-col space-y-1 items-start w-full">
                        {users &&
                          users.map((user) => (
                            <li
                              onClick={() => {
                                const alreadyIncludedUsers = userIds.find(
                                  (item) => item.id === user.id
                                );

                                if (alreadyIncludedUsers) return;

                                const addUser = {
                                  id: user.id,
                                  image: user.image as string | "/Logo.png",
                                  name: user.name,
                                };
                                setUserIds((prevUsers) => [
                                  ...prevUsers,
                                  addUser,
                                ]);

                                setDisplayUser(false);
                                console.log("display user", displayUser);
                              }}
                              key={user.id}
                              className="flex cursor-pointer w-full h-full mb-1 border-b-[1px] items-center gap-3"
                            >
                              <Image
                                alt="User Avatar"
                                width={50}
                                className="rounded-full"
                                height={100}
                                src={user.image ? user.image : "/Logo.png"}
                              />
                              <span className="text-sm">{user.name}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <p className="text-sm">Collaborators</p>

                  <ul className="mt-1 pt-2">
                    {userIds &&
                      userIds.map((user) => (
                        <li
                          key={user.id}
                          className="flex items-center gap-3 cursor-pointer w-fit px-2"
                        >
                          <Image
                            alt="User Avatar"
                            width={35}
                            className="rounded-full"
                            height={100}
                            src={user.image ?? "/Logo.png"}
                          />
                          <span className="text-sm">{user.name}</span>

                          <X
                            onClick={() =>
                              setUserIds(
                                userIds.filter((u) => u.id !== user.id)
                              )
                            }
                            size={16}
                            className="cursor-pointer ml-2"
                          />
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}

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
