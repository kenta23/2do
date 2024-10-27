import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await auth();

  console.log("user", user);

  return user ? redirect("/todo") : redirect("/sign-in");
}
