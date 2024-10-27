import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const listStyles = `flex gap-3 cursor-pointer hover:bg-secondaryColor 
       rounded-md hover:text-white duration-200 ease-in-out active:bg-secondaryColor w-full p-1 items-center`;
