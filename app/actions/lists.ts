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
        collabTasks: true,
        tasks: true,
      },
    });

    return data;
  } catch (error) {
    console.log(error);
    return;
  }
}
