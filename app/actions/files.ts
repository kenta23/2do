"use server";

import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function storeFiles(taskId: string, fileUrl: string) {
  const user = await auth();

  // Find user by id
  const userFromDb = await prisma.user.findFirst({
    select: { id: true }, // Ensure you're fetching the `id` (which is the actual primary key)
    where: { id: user?.user?.id }, // Assuming `userId` is the identifier
  });

  if (!userFromDb) {
    throw new Error("User not found, cannot create task");
  }

  let data;

  //find task id whether from task or collab task
  if (
    await prisma.task.findFirst({
      where: { id: taskId, userId: userFromDb.id },
    })
  ) {
    data = await prisma.task.update({
      where: { id: taskId, userId: userFromDb.id },
      data: {
        files: {
          push: fileUrl.toString(),
        },
      },
    });
  }

  if (
    await prisma.collabTasks.findFirst({
      where: { id: taskId, userId: userFromDb.id },
    })
  ) {
    data = await prisma.collabTasks.update({
      where: { id: taskId, userId: userFromDb.id },
      data: {
        files: {
          push: fileUrl.toString(),
        },
      },
    });
  }

  console.log("FILE STORED TO THE DATABASE");
  return data;
}
