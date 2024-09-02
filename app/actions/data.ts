'use server'

import { FormData } from "@/components/addNewTaskBtn";
import { PrismaClient } from "@prisma/client/edge";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import dayjs from "dayjs";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());
const supabase = createClient();


export async function createMyTask (data: FormData) {
    const user = await supabase.auth.getUser();

    console.log('USER', user);
    console.log('DATA', data);
    const duedate = data.duedate;
    const remindme = data.remindme;


    const newData = await prisma.task.create({
        data: {
            content: data.content,
            userId: user.data.user?.id as string,
            completed: false,
            duedate: duedate !== null || undefined ? dayjs(duedate).toDate() : null,
            remind_me: remindme !== null || undefined ? dayjs(remindme).toDate() : null,
        },
    })

    console.log('NEW TASK SAVED', newData);
}

export async function getTask () {
    const user = await supabase.auth.getUser();

    // Check if user is authenticated
    if (!user.data.user) {
        throw new Error("User not authenticated");
    }

    // Retrieve tasks for the authenticated user from Prisma
    const data = await prisma.task.findMany({
        where: {
            userId: user.data.user.id // Filter by userId, not id
        }
    });

    return data;
}
