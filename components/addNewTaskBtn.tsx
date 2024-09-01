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
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

export default function AddNewTaskBtn() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listFiles, setListFiles] = useState<File[] | null>([]);
  const [clickedDueDate, setClickedDueDate] = useState<boolean>(false);
  const dateTimeref = useRef<HTMLInputElement>(null);

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

  function dueDateFn(e: any) {
    e.preventDefault();
    setClickedDueDate((prev) => !prev);

    if (dateTimeref.current) {
      dateTimeref.current.click();
    }
  }

  return (
    <div className="text-center mx-auto flex justify-center absolute bottom-3 w-full">
      {/* DIALOG BTN */}

      <Popover>
        <PopoverTrigger>
          <div className="w-[550px] flex items-center justify-center rounded-full text-white bg-primaryColor h-[60px]">
            <div className="flex gap-2">
              <Plus />
              <span className="text-md">Add new Task</span>
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-[500px] min-h-max max-h-min">
          <div className="flex mt-[10px] gap-6 items-start flex-col w-full ">
            <input
              type="text"
              className="border-b w-full border-b-lightColor flex-1 focus:ring-0 focus:outline-none"
              placeholder="Create new Task"
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
                defaultValue={dayjs()}
                label={"Due"}
                className="h-10"
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
                defaultValue={dayjs()}
                label={"Remind me"}
                className="h-10"
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

          <div className="w-full cursor-pointer h-[45px] px-4 py-2 text-primaryColor border-primaryColor border rounded-full flex items-center justify-center mt-[70px]">
            <span>Save Changes</span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
