import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import Image from "next/image";
import { Input } from "./ui/input";

export type users =
  | {
      email: string | null;
      name: string | null;
      id: string;
      emailVerified: Date | null;
      image: string | null;
    }[]
  | undefined;

type userIdsState = {
  id: string;
  image: string | null;
  name: string | null;
}[];

export default function AddcollabUsers({
  users,
  userIds,
  setUserIds,
  text,
  setText,
  debouncedText,
}: {
  users: users;
  userIds: userIdsState;
  setUserIds: React.Dispatch<React.SetStateAction<userIdsState>>;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  debouncedText: string;
}) {
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const [displayUser, setDisplayUser] = useState<boolean>(false);
  const containerUsers = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (users && users.length && text.length) {
      setDisplayUser(true);
    } else {
      setDisplayUser(false);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerUsers.current &&
        !containerUsers.current.contains(event.target as Node) &&
        users &&
        text.length
      ) {
        setDisplayUser(false);
        console.log("clicked outside the container");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    console.log("display user state", displayUser);
    //cleanup function
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, users?.length, containerUsers]);

  return (
    <div>
      {/* IF ITS IN THE COLLABORATION PAGE THEN DISPLAY THIS FORM */}
      {pathname === "/collaborations" && (
        <div className="w-full  mt-4 space-y-3">
          <p className="text-md font-medium">Assigned To</p>

          <div className="relative h-auto" ref={containerUsers}>
            <Input
              placeholder="Enter Username or Email"
              value={text}
              type="text"
              onChange={(e) => {
                setText(e.target.value);

                if (debouncedText) {
                  queryClient.refetchQueries({
                    queryKey: ["usersearch"],
                    exact: true,
                    type: "active",
                  });
                }
              }}
              className="h-[45px] border rounded-lg border-secondaryColor"
              onFocus={() => setDisplayUser(true)}
            />

            {/* SUGGESTED USERS */}
            {users && users.length > 0 && displayUser && (
              <div
                className={`bg-slate-100 ${
                  displayUser ? "block" : "hidden"
                } z-50 shadow-md rounded-md absolute h-auto w-full px-3 py-2`}
              >
                <ul className="flex flex-col space-y-1 items-start w-full">
                  {users &&
                    users.map((user) => (
                      <li
                        onClick={() => {
                          const alreadyIncludedUsers = userIds.find(
                            (item) => item.id === user.id
                          );

                          if (alreadyIncludedUsers) return;

                          const addUser = {
                            id: user.id,
                            image: user.image as string | "/Logo.png",
                            name: user.name,
                          };
                          setUserIds((prevUsers) => [...prevUsers, addUser]);

                          setDisplayUser(false);
                          console.log("display user", displayUser);
                        }}
                        key={user.id}
                        className="flex cursor-pointer w-full h-full mb-1 border-b-[1px] items-center gap-3"
                      >
                        <Image
                          alt="User Avatar"
                          width={50}
                          className="rounded-full"
                          height={100}
                          src={user.image ? user.image : "/Logo.png"}
                        />
                        <span className="text-sm">{user.name}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-3">
            <p className="text-sm">Collaborators</p>

            <ul className="mt-1 pt-2">
              {userIds &&
                userIds.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center gap-3 cursor-pointer w-fit px-2"
                  >
                    <Image
                      alt="User Avatar"
                      width={35}
                      className="rounded-full"
                      height={100}
                      src={user.image ?? "/Logo.png"}
                    />
                    <span className="text-sm">{user.name}</span>

                    <X
                      onClick={() =>
                        setUserIds(userIds.filter((u) => u.id !== user.id))
                      }
                      size={16}
                      className="cursor-pointer ml-2"
                    />
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
