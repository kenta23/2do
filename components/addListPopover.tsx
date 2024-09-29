"use client";

import { addOrDetachListFromTask } from "@/app/actions/lists";
import { singleList } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import React from "react";
import { TaskOrCollabTask } from "./TaskList";

export default function AddListPopover({
  lists,
  setOpen,
  taskID,
}: {
  lists: singleList[] | undefined;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  taskID: string;
}) {
  const queryClient = useQueryClient();
  const { mutate: mutateList } = useMutation({
    mutationFn: async ({
      taskId,
      listID,
    }: {
      taskId: string;
      listID: string;
    }) => await addOrDetachListFromTask({ taskId, listID }),
    mutationKey: ["listMutation"],
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasklists"],
        exact: true,
        type: "active",
      });
    },
  });
  function handleChangeAddList(id: string) {
    if (!id) {
      console.log("No List Selected");
    }
    try {
      mutateList(
        {
          taskId: taskID,
          listID: id,
        },
        {
          onSuccess: () => console.log("Successful"),
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="w-full max-w-[450px] h-auto">
      <div>
        <ul className="flex flex-col items-start gap-2">
          {lists?.length
            ? lists.map((list) => (
                <li
                  onClick={() => handleChangeAddList(list.id)}
                  key={list.id}
                  className="flex cursor-pointer bg-orange-100 rounded-lg p-2 items-start gap-2"
                >
                  <p>{list.name}</p>
                </li>
              ))
            : null}
        </ul>
      </div>
    </div>
  );
}
