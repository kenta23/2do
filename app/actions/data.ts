"use server";

import { PrismaClient } from "@prisma/client/edge";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import dayjs from "dayjs";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextRequest, NextResponse } from "next/server";
import { editFormData, FormData } from "@/lib/schema";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient().$extends(withAccelerate());

const supabase = createClient();

export async function createMyTask(
  data: FormData,
  pathname: string,
  users:
    | {
        name: string;
        id: string;
        userId: string;
        email: string | null;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
      }[]
    | undefined
) {
  const user = await supabase.auth.getUser();
  console.log("MY PATHNAME", pathname);

  // Find user by id
  const userFromDb = await prisma.user.findFirst({
    select: { id: true }, // Ensure you're fetching the `id` (which is the actual primary key)
    where: { userId: user.data.user?.id }, // Assuming `userId` is the identifier
  });

  if (!userFromDb) {
    throw new Error("User not found, cannot create task");
  }
  const duedate = data.duedate;
  const remindme = data.remindme;
  let newData;

  if (pathname === "/todo") {
    newData = await prisma.task.create({
      data: {
        content: data.content,
        userId: userFromDb.id,
        completed: false,
        important: false,
        duedate: duedate !== null || undefined ? dayjs(duedate).toDate() : null,
        remind_me:
          remindme !== null || undefined ? dayjs(remindme).toDate() : null,
      },
    });

    console.log("NEW TASK SAVED", newData);
    revalidatePath("/todo");
  }
  if (pathname === "/collaborations") {
    //add the user id if the invited user accepted the task
    //const userIds = users?.map((user) => user.id);

    const newCollabTasks = await prisma.collabTasks.create({
      data: {
        content: data.content,
        userId: userFromDb.id,
        completed: false,
        duedate: duedate !== null || undefined ? dayjs(duedate).toDate() : null,
        remind_me:
          remindme !== null || undefined ? dayjs(remindme).toDate() : null,
        important: false,
      },
    });

    console.log("USERS", users);

    if (newCollabTasks) {
      if (users && users.length > 0) {
        await prisma.pendingTask.create({
          data: {
            status: "PENDING",
            taskId: newCollabTasks.id,
            userId: userFromDb.id,
          },
        });
      }
    }

    console.log("NEW TASK SAVED", newCollabTasks);
    revalidatePath("/collaborations");
  }
  return;
}

export async function getTask(pathname: string) {
  const user = await supabase.auth.getUser();

  console.log("my pathname in server", pathname);

  // Check if user is authenticated
  if (!user.data.user) {
    throw new Error("User not authenticated");
  }

  try {
    // Retrieve tasks for the authenticated user from Prisma
    const userFromDb = await prisma.user.findFirst({
      select: { id: true }, // Ensure you're fetching the `id` (which is the actual primary key)
      where: { userId: user.data.user?.id }, // Assuming `userId` is the identifier
    });

    const data = await prisma.task.findMany({
      where: {
        userId: userFromDb?.id, // Filter by userId, not id
      },
    });
    return data;
  } catch (error) {
    console.log(error);
  }
}

export async function editTask(data: editFormData, pathname: string) {
  const user = await supabase.auth.getUser();

  // Check if user is authenticated
  if (!user.data.user) {
    throw new Error("User not authenticated");
  }

  console.log("rendered from server");

  try {
    const newData = await prisma.task.update({
      where: { id: data.id },
      data: {
        content: data.content,
        duedate:
          data.duedate !== null || undefined
            ? dayjs(data.duedate).toDate()
            : null,
      },
    });

    revalidatePath("/planned");
    return newData;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function getSingleTask(taskId: string) {
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    throw new Error("User not authenticated");
  }

  try {
    const data = await prisma.task.findFirst({
      where: { id: taskId as string },
    });
    return data;
  } catch (error) {
    console.log(error);
    return;
  }
}

//fetch important tasks
export async function fetchImportantTasks() {
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    throw new Error("User not authenticated");
  }

  try {
    const data = await prisma.task.findMany({
      where: { important: true },
    });

    return data;
  } catch (error) {
    console.log(error);
  }
}

//delete single task
export async function deleteSingleTask(taskId: string) {
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    throw new Error("User not authenticated");
  }

  try {
    const data = await prisma.task.delete({
      where: { id: taskId as string },
    });

    console.log("DELETED DATA");
    revalidatePath("/planned");

    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function fetchPlannedTodos() {
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    throw new Error("User not authenticated");
  }

  try {
    const data = await prisma.task.findMany({
      where: { userId: user.data.user.id },
    });

    revalidatePath("/planned");

    return data;
  } catch (error) {
    console.log(error);
  }
}

export async function fetchYourTasksTodos() {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error("User not authenticated");
  }

  try {
    //find user by id
    const userFromDb = await prisma.user.findFirst({
      select: { id: true }, // Ensure you're fetching the `id` (which is the actual primary key)
      where: { userId: user.data.user?.id }, // Assuming `userId` is the identifier
    });

    const yourTasks = await prisma.collabTasks.findMany({
      where: {
        userId: userFromDb?.id,
      },
    });

    // Extract all unique user IDs from the joinedUsers arrays
    const joinedUserIds = [...yourTasks.flatMap((task) => task.joinedUsers)];

    // Fetch users whose IDs are in the `joinedUserIds` array
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: joinedUserIds,
        },
      },
      select: { id: true, name: true, avatar: true },
    });

    return { yourTasks, users };
  } catch (error) {
    console.log(error);
  }
}

export async function fetchAssignedTasks() {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error("User not authenticated");
  }

  try {
    //find user by id
    const userFromDb = await prisma.user.findFirst({
      select: { id: true }, // Ensure you're fetching the `id` (which is the actual primary key)
      where: { userId: user.data.user?.id }, // Assuming `userId` is the identifier
    });

    if (!userFromDb) {
      throw new Error("User not found");
    }

    const acceptedTasks = await prisma.collabTasks.findMany({
      where: {
        joinedUsers: {
          has: user.data.user?.id,
        },
      },
    });

    return acceptedTasks;
  } catch (error) {
    console.log(error);
  }
}

export async function suggestedUsers(letter: string) {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error("User not authenticated");
  }

  if (!letter) {
    return [];
  }

  try {
    const data = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: letter, mode: "insensitive" } }, // Case-insensitive search
          { name: { contains: letter, mode: "insensitive" } },
        ],
      },
    });

    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
}
