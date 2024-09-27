import { singleList } from "@/types";
import React from "react";

export default function Listclient({ list }: { list: singleList | null | undefined  }) {
  return <div>

      <p>{list?.name}</p>
  </div>;
}
