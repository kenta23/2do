import React from "react";
import Image from "next/image";
import dateNow from "@/lib/date";
import TodoClient from "./todoClient";

export default function page() {
  return (
    <div className="h-full max-h-screen overflow-y-auto">
      <div className="bg-backgroundColor relative w-full overflow-x-hidden min-h-screen h-full py-8 px-4">
        <header className="mx-8">
          <h2 className="text-2xl font-medium">My Day</h2>
          <p>{dateNow()}</p>
        </header>

        <TodoClient />
      </div>
    </div>
  );
}
