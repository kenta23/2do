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

export async function createMyTask(data: FormData, pathname: string) {
  const user = await supabase.auth.getUser();

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

  newData = await prisma.task.create({
    data: {
      content: data.content,
      userId: userFromDb.id,
      completed: false,
      duedate: duedate !== null || undefined ? dayjs(duedate).toDate() : null,
      remind_me:
        remindme !== null || undefined ? dayjs(remindme).toDate() : null,
    },
  });

  console.log("NEW TASK SAVED", newData);
  revalidatePath("/todo");
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
    return yourTasks;
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
