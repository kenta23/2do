import dateNow from "@/lib/date";
import React from "react";
import Image from "next/image";
import AddNewTaskBtn from "@/components/addNewTaskBtn";

export default function page() {
  return (
    <div className="bg-backgroundColor relative w-full min-h-screen overflow-x-hidden py-8 px-4">
      <header className="mx-8">
        <h2 className="text-2xl font-medium">Planned</h2>
        <p>{dateNow()}</p>
      </header>

      <div className="text-center mx-auto mt-[75px] w-auto px-4">
        <div className="flex flex-col gap-6 items-center">
          <Image
            src={"/note.png"}
            height={400}
            width={170}
            alt="Note png"
            quality={100}
          />

          <div className="space-y-3">
            <h3 className="font-semibold text-2xl">Your Planned Tasks</h3>
            <p className="text-sm">
              Get things done by adding a new task to your day
            </p>
          </div>
        </div>
      </div>

      <AddNewTaskBtn />
    </div>
  );
}
