import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/todo";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      //check if user already existed on database
      const session = await supabase.auth.getUser();
      const prisma = new PrismaClient().$extends(withAccelerate());

      const userFromDb = await prisma.user.findFirst({
        select: { email: true },
        where: { email: session.data.user?.email },
      });

      if (!userFromDb?.email) {
        const data = await prisma.user.create({
          data: {
            name: session.data.user?.user_metadata.full_name as string,
            userId: session.data.user?.id as string,
            email: session.data.user?.email as string,
            avatar: session.data.user?.user_metadata.avatar_url as string,
          },
        });

        console.log("NEW USER DETECTED!", data);
      }

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
