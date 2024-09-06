import type { Metadata } from "next";
import Sidebar from "./sidebar";
import Search from "./search";
import { getUser } from "@/utils/supabase/getUser";
import { createClient } from "@/utils/supabase/server";
import { User } from "@/types";

export const metadata: Metadata = {
  title: "2Do",
  description: "Start adding tasks for your productivity.",
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="w-full ">
        <Search user={data.user as User} />
        {children}
      </div>
    </div>
  );
}
