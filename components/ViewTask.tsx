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

export default function ViewTask({ taskId }: { taskId: string }) {
  const { data, error, isFetching } = useGetSingleTask(taskId);
  const [storeDueDate, setStoreDueDate] = useState<Dayjs | null>(
    dayjs("2022-04-17T15:30")
  );

  // useEffect(() => {
  //   if (data?.duedate) {
  //     setStoreDueDate(dayjs(data?.duedate));
  //   }
  // }, [data?.duedate]);

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
      content: data?.content,
      duedate: (storeDueDate as unknown as Date) || null,
    },
  });

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Edit Task</SheetTitle>
        <SheetDescription>
          Make changes to your task here. Click save when youre done.
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 py-4 mb-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="task" className="text-right">
            Task
          </Label>
          <Input id="task" value={data?.content} className="col-span-3" />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          {/**DUE DATE */}
          <Label htmlFor="duedate" className="text-right">
            Duedate
          </Label>

          <DateTimePicker
            label="Due"
            className="h-10 col-span-3"
            value={storeDueDate}
            onChange={(newValue) => {
              setStoreDueDate(newValue);
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

      <SheetFooter>
        <SheetClose asChild>
          <Button type="submit">Save changes</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  );
}
