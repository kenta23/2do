import React from "react";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="text-center my-auto h-full mx-auto mt-[20px] w-auto px-4">
      <div className="flex flex-col gap-6 items-center">
        <Image
          src={"/note.png"}
          height={400}
          width={170}
          alt="Note png"
          quality={100}
        />

        <div className="space-y-3">
          <h3 className="font-semibold text-2xl">Your day task is empty</h3>
          <p className="text-sm">
            Get things done by adding a new task to your day
          </p>
        </div>
      </div>
    </div>
  );
}
