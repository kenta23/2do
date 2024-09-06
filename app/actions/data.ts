"use server";

import { PrismaClient } from "@prisma/client/edge";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import dayjs from "dayjs";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextRequest, NextResponse } from "next/server";
import { editFormData, FormData } from "@/lib/schema";

const prisma = new PrismaClient().$extends(withAccelerate());
const supabase = createClient();

export async function createMyTask(data: FormData, pathname: string) {
  const user = await supabase.auth.getUser();

  console.log("USER", user);
  console.log("DATA", data);
  const duedate = data.duedate;
  const remindme = data.remindme;
  let newData;

  // pathname === '/todo' ? newData = await prisma.task.create({
  //     data: {
  //         content: data.content,
  //         userId: user.data.user?.id as string,
  //         completed: false,
  //         duedate: duedate !== null || undefined ? dayjs(duedate).toDate() : null,
  //         remind_me: remindme !== null || undefined ? dayjs(remindme).toDate() : null,
  //     },
  // })  : await prisma.planned.create({
  //      //continue
  // })

  newData = await prisma.task.create({
    data: {
      content: data.content,
      userId: user.data.user?.id as string,
      completed: false,
      duedate: duedate !== null || undefined ? dayjs(duedate).toDate() : null,
      remind_me:
        remindme !== null || undefined ? dayjs(remindme).toDate() : null,
    },
  });

  console.log("NEW TASK SAVED", newData);

  // Return only serializable data to the client
}

export async function getTask() {
  const user = await supabase.auth.getUser();

  // Check if user is authenticated
  if (!user.data.user) {
    throw new Error("User not authenticated");
  }

  // Retrieve tasks for the authenticated user from Prisma
  const data = await prisma.task.findMany({
    where: {
      userId: user.data.user.id, // Filter by userId, not id
    },
  });

  return data;
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
