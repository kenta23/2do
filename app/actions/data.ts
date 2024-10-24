"use server";

import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import dayjs from "dayjs";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextRequest, NextResponse } from "next/server";
import { editFormData, FormData } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { QueryClient, UseMutateFunction } from "@tanstack/react-query";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function createMyTask(
  data: FormData,
  pathname: string,
  users:
    | {
        name: string | null;
        id: string;
        email: string | null;
        emailVerified: Date | null;
        image: string | null;
      }[]
    | undefined
) {
  const user = await auth();

  // Find user by id
  const userFromDb = await prisma.user.findFirst({
    select: { id: true }, // Ensure you're fetching the `id` (which is the actual primary key)
    where: { id: user?.user?.id }, // Assuming `userId` is the identifier
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
    // revalidatePath("/todo");
  }

  console.log("NEW TASK SAVED", newData);

  if (pathname === "/collaborations") {
    //add the user id if the invited user accepted the task
    //const userIds = users?.map((user) => user.id);
    const userIds = users?.map((user) => user.id);

    const foundUsers = await prisma.user.findMany({
      //find invited user first in the database
      where: { id: { in: userIds } },
    });

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

    if (newCollabTasks) {
      if (users && users.length > 0) {
        const userIds = users.map((user) => user.id);

        const foundUsers = await prisma.user.findMany({
          //find invited user first in the database
          where: { id: { in: userIds } },
        });

        if (foundUsers && foundUsers.length > 0) {
          //if there are users found
          //each user create a pending task
          const pendingTasks = foundUsers.map((user) =>
            prisma.pendingTask.create({
              data: {
                status: "PENDING",
                taskId: newCollabTasks.id,
                userId: user.id, // Use user's ID here
              },
            })
          );
          // Wait for all pending tasks to be created
          await Promise.all(pendingTasks);
        }
      }
    }
    console.log("NEW TASK SAVED", newCollabTasks);
    return newCollabTasks;
  }
  return newData;
}

export async function getTask(pathname: string) {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    // Retrieve tasks for the authenticated user from Prisma
    const userFromDb = await prisma.user.findFirst({
      select: { id: true }, // Ensure you're fetching the `id` (which is the actual primary key)
      where: { id: session.user.id }, // Assuming `userId` is the identifier
    });

    let data;

    if (pathname === "/collaborations") {
      data = await prisma.collabTasks.findMany({
        where: {
          userId: userFromDb?.id, // Filter by userId, not id
        },
      });
    } else {
      if (pathname === "/important") {
        const collabTasks = await prisma.collabTasks.findMany({
          where: {
            userId: userFromDb?.id, // Filter by userId, not id
            important: true,
          },
        });
        data = await prisma.task.findMany({
          where: {
            userId: userFromDb?.id, // Filter by userId, not id
            important: true,
          },
        });

        data = data.concat(collabTasks);
      } else {
        data = await prisma.task.findMany({
          where: {
            userId: userFromDb?.id, // Filter by userId, not id
          },
        });
      }
    }

    return data;
  } catch (error) {
    console.log(error);
  }
}

export async function editTask(data: editFormData, pathname: string) {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    let newData;

    if (pathname === "/collaborations") {
      newData = await prisma.collabTasks.update({
        where: {
          id: data.id,
          userId: session.user.id,
        },
        data: {
          content: data.content,
          duedate:
            data.duedate !== null || undefined
              ? dayjs(data.duedate).toDate()
              : null,
        },
      });
    } else {
      newData = await prisma.task.update({
        where: {
          id: data.id,
          userId: session.user.id,
        },
        data: {
          content: data.content,
          duedate:
            data.duedate !== null || undefined
              ? dayjs(data.duedate).toDate()
              : null,
        },
      });
    }

    return newData;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function getSingleTask(taskId: string) {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    const newHeaders = await headers();
    const pathname = new URL(newHeaders.get("referer") || "").pathname;

    console.log("MY PATHNAME", pathname);

    let data;

    if (pathname === "/collaborations") {
      data = await prisma.collabTasks.findFirst({
        where: { id: taskId as string, userId: session.user.id },
        cacheStrategy: {
          ttl: 30,
          swr: 60,
        },
      });
    } else {
      data = await prisma.task.findFirst({
        where: { id: taskId as string, userId: session.user.id },
        cacheStrategy: {
          ttl: 30,
          swr: 60,
        },
      });
    }

    return data;
  } catch (error) {
    console.log(error);
    return;
  }
}

//fetch important tasks
export async function fetchImportantTasks() {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("User not authenticated");
  }
  try {
    const data = await prisma.task.findMany({
      where: { important: true, userId: session.user.id },
      cacheStrategy: {
        ttl: 60,
        swr: 60,
      },
    });

    return data;
  } catch (error) {
    console.log(error);
  }
}

//delete single task
export async function deleteSingleTask(taskId: string, pathname: string) {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    let data;
    console.log("my pathname", pathname);

    if (pathname === "/collaborations") {
      data = await prisma.collabTasks.delete({
        where: { id: taskId as string, userId: session.user.id },
      });
      console.log("DELETED collab task");
    }
    if (pathname.includes("/lists")) {
      //find the task id whether from the tasks or collab tasks
      const taskFound =
        (await prisma.task.findFirst({
          where: { id: taskId as string, userId: session.user.id },
        })) ||
        (await prisma.collabTasks.findFirst({
          where: { id: taskId as string, userId: session.user.id },
        }));

      if (taskFound) {
        if (
          await prisma.task.findFirst({
            where: { id: taskFound.id, userId: session.user.id },
          })
        ) {
          data = await prisma.task.delete({
            where: { id: taskFound.id },
          });
        } else if (
          await prisma.collabTasks.findFirst({
            where: { id: taskFound.id, userId: session.user.id },
          })
        ) {
          // Delete from 'collabTasks' table if found there
          data = await prisma.collabTasks.delete({
            where: { id: taskFound.id },
          });
        }
      }
    } else {
      data = await prisma.task.delete({
        where: { id: taskId as string, userId: session.user.id },
      });

      console.log("DELETED todo task");
      // revalidatePath("/planned");
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function fetchPlannedTodos() {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    const data = await prisma.task.findMany({
      where: { userId: session.user.id },
    });

    // revalidatePath("/planned");

    return data;
  } catch (error) {
    console.log(error);
  }
}

export async function fetchYourTasksTodos() {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    //find user by id
    const userFromDb = await prisma.user.findFirst({
      select: { id: true }, // Ensure you're fetching the `id` (which is the actual primary key)
      where: { id: session.user.id }, // Assuming `userId` is the identifier
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
      select: { id: true, name: true, image: true },
    });

    return { yourTasks, users };
  } catch (error) {
    console.log(error);
  }
}

export async function fetchAssignedTasks() {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  try {
    //find user by id
    const userFromDb = await prisma.user.findFirst({
      select: { id: true }, // Ensure you're fetching the `id` (which is the actual primary key)
      where: { id: session.user.id }, // Assuming `userId` is the identifier
    });

    if (!userFromDb) {
      throw new Error("User not found");
    }

    const acceptedTasks = await prisma.collabTasks.findMany({
      where: {
        joinedUsers: {
          has: session.user.id,
        },
      },
    });

    // Extract all unique user IDs from the joinedUsers arrays
    const joinedUserIds = [
      ...acceptedTasks.flatMap((task) => task.joinedUsers),
    ];

    // Fetch users whose IDs are in the `joinedUserIds` array
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: joinedUserIds,
        },
      },
      select: { id: true, name: true, image: true },
    });

    return { acceptedTasks, users };
  } catch (error) {
    console.log(error);
  }
}

export async function suggestedUsers(letter: string) {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
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
        AND: [{ id: { not: session.user.id } }],
      },
    });

    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getPendingTasks() {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  //find user by id
  const userFromDb = await prisma.user.findFirst({
    select: { id: true }, // Ensure you're fetching the `id` (which is the actual primary key)
    where: { id: session.user.id }, // Assuming `userId` is the identifier
  });

  const pendingTasks = await prisma.pendingTask.findMany({
    where: {
      userId: userFromDb?.id,
      status: "PENDING",
    },

    include: {
      collabTasks: {
        include: {
          owner: true,
        },
      },
    },
  });

  const countViewedTasks = await prisma.pendingTask.count({
    where: {
      userId: userFromDb?.id,
      status: "PENDING",
      viewed: false,
    },
  });

  console.log(pendingTasks);

  return { pendingTasks, countViewedTasks };
}

export async function viewedNotifications(id: string) {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  //find user by id
  const userFromDb = await prisma.user.findFirst({
    select: { id: true }, // Ensure you're fetching the `id` (which is the actual primary key)
    where: { id: session.user.id }, // Assuming `userId` is the identifier
  });

  try {
    const findTaskInPendingtask = await prisma.pendingTask.findUnique({
      where: { id },
    });

    console.log("pending task id", findTaskInPendingtask);

    const data = await prisma.pendingTask.update({
      //find first the single task id
      where: {
        id: findTaskInPendingtask?.id,
        taskId: findTaskInPendingtask?.taskId,
        userId: userFromDb?.id,
      },

      data: {
        viewed: true, //update the status, and add user to the joinedUsers from collaboration task
      },
    });

    return data;
  } catch (error) {
    console.log(error);
    return;
  }
}

export async function acceptedTask(id: string) {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  //find user by id
  const userFromDb = await prisma.user.findFirst({
    select: { id: true }, // Ensure you're fetching the `id` (which is the actual primary key)
    where: { id: session.user.id }, // Assuming `userId` is the identifier
  });

  try {
    const data = await prisma.pendingTask.update({
      //find first the single task id
      where: {
        id,
        userId: userFromDb?.id,
      },

      data: {
        status: "ACCEPTED", //update the status, and add user to the joinedUsers from collaboration task
        collabTasks: {
          update: {
            data: {
              joinedUsers: {
                push: userFromDb?.id,
              },
            },
          },
        },
      },
    });

    return data;
  } catch (error) {
    console.log(error);
  }

  return;
}
