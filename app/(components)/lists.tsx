"use client";

import { useQuery } from "@tanstack/react-query";
import { LayoutList } from "lucide-react";
import React from "react";
import { getLists } from "../actions/lists";
import Link from "next/link";

export default function Lists() {
  const { data, error, isSuccess } = useQuery({
    queryKey: ["lists"],
    queryFn: async () => await getLists(),
  });
  return (
    <ul className="mt-2 space-y-6">
      {error && <li>Error: {error.message}</li>}

      {data?.map((list) => (
        <Link className="w-full" href={`/lists/${list.name}`} key={list.id}>
          <li className="w-full hover:bg-orange-50 duration-150 ease-in-out transition-colors my-1 cursor-pointer px-3 py-2 flex place-items-center gap-2">
            <LayoutList size={18} />
            <span className="text-md">{list.name}</span>
          </li>
        </Link>
      ))}
    </ul>
  );
}
