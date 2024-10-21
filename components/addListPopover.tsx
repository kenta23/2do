/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { addOrDetachListFromTask, IsInList } from "@/app/actions/lists";
import { useFindListQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { singleList } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

export default function AddListPopover({
  lists,
  setOpen,
  alreadyInList,
  taskID,
}: {
  lists: singleList[] | undefined;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  alreadyInList: (string | null)[] | undefined;
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

      queryClient.refetchQueries({
        queryKey: ["taskOnList"],
        exact: true,
      });

      queryClient.refetchQueries({
        queryKey: ["collabTaskOnList"],
        exact: true,
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

  console.log(alreadyInList);

  return (
    <div className="w-full max-w-[470px] h-auto">
      <div>
        <ul className="flex flex-col w-full items-start gap-2">
          {lists?.length
            ? lists.map((list) => {
                const isTaskInList = alreadyInList?.includes(list.id);

                return (
                  <li
                    onClick={() => handleChangeAddList(list.id)}
                    key={list.id}
                    className={cn(
                      "flex cursor-pointer w-full rounded-lg p-1 hover:bg-gray-100 items-start gap-2",
                      {
                        "text-primaryColor": isTaskInList,
                      }
                    )}
                  >
                    <p>{list.name}</p>
                  </li>
                );
              })
            : null}
        </ul>
      </div>
    </div>
  );
}
