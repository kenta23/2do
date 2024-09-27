import { auth } from "@/auth";

export default async function Home() {
  const user = await auth();

  console.log("user", user);
  return <h1>Hello world</h1>;
  // return data ? redirect("/todo") : redirect("/sign-in");
}
