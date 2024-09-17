"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { AuthError } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { error } from "console";

const supabase = createClient();

export async function login(formData: FormData) {
  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// EMAIL SENDING
export async function signInWithEmail(prevState: any, formData: FormData) {
  const validateData = z.object({
    email: z
      .string()
      .max(60, "Email must be between 10 and 60 characters")
      .min(10, "Email must be between 10 and 60 characters")
      .email({ message: "Email must be a valid email" })
      .refine(
        (value) => {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          return emailRegex.test(value);
        },
        { message: "Email must be a valid email" }
      ),
  });

  const result = validateData.safeParse({
    email: formData.get("email"),
  });

  if (!result.success) {
    return {
      message: result.error.flatten().fieldErrors.email,
    };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email: result.data.email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    return {
      message: (error as AuthError).message,
    };
  } else {
    if (cookies().get("email")) {
      cookies().delete("email");
    }

    try {
      cookies().set("email", result.data.email, {
        maxAge: 60 * 5,
      });

      redirect("/verify/otp/");
    } catch (error) {
      console.log("something error", error);
    }
  }
}

export async function VerifyAuth(prevState: any, formData: FormData) {
  const code = formData.get("code");

  const validateCode = z
    .string({ required_error: "Code is required" })
    .max(10)
    .min(2);
  const cookie = cookies();

  if (!cookie.get("email")) {
    return {
      error: "Unauthorized to verify OTP",
    };
  }

  const otpcode = validateCode.safeParse(code);

  if (otpcode.success) {
    const email = cookie.get("email")?.value.toString() as string;

    const { error, data } = await supabase.auth.verifyOtp({
      email,
      token: otpcode.data,
      type: "email",
    });

    //store to the database
    if (!error) {
      // redirect user to specified redirect URL or root of app
      const session = await supabase.auth.getUser();
      const prisma = new PrismaClient().$extends(withAccelerate());

      const userFromDb = await prisma.user.findFirst({
        //get the user from the database
        select: { email: true },
        where: { email: session.data.user?.email },
      });

      if (!userFromDb) {
        //NEW USER
        const newUser = await prisma.user.create({
          data: {
            name: session.data.user?.user_metadata.full_name as
              | string
              | "Unknown",
            userId: session.data.user?.id as string,
            email: session.data.user?.email as string,
            avatar: session.data.user?.user_metadata.avatar_url as string,
          },
        });

        console.log(newUser);
      }
      //else redirect user to specified redirect URL or root of app
      return redirect("/todo");
    } else {
      return {
        error: "Invalid code",
      };
    }
  }
  // redirect the user to an error page with some instructions
  return redirect("/error");
}
