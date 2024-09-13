import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/todo";

  if (token_hash && type) {
    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // redirect user to specified redirect URL or root of app
      const session = await supabase.auth.getUser();
      const prisma = new PrismaClient().$extends(withAccelerate());

      const userFromDb = await prisma.user.findFirst({
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
          },
        });

        console.log(newUser);
      }
      //else redirect user to specified redirect URL or root of app
      return redirect(next);
    }
  }
  // redirect the user to an error page with some instructions
  return redirect("/error");
}
