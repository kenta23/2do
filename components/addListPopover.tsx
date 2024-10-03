"use client";

import { addOrDetachListFromTask, IsInList } from "@/app/actions/lists";
import { cn } from "@/lib/utils";
import { singleList } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

export default function AddListPopover({
  lists,
  setOpen,
  taskID,
}: {
  lists: singleList[] | undefined;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  taskID: string;
}) {
  const pathname = usePathname();
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

      queryClient.invalidateQueries({
        queryKey: ["isInList"],
        exact: true,
        type: "active",
      });
    },
  });

  const { data: isinlist } = useQuery({
    queryFn: async () => await IsInList(taskID, pathname),
    queryKey: ["isInList", taskID],
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
    <div className="w-full max-w-[470px] h-auto">
      <div>
        <ul className="flex flex-col w-full items-start gap-2">
          {lists?.length
            ? lists.map((list) => (
                <li
                  onClick={() => handleChangeAddList(list.id)}
                  key={list.id}
                  className={cn(
                    "flex cursor-pointer w-full rounded-lg p-1 hover:bg-gray-100 items-start gap-2",
                    {
                      "bg-slate-500": isinlist?.id,
                    }
                  )}
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
