"use server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { auth } from "@/auth";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function markAsImportant(id: string, pathname: string) {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    if (pathname == "/collaborations") {
      const currentTask = await prisma.collabTasks.findUnique({
        where: {
          id,
          userId: session.user.id,
        },
        select: {
          important: true, // Only fetch the 'important' field
        },
      });

      const data = await prisma.collabTasks.update({
        where: {
          id,
          userId: session.user.id,
        },
        data: {
          important: !currentTask?.important,
        },
      });

      console.log("updated important task");
      return data;
    }

    if (pathname === "/todo") {
      const currentTask = await prisma.task.findUnique({
        where: {
          id,
          userId: session.user.id,
        },
        select: {
          important: true, // Only fetch the 'important' field
        },
      });

      const data = await prisma.task.update({
        where: {
          id,
          userId: session.user.id,
        },
        data: {
          important: !currentTask?.important,
        },
      });

      console.log("updated important task");

      return data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function isTaskImportant(id: string, pathname: string) {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    let data;
    if (pathname === "/collaborations") {
      data = await prisma.collabTasks.findFirst({
        where: {
          id,
        },
        select: {
          id: true,
          important: true,
        },
      });
    } else {
      data = await prisma.task.findFirst({
        where: {
          id,
        },
        select: {
          id: true,
          important: true,
        },
      });
    }
    return data;
  } catch (error) {
    console.log(error);
  }
}
