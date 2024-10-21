"use client";

import React, { useEffect, useRef, useState } from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, z } from "zod";
import dayjs, { Dayjs } from "dayjs";
import { Paperclip, X } from "lucide-react";
import { Button } from "./ui/button";
import { editTask, getSingleTask } from "@/app/actions/data";
import { usePathname } from "next/navigation";
import { editFormData, editSchemawithID } from "@/lib/schema";
import { TaskOrCollabTask, TaskType } from "@/types";
import AddcollabUsers from "./AddcollabUsers";
import { useDebounce } from "use-debounce";
import { useFetchUserIds } from "@/lib/queries";

export default function EditTaskPopover({
  taskId,
  querykey,
}: {
  taskId: string;
  querykey: string;
}) {
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

  //users searching
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listFiles, setListFiles] = useState<File[] | null>([]);
  const [storeDueDate, setStoreDueDate] = useState<Date | Dayjs | null>(null);
  const pathName = usePathname();
  const [status, setStatus] = useState<boolean>(false);

  const [text, setText] = useState<string>("");
  const [debouncedText] = useDebounce(text, 1000);
  const [userIds, setUserIds] = useState<
    { id: string; image: string | null; name: string | null }[]
  >([]);
  // const [displayUser, setDisplayUser] = useState<boolean>(false);
  // const containerUsers = useRef<HTMLDivElement>(null);

  // //real time user suggestion searching
  const { data: users, error: usersError } = useFetchUserIds(debouncedText);

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
    error: editError,
    mutate,
    isPending,
    isSuccess,
    reset: mutateReset,
    variables,
  } = useMutation({
    mutationKey: ["editTodo"],
    mutationFn: async (data: z.infer<typeof editSchemawithID>) =>
      await editTask(data, pathName),
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: [querykey] }); // Cancel ongoing todos refetch

      //snapshot the previouse items for rolling back incase of mutation error
      const previousTodos = queryClient.getQueryData([querykey]); // Get current todos

      const previousSingleTask = queryClient.getQueryData([
        "singleTask",
        newTodo.id,
      ]);

      // Optimistically update the "todos" and "singleTask" cache
      if (Array.isArray(previousTodos)) {
        queryClient.setQueryData(
          [querykey],
          (oldTodos: TaskOrCollabTask[] = []) => {
            return oldTodos?.map((todo) =>
              todo.id === newTodo.id ? { ...todo, ...newTodo } : todo
            );
          }
        );
        queryClient.setQueryData(
          ["singleTask", newTodo.id], // Match the "singleTask" query with the newTodo.id
          (oldTask: TaskOrCollabTask | undefined) =>
            oldTask ? { ...oldTask, ...newTodo } : newTodo // Update the single task optimistically
        );
      }

      return { previousTodos, previousSingleTask }; // Return the previous state in case we need to roll back
    },
    // If the mutation fails, use the context we returned above
    onError: (err, newTodo, context) => {
      queryClient.setQueryData([querykey], context?.previousTodos); // Rollback on error
      queryClient.setQueryData(
        ["singleTask", newTodo.id],
        context?.previousSingleTask
      );
    },
    onSettled: async (newTodo) => {
      queryClient.invalidateQueries({
        queryKey: [querykey],
      });
      queryClient.invalidateQueries({
        queryKey: ["singleTask", taskId], // Refetch the single task with the specific ID
      });
    },
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

          setTimeout(() => {
            mutateReset();
            reset();
          }, 2000);
        },
        onError: (error) => {
          console.log("Error updating data", error);
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
      {isSuccess && <p className="text-green-500">Successfully Edited task</p>}
      {editError && (
        <li style={{ color: "red" }}>
          <span>Error </span>
          <button onClick={() => mutate(variables)}>Retry</button>
        </li>
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
            <p className="text-sm">{file?.name}</p>
            <X
              size={18}
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
      {pathName === "/collaborations" && (
        <AddcollabUsers
          users={users}
          userIds={userIds}
          setUserIds={setUserIds}
          text={text}
          setText={setText}
          debouncedText={debouncedText}
        />
      )}
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
