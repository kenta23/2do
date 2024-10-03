"use server";

import { PrismaClient } from "@prisma/client/edge";
import { z } from "zod";
import dayjs from "dayjs";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextRequest, NextResponse } from "next/server";
import {
  addListSchema,
  editFormData,
  FormData,
  listFormData,
} from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/auth";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function addList(data: listFormData) {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const newHeaders = headers();
  const referer = new URL(newHeaders.get("referer") || "").pathname;

  console.log("header", referer);

  const newlist = await prisma.list.create({
    data: {
      name: data.list,
      userId: session.user.id as string,
    },
  });

  console.log("NEW LIST SAVED", newlist);
  revalidatePath(referer, "layout");

  return newlist;
}

export async function getLists() {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const data = await prisma.list.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      collabTasks: true,
      tasks: true,
    },
  });

  return data;
}

export async function getTaskOnList(decodedListName: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    const data = await prisma.list.findFirst({
      where: {
        AND: [{ name: decodedListName }, { userId: session.user.id }],
      },
      include: {
        tasks: true,
        //follow other tasks type
      },
    });

    return data;
  } catch (error) {
    console.log(error);
    return;
  }
}
export async function getCollabtaskOnList(params: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    const data = await prisma.list.findFirst({
      where: {
        AND: [{ userId: session.user.id }, { name: params }],
      },
      include: {
        collabTasks: {
          where: {
            lists: {
              some: {
                name: params,
              },
            },
          },
          include: {
            owner: true,
          },
        },
      },
    });

    const joinedUserIds = data?.collabTasks.flatMap(
      (user) => user.joinedUsers || []
    );

    const users = await prisma.user.findMany({
      where: {
        id: { in: joinedUserIds },
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    return { data, users };
  } catch (error) {
    console.log(error);
    return;
  }
}

export async function addOrDetachListFromTask({
  taskId,
  listID,
}: {
  taskId: string;
  listID: string;
}) {
  const session = await auth();
  const headerList = headers();
  const path = new URL(headerList.get("referer") || "").pathname;

  console.log("my current path", path);

  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    //find the list with the exact task
    const list = await prisma.list.findFirst({
      where: {
        id: listID,
        userId: session.user.id,
      },
    });

    let data;
    //if the list exist already
    //DISCONNECT TO LIST
    if (path === "/collaborations") {
      //find the certain list
      if (list?.id) {
        data = await prisma.collabTasks.update({
          where: {
            id: taskId,
            userId: session.user.id,
          },
          data: {
            lists: {
              disconnect: {
                id: listID,
              },
            },
          },
        });
      } else {
        data = await prisma.collabTasks.update({
          where: {
            id: taskId,
            userId: session.user.id,
          },
          data: {
            lists: {
              connect: {
                id: listID,
              },
            },
          },
        });
      }
    } else {
      //list from todo task
      if (list?.id) {
        data = await prisma.task.update({
          where: {
            id: taskId,
            userId: session.user.id,
          },
          data: {
            list: {
              disconnect: {
                id: listID,
              },
            },
          },
        });
      } else {
        data = await prisma.task.update({
          where: {
            id: taskId,
            userId: session.user.id,
          },
          data: {
            list: {
              connect: {
                id: listID,
              },
            },
          },
        });
      }
    }

    return data;
  } catch (error) {
    console.log(error);
  }

  throw new Error("error");
}

export async function IsInList(taskId: string, pathname: string) {
  const session = await auth();
  const formattedPathname = decodeURIComponent(pathname.split("/").pop() || "");
  console.log(formattedPathname);

  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    const data = await prisma.list.findFirst({
      where: {
        name: formattedPathname,
        tasks: {
          some: {
            id: taskId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return data;
  } catch (error) {
    console.log(error);
  }
}
