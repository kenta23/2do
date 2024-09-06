import React from "react";
import Image from "next/image";
import {
  Bell,
  EllipsisVertical,
  Pencil,
  Plus,
  Star,
  Trash,
} from "lucide-react";
import AddNewTaskBtn from "@/components/addNewTaskBtn";
import dateNow from "@/lib/date";
import { createClient } from "@/utils/supabase/client";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import TaskList from "@/components/TaskList";
import TodoClient from "./todoClient";

export default function page() {
  return (
    <div className="bg-backgroundColor relative w-full overflow-x-hidden min-h-screen h-full py-8 px-4">
      <header className="mx-8">
        <h2 className="text-2xl font-medium">My Day</h2>
        <p>{dateNow()}</p>
      </header>

      <TodoClient />
    </div>
  );
}
