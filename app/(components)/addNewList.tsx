import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { PrismaClient } from "@prisma/client";

export default function AddNewList() {
  const supabase = createClient();
  const prisma = new PrismaClient();

  async function addList() {
    "use server";

    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error("User not authenticated");
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        <button
          type="button"
          className="w-full mt-2 h-[45px] px-3 cursor-pointer text-[#8B4B1D] flex gap-2 items-center"
        >
          <Plus />
          <p className="text-md">Add new list</p>
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <h4>Add new list</h4>
          <p className="text-sm font-light ">
            You can add list as many as you can
          </p>
        </DialogHeader>

        <form action="" className="flex">
          <Input name="list" placeholder="Enter List name" />
        </form>

        <DialogFooter>
          <Button
            className="bg-primaryColor hover:bg-orange-300 duration-150 ease-linear transition-colors"
            type="submit"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
