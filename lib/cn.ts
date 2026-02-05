import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (
  ...inputs: (string | undefined | null | false | { [key: string]: boolean })[]
) => {
  return twMerge(clsx(inputs));
};
