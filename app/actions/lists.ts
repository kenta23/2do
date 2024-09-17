"use server";

import { PrismaClient } from "@prisma/client/edge";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
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

const prisma = new PrismaClient().$extends(withAccelerate());
const supabase = createClient();

export async function addList(data: listFormData) {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error("User not authenticated");
  }
  const newHeaders = headers();
  const referer = new URL(newHeaders.get("referer") || "").pathname;

  console.log("header", referer);

  const newlist = await prisma.list.create({
    data: {
      name: data.list,
      userId: user.data.user.id,
    },
  });

  console.log("NEW LIST SAVED", newlist);
  revalidatePath(referer, "layout");

  return newlist;
}

export async function getLists() {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error("User not authenticated");
  }

  const data = await prisma.list.findMany({
    where: {
      userId: user.data.user.id,
    },
    include: {
      collabTasks: true,
      tasks: true,
    },
  });

  return data;
}
