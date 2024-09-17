"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { PrismaClient } from "@prisma/client";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addListSchema, listFormData } from "@/lib/schema";
import { addList } from "../actions/lists";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";

export default function AddNewList() {
  const supabase = createClient();
  const auth = supabase.auth.getUser();

  const {
    data,
    error: mutationError,
    isSuccess,
    isPending,
    mutate,
    reset: resetMutationStatus,
  } = useMutation({
    mutationFn: async (data: listFormData) => await addList(data),
  });
  const queryClient = new QueryClient();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm<listFormData>({
    resolver: zodResolver(addListSchema),
    defaultValues: { list: "" },
  });

  console.log("data errors", errors);

  const submitData: SubmitHandler<listFormData> = async (
    data: listFormData
  ) => {
    const validatedData = addListSchema.safeParse(data);

    if (!validatedData.success) {
      reset();
      return;
    }
    console.log("validated data", validatedData.data);

    mutate(validatedData.data, {
      onSuccess: () => {
        console.log("Successfully added new list");
        queryClient.refetchQueries({
          exact: true,
          queryKey: ["lists"],
          type: "active",
        });

        setTimeout(() => {
          reset(); //form reset
          resetMutationStatus(); //mutation status reset
        }, 2000);
      },
      onError: () => {
        console.log("Failed to add new list");
        reset();
        resetMutationStatus();
      },
    });
  };

  // const handleDialogChange = () => {
  //     setOpen
  // }

  return (
    <Dialog>
      <DialogTrigger>
        <div className="w-full mt-2 h-[40px] px-2 cursor-pointer text-[#8B4B1D] flex gap-2 items-center">
          <Plus />
          <p className="text-md">Add new list</p>
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="px-0">Add new list</DialogTitle>

          <DialogDescription className="text-sm font-light ">
            You can add list as many as you can
          </DialogDescription>
        </DialogHeader>

        <div className="w-full">
          {errors.list && (
            <p className="text-red-500 text-sm my-2">{errors.list?.message}</p>
          )}
          {isSuccess && (
            <p className="text-green-500 text-sm my-2">
              Successfully added list
            </p>
          )}
          <form onSubmit={handleSubmit(submitData)} className="flex">
            <Input {...register("list")} placeholder="Enter List name" />

            <DialogFooter>
              <Button
                className="bg-primaryColor hover:bg-orange-300 duration-150 ease-linear transition-colors"
                type="submit"
                disabled={isPending}
              >
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
