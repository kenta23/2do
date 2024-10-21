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
  });

  return data;
}

export async function checkIsInListQuery(taskId: string) {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  //fetch all lists
  const data = await prisma.list.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      collabTasks: true,
      tasks: true,
    },
  });

  //

  const alreadyInList = await Promise.all(
    data.map(async (list) => {
      const foundList = await prisma.list.findFirst({
        where: {
          id: list.id,
          userId: session?.user?.id,
          OR: [
            {
              tasks: {
                some: {
                  id: taskId,
                },
              },
            },
            {
              collabTasks: {
                some: {
                  id: taskId,
                },
              },
            },
          ],
        },
        select: { id: true },
      });

      return foundList?.id || null; // Return the id if found, otherwise null
    })
  );

  const filteredList = alreadyInList.filter(Boolean);

  return { data, alreadyInList: filteredList };
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
            list: {
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
    // Find the list associated with the user
    // const list = await prisma.list.findFirst({
    //   where: {
    //     id: listID,
    //     userId: session.user.id,
    //   },
    // });

    // Check if the task exists for the user
    const collabTask = await prisma.collabTasks.findFirst({
      where: {
        userId: session.user.id,
        id: taskId,
      },
      include: {
        list: true, // Include the lists related to the task
      },
    });

    const todoTask = await prisma.task.findFirst({
      where: {
        userId: session.user.id,
        id: taskId,
      },
      include: {
        list: true, // Include the lists related to the task
      },
    });

    if (!collabTask && !todoTask) {
      throw new Error("Task not found");
    }

    const isListInTask = (task: typeof collabTask | typeof todoTask) =>
      task?.list.some((l) => l.id === listID);

    let data;
    let result;

    // Prepare data for update based on the existence of the list
    if (collabTask?.id) {
      const action = isListInTask(collabTask) ? "disconnect" : "connect";
      data = {
        list: {
          [action]: {
            id: listID,
          },
        },
      };
      result = await prisma.collabTasks.update({
        where: {
          id: taskId,
          userId: session.user.id,
        },
        data,
      });
    }

    if (todoTask?.id) {
      const action = isListInTask(todoTask) ? "disconnect" : "connect";

      data = {
        list: {
          [action]: {
            id: listID,
          },
        },
      };

      result = await prisma.task.update({
        where: {
          id: taskId,
          userId: session.user.id,
        },
        data,
      });
    }

    return result; // Optionally return some result
  } catch (error) {
    console.log(error);
  }

  throw new Error("error");
}

export async function IsInList(listId: string, taskId: string) {
  const session = await auth();
  // const formattedPathname = decodeURIComponent(pathname.split("/").pop() || "");

  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    const data = await prisma.list.findFirst({
      where: {
        id: listId,
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

    return data?.id;
  } catch (error) {
    console.log(error);
  }
}
