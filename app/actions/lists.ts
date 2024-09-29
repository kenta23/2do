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

export async function getSingleList(decodedListName: string) {
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
        collabTasks: {
          where: {
            lists: {
              some: {
                name: decodedListName,
              },
            },
          },
          include: {
            owner: true,
            pendingTasks: true,
          },
        },
        tasks: true,
        //follow other tasks type
      },
    });

    //from other user tasks
    const acceptedTasks = await prisma.collabTasks.findMany({
      where: {
        joinedUsers: {
          has: session.user.id,
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

    return { data, users, acceptedTasks };
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

  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    //find the list with the exact task
    const list = await prisma.list.findFirst({
      where: {
        id: listID,
        tasks: {
          some: {
            id: taskId,
          },
        },
      },
    });

    let data;

    //if the list exist already
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

    return data;
  } catch (error) {
    console.log(error);
  }

  throw new Error("error");
}
