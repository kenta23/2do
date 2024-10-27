import type { Metadata } from "next";
import Sidebar from "./sidebar";
import Search from "./search";
import { AuthUser } from "@/types";
import AddNewTaskBtn from "@/components/addNewTaskBtn";
import { auth } from "@/auth";
import { Session, User } from "next-auth";
import { headers } from "next/headers";
import { cn } from "@/lib/utils";
import { ContextProvider } from "@/providers/ContextProvider";
import dateNow from "@/lib/date";
import PageTitle from "./PageTitle";
import { Bounce, ToastContainer } from "react-toastify";
import TodoNotifyContextProvider from "@/providers/TodoNotifyContextProvider";
// import 'react-toastify/dist/ReactToastify.css';
import "react-toastify/ReactToastify.min.css";

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

  console.log(pathname);

  return (
    <TodoNotifyContextProvider>
      <div className="w-full h-full max-h-screen">
        <div className="flex h-full min-h-screen max-h-screen">
          <Sidebar />

          <div className="w-full h-full">
            <Search user={session?.user as User} />

            <PageTitle>{children}</PageTitle>
          </div>
        </div>

        <div
          className={cn(
            "text-center place-self-center items-center md:ms-[228px] flex justify-center align-bottom sticky bottom-3",
            {
              hidden: pathname.includes("/lists"),
            }
          )}
        >
          <AddNewTaskBtn />
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
          />
        </div>
      </div>
    </TodoNotifyContextProvider>
  );
}
