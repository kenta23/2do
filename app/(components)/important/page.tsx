import React from "react";
import { Metadata } from "next";
import ImportantTaskClient from "./importantTaskClient";

export const metadata: Metadata = {
  title: "Important Tasks",
  description: "This is the place that you can see your important tasks",
};
export default function page() {
  return <ImportantTaskClient />;
}
