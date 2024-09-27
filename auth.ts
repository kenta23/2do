import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { NextResponse } from "next/server";
import type { Provider } from "next-auth/providers";

const providers: Provider[] = [
  GitHub({
    clientId: process.env.AUTH_GITHUB_ID,
    clientSecret: process.env.AUTH_GITHUB_SECRET,
  }),
  Google({
    clientId: process.env.AUTH_GOOGLE_ID!,
    clientSecret: process.env.AUTH_GOOGLE_SECRET!,
  }),
];

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "credentials");

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/sign-in",
  },
  providers,

  callbacks: {
    authorized({ request, auth }) {
      const pathname = request.nextUrl.pathname;
      const protectedRoutes = [
        "/todo",
        "/collaborations",
        "/planned",
        "/lists",
      ];

      if (
        pathname === "/" ||
        protectedRoutes.some((path) => pathname.startsWith(path))
      ) {
        return !!auth;
      }
      if (auth?.user && pathname === "/sign-in") {
        return NextResponse.rewrite(new URL("/todo", request.nextUrl));
      }
    },
  },
});
