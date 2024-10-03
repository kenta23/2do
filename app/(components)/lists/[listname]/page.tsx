import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Metadata } from "next";
import React from "react";
import Listclient from "./listclient";
import dateNow from "@/lib/date";


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
  // const data = await getSingleList(decodedListName);

  return (
    <div className="bg-backgroundColor relative w-full overflow-x-hidden min-h-screen h-full py-8 px-4">
      <Listclient params={decodedListName} />
    </div>
  );
}
