import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Metadata } from "next";
import React from "react";
import Listclient from "./listclient";
import dateNow from "@/lib/date";
import { getSingleList } from "@/app/actions/lists";

type paramsType = {
  params: {
    listname: string;
  };
};

export async function generateMetadata({
  params,
}: paramsType): Promise<Metadata> {
  const prisma = new PrismaClient().$extends(withAccelerate());

  if (params.listname) {
    const decodedListName = decodeURIComponent(params.listname as string);
    const data = await prisma.list.findFirst({
      where: {
        name: decodedListName,
      },
    });

    return {
      title: data?.name,
      description: "tasks within this list",
    };
  }

  return {
    title: "no title found",
  };
}

export default async function page({ params }: paramsType) {
  const decodedListName = decodeURIComponent(params.listname as string);

  const data = await getSingleList(decodedListName);

  return (
    <div className="bg-backgroundColor relative w-full overflow-x-hidden min-h-screen h-full py-8 px-4">
      <header className="mx-8">
        <h2 className="text-2xl font-medium">{data?.name}</h2>
        <p>{dateNow()}</p>
      </header>

      <Listclient list={data} />
    </div>
  );
}
