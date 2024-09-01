import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();

  return data ? redirect("/todo") : redirect("/sign-in");
}
