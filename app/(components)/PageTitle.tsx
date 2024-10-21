"use client";

import dateNow from "@/lib/date";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function PageTitle({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [title, setTitle] = useState("");

  useEffect(() => {
    // Update the title based on the pathname
    switch (pathname) {
      case "/todo":
        setTitle("My day");
        break;

      case "/important":
        setTitle("Important");
        break;

      case "/collaborations":
        setTitle("Collaborations");
        break;

      case "/planned":
        setTitle("Planned");
        break;

      default:
        setTitle("");
        break;
    }
  }, [pathname]); // Re-run when pathname changes

  return (
    <div className={`h-full max-h-screen overflow-y-auto`}>
      <div className="bg-backgroundColor relative w-full overflow-x-hidden min-h-screen h-full py-8 px-4">
        <header
          className={`mx-8  ${
            pathname.includes("/lists") ? "hidden" : "block"
          } `}
        >
          <h2 className="text-2xl font-medium">{title}</h2>
          <p>{dateNow()}</p>
        </header>
        {children}
      </div>
    </div>
  );
}
