import type { Metadata } from "next";
import Sidebar from "./sidebar";
import Search from "./search";
import { AuthUser } from "@/types";
import AddNewTaskBtn from "@/components/addNewTaskBtn";
import { auth } from "@/auth";
import { Session, User } from "next-auth";
import { headers } from "next/headers";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "2Do",
  description: "Start adding tasks for your productivity.",
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session: Session | null = await auth();
  const header = headers();
  const pathname = new URL(header.get("referer") || "http://localhost")
    .pathname;

  return (
    <div className="w-full h-full max-h-screen">
      <div className="flex h-full min-h-screen max-h-screen">
        <Sidebar />

        <div className="w-full h-full">
          <Search user={session?.user as User} />
          {children}
        </div>
      </div>

      <div
        className={cn(
          "text-center place-self-end items-center ms-[228px] flex justify-center align-bottom sticky bottom-3",
          {
            hidden: pathname.startsWith("/lists"),
          }
        )}
      >
        <AddNewTaskBtn />
      </div>
    </div>
  );
}
